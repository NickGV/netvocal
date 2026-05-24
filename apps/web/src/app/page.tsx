"use client"

import { useCallback, useEffect, useRef } from "react"
import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { MeetingForm } from "@/features/meetings/components/MeetingForm"
import { MeetingList } from "@/features/meetings/components/MeetingList"
import { TaskForm } from "@/features/tasks/components/TaskForm"
import { TaskList } from "@/features/tasks/components/TaskList"
import { useRecorder } from "@/features/voice/hooks/useRecorder"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"
import { useMeetings } from "@/features/meetings/hooks/useMeetings"
import { useTasks } from "@/features/tasks/hooks/useTasks"

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
  const tasks = useTasks()
  const meetings = useMeetings()
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

  const handleCreateTask = useCallback(
    (data: { title: string }) => {
      tasks.create({ title: data.title })
    },
    [tasks],
  )

  const handleCreateMeeting = useCallback(
    (data: { title: string; starts_at: string; ends_at: string }) => {
      meetings.create(data)
    },
    [meetings],
  )

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

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-lg font-medium">Tasks</h2>
        <div className="space-y-3">
          <TaskForm onSubmit={handleCreateTask} disabled={tasks.loading} />
          {tasks.error && (
            <p className="text-sm text-red-400">{tasks.error.message}</p>
          )}
          {tasks.loading ? (
            <p className="text-sm text-zinc-500">Loading tasks...</p>
          ) : (
            <TaskList tasks={tasks.tasks} />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-lg font-medium">Meetings</h2>
        <div className="space-y-3">
          <MeetingForm
            onSubmit={handleCreateMeeting}
            disabled={meetings.loading}
          />
          {meetings.error && (
            <p className="text-sm text-red-400">{meetings.error.message}</p>
          )}
          {meetings.loading ? (
            <p className="text-sm text-zinc-500">Loading meetings...</p>
          ) : (
            <MeetingList meetings={meetings.meetings} />
          )}
        </div>
      </section>
    </main>
  )
}
