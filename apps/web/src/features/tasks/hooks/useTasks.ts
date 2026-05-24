"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ApiError } from "@/services/apiClient"
import type { Task, TaskCreate } from "@/features/tasks/types"
import { getApiClient } from "@/services/apiClient"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const client = getApiClient()
      const data = await client.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (data: TaskCreate) => {
    setError(null)
    try {
      const client = getApiClient()
      const created = await client.createTask(data)
      setTasks((prev) => [...prev, created])
      return created
    } catch (err) {
      setError(err as ApiError)
      return null
    }
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  return useMemo(
    () => ({ tasks, loading, error, refresh, create, dismissError }),
    [tasks, loading, error, refresh, create, dismissError],
  )
}
