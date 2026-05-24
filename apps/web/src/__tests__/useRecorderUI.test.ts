import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { ApiError } from "@/services/apiClient"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"
import { getApiClient } from "@/services/apiClient"

vi.mock("@/services/apiClient", async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...(mod as Record<string, unknown>),
    getApiClient: vi.fn(),
  }
})

describe("useRecorderUI", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const store = new Map<string, string>()
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v)
        },
        removeItem: (k: string) => {
          store.delete(k)
        },
        clear: () => {
          store.clear()
        },
      },
      configurable: true,
    })
  })

  it("starts with empty history and loading finishes when no session", () => {
    const { result } = renderHook(() => useRecorderUI())
    expect(result.current.history).toHaveLength(0)
    expect(result.current.historyLoading).toBe(false)
  })

  it("clear() resets history to empty", () => {
    const { result } = renderHook(() => useRecorderUI())
    act(() => result.current.addSystemMessage("test"))
    expect(result.current.history).not.toHaveLength(0)

    act(() => result.current.clear())
    expect(result.current.history).toHaveLength(0)
  })

  it("loads history from API when session_id exists in localStorage", async () => {
    window.localStorage.setItem("netvocal.voice.session_id", "sid-1")

    const mockGetVoiceHistory = vi.fn().mockResolvedValue({
      session_id: "sid-1",
      turns: [
        { role: "user", text: "hi", timestamp: "2026-01-01T00:00:00Z" },
        {
          role: "assistant",
          text: "hello",
          timestamp: "2026-01-01T00:00:01Z",
        },
      ],
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getVoiceHistory: mockGetVoiceHistory,
    })

    const { result } = renderHook(() => useRecorderUI())

    expect(result.current.historyLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.history).toHaveLength(2)
    })
    expect(result.current.history[0].role).toBe("user")
    expect(result.current.history[0].text).toBe("hi")
    expect(result.current.history[1].role).toBe("assistant")
    expect(result.current.history[1].text).toBe("hello")
    expect(result.current.historyLoading).toBe(false)
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

  it("starts with no lastError", () => {
    const { result } = renderHook(() => useRecorderUI())
    expect(result.current.lastError).toBeNull()
  })

  it("sets lastError and error item when history fetch fails", async () => {
    window.localStorage.setItem("netvocal.voice.session_id", "sid-bad")

    const apiError = new ApiError("http", "Internal Server Error", 500)
    const mockGetVoiceHistory = vi.fn().mockRejectedValue(apiError)
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getVoiceHistory: mockGetVoiceHistory,
    })

    const { result } = renderHook(() => useRecorderUI())

    await waitFor(() => {
      expect(result.current.historyLoading).toBe(false)
    })
    expect(result.current.lastError).not.toBeNull()
    expect(result.current.lastError?.message).toContain("Internal Server Error")
    expect(result.current.history.some((item) => item.text.includes("Internal Server Error"))).toBe(true)
  })

  it("setLastError updates lastError", () => {
    const { result } = renderHook(() => useRecorderUI())
    expect(result.current.lastError).toBeNull()

    const err = new ApiError("unknown", "test error")
    act(() => result.current.setLastError(err))
    expect(result.current.lastError?.message).toBe("test error")
    expect(result.current.lastError?.type).toBe("unknown")
  })

  it("sendTurn() shows error message on API failure and sets lastError", async () => {
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
    expect(result.current.lastError).not.toBeNull()
    expect(result.current.lastError?.message).toContain("Network error")
  })

  it("dismissError clears lastError", async () => {
    const mockPostVoiceTurn = vi
      .fn()
      .mockRejectedValue(new Error("Some error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      postVoiceTurn: mockPostVoiceTurn,
    })

    const { result } = renderHook(() => useRecorderUI())

    act(() => {
      result.current.sendTurn("fail")
    })
    await waitFor(() => {
      expect(result.current.lastError).not.toBeNull()
    })

    act(() => {
      result.current.dismissError()
    })
    expect(result.current.lastError).toBeNull()
  })

  it("dismissHistoryItem removes item from history", () => {
    const { result } = renderHook(() => useRecorderUI())

    act(() => {
      result.current.addSystemMessage("test")
    })
    const itemId = result.current.history[0].id

    act(() => {
      result.current.dismissHistoryItem(itemId)
    })
    expect(result.current.history).toHaveLength(0)
  })

  it("sendTurn() ignores empty text", () => {
    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length

    act(() => {
      result.current.sendTurn("")
    })

    expect(result.current.history).toHaveLength(initialLen)
  })

  it("sendTurnAudio() adds user audio turn then assistant response on success", async () => {
    const mockPostVoiceTurnAudio = vi.fn().mockResolvedValue({
      assistant_text: "Audio response",
      session_id: "session-audio",
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      postVoiceTurnAudio: mockPostVoiceTurnAudio,
    })

    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length
    const audioBlob = new Blob(["fake audio data"], { type: "audio/webm" })

    act(() => {
      result.current.sendTurnAudio(audioBlob)
    })

    expect(result.current.history).toHaveLength(initialLen + 1)
    expect(result.current.history.at(-1)?.role).toBe("user")
    expect(result.current.history.at(-1)?.text).toBe("[Audio message]")

    await waitFor(() => {
      expect(result.current.history).toHaveLength(initialLen + 2)
    })
    expect(result.current.history.at(-1)?.role).toBe("assistant")
    expect(result.current.history.at(-1)?.text).toBe("Audio response")
    expect(mockPostVoiceTurnAudio).toHaveBeenCalledWith(
      audioBlob,
      undefined,
    )
  })

  it("sendTurnAudio() shows error on API failure and sets lastError", async () => {
    const mockPostVoiceTurnAudio = vi
      .fn()
      .mockRejectedValue(new Error("Audio API error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      postVoiceTurnAudio: mockPostVoiceTurnAudio,
    })

    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length
    const audioBlob = new Blob(["bad data"], { type: "audio/webm" })

    act(() => {
      result.current.sendTurnAudio(audioBlob)
    })

    await waitFor(() => {
      expect(result.current.history).toHaveLength(initialLen + 2)
    })
    expect(result.current.history.at(-1)?.role).toBe("system")
    expect(result.current.history.at(-1)?.text).toContain("Audio API error")
    expect(result.current.lastError?.message).toContain("Audio API error")
  })

  it("addSystemMessage adds a system message to history", () => {
    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length

    act(() => {
      result.current.addSystemMessage("Test system message")
    })

    expect(result.current.history).toHaveLength(initialLen + 1)
    expect(result.current.history.at(-1)?.role).toBe("system")
    expect(result.current.history.at(-1)?.text).toBe("Test system message")
  })
})
