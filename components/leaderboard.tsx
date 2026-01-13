'use client'

import { useMemo } from 'react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Skeleton } from './ui/skeleton'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { RotateCw } from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

function safelyFormatDate(dateStr: string | number | Date, formatStr: string) {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return format(date, formatStr)
  } catch (e) {
    return 'Invalid Date'
  }
}

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

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function Leaderboard({ quizId, playerName, language, refreshKey = 0 }: LeaderboardProps) {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, {
    quizId: quizId || 'global',
    limit: 50,
  })
  const personalBest = useQuery(api.leaderboard.getPersonalBest, {
    quizId: quizId || 'global',
    name: playerName || '',
  })

  const isLoading = leaderboard === undefined
  const hasEntries = (leaderboard?.length ?? 0) > 0
  const highlightNames = useMemo(() => playerName?.toLowerCase(), [playerName])
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

  const refresh = () => {
    // Convex queries are live, no need for manual refresh usually
  }

  const total = leaderboard?.length ?? 0

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">{quizId === 'global' ? 'Global Leaderboard' : t('leaderboard.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('leaderboard.subtitle')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={isLoading || !quizId} aria-label="Refresh leaderboard">
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {/* {error && (
          <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )} */}

        {!quizId && <p className="text-sm text-muted-foreground">{t('leaderboard.noQuiz')}</p>}

        {quizId && isLoading && !hasEntries && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
          </div>
        )}

        {quizId && !isLoading && !hasEntries && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {t('leaderboard.empty')}
          </div>
        )}

        {quizId && hasEntries && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sm:w-16">{t('leaderboard.columns.rank')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('leaderboard.columns.name')}</TableHead>
                    <TableHead className="text-right w-16 sm:w-20">{t('leaderboard.columns.score')}</TableHead>
                    <TableHead className="text-right w-16 sm:w-20">{t('leaderboard.columns.time')}</TableHead>
                    <TableHead className="text-right hidden md:table-cell">{t('leaderboard.columns.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard?.map((entry: any, index: number) => {
                    const isYou = highlightNames && entry.name.toLowerCase() === highlightNames
                    return (
                      <TableRow key={entry._id} className={isYou ? 'bg-primary/5' : undefined}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{entry.name}</span>
                            {isYou && <Badge variant="secondary" className="shrink-0">{t('leaderboard.you')}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap">{entry.score}</TableCell>
                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">{formatDuration(entry.duration)}</TableCell>
                        <TableCell className="text-right text-muted-foreground hidden md:table-cell whitespace-nowrap">
                          {safelyFormatDate(entry._creationTime, 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {total > leaderboard.length && (
              <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                {t('leaderboard.showing', { shown: leaderboard.length, total })}
              </div>
            )}
          </div>
        )}

        {personalBest && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 sm:px-4 py-3 text-sm text-foreground">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold">{t('leaderboard.personal')}</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <span className="whitespace-nowrap">Score: {personalBest.score}</span>
                <span className="whitespace-nowrap">Time: {formatDuration(personalBest.duration)}</span>
                <span className="whitespace-nowrap">Date: {safelyFormatDate(personalBest.createdAt, 'PP')}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
