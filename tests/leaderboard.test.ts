import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { beforeEach, test } from 'node:test'

import {
  clearLeaderboard,
  getLeaderboard,
  getPersonalBest,
  recordScore,
  setSupabaseClient,
} from '../lib/db'
import { GET, POST } from '../app/api/leaderboard/[quizId]/route'

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

const quizId = 'test-quiz'

beforeEach(async () => {
  mockSupabase.rows = []
  await clearLeaderboard()
})

test('recordScore stores entries and orders by score then duration', async () => {
  await recordScore({ quizId, name: 'Alice', score: 8, duration: 1200 })
  await recordScore({ quizId, name: 'Bob', score: 9, duration: 1500 })
  await recordScore({ quizId, name: 'Charlie', score: 9, duration: 1100 })

  const leaderboard = await getLeaderboard(quizId, 10, 1)
  assert.equal(leaderboard.items[0].name, 'Charlie')
  assert.equal(leaderboard.items[1].name, 'Bob')
  assert.equal(leaderboard.items[2].name, 'Alice')
})

test("getPersonalBest returns a user's fastest top score", async () => {
  await recordScore({ quizId, name: 'Dana', score: 7, duration: 1500 })
  await recordScore({ quizId, name: 'Dana', score: 7, duration: 900 })

  const best = await getPersonalBest(quizId, 'Dana')
  assert.ok(best)
  assert.equal(best?.duration, 900)
})

test('API POST and GET handlers validate and return leaderboard data', async () => {
  const postResponse = await POST(
    new Request(`http://localhost/api/leaderboard/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Eve', score: 5, duration: 800 }),
    }),
    { params: Promise.resolve({ quizId }) }
  )

  assert.equal(postResponse.status, 200)
  const postBody = (await postResponse.json()) as any
  assert.equal(postBody.entry.name, 'Eve')

  const getResponse = await GET(new Request(`http://localhost/api/leaderboard/${quizId}?limit=5&name=Eve`), {
    params: Promise.resolve({ quizId }),
  })

  assert.equal(getResponse.status, 200)
  const body = (await getResponse.json()) as any
  assert.ok(Array.isArray(body.leaderboard.items))
  assert.equal(body.leaderboard.items[0].name, 'Eve')
  assert.equal(body.personalBest?.name, 'Eve')
})
