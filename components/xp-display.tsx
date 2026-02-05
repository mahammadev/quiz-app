"use client"

import { Flame, Trophy, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function XPDisplay() {
    const stats = useQuery(api.userProgress.getUserStats)

    if (!stats) {
        return (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="w-20 h-4 rounded bg-muted" />
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex items-center gap-4">
                {/* Level Badge */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                                {stats.level}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Level {stats.level}</p>
                    </TooltipContent>
                </Tooltip>

                {/* XP Progress */}
                <div className="hidden sm:flex flex-col gap-1 min-w-[100px]">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            {stats.xp} XP
                        </span>
                        <span className="text-muted-foreground">
                            {stats.xpForNextLevel} XP
                        </span>
                    </div>
                    <Progress value={stats.xpProgress} className="h-1.5" />
                </div>

                {/* Streak */}
                {stats.streak > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                <Flame className="w-4 h-4" />
                                <span className="text-sm font-medium">{stats.streak}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{stats.streak} day streak! Keep it up!</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Badges count */}
                {stats.badges.length > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Trophy className="w-4 h-4" />
                                <span className="text-sm font-medium">{stats.badges.length}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{stats.badges.length} badges earned</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    )
}

// Compact version for mobile or smaller spaces
export function XPDisplayCompact() {
    const stats = useQuery(api.userProgress.getUserStats)

    if (!stats) return null

    return (
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                {stats.level}
            </div>
            {stats.streak > 0 && (
                <span className="flex items-center gap-1 text-orange-500 text-sm">
                    <Flame className="w-3.5 h-3.5" />
                    {stats.streak}
                </span>
            )}
        </div>
    )
}
