import { NextResponse } from 'next/server'
import { z } from 'zod'
import { upvoteFlag } from '../../../../lib/db'

import { UpvoteFlagSchema } from '../../../../lib/schema'

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const parsed = UpvoteFlagSchema.safeParse(json)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
        }

        const { flagId } = parsed.data
        const flag = await upvoteFlag(flagId)

        return NextResponse.json({ flag })
    } catch (error) {
        console.error('Failed to upvote flag', error)
        return NextResponse.json({ error: 'Failed to upvote flag' }, { status: 500 })
    }
}
