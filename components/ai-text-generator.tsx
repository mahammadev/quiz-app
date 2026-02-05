"use client"

import { useState, useRef } from "react"
import { Sparkles, Loader2, AlertCircle, CheckCircle, Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getTranslation, type Language } from "@/lib/translations"
import type { Question } from "@/lib/quiz"

interface AITextGeneratorProps {
    language: Language
    onQuestionsGenerated: (questions: Question[]) => void
    onCancel: () => void
}

type InputMode = "text" | "file"

interface ProcessingMetadata {
    totalCharacters?: number
    pageCount?: number
    chunksProcessed?: number
    duplicatesRemoved?: number
}

export function AITextGenerator({ language, onQuestionsGenerated, onCancel }: AITextGeneratorProps) {
    const [inputMode, setInputMode] = useState<InputMode>("text")
    const [text, setText] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [progressMessage, setProgressMessage] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null)
    const [metadata, setMetadata] = useState<ProcessingMetadata | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get usage info from Convex
    const usage = useQuery(api.ai.getUsage)
    const recordUsage = useMutation(api.ai.recordUsage)

    const canGenerate = usage?.plan !== "free" || (usage?.count ?? 0) < (usage?.limit ?? 3)
    const remainingGenerations = usage?.plan === "free" ? Math.max(0, (usage?.limit ?? 3) - (usage?.count ?? 0)) : Infinity

    const handleTextGenerate = async () => {
        if (!text.trim() || text.length < 50) {
            setError("Please enter at least 50 characters of text to generate questions from.")
            return
        }

        setError(null)
        setLoading(true)
        setProgress(10)
        setProgressMessage("Sending to AI...")

        try {
            setProgress(30)
            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.trim() }),
            })

            setProgress(80)
            setProgressMessage("Processing response...")

            const data = await response.json()

            if (!response.ok) {
                if (data.code === "LIMIT_REACHED") {
                    setError("You've reached your free tier limit of 3 AI generations per month. Upgrade to Pro for unlimited generations.")
                } else {
                    setError(data.error || "Failed to generate questions")
                }
                return
            }

            if (data.success && data.questions) {
                setProgress(100)
                setGeneratedQuestions(data.questions)
                await recordUsage()
            } else {
                setError("No questions were generated. Try providing more detailed text.")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unexpected error occurred")
        } finally {
            setLoading(false)
            setProgress(0)
            setProgressMessage("")
        }
    }

    const handleFileGenerate = async () => {
        if (!selectedFile) {
            setError("Please select a file first.")
            return
        }

        setError(null)
        setLoading(true)
        setProgress(5)
        setProgressMessage("Uploading file...")

        try {
            const formData = new FormData()
            formData.append("file", selectedFile)

            setProgress(15)
            setProgressMessage("Extracting text from document...")

            const response = await fetch("/api/ai/generate-pdf", {
                method: "POST",
                body: formData,
            })

            setProgress(60)
            setProgressMessage("Generating questions with AI...")

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to process document")
                return
            }

            if (data.success && data.questions) {
                setProgress(100)
                setProgressMessage("Complete!")
                setGeneratedQuestions(data.questions)
                setMetadata(data.metadata)
                await recordUsage()
            } else {
                setError("No questions could be generated from this document.")
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unexpected error occurred")
        } finally {
            setLoading(false)
            setTimeout(() => {
                setProgress(0)
                setProgressMessage("")
            }, 1000)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const allowedTypes = ["application/pdf", "text/plain"]
            if (!allowedTypes.includes(file.type)) {
                setError("Only PDF and TXT files are supported.")
                return
            }
            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.")
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            const allowedTypes = ["application/pdf", "text/plain"]
            if (!allowedTypes.includes(file.type)) {
                setError("Only PDF and TXT files are supported.")
                return
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit.")
                return
            }
            setSelectedFile(file)
            setError(null)
        }
    }

    const handleUseQuestions = () => {
        if (generatedQuestions) {
            onQuestionsGenerated(generatedQuestions)
        }
    }

    const handleRetry = () => {
        setGeneratedQuestions(null)
        setMetadata(null)
        setError(null)
        setSelectedFile(null)
        setText("")
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl font-bold text-foreground">
                        AI Quiz Generator
                    </CardTitle>
                    <Badge variant={usage?.plan === "free" ? "secondary" : "default"}>
                        {usage?.plan === "free" ? `${remainingGenerations} left` : "Unlimited"}
                    </Badge>
                </div>
                <CardDescription>
                    Paste text or upload a document and let AI create quiz questions automatically
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {generatedQuestions ? (
                    // Show generated questions preview
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">
                                {generatedQuestions.length} questions generated!
                            </span>
                        </div>

                        {metadata && (
                            <div className="text-xs text-muted-foreground flex gap-4">
                                {metadata.pageCount && <span>{metadata.pageCount} pages</span>}
                                {metadata.totalCharacters && <span>{metadata.totalCharacters.toLocaleString()} chars</span>}
                                {metadata.duplicatesRemoved ? <span>{metadata.duplicatesRemoved} duplicates removed</span> : null}
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                            {generatedQuestions.slice(0, 3).map((q, idx) => (
                                <div key={idx} className="text-sm">
                                    <p className="font-medium text-foreground">
                                        {idx + 1}. {q.question}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        Correct: {q.correct_answer}
                                    </p>
                                </div>
                            ))}
                            {generatedQuestions.length > 3 && (
                                <p className="text-xs text-muted-foreground italic">
                                    ...and {generatedQuestions.length - 3} more questions
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleUseQuestions} className="flex-1">
                                Use These Questions
                            </Button>
                            <Button onClick={handleRetry} variant="outline" className="flex-1">
                                Generate New
                            </Button>
                            <Button onClick={onCancel} variant="ghost">
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Show input options
                    <>
                        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    Paste Text
                                </TabsTrigger>
                                <TabsTrigger value="file" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload File
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-4 mt-4">
                                <Textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste your study material, article, or any text here... (minimum 50 characters)"
                                    className="min-h-[200px] resize-y font-normal"
                                    disabled={loading}
                                />

                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{text.length} characters</span>
                                    {text.length > 0 && text.length < 50 && (
                                        <span className="text-amber-500">
                                            {50 - text.length} more characters needed
                                        </span>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="file" className="space-y-4 mt-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{selectedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedFile(null)}
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleFileDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/30 p-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
                                    >
                                        <Upload className="mx-auto mb-3 h-8 w-8 text-primary" />
                                        <p className="font-medium text-foreground">
                                            Drop a PDF or TXT file here
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            or click to browse (max 10MB)
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Progress indicator */}
                        {loading && (
                            <div className="space-y-2">
                                <Progress value={progress} className="h-2" />
                                <p className="text-sm text-muted-foreground text-center">
                                    {progressMessage}
                                </p>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {!canGenerate && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    You've used all your free AI generations this month.{" "}
                                    <a href="/pricing" className="underline font-medium">
                                        Upgrade to Pro
                                    </a>{" "}
                                    for unlimited generations.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={inputMode === "text" ? handleTextGenerate : handleFileGenerate}
                                disabled={
                                    loading ||
                                    !canGenerate ||
                                    (inputMode === "text" ? text.length < 50 : !selectedFile)
                                }
                                className="flex-1 gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {inputMode === "file" ? "Processing..." : "Generating..."}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate Quiz
                                    </>
                                )}
                            </Button>
                            <Button onClick={onCancel} variant="outline">
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
