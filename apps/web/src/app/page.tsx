"use client"

import { useCallback, useState } from "react"
import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

export default function DashboardPage() {
  const { isRecording, history, start, stop, clear, sendTurn } =
    useRecorderUI()
  const [inputText, setInputText] = useState("")

  const handleToggle = useCallback(() => {
    if (isRecording) {
      if (inputText.trim()) {
        sendTurn(inputText.trim())
        setInputText("")
      }
      stop()
    } else {
      start()
    }
  }, [isRecording, inputText, sendTurn, start, stop])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputText.trim()) {
        sendTurn(inputText.trim())
        setInputText("")
        stop()
      }
    },
    [inputText, sendTurn, stop],
  )

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Type a message and press Stop to send it to the assistant.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RecordButton
            isRecording={isRecording}
            onToggle={handleToggle}
          />
          {isRecording && (
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              autoFocus
            />
          )}
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
