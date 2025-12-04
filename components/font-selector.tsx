'use client'

import { useEffect, useState } from 'react'
import { Type } from 'lucide-react'

export type FontFamily = 'poppins' | 'inter' | 'times'

const FONTS: { id: FontFamily; name: string; className: string }[] = [
    { id: 'poppins', name: 'Poppins', className: 'font-poppins' },
    { id: 'inter', name: 'Inter', className: 'font-inter' },
    { id: 'times', name: 'Times', className: 'font-times' },
]

export default function FontSelector({
    className,
}: {
    className?: string
}) {
    const [mounted, setMounted] = useState(false)
    const [currentFont, setCurrentFont] = useState<FontFamily>('poppins')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedFont = localStorage.getItem('quiz-font') as FontFamily
        if (savedFont && FONTS.find(f => f.id === savedFont)) {
            setCurrentFont(savedFont)
            applyFont(savedFont)
        } else {
            applyFont('poppins')
        }
    }, [])

    const applyFont = (fontId: FontFamily) => {
        const root = document.documentElement
        // Remove all font classes
        FONTS.forEach(f => root.classList.remove(f.className))
        // Add the selected font class
        const font = FONTS.find(f => f.id === fontId)
        if (font) {
            root.classList.add(font.className)
        }
        localStorage.setItem('quiz-font', fontId)
    }

    const handleFontChange = (fontId: FontFamily) => {
        setCurrentFont(fontId)
        applyFont(fontId)
        setIsOpen(false)
    }

    if (!mounted) return null

    const currentFontObj = FONTS.find(f => f.id === currentFont)

    return (
        <div className={`relative ${className || ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-target flex h-9 items-center gap-2 rounded-lg px-3 text-foreground hover:bg-muted transition-colors text-sm font-medium"
                title="Change font"
                aria-label="Change font"
            >
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">{currentFontObj?.name}</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-lg border border-border bg-card p-1 shadow-lg">
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
    )
}
