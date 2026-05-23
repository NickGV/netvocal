import { useCallback, useMemo, useRef, useState } from "react"
import type { ConversationItem } from "@/features/voice/types"
import { uid } from "@/lib/uid"
import { getApiClient } from "@/services/apiClient"

export function useRecorderUI() {
  const [isRecording, setIsRecording] = useState(false)
  const [history, setHistory] = useState<ConversationItem[]>(() => [
    {
      id: uid(),
      role: "assistant",
      text: "Hi — I'm ready when you are.",
      ts: Date.now(),
    },
  ])

  const sessionIdRef = useRef<string | undefined>(undefined)

  const start = useCallback(() => setIsRecording(true), [])
  const stop = useCallback(() => setIsRecording(false), [])

  const clear = useCallback(() => {
    setHistory([])
    sessionIdRef.current = undefined
    setIsRecording(false)
  }, [])

  const sendTurn = useCallback(async (text: string) => {
    if (!text.trim()) return

    const userItem: ConversationItem = {
      id: uid(),
      role: "user",
      text: text.trim(),
      ts: Date.now(),
    }
    setHistory((prev) => [...prev, userItem])

    try {
      const client = getApiClient()
      const response = await client.postVoiceTurn(
        text.trim(),
        sessionIdRef.current,
      )
      sessionIdRef.current = response.session_id

      const assistantItem: ConversationItem = {
        id: uid(),
        role: "assistant",
        text: response.assistant_text,
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, assistantItem])
    } catch (err) {
      const errorItem: ConversationItem = {
        id: uid(),
        role: "system",
        text:
          err instanceof Error
            ? err.message
            : "An error occurred while processing your request.",
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, errorItem])
    }
  }, [])

  return useMemo(
    () => ({ isRecording, history, start, stop, clear, sendTurn }),
    [isRecording, history, start, stop, clear, sendTurn],
  )
}
