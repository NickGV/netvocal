import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TaskForm } from "@/features/tasks/components/TaskForm"

describe("TaskForm", () => {
  it("renders input and button", () => {
    render(<TaskForm onSubmit={() => {}} />)
    expect(
      screen.getByPlaceholderText("New task..."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Add" }),
    ).toBeInTheDocument()
  })

  it("calls onSubmit with title when submitted", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText("New task...")
    await user.type(input, "Buy milk")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(onSubmit).toHaveBeenCalledWith({ title: "Buy milk" })
  })

  it("does not submit empty title", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("disables inputs when disabled prop is true", () => {
    render(<TaskForm onSubmit={() => {}} disabled />)

    expect(screen.getByPlaceholderText("New task...")).toBeDisabled()
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled()
  })

  it("clears input after submit", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)

    const input = screen.getByPlaceholderText("New task...")
    await user.type(input, "Quick task")
    await user.click(screen.getByRole("button", { name: "Add" }))

    expect(input).toHaveValue("")
  })
})
