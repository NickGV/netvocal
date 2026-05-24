import type { HistoryResponse, VoiceTurnResponse } from "@/features/voice/types"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl)

    const res = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
    }

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return undefined as T
    }

    return (await res.json()) as T
  }

  async postVoiceTurn(
    utterance: string,
    sessionId?: string,
  ): Promise<VoiceTurnResponse> {
    return this.request<VoiceTurnResponse>("/voice/turn", {
      method: "POST",
      body: { utterance, session_id: sessionId },
    })
  }

  async postVoiceTurnAudio(
    audioBlob: Blob,
    sessionId?: string,
  ): Promise<VoiceTurnResponse> {
    const url = new URL("/voice/turn/audio", this.baseUrl)
    const formData = new FormData()
    formData.append("audio", audioBlob, "audio.webm")
    if (sessionId) formData.append("session_id", sessionId)

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { accept: "application/json" },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`API ${res.status} ${res.statusText}: ${text}`)
    }

    return (await res.json()) as VoiceTurnResponse
  }

  async getVoiceHistory(sessionId: string): Promise<HistoryResponse> {
    const params = new URLSearchParams({ session_id: sessionId })
    return this.request<HistoryResponse>(`/voice/history?${params.toString()}`)
  }
}

export function getApiClient() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Set it in .env (see .env.example).",
    )
  }
  return new ApiClient(baseUrl)
}
