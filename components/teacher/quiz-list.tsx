'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Play, Pencil, Trash2, Calendar, MoreVertical, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

type Quiz = {
    id: string
    name: string
    created_at: string
    questions: any[]
    teacher_id?: string
}

export function QuizList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Error fetching quizzes:', error)
                    return
                }

                setQuizzes(data || [])
            } catch (err) {
                console.error('Failed to fetch quizzes:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuizzes()
    }, [])

    const handleStartSession = (quizId: string) => {
        router.push(`/teacher/activate/${quizId}`)
    }

    if (isLoading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-24 w-full rounded-md" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (quizzes.length === 0) {
        return (
            <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-xl">No quizzes yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            You haven't created any quizzes. Create your first one to get started.
                        </p>
                    </div>
                    <Button onClick={() => router.push('/teacher/create')}>
                        Create your first Quiz
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
                <Card key={quiz.id} className="group hover:border-primary/50 transition-colors duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                                <CardTitle className="line-clamp-1 text-lg" title={quiz.name}>
                                    {quiz.name}
                                </CardTitle>
                                <CardDescription>
                                    {new Date(quiz.created_at).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => console.log('Edit')}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md">
                                <span className="font-semibold text-foreground">{quiz.questions?.length || 0}</span>
                                <span>Questions</span>
                            </div>
                            {/* Future: Add 'Active Sessions' count here */}
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button
                            className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                            onClick={() => handleStartSession(quiz.id)}
                        >
                            <Play className="h-4 w-4 fill-current" />
                            Activate Session
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
