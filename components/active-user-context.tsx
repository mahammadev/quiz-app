'use client'

import React, { createContext, useContext, useState } from 'react'

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

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
    const [onlineUsers] = useState<ActiveUser[]>([])
    const [isLoading] = useState(false)
    const [username, setUsername] = useState('')

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
