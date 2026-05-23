"use client"

import { useEffect, useState } from "react"

export type ToastItem = {
  id: string
  message: string
  type: "error" | "warning" | "info"
}

export function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const colorMap = {
    error: "border-red-700 bg-red-950/80 text-red-200",
    warning: "border-yellow-700 bg-yellow-950/80 text-yellow-200",
    info: "border-emerald-700 bg-emerald-950/80 text-emerald-200",
  }

  return (
    <div
      className={`rounded-lg border px-4 py-2 text-sm shadow-lg transition-all duration-300 ${
        colorMap[toast.type]
      } ${visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300) }}
          className="ml-2 text-xs opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
