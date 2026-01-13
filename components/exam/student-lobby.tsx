'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function StudentLobby() {
    const [pin, setPin] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'checking' | 'joining'>('idle')
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pin.length < 6) return

        setIsLoading(true)
        setError(null)
        setStatus('checking')

        try {
            // 1. Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                // For MVP, if not logged in, redirect to login with return URL
                // In a real app we might allow anonymous names for "guest" quizzes, 
                // but the Master Plan says "Real names required" (Auth).
                router.push(`/login?returnUrl=/exam/join&pin=${pin}`)
                return
            }

            // 2. Find the session
            const { data: session, error: sessionError } = await supabase
                .from('exam_sessions')
                .select('id, status, quiz_id')
                .eq('access_code', pin.toUpperCase())
                .single()

            if (sessionError || !session) {
                throw new Error("Invalid Access Code. Please check and try again.")
            }

            if (session.status === 'ARCHIVED') {
                throw new Error("This exam session has ended.")
            }

            // 3. Join logic (Check for existing attempt or create new)
            setStatus('joining')

            const { data: existingAttempt } = await supabase
                .from('exam_attempts')
                .select('id')
                .eq('session_id', session.id)
                .eq('student_id', user.id)
                .single()

            if (!existingAttempt) {
                // Create new attempt
                const { error: joinError } = await supabase
                    .from('exam_attempts')
                    .insert({
                        session_id: session.id,
                        student_id: user.id,
                        status: 'STARTED',
                        answers_draft: {}
                    })

                if (joinError) throw joinError
            }

            // 4. Redirect to Exam Room
            // If PENDING, the Exam Room will show the "Waiting" state
            router.push(`/exam/${session.id}`)

        } catch (err: any) {
            console.error('Join error:', err)
            setError(err.message || "Failed to join session")
            setIsLoading(false)
            setStatus('idle')
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold">Join Exam</CardTitle>
                <CardDescription>
                    Enter the 6-character access code provided by your instructor.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                <Lock className="h-5 w-5" />
                            </div>
                            <Input
                                value={pin}
                                onChange={(e) => setPin(e.target.value.toUpperCase())}
                                placeholder="A4F2..."
                                className="pl-10 text-center text-2xl font-mono uppercase tracking-widest font-bold py-6"
                                maxLength={6}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="animate-in zoom-in-95">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-medium transition-all"
                        disabled={isLoading || pin.length < 4}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {status === 'checking' ? 'Verifying...' : 'Joining...'}
                            </>
                        ) : (
                            <>
                                Enter Exam <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground bg-muted/30 py-4">
                Ensure you have a stable internet connection.
            </CardFooter>
        </Card>
    )
}
