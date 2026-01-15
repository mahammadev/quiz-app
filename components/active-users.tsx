'use client'

import { useMemo } from 'react'
import { useActiveUsers } from './active-user-context'
import { Users } from 'lucide-react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useUser } from '@clerk/nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

function getBrowserName(userAgent?: string) {
    if (!userAgent) return 'Unknown'
    if (userAgent.includes('Edg/')) return 'Edge'
    if (userAgent.includes('Chrome/')) return 'Chrome'
    if (userAgent.includes('Firefox/')) return 'Firefox'
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari'
    return 'Other'
}

function formatLastSeen(lastSeen?: number) {
    if (!lastSeen) return '-'
    const diff = Math.max(0, Date.now() - lastSeen)
    const seconds = Math.round(diff / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.round(minutes / 60)
    return `${hours}h`
}

export function ActiveUsers({ language }: { language: Language }) {
    const { onlineUsers, isLoading } = useActiveUsers()
    const { user } = useUser()
    const isAdmin = user?.publicMetadata?.role === 'admin'
    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    if (!isAdmin) {
        return null
    }

    const adminRows = useMemo(() => {
        return onlineUsers.map((user) => {
            const activity = user.activity || ''
            const [activityKey, activityDetail] = activity.split(':')
            const activityLabel = activityKey
                ? t(`activeUsers.activity.${activityKey}`)
                : '-'
            return {
                ...user,
                activityLabel,
                activityDetail,
                browser: getBrowserName(user.userAgent),
                lastSeen: formatLastSeen(user.lastSeen),
            }
        })
    }, [onlineUsers, t])

    return (
        <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg font-semibold">{t('activeUsers.title')}</CardTitle>
                </div>
                <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                    {onlineUsers.length} {t('activeUsers.online')}
                </Badge>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('activeUsers.columns.name')}</TableHead>
                                <TableHead>{t('activeUsers.columns.activity')}</TableHead>
                                <TableHead>{t('activeUsers.columns.page')}</TableHead>
                                <TableHead>{t('activeUsers.columns.browser')}</TableHead>
                                <TableHead>{t('activeUsers.columns.ip')}</TableHead>
                                <TableHead className="text-right">{t('activeUsers.columns.lastSeen')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : adminRows.length > 0 ? (
                                adminRows.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {user.activityLabel}
                                            {user.activityDetail ? (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {user.activityDetail}
                                                </span>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">{user.path || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap">{user.browser}</TableCell>
                                        <TableCell className="whitespace-nowrap">{user.ip || '-'}</TableCell>
                                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">{user.lastSeen}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-sm text-muted-foreground italic">
                                        {t('activeUsers.empty')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
