import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useTasks } from "@/features/tasks/hooks/useTasks"
import { getApiClient } from "@/services/apiClient"

vi.mock("@/services/apiClient", () => ({
  getApiClient: vi.fn(),
}))

const mockTasks = [
  { id: "t1", title: "Task one", due_at: null },
  { id: "t2", title: "Task two", due_at: "2026-06-01T00:00:00Z" },
]

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches tasks on mount", async () => {
    const mockGetTasks = vi.fn().mockResolvedValue(mockTasks)
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
    })

    const { result } = renderHook(() => useTasks())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.tasks).toEqual(mockTasks)
    expect(result.current.error).toBeNull()
  })

  it("handles fetch error", async () => {
    const mockGetTasks = vi.fn().mockRejectedValue(new Error("API error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.tasks).toEqual([])
    expect(result.current.error).not.toBeNull()
  })

  it("creates a task and appends to list", async () => {
    const mockGetTasks = vi.fn().mockResolvedValue([])
    const mockCreateTask = vi.fn().mockResolvedValue({
      id: "t-new",
      title: "New task",
      due_at: null,
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
      createTask: mockCreateTask,
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let created: unknown = null
    await act(async () => {
      created = await result.current.create({ title: "New task" })
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe("New task")
    expect(created).not.toBeNull()
  })

  it("handles create error", async () => {
    const mockGetTasks = vi.fn().mockResolvedValue([])
    const mockCreateTask = vi.fn().mockRejectedValue(new Error("Create failed"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
      createTask: mockCreateTask,
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.create({ title: "Fail" })
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.tasks).toHaveLength(0)
  })

  it("dismissError clears the error", async () => {
    const mockGetTasks = vi.fn().mockRejectedValue(new Error("Some error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    act(() => {
      result.current.dismissError()
    })
    expect(result.current.error).toBeNull()
  })

  it("refresh refetches tasks", async () => {
    const mockGetTasks = vi.fn()
    mockGetTasks.mockResolvedValueOnce([])
    mockGetTasks.mockResolvedValueOnce(mockTasks)
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getTasks: mockGetTasks,
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.tasks).toEqual([])
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.tasks).toEqual(mockTasks)
    expect(mockGetTasks).toHaveBeenCalledTimes(2)
  })
})
