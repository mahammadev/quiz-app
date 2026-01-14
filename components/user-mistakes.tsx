'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { BookOpen, RefreshCw, Trash2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { Question } from '@/lib/schema'

type UserMistakesProps = {
    language: Language
    onRedo: (questions: Question[], quizId: string) => void
}

export function UserMistakes({ language, onRedo }: UserMistakesProps) {
    const { user } = useUser()
    const mistakes = useQuery(api.mistakes.getMistakes, user ? { clerkId: user.id } : "skip")
    const clearMistake = useMutation(api.mistakes.clearMistake)
    const allQuizzes = useQuery(api.quizzes.list)

    const isLoading = mistakes === undefined || allQuizzes === undefined
    const hasMistakes = (mistakes?.length ?? 0) > 0

    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    if (!user) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">{t('mistakes.signIn')}</p>
                </CardContent>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    if (!hasMistakes) {
        return (
            <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-medium text-foreground mb-2">{t('mistakes.noMistakes')}</p>
                    <p className="text-muted-foreground">{t('mistakes.noMistakesDesc')}</p>
                </CardContent>
            </Card>
        )
    }

    // Group mistakes by quizId
    const groupedMistakes = (mistakes ?? []).reduce((acc: Record<string, any[]>, mistake: any) => {
        if (!acc[mistake.quizId]) {
            acc[mistake.quizId] = []
        }
        acc[mistake.quizId].push(mistake)
        return acc
    }, {} as Record<string, any[]>)

    const handleRedoQuiz = (quizId: string) => {
        const quizMistakes = groupedMistakes[quizId]
        const questionsToRedo: Question[] = (quizMistakes || []).map((m: any) => ({
            question: m.question,
            answers: m.answers,
            correct_answer: m.correctAnswer
        }))
        onRedo(questionsToRedo, quizId)
    }

    const handleClearMistake = async (quizId: string, question: string) => {
        await clearMistake({ clerkId: user.id, quizId, question })
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedMistakes).map(([quizId, quizMistakes]) => {
                const quizName = allQuizzes?.find(q => q._id === quizId)?.name || 'Unknown Quiz'

                return (
                    <Card key={quizId} className="overflow-hidden border-border bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/30 py-4 px-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-lg font-semibold">{quizName}</CardTitle>
                                <Badge variant="secondary">{t('mistakes.count', { count: quizMistakes.length })}</Badge>
                            </div>
                            <Button size="sm" onClick={() => handleRedoQuiz(quizId)} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                {t('mistakes.redo')}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {quizMistakes.map((mistake: any, idx: number) => (
                                    <div key={idx} className="p-4 sm:p-6 hover:bg-muted/10 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-3 flex-1">
                                                <p className="text-foreground font-medium">{mistake.question}</p>
                                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                                    <div className="text-xs p-2 rounded bg-success/10 border border-success/20">
                                                        <span className="block font-bold text-success uppercase mb-1">{t('mistakes.correctAnswer')}</span>
                                                        <span className="text-foreground">{mistake.correctAnswer}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => handleClearMistake(quizId, mistake.question)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
