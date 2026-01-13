'use client'

import { useState, useEffect } from 'react'
import { Copy, Users, Clock, PlayCircle, StopCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSessionStudents } from '@/hooks/use-session-students'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface SessionMonitorProps {
    sessionId: string
}

export function SessionMonitor({ sessionId }: SessionMonitorProps) {
    const [session, setSession] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const students = useSessionStudents(sessionId)
    const supabase = createClient()

    useEffect(() => {
        async function loadSession() {
            const { data, error } = await supabase
                .from('exam_sessions')
                .select(`
           *,
           quizzes ( name )
        `)
                .eq('id', sessionId)
                .single()

            if (data) setSession(data)
            setIsLoading(false)
        }
        loadSession()
    }, [sessionId])

    const updateStatus = async (status: 'ACTIVE' | 'ARCHIVED') => {
        await supabase.from('exam_sessions').update({ status }).eq('id', sessionId)
        setSession((prev: any) => ({ ...prev, status }))
    }

    if (isLoading) return <div>Loading session...</div>
    if (!session) return <div>Session not found</div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between gap-6 bg-card border rounded-xl p-6 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{session.quizzes?.name}</h1>
                        <Badge variant={session.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {session.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Started {formatDistanceToNow(new Date(session.created_at))} ago</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Access Code</div>
                        <div className="text-3xl font-mono font-bold tracking-widest text-primary">{session.access_code}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Controls */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Session Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {session.status === 'PENDING' && (
                            <Button className="w-full" onClick={() => updateStatus('ACTIVE')}>
                                <PlayCircle className="mr-2 h-4 w-4" /> Start Exam
                            </Button>
                        )}
                        {session.status === 'ACTIVE' && (
                            <Button variant="destructive" className="w-full" onClick={() => updateStatus('ARCHIVED')}>
                                <StopCircle className="mr-2 h-4 w-4" /> End Exam
                            </Button>
                        )}
                        {session.status === 'ARCHIVED' && (
                            <Button variant="outline" className="w-full" disabled>
                                Exam Ended
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Student Lobby */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Students ({students.length})
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Real-time list of students who have joined the exam.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {students.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                Waiting for students to join...
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {students.map(student => (
                                    <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {student.fullName.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{student.fullName}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Joined {formatDistanceToNow(student.joinedAt)} ago
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
