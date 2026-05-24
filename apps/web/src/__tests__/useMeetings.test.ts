import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useMeetings } from "@/features/meetings/hooks/useMeetings"
import { getApiClient } from "@/services/apiClient"

vi.mock("@/services/apiClient", () => ({
  getApiClient: vi.fn(),
}))

const mockMeetings = [
  {
    id: "m1",
    title: "Sprint",
    starts_at: "2026-06-01T10:00:00Z",
    ends_at: "2026-06-01T11:00:00Z",
  },
]

describe("useMeetings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches meetings on mount", async () => {
    const mockGetMeetings = vi.fn().mockResolvedValue(mockMeetings)
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
    })

    const { result } = renderHook(() => useMeetings())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.meetings).toEqual(mockMeetings)
    expect(result.current.error).toBeNull()
  })

  it("handles fetch error", async () => {
    const mockGetMeetings = vi.fn().mockRejectedValue(new Error("API fail"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
    })

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.meetings).toEqual([])
    expect(result.current.error).not.toBeNull()
  })

  it("creates a meeting and appends to list", async () => {
    const mockGetMeetings = vi.fn().mockResolvedValue([])
    const mockCreateMeeting = vi.fn().mockResolvedValue({
      id: "m-new",
      title: "New",
      starts_at: "2026-07-01T09:00:00Z",
      ends_at: "2026-07-01T10:00:00Z",
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
      createMeeting: mockCreateMeeting,
    })

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let created: unknown = null
    await act(async () => {
      created = await result.current.create({
        title: "New",
        starts_at: "2026-07-01T09:00:00Z",
        ends_at: "2026-07-01T10:00:00Z",
      })
    })

    expect(result.current.meetings).toHaveLength(1)
    expect(result.current.meetings[0].title).toBe("New")
    expect(created).not.toBeNull()
  })

  it("handles create error", async () => {
    const mockGetMeetings = vi.fn().mockResolvedValue([])
    const mockCreateMeeting = vi
      .fn()
      .mockRejectedValue(new Error("Create fail"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
      createMeeting: mockCreateMeeting,
    })

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.create({
        title: "Fail",
        starts_at: "",
        ends_at: "",
      })
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.meetings).toHaveLength(0)
  })

  it("dismissError clears the error", async () => {
    const mockGetMeetings = vi.fn().mockRejectedValue(new Error("Some error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
    })

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })

    act(() => {
      result.current.dismissError()
    })
    expect(result.current.error).toBeNull()
  })

  it("refresh refetches meetings", async () => {
    const mockGetMeetings = vi.fn()
    mockGetMeetings.mockResolvedValueOnce([])
    mockGetMeetings.mockResolvedValueOnce(mockMeetings)
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getMeetings: mockGetMeetings,
    })

    const { result } = renderHook(() => useMeetings())

    await waitFor(() => {
      expect(result.current.meetings).toEqual([])
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.meetings).toEqual(mockMeetings)
    expect(mockGetMeetings).toHaveBeenCalledTimes(2)
  })
})
