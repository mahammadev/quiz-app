'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeSwitcher({
  className,
}: {
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const prefersDark =
      localStorage.getItem('quiz-dark') === 'true' ||
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches &&
        !localStorage.getItem('quiz-dark'))

    setIsDark(prefersDark)
    applyTheme(prefersDark)
  }, [])

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('quiz-dark', String(dark))
  }

  const handleDarkToggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    applyTheme(newDark)
  }

  if (!mounted) return null

  return (
    <div className={`flex items-center gap-3 glass rounded-xl border border-border/30 p-2 shadow-lg ${className || ''}`}>
      <button
        onClick={handleDarkToggle}
        className="cursor-target flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-all hover:scale-110"
        title={isDark ? 'Light mode' : 'Dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </div>
  )
}
