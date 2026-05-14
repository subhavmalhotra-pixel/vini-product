import { useState, useEffect } from 'react'
import { DealerWeekData } from '../types'
import { fetchWeekData } from '../api/client'

export function useWeekData(dealerId: string, weekStart: string) {
  const [data, setData] = useState<DealerWeekData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchWeekData(dealerId, weekStart)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [dealerId, weekStart])

  return { data, loading, error }
}
