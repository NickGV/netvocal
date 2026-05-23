"use client"

import { ConversationHistory } from "@/features/voice/components/ConversationHistory"
import { RecordButton } from "@/features/voice/components/RecordButton"
import { ToastContainer } from "@/features/voice/components/Toast"
import { useRecorderUI } from "@/features/voice/hooks/useRecorderUI"

import { useState } from "react"

export default function DashboardPage() {
  const { isRecording, history, toasts, startRecording, stopRecording, clear, sendText, sendAudioAsText, dismissToast } = useRecorderUI()
  const [text, setText] = useState("")

  const handleSend = async () => {
    if (text.trim()) {
      await sendText(text.trim())
      setText("")
    }
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Prueba el asistente de voz: envía texto abajo o graba tu mensaje.
        </p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <RecordButton
            isRecording={isRecording}
            onStart={startRecording}
            onStop={() => { stopRecording(); setTimeout(() => sendAudioAsText(), 200); }}
          />
          {/* Input de texto real */}
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe tu pregunta o comando..."
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring focus:ring-emerald-500"
            onKeyDown={e => { if (e.key === "Enter") handleSend() }}
            style={{ minWidth: 250 }}
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-lg border border-emerald-700 bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Limpiar
          </button>
          <div className="ml-auto text-sm text-zinc-400">
            Estado: {isRecording ? "Grabando" : "Listo"}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-lg font-medium">Conversación</h2>
        <ConversationHistory items={history} />
      </section>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}

