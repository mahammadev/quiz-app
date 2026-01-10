import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

export type LeaderboardEntry = {
  id: string
  quizId: string
  name: string
  score: number
  duration: number
  createdAt: string
}

export type FlaggedQuestion = {
  id: string
  quizId: string
  question: string
  reason: string
  createdAt: string
}

type SupabaseClientLike = any

type QueryBuilder = {
  eq(column: string, value: string): QueryBuilder
  ilike(column: string, value: string): QueryBuilder
  order(column: string, options?: { ascending?: boolean }): QueryBuilder
  range(from: number, to: number): Promise<{ data: SupabaseRow[] | null; error: any; count: number | null }>
  limit(count: number): Promise<{ data: SupabaseRow[] | null; error: any; count: number | null }>
}

type SupabaseRow = {
  id: string
  quiz_id: string
  name: string
  score: number
  duration: number
  created_at: string
}

type FlaggedQuestionRow = {
  id: string
  quiz_id: string
  question: string
  reason: string
  created_at: string
}

let supabaseClient: SupabaseClientLike | null = null

const TABLE = 'leaderboard'
const FLAGS_TABLE = 'flagged_questions'

export function setSupabaseClient(client: SupabaseClientLike | null) {
  supabaseClient = client
}

function getSupabaseClient(): SupabaseClientLike {
  if (supabaseClient) return supabaseClient

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase URL and service key must be provided')
  }

  supabaseClient = createClient(url, serviceKey)
  return supabaseClient
}

function mapRow(row: SupabaseRow): LeaderboardEntry {
  return {
    id: row.id,
    quizId: row.quiz_id,
    name: row.name,
    score: row.score,
    duration: row.duration,
    createdAt: row.created_at,
  }
}

export async function recordScore(entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from(TABLE)
    .insert({
      quiz_id: entry.quizId,
      name: entry.name,
      score: entry.score,
      duration: entry.duration,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to store leaderboard entry')
  }

  return mapRow(data)
}

export async function getLeaderboard(quizId: string, limit = 10, page = 1) {
  const client = getSupabaseClient()
  const start = Math.max(0, (page - 1) * limit)
  const end = start + limit - 1

  let query = client
    .from(TABLE)
    .select('*', { count: 'exact' })

  if (quizId !== 'global') {
    query = query.eq('quiz_id', quizId)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('score', { ascending: false })
    .order('duration', { ascending: true })
    .range(start, end)

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch leaderboard')
  }

  return {
    total: count ?? data.length,
    items: data.map(mapRow),
  }
}

export async function getPersonalBest(quizId: string, name: string) {
  const client = getSupabaseClient()

  let query = client
    .from(TABLE)
    .select('*')

  if (quizId !== 'global') {
    query = query.eq('quiz_id', quizId)
  }

  const { data, error } = await query
    .ilike('name', name)
    .order('score', { ascending: false })
    .order('duration', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)

  if (error || !data?.length) {
    if (error) throw new Error(error.message)
    return null
  }

  return mapRow(data[0])
}

export async function clearLeaderboard() {
  const client = getSupabaseClient()
  const { error } = await client.from(TABLE).delete().neq('quiz_id', '')
  if (error) {
    throw new Error(error.message)
  }
}

export async function flagQuestion(quizId: string, question: string, reason: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from(FLAGS_TABLE)
    .insert({
      quiz_id: quizId,
      question,
      reason,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to flag question')
  }

  return {
    id: data.id,
    quizId: data.quiz_id,
    question: data.question,
    reason: data.reason,
    createdAt: data.created_at,
  }
}

export async function getFlaggedQuestions(quizId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from(FLAGS_TABLE)
    .select('*')
    .eq('quiz_id', quizId)

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch flags')
  }

  return data.map((row: FlaggedQuestionRow) => ({
    id: row.id,
    quizId: row.quiz_id,
    question: row.question,
    reason: row.reason,
    createdAt: row.created_at,
  }))
}

export async function getAllFlags() {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from(FLAGS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    throw new Error(error?.message || 'Failed to fetch all flags')
  }

  return data.map((row: FlaggedQuestionRow) => ({
    id: row.id,
    quizId: row.quiz_id,
    question: row.question,
    reason: row.reason,
    createdAt: row.created_at,
  }))
}

export async function updateFlag(id: string, reason: string) {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from(FLAGS_TABLE)
    .update({ reason })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update flag')
  }

  return {
    id: data.id,
    quizId: data.quiz_id,
    question: data.question,
    reason: data.reason,
    createdAt: data.created_at,
  }
}

export async function deleteFlag(id: string) {
  const client = getSupabaseClient()
  const { error } = await client
    .from(FLAGS_TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
