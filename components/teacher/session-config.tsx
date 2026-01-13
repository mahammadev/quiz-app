'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Lock, Play, RefreshCw, Copy } from 'lucide-react'
import { addMinutes, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'

function generateAccessCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Removed confusing chars: 0,1,I,O
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function SessionConfig({ quizId }: { quizId: string }) {
    const router = useRouter()
    const [accessCode, setAccessCode] = useState(generateAccessCode())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Configuration State
    const [durationMinutes, setDurationMinutes] = useState(60)
    const [isScheduled, setIsScheduled] = useState(false)

    // Default scheduled time (now + 5 mins)
    const [startTime, setStartTime] = useState(format(addMinutes(new Date(), 5), "yyyy-MM-dd'T'HH:mm"))

    const handleCreateSession = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("You must be logged in")
            }

            const calculatedStartTime = isScheduled ? new Date(startTime).toISOString() : new Date().toISOString()

            // Calculate endTime based on duration if set, otherwise optional
            // For now, let's just save start time. The quiz viewer will handle duration logic relative to start or student start.
            // Actually, per Master Plan: "start_time" and "end_time" usually define the WINDOW the exam is available.
            // Let's assume window-based access for now.

            const { data, error: insertError } = await supabase
                .from('exam_sessions')
                .insert({
                    quiz_id: quizId,
                    teacher_id: user.id,
                    access_code: accessCode,
                    status: isScheduled ? 'PENDING' : 'ACTIVE',
                    start_time: calculatedStartTime,
                    // end_time: calculatedEndTime // Optional, skipping for MVP simplicity
                })
                .select()
                .single()

            if (insertError) throw insertError

            if (data) {
                // Redirect to the new Session Monitor
                router.push(`/teacher/sessions/${data.id}`)
            }
        } catch (err: any) {
            console.error('Failed to create session:', err)
            setError(err.message || 'Failed to create session')
        } finally {
            setIsLoading(false)
        }
    }

    const refreshCode = () => setAccessCode(generateAccessCode())

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <Card>
                <CardHeader>
                    <CardTitle>Session Configuration</CardTitle>
                    <CardDescription>Configure how students will access this exam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Access Code (PIN)</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <Input
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    className="pl-9 text-2xl font-mono tracking-[0.5em] font-bold text-center uppercase"
                                    maxLength={6}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={refreshCode} title="Generate new code">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Share this 6-character code with your students.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="schedule-toggle" className="flex flex-col gap-1">
                                <span className="font-semibold">Schedule for Later</span>
                                <span className="font-normal text-sm text-muted-foreground">
                                    If off, the session starts immediately.
                                </span>
                            </Label>
                            <Switch
                                id="schedule-toggle"
                                checked={isScheduled}
                                onCheckedChange={setIsScheduled}
                            />
                        </div>

                        {isScheduled && (
                            <div className="pt-2 animate-in slide-in-from-top-2">
                                <Label>Start Time</Label>
                                <div className="flex gap-2 mt-1.5">
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Duration Limit</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                                className="w-24"
                                min={1}
                            />
                            <span className="text-muted-foreground">minutes</span>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-muted/20 py-4">
                    <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleCreateSession} disabled={isLoading} size="lg" className="min-w-[140px] shadow-md">
                        {isLoading ? "Starting..." : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                {isScheduled ? "Schedule Session" : "Start Live Session"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
