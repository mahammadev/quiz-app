import { Question } from './schema'
import { getTranslation, type Language } from './translations'

export type { Question }

export function parseQuestions(content: string, language: Language) {
  const data = JSON.parse(content)
  const questions = Array.isArray(data) ? data : [data]

  questions.forEach((q, idx) => {
    if (!q.question || !Array.isArray(q.answers) || !q.correct_answer) {
      throw new Error(getTranslation(language, 'upload.errorMsg', { index: idx + 1 }))
    }
  })

  return questions as Question[]
}
