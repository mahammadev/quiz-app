'use client'

import { useState, useEffect, useRef } from 'react'

interface QuestionSliderProps {
    totalQuestions: number
    currentQuestionIndex: number
    onQuestionSelect: (index: number) => void
}

export function QuestionSlider({
    totalQuestions,
    currentQuestionIndex,
    onQuestionSelect
}: QuestionSliderProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Define the safe area margin (in pixels) to avoid rounded corners
    const VERTICAL_MARGIN = 24

    const handleInteraction = (clientY: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()

        // Adjust for the margin
        const relativeY = clientY - rect.top - VERTICAL_MARGIN
        const effectiveHeight = rect.height - (VERTICAL_MARGIN * 2)

        if (effectiveHeight <= 0) return

        const percentage = Math.max(0, Math.min(1, relativeY / effectiveHeight))

        // Map percentage to question index
        // We want the "click zones" to be distributed evenly
        const index = Math.round(percentage * (totalQuestions - 1))

        // Ensure within bounds
        const clampedIndex = Math.max(0, Math.min(totalQuestions - 1, index))

        onQuestionSelect(clampedIndex)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        handleInteraction(e.clientY)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault()
                handleInteraction(e.clientY)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, totalQuestions, onQuestionSelect])

    // Calculate position percentage
    const getPositionPercent = (index: number) => {
        if (totalQuestions <= 1) return 0
        return (index / (totalQuestions - 1)) * 100
    }

    const indicatorTop = getPositionPercent(currentQuestionIndex)

    return (
        <div
            ref={containerRef}
            className={`fixed right-0 top-1/2 -translate-y-1/2 h-[70vh] z-50 transition-all duration-300 ease-in-out flex flex-col items-end justify-center select-none ${isHovered || isDragging ? 'w-16 opacity-100' : 'w-6 opacity-60 hover:opacity-100'
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={handleMouseDown}
            style={{ cursor: 'pointer' }}
        >
            {/* Background bar */}
            <div className={`absolute right-0 top-0 bottom-0 bg-muted/80 backdrop-blur-sm border-l border-border rounded-l-xl transition-all duration-300 overflow-hidden ${isHovered || isDragging ? 'w-full shadow-xl' : 'w-1.5'
                }`}>
                {/* Track Container */}
                <div
                    className="absolute inset-x-0"
                    style={{ top: `${VERTICAL_MARGIN}px`, bottom: `${VERTICAL_MARGIN}px` }}
                >
                    {/* Visual lines for questions - only visible when expanded */}
                    <div className={`absolute inset-0 transition-opacity duration-200 ${isHovered || isDragging ? 'opacity-100' : 'opacity-0'
                        }`}>
                        {Array.from({ length: totalQuestions }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`absolute left-2 right-2 h-0.5 rounded-full transition-colors ${idx === currentQuestionIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                                    }`}
                                style={{
                                    top: `${getPositionPercent(idx)}%`,
                                    transform: 'translateY(-50%)'
                                }}
                            />
                        ))}
                    </div>

                    {/* Current position indicator */}
                    <div
                        className="absolute right-0 w-full pointer-events-none transition-all duration-100"
                        style={{
                            top: `${indicatorTop}%`,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        <div className={`bg-foreground rounded-l-full transition-all duration-300 shadow-sm ${isHovered || isDragging ? 'h-1 w-full' : 'h-8 w-1.5'
                            }`} />
                    </div>
                </div>
            </div>
        </div>
    )
}
