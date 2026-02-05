'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type FontFamily = 'montserrat' | 'inter' | 'times'

const FONTS: { id: FontFamily; name: string; className: string }[] = [
  { id: 'montserrat', name: 'Montserrat', className: 'font-montserrat' },
  { id: 'inter', name: 'Inter', className: 'font-inter' },
  { id: 'times', name: 'Times', className: 'font-times' },
]

import { Language } from '@/lib/translations'

export default function ThemeSwitcher({
  className,
  language,
  onLanguageChange
}: {
  className?: string
  language?: Language
  onLanguageChange?: (lang: Language) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Theme
    try {
      const prefersDark =
        localStorage.getItem('quiz-dark') === 'true' ||
        (typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches &&
          !localStorage.getItem('quiz-dark'))

      setIsDark(prefersDark)
      applyTheme(prefersDark)

      // Enforce Montserrat
      document.documentElement.classList.add('font-montserrat')
    } catch (error) {
      console.warn('Failed to load theme settings:', error)
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      document.documentElement.classList.add('font-montserrat')
    }
  }, [])

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('quiz-dark', String(dark))
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  const handleDarkToggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    applyTheme(newDark)
  }

  if (!mounted) return null

  return (
    <div className={`flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-card p-1 shadow-sm ${className || ''}`}>
      {language && onLanguageChange && (
        <div className="flex items-center bg-muted/50 rounded-md p-1 mr-1">
          {(['az', 'en', 'ru'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === lang ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <Button
        onClick={handleDarkToggle}
        variant="ghost"
        size="icon"
        className="cursor-target h-8 w-8 sm:h-9 sm:w-9"
        title={isDark ? 'Light mode' : 'Dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>
    </div>
  )
}
