'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Play, FileJson, Pencil, Save, X } from 'lucide-react'
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
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)
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

  useEffect(() => {
    loadQuizzes()
  }, [refreshTrigger])

  const parseQuestions = (content: string) => {
    const data = JSON.parse(content)
    const questions = Array.isArray(data) ? data : [data]

    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.answers) || !q.correct_answer) {
        throw new Error(getTranslation(language, 'upload.errorMsg', { index: idx + 1 }))
      }
    })

    return questions as Question[]
  }

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

  const startEdit = (quiz: SavedQuiz) => {
    setEditingQuizId(quiz.id)
    setEditValue(JSON.stringify(quiz.questions, null, 2))
    setEditError('')
  }

  const cancelEdit = () => {
    setEditingQuizId(null)
    setEditValue('')
    setEditError('')
  }

  const handleSaveEdit = async (quiz: SavedQuiz) => {
    setEditError('')
    setEditSaving(true)

    try {
      const parsed = parseQuestions(editValue)
      const { data, error } = await supabase
        .from('quizzes')
        .update({ questions: parsed })
        .eq('id', quiz.id)
        .select('id, name, created_at, questions')

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('No data returned from update')
      }

      const updated = data[0]
      setSavedQuizzes((prev) =>
        prev.map((q) => (q.id === quiz.id ? { ...q, ...updated } : q))
      )
      await loadQuizzes()
      cancelEdit()
    } catch (e) {
      const message = e instanceof Error ? e.message : getTranslation(language, 'upload.parseErrorPaste')
      setEditError(message)
    } finally {
      setEditSaving(false)
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
                <>
                  {editingQuizId === quiz.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(quiz)}
                        disabled={editSaving}
                        className="cursor-target flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        title={getTranslation(language, 'library.saveEditBtn')}
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="cursor-target flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-muted-foreground hover:bg-muted transition-colors"
                        title={getTranslation(language, 'library.cancelBtn')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(quiz)}
                      className="cursor-target flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-foreground hover:bg-muted transition-colors"
                      title={getTranslation(language, 'library.editBtn')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="cursor-target flex items-center justify-center rounded-lg border border-destructive/30 bg-card px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors"
                    title={getTranslation(language, 'library.deleteBtn')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {adminMode && editingQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="flex w-[75vw] h-[75vh] flex-col rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {getTranslation(language, 'library.editTitle')}
              </h3>
              <button
                onClick={cancelEdit}
                className="cursor-target flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-muted-foreground hover:bg-muted transition-colors"
                title={getTranslation(language, 'library.cancelBtn')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="cursor-target flex-1 w-full rounded-lg border border-border bg-background p-4 font-mono text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
            />
            {editError && (
              <div className="mt-3 rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
                {editError}
              </div>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const quiz = savedQuizzes.find((q) => q.id === editingQuizId)
                  if (quiz) {
                    handleSaveEdit(quiz)
                  }
                }}
                disabled={editSaving}
                className="cursor-target flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {getTranslation(language, 'library.saveEditBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
