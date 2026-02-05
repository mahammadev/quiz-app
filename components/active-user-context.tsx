'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

// NOTE: Presence tracking simplified - removed admin-only online users list
// Will be re-implemented for School tier with org-scoped visibility

type ActiveUserContextType = {
    setActivity: (activity: string) => void
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const pathname = usePathname()
    const [activity, setActivity] = useState<string>('')
    const [ipAddress, setIpAddress] = useState<string | null>(null)

    const updatePresence = useMutation(api.presence.update)

    useEffect(() => {
        if (!pathname) return
        if (pathname !== '/') {
            setActivity(`page:${pathname}`)
            return
        }
        if (!activity || activity.startsWith('page:')) {
            setActivity(`page:${pathname}`)
        }
    }, [activity, pathname])

    useEffect(() => {
        if (!isLoaded || !user?.id) return
        let isMounted = true
        fetch('/api/ip', { credentials: 'include' })
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (isMounted && data?.ip) {
                    setIpAddress(data.ip)
                }
            })
            .catch(() => undefined)

        return () => {
            isMounted = false
        }
    }, [user, isLoaded])

    // Update presence every 20 seconds (for analytics, not for UI display)
    useEffect(() => {
        if (!user?.id) return

        const nameToUse = user?.fullName || user?.username || 'qonaq'
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined

        const sendHeartbeat = () => {
            updatePresence({
                clerkId: user?.id || undefined,
                name: nameToUse,
                activity,
                path: pathname,
                userAgent,
                ip: ipAddress || undefined,
            }).catch(console.error)
        }

        sendHeartbeat()
        const interval = setInterval(sendHeartbeat, 20000)
        return () => clearInterval(interval)
    }, [user, updatePresence, activity, pathname, ipAddress])

    return (
        <ActiveUserContext.Provider value={{ setActivity }}>
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
