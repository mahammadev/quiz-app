"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
    ArrowRight,
    BookOpen,
    Building2,
    CheckCircle2,
    GraduationCap,
    LayoutDashboard,
    Sparkles,
    Users,
    Shield,
    TrendingUp,
    Clock,
    FileText,
    Star,
    Play
} from "lucide-react";
import { Language, getTranslation } from "@/lib/translations";

export default function LandingPage() {
    const [mode, setMode] = useState<"learner" | "school">("learner");
    const [language, setLanguage] = useState<Language>('az');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && ['az', 'en', 'ru'].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    const handleLanguageChange = (newLang: Language) => {
        setLanguage(newLang);
        localStorage.setItem('app-language', newLang);
    };

    const learnerFeatures = [
        {
            icon: <Sparkles className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.learner.ai.title'),
            desc: getTranslation(language, 'landing.feature.learner.ai.desc'),
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.learner.spaced.title'),
            desc: getTranslation(language, 'landing.feature.learner.spaced.desc'),
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            icon: <TrendingUp className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.learner.mistake.title'),
            desc: getTranslation(language, 'landing.feature.learner.mistake.desc'),
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
    ];

    const schoolFeatures = [
        {
            icon: <Users className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.school.member.title'),
            desc: getTranslation(language, 'landing.feature.school.member.desc'),
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: <LayoutDashboard className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.school.content.title'),
            desc: getTranslation(language, 'landing.feature.school.content.desc'),
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: getTranslation(language, 'landing.feature.school.privacy.title'),
            desc: getTranslation(language, 'landing.feature.school.privacy.desc'),
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    const features = mode === "learner" ? learnerFeatures : schoolFeatures;

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* ═══════════════════════════════════════════════════════════════════════════
                HEADER
                ═══════════════════════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-bold tracking-tight flex items-center gap-2.5"
                        >
                            <span className="bg-blue-600 text-white rounded-xl p-2">
                                <Sparkles className="w-5 h-5" />
                            </span>
                            <span className="font-[family-name:var(--font-dm-sans)] font-bold text-slate-900">MHMMD</span>
                        </motion.div>
                        <nav className="hidden md:flex items-center gap-6">
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {getTranslation(language, 'landing.header.features')}
                            </button>
                            <button
                                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                {getTranslation(language, 'landing.header.pricing')}
                            </button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="flex items-center bg-slate-100 rounded-full p-1">
                            {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${language === lang
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <SignInButton mode="modal">
                            <Button
                                variant="ghost"
                                className="hidden sm:inline-flex text-slate-600 hover:text-slate-900"
                            >
                                {getTranslation(language, 'landing.auth.signin')}
                            </Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                                {getTranslation(language, 'landing.auth.getstarted')}
                            </Button>
                        </SignInButton>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════════════════
                HERO SECTION — Clean, Trust-Focused
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">

                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 mb-8"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {getTranslation(language, 'landing.hero.badge')}
                        </motion.div>

                        {/* Main Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-6"
                        >
                            <span className="font-[family-name:var(--font-playfair)] font-normal text-slate-900">
                                {getTranslation(language, 'landing.hero.title1')}
                            </span>{' '}
                            <span className="font-[family-name:var(--font-dm-sans)] font-bold text-blue-600">
                                {getTranslation(language, 'landing.hero.title2')}
                            </span>
                            <span className="text-slate-900">,</span>
                            <br />
                            <span className="font-[family-name:var(--font-playfair)] font-normal text-slate-900">
                                {getTranslation(language, 'landing.hero.title3')}
                            </span>{' '}
                            <span className="font-[family-name:var(--font-dm-sans)] font-bold text-blue-600">
                                {getTranslation(language, 'landing.hero.title4')}
                            </span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)] mb-8"
                        >
                            {mode === "learner"
                                ? getTranslation(language, 'landing.hero.desc')
                                : getTranslation(language, 'landing.hero.desc.school')
                            }
                        </motion.p>

                        {/* Mode Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="inline-flex p-1 bg-slate-100 rounded-xl relative mb-8"
                        >
                            <motion.div
                                className="absolute inset-y-1 bg-white rounded-lg shadow-sm"
                                layoutId="toggle-bg"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                style={{
                                    left: mode === "learner" ? "4px" : "50%",
                                    width: "calc(50% - 4px)",
                                }}
                            />
                            <button
                                onClick={() => setMode("learner")}
                                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 flex items-center gap-2 ${mode === "learner" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                {getTranslation(language, 'landing.mode.learner')}
                            </button>
                            <button
                                onClick={() => setMode("school")}
                                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10 flex items-center gap-2 ${mode === "school" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Building2 className="w-4 h-4" />
                                {getTranslation(language, 'landing.mode.school')}
                            </button>
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <SignInButton mode="modal">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:shadow-blue-600/30"
                                >
                                    {mode === "learner"
                                        ? getTranslation(language, 'landing.cta.learner')
                                        : getTranslation(language, 'landing.cta.school')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </SignInButton>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    {getTranslation(language, 'landing.cta.desc.learner')}
                                </span>
                                <span className="hidden sm:flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    {getTranslation(language, 'landing.cta.freeTier')}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Product Preview — Shows what users get */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mt-16 max-w-5xl mx-auto"
                    >
                        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                            {/* Browser chrome mockup */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-slate-100 rounded-lg px-4 py-1.5 text-xs text-slate-400 font-mono">
                                        mhmmd.app/dashboard
                                    </div>
                                </div>
                            </div>

                            {/* App preview content */}
                            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-white">
                                <AnimatePresence mode="wait">
                                    {mode === "learner" ? (
                                        <motion.div
                                            key="learner-preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="grid md:grid-cols-3 gap-4"
                                        >
                                            {/* Quiz Card Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.quiz.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.quiz.count')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{getTranslation(language, 'landing.preview.quiz.correct')}</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{getTranslation(language, 'landing.preview.quiz.status')}</span>
                                                </div>
                                            </div>

                                            {/* AI Generation Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.ai.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.ai.subtitle')}</p>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full w-3/4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
                                                </div>
                                            </div>

                                            {/* Progress Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.progress.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.progress.subtitle')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-end gap-1 h-8">
                                                    {[40, 55, 45, 70, 60, 80, 75].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-emerald-400 rounded-sm"
                                                            style={{ height: `${h}%` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="school-preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="grid md:grid-cols-3 gap-4"
                                        >
                                            {/* Teacher Dashboard Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                                        <LayoutDashboard className="w-4 h-4 text-violet-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.teacher.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.teacher.subtitle')}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-500">{getTranslation(language, 'landing.preview.teacher.activeStudents')}</span>
                                                        <span className="font-semibold text-slate-900">127</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-500">{getTranslation(language, 'landing.preview.teacher.pendingTasks')}</span>
                                                        <span className="font-semibold text-slate-900">3</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Class Analytics Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.analytics.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.analytics.subtitle')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-end gap-1 h-8">
                                                    {[65, 72, 58, 81, 77, 89, 85].map((h, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 bg-blue-400 rounded-sm"
                                                            style={{ height: `${h}%` }}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-emerald-600 mt-2">{getTranslation(language, 'landing.preview.analytics.growth')}</p>
                                            </div>

                                            {/* Bulk Actions Preview */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{getTranslation(language, 'landing.preview.bulk.title')}</p>
                                                        <p className="text-xs text-slate-500">{getTranslation(language, 'landing.preview.bulk.subtitle')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">10-A</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">10-B</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">11-A</span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{getTranslation(language, 'landing.preview.bulk.moreClasses')}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                SOCIAL PROOF — Specific, Believable Numbers
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-6">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-sm uppercase tracking-widest text-slate-400 mb-10 font-[family-name:var(--font-dm-sans)]"
                    >
                        {getTranslation(language, 'landing.stats.trusted')}
                    </motion.p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: "387k+", label: getTranslation(language, 'landing.stats.quizzes'), detail: getTranslation(language, 'landing.stats.detail.quizzes') },
                            { number: "12,400+", label: getTranslation(language, 'landing.stats.active'), detail: getTranslation(language, 'landing.stats.detail.active') },
                            { number: "520+", label: getTranslation(language, 'landing.stats.schools'), detail: getTranslation(language, 'landing.stats.detail.schools') },
                            { number: "94%", label: getTranslation(language, 'landing.stats.success'), detail: getTranslation(language, 'landing.stats.detail.success') },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
                                    {stat.number}
                                </p>
                                <p className="text-sm text-slate-600 mt-1 font-[family-name:var(--font-dm-sans)]">
                                    {stat.label}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {stat.detail}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                FEATURES SECTION
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section id="features" className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.features.title')}
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.features.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <AnimatePresence mode="wait">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={`${mode}-${i}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} ${feature.color} mb-4`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-[family-name:var(--font-dm-sans)]">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed font-[family-name:var(--font-dm-sans)]">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                TESTIMONIAL — Real Student/School Voice
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section className="py-16 bg-blue-50/50">
                <div className="container mx-auto px-6">
                    <AnimatePresence mode="wait">
                        {mode === "learner" ? (
                            <motion.div
                                key="learner-testimonial"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                viewport={{ once: true }}
                                className="max-w-3xl mx-auto text-center"
                            >
                                <div className="flex justify-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <blockquote className="text-xl sm:text-2xl text-slate-700 font-[family-name:var(--font-playfair)] italic mb-6 leading-relaxed">
                                    {getTranslation(language, 'landing.testimonial.student.quote')}
                                </blockquote>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                        F
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-slate-900 font-[family-name:var(--font-dm-sans)]">{getTranslation(language, 'landing.testimonial.student.name')}</p>
                                        <p className="text-sm text-slate-500">{getTranslation(language, 'landing.testimonial.student.role')}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="school-testimonial"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                viewport={{ once: true }}
                                className="max-w-3xl mx-auto text-center"
                            >
                                <div className="flex justify-center gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <blockquote className="text-xl sm:text-2xl text-slate-700 font-[family-name:var(--font-playfair)] italic mb-6 leading-relaxed">
                                    {getTranslation(language, 'landing.testimonial.teacher.quote')}
                                </blockquote>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                        T
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-slate-900 font-[family-name:var(--font-dm-sans)]">{getTranslation(language, 'landing.testimonial.teacher.name')}</p>
                                        <p className="text-sm text-slate-500">{getTranslation(language, 'landing.testimonial.teacher.role')}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                PRICING SECTION
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section id="pricing" className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.pricing.title')}
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.pricing.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <PricingCard
                            title={getTranslation(language, 'landing.pricing.free.title')}
                            price={getTranslation(language, 'landing.pricing.free.price')}
                            unit={getTranslation(language, 'landing.pricing.free.unit')}
                            features={[
                                getTranslation(language, 'landing.pricing.free.f1'),
                                getTranslation(language, 'landing.pricing.free.f2'),
                                getTranslation(language, 'landing.pricing.free.f3'),
                            ]}
                            cta={getTranslation(language, 'landing.pricing.cta')}
                            delay={0.1}
                        />

                        {/* Pro Plan */}
                        <PricingCard
                            title={getTranslation(language, 'landing.pricing.pro.title')}
                            price={getTranslation(language, 'landing.pricing.pro.price')}
                            unit={getTranslation(language, 'landing.pricing.pro.unit')}
                            features={[
                                getTranslation(language, 'landing.pricing.pro.f1'),
                                getTranslation(language, 'landing.pricing.pro.f2'),
                                getTranslation(language, 'landing.pricing.pro.f3'),
                            ]}
                            cta={getTranslation(language, 'landing.pricing.cta')}
                            popular
                            badge={getTranslation(language, 'landing.pricing.mostPopular')}
                            delay={0.2}
                        />

                        {/* School Plan */}
                        <PricingCard
                            title={getTranslation(language, 'landing.pricing.school.title')}
                            price={getTranslation(language, 'landing.pricing.school.price')}
                            unit={getTranslation(language, 'landing.pricing.school.unit')}
                            features={[
                                getTranslation(language, 'landing.pricing.school.f1'),
                                getTranslation(language, 'landing.pricing.school.f2'),
                                getTranslation(language, 'landing.pricing.school.f3'),
                            ]}
                            cta={getTranslation(language, 'landing.pricing.contact')}
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                FINAL CTA
                ═══════════════════════════════════════════════════════════════════════════ */}
            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.finalCta.title')}
                        </h2>
                        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-8 font-[family-name:var(--font-dm-sans)]">
                            {getTranslation(language, 'landing.finalCta.subtitle')}
                        </p>
                        <SignInButton mode="modal">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-base font-semibold rounded-xl bg-white hover:bg-slate-50 text-blue-600 shadow-lg transition-all"
                            >
                                {getTranslation(language, 'landing.finalCta.button')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </SignInButton>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════════════
                FOOTER
                ═══════════════════════════════════════════════════════════════════════════ */}
            <footer className="py-8 border-t border-slate-100 bg-white">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-[family-name:var(--font-dm-sans)]">
                        <span className="bg-blue-600 text-white rounded-lg p-1.5">
                            <Sparkles className="w-4 h-4" />
                        </span>
                        <span>&copy; {new Date().getFullYear()} {getTranslation(language, 'landing.footer.copy')}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">{getTranslation(language, 'landing.footer.privacy')}</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">{getTranslation(language, 'landing.footer.terms')}</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">{getTranslation(language, 'landing.footer.contact')}</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function PricingCard({
    title,
    price,
    unit,
    features,
    cta,
    popular,
    badge,
    delay
}: {
    title: string;
    price: string;
    unit: string;
    features: string[];
    cta: string;
    popular?: boolean;
    badge?: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className={`relative p-6 rounded-2xl border ${popular
                ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-600'
                : 'bg-white border-slate-200'
                } flex flex-col`}
        >
            {popular && badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {badge}
                </div>
            )}

            <h3 className="text-lg font-bold text-slate-900 mb-2 font-[family-name:var(--font-dm-sans)]">
                {title}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-dm-sans)]">
                    {price === 'Custom' || price === 'Xüsusi' || price === 'Индивидуал' ? price : `$${price}`}
                </span>
                <span className="text-slate-500 font-[family-name:var(--font-dm-sans)]">{unit}</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-slate-600 text-sm font-[family-name:var(--font-dm-sans)]">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${popular ? 'text-blue-600' : 'text-slate-400'}`} />
                        {feature}
                    </li>
                ))}
            </ul>
            <SignInButton mode="modal">
                <Button
                    className={`w-full rounded-xl py-5 font-semibold ${popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                >
                    {cta}
                </Button>
            </SignInButton>
        </motion.div>
    );
}
