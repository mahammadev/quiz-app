"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, RotateCcw, Award, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaderboard } from "@/components/leaderboard"
import { Language, getTranslation } from "@/lib/translations"
import { api } from "@/convex/_generated/api"
import { IncorrectAnswer } from "./quiz-display"

const MIN_QUIZ_DURATION_FOR_SCORE = 5 * 60 * 1000 // 5 minutes

interface QuizCompleteProps {
    score: number
    total: number
    incorrectAnswers: IncorrectAnswer[]
    onReset: () => void
    onRetryIncorrect: () => void
    language: Language
    quizId?: string
    durationMs: number
    showLeaderboard?: boolean
}

export function QuizComplete({
    score,
    total,
    incorrectAnswers,
    onReset,
    onRetryIncorrect,
    language,
    quizId,
    durationMs,
    showLeaderboard,
}: QuizCompleteProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [showMistakes, setShowMistakes] = useState(false)
    const recordScore = useMutation(api.leaderboard.recordScore)
    const recordMistakes = useMutation(api.mistakes.recordMistakes)
    const awardXP = useMutation(api.userProgress.awardXP)
    const { user } = useUser()

    const percentage = total ? Math.round((score / total) * 100) : 0
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    const durationText = getTranslation(language, "results.duration", { minutes, seconds })

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }, [])

    useEffect(() => {
        setHasSubmitted(false)
        setSubmitError(null)
        setRefreshKey((key) => key + 1)
    }, [quizId, score, durationMs])

    useEffect(() => {
        if (!quizId) return
        // Auto-submit if duration is long enough
        if (durationMs < MIN_QUIZ_DURATION_FOR_SCORE) return
        if (hasSubmitted || isSubmitting) return
        handleSubmitScore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, durationMs, hasSubmitted, isSubmitting])

    const handleSubmitScore = async () => {
        if (!quizId) {
            setSubmitError(getTranslation(language, "results.error"))
            return
        }
        if (hasSubmitted) return

        const playerName = user?.fullName || user?.username || getTranslation(language, "activeUsers.guest")
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            await recordScore({
                quizId,
                name: playerName,
                clerkId: user?.id,
                avatarUrl: user?.imageUrl,
                score,
                duration: Math.max(0, durationMs),
            })
            setHasSubmitted(true)
            setRefreshKey((key) => key + 1)

            if (user && incorrectAnswers.length > 0) {
                await recordMistakes({
                    quizId,
                    mistakes: incorrectAnswers.map((ia) => ({
                        questionId: ia.questionId,
                        question: typeof ia.question === "string" ? ia.question : JSON.stringify(ia.question),
                        answers: ia.allAnswers || [],
                        correctAnswer: typeof ia.correctAnswer === "string" ? ia.correctAnswer : JSON.stringify(ia.correctAnswer),
                    })),
                })
            }

            // Gamification: Award XP
            if (user) {
                await awardXP({
                    reason: "quiz_completed",
                    quizScore: percentage
                })
            }
        } catch (err) {
            console.error("Submit error:", err)
            setSubmitError(getTranslation(language, "results.error"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                    <Award className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold text-card-foreground mb-4">{getTranslation(language, "results.title")}</h1>
                <div className="mb-8">
                    <p className="text-7xl font-bold text-primary mb-2">{percentage}%</p>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <p className="text-xl">{getTranslation(language, "results.scored", { score, total })}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={onReset} size="lg" className="px-8 gap-2">
                        <RotateCcw className="w-4 h-4" />
                        {getTranslation(language, "results.resetBtn")}
                    </Button>
                    {incorrectAnswers.length > 0 && (
                        <Button variant="secondary" size="lg" onClick={onRetryIncorrect} className="px-8 gap-2">
                            <ChevronRight className="w-4 h-4" />
                            {getTranslation(language, "results.retryIncorrectBtn")}
                        </Button>
                    )}
                </div>
            </div>

            <div className={`grid gap-6 grid-cols-1 ${showLeaderboard ? "lg:grid-cols-2" : ""}`}>
                <Card className={!showLeaderboard ? "max-w-2xl mx-auto w-full" : "h-full"}>
                    <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">{getTranslation(language, "results.leaderboardTitle")}</CardTitle>
                            {hasSubmitted && (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 py-1">
                                    {getTranslation(language, "results.submitted")}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{getTranslation(language, "results.scoreSummary", { score, duration: durationText })}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{getTranslation(language, "results.nameLabel")}</p>
                            <p className="text-lg font-bold">{user?.fullName || user?.username || getTranslation(language, "activeUsers.guest")}</p>
                        </div>

                        {submitError && (
                            <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
                                <AlertDescription>{submitError}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {durationText}
                            </div>
                            {durationMs >= MIN_QUIZ_DURATION_FOR_SCORE && (
                                <div className="animate-pulse">
                                    {isSubmitting ? getTranslation(language, "results.submitting") : hasSubmitted ? getTranslation(language, "results.submitted") : ""}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {showLeaderboard && (
                    <div className="h-full min-h-[400px]">
                        <Leaderboard quizId={quizId} language={language} refreshKey={refreshKey} />
                    </div>
                )}
            </div>

            {incorrectAnswers.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-center">
                        <Button variant="outline" onClick={() => setShowMistakes(!showMistakes)} className="gap-2">
                            {showMistakes ? getTranslation(language, "results.hideMistakes") : getTranslation(language, "results.reviewBtn")}
                        </Button>
                    </div>

                    {showMistakes && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-border" />
                                <h2 className="text-xl font-bold">{getTranslation(language, "results.incorrectTitle")}</h2>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            <div className="grid gap-4">
                                {incorrectAnswers.map((item, index) => (
                                    <Card key={index} className="overflow-hidden border-border/50 hover:border-border transition-colors">
                                        <CardContent className="p-6 space-y-4">
                                            <h3 className="text-lg font-semibold leading-tight break-words">
                                                {typeof item.question === "string" ? item.question : JSON.stringify(item.question)}
                                            </h3>
                                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                                                    <span className="font-bold block text-[10px] uppercase tracking-widest mb-2 text-destructive">{getTranslation(language, "results.yourAnswer")}</span>
                                                    <span className="text-foreground font-medium break-words">{typeof item.userAnswer === "string" ? item.userAnswer : JSON.stringify(item.userAnswer)}</span>
                                                </div>
                                                <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                                                    <span className="font-bold block text-[10px] uppercase tracking-widest mb-2 text-success">{getTranslation(language, "results.correctAnswer")}</span>
                                                    <span className="text-foreground font-medium break-words">{typeof item.correctAnswer === "string" ? item.correctAnswer : JSON.stringify(item.correctAnswer)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            ) : (
                <Card className="border-success/20 bg-success/5 overflow-hidden">
                    <CardContent className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mb-4">
                            <Award className="w-8 h-8" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{getTranslation(language, "results.perfectScore")}</p>
                        <p className="text-muted-foreground mt-2">{getTranslation(language, "results.congrats")}</p>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    )
}
