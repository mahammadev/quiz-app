'use client'

import { useState, useEffect } from 'react'
import { getTranslation, Language } from '@/lib/translations'

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
      <div className="rounded-lg border border-border bg-card p-4 sm:p-8 shadow-sm">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-foreground">
          {getTranslation(language, 'setup.title')}
        </h1>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-muted-foreground">
          {getTranslation(language, 'setup.subtitle')}
        </p>

        {!selectedMode ? (
          <div className="grid gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedMode('quick')}
              className="cursor-target text-left rounded-lg border border-border p-4 sm:p-6 hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                {getTranslation(language, 'setup.mode.quick')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getTranslation(language, 'setup.mode.quickDesc')}
              </p>
            </button>

            <button
              onClick={() => setSelectedMode('sequential')}
              className="cursor-target text-left rounded-lg border border-border p-4 sm:p-6 hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                {getTranslation(language, 'setup.mode.sequential')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getTranslation(language, 'setup.mode.sequentialDesc')}
              </p>
            </button>

            <button
              onClick={() => setSelectedMode('practice')}
              className="cursor-target text-left rounded-lg border border-border p-4 sm:p-6 hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                {getTranslation(language, 'setup.mode.practice')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getTranslation(language, 'setup.mode.practiceDesc')}
              </p>
            </button>

            <button
              onClick={() => setSelectedMode('study')}
              className="cursor-target text-left rounded-lg border border-border p-4 sm:p-6 hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
                {getTranslation(language, 'setup.mode.study')}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getTranslation(language, 'setup.mode.studyDesc')}
              </p>
            </button>
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
              <button
                onClick={() => setSelectedMode(null)}
                className="cursor-target text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Geri
              </button>
            </div>

            {selectedMode === 'quick' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  {getTranslation(language, 'setup.numQuestions')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="cursor-target w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {getTranslation(language, 'setup.available', { count: totalQuestions })}
                </p>
              </div>
            )}

            {selectedMode === 'sequential' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Başlanğıc sualı
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalQuestions}
                  value={startingQuestion}
                  onChange={(e) =>
                    setStartingQuestion(Math.max(1, Math.min(totalQuestions, parseInt(e.target.value) || 1)))
                  }
                  className="cursor-target w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {totalQuestions - startingQuestion + 1} sual cavablandırılacaq (sual {startingQuestion} - {totalQuestions})
                </p>
              </div>
            )}



            {selectedMode === 'study' && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <input
                  type="checkbox"
                  id="show-only-correct"
                  checked={showOnlyCorrect}
                  onChange={(e) => setShowOnlyCorrect(e.target.checked)}
                  className="cursor-target w-4 h-4 rounded cursor-pointer accent-primary"
                />
                <label
                  htmlFor="show-only-correct"
                  className="cursor-target text-sm font-medium text-foreground cursor-pointer"
                >
                  {getTranslation(language, 'setup.showOnlyCorrect')}
                </label>
              </div>
            )}

            {/* Shuffle Answers - Available for all modes */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <input
                type="checkbox"
                id="shuffle-answers"
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
                className="cursor-target w-4 h-4 rounded cursor-pointer accent-primary"
              />
              <label
                htmlFor="shuffle-answers"
                className="cursor-target text-sm font-medium text-foreground cursor-pointer"
              >
                {getTranslation(language, 'setup.shuffle')}
              </label>
            </div>

            <button
              onClick={handleStart}
              className="btn-primary w-full cursor-target"
            >
              {getTranslation(language, 'setup.startBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
