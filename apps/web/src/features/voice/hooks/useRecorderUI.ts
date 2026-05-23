import { useCallback, useMemo, useState } from "react"
import type { ConversationItem } from "@/features/voice/types"
import { uid } from "@/lib/uid"

export function useRecorderUI() {
  const [isRecording, setIsRecording] = useState(false)
  const [history, setHistory] = useState<ConversationItem[]>(() => [
    {
      id: uid(),
      role: "assistant",
      text: "Hi — I'm ready when you are. (Mocked UI)",
      ts: Date.now(),
    },
  ])

  const start = useCallback(() => setIsRecording(true), [])
  const stop = useCallback(() => setIsRecording(false), [])

  const clear = useCallback(() => {
    setHistory([])
    setIsRecording(false)
  }, [])

  const addMockTurn = useCallback(() => {
    setHistory((prev) => {
      const now = Date.now()
      const user: ConversationItem = {
        id: uid(),
        role: "user",
        text: "Create a reminder for tomorrow at 9am.",
        ts: now,
      }
      const assistant: ConversationItem = {
        id: uid(),
        role: "assistant",
        text: "Got it. (Mocked response — API wiring later)",
        ts: now + 1,
      }
      return [...prev, user, assistant]
    })
  }, [])

  return useMemo(
    () => ({ isRecording, history, start, stop, clear, addMockTurn }),
    [isRecording, history, start, stop, clear, addMockTurn],
  )
}
