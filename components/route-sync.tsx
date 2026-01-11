'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

function normalizePath(path: string) {
  if (!path) return '/'
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

export default function RouteSync() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const actualPath = normalizePath(window.location.pathname)
    const currentPath = normalizePath(pathname || '/')

    if (actualPath !== currentPath) {
      const target = `${actualPath}${window.location.search}${window.location.hash}`
      router.replace(target)
    }
  }, [pathname, router])

  return null
}
