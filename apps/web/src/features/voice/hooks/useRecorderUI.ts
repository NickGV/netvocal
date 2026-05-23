import { useCallback, useEffect, useMemo, useState } from "react"
import type { ConversationItem } from "@/features/voice/types"
import type { ToastItem } from "@/features/voice/components/Toast"
import { uid } from "@/lib/uid"
import { getApiClient } from "@/services/apiClient"

export function useRecorderUI() {
  const [isRecording, setIsRecording] = useState(false)
  const [history, setHistory] = useState<ConversationItem[]>([])
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const apiClient = getApiClient()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastItem["type"] = "error") => {
    setToasts((prev) => [...prev, { id: uid(), message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    let cancelled = false
    apiClient.request<ConversationItem[]>("/voice/history").then((data) => {
      if (!cancelled && Array.isArray(data)) {
        setHistory(data)
      }
    }).catch(() => {
      // backend sin historial aún — se deja vacío
    })
    return () => { cancelled = true }
  }, [])

  // Inicio de grabación real
  const startRecording = useCallback(async () => {
    if (isRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new window.MediaRecorder(stream)
      let localChunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          localChunks.push(e.data)
        }
      }
      recorder.onstop = () => {
        setIsRecording(false)
        setAudioChunks(localChunks)
        // Se puede aquí simular envío o procesado local
      }
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (err) {
      setIsRecording(false)
      addToast("No fue posible acceder al micrófono. Verifica permisos.", "error")
    }
  }, [isRecording])

  // Parar la grabación y procesar el audio
  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
    }
  }, [mediaRecorder, isRecording])

  // Simula el envío del blob como texto (a futuro será upload del blob por FormData)
  const sendAudioAsText = useCallback(() => {
    if (audioChunks.length === 0) return
    // Aquí se podría enviar el blob real, pero por ahora solo mensaje placeholder
    const audioMsg: ConversationItem = {
      id: uid(),
      role: "user",
      text: "[Audio enviado - integración pendiente]",
      timestamp: new Date().toISOString(),
    }
    setHistory((prev) => [...prev, audioMsg])
    // NOTA: Aquí podrías llamar a un endpoint de transcripción/voz real futuro
    setAudioChunks([])
  }, [audioChunks])

  const clear = useCallback(() => {
    setHistory([])
    setIsRecording(false)
  }, [])

  // Envía texto real al backend, añade los mensajes a history (optimista)
  const sendText = useCallback(async (text: string) => {
    const userMsg: ConversationItem = {
      id: uid(),
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    }
    setHistory((prev) => [...prev, userMsg])
    try {
      const data = await apiClient.request<{ assistant_text: string }>(
        "/voice/turn",
        {
          method: "POST",
          body: { utterance: text },
        }
      )
      setHistory((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: data.assistant_text,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err: any) {
      const detail = err?.message ?? "Error desconocido"
      addToast(`Error al contactar al asistente: ${detail}`, "error")
      setHistory((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: "[Error: No se pudo contactar al asistente. Intenta de nuevo.]",
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }, [])

  return useMemo(
    () => ({
      isRecording,
      history,
      toasts,
      startRecording,
      stopRecording,
      clear,
      sendText,
      sendAudioAsText,
      dismissToast,
    }),
    [isRecording, history, toasts, startRecording, stopRecording, clear, sendText, sendAudioAsText, dismissToast],
  )
}


