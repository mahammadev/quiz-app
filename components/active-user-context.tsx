'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Language, getTranslation } from '@/lib/translations'

const supabase = createClient()

type PresenceInfo = {
    name: string
    online_at: string
}

type PresenceState = {
    [key: string]: PresenceInfo[]
}

type ActiveUser = {
    id: string
    name: string
}

type ActiveUserContextType = {
    onlineUsers: ActiveUser[]
    isLoading: boolean
    setPlayerName: (name: string) => void
    username: string
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children, language = 'az' }: { children: React.ReactNode, language?: Language }) {
    const [onlineUsers, setOnlineUsers] = useState<ActiveUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [username, setUsername] = useState('')

    // We need t function here or just hardcode specific strings/pass translations? 
    // The original component used `t` for "Guest". 
    // Let's implement a mini-t or rely on the fact that "Guest" is processed here.
    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    useEffect(() => {
        let userId = sessionStorage.getItem('quiz_user_id')
        if (!userId) {
            userId = Math.random().toString(36).substring(2, 11)
            sessionStorage.setItem('quiz_user_id', userId)
        }

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
                    const isGuest = !name || name === 'Guest' || name === 'qonaq' // Handle basic guest checks

                    if (isGuest) {
                        guestCount++
                        // We use a generic "Guest" string or rely on the downstream component to format?
                        // If we format here, we need the translation.
                        // Let's format here to keep the list consistent.
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
                        name: username || '',
                        online_at: new Date().toISOString(),
                    })
                }
            })

        // Re-track when username changes
        if (username !== undefined) {
            // We only track if we are connected, but channel.track handles that check usually?
            // actually verify if channel joined.
            // The previous code had a separate check. 
            // Ideally we just call track again.
            channel.track({
                name: username,
                online_at: new Date().toISOString(),
            })
        }

        return () => {
            channel.unsubscribe()
        }
    }, [username, language])

    return (
        <ActiveUserContext.Provider value={{ onlineUsers, isLoading, setPlayerName: setUsername, username }}>
            {children}
        </ActiveUserContext.Provider>
    )
}

export function useActiveUsers() {
    const context = useContext(ActiveUserContext)
    if (context === undefined) {
        throw new Error('useActiveUsers must be used within an ActiveUserProvider')
    }
    return context
}
