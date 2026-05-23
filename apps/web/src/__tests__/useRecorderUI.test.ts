import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"
import { getApiClient } from "@/services/apiClient"

vi.mock("@/services/apiClient", () => ({
  getApiClient: vi.fn(),
}))

describe("useRecorderUI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("starts with one assistant greeting and isRecording false", () => {
    const { result } = renderHook(() => useRecorderUI())
    expect(result.current.isRecording).toBe(false)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].role).toBe("assistant")
    expect(result.current.history[0].text).toBe("Hi — I'm ready when you are.")
  })

  it("start() sets isRecording to true", () => {
    const { result } = renderHook(() => useRecorderUI())
    act(() => result.current.start())
    expect(result.current.isRecording).toBe(true)
  })

  it("stop() sets isRecording to false", () => {
    const { result } = renderHook(() => useRecorderUI())
    act(() => result.current.start())
    act(() => result.current.stop())
    expect(result.current.isRecording).toBe(false)
  })

  it("clear() resets history to empty and stops recording", () => {
    const { result } = renderHook(() => useRecorderUI())
    act(() => result.current.start())
    act(() => result.current.clear())
    expect(result.current.isRecording).toBe(false)
    expect(result.current.history).toHaveLength(0)
  })

  it("sendTurn() adds user turn then assistant response on success", async () => {
    const mockPostVoiceTurn = vi.fn().mockResolvedValue({
      assistant_text: "Hello from the API!",
      session_id: "session-abc",
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      postVoiceTurn: mockPostVoiceTurn,
    })

    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length

    act(() => {
      result.current.sendTurn("Test message")
    })

    expect(result.current.history).toHaveLength(initialLen + 1)
    expect(result.current.history.at(-1)?.role).toBe("user")
    expect(result.current.history.at(-1)?.text).toBe("Test message")

    await waitFor(() => {
      expect(result.current.history).toHaveLength(initialLen + 2)
    })
    expect(result.current.history.at(-1)?.role).toBe("assistant")
    expect(result.current.history.at(-1)?.text).toBe("Hello from the API!")
  })

  it("sendTurn() shows error message on API failure", async () => {
    const mockPostVoiceTurn = vi
      .fn()
      .mockRejectedValue(new Error("Network error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      postVoiceTurn: mockPostVoiceTurn,
    })

    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length

    act(() => {
      result.current.sendTurn("Bad message")
    })

    await waitFor(() => {
      expect(result.current.history).toHaveLength(initialLen + 2)
    })
    expect(result.current.history.at(-1)?.role).toBe("system")
    expect(result.current.history.at(-1)?.text).toContain("Network error")
  })

  it("sendTurn() ignores empty text", () => {
    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length

    act(() => {
      result.current.sendTurn("")
    })

    expect(result.current.history).toHaveLength(initialLen)
  })
})
