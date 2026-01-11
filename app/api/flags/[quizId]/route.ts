import { NextResponse } from 'next/server'
import { z } from 'zod'
import { flagQuestion, getFlaggedQuestions, getAllFlags, updateFlag, deleteFlag } from '../../../../lib/db'
import { createClient } from '../../../../lib/supabase/server'
import { isAdminUser } from '../../../../lib/auth'

const flagSchema = z.object({
    question: z.string().min(1),
    reason: z.string().min(1),
})

const patchSchema = z.object({
    id: z.string().min(1),
    reason: z.string().min(1),
})

function getQuizId(request: Request, params?: { quizId?: string }) {
    const url = new URL(request.url)
    return (
        params?.quizId ||
        url.searchParams.get('quizId') ||
        url.pathname.split('/').filter(Boolean).pop()
    )
}

async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdminUser(user)) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    return { supabase }
}

export async function GET(request: Request, props: { params: Promise<{ quizId?: string }> }) {
    const params = await props.params
    const quizId = getQuizId(request, params)

    if (!quizId) {
        return NextResponse.json({ error: 'Missing quiz id' }, { status: 400 })
    }

    try {
        if (quizId === 'all') {
            const adminCheck = await requireAdmin()
            if (adminCheck.error) {
                return adminCheck.error
            }
            const flags = await getAllFlags(adminCheck.supabase)
            return NextResponse.json({ flags })
        }

        const flags = await getFlaggedQuestions(quizId)
        return NextResponse.json({ flags })
    } catch (error) {
        console.error('Failed to fetch flags', error)
        return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 })
    }
}

export async function POST(request: Request, props: { params: Promise<{ quizId?: string }> }) {
    const params = await props.params
    const quizId = getQuizId(request, params)

    if (!quizId) {
        return NextResponse.json({ error: 'Missing quiz id' }, { status: 400 })
    }

    try {
        const json = await request.json()
        const parsed = flagSchema.safeParse(json)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
        }

        const { question, reason } = parsed.data
        const flag = await flagQuestion(quizId, question, reason)

        return NextResponse.json({ flag })
    } catch (error) {
        console.error('Failed to save flag', error)
        return NextResponse.json({ error: 'Failed to save flag' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
        return adminCheck.error
    }

    try {
        const json = await request.json()
        const parsed = patchSchema.safeParse(json)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
        }

        const { id, reason } = parsed.data
        const flag = await updateFlag(id, reason, adminCheck.supabase)

        return NextResponse.json({ flag })
    } catch (error: any) {
        console.error('Failed to update flag:', error)
        return NextResponse.json({
            error: error.message || 'Failed to update flag',
            details: error
        }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
        return adminCheck.error
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Missing flag id' }, { status: 400 })
    }

    try {
        await deleteFlag(id, adminCheck.supabase)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Failed to delete flag:', error)
        return NextResponse.json({
            error: error.message || 'Failed to delete flag',
            details: error
        }, { status: 500 })
    }
}
