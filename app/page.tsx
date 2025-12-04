'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/file-upload'
import QuizSetup from '@/components/quiz-setup'
import QuizDisplay, { IncorrectAnswer } from '@/components/quiz-display'
import ThemeSwitcher from '@/components/theme-switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaderboard } from '@/components/leaderboard'

import { Language, getTranslation } from '@/lib/translations'

type Question = {
  question: string
  answers: string[]
  correct_answer: string
  _originalIndex?: number
}

type AppState = 'upload' | 'setup' | 'quiz' | 'complete'

const STEPS: AppState[] = ['upload', 'setup', 'quiz', 'complete']

export default function Home() {
  const [state, setAppState] = useState<AppState>('upload')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([])
  const [score, setScore] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([])
  const [shuffleAnswers, setShuffleAnswers] = useState(false)
  const [studyMode, setStudyMode] = useState(false)
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false)
  const [quizId, setQuizId] = useState<string>('')
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [quizDuration, setQuizDuration] = useState<number>(0)
  const language: Language = 'az'

  const currentIndex = STEPS.indexOf(state)

  const handleFileLoaded = (loadedQuestions: Question[], id?: string) => {
    setQuestions(loadedQuestions)
    setQuizId(id || `quiz-${Date.now()}`)
    setAppState('setup')
  }

  const handleQuizStart = (quizQuestions: Question[], shuffle: boolean, isStudyMode?: boolean, onlyCorrect?: boolean) => {
    setCurrentQuiz(quizQuestions)
    setScore(0)
    setIncorrectAnswers([])
    setShuffleAnswers(shuffle)
    setStudyMode(isStudyMode || false)
    setShowOnlyCorrect(onlyCorrect || false)
    setQuizStartTime(Date.now())
    setQuizDuration(0)
    setAppState('quiz')
  }

  const handleQuizComplete = (finalScore: number, incorrect: IncorrectAnswer[] = []) => {
    setScore(finalScore)
    setIncorrectAnswers(incorrect)
    setQuizDuration(quizStartTime ? Date.now() - quizStartTime : 0)
    setAppState('complete')
  }

  const handleReset = () => {
    setAppState('upload')
    setQuestions([])
    setCurrentQuiz([])
    setScore(0)
    setIncorrectAnswers([])
    setShuffleAnswers(false)
    setQuizId('')
    setQuizDuration(0)
    setQuizStartTime(null)
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setAppState(STEPS[currentIndex - 1])
    }
  }

  return (
    <>

      <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-8 min-h-screen flex flex-col">
          {/* Hide header during quiz since quiz-display has its own */}
          {state !== 'quiz' && (
            <header className="flex justify-end mb-4 sm:mb-8 relative z-50">
              <ThemeSwitcher />
            </header>
          )}

          <div className="relative flex-1 w-full grid grid-cols-1 items-start">
            <AnimatePresence mode="popLayout">
              {STEPS.map((step, index) => {
                if (index > currentIndex) return null

                const isCurrent = index === currentIndex
                const isPast = index < currentIndex
                const offset = currentIndex - index

                return (
                  <motion.div
                    key={step}
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{
                      y: isCurrent ? 0 : -40 * offset,
                      scale: isCurrent ? 1 : 1 - (0.05 * offset),
                      opacity: isCurrent ? 1 : 0,
                      zIndex: index,
                      filter: isCurrent ? 'none' : 'brightness(0.95)'
                    }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    className={`col-start-1 row-start-1 w-full ${isCurrent ? 'pointer-events-auto' : 'pointer-events-none'
                      }`}
                  >
                    <div className={`w-full rounded-lg border shadow-lg p-6 md:p-8 ${step === 'quiz' ? 'bg-transparent border-transparent shadow-none p-0' : 'bg-card border-border'
                      }`}>

                      {currentIndex > 0 && step !== 'complete' && step !== 'quiz' && (
                        <button
                          onClick={handleBack}
                          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="text-sm">Geri</span>
                        </button>
                      )}

                      {step === 'upload' && (
                        <FileUpload onFileLoaded={handleFileLoaded} language={language} />
                      )}
                      {step === 'setup' && (
                        <QuizSetup
                          totalQuestions={questions.length}
                          onQuizStart={handleQuizStart}
                          allQuestions={questions}
                          language={language}
                          quizId={quizId}
                        />
                      )}
                      {step === 'quiz' && (
                        <QuizDisplay
                          questions={currentQuiz}
                          onComplete={handleQuizComplete}
                          onBack={handleBack}
                          shuffleAnswers={shuffleAnswers}
                          studyMode={studyMode}
                          showOnlyCorrect={showOnlyCorrect}
                          language={language}
                          quizId={quizId}
                          allQuestions={questions}
                        />
                      )}
                      {step === 'complete' && (
                        <QuizComplete
                          score={score}
                          total={currentQuiz.length}
                          incorrectAnswers={incorrectAnswers}
                          onReset={handleReset}
                          language={language}
                          quizId={quizId}
                          durationMs={quizDuration}
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {quizId && state !== 'quiz' && (
            <div className="mt-8">
              <Leaderboard quizId={quizId} language={language} />
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function QuizComplete({
  score,
  total,
  incorrectAnswers,
  onReset,
  language,
  quizId,
  durationMs,
}: {
  score: number
  total: number
  incorrectAnswers: IncorrectAnswer[]
  onReset: () => void
  language: Language
  quizId?: string
  durationMs: number
}) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const percentage = total ? Math.round((score / total) * 100) : 0
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  const durationText = getTranslation(language, 'results.duration', { minutes, seconds })

  // Scroll to top when results screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const storedName = localStorage.getItem('quiz-player-name')
    if (storedName) {
      setName(storedName)
    }
  }, [])

  useEffect(() => {
    setHasSubmitted(false)
    setSubmitError(null)
    setRefreshKey((key) => key + 1)
  }, [quizId, score, durationMs])

  const handleSubmitScore = async () => {
    if (!quizId) {
      setSubmitError(getTranslation(language, 'results.error'))
      return
    }
    if (hasSubmitted) return

    const playerName = name.trim() || 'Guest'
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/leaderboard/${quizId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          score,
          duration: Math.max(0, durationMs),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit score')
      }

      localStorage.setItem('quiz-player-name', playerName)
      setHasSubmitted(true)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setSubmitError(getTranslation(language, 'results.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-12 space-y-8 max-w-4xl mx-auto">
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-card-foreground mb-4">
          {getTranslation(language, 'results.title')}
        </h1>
        <div className="mb-6">
          <p className="text-6xl font-bold text-primary mb-2">
            {percentage}%
          </p>
          <p className="text-xl text-muted-foreground">
            {getTranslation(language, 'results.scored', { score, total })}
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-primary"
        >
          {getTranslation(language, 'results.resetBtn')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {getTranslation(language, 'results.leaderboardTitle')}
            </h2>
            {hasSubmitted && (
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success border border-success/30">
                {getTranslation(language, 'results.submitted')}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getTranslation(language, 'results.scoreSummary', { score, duration: durationText })}
          </p>

          <div className="space-y-2">
            <Label htmlFor="leaderboard-name" className="text-sm font-medium">
              {getTranslation(language, 'results.nameLabel')}
            </Label>
            <Input
              id="leaderboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getTranslation(language, 'results.namePlaceholder')}
            />
          </div>
          {submitError && (
            <div className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {getTranslation(language, 'results.duration', { minutes, seconds })}
            </div>
            <Button onClick={handleSubmitScore} disabled={isSubmitting || hasSubmitted || !quizId}>
              {isSubmitting
                ? getTranslation(language, 'results.submitting')
                : hasSubmitted
                  ? getTranslation(language, 'results.alreadySubmitted')
                  : getTranslation(language, 'results.submitScore')}
            </Button>
          </div>
        </div>

        <Leaderboard quizId={quizId} playerName={name} language={language} refreshKey={refreshKey} />
      </div>

      {incorrectAnswers.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground text-center">
            {getTranslation(language, 'results.incorrectTitle')}
          </h2>
          <div className="grid gap-4">
            {incorrectAnswers.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {item.question}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-error/10 border border-error/30">
                    <span className="font-bold block text-xs uppercase tracking-wider mb-2 text-error">
                      {getTranslation(language, 'results.yourAnswer')}
                    </span>
                    <span className="text-foreground font-medium">{item.userAnswer}</span>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <span className="font-bold block text-xs uppercase tracking-wider mb-2 text-success">
                      {getTranslation(language, 'results.correctAnswer')}
                    </span>
                    <span className="text-foreground font-medium">{item.correctAnswer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 rounded-lg bg-success/10 border border-success/30">
          <p className="text-xl font-bold text-foreground">
            {getTranslation(language, 'results.perfectScore')}
          </p>
        </div>
      )}
    </div>
  )
}
