'use client'

import { SessionConfig } from '@/components/teacher/session-config'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ActivateSessionPage({ params }: { params: { quizId: string } }) {
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

            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Activate Exam Session</h1>
                <p className="text-muted-foreground">
                    Set up your exam parameters and generate a code for your students.
                </p>
            </div>

            <SessionConfig quizId={params.quizId} />
        </div>
    )
}
