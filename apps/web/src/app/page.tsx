"use client"

import { useCallback, useEffect, useRef } from "react"
import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { useRecorder } from "@/features/voice/hooks/useRecorder"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

const ERROR_DISPLAY_MS = 8000

export default function DashboardPage() {
  const {
    isRecording,
    history,
    lastError,
    start,
    stop,
    clear,
    dismissError,
    dismissHistoryItem,
    sendTurnAudio,
  } = useRecorderUI()
  const recorder = useRecorder()
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (recorder.audioBlob) {
      sendTurnAudio(recorder.audioBlob)
      recorder.reset()
    }
  }, [recorder.audioBlob, sendTurnAudio, recorder])

  useEffect(() => {
    if (lastError) {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = setTimeout(dismissError, ERROR_DISPLAY_MS)
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [lastError, dismissError])

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
      : lastError
        ? "Error"
        : isRecording
          ? "Recording"
          : "Idle"

  const statusClass = lastError
    ? "text-red-400"
    : isRecording
      ? "text-emerald-400"
      : "text-zinc-400"

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Press Start to record a message, then press Stop to send it to the
          assistant.
        </p>
      </header>

      {lastError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-200">
          <span className="mt-0.5 shrink-0">⚠</span>
          <p className="flex-1">{lastError.message}</p>
          <button
            type="button"
            onClick={dismissError}
            className="shrink-0 text-red-400 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

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
          <div className={`ml-auto text-sm ${statusClass}`}>
            Status: {statusText}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-lg font-medium">Conversation</h2>
        <ConversationHistory items={history} onDismiss={dismissHistoryItem} />
      </section>
    </main>
  )
}
