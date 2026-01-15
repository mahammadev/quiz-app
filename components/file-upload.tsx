"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Save } from "lucide-react"
import { getTranslation, type Language } from "@/lib/translations"
import { type Question, parseQuestions } from "@/lib/quiz"
import QuizLibrary from "./quiz-library"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FileUpload({
  onFileLoaded,
  language = "en",
  enableUpload = false,
  enableStart = true,
}: {
  onFileLoaded: (questions: Question[], id?: string) => void
  language?: Language
  enableUpload?: boolean
  enableStart?: boolean
}) {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pastedText, setPastedText] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null)
  const [quizName, setQuizName] = useState("")
  const saveQuiz = useMutation(api.quizzes.create)

  const handleFileUpload = async (file: File) => {
    setError("")
    setLoading(true)

    try {
      const content = await file.text()
      const questions = parseQuestions(content, language)
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
      const questions = parseQuestions(pastedText, language)
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
      await saveQuiz({
        name: quizName.trim(),
        questions: parsedQuestions as any,
      })

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
    if (enableStart && parsedQuestions) {
      onFileLoaded(parsedQuestions)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">
          {getTranslation(language, "library.saved")}
        </h2>
        {enableUpload && (
          <Button
            onClick={() => {
              setShowUpload(true)
              setPasteMode(false)
              setError("")
            }}
            className="cursor-target"
          >
            {getTranslation(language, "upload.title")}
          </Button>
        )}
      </div>

      {enableUpload && showUpload && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-foreground">{getTranslation(language, "upload.title")}</CardTitle>
              <CardDescription>{getTranslation(language, "upload.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parsedQuestions ? (
                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{parsedQuestions.length} questions loaded</h3>
                    <Button
                      onClick={() => setParsedQuestions(null)}
                      variant="ghost"
                      className="cursor-target text-sm text-muted-foreground hover:text-foreground"
                    >
                      {getTranslation(language, "library.cancelBtn")}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-card-foreground">Quiz Name</Label>
                      <Input
                        type="text"
                        value={quizName}
                        onChange={(e) => setQuizName(e.target.value)}
                        placeholder={getTranslation(language, "library.namePlaceholder")}
                        className="cursor-target"
                      />
                    </div>

                    <div className="flex gap-3">
                      {enableStart && (
                        <Button
                          onClick={handleStartQuiz}
                          className="flex-1 cursor-target"
                        >
                          {getTranslation(language, "library.startBtn")}
                        </Button>
                      )}
                      <Button
                        onClick={handleSaveToLibrary}
                        disabled={!quizName.trim()}
                        variant="outline"
                        className="cursor-target flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {getTranslation(language, "library.saveBtn")}
                      </Button>
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

                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        variant="outline"
                        className="cursor-target w-full border-primary/40 bg-background/80 hover:bg-primary/5"
                      >
                        {loading
                          ? getTranslation(language, "upload.loading")
                          : getTranslation(language, "upload.uploadBtn")}
                      </Button>

                      <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="cursor-target rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <Upload className="mx-auto mb-3 h-8 w-8 text-primary" />
                        <p className="font-medium text-foreground">{getTranslation(language, "upload.dragDrop")}</p>
                        <p className="text-sm text-muted-foreground mt-1">or browse files</p>
                      </div>

                      <Button
                        onClick={() => setPasteMode(true)}
                        variant="ghost"
                        className="cursor-target w-full text-sm text-muted-foreground hover:text-foreground"
                      >
                        {getTranslation(language, "upload.pasteBtn")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="cursor-target w-full font-mono text-sm"
                        rows={10}
                      />

                      <div className="flex gap-3">
                        <Button
                          onClick={handlePaste}
                          disabled={loading || !pastedText.trim()}
                          className="flex-1 cursor-target"
                        >
                          {loading
                            ? getTranslation(language, "upload.loading")
                            : getTranslation(language, "upload.loadBtn")}
                        </Button>

                        <Button
                          onClick={() => {
                            setPasteMode(false)
                            setPastedText("")
                            setError("")
                          }}
                          variant="outline"
                          className="cursor-target flex-1"
                        >
                          {getTranslation(language, "upload.cancelBtn")}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/60 border-border/60">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{getTranslation(language, "upload.format")}:</span>{" "}
                {getTranslation(language, "upload.formatDesc")}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowUpload(false)}
              variant="outline"
              className="cursor-target"
            >
              {getTranslation(language, "upload.cancelBtn")}
            </Button>
          </div>
        </div>
      )}

      <QuizLibrary onSelectQuiz={onFileLoaded} language={language} />
    </div>
  )
}
