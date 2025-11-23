"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Save } from "lucide-react"
import { getTranslation, type Language } from "@/lib/translations"
import QuizLibrary from "./quiz-library"
import { createClient } from "@/lib/supabase/client"

type Question = {
  question: string
  answers: string[]
  correct_answer: string
}

export default function FileUpload({
  onFileLoaded,
  language = "en",
}: {
  onFileLoaded: (questions: Question[]) => void
  language?: Language
}) {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pastedText, setPastedText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null)
  const [quizName, setQuizName] = useState("")
  const [libraryRefresh, setLibraryRefresh] = useState(0)
  const supabase = createClient()

  const parseQuestions = (content: string) => {
    const data = JSON.parse(content)
    const questions = Array.isArray(data) ? data : [data]

    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.answers) || !q.correct_answer) {
        throw new Error(getTranslation(language, "upload.errorMsg", { index: idx + 1 }))
      }
    })

    return questions
  }

  const handleFileUpload = async (file: File) => {
    setError("")
    setLoading(true)

    try {
      const content = await file.text()
      const questions = parseQuestions(content)
      setParsedQuestions(questions)
      setQuizName(file.name.replace(".json", ""))
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation(language, "upload.parseError"))
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = () => {
    setError("")
    setLoading(true)

    try {
      const questions = parseQuestions(pastedText)
      setParsedQuestions(questions)
      setQuizName("My Quiz")
    } catch (err) {
      setError(err instanceof Error ? err.message : getTranslation(language, "upload.parseErrorPaste"))
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".json")) {
      handleFileUpload(file)
    } else {
      setError(getTranslation(language, "upload.fileError"))
    }
  }

  const handleSaveToLibrary = async () => {
    if (!parsedQuestions || !quizName.trim()) return

    try {
      const { error } = await supabase.from("quizzes").insert({
        name: quizName.trim(),
        questions: parsedQuestions,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      setLibraryRefresh((prev) => prev + 1)
      setParsedQuestions(null)
      setPasteMode(false)
      setPastedText("")
      alert(getTranslation(language, "library.saveSuccess"))
    } catch (e) {
      console.error("Failed to save quiz", e)
      setError("Failed to save quiz to database")
    }
  }

  const handleStartQuiz = () => {
    if (parsedQuestions) {
      onFileLoaded(parsedQuestions)
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2 items-start">
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-border bg-card p-8">
          <h1 className="mb-2 text-3xl font-bold text-card-foreground">{getTranslation(language, "upload.title")}</h1>
          <p className="mb-6 text-muted-foreground">{getTranslation(language, "upload.subtitle")}</p>

          {parsedQuestions ? (
            <div className="space-y-4 rounded-lg border-2 border-border bg-muted p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{parsedQuestions.length} questions loaded</h3>
                <button
                  onClick={() => setParsedQuestions(null)}
                  className="cursor-target text-sm text-muted-foreground hover:text-foreground"
                >
                  {getTranslation(language, "library.cancelBtn")}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-card-foreground">Quiz Name</label>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder={getTranslation(language, "library.namePlaceholder")}
                    className="cursor-target w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStartQuiz}
                    className="cursor-target flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    {getTranslation(language, "library.startBtn")}
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={!quizName.trim()}
                    className="cursor-target flex items-center justify-center gap-2 rounded-lg border-2 border-border px-4 py-3 font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {getTranslation(language, "library.saveBtn")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!pasteMode ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="cursor-target w-full rounded-lg border-2 border-border px-4 py-3 font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? getTranslation(language, "upload.loading")
                      : getTranslation(language, "upload.uploadBtn")}
                  </button>

                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="cursor-target rounded-lg border-2 border-dashed border-muted-foreground/50 p-8 text-center transition-colors hover:border-muted-foreground"
                  >
                    <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="font-semibold text-foreground">{getTranslation(language, "upload.dragDrop")}</p>
                  </div>

                  <button
                    onClick={() => setPasteMode(true)}
                    className="cursor-target w-full rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {getTranslation(language, "upload.pasteBtn")}
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your JSON here..."
                    className="cursor-target w-full rounded-lg border-2 border-border bg-background p-4 font-mono text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={10}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handlePaste}
                      disabled={loading || !pastedText.trim()}
                      className="cursor-target flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading
                        ? getTranslation(language, "upload.loading")
                        : getTranslation(language, "upload.loadBtn")}
                    </button>

                    <button
                      onClick={() => {
                        setPasteMode(false)
                        setPastedText("")
                        setError("")
                      }}
                      className="cursor-target flex-1 rounded-lg border-2 border-border px-4 py-3 font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      {getTranslation(language, "upload.cancelBtn")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {error && <div className="rounded-lg bg-error/10 border border-error/20 p-4 text-error">{error}</div>}
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">{getTranslation(language, "upload.format")}:</span>{" "}
            {getTranslation(language, "upload.formatDesc")}
          </p>
        </div>
      </div>

      <QuizLibrary onSelectQuiz={onFileLoaded} language={language} refreshTrigger={libraryRefresh} />
    </div>
  )
}
