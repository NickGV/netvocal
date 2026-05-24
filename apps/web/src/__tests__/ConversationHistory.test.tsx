import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import type { ConversationItem } from "@/features/voice/types"

const userMsg: ConversationItem = {
  id: "u1",
  role: "user",
  text: "Hello there",
  ts: 1000,
}

const assistantMsg: ConversationItem = {
  id: "a1",
  role: "assistant",
  text: "Hi! How can I help?",
  ts: 1001,
}

describe("ConversationHistory", () => {
  it("shows empty state when no messages", () => {
    render(<ConversationHistory items={[]} />)
    expect(screen.getByText("No messages yet.")).toBeInTheDocument()
  })

  it("renders a list of messages", () => {
    render(<ConversationHistory items={[userMsg, assistantMsg]} />)
    expect(screen.getByText("Hello there")).toBeInTheDocument()
    expect(screen.getByText("Hi! How can I help?")).toBeInTheDocument()
  })

  it("displays the role label for each message", () => {
    render(<ConversationHistory items={[userMsg, assistantMsg]} />)
    const roles = screen.getAllByText(/user|assistant/)
    expect(roles).toHaveLength(2)
    expect(roles[0]).toHaveTextContent("user")
    expect(roles[1]).toHaveTextContent("assistant")
  })

  it("renders correct number of list items", () => {
    render(<ConversationHistory items={[userMsg, assistantMsg]} />)
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
  })
})
