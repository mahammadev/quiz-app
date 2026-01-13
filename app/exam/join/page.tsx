'use client'

import { StudentLobby } from '@/components/exam/student-lobby'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function JoinExamPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="p-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <StudentLobby />
            </main>
        </div>
    )
}
