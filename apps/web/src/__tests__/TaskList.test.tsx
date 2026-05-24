import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TaskList } from "@/features/tasks/components/TaskList"
import type { Task } from "@/features/tasks/types"

const sampleTasks: Task[] = [
  { id: "1", title: "First task", due_at: null },
  { id: "2", title: "Second task", due_at: "2026-07-15T00:00:00Z" },
]

describe("TaskList", () => {
  it("shows empty state", () => {
    render(<TaskList tasks={[]} />)
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument()
  })

  it("renders task titles", () => {
    render(<TaskList tasks={sampleTasks} />)
    expect(screen.getByText("First task")).toBeInTheDocument()
    expect(screen.getByText("Second task")).toBeInTheDocument()
  })

  it("renders due date when present", () => {
    render(<TaskList tasks={sampleTasks} />)
    const expected = new Date("2026-07-15T00:00:00Z").toLocaleDateString()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
