"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { SignInButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Language, getTranslation } from "@/lib/translations"
import SmartSimpleBrilliant from "./landing/smart-simple-brilliant"
import YourWorkInSync from "./landing/your-work-in-sync"
import EffortlessIntegration from "./landing/effortless-integration-updated"
import NumbersThatSpeak from "./landing/numbers-that-speak"

// Reusable Badge Component
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-3 py-1.5 bg-background shadow-sm overflow-hidden rounded-full flex justify-start items-center gap-2 border border-border">
      <div className="w-3.5 h-3.5 relative overflow-hidden flex items-center justify-center text-primary">{icon}</div>
      <div className="text-center flex justify-center flex-col text-foreground text-xs font-medium leading-none font-sans">
        {text}
      </div>
    </div>
  )
}

// Language Switcher Component
function LanguageSwitcher({ current, onChange }: { current: Language; onChange: (lang: Language) => void }) {
  const langs: { code: Language; label: string }[] = [
    { code: "az", label: "AZ" },
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
  ]

  return (
    <div className="flex bg-muted/30 rounded-full p-1 border border-border/50">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full transition-all ${current === lang.code
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

// FeatureCard component
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-6 py-5 overflow-hidden flex flex-col justify-start items-start gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 ${isActive
        ? "bg-muted/30 shadow-[inset_0_0_0_1px_rgba(100,66,239,0.1)]"
        : "border-l-0 border-r-0 md:border border-border/60"
        }`}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/10">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-foreground text-sm md:text-sm font-semibold leading-6 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-muted-foreground text-[13px] md:text-[13px] font-normal leading-[22px] md:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  )
}

// FAQ Section Component
function FAQSection({ t }: { t: (key: string) => string }) {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqData = [
    {
      question: t("landing.faq.q1"),
      answer: t("landing.faq.a1"),
    },
    {
      question: t("landing.faq.q2"),
      answer: t("landing.faq.a2"),
    },
    {
      question: t("landing.faq.q3"),
      answer: t("landing.faq.a3"),
    },
    {
      question: t("landing.faq.q4"),
      answer: t("landing.faq.a4"),
    },
    {
      question: t("landing.faq.q5"),
      answer: t("landing.faq.a5"),
    },
    {
      question: t("landing.faq.q6"),
      answer: t("landing.faq.a6"),
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div id="faq" className="w-full flex justify-center items-start border-b border-border/60">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <div className="w-full flex flex-col justify-center text-foreground font-semibold leading-tight md:leading-[44px] font-display text-4xl tracking-tight">
            {t("landing.header.faq")}
          </div>
          <div className="w-full text-muted-foreground text-base font-normal leading-7 font-sans">
            {t("landing.faq.subtitle1")}
            <br className="hidden md:block" />
            {t("landing.faq.subtitle2")}
          </div>
        </div>

        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)
              return (
                <div key={index} className="w-full border-b border-border/80 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-4 flex justify-between items-center gap-5 text-left hover:bg-accent/30 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-foreground text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <svg
                        className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="px-5 pb-5 text-muted-foreground text-sm font-normal leading-6 font-sans">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Pricing Section Component
function PricingSection({ t }: { t: (key: string) => string }) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually")

  const pricing = {
    free: { monthly: 0, annually: 0 },
    pro: { monthly: 9, annually: 7 },
    organisation: { monthly: 29, annually: 23 },
  }

  return (
    <div id="pricing" className="w-full flex flex-col justify-center items-center gap-2 border-b border-border/60">
      {/* Header Section */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-border/60 flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            text={t("landing.header.pricing")}
          />
          <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-display tracking-tight">
            {t("landing.pricing.title")}
          </div>
          <div className="self-stretch text-center text-muted-foreground text-base font-normal leading-7 font-sans">
            {t("landing.pricing.subtitle")}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="self-stretch px-6 md:px-16 py-8 relative flex justify-center items-center gap-4">
        <div className="w-full max-w-[1060px] h-0 absolute left-1/2 transform -translate-x-1/2 top-[60px] border-t border-border/60 z-0"></div>
        <div className="p-2 relative bg-muted/30 border border-border/60 backdrop-blur-xl flex justify-center items-center rounded-lg z-20">
          <div className="p-0.5 bg-muted rounded-full border border-border flex justify-center items-center gap-0.5 relative">
            <div
              className={`absolute top-0.5 w-[calc(50%-2px)] h-[calc(100%-4px)] bg-background shadow-sm rounded-full transition-all duration-300 ease-in-out ${billingPeriod === "annually" ? "left-0.5" : "right-0.5"
                }`}
            />
            <button
              onClick={() => setBillingPeriod("annually")}
              className="px-6 py-1.5 rounded-full flex justify-center items-center gap-2 relative z-10 flex-1"
            >
              <div className={`text-xs font-medium leading-5 font-sans ${billingPeriod === "annually" ? "text-foreground" : "text-muted-foreground"}`}>
                {t("landing.pricing.annually")}
              </div>
            </button>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className="px-6 py-1.5 rounded-full flex justify-center items-center gap-2 relative z-10 flex-1"
            >
              <div className={`text-xs font-medium leading-5 font-sans ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                {t("landing.pricing.monthly")}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="self-stretch border-b border-t border-border/60 flex justify-center items-center">
        <div className="flex justify-center items-start w-full">
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px] opacity-20"></div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-6 py-12 md:py-0">
            {/* Free Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 border border-border overflow-hidden flex flex-col justify-start items-start gap-12 bg-transparent">
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-foreground text-lg font-medium leading-7 font-sans">{t("landing.pricing.free.title")}</div>
                  <div className="w-full max-w-[242px] text-muted-foreground text-sm font-normal leading-5 font-sans">
                    {t("landing.pricing.free.subtitle")}
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-foreground text-5xl font-medium leading-[60px] font-display">
                      $0
                    </div>
                    <div className="text-muted-foreground text-sm font-medium font-sans">{t("landing.cta.freeTier")}</div>
                  </div>
                </div>
                <SignInButton mode="modal">
                  <div className="self-stretch px-4 py-2.5 relative bg-foreground shadow-sm overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-foreground/90 transition-colors">
                    <div className="flex justify-center flex-col text-background text-[13px] font-medium leading-5 font-sans">
                      {t("landing.pricing.cta")}
                    </div>
                  </div>
                </SignInButton>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="self-stretch flex justify-start items-center gap-[13px]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex-1 text-muted-foreground text-[12.5px] font-normal leading-5 font-sans">{t(`landing.pricing.free.f${idx}`)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 bg-primary border border-primary/20 shadow-lg overflow-hidden flex flex-col justify-start items-start gap-12">
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-primary-foreground text-lg font-medium leading-7 font-sans">{t("landing.pricing.pro.title")}</div>
                  <div className="w-full max-w-[242px] text-primary-foreground/70 text-sm font-normal leading-5 font-sans">
                    {t("landing.pricing.pro.subtitle")}
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-primary-foreground text-5xl font-medium leading-[60px] font-display">
                      ${pricing.pro[billingPeriod]}
                    </div>
                    <div className="text-primary-foreground/80 text-sm font-medium font-sans">
                      {t("landing.pricing.per")} {billingPeriod === "monthly" ? t("landing.pricing.month") : t("landing.pricing.year")}
                    </div>
                  </div>
                </div>
                <SignInButton mode="modal">
                  <div className="self-stretch px-4 py-2.5 relative bg-primary-foreground shadow-sm overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-primary-foreground/90 transition-colors">
                    <div className="flex justify-center flex-col text-primary text-[13px] font-medium leading-5 font-sans">
                      {t("landing.pricing.pro.cta")}
                    </div>
                  </div>
                </SignInButton>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div key={idx} className="self-stretch flex justify-start items-center gap-[13px]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex-1 text-primary-foreground/90 text-[12.5px] font-normal leading-5 font-sans">{t(`landing.pricing.pro.f${idx}`)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 bg-background border border-border overflow-hidden flex flex-col justify-start items-start gap-12">
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-foreground text-lg font-medium leading-7 font-sans">{t("landing.pricing.school.title")}</div>
                  <div className="w-full max-w-[242px] text-muted-foreground text-sm font-normal leading-5 font-sans">
                    {t("landing.pricing.school.subtitle")}
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-foreground text-5xl font-medium leading-[60px] font-display">
                      {t("landing.pricing.school.price")}
                    </div>
                    <div className="text-muted-foreground text-sm font-medium font-sans">
                      {t("landing.pricing.school.per")}
                    </div>
                  </div>
                </div>
                <SignInButton mode="modal">
                  <div className="self-stretch px-4 py-2.5 relative bg-foreground shadow-sm overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-foreground/90 transition-colors">
                    <div className="flex justify-center flex-col text-background text-[13px] font-medium leading-5 font-sans">
                      {t("landing.pricing.contact")}
                    </div>
                  </div>
                </SignInButton>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                  <div key={idx} className="self-stretch flex justify-start items-center gap-[13px]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex-1 text-muted-foreground text-[12.5px] font-normal leading-5 font-sans">{t(`landing.pricing.school.f${idx}`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px] opacity-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Testimonials Section
function TestimonialsSection({ t }: { t: (key: string) => string }) {
  const testimonials = [
    {
      quote: t("landing.testimonial.student.quote"),
      name: t("landing.testimonial.student.name"),
      role: t("landing.testimonial.student.role"),
    },
    {
      quote: t("landing.testimonial.teacher.quote"),
      name: t("landing.testimonial.teacher.name"),
      role: t("landing.testimonial.teacher.role"),
    },
  ]

  return (
    <div className="w-full border-b border-border/60">
      <div className="self-stretch px-6 md:px-24 py-12 md:py-16 border-b border-border/60 flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4">
          <Badge
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            text={t("landing.testimonial.title")}
          />
          <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-display tracking-tight">
            {t("landing.testimonials.title")}
          </div>
          <div className="self-stretch text-center text-muted-foreground text-base font-normal leading-7 font-sans">
            {t("landing.testimonials.subtitle")}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-24 py-12 md:py-16 flex justify-center">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-foreground">
                    <path d="M8 1L9.79 5.24L14.4 5.87L11.2 8.95L11.94 13.53L8 11.46L4.06 13.53L4.8 8.95L1.6 5.87L6.21 5.24L8 1Z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg font-medium text-foreground mb-6 leading-relaxed">"{t.quote}"</blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div>
                  <div className="font-semibold text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// CTA Section
function CTASection({ t }: { t: (key: string) => string }) {
  return (
    <div className="w-full py-20 md:py-32 bg-primary border-b border-primary/20">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold text-primary-foreground mb-6 tracking-tight font-display">
            {t("landing.finalCta.title")}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            {t("landing.finalCta.subtitle")}
          </p>
          <SignInButton mode="modal">
            <div className="inline-flex h-14 px-10 py-2 bg-primary-foreground rounded-full justify-center items-center cursor-pointer hover:bg-primary-foreground/90 transition-colors">
              <div className="text-primary text-base font-semibold">{t("landing.finalCta.button")}</div>
            </div>
          </SignInButton>
        </div>
      </div>
    </div>
  )
}

// Footer Section
function FooterSection({ t }: { t: (key: string) => string }) {
  return (
    <div className="w-full pt-10 flex flex-col justify-start items-start bg-background">
      <div className="self-stretch flex flex-col md:flex-row justify-between items-stretch pr-0 pb-8 pt-0">
        <div className="p-4 md:p-8 flex flex-col justify-start items-start gap-8">
          <div className="self-stretch flex justify-start items-center gap-3">
            <div className="text-center text-foreground text-xl font-semibold leading-4 font-display">Qavra</div>
          </div>
          <div className="text-muted-foreground text-sm font-medium leading-[18px] font-sans">
            {t("landing.footer.desc")}
          </div>
          <div className="flex justify-start items-start gap-4 text-muted-foreground">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
          </div>
        </div>

        <div className="self-stretch p-4 md:p-8 flex flex-col sm:flex-row flex-wrap justify-start sm:justify-between items-start gap-6 md:gap-8">
          <div className="flex flex-col justify-start items-start gap-3 flex-1 min-w-[120px]">
            <div className="text-muted-foreground/50 text-sm font-medium leading-5 font-sans">{t("landing.footer.product")}</div>
            <div className="flex flex-col justify-end items-start gap-2">
              {[
                { label: t("landing.header.features"), link: "#features" },
                { label: t("landing.header.pricing"), link: "#pricing" },
                { label: t("landing.footer.modes"), link: "#" },
                { label: t("landing.footer.ai"), link: "#" },
              ].map((item) => (
                <div key={item.label} className="text-foreground/80 text-sm font-normal leading-5 font-sans cursor-pointer hover:text-primary transition-colors">{item.label}</div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-3 flex-1 min-w-[120px]">
            <div className="text-muted-foreground/50 text-sm font-medium leading-5 font-sans">{t("landing.footer.company")}</div>
            <div className="flex flex-col justify-center items-start gap-2">
              {[
                { label: t("landing.footer.about"), link: "#" },
                { label: t("landing.footer.contact"), link: "#" },
                { label: t("landing.footer.careers"), link: "#" },
                { label: t("landing.footer.blog"), link: "#" },
              ].map((item) => (
                <div key={item.label} className="text-foreground/80 text-sm font-normal leading-5 font-sans cursor-pointer hover:text-primary transition-colors">{item.label}</div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-3 flex-1 min-w-[120px]">
            <div className="text-muted-foreground/50 text-sm font-medium leading-5 font-sans">{t("landing.footer.resources")}</div>
            <div className="flex flex-col justify-center items-center gap-2">
              {[
                { label: t("landing.footer.help"), link: "#" },
                { label: t("landing.footer.privacy"), link: "#" },
                { label: t("landing.footer.terms"), link: "#" },
                { label: t("landing.footer.support"), link: "#" },
              ].map((item) => (
                <div key={item.label} className="self-stretch text-foreground/80 text-sm font-normal leading-5 font-sans cursor-pointer hover:text-primary transition-colors">{item.label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch h-12 relative overflow-hidden border-t border-b border-border/60">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative opacity-20">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-[300px] h-16 border border-border"
                style={{ left: `${i * 300 - 600}px`, top: "-120px", transform: "rotate(-45deg)", transformOrigin: "top left" }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full py-6 px-8 flex justify-between items-center text-sm text-muted-foreground">
        <div>{t("landing.footer.copy")}</div>
      </div>
    </div>
  )
}

// Main Landing Page Component
export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(false)
  const [language, setLanguage] = useState<Language>("az")

  // Social Proof Stats from Convex
  const onlineUsers = useQuery(api.presence.getOnlineUsers)
  const onlineCount = onlineUsers?.length ?? "..."

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language") as Language
    if (savedLang && ["az", "en", "ru"].includes(savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem("app-language", newLang)
  }

  const t = (key: string, params?: Record<string, string | number>) =>
    getTranslation(language, key, params)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return
      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3)
          }
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  return (
    <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center">
      <div className="relative flex flex-col justify-start items-center w-full">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
          {/* Left/Right vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border shadow-[1px_0px_0px_var(--background)] z-0"></div>
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border shadow-[1px_0px_0px_var(--background)] z-0"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-border/20 flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
            {/* Navigation */}
            <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
              <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-border/60 shadow-[0px_1px_0px_var(--background)]"></div>
              <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-background/80 backdrop-blur-md shadow-[0px_0px_0px_2px_var(--background)] overflow-hidden rounded-full border border-border flex justify-between items-center relative z-30">
                <div className="flex justify-center items-center">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-foreground text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-display">
                      Qavra
                    </div>
                  </div>
                  <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
                    <a href="#features" className="flex justify-start items-center cursor-pointer hover:text-foreground transition-colors group">
                      <div className="flex flex-col justify-center text-muted-foreground group-hover:text-foreground text-xs md:text-[13px] font-medium leading-[14px] font-sans">{t("landing.header.features")}</div>
                    </a>
                    <a href="#pricing" className="flex justify-start items-center cursor-pointer hover:text-foreground transition-colors group">
                      <div className="flex flex-col justify-center text-muted-foreground group-hover:text-foreground text-xs md:text-[13px] font-medium leading-[14px] font-sans">{t("landing.header.pricing")}</div>
                    </a>
                    <a href="#faq" className="flex justify-start items-center cursor-pointer hover:text-foreground transition-colors group">
                      <div className="flex flex-col justify-center text-muted-foreground group-hover:text-foreground text-xs md:text-[13px] font-medium leading-[14px] font-sans">{t("landing.header.faq")}</div>
                    </a>
                  </div>
                </div>
                <div className="h-6 sm:h-7 md:h-8 flex justify-start items-center gap-2 sm:gap-3">
                  <LanguageSwitcher current={language} onChange={handleLanguageChange} />
                  <SignInButton mode="modal">
                    <div className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-background shadow-sm border border-border overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-muted transition-colors">
                      <div className="flex flex-col justify-center text-foreground text-xs md:text-[13px] font-medium leading-5 font-sans">{t("landing.header.login")}</div>
                    </div>
                  </SignInButton>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="pt-16 sm:pt-20 md:pt-24 lg:pt-[216px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full">
              <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-sm flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-foreground text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-display px-2 sm:px-4 md:px-0">
                    {t("landing.hero.title1")}
                    <br />
                    {t("landing.hero.title2")}
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-muted-foreground sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    {t("landing.hero.subtitle1")}
                    <br className="hidden sm:block" />
                    {t("landing.hero.subtitle2")}
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                  <SignInButton mode="modal">
                    <div className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-primary shadow-lg overflow-hidden rounded-full flex justify-center items-center cursor-pointer hover:bg-primary/90 transition-colors">
                      <div className="flex flex-col justify-center text-primary-foreground text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">
                        {t("landing.hero.cta")}
                      </div>
                    </div>
                  </SignInButton>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                <img
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{ filter: "hue-rotate(260deg) saturate(0.8) brightness(1.1)" }}
                />
              </div>

              {/* Dashboard Preview */}
              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-8 sm:my-12 md:my-16 lg:my-16 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-white shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-sm sm:rounded-md lg:rounded-xl flex flex-col justify-start items-start">
                  <div className="self-stretch flex-1 flex justify-start items-start">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Quiz Preview Images - Placeholder */}
                        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 0 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"}`}>
                          <div className="w-full h-full bg-muted/20 flex items-center justify-center text-center p-8 flex-col">
                            <div className="text-6xl mb-4">📝</div>
                            <div className="text-2xl font-semibold text-foreground mb-2">{t("landing.features.modes.title")}</div>
                            <div className="text-muted-foreground">{t("landing.features.modes.desc")}</div>
                          </div>
                        </div>
                        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 1 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"}`}>
                          <div className="w-full h-full bg-muted/20 flex items-center justify-center text-center p-8 flex-col">
                            <div className="text-6xl mb-4">🔄</div>
                            <div className="text-2xl font-semibold text-foreground mb-2">{t("landing.features.retake.title")}</div>
                            <div className="text-muted-foreground">{t("landing.features.retake.desc")}</div>
                          </div>
                        </div>
                        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeCard === 2 ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-sm"}`}>
                          <div className="w-full h-full bg-muted/20 flex items-center justify-center text-center p-8 flex-col">
                            <div className="text-6xl mb-4">✨</div>
                            <div className="text-2xl font-semibold text-foreground mb-2">{t("landing.features.ai.title")}</div>
                            <div className="text-muted-foreground">{t("landing.features.ai.desc")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div id="features" className="self-stretch border-t border-border/60 border-b border-border/60 flex justify-center items-start">
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px] opacity-20"></div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 px-0 sm:px-2 md:px-0 flex flex-col md:flex-row justify-center items-stretch gap-0">
                  <FeatureCard
                    title={t("landing.features.modes.title")}
                    description={t("landing.features.modes.desc")}
                    isActive={activeCard === 0}
                    progress={activeCard === 0 ? progress : 0}
                    onClick={() => handleCardClick(0)}
                  />
                  <FeatureCard
                    title={t("landing.features.retake.title")}
                    description={t("landing.features.retake.desc")}
                    isActive={activeCard === 1}
                    progress={activeCard === 1 ? progress : 0}
                    onClick={() => handleCardClick(1)}
                  />
                  <FeatureCard
                    title={t("landing.features.ai.title")}
                    description={t("landing.features.ai.desc")}
                    isActive={activeCard === 2}
                    progress={activeCard === 2 ? progress : 0}
                    onClick={() => handleCardClick(2)}
                  />
                </div>

                <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                  <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Proof Section */}
              <div className="w-full border-b border-border/60 flex flex-col justify-center items-center">
                <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-border/60 flex justify-center items-center gap-6">
                  <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4">
                    <Badge
                      icon={
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <rect x="1" y="3" width="4" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="8" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text={t("landing.stats.trusted")}
                    />
                    <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-display tracking-tight">
                      {t("landing.stats.trusted.title")}
                    </div>
                    <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      {t("landing.stats.trusted.desc")}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="self-stretch border-border/60 flex justify-center items-start border-t border-b-0">
                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start opacity-20">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px]" />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-0 border-l border-r border-border/60">
                    {[
                      { value: onlineCount === "..." ? "..." : `${onlineCount}`, label: t("landing.stats.online") },
                      { value: "1M+", label: t("landing.stats.quizzes") },
                      { value: "200+", label: t("landing.stats.schools") },
                      { value: "98%", label: t("landing.stats.satisfaction") },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex flex-col justify-center items-center gap-1 border-b border-r border-border/60"
                      >
                        <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight">{stat.value}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Grid Section */}
              <div className="w-full border-b border-border/60 flex flex-col justify-center items-center">
                <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-border/60 flex justify-center items-center gap-6">
                  <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4">
                    <Badge
                      icon={
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="1" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                          <rect x="7" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                        </svg>
                      }
                      text={t("landing.header.features")}
                    />
                    <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-display tracking-tight">
                      {t("landing.bentogrid.title")}
                    </div>
                    <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      {t("landing.bentogrid.subtitle1")}
                      <br />
                      {t("landing.bentogrid.subtitle2")}
                    </div>
                  </div>
                </div>

                <div className="self-stretch flex justify-center items-start">
                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start opacity-20">
                      {Array.from({ length: 200 }).map((_, i) => (
                        <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px]" />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-border/60">
                    <div className="border-b border-r-0 md:border-r border-border/60 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-display">{t("landing.features.ai.title")}</h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          {t("landing.features.ai.desc")}
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden">
                        <SmartSimpleBrilliant width="100%" height="100%" theme="light" className="scale-50 sm:scale-65 md:scale-75 lg:scale-90" />
                      </div>
                    </div>

                    <div className="border-b border-border/60 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground font-semibold leading-tight font-display text-lg sm:text-xl">{t("landing.bentogrid.f2.title")}</h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          {t("landing.bentogrid.f2.desc")}
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center">
                        <YourWorkInSync width="400" height="250" theme="light" className="scale-60 sm:scale-75 md:scale-90" />
                      </div>
                    </div>

                    <div className="border-r-0 md:border-r border-border/60 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-display">{t("landing.pricing.school.title")}</h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          {t("landing.pricing.school.subtitle")}
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden justify-center items-center relative bg-transparent">
                        <div className="w-full h-full flex items-center justify-center bg-transparent">
                          <EffortlessIntegration width={400} height={250} className="max-w-full max-h-full" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-display">{t("landing.bentogrid.f4.title")}</h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          {t("landing.bentogrid.f4.desc")}
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <NumbersThatSpeak width="100%" height="100%" theme="light" className="w-full h-full object-contain" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="w-4 sm:w-6 md:w-8 lg:w-12 self-stretch relative overflow-hidden">
                    <div className="w-[120px] sm:w-[140px] md:w-[162px] left-[-40px] sm:left-[-50px] md:left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start opacity-20">
                      {Array.from({ length: 200 }).map((_, i) => (
                        <div key={i} className="self-stretch h-3 sm:h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-border outline-offset-[-0.25px]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <TestimonialsSection t={t} />

              {/* Pricing Section */}
              <PricingSection t={t} />

              {/* FAQ Section */}
              <FAQSection t={t} />

              {/* CTA Section */}
              <CTASection t={t} />

              {/* Footer Section */}
              <FooterSection t={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
