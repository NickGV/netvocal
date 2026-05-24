import type { HistoryResponse, VoiceTurnResponse } from "@/features/voice/types"

export type ApiErrorType = "timeout" | "network" | "http" | "unknown"

export class ApiError extends Error {
  type: ApiErrorType
  status?: number

  constructor(type: ApiErrorType, message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.type = type
    this.status = status
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  timeout?: number
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeout = 30000,
  ) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const timeout = options.timeout ?? this.defaultTimeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const url = new URL(path, this.baseUrl)

      const res = await fetch(url.toString(), {
        method: options.method ?? "GET",
        headers: {
          "content-type": "application/json",
          ...(options.headers ?? {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new ApiError(
          "http",
          `Error ${res.status}: ${text || res.statusText}`,
          res.status,
        )
      }

      const contentType = res.headers.get("content-type") ?? ""
      if (!contentType.includes("application/json")) {
        return undefined as T
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof ApiError) throw err

      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        throw new ApiError(
          "timeout",
          "The request timed out. Please check your connection and try again.",
        )
      }

      if (err instanceof TypeError) {
        throw new ApiError(
          "network",
          "Could not connect to the server. Make sure the API is running.",
        )
      }

      throw new ApiError(
        "unknown",
        err instanceof Error ? err.message : "An unexpected error occurred.",
      )
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async rawFetch<T>(
    url: URL,
    body: BodyInit,
    options: { timeout?: number } = {},
  ): Promise<T> {
    const timeout = options.timeout ?? this.defaultTimeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { accept: "application/json" },
        body,
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new ApiError(
          "http",
          `Error ${res.status}: ${text || res.statusText}`,
          res.status,
        )
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof ApiError) throw err

      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        throw new ApiError(
          "timeout",
          "The request timed out. Please check your connection and try again.",
        )
      }

      if (err instanceof TypeError) {
        throw new ApiError(
          "network",
          "Could not connect to the server. Make sure the API is running.",
        )
      }

      throw new ApiError(
        "unknown",
        err instanceof Error ? err.message : "An unexpected error occurred.",
      )
    } finally {
      clearTimeout(timeoutId)
    }
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
    return this.rawFetch<VoiceTurnResponse>(url, formData)
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
