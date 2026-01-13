'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, GripVertical, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// Temporary type for local state
type BuilderQuestion = {
    id: string
    question: string
    answers: { id: string; text: string }[]
    correctAnswerId: string | null
}

export function QuizBuilder() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [quizTitle, setQuizTitle] = useState('')
    const [questions, setQuestions] = useState<BuilderQuestion[]>([
        {
            id: crypto.randomUUID(),
            question: '',
            answers: [
                { id: crypto.randomUUID(), text: '' },
                { id: crypto.randomUUID(), text: '' }
            ],
            correctAnswerId: null
        }
    ])

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: crypto.randomUUID(),
                question: '',
                answers: [
                    { id: crypto.randomUUID(), text: '' },
                    { id: crypto.randomUUID(), text: '' }
                ],
                correctAnswerId: null
            }
        ])
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const updateQuestionText = (id: string, text: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, question: text } : q))
    }

    const addAnswer = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q
            return {
                ...q,
                answers: [...q.answers, { id: crypto.randomUUID(), text: '' }]
            }
        }))
    }

    const removeAnswer = (qId: string, aId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q
            // Don't allow less than 2 answers
            if (q.answers.length <= 2) return q

            const newAnswers = q.answers.filter(a => a.id !== aId)
            // If we removed the correct answer, reset it
            const newCorrectId = q.correctAnswerId === aId ? null : q.correctAnswerId

            return { ...q, answers: newAnswers, correctAnswerId: newCorrectId }
        }))
    }

    const updateAnswerText = (qId: string, aId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q
            return {
                ...q,
                answers: q.answers.map(a => a.id === aId ? { ...a, text } : a)
            }
        }))
    }

    const setCorrectAnswer = (qId: string, aId: string) => {
        setQuestions(questions.map(q =>
            q.id === qId ? { ...q, correctAnswerId: aId } : q
        ))
    }

    const validateQuiz = () => {
        if (!quizTitle.trim()) return "Quiz title is required"
        if (questions.length === 0) return "Add at least one question"

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            if (!q.question.trim()) return `Question ${i + 1} text is missing`
            if (q.answers.some(a => !a.text.trim())) return `Question ${i + 1} has empty answers`
            if (!q.correctAnswerId) return `Select a correct answer for Question ${i + 1}`
        }
        return null
    }

    const handleSave = async () => {
        const errorMsg = validateQuiz()
        if (errorMsg) {
            setError(errorMsg)
            return
        }
        setError(null)
        setIsSubmitting(true)

        try {
            // Transform to Schema format
            const formattedQuestions = questions.map(q => {
                const correctAnswerObj = q.answers.find(a => a.id === q.correctAnswerId)
                return {
                    question: q.question,
                    answers: q.answers.map(a => a.text),
                    correct_answer: correctAnswerObj ? correctAnswerObj.text : ''
                }
            })

            const supabase = createClient()

            // Get current user (mock/real)
            const { data: { user } } = await supabase.auth.getUser()

            const { error: insertError } = await supabase
                .from('quizzes')
                .insert({
                    name: quizTitle,
                    questions: formattedQuestions,
                    teacher_id: user?.id // Will be null if auth not set up, which is fine for now based on schema (optional) or RLS will fail
                })

            if (insertError) throw insertError

            router.push('/teacher')
        } catch (err: any) {
            console.error('Save failed:', err)
            setError(err.message || "Failed to save quiz")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 pb-20">
            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <Label htmlFor="title" className="text-lg font-semibold">Quiz Title</Label>
                </CardHeader>
                <CardContent>
                    <Input
                        id="title"
                        placeholder="e.g., Computer Science Midterm 2024"
                        className="text-lg py-6"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions.map((q, index) => (
                    <Card key={q.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-muted-foreground">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <Label className="sr-only">Question Text</Label>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => removeQuestion(q.id)}
                                disabled={questions.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Textarea
                                placeholder="Enter your question here..."
                                className="resize-none min-h-[80px] text-base"
                                value={q.question}
                                onChange={(e) => updateQuestionText(q.id, e.target.value)}
                            />

                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Answer Options</Label>
                                <RadioGroup
                                    value={q.correctAnswerId || ''}
                                    onValueChange={(val) => setCorrectAnswer(q.id, val)}
                                    className="space-y-2"
                                >
                                    {q.answers.map((a) => (
                                        <div key={a.id} className="flex items-center gap-3">
                                            <RadioGroupItem value={a.id} id={`q${q.id}-a${a.id}`} />
                                            <Input
                                                value={a.text}
                                                onChange={(e) => updateAnswerText(q.id, a.id, e.target.value)}
                                                placeholder={`Option ${q.answers.indexOf(a) + 1}`}
                                                className={cn(
                                                    "flex-1 transition-all",
                                                    q.correctAnswerId === a.id && "border-primary ring-1 ring-primary/20 bg-primary/5"
                                                )}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeAnswer(q.id, a.id)}
                                                disabled={q.answers.length <= 2}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addAnswer(q.id)}
                                    className="mt-2"
                                >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Add Option
                                </Button>
                            </div>
                        </CardContent>
                        {q.correctAnswerId === null && (
                            <CardFooter className="py-3 bg-destructive/10 text-destructive text-sm flex items-center gap-2 rounded-b-xl">
                                <AlertCircle className="h-4 w-4" />
                                Please select the correct answer
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>

            <div className="flex justify-center py-4">
                <Button onClick={addQuestion} variant="secondary" className="gap-2 w-full max-w-xs shadow-sm">
                    <Plus className="h-4 w-4" />
                    Add New Question
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50">
                <div className="max-w-4xl mx-auto flex justify-end gap-4">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSubmitting} className="min-w-[150px] shadow-lg">
                        {isSubmitting ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Quiz
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
