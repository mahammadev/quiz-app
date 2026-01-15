'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, Trash2, Edit2, Check, X, LogOut, ArrowLeft, FileJson, Play, Save, Pencil, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUpload from '@/components/file-upload'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { SignOutButton, useUser } from "@clerk/nextjs";

export default function AdminPage() {
    const [selectedQuizId, setSelectedQuizId] = useState('all')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editReason, setEditReason] = useState('')
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
    const [editQuizValue, setEditQuizValue] = useState('')
    const [editQuizError, setEditQuizError] = useState('')
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const { user, isLoaded: isUserLoaded } = useUser()
    const isAdmin = isUserLoaded && user?.publicMetadata?.role === 'admin'
    const quizzes = useQuery(api.quizzes.list)
    const rawFlags = useQuery(api.flags.getFlags, { quizId: selectedQuizId === 'all' ? undefined : selectedQuizId })

    const updateFlagMutation = useMutation(api.flags.updateFlag)
    const deleteFlagMutation = useMutation(api.flags.deleteFlag)
    const deleteQuizMutation = useMutation(api.quizzes.remove)

    const loading = quizzes === undefined || rawFlags === undefined
    const flags = rawFlags || []


    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this flag?')) return
        try {
            await deleteFlagMutation({ id: id as Id<'flagged_questions'> })
        } catch (err) {
            setError('Delete failed')
        }
    }

    const startEdit = (flag: any) => {
        setEditingId(flag._id)
        setEditReason(flag.reason)
    }

    const handleUpdate = async (id: string) => {
        setError(null)
        try {
            await updateFlagMutation({ id: id as Id<'flagged_questions'>, reason: editReason })
            setEditingId(null)
        } catch (err) {
            setError('Update failed')
        }
    }

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return
        try {
            await deleteQuizMutation({ id: id as Id<'quizzes'> })
        } catch (err) {
            setError('Failed to delete quiz')
        }
    }

    const startEditQuiz = (quiz: any) => {
        setEditingQuizId(quiz._id)
        setEditQuizValue(JSON.stringify(quiz.questions, null, 2))
        setEditQuizError('')
    }

    const handleSaveQuizEdit = async () => {
        if (!editingQuizId) return
        setEditQuizError('')
        try {
            const parsed = JSON.parse(editQuizValue)
            // Note: need update mutation in quizzes.ts if we want to save edits
            // await updateQuizMutation({ id: editingQuizId as Id<'quizzes'>, questions: parsed })
            setEditingQuizId(null)
        } catch (err) {
            setEditQuizError(err instanceof Error ? err.message : 'Invalid JSON')
        }
    }

    if (!isUserLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h2 className="text-2xl font-bold mb-2">Giriş qadağandır</h2>
                <p className="text-muted-foreground mb-4">Bu səhifəyə daxil olmaq üçün admin səlahiyyətiniz olmalıdır.</p>
                <Button onClick={() => router.push('/')}>Ana Səhifəyə Qayıt</Button>
            </div>
        )
    }

    return (
            <div className="min-h-screen bg-background p-4 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <header className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <Badge variant="secondary" className="px-3 py-1">
                                {flags.length} Flags
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1">
                                {selectedQuizId === 'all'
                                    ? 'All quizzes'
                                    : (quizzes?.find((quiz: any) => quiz._id === selectedQuizId)?.name || selectedQuizId)}
                            </Badge>
                        </div>
                        <SignOutButton redirectUrl="/sign-in">
                            <Button variant="outline" className="gap-2">
                                <LogOut className="w-4 h-4" />
                                Çıxış
                            </Button>
                        </SignOutButton>
                    </header>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="flags" className="space-y-6">
                        <TabsList className="bg-muted/50 p-1 border">
                            <TabsTrigger value="flags" className="gap-2">
                                <Flag className="w-4 h-4" />
                                Flagged Questions
                            </TabsTrigger>
                            <TabsTrigger value="quizzes" className="gap-2">
                                <FileJson className="w-4 h-4" />
                                Quizzes
                            </TabsTrigger>
                            <TabsTrigger value="uploads" className="gap-2">
                                <Upload className="w-4 h-4" />
                                Uploads
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="flags" className="space-y-6 outline-none">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-sm font-medium text-muted-foreground">Filter by quiz</div>
                                <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                                    <SelectTrigger className="min-w-[220px]">
                                        <SelectValue placeholder="All quizzes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All quizzes</SelectItem>
                                        {quizzes?.map((quiz: any) => (
                                            <SelectItem key={quiz._id} value={quiz._id}>
                                                {quiz.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-6">
                                {loading ? (
                                    <div className="text-center py-12 text-muted-foreground animate-pulse">Loading flags...</div>
                                ) : flags.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="py-12 text-center text-muted-foreground">
                                            Heç bir flagged sual yoxdur.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    flags.map((flag: any) => (
                                        <Card key={flag._id} className="overflow-hidden border-border/50 hover:border-border transition-colors shadow-sm py-0">
                                            <CardHeader className="bg-muted/50 p-4 border-b flex flex-row items-center justify-between space-y-0">
                                                <div className="flex items-center gap-3">
                                                    <Flag className="w-4 h-4 text-amber-500" />
                                                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                                                        Quiz: {quizzes?.find((quiz: any) => quiz._id === flag.quizId)?.name || flag.quizId}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(flag._creationTime).toLocaleDateString()}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sual:</h3>
                                                    <p className="text-foreground leading-relaxed">{flag.question}</p>
                                                </div>
                                                <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Səbəb:</h3>
                                                    {editingId === flag._id ? (
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={editReason}
                                                                onChange={(e) => setEditReason(e.target.value)}
                                                                className="flex-1"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleUpdate(flag._id)
                                                                    if (e.key === 'Escape') setEditingId(null)
                                                                }}
                                                                autoFocus
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdate(flag._id)}
                                                                disabled={!editReason.trim()}
                                                                className="bg-primary hover:bg-primary/90"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-start justify-between gap-4">
                                                            <p className="text-foreground italic">"{flag.reason}"</p>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="icon" onClick={() => startEdit(flag)} className="h-8 w-8">
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(flag._id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="quizzes" className="space-y-6 outline-none">
                            <div className="grid gap-4 md:grid-cols-2">
                                {!quizzes ? (
                                    <div className="col-span-full text-center py-12 text-muted-foreground animate-pulse">Loading quizzes...</div>
                                ) : quizzes.length === 0 ? (
                                    <Card className="col-span-full border-dashed">
                                        <CardContent className="py-12 text-center text-muted-foreground">
                                            Heç bir saved quiz yoxdur.
                                        </CardContent>
                                    </Card>
                                ) : (
                                    quizzes.map((quiz: any) => (
                                        <Card key={quiz._id} className="group rounded-xl border border-border/70 bg-background shadow-sm transition hover:shadow-md">
                                            <CardContent className="flex flex-col justify-between gap-5 p-5 text-left">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="rounded-lg border border-border bg-muted p-2 text-primary">
                                                            <FileJson className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-semibold text-foreground">{quiz.name}</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                {quiz.questions.length} sual • {new Date(quiz._creationTime).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => startEditQuiz(quiz)} className="h-8 w-8">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuiz(quiz._id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="uploads" className="space-y-6 outline-none">
                            <FileUpload
                                onFileLoaded={() => {}}
                                language="az"
                                enableUpload
                                enableStart={false}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <Dialog open={!!editingQuizId} onOpenChange={(open) => !open && setEditingQuizId(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Quiz Redaktə Et</DialogTitle>
                        </DialogHeader>
                        <div className="flex h-[60vh] flex-col gap-4">
                            <Textarea
                                value={editQuizValue}
                                onChange={(e) => setEditQuizValue(e.target.value)}
                                className="flex-1 w-full font-mono text-xs"
                            />
                            {editQuizError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{editQuizError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingQuizId(null)}>
                                <X className="h-4 w-4 mr-2" />
                                Ləğv Et
                            </Button>
                            <Button onClick={handleSaveQuizEdit}>
                                <Save className="h-4 w-4 mr-2" />
                                Yadda Saxla
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
    )
}
