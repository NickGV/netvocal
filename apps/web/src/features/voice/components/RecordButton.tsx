type Props = {
  isRecording: boolean
  onToggle: () => void
}

export function RecordButton({ isRecording, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        "rounded-lg px-4 py-2 text-sm font-medium transition " +
        (isRecording
          ? "bg-red-600 hover:bg-red-500"
          : "bg-emerald-600 hover:bg-emerald-500")
      }
      aria-pressed={isRecording}
    >
      {isRecording ? "Stop recording" : "Start recording"}
    </button>
  )
}
