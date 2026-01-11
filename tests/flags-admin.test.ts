import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import { DELETE, GET, PATCH } from '../app/api/flags/[quizId]/route'
import { setServerClient } from '../lib/supabase/server'

type MockUser = {
  app_metadata?: { role?: string }
}

function createSupabaseMock(user: MockUser | null) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
    },
  }
}

afterEach(() => {
  setServerClient(null)
})

test('GET /api/flags/all denies unauthenticated users', async () => {
  setServerClient(createSupabaseMock(null))

  const response = await GET(new Request('http://localhost/api/flags/all'), {
    params: Promise.resolve({ quizId: 'all' }),
  })

  assert.equal(response.status, 401)
})

test('GET /api/flags/all denies non-admin users', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'player' } }))

  const response = await GET(new Request('http://localhost/api/flags/all'), {
    params: Promise.resolve({ quizId: 'all' }),
  })

  assert.equal(response.status, 401)
})

test('PATCH /api/flags denies non-admin users', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'player' } }))

  const response = await PATCH(
    new Request('http://localhost/api/flags/anything', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'flag-1', reason: 'Nope' }),
    })
  )

  assert.equal(response.status, 401)
})

test('DELETE /api/flags denies unauthenticated users', async () => {
  setServerClient(createSupabaseMock(null))

  const response = await DELETE(new Request('http://localhost/api/flags/anything?id=flag-1', { method: 'DELETE' }))

  assert.equal(response.status, 401)
})

import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import { DELETE, GET, PATCH, POST } from '../app/api/flags/[quizId]/route'
import { setServerClient } from '../lib/supabase/server'

type MockUser = {
  app_metadata?: { role?: string }
}

function createSupabaseMock(user: MockUser | null) {
  return {
    auth: {
      getUser: async () => ({ data: { user } }),
    },
  }
}

afterEach(() => {
  setServerClient(null)
})

test('GET /api/flags returns 400 when quiz id is missing', async () => {
  const response = await GET(new Request('http://localhost/'), {
    params: Promise.resolve({ quizId: undefined }),
  })

  assert.equal(response.status, 400)
})

test('GET /api/flags/all denies unauthenticated users', async () => {
  setServerClient(createSupabaseMock(null))

  const response = await GET(new Request('http://localhost/api/flags/all'), {
    params: Promise.resolve({ quizId: 'all' }),
  })

  assert.equal(response.status, 401)
})

test('GET /api/flags/all denies non-admin users', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'player' } }))

  const response = await GET(new Request('http://localhost/api/flags/all'), {
    params: Promise.resolve({ quizId: 'all' }),
  })

  assert.equal(response.status, 401)
})

test('PATCH /api/flags denies non-admin users', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'player' } }))

  const response = await PATCH(
    new Request('http://localhost/api/flags/anything', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'flag-1', reason: 'Nope' }),
    })
  )

  assert.equal(response.status, 401)
})

test('POST /api/flags rejects invalid payload', async () => {
  const request = new Request('http://localhost/api/flags/test-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: '' }),
  })

  const response = await POST(request, {
    params: Promise.resolve({ quizId: 'test-quiz' }),
  })

  assert.equal(response.status, 400)
})

test('PATCH /api/flags rejects invalid payload for admins', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'admin' } }))

  const response = await PATCH(
    new Request('http://localhost/api/flags/anything', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '' }),
    })
  )

  assert.equal(response.status, 400)
})

test('DELETE /api/flags denies unauthenticated users', async () => {
  setServerClient(createSupabaseMock(null))

  const response = await DELETE(new Request('http://localhost/api/flags/anything?id=flag-1', { method: 'DELETE' }))

  assert.equal(response.status, 401)
})

test('DELETE /api/flags requires a flag id for admins', async () => {
  setServerClient(createSupabaseMock({ app_metadata: { role: 'admin' } }))

  const response = await DELETE(new Request('http://localhost/api/flags/anything', { method: 'DELETE' }))

  assert.equal(response.status, 400)
})
