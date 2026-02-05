"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, FileText, MoreVertical, Loader2 } from 'lucide-react'
import Link from 'next/link'
import QuizSetup from '@/components/quiz-setup'
import QuizDisplay, { IncorrectAnswer } from '@/components/quiz-display'
import ThemeSwitcher from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { QuizComplete } from '@/components/quiz-complete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Leaderboard } from '@/components/leaderboard'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Id } from '@/convex/_generated/dataModel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/animated-tabs"
import { UserButton, useUser } from "@clerk/nextjs"
import { useActiveUsers } from '@/components/active-user-context'
import { useQuery, useMutation } from "convex/react"
import { Language, getTranslation } from '@/lib/translations'
import { Question } from '@/lib/schema'
import { hashQuestion } from '@/lib/utils'
import { api } from '@/convex/_generated/api'
import { UserMistakes } from '@/components/user-mistakes'
import FileUpload from '@/components/file-upload'
import { XPDisplay } from '@/components/xp-display'
import { AchievementToast, useAchievementQueue } from '@/components/achievement-toast'
import { formatDate } from '@/lib/utils'

type AppState = 'upload' | 'setup' | 'quiz' | 'complete'
const STEPS: AppState[] = ['upload', 'setup', 'quiz', 'complete']

export default function DashboardClient() {
    const [state, setAppState] = useState<AppState>('upload')
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuiz, setCurrentQuiz] = useState<Question[]>([])
    const [score, setScore] = useState(0)
    const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([])
    const [shuffleAnswers, setShuffleAnswers] = useState(false)
    const [studyMode, setStudyMode] = useState(false)
    const [showOnlyCorrect, setShowOnlyCorrect] = useState(false)
    const [quizId, setQuizId] = useState<string>('')
    const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
    const [quizDuration, setQuizDuration] = useState<number>(0)
    const [activeTab, setActiveTab] = useState("quiz")
    const { user, isLoaded: isUserLoaded, isSignedIn } = useUser()
    const [language, setLanguage] = useState<Language>('az')
    const { current, addBadge, addLevelUp, dismiss } = useAchievementQueue()

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language
        if (savedLang && ['az', 'en', 'ru'].includes(savedLang)) {
            setLanguage(savedLang)
        }
    }, [])

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang)
        localStorage.setItem('app-language', newLang)
    }

    const quizzes = useQuery(api.quizzes.list, !isSignedIn ? "skip" : {})
    const { setActivity } = useActiveUsers()
    const myOrgs = useQuery(api.organizations.listMyOrgs, !isSignedIn ? "skip" : {})
    const isOrgMember = myOrgs && myOrgs.length > 0

    const [deleteTarget, setDeleteTarget] = useState<Id<'quizzes'> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const removeQuiz = useMutation(api.quizzes.remove)

    const handleDeleteQuiz = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await removeQuiz({ id: deleteTarget })
        } catch (error) {
            console.error('Failed to delete quiz:', error)
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleStartFromList = (quiz: any) => {
        setQuestions(quiz.questions)
        setQuizId(quiz._id)
        setAppState('setup')
        setActiveTab('quiz')
    }

    const currentIndex = STEPS.indexOf(state)

    const handleFileLoaded = (loadedQuestions: Question[], id?: string) => {
        setQuestions(loadedQuestions)
        setQuizId(id || `quiz-${Date.now()}`)
        setAppState('setup')
    }

    const handleQuizStart = (quizQuestions: Question[], shuffle: boolean, isStudyMode?: boolean, onlyCorrect?: boolean) => {
        setCurrentQuiz(quizQuestions)
        setScore(0)
        setIncorrectAnswers([])
        setShuffleAnswers(shuffle)
        setStudyMode(isStudyMode || false)
        setShowOnlyCorrect(onlyCorrect || false)
        setQuizStartTime(Date.now())
        setQuizDuration(0)
        setAppState('quiz')
    }

    const handleQuizComplete = (finalScore: number, incorrect: IncorrectAnswer[] = []) => {
        setScore(finalScore)
        setIncorrectAnswers(incorrect)
        setQuizDuration(quizStartTime ? Date.now() - quizStartTime : 0)
        setAppState('complete')
    }

    const handleRetryIncorrect = () => {
        if (incorrectAnswers.length === 0) return
        const retryQuestions = questions.filter(q => {
            const qId = hashQuestion(q.question)
            return incorrectAnswers.some(ia => ia.questionId === qId)
        })
        handleRedo(retryQuestions, quizId)
    }

    const handleRedo = (redoQuestions: Question[], id: string) => {
        setCurrentQuiz(redoQuestions)
        setScore(0)
        setIncorrectAnswers([])
        setStudyMode(false)
        setShowOnlyCorrect(false)
        setQuizId(id)
        setQuizStartTime(Date.now())
        setQuizDuration(0)
        setAppState('quiz')
    }

    const handleReset = () => {
        setAppState('upload')
        setQuestions([])
        setCurrentQuiz([])
        setScore(0)
        setIncorrectAnswers([])
        setShuffleAnswers(false)
        setQuizId('')
        setQuizDuration(0)
        setQuizStartTime(null)
    }

    const handleBack = () => {
        if (currentIndex > 0) {
            setAppState(STEPS[currentIndex - 1])
        }
    }

    useEffect(() => {
        const activity = state === 'upload' ? `home:${activeTab}` : state === 'complete' ? 'results' : state
        if (!isSignedIn) return
        setActivity(activity)
    }, [activeTab, isSignedIn, setActivity, state])

    return (
        <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8 min-h-screen flex flex-col w-full">
            {state !== 'quiz' && (
                <header className="flex justify-between items-center mb-4 sm:mb-8 relative z-50">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-3">
                            <UserButton afterSignOutUrl="/" />
                            <XPDisplay />
                        </div>
                    </div>
                    <ThemeSwitcher language={language} onLanguageChange={handleLanguageChange} />
                </header>
            )}

            <AchievementToast achievement={current} onDismiss={dismiss} />

            {state !== 'quiz' && (
                <Tabs defaultValue="quiz" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-1 space-y-4">
                    <div className="mb-6 w-full">
                        <TabsList className={`grid w-full ${isOrgMember ? "grid-cols-5" : "grid-cols-3"} bg-muted/50 p-1 rounded-xl h-auto shadow-sm`}>
                            <TabsTrigger value="library" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.library')}</TabsTrigger>
                            <TabsTrigger value="quiz" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.quiz')}</TabsTrigger>
                            {isOrgMember && <TabsTrigger value="leaderboard" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.leaderboard')}</TabsTrigger>}
                            <TabsTrigger value="mistakes" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.mistakes')}</TabsTrigger>
                            {isOrgMember && <TabsTrigger value="organizations" className="py-2 text-[10px] xs:text-xs sm:text-sm px-1 rounded-lg">{getTranslation(language, 'tabs.organizations')}</TabsTrigger>}
                        </TabsList>
                    </div>

                    <TabsContent value="library" className="mt-0">
                        <div className="space-y-4">
                            {quizzes === undefined ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : quizzes.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                        <CardTitle className="text-lg mb-2">{getTranslation(language, 'library.emptyTitle')}</CardTitle>
                                        <CardDescription className="mb-4">
                                            {getTranslation(language, 'library.emptyDesc')}
                                        </CardDescription>
                                        <Button onClick={() => setActiveTab('quiz')}>{getTranslation(language, 'library.createBtn')}</Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-3">
                                    <AnimatePresence mode="popLayout">
                                        {quizzes.map((quiz) => (
                                            <motion.div
                                                key={quiz._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card className="group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleStartFromList(quiz)}>
                                                    <CardContent className="flex items-center justify-between p-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium truncate">{quiz.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {getTranslation(language, 'common.questions', { count: quiz.questions.length })}
                                                                {quiz.createdAt && <> · {formatDate(quiz.createdAt, language)}</>}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button size="sm" variant="secondary" className="hidden sm:flex" onClick={(e) => { e.stopPropagation(); handleStartFromList(quiz); }}>
                                                                {getTranslation(language, 'common.start')}
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStartFromList(quiz); }}>
                                                                        {getTranslation(language, 'common.start')}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-destructive focus:text-destructive"
                                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(quiz._id); }}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        {getTranslation(language, 'common.delete')}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="quiz" className="mt-0 flex-1">
                        <div className="relative w-full grid grid-cols-1 items-start">
                            <AnimatePresence mode="popLayout">
                                {STEPS.map((step, index) => {
                                    if (index > currentIndex) return null
                                    if (step === 'quiz') return null
                                    const isCurrent = index === currentIndex
                                    const offset = currentIndex - index
                                    return (
                                        <motion.div
                                            key={step}
                                            initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                                            animate={{
                                                y: isCurrent ? 0 : -40 * offset,
                                                scale: isCurrent ? 1 : 1 - (0.05 * offset),
                                                opacity: isCurrent ? 1 : 0,
                                                zIndex: index,
                                                filter: isCurrent ? 'none' : 'brightness(0.95)'
                                            }}
                                            exit={{ y: '100%', opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className={`col-start-1 row-start-1 w-full ${isCurrent ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                        >
                                            <Card className="w-full py-0 shadow-lg border-none sm:border overflow-hidden">
                                                <CardContent className="p-4 sm:p-8">
                                                    {currentIndex > 0 && step !== 'complete' && (
                                                        <Button onClick={handleBack} variant="ghost" className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                                            <ArrowLeft className="w-4 h-4" />
                                                            <span className="text-sm">{getTranslation(language, 'nav.back')}</span>
                                                        </Button>
                                                    )}
                                                    {step === 'upload' && <FileUpload onFileLoaded={handleFileLoaded} language={language} enableUpload={true} />}
                                                    {step === 'setup' && (
                                                        <QuizSetup totalQuestions={questions.length} onQuizStart={handleQuizStart} allQuestions={questions} language={language} quizId={quizId} />
                                                    )}
                                                    {step === 'complete' && (
                                                        <QuizComplete
                                                            score={score}
                                                            total={currentQuiz.length}
                                                            incorrectAnswers={incorrectAnswers}
                                                            onReset={handleReset}
                                                            onRetryIncorrect={handleRetryIncorrect}
                                                            language={language}
                                                            quizId={quizId}
                                                            durationMs={quizDuration}
                                                            showLeaderboard={!!isOrgMember}
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    </TabsContent>

                    <TabsContent value="leaderboard">
                        {isSignedIn && isOrgMember && <Leaderboard quizId={quizId || 'global'} language={language} />}
                    </TabsContent>

                    <TabsContent value="mistakes">
                        <UserMistakes language={language} onRedo={handleRedo} />
                    </TabsContent>

                    <TabsContent value="organizations">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myOrgs === undefined ? (
                                <div className="col-span-full text-center py-8 text-muted-foreground">{getTranslation(language, 'org.loading')}</div>
                            ) : myOrgs.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border/50">
                                    <p>{getTranslation(language, 'org.none')}</p>
                                </div>
                            ) : (
                                myOrgs.map((org: any) => (
                                    <Link key={org._id} href={`/org/${org.slug}`} className="block group">
                                        <Card className="h-full hover:border-primary/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{org.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{getTranslation(language, 'org.role')}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            {state === 'quiz' && (
                <div className="w-full">
                    <QuizDisplay questions={currentQuiz} onComplete={handleQuizComplete} onBack={handleBack} shuffleAnswers={shuffleAnswers} studyMode={studyMode} showOnlyCorrect={showOnlyCorrect} language={language} quizId={quizId} allQuestions={questions} />
                </div>
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{getTranslation(language, 'library.confirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getTranslation(language, 'library.confirmDesc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>{getTranslation(language, 'common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteQuiz}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                getTranslation(language, 'common.delete')
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
