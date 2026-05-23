import type { ConversationItem } from "@/features/voice/types"

export function ConversationHistory({ items }: { items: ConversationItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-400">
        No messages yet.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li
          key={m.id}
          className={
            "rounded-lg border border-zinc-800 p-3 " +
            (m.role === "user" ? "bg-zinc-950/40" : "bg-zinc-900/40")
          }
        >
          <div className="mb-1 text-xs uppercase tracking-wide text-zinc-500">
            {m.role}
          </div>
          <div className="text-sm leading-relaxed text-zinc-100">{m.text}</div>
        </li>
      ))}
    </ul>
  )
}
