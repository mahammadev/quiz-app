'use client'

import { ExamRoom } from '@/components/exam/exam-room'

export default function ExamPage({ params }: { params: { sessionId: string } }) {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <ExamRoom sessionId={params.sessionId} />
        </div>
    )
}
