import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getLeaderboard, getPersonalBest, recordScore } from '../../../../lib/db'

const postSchema = z.object({
  name: z.string().trim().min(1).max(64),
  score: z.number().int().min(0),
  duration: z.number().int().min(0),
})

function getQuizId(request: Request, params?: { quizId?: string }) {
  const url = new URL(request.url)
  return (
    params?.quizId ||
    url.searchParams.get('quizId') ||
    url.searchParams.get('nxtPquizId') || // fallback for Next internal param
    url.pathname.split('/').filter(Boolean).pop()
  )
}

export async function GET(request: Request, { params }: { params: { quizId?: string } }) {
  const url = new URL(request.url)
  const rawLimit = Number(url.searchParams.get('limit'))
  const rawPage = Number(url.searchParams.get('page'))
  const limit = Math.max(1, Math.min(Number.isFinite(rawLimit) ? rawLimit : 10, 50))
  const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1)
  const name = url.searchParams.get('name') || undefined
  const quizId = getQuizId(request, params)

  if (!quizId) {
    return NextResponse.json({ error: 'Missing quiz id' }, { status: 400 })
  }

  try {
    const leaderboard = await getLeaderboard(quizId, limit, page)
    const personalBest = name ? await getPersonalBest(quizId, name) : null

    return NextResponse.json({
      leaderboard,
      personalBest,
    })
  } catch (error) {
    console.error('Failed to fetch leaderboard', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { quizId?: string } }) {
  const quizId = getQuizId(request, params)
  if (!quizId) {
    return NextResponse.json({ error: 'Missing quiz id' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  const payload = parsed.data

  try {
    const entry = await recordScore({
      quizId,
      name: payload.name,
      score: payload.score,
      duration: payload.duration,
    })

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Failed to save leaderboard entry', error)
    return NextResponse.json({ error: 'Failed to save leaderboard entry' }, { status: 500 })
  }
}
