import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getTranslation } from '../lib/translations'
import { parseQuestions } from '../lib/quiz'

test('parseQuestions accepts a single question object', () => {
  const content = JSON.stringify({
    question: 'What is 2 + 2?',
    answers: ['3', '4'],
    correct_answer: '4',
  })

  const questions = parseQuestions(content, 'en')
  assert.equal(questions.length, 1)
  assert.equal(questions[0].correct_answer, '4')
})

test('parseQuestions rejects missing fields with translated error', () => {
  const content = JSON.stringify({
    question: 'Missing answers',
    correct_answer: 'A',
  })

  assert.throws(() => parseQuestions(content, 'en'), {
    message: getTranslation('en', 'upload.errorMsg', { index: 1 }),
  })
})
