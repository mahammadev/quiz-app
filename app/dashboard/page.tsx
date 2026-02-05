'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Trash2,
    FileText,
    Clock,
    Users,
    ArrowLeft,
    MoreVertical,
    Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import ThemeSwitcher from '@/components/theme-switcher'

export default function DashboardPage() {
    const { user, isLoaded } = useUser()
    const quizzes = useQuery(api.quizzes.list)
    const removeQuiz = useMutation(api.quizzes.remove)

    const [deleteTarget, setDeleteTarget] = useState<Id<'quizzes'> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
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

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                İş Masası
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Salam, {user?.firstName || 'Creator'}!
                            </p>
                        </div>
                    </div>
                    <ThemeSwitcher />
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{quizzes?.length ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Testlər</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    <Card className="bg-card/50 border-border/50 md:col-span-1 col-span-2">
                        <CardContent className="p-4">
                            <Button className="w-full gap-2" asChild>
                                <Link href="/">
                                    <Plus className="w-4 h-4" />
                                    Yeni Test
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quiz List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Testlərim</h2>

                    {quizzes === undefined ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : quizzes.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <CardTitle className="text-lg mb-2">Hələ test yoxdur</CardTitle>
                                <CardDescription className="mb-4">
                                    İlk testinizi yaratmaq üçün ana səhifəyə keçin.
                                </CardDescription>
                                <Button asChild>
                                    <Link href="/">Test Yarat</Link>
                                </Button>
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
                                        <Card className="group hover:border-primary/30 transition-colors">
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate">{quiz.name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {quiz.questions.length} sual
                                                        {quiz.createdAt && (
                                                            <> · {new Date(quiz.createdAt).toLocaleDateString('az-AZ')}</>
                                                        )}
                                                    </p>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setDeleteTarget(quiz._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Sil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Testi silmək istəyirsiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu əməliyyat geri qaytarıla bilməz. Test və onunla bağlı bütün məlumatlar silinəcək.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Ləğv et</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Sil'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}
