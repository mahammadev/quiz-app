'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

type ActiveUser = {
    id: string
    name: string
}

type ActiveUserContextType = {
    onlineUsers: ActiveUser[]
    isLoading: boolean
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser()
    const [visitorId, setVisitorId] = useState<string | null>(null)

    const updatePresence = useMutation(api.presence.update)
    const rawOnlineUsers = useQuery(api.presence.getOnlineUsers)

    const isLoading = rawOnlineUsers === undefined

    // Generate/Load visitor ID for guests
    useEffect(() => {
        let vid = localStorage.getItem('quiz-visitor-id')
        if (!vid) {
            vid = 'v-' + Math.random().toString(36).substring(2, 11)
            localStorage.setItem('quiz-visitor-id', vid)
        }
        setVisitorId(vid)
    }, [])

    const onlineUsers = useMemo(() => {
        return (rawOnlineUsers ?? []).map((u: any) => ({
            id: u._id,
            name: u.name
        }))
    }, [rawOnlineUsers])

    // Update presence every 20 seconds
    useEffect(() => {
        if (!visitorId) return

        const nameToUse = user?.fullName || user?.username || 'qonaq'

        const sendHeartbeat = () => {
            updatePresence({
                clerkId: user?.id || undefined,
                guestId: visitorId,
                name: nameToUse
            }).catch(console.error)
        }

        sendHeartbeat()
        const interval = setInterval(sendHeartbeat, 20000)
        return () => clearInterval(interval)
    }, [user, updatePresence, visitorId])

    return (
        <ActiveUserContext.Provider value={{
            onlineUsers,
            isLoading,
        }}>
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
