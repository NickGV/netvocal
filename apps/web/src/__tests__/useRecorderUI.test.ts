import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

describe("useRecorderUI", () => {
  it("starts with one assistant greeting and isRecording false", () => {
    const { result } = renderHook(() => useRecorderUI())
    expect(result.current.isRecording).toBe(false)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].role).toBe("assistant")
    expect(result.current.history[0].text).toMatch(/Mocked UI/)
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

  it("addMockTurn() appends user and assistant entries", () => {
    const { result } = renderHook(() => useRecorderUI())
    const initialLen = result.current.history.length
    act(() => result.current.addMockTurn())
    expect(result.current.history).toHaveLength(initialLen + 2)
    expect(result.current.history.at(-2)?.role).toBe("user")
    expect(result.current.history.at(-2)?.text).toMatch(/Create a reminder/)
    expect(result.current.history.at(-1)?.role).toBe("assistant")
    expect(result.current.history.at(-1)?.text).toMatch(/Mocked response/)
  })
})
