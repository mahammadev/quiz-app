'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users } from 'lucide-react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type PresenceInfo = {
    name: string
    online_at: string
}

type PresenceState = {
    [key: string]: PresenceInfo[]
}

export function ActiveUsers({ language, playerName }: { language: Language, playerName: string }) {
    const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    useEffect(() => {
        const userId = Math.random().toString(36).substring(2, 11)
        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: userId,
                },
            },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState() as PresenceState

                // Get all users and sort them by online_at to have consistent guest numbering
                const allPresences = Object.entries(state)
                    .map(([id, presences]) => ({
                        id,
                        presence: presences[0]
                    }))
                    .filter(p => p.presence)
                    .sort((a, b) => {
                        const timeA = new Date(a.presence.online_at).getTime()
                        const timeB = new Date(b.presence.online_at).getTime()
                        return timeA - timeB
                    })

                let guestCount = 0
                const users = allPresences.map((p) => {
                    const name = p.presence.name
                    const isGuest = !name || name === 'Guest' || name === 'qonaq'

                    if (isGuest) {
                        guestCount++
                        return {
                            id: p.id,
                            name: `${t('activeUsers.guest')} ${guestCount}`
                        }
                    }

                    return {
                        id: p.id,
                        name: name
                    }
                })

                setOnlineUsers(users)
                setIsLoading(false)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        name: playerName || '',
                        online_at: new Date().toISOString(),
                    })
                }
            })

        // Re-track when playerName changes
        if (playerName) {
            channel.track({
                name: playerName,
                online_at: new Date().toISOString(),
            })
        }

        return () => {
            channel.unsubscribe()
        }
    }, [playerName, language])

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
