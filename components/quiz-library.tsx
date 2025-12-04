'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Play, FileJson } from 'lucide-react'
import { getTranslation, Language } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'

type Question = {
  question: string
  answers: string[]
  correct_answer: string
}

type SavedQuiz = {
  id: string
  name: string
  created_at: string
  questions: Question[]
}

export default function QuizLibrary({
  onSelectQuiz,
  language = 'en',
  refreshTrigger = 0,
}: {
  onSelectQuiz: (questions: Question[], id?: string) => void
  language?: Language
  refreshTrigger?: number
}) {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([])
  const [adminMode, setAdminMode] = useState(false)
  const typedKeys = useRef('')
  const supabase = createClient()

  // Hidden admin mode - listen for "admin" being typed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track letter keys
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        typedKeys.current += e.key.toLowerCase()

        // Keep only the last 5 characters
        if (typedKeys.current.length > 5) {
          typedKeys.current = typedKeys.current.slice(-5)
        }

        // Check if "admin" was typed
        if (typedKeys.current === 'admin') {
          setAdminMode(prev => !prev) // Toggle admin mode
          typedKeys.current = ''
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          setSavedQuizzes(data)
        }
      } catch (e) {
        console.error('Failed to load library', e)
      }
    }
    loadQuizzes()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm(getTranslation(language, 'library.confirmDelete'))) return

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)

      if (error) throw error

      const newQuizzes = savedQuizzes.filter((q) => q.id !== id)
      setSavedQuizzes(newQuizzes)
    } catch (e) {
      console.error('Failed to delete quiz', e)
    }
  }

  if (savedQuizzes.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8 h-full shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        {getTranslation(language, 'library.saved')}
      </h2>
      <div className="grid gap-4">
        {savedQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex flex-col justify-between rounded-lg border border-border bg-muted p-4 transition-colors hover:border-primary hover:bg-muted/70"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-bold text-foreground truncate">
                  {quiz.name}
                </h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {quiz.questions.length} questions •{' '}
                {new Date(quiz.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onSelectQuiz(quiz.questions, quiz.id)}
                className="cursor-target btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <Play className="h-4 w-4" />
                {getTranslation(language, 'library.loadBtn')}
              </button>
              {adminMode && (
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="cursor-target flex items-center justify-center rounded-lg border border-destructive/30 bg-card px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                  title={getTranslation(language, 'library.deleteBtn')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
