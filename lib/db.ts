import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export type LeaderboardEntry = {
  id: string
  quizId: string
  name: string
  score: number
  duration: number
  createdAt: string
}

const dataFile = process.env.LEADERBOARD_PATH || path.join(process.cwd(), 'data', 'leaderboard.json')
let initialized = false

async function ensureStorage() {
  if (initialized) return
  await fs.mkdir(path.dirname(dataFile), { recursive: true })
  try {
    await fs.access(dataFile)
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf-8')
  }
  initialized = true
}

async function readEntries(): Promise<LeaderboardEntry[]> {
  await ensureStorage()
  const contents = await fs.readFile(dataFile, 'utf-8')
  try {
    const parsed = JSON.parse(contents)
    if (Array.isArray(parsed)) {
      return parsed as LeaderboardEntry[]
    }
    return []
  } catch {
    return []
  }
}

async function writeEntries(entries: LeaderboardEntry[]) {
  await ensureStorage()
  await fs.writeFile(dataFile, JSON.stringify(entries, null, 2), 'utf-8')
}

export async function recordScore(entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) {
  const entries = await readEntries()
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  entries.push(newEntry)
  await writeEntries(entries)
  return newEntry
}

export async function getLeaderboard(quizId: string, limit = 10, page = 1) {
  const entries = await readEntries()
  const filtered = entries.filter((entry) => entry.quizId === quizId)

  const sorted = filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.duration !== b.duration) return a.duration - b.duration
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const start = Math.max(0, (page - 1) * limit)
  const items = sorted.slice(start, start + limit)

  return { total: sorted.length, items }
}

export async function getPersonalBest(quizId: string, name: string) {
  const entries = await readEntries()
  const personal = entries.filter(
    (entry) => entry.quizId === quizId && entry.name.toLowerCase() === name.toLowerCase()
  )

  if (!personal.length) return null

  return personal.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.duration !== b.duration) return a.duration - b.duration
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })[0]
}

export async function clearLeaderboard() {
  await writeEntries([])
}
