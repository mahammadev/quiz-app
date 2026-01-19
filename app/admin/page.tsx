'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, Trash2, Edit2, Check, X, LogOut, ArrowLeft, FileJson, FileText, Play, Save, Pencil, Upload, Download, FileType } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/animated-tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUpload from '@/components/file-upload'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { SignOutButton, useUser } from "@clerk/nextjs";
import { ActiveUsers } from '@/components/active-users'

export default function AdminPage() {
    const [selectedQuizId, setSelectedQuizId] = useState('all')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editReason, setEditReason] = useState('')
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
    const [editQuizValue, setEditQuizValue] = useState('')
    const [editQuizError, setEditQuizError] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [exportDialogOpen, setExportDialogOpen] = useState(false)
    const [exportQuiz, setExportQuiz] = useState<any>(null)
    const [exportType, setExportType] = useState<'with_answers' | 'exam'>('with_answers')
    const [isExporting, setIsExporting] = useState(false)

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

    const handleDownloadJSON = (quiz: any) => {
        const dataStr = JSON.stringify(quiz.questions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${quiz.name.replace(/\s+/g, '_')}_quiz.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    const handleDownloadPDF = (quiz: any) => {
        const doc = new jsPDF();
        doc.text(quiz.name, 14, 15);

        const tableData = quiz.questions.map((q: any, index: number) => {
            return [
                index + 1,
                q.question,
                q.answers.join('\n'),
                q.correct_answer
            ];
        });

        autoTable(doc, {
            head: [['#', 'Sual', 'Variantlar', 'Düzgün Cavab']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 60 },
                3: { cellWidth: 30 }
            },
            headStyles: { fillColor: [63, 81, 181] }
        });

        doc.save(`${quiz.name.replace(/\s+/g, '_')}_quiz.pdf`);
    }

    const handleAdvancedExport = async (quiz: any, type: 'with_answers' | 'exam', limit?: number) => {
        setIsExporting(true);
        try {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.style.width = '800px';
            container.style.backgroundColor = '#ffffff';
            container.style.color = '#000000';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.padding = '40px';
            document.body.appendChild(container);

            let questionsToExport = [...quiz.questions];
            if (limit && limit > 0) {
                questionsToExport = questionsToExport
                    .sort(() => Math.random() - 0.5)
                    .slice(0, limit);
            }

            const content = `
                <div style="margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px;">
                    <h1 style="font-size: 28px; margin-bottom: 10px;">${quiz.name}</h1>
                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                        <div>
                            <p><strong>Ad:</strong> ___________________________</p>
                            <p><strong>Soyad:</strong> ___________________________</p>
                        </div>
                        <div>
                            <p><strong>Tarix:</strong> ${new Date().toLocaleDateString('az-AZ')}</p>
                            <p><strong>Sual sayı:</strong> ${questionsToExport.length}</p>
                        </div>
                    </div>
                </div>
                <div style="line-height: 1.6;">
                    ${questionsToExport.map((q, i) => `
                        <div style="margin-bottom: 30px; page-break-inside: avoid;">
                            <p style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">${i + 1}. ${q.question}</p>
                            <div style="margin-left: 20px;">
                                ${q.answers.map((ans: string, ai: number) => {
                const label = String.fromCharCode(65 + ai); // A, B, C...
                const isCorrect = type === 'with_answers' && ans === q.correct_answer;
                return `
                                        <p style="margin: 5px 0; ${isCorrect ? 'color: #059669; font-weight: bold;' : ''}">
                                            ${label}) ${ans} ${isCorrect ? '✓' : ''}
                                        </p>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.innerHTML = content;

            // Split into pages if it's too long for a single canvas (optional, but jspdf handles single long one better if we scaling)
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add multiple pages if height exceeds A4 height
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${quiz.name.replace(/\s+/g, '_')}_${type}.pdf`);
            document.body.removeChild(container);
            setExportDialogOpen(false);
        } catch (err) {
            console.error(err);
            setError('PDF generation failed');
        } finally {
            setIsExporting(false);
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

                <ActiveUsers language="az" />

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
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadJSON(quiz)} title="JSON yüklə" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <FileJson className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setExportQuiz(quiz)
                                                            setExportDialogOpen(true)
                                                        }}
                                                        title="PDF yüklə"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Button>
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
                            onFileLoaded={() => { }}
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

            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>PDF İxrac Et</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">İxrac formatı seçin:</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant={exportType === 'with_answers' ? 'default' : 'outline'}
                                    className="h-24 flex flex-col gap-2"
                                    onClick={() => setExportType('with_answers')}
                                >
                                    <Check className="h-6 w-6" />
                                    <span>Cavablarla</span>
                                </Button>
                                <Button
                                    variant={exportType === 'exam' ? 'default' : 'outline'}
                                    className="h-24 flex flex-col gap-2"
                                    onClick={() => setExportType('exam')}
                                >
                                    <FileType className="h-6 w-6" />
                                    <span>İmtahan formatı</span>
                                </Button>
                            </div>
                        </div>

                        {exportType === 'exam' && (
                            <div className="space-y-4 pt-2 border-t">
                                <h4 className="text-sm font-medium">Sual seçimi:</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => handleAdvancedExport(exportQuiz, 'exam')}
                                        disabled={isExporting}
                                    >
                                        Bütün suallar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => handleAdvancedExport(exportQuiz, 'exam', 40)}
                                        disabled={isExporting || exportQuiz?.questions?.length < 40}
                                    >
                                        Təsadüfi 40 sual
                                    </Button>
                                </div>
                            </div>
                        )}

                        {exportType === 'with_answers' && (
                            <Button
                                className="w-full"
                                onClick={() => handleAdvancedExport(exportQuiz, 'with_answers')}
                                disabled={isExporting}
                            >
                                {isExporting ? 'Hazırlanır...' : 'İndi yüklə'}
                            </Button>
                        )}
                    </div>
                    {isExporting && (
                        <div className="text-center text-sm text-muted-foreground animate-pulse">
                            PDF hazırlanır, xahiş olunur gözləyin...
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
