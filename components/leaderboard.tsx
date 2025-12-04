'use client'

import { useMemo } from 'react'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ArrowClockwise } from 'lucide-react'
import { format } from 'date-fns'

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type LeaderboardProps = {
  quizId?: string
  playerName?: string
  language: Language
  refreshKey?: number
}

export function Leaderboard({ quizId, playerName, language, refreshKey = 0 }: LeaderboardProps) {
  const { leaderboard, isLoading, error, personalBest, refresh, total } = useLeaderboard(quizId, playerName, refreshKey)

  const hasEntries = leaderboard.length > 0
  const highlightNames = useMemo(() => playerName?.toLowerCase(), [playerName])
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">{t('leaderboard.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('leaderboard.subtitle')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={isLoading || !quizId} aria-label="Refresh leaderboard">
          <ArrowClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {!quizId && <p className="text-sm text-muted-foreground">{t('leaderboard.noQuiz')}</p>}

        {quizId && isLoading && !hasEntries && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
          </div>
        )}

        {quizId && !isLoading && !hasEntries && !error && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {t('leaderboard.empty')}
          </div>
        )}

        {quizId && hasEntries && (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t('leaderboard.columns.rank')}</TableHead>
                  <TableHead>{t('leaderboard.columns.name')}</TableHead>
                  <TableHead className="text-right">{t('leaderboard.columns.score')}</TableHead>
                  <TableHead className="text-right">{t('leaderboard.columns.time')}</TableHead>
                  <TableHead className="text-right">{t('leaderboard.columns.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => {
                  const isYou = highlightNames && entry.name.toLowerCase() === highlightNames
                  return (
                    <TableRow key={entry.id} className={isYou ? 'bg-primary/5' : undefined}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <span>{entry.name}</span>
                        {isYou && <Badge variant="secondary">{t('leaderboard.you')}</Badge>}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatDuration(entry.duration)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {total > leaderboard.length && (
              <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                {t('leaderboard.showing', { shown: leaderboard.length, total })}
              </div>
            )}
          </div>
        )}

        {personalBest && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">{t('leaderboard.personal')}</span>
              <div className="flex flex-wrap gap-2 text-muted-foreground">
                <span>Score: {personalBest.score}</span>
                <span>Time: {formatDuration(personalBest.duration)}</span>
                <span>Date: {format(new Date(personalBest.createdAt), 'PP')}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
