'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { QuestionSlider } from './question-slider'
import ThemeSwitcher from './theme-switcher'

type Question = {
  question: string
  answers: string[]
  correct_answer: string
  _originalIndex?: number
}

export type IncorrectAnswer = {
  question: string
  userAnswer: string
  correctAnswer: string
}

type QuestionState = {
  selectedAnswer: string | null
  isCorrect: boolean | null
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
    questions.map(() => ({ selectedAnswer: null, isCorrect: null }))
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  const t = {
    en: {
      finish: 'Finish',
      questionOf: 'Question',
      of: 'of',
      score: 'Score',
      studyMode: 'Study Mode - Review Correct Answers',
      done: 'Done',
    },
    az: {
      finish: 'Bitir',
      questionOf: 'Sual',
      of: 'dən',
      score: 'Bal',
      studyMode: 'Öyrənmə Rejimi - Düzgün Cavabları Nəzərdən Keçirin',
      done: 'Tamamlandı',
    }
  }

  const getText = (key: keyof typeof t.en) => t[language][key]

  // Memoize shuffled answers for all questions to prevent re-shuffling
  const shuffledAnswersMap = useMemo(() => {
    if (!shuffleAnswers) return new Map()

    const map = new Map<number, string[]>()
    questions.forEach((q, idx) => {
      map.set(idx, [...q.answers].sort(() => Math.random() - 0.5))
    })
    return map
  }, [questions, shuffleAnswers])

  const handleAnswer = (questionIndex: number, answer: string) => {
    // Disable answers in study mode
    if (studyMode) return

    const question = questions[questionIndex]
    const currentState = questionStates[questionIndex]

    // Prevent re-answering
    if (currentState.selectedAnswer !== null) return

    const correct = answer === question.correct_answer

    // Update question state
    const newStates = [...questionStates]
    newStates[questionIndex] = { selectedAnswer: answer, isCorrect: correct }
    setQuestionStates(newStates)

    // Save progress to localStorage
    if (quizId && allQuestions) {
      let originalIndex = question._originalIndex
      if (originalIndex === undefined) {
        originalIndex = allQuestions.findIndex(q => q.question === question.question)
      }
      if (originalIndex !== -1 && originalIndex !== undefined) {
        const stored = localStorage.getItem(`quiz-progress-${quizId}`)
        const answeredSet = stored ? new Set(JSON.parse(stored)) : new Set()
        answeredSet.add(originalIndex)
        localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify([...answeredSet]))
      }
    }

    // Custom scroll function with ease-out curve (starts fast, ends slow)
    const smoothScrollTo = (element: HTMLElement) => {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition - (window.innerHeight / 2) + (element.offsetHeight / 2)
      const duration = 1000 // ms
      let start: number | null = null

      // Ease-in-out cubic function (slow-normal-slow)
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

    // Auto-scroll to next question after a short delay
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
    const score = questionStates.filter(state => state.isCorrect === true).length
    const incorrectAnswers: IncorrectAnswer[] = []

    questionStates.forEach((state, idx) => {
      if (state.isCorrect === false && state.selectedAnswer) {
        incorrectAnswers.push({
          question: questions[idx].question,
          userAnswer: state.selectedAnswer,
          correctAnswer: questions[idx].correct_answer
        })
      }
    })

    onComplete(score, incorrectAnswers)
  }

  const allAnswered = questionStates.every(state => state.selectedAnswer !== null)
  const score = questionStates.filter(state => state.isCorrect === true).length
  const answeredCount = questionStates.filter(state => state.selectedAnswer !== null).length

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
                    <span>{question.question}</span>
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
                        <span className={`text-lg ${isCorrectAnswer ? 'text-success font-bold' : 'text-foreground font-normal'}`}>
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
                  <span>{question.question}</span>
                </p>
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
                      <span className={`text-lg ${textColor} ${fontWeight}`}>
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
