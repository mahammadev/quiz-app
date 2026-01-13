'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Smartphone, AlertTriangle, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Question } from '@/lib/schema'

interface ExamRoomProps {
    sessionId: string
}

type ExamState = 'LOADING' | 'WAITING' | 'ACTIVE' | 'SUBMITTED' | 'ARCHIVED'

export function ExamRoom({ sessionId }: ExamRoomProps) {
    const [state, setState] = useState<ExamState>('LOADING')
    const [quizName, setQuizName] = useState('')
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Real-time tracking
    const sessionIdRef = useRef(sessionId)
    const answersRef = useRef(answers)

    const router = useRouter()
    const supabase = createClient()

    // 1. Initial Load
    useEffect(() => {
        async function loadExam() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                // Fetch Session + Quiz + Attempt
                const { data: session, error: sessError } = await supabase
                    .from('exam_sessions')
                    .select(`
            *,
            quizzes ( name, questions )
          `)
                    .eq('id', sessionId)
                    .single()

                if (sessError || !session) throw new Error("Session not found")

                setQuizName(session.quizzes.name)
                setQuestions(session.quizzes.questions as Question[])

                // Fetch Attempt to restore draft
                const { data: attempt } = await supabase
                    .from('exam_attempts')
                    .select('answers_draft, status')
                    .eq('session_id', sessionId)
                    .eq('student_id', user.id)
                    .single()

                if (attempt?.status === 'SUBMITTED') {
                    setState('SUBMITTED')
                    return
                }

                if (attempt?.answers_draft) {
                    setAnswers(attempt.answers_draft)
                    answersRef.current = attempt.answers_draft
                }

                if (session.status === 'PENDING') {
                    setState('WAITING')
                } else if (session.status === 'ACTIVE') {
                    setState('ACTIVE')
                } else {
                    setState('ARCHIVED')
                }

            } catch (err) {
                console.error("Failed to load exam", err)
            }
        }
        loadExam()

        // Realtime subscription for Session Status
        const channel = supabase.channel(`exam_room:${sessionId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'exam_sessions',
                filter: `id=eq.${sessionId}`
            }, (payload) => {
                const newStatus = payload.new.status
                if (newStatus === 'ACTIVE') setState('ACTIVE')
                if (newStatus === 'ARCHIVED') setState('ARCHIVED')
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sessionId, router])

    // 2. Heartbeat (Auto-save)
    useEffect(() => {
        if (state !== 'ACTIVE') return

        const intervalId = setInterval(async () => {
            const currentAnswers = answersRef.current // Use ref to get latest without dep cycle

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            await supabase
                .from('exam_attempts')
                .update({
                    answers_draft: currentAnswers,
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', sessionId)
                .eq('student_id', user.id)

            setLastSaved(new Date())
        }, 30000) // 30s

        return () => clearInterval(intervalId)
    }, [state, sessionId])

    // Helpers
    const handleSelectAnswer = (ans: string) => {
        const newAnswers = { ...answers, [currentQuestionIndex]: ans }
        setAnswers(newAnswers)
        answersRef.current = newAnswers
    }

    const handleSubmit = async () => {
        if (!confirm("Are you sure you want to finish the exam?")) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Calculate score (Server-side ideally, but for MVP we submit draft and trigger grading or do check here)
        // Let's do simple grading here for MVP completeness, but secure would be backend function.
        let score = 0
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct_answer) score++
        })

        await supabase
            .from('exam_attempts')
            .update({
                status: 'SUBMITTED',
                final_score: score,
                submitted_at: new Date().toISOString(),
                answers_draft: answers
            })
            .eq('session_id', sessionId)
            .eq('student_id', user.id)

        setState('SUBMITTED')
    }

    // Views
    if (state === 'LOADING') {
        return <div className="flex items-center justify-center min-h-[50vh]">Loading exam content...</div>
    }

    if (state === 'WAITING') {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center animate-in zoom-in-95">
                <div className="bg-primary/10 p-6 rounded-full">
                    <Clock className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{quizName}</h1>
                    <p className="text-xl text-muted-foreground mt-2">Waiting for teacher to start...</p>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                    Do not refresh. The exam will start automatically.
                </p>
            </div>
        )
    }

    if (state === 'ARCHIVED') {
        return (
            <Card className="max-w-md mx-auto mt-10 border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center py-10 text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h2 className="text-xl font-bold">Exam Session Ended</h2>
                    <p>This exam has been closed by the instructor.</p>
                    <Button onClick={() => router.push('/')}>Return Home</Button>
                </CardContent>
            </Card>
        )
    }

    if (state === 'SUBMITTED') {
        return (
            <Card className="max-w-md mx-auto mt-10 border-success/50 bg-success/5">
                <CardContent className="flex flex-col items-center py-10 text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">Exam Submitted!</h2>
                    <p className="text-muted-foreground">Your answers have been recorded successfully.</p>
                    <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
                        Return Home
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Active Exam View
    const currentQ = questions[currentQuestionIndex]
    const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100)

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Top Bar */}
            <div className="flex items-center justify-between bg-card border rounded-lg p-4 shadow-sm sticky top-4 z-10">
                <div>
                    <h2 className="font-semibold">{quizName}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Smartphone className="h-3 w-3" />
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        {lastSaved && (
                            <span className="flex items-center gap-1 ml-2 text-green-600">
                                <Save className="h-3 w-3" /> Saved {lastSaved.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <Button size="sm" onClick={handleSubmit} variant="default">Finish Exam</Button>
                </div>
            </div>

            {/* Progress */}
            <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-2" />

            {/* Question Card */}
            <Card className="min-h-[400px] flex flex-col">
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="text-lg md:text-xl font-medium mb-8 leading-relaxed">
                        {currentQ.question}
                    </div>

                    <div className="space-y-3 flex-1">
                        {currentQ.answers.map((ans, idx) => {
                            const isSelected = answers[currentQuestionIndex] === ans
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectAnswer(ans)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-accent/50",
                                        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-muted bg-card"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                                        )}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-medium">{ans}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            {/* Optional: Add "Mark for Review" feature here later */}
                        </div>
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit}>Finish</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Question Navigator */}
            <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={cn(
                            "w-8 h-8 rounded-md text-sm font-medium transition-colors",
                            currentQuestionIndex === idx
                                ? "bg-primary text-primary-foreground"
                                : answers[idx]
                                    ? "bg-primary/20 text-primary-foreground border border-primary/30"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
        </div>
    )
}
