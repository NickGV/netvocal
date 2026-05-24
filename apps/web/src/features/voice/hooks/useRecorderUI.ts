"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ApiError } from "@/services/apiClient"
import type { ConversationItem, HistoryEntry } from "@/features/voice/types"
import { uid } from "@/lib/uid"
import { getApiClient } from "@/services/apiClient"

const SESSION_KEY = "netvocal.voice.session_id"

function getSafeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null
  const storage = window.localStorage as unknown as Partial<Storage> | undefined
  if (!storage) return null
  if (
    typeof storage.getItem !== "function" ||
    typeof storage.setItem !== "function" ||
    typeof storage.removeItem !== "function"
  ) {
    return null
  }
  return storage as Storage
}

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
  const [lastError, setLastError] = useState<ApiError | null>(null)

  const sessionIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const storage = getSafeLocalStorage()
    if (!storage) return

    const stored = storage.getItem(SESSION_KEY) ?? undefined
    if (!stored) return

    sessionIdRef.current = stored

    const client = getApiClient()
    client
      .getVoiceHistory(stored)
      .then((res) => {
        const items: ConversationItem[] = res.turns.map((t: HistoryEntry) => {
          const role: ConversationItem["role"] =
            t.role === "user" || t.role === "assistant" || t.role === "system"
              ? t.role
              : "system"

          return {
            id: uid(),
            role,
            text: t.text,
            ts: Number.isFinite(Date.parse(t.timestamp))
              ? Date.parse(t.timestamp)
              : Date.now(),
          }
        })
        setHistory(items)
      })
      .catch((err) => {
        const errorItem: ConversationItem = {
          id: uid(),
          role: "system",
          text:
            err instanceof Error
              ? err.message
              : "Could not load conversation history.",
          ts: Date.now(),
        }
        setHistory((prev) => [...prev, errorItem])
      })
  }, [])

  const start = useCallback(() => {
    setLastError(null)
    setIsRecording(true)
  }, [])

  const stop = useCallback(() => setIsRecording(false), [])

  const clear = useCallback(() => {
    setHistory([])
    sessionIdRef.current = undefined
    getSafeLocalStorage()?.removeItem(SESSION_KEY)
    setLastError(null)
    setIsRecording(false)
  }, [])

  const dismissError = useCallback(() => setLastError(null), [])

  const dismissHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
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
      getSafeLocalStorage()?.setItem(SESSION_KEY, response.session_id)

      const assistantItem: ConversationItem = {
        id: uid(),
        role: "assistant",
        text: response.assistant_text,
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, assistantItem])
    } catch (err) {
      const apiErr = err as ApiError
      setLastError(apiErr)

      const errorItem: ConversationItem = {
        id: uid(),
        role: "system",
        text: apiErr.message,
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, errorItem])
    }
  }, [])

  const sendTurnAudio = useCallback(async (audioBlob: Blob) => {
    const userItem: ConversationItem = {
      id: uid(),
      role: "user",
      text: "[Audio message]",
      ts: Date.now(),
    }
    setHistory((prev) => [...prev, userItem])

    try {
      const client = getApiClient()
      const response = await client.postVoiceTurnAudio(
        audioBlob,
        sessionIdRef.current,
      )
      sessionIdRef.current = response.session_id
      getSafeLocalStorage()?.setItem(SESSION_KEY, response.session_id)

      const assistantItem: ConversationItem = {
        id: uid(),
        role: "assistant",
        text: response.assistant_text,
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, assistantItem])
    } catch (err) {
      const apiErr = err as ApiError
      setLastError(apiErr)

      const errorItem: ConversationItem = {
        id: uid(),
        role: "system",
        text: apiErr.message,
        ts: Date.now(),
      }
      setHistory((prev) => [...prev, errorItem])
    }
  }, [])

  const addSystemMessage = useCallback((text: string) => {
    const item: ConversationItem = {
      id: uid(),
      role: "system",
      text,
      ts: Date.now(),
    }
    setHistory((prev) => [...prev, item])
  }, [])

  return useMemo(
    () => ({
      isRecording,
      history,
      lastError,
      start,
      stop,
      clear,
      dismissError,
      dismissHistoryItem,
      addSystemMessage,
      sendTurn,
      sendTurnAudio,
    }),
    [isRecording, history, lastError, start, stop, clear, dismissError, dismissHistoryItem, addSystemMessage, sendTurn, sendTurnAudio],
  )
}
