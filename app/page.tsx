'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import FileUpload from '@/components/file-upload'
import QuizSetup from '@/components/quiz-setup'
import QuizDisplay, { IncorrectAnswer } from '@/components/quiz-display'
import ThemeSwitcher from '@/components/theme-switcher'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Leaderboard } from '@/components/leaderboard'
import { ActiveUsers } from '@/components/active-users'
import { UserWelcome } from '@/components/user-welcome'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignedOut, SignedIn, Protect, UserButton, SignInButton, useUser } from "@clerk/nextjs"

import { Language, getTranslation } from '@/lib/translations'

import { Question } from '@/lib/schema'
import { hashQuestion } from '@/lib/utils'

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
  const [userName, setUserName] = useState('')
  const [hasLoadedName, setHasLoadedName] = useState(false)
  const [activeTab, setActiveTab] = useState("quiz")
  const language: Language = 'az'

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('quiz-player-name')
      if (storedName) {
        setUserName(storedName)
      }
    } catch (e) {
      console.warn('Failed to load name', e)
    } finally {
      setHasLoadedName(true)
    }
  }, [])

  const handleNameChange = (newName: string) => {
    setUserName(newName)
    try {
      localStorage.setItem('quiz-player-name', newName)
    } catch (e) {
      console.warn('Failed to save name', e)
    }
  }

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

  const handleRetryIncorrect = () => {
    if (incorrectAnswers.length === 0) return

    const retryQuestions = questions.filter(q => {
      const qId = hashQuestion(q.question)
      return incorrectAnswers.some(ia => ia.questionId === qId)
    })

    handleRedo(retryQuestions, quizId)
  }

  const handleRedo = (redoQuestions: Question[], id: string) => {
    setCurrentQuiz(redoQuestions)
    setScore(0)
    setIncorrectAnswers([])
    setStudyMode(false)
    setShowOnlyCorrect(false)
    setQuizId(id)
    setQuizStartTime(Date.now())
    setQuizDuration(0)
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
      <main className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
        <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8 min-h-screen flex flex-col w-full">
          {state !== 'quiz' && (
            <header className="flex justify-between items-center mb-4 sm:mb-8 relative z-50">
              <div className="flex items-center gap-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <Settings className="w-4 h-4" />
                      <span>{getTranslation(language, 'auth.signIn')}</span>
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                    <Protect role="admin">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Link href="/admin">
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">{getTranslation(language, 'auth.admin')}</span>
                        </Link>
                      </Button>
                    </Protect>
                  </div>
                </SignedIn>
              </div>
              <ThemeSwitcher />
            </header>
          )}

          {state !== 'quiz' && (
            <Tabs defaultValue="quiz" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 space-y-4">
              <div className="mb-6 w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto shadow-sm">
                  <TabsTrigger value="quiz" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.quiz')}</TabsTrigger>
                  <TabsTrigger value="leaderboard" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.leaderboard')}</TabsTrigger>
                  <TabsTrigger value="mistakes" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.mistakes')}</TabsTrigger>
                  <TabsTrigger value="community" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.community')}</TabsTrigger>
                </TabsList>
              </div>

              <UserWelcome
                language={language}
                userName={userName}
                onNameChange={handleNameChange}
                isLoading={!hasLoadedName}
              />
              <div className="mt-6"></div>

              <TabsContent value="quiz" className="mt-0 flex-1">
                <div className="relative w-full grid grid-cols-1 items-start">
                  <AnimatePresence mode="popLayout">
                    {STEPS.map((step, index) => {
                      if (index > currentIndex) return null
                      if (step === 'quiz') return null // Should not happen in this view loop logic if state check handles it, but safe to keep

                      const isCurrent = index === currentIndex
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
                          className={`col-start-1 row-start-1 w-full ${isCurrent ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        >
                          <Card className="w-full shadow-lg border-none sm:border overflow-hidden">
                            <CardContent className="p-4 sm:p-8">
                              {currentIndex > 0 && step !== 'complete' && (
                                <Button
                                  onClick={handleBack}
                                  variant="ghost"
                                  className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  <span className="text-sm">{getTranslation(language, 'nav.back')}</span>
                                </Button>
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
                              {step === 'complete' && (
                                <QuizComplete
                                  score={score}
                                  total={currentQuiz.length}
                                  incorrectAnswers={incorrectAnswers}
                                  onReset={handleReset}
                                  onRetryIncorrect={handleRetryIncorrect}
                                  language={language}
                                  quizId={quizId}
                                  durationMs={quizDuration}
                                  userName={userName}
                                  onNameChange={handleNameChange}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Card>
                  <CardContent className="p-6">
                    <Leaderboard quizId={quizId || 'global'} language={language} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mistakes">
                <UserMistakes
                  language={language}
                  onRedo={handleRedo}
                />
              </TabsContent>

              <TabsContent value="community">
                <div className="space-y-6">
                  <ActiveUsers language={language} playerName={userName} />
                  {/* Placeholder for future chat or other community features */}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {state === 'quiz' && (
            <div className="w-full">
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
            </div>
          )}
        </div>
      </main>
    </>
  )
}

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserMistakes } from '@/components/user-mistakes'

function QuizComplete({
  score,
  total,
  incorrectAnswers,
  onReset,
  onRetryIncorrect,
  language,
  quizId,
  durationMs,
  userName,
  onNameChange,
}: {
  score: number
  total: number
  incorrectAnswers: IncorrectAnswer[]
  onReset: () => void
  onRetryIncorrect: () => void
  language: Language
  quizId?: string
  durationMs: number
  userName: string
  onNameChange: (name: string) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showMistakes, setShowMistakes] = useState(false)
  const recordScore = useMutation(api.leaderboard.recordScore)
  const recordMistakes = useMutation(api.mistakes.recordMistakes)
  const { user } = useUser()

  const percentage = total ? Math.round((score / total) * 100) : 0
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  const durationText = getTranslation(language, 'results.duration', { minutes, seconds })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

    const playerName = userName.trim() || getTranslation(language, 'activeUsers.guest')
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await recordScore({
        quizId,
        name: playerName,
        score,
        duration: Math.max(0, durationMs),
      })

      setHasSubmitted(true)
      setRefreshKey((key) => key + 1)

      // Also record mistakes if user is logged in
      if (user && incorrectAnswers.length > 0) {
        await recordMistakes({
          clerkId: user.id,
          quizId,
          mistakes: incorrectAnswers.map(ia => ({
            questionId: ia.questionId,
            question: typeof ia.question === 'string' ? ia.question : JSON.stringify(ia.question),
            answers: ia.allAnswers || [],
            correctAnswer: typeof ia.correctAnswer === 'string' ? ia.correctAnswer : JSON.stringify(ia.correctAnswer)
          }))
        })
      }
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(getTranslation(language, 'results.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
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
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
          <Button onClick={onReset} className="w-full sm:w-auto">
            {getTranslation(language, 'results.resetBtn')}
          </Button>
          {incorrectAnswers.length > 0 && (
            <Button variant="secondary" onClick={onRetryIncorrect} className="w-full sm:w-auto">
              {getTranslation(language, 'results.retryIncorrectBtn')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">
                {getTranslation(language, 'results.leaderboardTitle')}
              </CardTitle>
              {hasSubmitted && (
                <Badge variant="secondary">
                  {getTranslation(language, 'results.submitted')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {getTranslation(language, 'results.scoreSummary', { score, duration: durationText })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaderboard-name" className="text-sm font-medium">
                {getTranslation(language, 'results.nameLabel')}
              </Label>
              <Input
                id="leaderboard-name"
                value={userName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={getTranslation(language, 'results.namePlaceholder')}
              />
            </div>
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
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
          </CardContent>
        </Card>

        <Leaderboard quizId={quizId} playerName={userName} language={language} refreshKey={refreshKey} />
      </div>

      {incorrectAnswers.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => setShowMistakes(!showMistakes)} className="w-full sm:w-auto">
              {showMistakes ? 'Hide Mistakes' : getTranslation(language, 'results.reviewBtn')}
            </Button>
          </div>

          {showMistakes && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center">
                {getTranslation(language, 'results.incorrectTitle')}
              </h2>
              <div className="grid gap-4">
                {incorrectAnswers.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 break-words">
                        {typeof item.question === 'string' ? item.question : JSON.stringify(item.question)}
                      </h3>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        <div className="p-3 sm:p-4 rounded-lg bg-error/10 border border-error/30">
                          <span className="font-bold block text-xs uppercase tracking-wider mb-2 text-error">
                            {getTranslation(language, 'results.yourAnswer')}
                          </span>
                          <span className="text-foreground font-medium break-words">
                            {typeof item.userAnswer === 'string' ? item.userAnswer : JSON.stringify(item.userAnswer)}
                          </span>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg bg-success/10 border border-success/30">
                          <span className="font-bold block text-xs uppercase tracking-wider mb-2 text-success">
                            {getTranslation(language, 'results.correctAnswer')}
                          </span>
                          <span className="text-foreground font-medium break-words">
                            {typeof item.correctAnswer === 'string' ? item.correctAnswer : JSON.stringify(item.correctAnswer)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <Card className="border-success/30 bg-success/10">
          <CardContent className="p-8 text-center">
            <p className="text-xl font-bold text-foreground">
              {getTranslation(language, 'results.perfectScore')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
