import type { Task } from "@/features/tasks/types"

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-sm text-zinc-400">
        No tasks yet.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2"
        >
          <span className="text-sm text-zinc-100">{t.title}</span>
          {t.due_at && (
            <span className="text-xs text-zinc-500">
              {new Date(t.due_at).toLocaleDateString()}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
