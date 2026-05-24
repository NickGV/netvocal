export type Meeting = {
  id: string
  title: string
  starts_at: string
  ends_at: string
}

export type MeetingCreate = {
  title: string
  starts_at: string
  ends_at: string
}
