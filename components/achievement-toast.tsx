"use client"

import { useEffect, useState } from "react"
import { Trophy, Flame, Star, Sparkles, Zap, Target, Award } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Achievement {
    id: string
    type: "badge" | "level_up" | "xp" | "streak"
    title: string
    description: string
    icon?: string
}

interface AchievementToastProps {
    achievement: Achievement | null
    onDismiss: () => void
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
    first_quiz: <Star className="h-6 w-6" />,
    streak_7: <Flame className="h-6 w-6" />,
    streak_30: <Flame className="h-6 w-6" />,
    accuracy_100: <Target className="h-6 w-6" />,
    ai_early_adopter: <Sparkles className="h-6 w-6" />,
    level_5: <Trophy className="h-6 w-6" />,
    quizzes_10: <Award className="h-6 w-6" />,
    quizzes_50: <Award className="h-6 w-6" />,
}

const BADGE_COLORS: Record<string, string> = {
    first_quiz: "from-yellow-400 to-orange-500",
    streak_7: "from-orange-500 to-red-600",
    streak_30: "from-red-500 to-pink-600",
    accuracy_100: "from-green-400 to-emerald-600",
    ai_early_adopter: "from-purple-500 to-indigo-600",
    level_5: "from-blue-400 to-purple-600",
    quizzes_10: "from-cyan-400 to-blue-600",
    quizzes_50: "from-amber-400 to-yellow-600",
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onDismiss, 5000)
            return () => clearTimeout(timer)
        }
    }, [achievement, onDismiss])

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
                >
                    <div
                        onClick={onDismiss}
                        className={`
                            cursor-pointer rounded-2xl p-1 shadow-2xl
                            bg-gradient-to-r ${BADGE_COLORS[achievement.id] || "from-primary to-primary/80"}
                        `}
                    >
                        <div className="flex items-center gap-4 rounded-xl bg-background/95 backdrop-blur-sm px-6 py-4">
                            <motion.div
                                initial={{ rotate: -180, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className={`
                                    flex items-center justify-center w-14 h-14 rounded-full
                                    bg-gradient-to-br ${BADGE_COLORS[achievement.id] || "from-primary to-primary/80"}
                                    text-white shadow-lg
                                `}
                            >
                                {BADGE_ICONS[achievement.id] || <Trophy className="h-6 w-6" />}
                            </motion.div>

                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                >
                                    {achievement.type === "badge" && "🏆 New Badge!"}
                                    {achievement.type === "level_up" && "⬆️ Level Up!"}
                                    {achievement.type === "xp" && "✨ XP Earned!"}
                                    {achievement.type === "streak" && "🔥 Streak!"}
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg font-bold text-foreground"
                                >
                                    {achievement.title}
                                </motion.p>
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-sm text-muted-foreground"
                                >
                                    {achievement.description}
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Achievement queue manager hook
export function useAchievementQueue() {
    const [queue, setQueue] = useState<Achievement[]>([])
    const [current, setCurrent] = useState<Achievement | null>(null)

    useEffect(() => {
        if (!current && queue.length > 0) {
            setCurrent(queue[0])
            setQueue((prev) => prev.slice(1))
        }
    }, [current, queue])

    const addAchievement = (achievement: Achievement) => {
        setQueue((prev) => [...prev, achievement])
    }

    const addBadge = (badgeId: string, badgeName: string, description: string) => {
        addAchievement({
            id: badgeId,
            type: "badge",
            title: badgeName,
            description,
        })
    }

    const addLevelUp = (newLevel: number) => {
        addAchievement({
            id: `level_${newLevel}`,
            type: "level_up",
            title: `Level ${newLevel}`,
            description: "Keep up the great work!",
        })
    }

    const addXP = (amount: number) => {
        addAchievement({
            id: `xp_${Date.now()}`,
            type: "xp",
            title: `+${amount} XP`,
            description: "Experience gained!",
        })
    }

    const dismiss = () => setCurrent(null)

    return {
        current,
        addAchievement,
        addBadge,
        addLevelUp,
        addXP,
        dismiss,
    }
}

// Badge component for displaying earned badges
interface BadgeDisplayProps {
    badgeId: string
    size?: "sm" | "md" | "lg"
    showLabel?: boolean
}

const BADGE_NAMES: Record<string, string> = {
    first_quiz: "First Quiz",
    streak_7: "Week Warrior",
    streak_30: "Monthly Master",
    accuracy_100: "Perfectionist",
    ai_early_adopter: "AI Early Adopter",
    level_5: "Rising Star",
    quizzes_10: "Quiz Enthusiast",
    quizzes_50: "Quiz Master",
}

export function BadgeDisplay({ badgeId, size = "md", showLabel = false }: BadgeDisplayProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    }

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-7 w-7",
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className={`
                    ${sizeClasses[size]} rounded-full flex items-center justify-center
                    bg-gradient-to-br ${BADGE_COLORS[badgeId] || "from-gray-400 to-gray-600"}
                    text-white shadow-md
                `}
                title={BADGE_NAMES[badgeId]}
            >
                {BADGE_ICONS[badgeId] ? (
                    <span className={iconSizes[size]}>
                        {BADGE_ICONS[badgeId]}
                    </span>
                ) : (
                    <Trophy className={iconSizes[size]} />
                )}
            </div>
            {showLabel && (
                <span className="text-xs text-muted-foreground text-center">
                    {BADGE_NAMES[badgeId]}
                </span>
            )}
        </div>
    )
}
