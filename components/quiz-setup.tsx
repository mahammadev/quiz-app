'use client'

import { useState } from 'react'
import { getTranslation, Language } from '@/lib/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

type Question = {
  question: string
  answers: string[]
  correct_answer: string
}

type QuizMode = 'quick' | 'sequential' | 'practice' | 'study'

export default function QuizSetup({
  totalQuestions,
  onQuizStart,
  allQuestions,
  language = 'az',
  quizId,
}: {
  totalQuestions: number
  onQuizStart: (questions: Question[], shuffleAnswers: boolean, studyMode?: boolean, showOnlyCorrect?: boolean) => void
  allQuestions: Question[]
  language?: Language
  quizId?: string
}) {
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null)
  const [numQuestions, setNumQuestions] = useState(Math.min(10, totalQuestions))
  const [shuffleAnswers, setShuffleAnswers] = useState(true)
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false)
  const [startingQuestion, setStartingQuestion] = useState(1)

  const handleStart = () => {
    if (!selectedMode) return

    let questionsToUse: Question[] = []

    if (selectedMode === 'quick') {
      const shuffled = [...allQuestions]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      questionsToUse = shuffled.slice(0, numQuestions).map(q => ({
        ...q,
        answers: [...q.answers] // Deep clone the answers array
      }))
    } else if (selectedMode === 'sequential') {
      questionsToUse = [...allQuestions]
        .slice(startingQuestion - 1)
        .map((q, idx) => ({
          ...q,
          answers: [...q.answers], // Deep clone the answers array
          _originalIndex: startingQuestion - 1 + idx
        }))
    } else if (selectedMode === 'practice') {
      // Shuffle all questions for practice mode
      const shuffled = [...allQuestions]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      questionsToUse = shuffled.map((q, idx) => ({
        ...q,
        answers: [...q.answers], // Deep clone the answers array
        _originalIndex: idx
      }))
    } else if (selectedMode === 'study') {
      questionsToUse = [...allQuestions].map((q, idx) => ({
        ...q,
        answers: [...q.answers],
        _originalIndex: idx
      }))
    }

    onQuizStart(questionsToUse, shuffleAnswers, selectedMode === 'study', showOnlyCorrect)
  }



  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-2xl mx-auto px-4 sm:px-0">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
            {getTranslation(language, 'setup.title')}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {getTranslation(language, 'setup.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>

        {!selectedMode ? (
          <div className="grid gap-3 sm:gap-4">
            <Button
              onClick={() => setSelectedMode('quick')}
              variant="outline"
              className="cursor-target h-auto justify-start text-left"
            >
              <div className="p-2 sm:p-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                  {getTranslation(language, 'setup.mode.quick')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.mode.quickDesc')}
                </p>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedMode('sequential')}
              variant="outline"
              className="cursor-target h-auto justify-start text-left"
            >
              <div className="p-2 sm:p-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                  {getTranslation(language, 'setup.mode.sequential')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.mode.sequentialDesc')}
                </p>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedMode('practice')}
              variant="outline"
              className="cursor-target h-auto justify-start text-left"
            >
              <div className="p-2 sm:p-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                  {getTranslation(language, 'setup.mode.practice')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.mode.practiceDesc')}
                </p>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedMode('study')}
              variant="outline"
              className="cursor-target h-auto justify-start text-left"
            >
              <div className="p-2 sm:p-3">
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                  {getTranslation(language, 'setup.mode.study')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.mode.studyDesc')}
                </p>
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {getTranslation(language, `setup.mode.${selectedMode}`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getTranslation(language, `setup.mode.${selectedMode}Desc`)}
                </p>
              </div>
              <Button
                onClick={() => setSelectedMode(null)}
                variant="ghost"
                className="cursor-target text-sm text-muted-foreground hover:text-foreground"
              >
                ← Geri
              </Button>
            </div>

            {selectedMode === 'quick' && (
              <div>
                <Label className="block text-sm font-semibold text-foreground mb-3">
                  {getTranslation(language, 'setup.numQuestions')}
                </Label>
                <Input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="cursor-target"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.available', { count: totalQuestions })}
                </p>
              </div>
            )}

            {selectedMode === 'sequential' && (
              <div>
                <Label className="block text-sm font-semibold text-foreground mb-3">
                  Başlanğıc sualı
                </Label>
                <Input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={startingQuestion}
                  onChange={(e) =>
                    setStartingQuestion(Math.max(1, Math.min(totalQuestions, parseInt(e.target.value) || 1)))
                  }
                  className="cursor-target"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {totalQuestions - startingQuestion + 1} sual cavablandırılacaq (sual {startingQuestion} - {totalQuestions})
                </p>
              </div>
            )}



            {selectedMode === 'study' && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Checkbox
                  id="show-only-correct"
                  checked={showOnlyCorrect}
                  onCheckedChange={(value) => setShowOnlyCorrect(Boolean(value))}
                />
                <Label
                  htmlFor="show-only-correct"
                  className="cursor-target text-sm font-medium text-foreground cursor-pointer"
                >
                  {getTranslation(language, 'setup.showOnlyCorrect')}
                </Label>
              </div>
            )}

            {/* Shuffle Answers - Available for all modes */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Checkbox
                id="shuffle-answers"
                checked={shuffleAnswers}
                onCheckedChange={(value) => setShuffleAnswers(Boolean(value))}
              />
              <Label
                htmlFor="shuffle-answers"
                className="cursor-target text-sm font-medium text-foreground cursor-pointer"
              >
                {getTranslation(language, 'setup.shuffle')}
              </Label>
            </div>

            <Button
              onClick={handleStart}
              className="w-full cursor-target"
            >
              {getTranslation(language, 'setup.startBtn')}
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  )
}
