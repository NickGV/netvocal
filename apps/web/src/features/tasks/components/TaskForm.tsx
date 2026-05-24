"use client"

import { useCallback, useState } from "react"
import type { TaskCreate } from "@/features/tasks/types"

type Props = {
  onSubmit: (data: TaskCreate) => void
  disabled?: boolean
}

export function TaskForm({ onSubmit, disabled }: Props) {
  const [title, setTitle] = useState("")

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim()) return
      onSubmit({ title: title.trim() })
      setTitle("")
    },
    [title, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        disabled={disabled}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !title.trim()}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  )
}
