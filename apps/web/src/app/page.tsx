"use client"

import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

export default function DashboardPage() {
  const { isRecording, history, start, stop, clear, addMockTurn } =
    useRecorderUI()

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          UI scaffold only — audio capture and real-time pipeline will be added
          later.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RecordButton
            isRecording={isRecording}
            onToggle={() => (isRecording ? stop() : start())}
          />
          <button
            type="button"
            onClick={addMockTurn}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Add mock message
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Clear
          </button>
          <div className="ml-auto text-sm text-zinc-400">
            Status: {isRecording ? "Recording" : "Idle"}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-lg font-medium">Conversation</h2>
        <ConversationHistory items={history} />
      </section>
    </main>
  )
}
