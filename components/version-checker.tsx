'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { APP_VERSION } from '@/lib/version'

export function VersionChecker() {
    // Store the version detected when this component first mounts (page load)
    const initialVersion = useRef(APP_VERSION)

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Fetch valid JSON or fail lightly
                const res = await fetch('/api/version', {
                    cache: 'no-store',
                    headers: { 'Pragma': 'no-cache' }
                })
                if (!res.ok) return

                const data = await res.json()
                const latestVersion = data.version

                // If server has a newer version than what we loaded with
                if (latestVersion && latestVersion !== initialVersion.current) {
                    toast.info('New version available!', {
                        description: 'Click here to update the application.',
                        action: {
                            label: 'Refresh',
                            onClick: () => window.location.reload()
                        },
                        duration: Infinity, // Stay until clicked
                        id: 'version-update-toast' // Prevent duplicates
                    })
                }
            } catch (error) {
                console.warn('Failed to check version', error)
            }
        }

        // Check immediately (mostly for dev/testing validation) and then every minute
        checkVersion()
        const interval = setInterval(checkVersion, 60 * 1000)

        // Also check when window regains focus
        const onFocus = () => checkVersion()
        window.addEventListener('focus', onFocus)

        return () => {
            clearInterval(interval)
            window.removeEventListener('focus', onFocus)
        }
    }, [])

    return null // Headless component
}
