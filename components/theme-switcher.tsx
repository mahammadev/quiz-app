'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Type } from 'lucide-react'

export type FontFamily = 'poppins' | 'inter' | 'times'

const FONTS: { id: FontFamily; name: string; className: string }[] = [
  { id: 'poppins', name: 'Poppins', className: 'font-poppins' },
  { id: 'inter', name: 'Inter', className: 'font-inter' },
  { id: 'times', name: 'Times', className: 'font-times' },
]

export default function ThemeSwitcher({
  className,
}: {
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [currentFont, setCurrentFont] = useState<FontFamily>('poppins')
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false)

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

      // Font
      const savedFont = localStorage.getItem('quiz-font') as FontFamily
      if (savedFont && FONTS.find(f => f.id === savedFont)) {
        setCurrentFont(savedFont)
        applyFont(savedFont)
      } else {
        applyFont('poppins')
      }
    } catch (error) {
      // Use defaults if localStorage fails
      console.warn('Failed to load theme settings:', error)
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
      setCurrentFont('poppins')
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

  const applyFont = (fontId: FontFamily) => {
    const root = document.documentElement
    FONTS.forEach(f => root.classList.remove(f.className))
    const font = FONTS.find(f => f.id === fontId)
    if (font) {
      root.classList.add(font.className)
    }
    try {
      localStorage.setItem('quiz-font', fontId)
    } catch (error) {
      console.warn('Failed to save font preference:', error)
    }
  }

  const handleDarkToggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    applyTheme(newDark)
  }

  const handleFontChange = (fontId: FontFamily) => {
    setCurrentFont(fontId)
    applyFont(fontId)
    setIsFontMenuOpen(false)
  }

  if (!mounted) return null

  const currentFontObj = FONTS.find(f => f.id === currentFont)

  return (
    <div className={`flex items-center gap-1 sm:gap-2 rounded-lg border border-border bg-card p-1.5 sm:p-2 shadow-sm ${className || ''}`}>
      {/* Font Selector */}
      <div className="relative">
        <button
          onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
          className="cursor-target flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 text-foreground hover:bg-muted transition-colors text-sm font-medium"
          title="Change font"
          aria-label="Change font"
        >
          <Type className="h-4 w-4" />
          <span className="hidden xs:inline text-xs sm:text-sm">{currentFontObj?.name}</span>
        </button>

        {isFontMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsFontMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 min-w-[120px] sm:min-w-[140px] rounded-lg border border-border bg-card p-1 shadow-lg">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange(font.id)}
                  className={`cursor-target w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${currentFont === font.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground'
                    }`}
                  style={{ fontFamily: font.id === 'poppins' ? 'Poppins' : font.id === 'inter' ? 'Inter' : 'Times New Roman' }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border" />

      {/* Theme Toggle */}
      <button
        onClick={handleDarkToggle}
        className="cursor-target flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
        title={isDark ? 'Light mode' : 'Dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>
    </div>
  )
}
