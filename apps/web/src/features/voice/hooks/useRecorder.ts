"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setIsSupported(typeof MediaRecorder !== "undefined")
  }, [])

  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = []
      setAudioBlob(null)
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType =
        typeof MediaRecorder.isTypeSupported === "function" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm"

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setIsRecording(false)
      }

      recorder.onerror = () => {
        setError("An error occurred during recording.")
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not access microphone."
      setError(msg)
      setIsRecording(false)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "inactive") return
    mediaRecorderRef.current?.stop()
  }, [])

  const reset = useCallback(() => {
    chunksRef.current = []
    setAudioBlob(null)
    setError(null)
  }, [])

  return {
    isRecording,
    isSupported,
    error,
    audioBlob,
    startRecording,
    stopRecording,
    reset,
  }
}
