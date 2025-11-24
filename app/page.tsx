'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FileUpload from '@/components/file-upload'
import QuizSetup from '@/components/quiz-setup'
import QuizDisplay, { IncorrectAnswer } from '@/components/quiz-display'
import ThemeSwitcher from '@/components/theme-switcher'

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
  const [quizId, setQuizId] = useState<string>('')
  const language: Language = 'az'

  const currentIndex = STEPS.indexOf(state)

  const handleFileLoaded = (loadedQuestions: Question[], id?: string) => {
    setQuestions(loadedQuestions)
    setQuizId(id || `quiz-${Date.now()}`)
    setAppState('setup')
  }

  const handleQuizStart = (quizQuestions: Question[], shuffle: boolean) => {
    setCurrentQuiz(quizQuestions)
    setScore(0)
    setIncorrectAnswers([])
    setShuffleAnswers(shuffle)
    setAppState('quiz')
  }

  const handleQuizComplete = (finalScore: number, incorrect: IncorrectAnswer[] = []) => {
    setScore(finalScore)
    setIncorrectAnswers(incorrect)
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
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setAppState(STEPS[currentIndex - 1])
    }
  }

  return (
    <>

      <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="container mx-auto max-w-5xl px-4 py-8 min-h-screen flex flex-col">
          <header className="flex justify-end mb-8 relative z-50">
            <ThemeSwitcher />
          </header>

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

                      {currentIndex > 0 && step !== 'complete' && (
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
                          shuffleAnswers={shuffleAnswers}
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
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
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
}: {
  score: number
  total: number
  incorrectAnswers: IncorrectAnswer[]
  onReset: () => void
  language: Language
}) {
  const percentage = Math.round((score / total) * 100)

  // Scroll to top when results screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

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
