'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import {
  Sparkles,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Language, getTranslation } from '@/lib/translations';

interface NavbarProps {
  mode: "learner" | "school";
  onModeChange: (mode: "learner" | "school") => void;
  language: Language;
  onLanguageChange: (newLang: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode, onModeChange, language, onLanguageChange }) => {
  return (
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

          <button
            onClick={() => onModeChange(mode === "learner" ? "school" : "learner")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            {mode === "learner" ? (
              <>
                <Building2 className="w-4 h-4" />
                {getTranslation(language, 'landing.mode.school')}
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                {getTranslation(language, 'landing.mode.learner')}
              </>
            )}
          </button>

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
                onClick={() => onLanguageChange(lang)}
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
  );
};

export default Navbar;
