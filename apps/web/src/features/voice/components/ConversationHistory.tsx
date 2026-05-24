import { useCallback } from "react"
import type { ConversationItem } from "@/features/voice/types"

function isErrorItem(item: ConversationItem): boolean {
  if (item.role !== "system") return false
  const lower = item.text.toLowerCase()
  return (
    lower.includes("error") ||
    lower.includes("timeout") ||
    lower.includes("could not connect") ||
    lower.includes("could not load") ||
    lower.includes("timed out")
  )
}

export function ConversationHistory({
  items,
  onDismiss,
}: {
  items: ConversationItem[]
  onDismiss?: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-400">
        No messages yet.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((m) => {
        const isError = isErrorItem(m)

        return (
          <li
            key={m.id}
            className={
              "group relative rounded-lg border p-3 " +
              (isError
                ? "border-red-900/60 bg-red-950/30"
                : m.role === "user"
                  ? "border-zinc-800 bg-zinc-950/40"
                  : "border-zinc-800 bg-zinc-900/40")
            }
          >
            <div className="mb-1 flex items-center justify-between">
              <span
                className={
                  "text-xs uppercase tracking-wide " +
                  (isError ? "text-red-400" : "text-zinc-500")
                }
              >
                {isError ? "error" : m.role}
              </span>
              {isError && onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(m.id)}
                  className="text-xs text-zinc-500 opacity-0 transition-opacity hover:text-zinc-300 group-hover:opacity-100"
                >
                  Dismiss
                </button>
              )}
            </div>
            <div
              className={
                "text-sm leading-relaxed " +
                (isError ? "text-red-200" : "text-zinc-100")
              }
            >
              {m.text}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
