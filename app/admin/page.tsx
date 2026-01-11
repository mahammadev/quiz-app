'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flag, Trash2, Edit2, Check, X, LogOut, ArrowLeft, FileJson, Play, Save, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type FlaggedQuestion = {
    id: string
    quizId: string
    question: string
    reason: string
    createdAt: string
}

export default function AdminPage() {
    const [flags, setFlags] = useState<FlaggedQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editReason, setEditReason] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    // Quiz Management State
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loadingQuizzes, setLoadingQuizzes] = useState(false)
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
    const [editQuizValue, setEditQuizValue] = useState('')
    const [editQuizError, setEditQuizError] = useState('')
    const [editQuizSaving, setEditQuizSaving] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchFlags()
        fetchQuizzes()
    }, [])

    const fetchQuizzes = async () => {
        setLoadingQuizzes(true)
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setQuizzes(data || [])
        } catch (err) {
            console.error('Failed to fetch quizzes', err)
        } finally {
            setLoadingQuizzes(false)
        }
    }

    const fetchFlags = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/flags/all')
            if (response.ok) {
                const data = await response.json()
                setFlags(data.flags)
            } else {
                setError('Failed to fetch flags')
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this flag?')) return
        try {
            const response = await fetch(`/api/flags/all?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setFlags(flags.filter((f) => f.id !== id))
            } else {
                const data = await response.json()
                setError(data.error || 'Delete failed')
            }
        } catch (err) {
            setError('Delete failed')
        }
    }

    const startEdit = (flag: FlaggedQuestion) => {
        setEditingId(flag.id)
        setEditReason(flag.reason)
    }

    const handleUpdate = async (id: string) => {
        setIsUpdating(true)
        setError(null)
        try {
            const response = await fetch(`/api/flags/all`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, reason: editReason }),
            })
            if (response.ok) {
                setFlags(flags.map((f) => (f.id === id ? { ...f, reason: editReason } : f)))
                setEditingId(null)
            } else {
                const data = await response.json()
                setError(data.error || 'Update failed')
            }
        } catch (err) {
            setError('Update failed')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return
        try {
            const { error } = await supabase.from('quizzes').delete().eq('id', id)
            if (error) throw error
            setQuizzes(quizzes.filter(q => q.id !== id))
        } catch (err) {
            setError('Failed to delete quiz')
        }
    }

    const startEditQuiz = (quiz: any) => {
        setEditingQuizId(quiz.id)
        setEditQuizValue(JSON.stringify(quiz.questions, null, 2))
        setEditQuizError('')
    }

    const handleSaveQuizEdit = async () => {
        if (!editingQuizId) return
        setEditQuizError('')
        setEditQuizSaving(true)

        try {
            const parsed = JSON.parse(editQuizValue)
            const { error } = await supabase
                .from('quizzes')
                .update({ questions: parsed })
                .eq('id', editingQuizId)

            if (error) throw error

            setQuizzes(quizzes.map(q => q.id === editingQuizId ? { ...q, questions: parsed } : q))
            setEditingQuizId(null)
        } catch (err) {
            setEditQuizError(err instanceof Error ? err.message : 'Invalid JSON')
        } finally {
            setEditQuizSaving(false)
        }
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
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="gap-2">
                        <LogOut className="w-4 h-4" />
                        Çıxış
                    </Button>
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
                    </TabsList>

                    <TabsContent value="flags" className="space-y-6 outline-none">
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
                                flags.map((flag) => (
                                    <Card key={flag.id} className="overflow-hidden border-border/50 hover:border-border transition-colors shadow-sm">
                                        <CardHeader className="bg-muted/50 p-4 border-b flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center gap-3">
                                                <Flag className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
                                                    Quiz: {flag.quizId}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(flag.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sual:</h3>
                                                <p className="text-foreground leading-relaxed">{flag.question}</p>
                                            </div>
                                            <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Səbəb:</h3>
                                                {editingId === flag.id ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={editReason}
                                                            onChange={(e) => setEditReason(e.target.value)}
                                                            className="flex-1"
                                                            disabled={isUpdating}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdate(flag.id)
                                                                if (e.key === 'Escape') setEditingId(null)
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdate(flag.id)}
                                                            disabled={isUpdating || !editReason.trim()}
                                                            className="bg-primary hover:bg-primary/90"
                                                        >
                                                            {isUpdating ? '...' : <Check className="w-4 h-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={isUpdating}>
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
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(flag.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                            {loadingQuizzes ? (
                                <div className="col-span-full text-center py-12 text-muted-foreground animate-pulse">Loading quizzes...</div>
                            ) : quizzes.length === 0 ? (
                                <Card className="col-span-full border-dashed">
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        Heç bir saved quiz yoxdur.
                                    </CardContent>
                                </Card>
                            ) : (
                                quizzes.map((quiz) => (
                                    <Card key={quiz.id} className="group rounded-xl border border-border/70 bg-background shadow-sm transition hover:shadow-md">
                                        <CardContent className="flex flex-col justify-between gap-5 p-5 text-left">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <div className="rounded-lg border border-border bg-muted p-2 text-primary">
                                                        <FileJson className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-semibold text-foreground">{quiz.name}</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {quiz.questions.length} sual • {new Date(quiz.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => startEditQuiz(quiz)} className="h-8 w-8">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteQuiz(quiz.id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                        <Button onClick={handleSaveQuizEdit} disabled={editQuizSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {editQuizSaving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
