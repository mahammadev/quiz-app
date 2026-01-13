'use client'

import { QuizBuilder } from '@/components/teacher/quiz-builder'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateQuizPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/teacher">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Create New Quiz</h1>
                <p className="text-muted-foreground">
                    Build a quiz by adding questions and answers below.
                </p>
            </div>

            <QuizBuilder />
        </div>
    )
}
