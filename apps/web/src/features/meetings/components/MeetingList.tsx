import type { Meeting } from "@/features/meetings/types"

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-400">
        No meetings yet.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {meetings.map((m) => (
        <li
          key={m.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2"
        >
          <span className="text-sm text-zinc-100">{m.title}</span>
          <span className="text-xs text-zinc-500">
            {new Date(m.starts_at).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  )
}
