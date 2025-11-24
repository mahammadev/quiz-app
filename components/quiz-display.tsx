'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

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
  shuffleAnswers,
  language = 'az',
  quizId,
  allQuestions,
}: {
  questions: Question[]
  onComplete: (score: number, incorrectAnswers: IncorrectAnswer[]) => void
  shuffleAnswers: boolean
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
    },
    az: {
      finish: 'Bitir',
      questionOf: 'Sual',
      of: 'dən',
      score: 'Bal',
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

  return (
    <div className="w-full min-h-screen font-serif">
      {/* Fixed Header with Score */}
      <div className="fixed top-0 left-0 right-0 glass-dark border-b border-border/30 z-10 py-4 shadow-lg">
        <div className="container mx-auto max-w-4xl px-4 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            {getText('questionOf')} {answeredCount} {getText('of')} {questions.length}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {getText('score')}: <span className="text-primary text-lg">{score}/{answeredCount}</span>
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="pt-20 pb-20 space-y-8 max-w-4xl mx-auto px-4">
        {questions.map((question, questionIndex) => {
          const state = questionStates[questionIndex]
          const displayAnswers = shuffledAnswersMap.get(questionIndex) || question.answers
          const questionNumber = question._originalIndex !== undefined ? question._originalIndex + 1 : questionIndex + 1

          return (
            <div
              key={questionIndex}
              ref={el => { questionRefs.current[questionIndex] = el }}
              className="min-h-[60vh] flex items-center"
            >
              <div className="w-full space-y-6">
                {/* Question Header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-bg border-2 border-primary/20 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 text-white shadow-lg shadow-primary/20">
                    {questionNumber}
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {question.question}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 pl-16">
                  {displayAnswers.map((answer: string, ansIndex: number) => {
                    const isSelected = state.selectedAnswer === answer
                    const isCorrectAnswer = answer === question.correct_answer
                    const letter = String.fromCharCode(65 + ansIndex)
                    const answered = state.selectedAnswer !== null

                    let buttonClass = 'hover:bg-primary/5 hover:border-primary/30 hover:scale-[1.01]'
                    let circleClass = 'border-2 border-foreground/20 text-foreground/70 bg-muted/30'

                    if (answered) {
                      if (isCorrectAnswer) {
                        buttonClass = 'border-success/50 bg-success/10 shadow-md shadow-success/10'
                        circleClass = 'bg-gradient-to-br from-success to-success/80 text-success-foreground border-success shadow-lg shadow-success/30'
                      } else if (isSelected) {
                        buttonClass = 'border-error/50 bg-error/10 shadow-md shadow-error/10'
                        circleClass = 'bg-gradient-to-br from-error to-error/80 text-error-foreground border-error shadow-lg shadow-error/30'
                      }
                    } else if (isSelected) {
                      buttonClass = 'border-primary/50 bg-primary/5 scale-[1.01]'
                      circleClass = 'bg-gradient-bg text-white border-primary shadow-lg shadow-primary/30'
                    }

                    return (
                      <button
                        key={ansIndex}
                        onClick={() => handleAnswer(questionIndex, answer)}
                        disabled={answered}
                        className={`w-full p-4 rounded-xl border-2 border-border/30 flex items-center gap-3 transition-all duration-200 focus:outline-none ${buttonClass} ${answered ? 'cursor-default' : 'cursor-pointer'
                          }`}
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${circleClass}`}>
                          {letter}
                        </span>
                        <span className="text-left flex-1 font-medium">{answer}</span>
                        {answered && isCorrectAnswer && <CheckCircle className="w-6 h-6 text-success" />}
                        {answered && isSelected && !state.isCorrect && <XCircle className="w-6 h-6 text-error" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed Finish Button */}
      {allAnswered && (
        <div className="fixed bottom-0 left-0 right-0 glass-dark border-t border-border/30 py-4 shadow-lg">
          <div className="container mx-auto max-w-4xl px-4 flex justify-end">
            <button
              onClick={handleFinish}
              className="btn-gradient animate-glow"
            >
              {getText('finish')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizDisplay
