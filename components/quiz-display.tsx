'use client'

import { useState, useMemo, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([])

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const t = {
    en: {
      nextQuestion: 'Next Question',
      finish: 'Finish',
      questionOf: 'Question',
      of: 'of',
      score: 'Score',
    },
    az: {
      nextQuestion: 'Sonrakı Sual',
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

    const map = new Map<string, string[]>()
    questions.forEach(q => {
      map.set(q.question, [...q.answers].sort(() => Math.random() - 0.5))
    })
    return map
  }, [questions, shuffleAnswers])

  const displayAnswers = useMemo(() => {
    const shuffled = shuffledAnswersMap.get(currentQuestion.question)
    return shuffled || currentQuestion.answers
  }, [currentIndex, shuffledAnswersMap, currentQuestion.question, currentQuestion.answers])

  const handleAnswer = (answer: string) => {
    if (answered) return

    setSelectedAnswer(answer)
    const correct = answer === currentQuestion.correct_answer
    setIsCorrect(correct)
    setAnswered(true)

    if (correct) {
      setScore(score + 1)
    } else {
      setIncorrectAnswers(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: answer,
        correctAnswer: currentQuestion.correct_answer
      }])
    }
  }

  const handleNext = () => {
    if (quizId && allQuestions) {
      let questionIndex = currentQuestion._originalIndex

      // Fallback to findIndex if _originalIndex is not available
      if (questionIndex === undefined) {
        questionIndex = allQuestions.findIndex(
          q => q.question === currentQuestion.question
        )
      }

      if (questionIndex !== -1 && questionIndex !== undefined) {
        const stored = localStorage.getItem(`quiz-progress-${quizId}`)
        const answeredSet = stored ? new Set(JSON.parse(stored)) : new Set()
        answeredSet.add(questionIndex)
        localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify([...answeredSet]))
      }
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setAnswered(false)
    } else {
      onComplete(score, incorrectAnswers)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto font-serif">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border-2 border-border rounded-lg p-8 shadow-lg"
        >
          {/* Question Number Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                {currentIndex + 1}
              </div>
              <span className="text-sm text-muted-foreground">
                {getText('questionOf')} {currentIndex + 1} {getText('of')} {questions.length}
              </span>
            </div>
            <span className="text-sm text-foreground">
              {getText('score')}: <span className="text-primary font-bold">{score}/{currentIndex + (answered ? 1 : 0)}</span>
            </span>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {displayAnswers.map((answer: string, ansIndex: number) => {
              const isSelected = selectedAnswer === answer
              const isCorrectAnswer = answer === currentQuestion.correct_answer
              const letter = String.fromCharCode(65 + ansIndex)

              let buttonClass = 'border-2 border-border hover:bg-muted/50'
              let circleClass = 'border-2 border-foreground/30 text-foreground/70'

              if (answered) {
                if (isCorrectAnswer) {
                  buttonClass = 'border-success bg-success/10'
                  circleClass = 'bg-success text-success-foreground border-success'
                } else if (isSelected) {
                  buttonClass = 'border-error bg-error/10'
                  circleClass = 'bg-error text-error-foreground border-error'
                }
              } else if (isSelected) {
                buttonClass = 'border-primary bg-primary/5'
                circleClass = 'bg-primary text-primary-foreground border-primary'
              }

              return (
                <button
                  key={ansIndex}
                  onClick={() => handleAnswer(answer)}
                  disabled={answered}
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-colors focus:outline-none ${buttonClass} ${answered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${circleClass}`}>
                    {letter}
                  </span>
                  <span className="text-left flex-1">{answer}</span>
                  {answered && isCorrectAnswer && <CheckCircle className="w-5 h-5 text-success" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-error" />}
                </button>
              )
            })}
          </div>

          {/* Next Button */}
          {answered && (
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {currentIndex + 1 === questions.length ? getText('finish') : getText('nextQuestion')}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default QuizDisplay
