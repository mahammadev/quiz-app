'use client'

import { Trash2, Play, FileJson, Pencil, Save, X } from 'lucide-react'
import { getTranslation, Language } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Question } from '@/lib/schema'

export default function QuizLibrary({
  onSelectQuiz,
  language = 'en',
}: {
  onSelectQuiz: (questions: Question[], id?: string) => void
  language?: Language
}) {
  const savedQuizzes = useQuery(api.quizzes.list)
  const isLoading = savedQuizzes === undefined

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="w-full rounded-xl border border-border/70 bg-background/80 shadow-sm p-2 sm:p-3 space-y-2">
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

  if (!savedQuizzes || savedQuizzes.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {savedQuizzes.map((quiz) => (
        <Card
          key={quiz._id}
          className="group w-full py-0 rounded-xl border border-border/70 bg-background/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardContent className="flex h-full flex-col justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3 text-left">
            <div className="flex items-start gap-2">
              <div className="rounded-lg border border-border bg-muted p-2 text-primary shadow-sm">
                <FileJson className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {quiz.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {quiz.questions.length} questions
                  </span>
                  <span className="text-xs">
                    {new Date(quiz._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onSelectQuiz(quiz.questions as any, quiz._id)}
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
