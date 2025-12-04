'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type LeaderboardEntry = {
  id: string
  quizId: string
  name: string
  score: number
  duration: number
  createdAt: string
}

type LeaderboardResponse = {
  leaderboard: { items: LeaderboardEntry[]; total: number }
  personalBest: LeaderboardEntry | null
}

export function useLeaderboard(quizId?: string, playerName?: string, refreshOn: number = 0) {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    if (!quizId) return
    setIsLoading(true)
    setError(null)

    const url = new URL(`/api/leaderboard/${quizId}`, window.location.origin)
    if (playerName) {
      url.searchParams.set('name', playerName)
    }

    try {
      const response = await fetch(url.toString(), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load leaderboard')
      }
      const json = (await response.json()) as LeaderboardResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [playerName, quizId])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard, refreshOn])

  const leaderboard = useMemo(() => data?.leaderboard.items ?? [], [data])
  const total = useMemo(() => data?.leaderboard.total ?? 0, [data])

  return {
    leaderboard,
    total,
    personalBest: data?.personalBest ?? null,
    isLoading,
    error,
    refresh: fetchLeaderboard,
  }
}
