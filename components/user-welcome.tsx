'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Edit2, Check } from 'lucide-react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'

type UserWelcomeProps = {
    language: Language
    userName: string
    onNameChange: (name: string) => void
    isLoading?: boolean
}

export function UserWelcome({ language, userName, onNameChange, isLoading }: UserWelcomeProps) {
    const [isEditing, setIsEditing] = useState(!userName)
    const [tempName, setTempName] = useState(userName)

    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    const hasInitialLoaded = useRef(false)

    useEffect(() => {
        if (!isLoading && !hasInitialLoaded.current) {
            hasInitialLoaded.current = true
            setTempName(userName)
            if (userName) {
                setIsEditing(false)
            }
        }
    }, [userName, isLoading])

    const handleSave = () => {
        setIsEditing(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTempName(val)
        onNameChange(val)
    }

    if (isLoading) {
        return (
            <Card className="border-border bg-card shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border bg-card shadow-sm overflow-hidden transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
                {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {t('welcome.prompt')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Input
                                    value={tempName}
                                    onChange={handleChange}
                                    placeholder="..."
                                    className="h-11 text-base sm:text-lg font-semibold flex-1"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    autoFocus
                                />
                                <Button onClick={handleSave} className="h-11 px-4 w-full sm:w-auto">
                                    <Check className="h-4 w-4 mr-2" />
                                    <span>{t('welcome.saveBtn')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-success" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    {t('welcome.title')}
                                </p>
                                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                    {t('welcome.greeting', { name: userName })}
                                </h2>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
