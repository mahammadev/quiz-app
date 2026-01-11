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
import { Skeleton } from '@/components/ui/skeleton'

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
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadQuizzes = async () => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border border-border/70 bg-background/80 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </Card>
        ))}
      </div>
    )
  }

  if (!isLoading && savedQuizzes.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {savedQuizzes.map((quiz) => (
        <Card
          key={quiz.id}
          className="group rounded-xl border border-border/70 bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardContent className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6 text-left">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
