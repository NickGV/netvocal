"use client"

import { useCallback, useEffect } from "react"
import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { useRecorder } from "@/features/voice/hooks/useRecorder"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

export default function DashboardPage() {
  const { isRecording, history, start, stop, clear, sendTurnAudio } =
    useRecorderUI()
  const recorder = useRecorder()

  useEffect(() => {
    if (recorder.audioBlob) {
      sendTurnAudio(recorder.audioBlob)
      recorder.reset()
    }
  }, [recorder.audioBlob, sendTurnAudio, recorder])

  const handleToggle = useCallback(() => {
    if (isRecording) {
      stop()
      recorder.stopRecording()
    } else {
      start()
      recorder.startRecording()
    }
  }, [isRecording, start, stop, recorder])

  const statusText = !recorder.isSupported
    ? "Mic not supported"
    : recorder.error
      ? recorder.error
      : isRecording
        ? "Recording"
        : "Idle"

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Press Start to record a message, then press Stop to send it to the
          assistant.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RecordButton
            isRecording={isRecording}
            onToggle={handleToggle}
          />
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Clear
          </button>
          <div className="ml-auto text-sm text-zinc-400">
            Status: {statusText}
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
