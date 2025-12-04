import assert from 'node:assert/strict'
import path from 'node:path'
import { beforeEach, test } from 'node:test'

process.env.LEADERBOARD_PATH = path.join(process.cwd(), '.test-dist', 'leaderboard.json')

import { clearLeaderboard, getLeaderboard, getPersonalBest, recordScore } from '../lib/db'
import { GET, POST } from '../app/api/leaderboard/[quizId]/route'

const quizId = 'test-quiz'

beforeEach(async () => {
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
    { params: { quizId } }
  )

  assert.equal(postResponse.status, 200)
  const postBody = (await postResponse.json()) as any
  assert.equal(postBody.entry.name, 'Eve')

  const getResponse = await GET(new Request(`http://localhost/api/leaderboard/${quizId}?limit=5&name=Eve`), {
    params: { quizId },
  })

  assert.equal(getResponse.status, 200)
  const body = (await getResponse.json()) as any
  assert.ok(Array.isArray(body.leaderboard.items))
  assert.equal(body.leaderboard.items[0].name, 'Eve')
  assert.equal(body.personalBest?.name, 'Eve')
})
