'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, ArrowLeft, Flag, AlertTriangle, ThumbsUp } from 'lucide-react'
import { QuestionSlider } from './question-slider'
import ThemeSwitcher from './theme-switcher'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Question } from '@/lib/schema'

export type IncorrectAnswer = {
  question: string
  userAnswer: string
  correctAnswer: string
}

type QuestionState = {
  selectedAnswer: string | null
  isCorrect: boolean | null
  isFlagged: boolean
  flagReason?: string
  flagId?: string
  upvotes?: number
}

function QuizDisplay({
  questions,
  onComplete,
  onBack,
  shuffleAnswers,
  studyMode = false,
  showOnlyCorrect = false,
  language = 'az',
  quizId,
  allQuestions,
}: {
  questions: Question[]
  onComplete: (score: number, incorrectAnswers: IncorrectAnswer[]) => void
  onBack?: () => void
  shuffleAnswers: boolean
  studyMode?: boolean
  showOnlyCorrect?: boolean
  language?: 'en' | 'az'
  quizId?: string
  allQuestions?: Question[]
}) {
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({ selectedAnswer: null, isCorrect: null, isFlagged: false }))
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [flaggingIndex, setFlaggingIndex] = useState<number | null>(null)
  const [tempFlagReason, setTempFlagReason] = useState('')
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  const flags = useQuery(api.flags.getFlags, { quizId: quizId || undefined })
  const flagQuestion = useMutation(api.flags.flagQuestion)
  const upvoteFlag = useMutation(api.flags.upvoteFlag)

  const globalFlags = useMemo(() => {
    const flagMap: Record<string, { reason: string; id: string; upvotes: number }> = {}
    flags?.forEach((f: any) => {
      flagMap[f.question] = { reason: f.reason, id: f._id, upvotes: f.upvotes }
    })
    return flagMap
  }, [flags])

  useEffect(() => {
    setQuestionStates(prev => {
      if (prev.length === questions.length && prev.length > 0) {
        return questions.map((q, i) => {
          const flagData = globalFlags[q.question]
          return {
            ...prev[i],
            isFlagged: !!flagData,
            flagReason: flagData?.reason,
            flagId: flagData?.id,
            upvotes: flagData?.upvotes || 0
          }
        })
      }
      return questions.map((q) => {
        const flagData = globalFlags[q.question]
        return {
          selectedAnswer: null,
          isCorrect: null,
          isFlagged: !!flagData,
          flagReason: flagData?.reason,
          flagId: flagData?.id,
          upvotes: flagData?.upvotes || 0
        }
      })
    })
  }, [questions, globalFlags])

  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [questions])

  const t = {
    en: {
      finish: 'Finish',
      questionOf: 'Question',
      of: 'of',
      score: 'Score',
      studyMode: 'Study Mode - Review Correct Answers',
      done: 'Done',
      flagTitle: 'Flag this question as wrong',
      flagReasonPlaceholder: 'Type the reason...',
      flagSubmit: 'Flag',
      flagged: 'Flagged as wrong',
      flagReason: 'Reason',
    },
    az: {
      finish: 'Bitir',
      questionOf: 'Sual',
      of: 'dən',
      score: 'Bal',
      studyMode: 'Öyrənmə Rejimi - Düzgün Cavabları Nəzərdən Keçirin',
      done: 'Tamamlandı',
      flagTitle: 'Bu sualı səhv kimi işarələ',
      flagReasonPlaceholder: 'Səbəbi yazın...',
      flagSubmit: 'İşarələ',
      flagged: 'Səhv kimi işarələnib',
      flagReason: 'Səbəb',
    }
  }

  const getText = (key: keyof typeof t.en) => t[language][key]

  const shuffledAnswersMap = useMemo(() => {
    if (!shuffleAnswers) return new Map()

    const map = new Map<number, string[]>()
    questions.forEach((q, idx) => {
      map.set(idx, [...q.answers].sort(() => Math.random() - 0.5))
    })
    return map
  }, [questions, shuffleAnswers])

  const handleAnswer = (questionIndex: number, answer: string) => {
    if (studyMode) return

    const question = questions[questionIndex]
    const currentState = questionStates[questionIndex]

    if (currentState.selectedAnswer !== null) return

    const correct = answer === question.correct_answer

    const newStates = [...questionStates]
    newStates[questionIndex] = { ...newStates[questionIndex], selectedAnswer: answer, isCorrect: correct }
    setQuestionStates(newStates)

    const smoothScrollTo = (element: HTMLElement) => {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition - (window.innerHeight / 2) + (element.offsetHeight / 2)
      const duration = 1000
      let start: number | null = null

      const easeInOutCubic = (t: number): number => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        const ease = easeInOutCubic(progress)

        window.scrollTo(0, startPosition + distance * ease)

        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }

      requestAnimationFrame(animation)
    }

    setTimeout(() => {
      if (questionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(questionIndex + 1)
        const nextElement = questionRefs.current[questionIndex + 1]
        if (nextElement) {
          smoothScrollTo(nextElement)
        }
      }
    }, 800)
  }

  const handleFlagSubmit = async (index: number) => {
    if (!tempFlagReason.trim() || !quizId) return

    const questionText = questions[index].question
    try {
      await flagQuestion({
        quizId,
        question: questionText,
        reason: tempFlagReason,
      })
      setFlaggingIndex(null)
      setTempFlagReason('')
    } catch (error) {
      console.error('Failed to flag question', error)
    }
  }

  const handleUpvote = async (index: number) => {
    const state = questionStates[index]
    if (!state.flagId) return

    try {
      await upvoteFlag({ id: state.flagId as any })
    } catch (error) {
      console.error('Failed to upvote', error)
    }
  }

  // Sync current question index with scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = questionRefs.current.findIndex(ref => ref === entry.target)
            if (index !== -1) {
              setCurrentQuestionIndex(index)
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // Trigger when element is in the middle 10% of screen
        threshold: 0
      }
    )

    questionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [questions.length])

  const handleFinish = () => {
    try {
      const score = questionStates.filter(state => state.isCorrect === true || state.isFlagged).length
      const incorrectAnswers: IncorrectAnswer[] = []

      questionStates.forEach((state, idx) => {
        if (state.isCorrect === false && state.selectedAnswer && !state.isFlagged) {
          incorrectAnswers.push({
            question: questions[idx].question,
            userAnswer: state.selectedAnswer,
            correctAnswer: questions[idx].correct_answer
          })
        }
      })

      onComplete(score, incorrectAnswers)
    } catch (error) {
      // If there's an error processing results, still complete with basic score
      console.error('Error processing quiz results:', error)
      const score = questionStates.filter(state => state.isCorrect === true).length
      onComplete(score, [])
    }
  }

  const allAnswered = questionStates.every(state => state.selectedAnswer !== null || state.isFlagged)
  const score = questionStates.filter(state => state.isCorrect === true || state.isFlagged).length
  const answeredCount = questionStates.filter(state => state.selectedAnswer !== null || state.isFlagged).length

  // In study mode, show all questions immediately
  if (studyMode) {
    return (
      <div className="w-full min-h-screen bg-background">
        {/* Fixed Header for Study Mode */}
        <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10 py-2 sm:py-3 shadow-sm">
          <div className="container mx-auto max-w-5xl px-4 sm:px-8 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm hidden sm:inline">Geri</span>
                </button>
              )}
              <span className="text-sm sm:text-base font-semibold text-foreground">
                {getText('studyMode')}
              </span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Questions List - All shown with correct answers */}
        <div className="pt-16 sm:pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 leading-relaxed">
          {questions.map((question, questionIndex) => {
            const displayAnswers = shuffledAnswersMap.get(questionIndex) || question.answers
            const questionNumber = question._originalIndex !== undefined ? question._originalIndex + 1 : questionIndex + 1

            return (
              <div
                key={questionIndex}
                className="mb-12"
              >
                {/* Question */}
                <div className="mb-4">
                  <p className="text-foreground text-lg">
                    <span className="mr-2">{questionNumber}.</span>
                    <span className="whitespace-pre-line">{question.question}</span>
                  </p>
                </div>

                {/* Answer Options - Only correct answer highlighted */}
                <div className="space-y-2 ml-8">
                  {displayAnswers.map((answer: string, ansIndex: number) => {
                    const isCorrectAnswer = answer === question.correct_answer
                    const letter = String.fromCharCode(65 + ansIndex)

                    // Skip incorrect answers if showOnlyCorrect is enabled
                    if (showOnlyCorrect && !isCorrectAnswer) {
                      return null
                    }

                    return (
                      <div
                        key={ansIndex}
                        className="w-full text-left py-1 px-2"
                      >
                        <span className={`text-lg whitespace-pre-line ${isCorrectAnswer ? 'text-success font-bold' : 'text-foreground font-normal'}`}>
                          {letter}) {answer}
                        </span>
                        {isCorrectAnswer && <span className="ml-2 text-success">✓</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Fixed Done Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 sm:py-4 shadow-lg">
          <div className="container mx-auto max-w-5xl px-4 sm:px-8 flex justify-end">
            <button
              onClick={() => onComplete(0, [])}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              {getText('done')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Fixed Header with Score */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10 py-2 sm:py-3 shadow-sm">
        <div className="container mx-auto max-w-5xl px-4 sm:px-8 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm hidden sm:inline">Geri</span>
              </button>
            )}
            <span className="text-sm sm:text-base text-foreground">
              {getText('questionOf')} {answeredCount} {getText('of')} {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base font-semibold text-foreground">
              {getText('score')}: {score}/{answeredCount}
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="pt-16 sm:pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 leading-relaxed">
        {questions.map((question, questionIndex) => {
          const state = questionStates[questionIndex]
          const displayAnswers = shuffledAnswersMap.get(questionIndex) || question.answers
          const questionNumber = question._originalIndex !== undefined ? question._originalIndex + 1 : questionIndex + 1

          return (
            <div
              key={questionIndex}
              ref={el => { questionRefs.current[questionIndex] = el }}
              className="mb-12"
            >
              {/* Question */}
              <div className="mb-4">
                <p className="text-foreground text-lg">
                  <span className="mr-2">{questionNumber}.</span>
                  <span className="whitespace-pre-line">{question.question}</span>
                </p>
              </div>

              {/* Flag Badge and Reason */}
              {state.isFlagged && (
                <div className="mb-4">
                  <Alert variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
                      <span className="break-words">
                        <span className="font-semibold">{t[language].flagged}:</span> {state.flagReason}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 self-start sm:self-auto text-amber-600 hover:text-amber-700 hover:bg-amber-500/20 shrink-0"
                        onClick={() => handleUpvote(questionIndex)}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span className="text-xs">{state.upvotes || 0}</span>
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Flag Interface */}
              <div className="flex items-center gap-4 mb-4">
                {!state.isFlagged && flaggingIndex !== questionIndex && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlaggingIndex(questionIndex)}
                    className="text-muted-foreground hover:text-amber-500 hover:bg-amber-50/50"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {t[language].flagTitle}
                  </Button>
                )}
                {flaggingIndex === questionIndex && (
                  <div className="flex-1 space-y-2">
                    <Card className="border-amber-500/30">
                      <CardContent className="p-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            autoFocus
                            placeholder={t[language].flagReasonPlaceholder}
                            value={tempFlagReason}
                            onChange={(e) => setTempFlagReason(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFlagSubmit(questionIndex)
                              if (e.key === 'Escape') setFlaggingIndex(null)
                            }}
                            className="flex-1 h-11"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFlagSubmit(questionIndex)}
                              className="bg-amber-600 hover:bg-amber-700 text-white flex-1 sm:flex-none h-11"
                            >
                              {t[language].flagSubmit}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFlaggingIndex(null)
                                setTempFlagReason('')
                              }}
                              className="flex-1 sm:flex-none h-11"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-2 ml-8">
                {displayAnswers.map((answer: string, ansIndex: number) => {
                  const isSelected = state.selectedAnswer === answer
                  const isCorrectAnswer = answer === question.correct_answer
                  const letter = String.fromCharCode(65 + ansIndex)
                  const answered = state.selectedAnswer !== null

                  let textColor = 'text-foreground'
                  let backgroundColor = ''
                  let fontWeight = 'font-normal'

                  if (answered) {
                    if (isCorrectAnswer) {
                      fontWeight = 'font-bold'
                      textColor = 'text-success'
                    } else if (isSelected) {
                      textColor = 'text-error'
                    }
                  } else if (state.isFlagged) {
                    if (isCorrectAnswer) {
                      fontWeight = 'font-bold'
                      textColor = 'text-orange-500'
                    }
                  } else if (isSelected) {
                    backgroundColor = 'bg-muted'
                  }

                  return (
                    <button
                      key={ansIndex}
                      onClick={() => handleAnswer(questionIndex, answer)}
                      disabled={answered}
                      className={`w-full text-left py-1 px-2 transition-colors ${backgroundColor} ${answered ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'}`}
                    >
                      <span className={`text-lg whitespace-pre-line ${textColor} ${fontWeight}`}>
                        {letter}){' '}
                        {answer}
                      </span>
                      {answered && isCorrectAnswer && <span className="ml-2 text-success">✓</span>}
                      {answered && isSelected && !state.isCorrect && <span className="ml-2 text-error">✗</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed Finish Button */}
      {allAnswered && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 sm:py-4 shadow-lg">
          <div className="container mx-auto max-w-5xl px-4 sm:px-8 flex justify-end">
            <button
              onClick={handleFinish}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              {getText('finish')}
            </button>
          </div>
        </div>
      )}

      {/* Question Slider */}
      <QuestionSlider
        totalQuestions={questions.length}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={(index) => {
          setCurrentQuestionIndex(index)
          const element = questionRefs.current[index]
          if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2) + (element.offsetHeight / 2)
            window.scrollTo({ top: y, behavior: 'auto' })
          }
        }}
      />
    </div>
  )
}

export default QuizDisplay
