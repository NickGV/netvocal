import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RecordButton } from "@/features/voice/components/RecordButton"

describe("RecordButton", () => {
  it("renders Start recording when not recording", () => {
    render(<RecordButton isRecording={false} onToggle={() => {}} />)

    const button = screen.getByRole("button", { name: /start recording/i })
    expect(button).toBeInTheDocument()
  })

  it("renders Stop recording when recording", () => {
    render(<RecordButton isRecording={true} onToggle={() => {}} />)

    const button = screen.getByRole("button", { name: /stop recording/i })
    expect(button).toBeInTheDocument()
  })

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()

    render(<RecordButton isRecording={false} onToggle={onToggle} />)

    const button = screen.getByRole("button", { name: /start recording/i })
    await user.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it("indicates recording state via aria-pressed", () => {
    const { rerender } = render(
      <RecordButton isRecording={false} onToggle={() => {}} />,
    )

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")

    rerender(<RecordButton isRecording={true} onToggle={() => {}} />)

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true")
  })
})
