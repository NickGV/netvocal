import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MeetingForm } from "@/features/meetings/components/MeetingForm"

describe("MeetingForm", () => {
  it("renders inputs and submit button", () => {
    render(<MeetingForm onSubmit={() => {}} />)
    expect(
      screen.getByPlaceholderText("Meeting title..."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Schedule" }),
    ).toBeInTheDocument()
  })

  it("calls onSubmit with meeting data when submitted", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<MeetingForm onSubmit={onSubmit} />)

    const titleInput = screen.getByPlaceholderText("Meeting title...")
    await user.type(titleInput, "Sync")

    const submitBtn = screen.getByRole("button", { name: "Schedule" })
    await user.click(submitBtn)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    const called = onSubmit.mock.calls[0][0]
    expect(called.title).toBe("Sync")
    expect(called.starts_at).toBeTruthy()
    expect(called.ends_at).toBeTruthy()
  })

  it("does not submit empty title", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<MeetingForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Schedule" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("disables when disabled prop is true", () => {
    render(<MeetingForm onSubmit={() => {}} disabled />)

    expect(screen.getByPlaceholderText("Meeting title...")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Schedule" })).toBeDisabled()
  })
})
