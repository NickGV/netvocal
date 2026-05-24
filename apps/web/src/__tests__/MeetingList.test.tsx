import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MeetingList } from "@/features/meetings/components/MeetingList"
import type { Meeting } from "@/features/meetings/types"

const sampleMeetings: Meeting[] = [
  {
    id: "1",
    title: "Sprint planning",
    starts_at: "2026-07-20T10:00:00Z",
    ends_at: "2026-07-20T11:00:00Z",
  },
]

describe("MeetingList", () => {
  it("shows empty state", () => {
    render(<MeetingList meetings={[]} />)
    expect(screen.getByText("No meetings yet.")).toBeInTheDocument()
  })

  it("renders meeting title", () => {
    render(<MeetingList meetings={sampleMeetings} />)
    expect(screen.getByText("Sprint planning")).toBeInTheDocument()
  })

  it("renders meeting date", () => {
    render(<MeetingList meetings={sampleMeetings} />)
    const expected = new Date("2026-07-20T10:00:00Z").toLocaleDateString()
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
