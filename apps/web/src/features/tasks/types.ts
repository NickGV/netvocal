export type Task = {
  id: string
  title: string
  due_at: string | null
}

export type TaskCreate = {
  title: string
  due_at?: string | null
}
