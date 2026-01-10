'use client'

import { useState, useEffect } from 'react'
import { User, Edit2, Check } from 'lucide-react'
import { Language, getTranslation } from '@/lib/translations'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'

type UserWelcomeProps = {
    language: Language
    userName: string
    onNameChange: (name: string) => void
}

export function UserWelcome({ language, userName, onNameChange }: UserWelcomeProps) {
    const [isEditing, setIsEditing] = useState(!userName)
    const [tempName, setTempName] = useState(userName)

    const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params)

    useEffect(() => {
        setTempName(userName)
        if (!userName) {
            setIsEditing(true)
        }
    }, [userName])

    const handleSave = () => {
        const trimmed = tempName.trim()
        if (trimmed) {
            onNameChange(trimmed)
            setIsEditing(false)
        }
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
                            <div className="flex items-center gap-2">
                                <Input
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    placeholder="..."
                                    className="h-10 text-lg font-semibold"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                    autoFocus
                                />
                                <Button onClick={handleSave} className="h-10 px-4">
                                    <Check className="h-4 w-4 mr-2" />
                                    {t('welcome.saveBtn')}
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
