'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowLeft, Check, FileType, Printer, Shuffle, LayoutTemplate, Plus, X, GripVertical, Settings2, Menu, Eye, PenLine, Divide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface QuizExportViewProps {
    quiz: any
    onBack: () => void
}

interface HeaderField {
    id: string
    label: string
    type: 'text' | 'blank'
    value?: string // For 'text' type
    width?: number // For 'blank' type (percentage 10-100)
}

export function QuizExportView({ quiz, onBack }: QuizExportViewProps) {
    // Settings State
    const [questionCount, setQuestionCount] = useState<number>(quiz.questions.length)
    const [shuffleQuestions, setShuffleQuestions] = useState(false)
    const [shuffleAnswers, setShuffleAnswers] = useState(false)
    const [isTwoColumn, setIsTwoColumn] = useState(false)

    // Workflow State
    const [isExporting, setIsExporting] = useState(false)
    const [downloadedQuestions, setDownloadedQuestions] = useState(false)
    const [downloadedAnswers, setDownloadedAnswers] = useState(false)

    // Header Editor State
    const [customTitle, setCustomTitle] = useState(quiz.name)
    const [headerFields, setHeaderFields] = useState<HeaderField[]>([
        { id: '1', label: 'Ad', type: 'blank', width: 60 },
        { id: '2', label: 'Soyad', type: 'blank', width: 60 },
        { id: '3', label: 'Tarix', type: 'text', value: new Date().toLocaleDateString('az-AZ') },
        { id: '4', label: 'Sual sayı', type: 'text', value: String(quiz.questions.length) }
    ])

    // Generate Preview Data
    const previewData = useMemo(() => {
        let questions = [...quiz.questions]

        if (shuffleQuestions) {
            questions = questions.sort(() => Math.random() - 0.5)
        }

        if (questionCount < questions.length) {
            questions = questions.slice(0, questionCount)
        }

        return questions.map(q => ({
            ...q,
            answers: shuffleAnswers
                ? [...q.answers].sort(() => Math.random() - 0.5)
                : q.answers
        }))
    }, [quiz.questions, questionCount, shuffleQuestions, shuffleAnswers])

    // Sync "Question Count" field if exists
    useEffect(() => {
        setHeaderFields(prev => prev.map(f =>
            f.label === 'Sual sayı' ? { ...f, value: String(previewData.length) } : f
        ))
    }, [previewData.length])


    const handleAddField = () => {
        const newId = Math.random().toString()
        setHeaderFields([...headerFields, { id: newId, label: 'Yeni sahə', type: 'blank', width: 50 }])
    }

    const handleRemoveField = (id: string) => {
        setHeaderFields(headerFields.filter(f => f.id !== id))
    }

    const updateField = (id: string, updates: Partial<HeaderField>) => {
        setHeaderFields(headerFields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    // Shared Styles Generator
    const getStyles = () => `
        @page { margin: 1.5cm; size: A4; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            color: #000; 
            line-height: 1.4; 
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }
        .pro-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            position: relative;
            box-sizing: border-box;
            overflow: hidden; /* Avoid spill */
        }
        .header { 
            margin-bottom: 25px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
        }
        .header h1 { 
            font-size: 22px; 
            margin: 0 0 20px 0; 
            text-align: center;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .header-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px 40px;
        }
        .field-row {
            display: flex;
            align-items: baseline;
            gap: 8px;
            font-size: 14px;
        }
        .field-label { 
            font-weight: 700; 
            white-space: nowrap;
        }
        .field-value {
            font-weight: 500;
        }
        .field-line {
            border-bottom: 1px dotted #000;
            height: 1em;
        }
        .questions-wrapper {
            font-size: 14px;
        }
        .two-column {
            column-count: 2;
            column-gap: 10mm;
        }
        .question-block { 
            margin-bottom: 18px; 
            break-inside: avoid;
            page-break-inside: avoid;
        }
        .question-text { 
            font-weight: 600; 
            margin-bottom: 6px; 
            font-size: 15px;
        }
        .answers-list { 
            margin-left: 12px; 
        }
        .answer-item { 
            margin: 2px 0; 
        }
        .correct-answer { 
            font-weight: bold; 
            text-decoration: underline;
        }
    `

    const printQuestions = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${customTitle} - Suallar</title>
                <style>${getStyles()}</style>
            </head>
            <body>
                <div class="pro-page">
                    <div class="header">
                        <h1>${customTitle}</h1>
                        <div class="header-grid">
                            ${headerFields.map(f => `
                                <div class="field-row">
                                    <span class="field-label">${f.label}:</span>
                                    ${f.type === 'text'
                ? `<span class="field-value">${f.value}</span>`
                : `<span class="field-line" style="width: ${f.width}%"></span>`
            }
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="questions-wrapper ${isTwoColumn ? 'two-column' : ''}">
                        ${previewData.map((q, i) => `
                            <div class="question-block">
                                <div class="question-text">${i + 1}. ${q.question}</div>
                                <div class="answers-list">
                                    ${q.answers.map((ans: string, ai: number) => {
                const label = String.fromCharCode(65 + ai);
                return `
                                            <div class="answer-item">
                                                ${label}) ${ans}
                                            </div>
                                        `;
            }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <script>
                    window.onload = () => { 
                        setTimeout(() => window.print(), 500); 
                    }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        setDownloadedQuestions(true);
    }

    const printAnswers = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${customTitle} - Cavablar</title>
                <style>
                    ${getStyles()}
                    .answer-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px 40px;
                        margin-top: 20px;
                    }
                    .answer-row {
                        border-bottom: 1px dashed #ccc;
                        padding-bottom: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="pro-page">
                    <div class="header" style="border-bottom: none">
                        <h1 style="margin-bottom: 5px">${customTitle}</h1>
                        <h2 style="text-align: center; margin: 0">CAVAB ANAHTARI</h2>
                    </div>

                    <div class="answer-grid">
                        ${previewData.map((q, i) => `
                            <div class="answer-row">
                                <strong>${i + 1}:</strong> ${q.correct_answer}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <script>
                    window.onload = () => { 
                        setTimeout(() => window.print(), 500); 
                    }
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        setDownloadedAnswers(true);
    }

    // Settings Panel Content (Reusable)
    const SettingsPanel = () => (
        <div className="space-y-8 pb-10">
            {/* Format Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileType className="w-4 h-4" />
                    <h3>Görünüş Ayarları</h3>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label htmlFor="two-cols" className="cursor-pointer flex flex-col">
                        <span>İki Sütunlu Rejim</span>
                        <span className="text-xs text-muted-foreground font-normal">Kompakt görünüş</span>
                    </Label>
                    <Switch id="two-cols" checked={isTwoColumn} onCheckedChange={setIsTwoColumn} />
                </div>
            </section>

            <Separator />

            {/* Content Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <Settings2 className="w-4 h-4" />
                    <h3>Məzmun Ayarları</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Sual sayı</Label>
                        <Badge variant="secondary">{questionCount}</Badge>
                    </div>
                    <Slider
                        value={[questionCount]}
                        max={quiz.questions.length}
                        min={1}
                        step={1}
                        onValueChange={([val]) => setQuestionCount(val)}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Sualları qarışdır</Label>
                        <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Cavabları qarışdır</Label>
                        <Switch checked={shuffleAnswers} onCheckedChange={setShuffleAnswers} />
                    </div>
                </div>
            </section>

            <Separator />

            {/* Header Editor */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <PenLine className="w-4 h-4" />
                    <h3>Başlıq Dizayneri</h3>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">İmtahan Başlığı</Label>
                    <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="font-bold" />
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase text-muted-foreground">Məlumat Sahələri</Label>

                    <div className="space-y-3">
                        {headerFields.map((field) => (
                            <Card key={field.id} className="p-3 bg-muted/40 relative group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveField(field.id)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>

                                <div className="grid gap-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            className="h-8 text-sm font-medium border-transparent focus:border-input bg-transparent px-1"
                                            placeholder="Sahə adı"
                                        />
                                        <Select
                                            value={field.type}
                                            onValueChange={(val: 'text' | 'blank') => updateField(field.id, { type: val })}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Mətn (Sabit)</SelectItem>
                                                <SelectItem value="blank">Boşluq (Tələbə üçün)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {field.type === 'text' ? (
                                        <Input
                                            value={field.value || ''}
                                            onChange={(e) => updateField(field.id, { value: e.target.value })}
                                            placeholder="Dəyər daxil edin"
                                            className="h-8 text-sm"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Genişlik: {field.width}%</span>
                                            <Slider
                                                value={[field.width || 50]}
                                                min={10}
                                                max={100}
                                                step={10}
                                                onValueChange={([val]) => updateField(field.id, { width: val })}
                                                className="flex-1"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Button variant="outline" size="sm" onClick={handleAddField} className="w-full gap-2 border-dashed">
                        <Plus className="w-3 h-3" /> Sahə əlavə et
                    </Button>
                </div>
            </section>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden border-b p-4 flex items-center justify-between bg-background z-10">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Settings2 className="w-4 h-4" /> Ayarlar
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-0 flex flex-col h-full">
                        <SheetHeader className="p-6 pb-2 text-left">
                            <SheetTitle>Export Ayarları</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-1 min-h-0">
                            <div className="p-6 pt-2">
                                <SettingsPanel />
                            </div>
                        </ScrollArea>
                        <div className="p-4 bg-background border-t">
                            <Button size="lg" className="w-full gap-2" onClick={() => setIsExporting(true)}>
                                <Printer className="w-4 h-4" />
                                Export Et
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Setting Sidebar */}
            <div className="hidden md:flex w-[380px] border-r bg-muted/10 flex-col h-full">
                <div className="p-5 border-b flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="font-bold text-lg">Export Studio</h2>
                        <p className="text-xs text-muted-foreground">PDF hazırlama paneli</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-5">
                        <SettingsPanel />
                    </div>
                </ScrollArea>

                <div className="p-5 border-t bg-background">
                    <Button size="lg" className="w-full gap-2 shadow-lg" onClick={() => setIsExporting(true)}>
                        <Printer className="w-5 h-5" />
                        Export Et (Tamamla)
                    </Button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-100 h-full flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 overflow-auto flex justify-center p-8 pb-32">
                    <style>{getStyles()}</style>
                    <div className="pro-page shadow-2xl scale-[0.6] md:scale-[0.8] origin-top transition-transform duration-300">

                        {/* Header preview */}
                        <div className="header">
                            <h1>{customTitle}</h1>
                            <div className="header-grid">
                                {headerFields.map(f => (
                                    <div key={f.id} className="field-row">
                                        <span className="field-label">{f.label}:</span>
                                        {f.type === 'text'
                                            ? <span className="field-value">{f.value}</span>
                                            : <span className="field-line" style={{ width: `${f.width}%` }}></span>
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Questions preview */}
                        <div className={cn("questions-wrapper", isTwoColumn && "two-column")}>
                            {previewData.slice(0, isTwoColumn ? 16 : 8).map((q, i) => (
                                <div key={i} className="question-block">
                                    <div className="question-text">{i + 1}. {q.question}</div>
                                    <div className="answers-list">
                                        {q.answers.map((ans: string, ai: number) => {
                                            const label = String.fromCharCode(65 + ai);
                                            return (
                                                <div key={ai} className="answer-item">
                                                    {label}) {ans}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Preview Notice Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-8 pointer-events-none">
                            <Badge variant="secondary" className="mb-4">
                                Preview: 1-ci səhifə (Cəmi {previewData.length} sual)
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Mobile FAB */}
                <div className="md:hidden absolute bottom-6 right-6">
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-xl" onClick={() => setIsExporting(true)}>
                        <Printer className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Export Progress Modal */}
            {isExporting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <Card className="relative w-full max-w-md shadow-2xl">
                        <div className="p-6 space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold">Export Hazırlanır</h3>
                                <p className="text-sm text-muted-foreground">Zəhmət olmasa hər iki faylı yükləyin.</p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant={downloadedQuestions ? "outline" : "default"}
                                    className={cn("w-full py-8 text-lg font-bold gap-3 border-2 h-auto", downloadedQuestions && "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400")}
                                    onClick={printQuestions}
                                >
                                    <div className="flex flex-col items-center">
                                        <span>1. Sualları Çap Et</span>
                                        <span className="text-[10px] font-normal opacity-70">Sual vərəqi (PDF)</span>
                                    </div>
                                    {downloadedQuestions && <Check className="w-6 h-6" />}
                                </Button>

                                <Button
                                    variant={downloadedAnswers ? "outline" : "default"}
                                    className={cn("w-full py-8 text-lg font-bold gap-3 border-2 h-auto", downloadedAnswers && "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400")}
                                    onClick={printAnswers}
                                >
                                    <div className="flex flex-col items-center">
                                        <span>2. Cavabları Çap Et</span>
                                        <span className="text-[10px] font-normal opacity-70">Cavab anahtarı (PDF)</span>
                                    </div>
                                    {downloadedAnswers && <Check className="w-6 h-6" />}
                                </Button>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsExporting(false);
                                        setDownloadedQuestions(false);
                                        setDownloadedAnswers(false);
                                    }}
                                >
                                    Ləğv Et
                                </Button>
                                <Button
                                    disabled={!downloadedQuestions || !downloadedAnswers}
                                    className="flex-1"
                                    onClick={onBack}
                                >
                                    Tamamla və Çıx
                                </Button>
                            </div>

                            {!downloadedQuestions || !downloadedAnswers ? (
                                <p className="text-[10px] text-center text-muted-foreground italic">
                                    * Hər iki sənədi yükləmədən davam edə bilməzsiniz.
                                </p>
                            ) : (
                                <p className="text-[10px] text-center text-green-600 font-bold animate-pulse">
                                    Təbriklər! Bütün sənədlər hazırdır.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
