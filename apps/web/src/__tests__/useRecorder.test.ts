import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useRecorder } from "@/features/voice/hooks/useRecorder"

class MockMediaRecorder {
  static isTypeSupported(): boolean {
    return true
  }

  stream: MediaStream
  mimeType = "audio/webm;codecs=opus"
  state = "inactive"
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>

  private _ondataavailable: ((e: Event) => void) | null = null
  private _onstop: (() => void) | null = null
  private _onerror: (() => void) | null = null

  constructor(stream: MediaStream) {
    this.stream = stream
    this.start = vi.fn(() => {
      this.state = "recording"
    })
    this.stop = vi.fn(() => {
      this.state = "inactive"
      if (this._ondataavailable) {
        this._ondataavailable(
          { data: new Blob(["audio chunk"], { type: "audio/webm" }) } as BlobEvent,
        )
      }
      if (this._onstop) this._onstop()
    })
  }

  get ondataavailable() {
    return this._ondataavailable
  }
  set ondataavailable(fn: ((e: Event) => void) | null) {
    this._ondataavailable = fn
  }
  get onstop() {
    return this._onstop
  }
  set onstop(fn: (() => void) | null) {
    this._onstop = fn
  }
  get onerror() {
    return this._onerror
  }
  set onerror(fn: (() => void) | null) {
    this._onerror = fn
  }
}

function createMockStream() {
  return {
    getTracks: () => [{ stop: vi.fn() }],
  }
}

describe("useRecorder", () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder)

    mockGetUserMedia = vi.fn().mockResolvedValue(createMockStream())
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("detects MediaRecorder support", () => {
    const { result } = renderHook(() => useRecorder())
    expect(result.current.isSupported).toBe(true)
  })

  it("starts with default state", () => {
    const { result } = renderHook(() => useRecorder())
    expect(result.current.isRecording).toBe(false)
    expect(result.current.audioBlob).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("startRecording requests mic and starts MediaRecorder", async () => {
    const { result } = renderHook(() => useRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(result.current.isRecording).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it("stopRecording stops MediaRecorder and produces audio blob", async () => {
    const { result } = renderHook(() => useRecorder())

    await act(async () => {
      await result.current.startRecording()
    })
    expect(result.current.isRecording).toBe(true)

    act(() => {
      result.current.stopRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.audioBlob).toBeInstanceOf(Blob)
  })

  it("reset() clears audioBlob and error", async () => {
    const { result } = renderHook(() => useRecorder())

    await act(async () => {
      await result.current.startRecording()
    })
    act(() => {
      result.current.stopRecording()
    })
    expect(result.current.audioBlob).not.toBeNull()

    act(() => {
      result.current.reset()
    })

    expect(result.current.audioBlob).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it("sets error when microphone access fails", async () => {
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"))

    const { result } = renderHook(() => useRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.error).toContain("Permission denied")
  })

  it("marks isSupported false when MediaRecorder is absent", () => {
    vi.unstubAllGlobals()

    const { result } = renderHook(() => useRecorder())
    expect(result.current.isSupported).toBe(false)
  })
})
