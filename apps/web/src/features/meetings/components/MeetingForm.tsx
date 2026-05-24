"use client"

import { useCallback, useState } from "react"
import type { MeetingCreate } from "@/features/meetings/types"

type Props = {
  onSubmit: (data: MeetingCreate) => void
  disabled?: boolean
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

export function MeetingForm({ onSubmit, disabled }: Props) {
  const [title, setTitle] = useState("")
  const now = toDatetimeLocal(new Date())
  const [startsAt, setStartsAt] = useState(now)
  const [endsAt, setEndsAt] = useState(now)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim() || !startsAt || !endsAt) return
      onSubmit({
        title: title.trim(),
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
      })
      setTitle("")
    },
    [title, startsAt, endsAt, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title..."
        disabled={disabled}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
      />
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-500">Starts</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            disabled={disabled}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-500">Ends</span>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            disabled={disabled}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={disabled || !title.trim()}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        Schedule
      </button>
    </form>
  )
}
