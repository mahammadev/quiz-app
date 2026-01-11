import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { beforeEach, test } from 'node:test'

import { parseQuestions } from '../lib/quiz'
import { POST, GET } from '../app/api/leaderboard/[quizId]/route'
import { setSupabaseClient } from '../lib/db'

type Row = {
  id: string
  quiz_id: string
  name: string
  score: number
  duration: number
  created_at: string
}

class MockQuery {
  constructor(private store: Row[]) { }

  private filters: { type: 'eq' | 'ilike' | 'neq'; column: keyof Row; value: any }[] = []
  private orders: { column: keyof Row; ascending: boolean }[] = []
  private includeCount = false

  insert(values: any) {
    const payloads = Array.isArray(values) ? values : [values]
    const inserted = payloads.map((value) => ({
      id: value.id ?? crypto.randomUUID(),
      quiz_id: value.quiz_id,
      name: value.name,
      score: value.score,
      duration: value.duration,
      created_at: value.created_at ?? new Date().toISOString(),
    }))

    this.store.push(...inserted)

    return {
      select: () => ({
        single: async () => ({ data: inserted[0], error: null }),
      }),
    }
  }

  select(_columns?: string, options?: { count?: 'exact' }) {
    this.includeCount = options?.count === 'exact'
    return this
  }

  eq(column: keyof Row, value: any) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  ilike(column: keyof Row, value: string) {
    this.filters.push({ type: 'ilike', column, value })
    return this
  }

  neq(column: keyof Row, value: any) {
    this.filters.push({ type: 'neq', column, value })
    return this
  }

  order(column: keyof Row, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending ?? true })
    return this
  }

  private filtered() {
    return this.store
      .filter((row) =>
        this.filters.every((filter) => {
          const value = row[filter.column]
          if (filter.type === 'eq') return value === filter.value
          if (filter.type === 'neq') return value !== filter.value
          if (filter.type === 'ilike')
            return (
              typeof value === 'string' &&
              typeof filter.value === 'string' &&
              value.toLowerCase() === filter.value.toLowerCase()
            )
          return true
        })
      )
      .sort((a, b) => {
        for (const order of this.orders) {
          const lhs = a[order.column]
          const rhs = b[order.column]
          if (lhs === rhs) continue
          if (order.ascending) return lhs < rhs ? -1 : 1
          return lhs > rhs ? -1 : 1
        }
        return 0
      })
  }

  range(from: number, to: number) {
    const filtered = this.filtered()
    const slice = filtered.slice(from, to + 1)
    return Promise.resolve({ data: slice, error: null, count: this.includeCount ? filtered.length : null })
  }

  limit(count: number) {
    const filtered = this.filtered().slice(0, count)
    return Promise.resolve({ data: filtered, error: null, count: this.includeCount ? filtered.length : null })
  }
}

class MockSupabase {
  rows: Row[] = []

  from(_table: string) {
    const query = new MockQuery(this.rows)

    return {
      insert: query.insert.bind(query),
      select: query.select.bind(query),
      eq: query.eq.bind(query),
      ilike: query.ilike.bind(query),
      order: query.order.bind(query),
      range: query.range.bind(query),
      limit: query.limit.bind(query),
      delete: () => ({
        neq: async (column: keyof Row, value: any) => {
          this.rows = this.rows.filter((row) => row[column] === value)
          return { error: null }
        },
      }),
    }
  }
}

const mockSupabase = new MockSupabase()
setSupabaseClient(mockSupabase as any)

beforeEach(() => {
  mockSupabase.rows = []
})

test('quiz flow parses questions and submits leaderboard entry', async () => {
  const content = JSON.stringify([
    { question: 'Capital of France?', answers: ['Paris', 'Berlin'], correct_answer: 'Paris' },
    { question: '2 + 2?', answers: ['4', '5'], correct_answer: '4' },
  ])

  const questions = parseQuestions(content, 'en')
  const score = questions.length
  const quizId = 'quiz-flow'

  const postResponse = await POST(
    new Request(`http://localhost/api/leaderboard/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'FlowTester', score, duration: 420 }),
    }),
    { params: Promise.resolve({ quizId }) }
  )

  assert.equal(postResponse.status, 200)

  const getResponse = await GET(
    new Request(`http://localhost/api/leaderboard/${quizId}?name=FlowTester`),
    { params: Promise.resolve({ quizId }) }
  )

  assert.equal(getResponse.status, 200)
  const body = (await getResponse.json()) as any
  assert.equal(body.leaderboard.items[0].score, score)
  assert.equal(body.personalBest?.name, 'FlowTester')
})
