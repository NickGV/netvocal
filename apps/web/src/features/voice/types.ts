export type ConversationRole = "user" | "assistant" | "system"

export type ConversationItem = {
  id: string
  role: ConversationRole
  text: string
  ts: number
}
