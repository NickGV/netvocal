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
