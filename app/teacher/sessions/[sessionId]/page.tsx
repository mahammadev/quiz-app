'use client'

import { SessionMonitor } from '@/components/teacher/session-monitor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SessionPage({ params }: { params: { sessionId: string } }) {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/teacher">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <SessionMonitor sessionId={params.sessionId} />
        </div>
    )
}
