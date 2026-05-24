import { describe, it, expect, vi, beforeEach } from "vitest"
import { ApiClient, ApiError } from "@/services/apiClient"

function mockFetch(status: number, body: unknown, ok?: boolean) {
  return vi.fn().mockResolvedValue({
    ok: ok ?? (status >= 200 && status < 300),
    status,
    statusText: status === 404 ? "Not Found" : "Error",
    headers: new Map([["content-type", "application/json"]]),
    json: () => Promise.resolve(body),
    text: () =>
      Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  })
}

describe("ApiError", () => {
  it("creates a timeout error", () => {
    const err = new ApiError(
      "timeout",
      "The request timed out. Please check your connection and try again.",
    )
    expect(err.type).toBe("timeout")
    expect(err.name).toBe("ApiError")
  })

  it("creates an http error with status", () => {
    const err = new ApiError("http", "Error 500: Server Error", 500)
    expect(err.type).toBe("http")
    expect(err.status).toBe(500)
  })

  it("creates a network error", () => {
    const err = new ApiError(
      "network",
      "Could not connect to the server. Make sure the API is running.",
    )
    expect(err.type).toBe("network")
  })
})

describe("ApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  describe("request", () => {
    it("returns JSON on success", async () => {
      const expected = { assistant_text: "hello", session_id: "s1" }
      vi.mocked(fetch).mockImplementation(
        mockFetch(200, expected) as unknown as typeof fetch,
      )

      const client = new ApiClient("http://localhost:8000")
      const result = await client.request("/voice/turn")
      expect(result).toEqual(expected)
    })

    it("throws ApiError on HTTP 500", async () => {
      vi.mocked(fetch).mockImplementation(
        mockFetch(500, "Internal Server Error") as unknown as typeof fetch,
      )

      const client = new ApiClient("http://localhost:8000")
      await expect(client.request("/voice/turn")).rejects.toThrow(ApiError)
      await expect(client.request("/voice/turn")).rejects.toMatchObject({
        type: "http",
        status: 500,
      })
    })

    it("throws ApiError on HTTP 404", async () => {
      vi.mocked(fetch).mockImplementation(
        mockFetch(404, "Not Found") as unknown as typeof fetch,
      )

      const client = new ApiClient("http://localhost:8000")
      await expect(client.request("/voice/turn")).rejects.toMatchObject({
        type: "http",
        status: 404,
      })
    })

    it("throws ApiError on network error", async () => {
      vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"))

      const client = new ApiClient("http://localhost:8000")
      await expect(client.request("/voice/turn")).rejects.toMatchObject({
        type: "network",
      })
    })

    it("throws ApiError on timeout (AbortError)", async () => {
      const abortError = new DOMException("The operation was aborted", "AbortError")
      vi.mocked(fetch).mockRejectedValue(abortError)

      const client = new ApiClient("http://localhost:8000")
      await expect(client.request("/voice/turn", { timeout: 1 })).rejects.toMatchObject({
        type: "timeout",
      })
    })
  })

  describe("postVoiceTurnAudio", () => {
    it("sends FormData to /voice/turn/audio", async () => {
      const expected = { assistant_text: "transcribed", session_id: "s1" }
      vi.mocked(fetch).mockImplementation(
        mockFetch(200, expected) as unknown as typeof fetch,
      )

      const client = new ApiClient("http://localhost:8000")
      const blob = new Blob(["fake audio"], { type: "audio/webm" })
      const result = await client.postVoiceTurnAudio(blob, "s1")

      expect(result).toEqual(expected)

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const [url, opts] = fetchCall as [string | URL, RequestInit]
      expect(url.toString()).toContain("/voice/turn/audio")
      expect(opts.body).toBeInstanceOf(FormData)
      expect((opts.body as FormData).get("session_id")).toBe("s1")
      expect((opts.body as FormData).get("audio")).toBeInstanceOf(Blob)
    })
  })
})
