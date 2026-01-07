'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Play, FileJson, Pencil, Save, X } from 'lucide-react'
import { getTranslation, Language } from '@/lib/translations'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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
        .maybeSingle()

      if (error) throw error

      if (!data) {
        throw new Error('Update blocked or no matching row (check RLS / id)')
      }

      const updated = data
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
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {savedQuizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="group rounded-xl border border-border/70 bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-border bg-muted p-2 text-primary shadow-sm">
                  <FileJson className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-2">
                  <h3 className="truncate text-lg font-semibold text-foreground">
                    {quiz.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {quiz.questions.length} questions
                    </span>
                    <span className="text-xs">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => onSelectQuiz(quiz.questions, quiz.id)}
                  className="cursor-target flex-1 min-w-[160px] flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="h-4 w-4" />
                  {getTranslation(language, 'library.loadBtn')}
                </Button>
                {adminMode && (
                  <>
                    <Button
                      onClick={() => startEdit(quiz)}
                      variant="outline"
                      size="icon"
                      className="cursor-target"
                      title={getTranslation(language, 'library.editBtn')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(quiz.id)}
                      variant="outline"
                      size="icon"
                      className="cursor-target text-destructive hover:text-destructive"
                      title={getTranslation(language, 'library.deleteBtn')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={adminMode && Boolean(editingQuizId)} onOpenChange={(open) => !open && cancelEdit()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{getTranslation(language, 'library.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="flex h-[60vh] flex-col gap-4">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="cursor-target flex-1 w-full font-mono text-xs"
            />
            {editError && (
              <Alert variant="destructive">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4" />
              {getTranslation(language, 'library.cancelBtn')}
            </Button>
            <Button
              onClick={() => {
                const quiz = savedQuizzes.find((q) => q.id === editingQuizId)
                if (quiz) {
                  handleSaveEdit(quiz)
                }
              }}
              disabled={editSaving}
            >
              <Save className="h-4 w-4" />
              {getTranslation(language, 'library.saveEditBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
