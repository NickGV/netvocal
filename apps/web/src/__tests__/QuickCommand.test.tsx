import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuickCommand } from "@/features/voice/components/QuickCommand"
import { getApiClient } from "@/services/apiClient"

vi.mock("@/services/apiClient", () => ({
  getApiClient: vi.fn(),
}))

describe("QuickCommand", () => {
  it("renders input and send button", () => {
    render(<QuickCommand />)
    expect(
      screen.getByPlaceholderText(/crea una tarea/i),
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
  })

  it("calls parseIntent and onResult on submit", async () => {
    const mockParseIntent = vi.fn().mockResolvedValue({
      intent: "create_task",
      message: "Tarea creada: test",
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      parseIntent: mockParseIntent,
    })

    const onResult = vi.fn()
    const onTaskCreated = vi.fn()
    const user = userEvent.setup()

    render(
      <QuickCommand
        onResult={onResult}
        onTaskCreated={onTaskCreated}
      />,
    )

    const input = screen.getByPlaceholderText(/crea una tarea/i)
    await user.type(input, "crea una tarea test")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(mockParseIntent).toHaveBeenCalledWith("crea una tarea test")
    expect(onResult).toHaveBeenCalledWith("Tarea creada: test")
    expect(onTaskCreated).toHaveBeenCalled()
  })

  it("calls onMeetingCreated for schedule_meeting intent", async () => {
    const mockParseIntent = vi.fn().mockResolvedValue({
      intent: "schedule_meeting",
      message: "Necesito fecha y hora para agendar la reunión.",
    })
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      parseIntent: mockParseIntent,
    })

    const onMeetingCreated = vi.fn()
    const user = userEvent.setup()

    render(
      <QuickCommand onMeetingCreated={onMeetingCreated} />,
    )

    const input = screen.getByPlaceholderText(/crea una tarea/i)
    await user.type(input, "agenda una reunión")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(onMeetingCreated).toHaveBeenCalled()
  })

  it("shows error message on API failure", async () => {
    const mockParseIntent = vi
      .fn()
      .mockRejectedValue(new Error("API error"))
    ;(getApiClient as ReturnType<typeof vi.fn>).mockReturnValue({
      parseIntent: mockParseIntent,
    })

    const onResult = vi.fn()
    const user = userEvent.setup()

    render(<QuickCommand onResult={onResult} />)

    const input = screen.getByPlaceholderText(/crea una tarea/i)
    await user.type(input, "fail")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(onResult).toHaveBeenCalledWith("Could not process command.")
  })
})
