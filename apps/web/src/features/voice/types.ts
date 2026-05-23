export type ConversationRole = "user" | "assistant" | "system"

export type ConversationItem = {
  id: string
  role: ConversationRole
  text: string
  timestamp: string // ISO 8601 string
}
