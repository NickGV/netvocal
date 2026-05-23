type Props = {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
}

export function RecordButton({ isRecording, onStart, onStop }: Props) {
  return (
    <button
      type="button"
      onClick={isRecording ? onStop : onStart}
      className={
        "rounded-lg px-4 py-2 text-sm font-medium transition " +
        (isRecording
          ? "bg-red-600 hover:bg-red-500"
          : "bg-emerald-600 hover:bg-emerald-500")
      }
      aria-pressed={isRecording}
    >
      {isRecording ? "Detener grabación" : "Iniciar grabación"}
    </button>
  )
}
