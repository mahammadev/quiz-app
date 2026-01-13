'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizList } from '@/components/teacher/quiz-list'

export default function TeacherDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        My Quizzes
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your quizzes and exam sessions
                    </p>
                </div>
                <Button asChild className="gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    <Link href="/teacher/create">
                        <Plus className="h-4 w-4" />
                        Create Quiz
                    </Link>
                </Button>
            </div>

            <QuizList />
        </div>
    )
}
