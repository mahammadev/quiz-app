'use client'

import { useEffect, useState } from 'react'
import { useActiveUsers } from './active-user-context'
import { Users } from 'lucide-react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

export function ActiveUsers({ language, playerName }: { language: Language, playerName: string }) {
    const { onlineUsers, isLoading, setPlayerName } = useActiveUsers()
    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    // Sync local player name with global context
    useEffect(() => {
        setPlayerName(playerName)
    }, [playerName, setPlayerName])

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
                <div className="flex flex-wrap gap-2">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-6 w-24 rounded-full" />
                        ))
                    ) : onlineUsers.length > 0 ? (
                        onlineUsers.map((user) => (
                            <Badge key={user.id} variant="secondary" className="font-normal px-2 py-1">
                                <span className="w-2 h-2 rounded-full bg-success mr-2 inline-block animate-pulse" />
                                {user.name}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground italic">No users online</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
