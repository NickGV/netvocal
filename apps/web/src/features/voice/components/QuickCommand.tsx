"use client"

import { useCallback, useState } from "react"
import { getApiClient } from "@/services/apiClient"

type Props = {
  onTaskCreated?: () => void
  onMeetingCreated?: () => void
  onResult?: (message: string) => void
}

export function QuickCommand({ onTaskCreated, onMeetingCreated, onResult }: Props) {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!query.trim() || busy) return

      setBusy(true)
      try {
        const client = getApiClient()
        const res = await client.parseIntent(query.trim())

        if (res.message && onResult) onResult(res.message)

        if (res.intent === "create_task") {
          onTaskCreated?.()
        } else if (res.intent === "schedule_meeting") {
          onMeetingCreated?.()
        } else if (res.intent === "list_tasks") {
          onTaskCreated?.()
        } else if (res.intent === "list_meetings") {
          onMeetingCreated?.()
        }

        setQuery("")
      } catch {
        onResult?.("Could not process command.")
      } finally {
        setBusy(false)
      }
    },
    [query, busy, onTaskCreated, onMeetingCreated, onResult],
  )

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try "crea una tarea..." or "lista mis tareas..."'
        disabled={busy}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={busy || !query.trim()}
        className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 disabled:opacity-50"
      >
        {busy ? "..." : "Send"}
      </button>
    </form>
  )
}
