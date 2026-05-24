"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ApiError } from "@/services/apiClient"
import type { Meeting, MeetingCreate } from "@/features/meetings/types"
import { getApiClient } from "@/services/apiClient"

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const client = getApiClient()
      const data = await client.getMeetings()
      setMeetings(data)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (data: MeetingCreate) => {
    setError(null)
    try {
      const client = getApiClient()
      const created = await client.createMeeting(data)
      setMeetings((prev) => [...prev, created])
      return created
    } catch (err) {
      setError(err as ApiError)
      return null
    }
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return useMemo(
    () => ({ meetings, loading, error, refresh, create, dismissError }),
    [meetings, loading, error, refresh, create, dismissError],
  )
}
