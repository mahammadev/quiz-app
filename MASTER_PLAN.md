# QuizCreator - Master Plan

> Complete reference for what the app is, does, and how it works
> **Status**: Active | **Last Updated**: 2026-02-04

---

## Table of Contents

1. [What It Is](#what-it-is)
2. [Target Users](#target-users)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Data Model](#data-model)
6. [User Flows](#user-flows)
7. [Roadmap](#roadmap)
8. [Tech Stack](#tech-stack)

---

## What It Is

A **personal quiz creation platform** that turns any text or PDF into an interactive quiz for study, teaching, or exam prep.

### Core Value Proposition

| For Individuals | For Teachers | For Everyone |
|-----------------|---------------|--------------|
| Turn PDFs into quizzes in seconds | Create quizzes, share with students | Your data is yours |
| Track weak areas with mistakes log | See student results | No ads, no tracking |
| AI-generated questions | Bulk-convert past papers | Private workspace |

### What This Is NOT

- ❌ **Not a quiz marketplace** — no "explore" or "trending" pages
- ❌ **Not a social platform** — no followers, comments, or public profiles
- ❌ **Not an LMS** — no courses, grading workflows, or student rosters

---

## Target Users

| Persona | Use Case | Pain Point Solved |
|---------|----------|-------------------|
| **Individual Learner** | Upload study materials, generate quizzes, track progress | "I have too many notes, how do I study efficiently?" |
| **Teacher/Tutor** | Create quizzes from curriculum, share with students | "Creating quizzes manually takes too much time" |
| **Exam Preparer** | Convert past papers to interactive tests | "Paper past exams are hard to practice with" |

---

## Features

### ✅ Completed

| Feature | Description |
|---------|-------------|
| **Quiz CRUD** | Create, edit, delete quizzes with ownership validation |
| **Auth (Clerk)** | Secure authentication with Clerk |
| **Leaderboards** | Personal best tracking, optional guest mode |
| **Mistakes Tracking** | Save wrong answers for focused practice |
| **Organizations** | Admin/Teacher/Student role hierarchy |
| **Join Codes** | Students join orgs via simple code |
| **Invitations** | Token-based invite system for teachers |
| **Exam Sessions** | Live quizzes with 6-digit access codes |
| **AI Text-to-Quiz** | Generate questions from pasted text |
| **AI Doc-to-Quiz** | PDF/TXT upload with smart chunking |
| **Usage Tracking** | Count AI generations per user/month (3/month free tier) |
| **Progress Indicators** | Real-time progress bars for AI generation |
| **Gamification** | XP, levels, streaks, badges (backend & UI) |

### 🚧 In Progress

| Feature | Description | Progress |
|---------|-------------|----------|
| **Stripe Integration** | Payment processing for Pro/Team plans | Paused (Schema ready) |


### 📋 Planned

| Feature | Description |
|---------|-------------|
| **Gamification** | XP, levels, streaks, badges |
| **PWA** | Installable mobile app |
| **API Access** | Public REST API for integrations |
| **Question Templates** | Pre-built quiz templates |
| **Anki/Quizlet Import** | Import from other formats |

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────┐
│                   USER'S WORKSPACE                  │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐           │
│  │ My PDFs │ → │My Quizzes│ → │My Stats │           │
│  └─────────┘   └─────────┘   └─────────┘           │
│                      │                              │
│                      ▼                              │
│              [Share Link] ──→ Anyone can take       │
│                               (no account needed)   │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR, API routes, modern React |
| **Backend** | Convex | Real-time, serverless, type-safe |
| **Auth** | Clerk | Drop-in auth, webhooks, user management |
| **Payments** | Stripe | Industry standard payments |
| **AI** | Google Gemini API | Long context, structured output |
| **Hosting** | Vercel | Zero-config Next.js deployment |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/generate` | POST | Generate quiz from text/PDF |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/webhooks/stripe` | POST | Handle payment events |

### Convex Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | User profiles | by_clerkId |
| `quizzes` | Quiz storage | by_creator, by_name, by_orgId |
| `examSessions` | Live quiz sessions | by_accessCode, by_status |
| `examAttempts` | Quiz submissions | by_session, by_student |
| `leaderboard` | Scores | by_quizId, by_quiz_score |
| `userMistakes` | Wrong answers | by_user, by_user_quiz |
| `organizations` | Orgs/schools | by_slug, by_owner |
| `orgMembers` | Role assignments | by_org, by_user |
| `invitations` | Invite tokens | by_token, by_email |
| `aiUsage` | AI generation counts | by_user_month |

---

## Data Model

### Core Entities

```
User (Clerk)
    │
    ├── Quiz
    │     ├── Question[]
    │     └── Session
    │           └── Attempt[]
    │
    ├── Subscription
    ├── Mistakes[]
    └── AI Usage
```

### Question Schema

```typescript
{
  id: string;           // UUID v4
  type: "single" | "multiple" | "combination" | "true_false";
  question: string;      // Clean question text
  answers: {
    label: string;       // "A", "B", "C", "D"
    text: string;       // Answer text
  }[];
  correct_answer: string | string[];  // Label(s) of correct answer(s)
  metadata?: {
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
  };
}
```

### Quiz Sharing Model

| Scenario | Behavior |
|----------|----------|
| Creator shares link | Anyone with link can take the quiz |
| Guest takes quiz | Results shown immediately, not saved |
| Signed-in user takes quiz | Results saved to Mistakes/Stats |
| Link expires | Never (unless creator deletes quiz) |

**No account required to take a shared quiz.**

---

## User Flows

### Flow 1: Create Quiz from Text

```
1. User clicks "Create Quiz"
2. Pastes text content
3. Clicks "Generate Questions"
4. AI processes text (2-5 sec)
5. User reviews/edits questions
6. Saves quiz to library
7. (Optional) Shares link
```

### Flow 2: Take a Quiz (Guest)

```
1. Opens shared quiz link
2. Enters name (optional)
3. Answers each question
4. Submits at end
5. Sees score + breakdown
6. Can retry wrong answers
```

### Flow 3: Take a Quiz (Member)

```
1. Opens shared quiz link
2. (Auto-logged in via Clerk)
3. Answers each question
4. Submits at end
5. Sees score + breakdown
6. Wrong answers saved to Mistakes
7. Can practice from Mistakes later
```

### Flow 4: Join Organization

```
Teacher:
1. Creates organization
2. Gets join code
3. Shares code with students

Student:
1. Enters join code
2. Gets assigned "student" role
3. Sees org quizzes in dashboard
```

---

## Roadmap

### Phase 1: Foundation ✅

| Task | Status | Notes |
|------|--------|-------|
| Remove legacy admin panel | ✅ Done | Global admin removed |
| Implement ownership checks | ✅ Done | quizzes.ts, mistakes.ts updated |
| Rename teacherId → creatorId | ✅ Done | Schema hardened |
| Make creatorId/createdAt required | ✅ Done | Successfully migrated |
| Enforce Light Theme on Landing | ✅ Done | UX consistency |

### Phase 2: Organizations (MVP) ✅

| Task | Status | Notes |
|------|--------|-------|
| Add orgs/members tables | ✅ Done | Schema updated |
| Org-scoped quiz queries | ✅ Done | Security reinforced |
| Organization Join Codes | ✅ Done | Seamless student onboarding |
| Invitation System | ✅ Done | Token-based teacher invites |
| Shared Dashboard | ✅ Done | Hybrid personal/org view |

### Phase 3: AI Engine ✅

| Task | Status | Notes |
|------|--------|-------|
| Set up Gemini API integration | ✅ Done | Flash model |
| Build text-to-quiz UI | ✅ Done | Paste text → get quiz |
| Add usage tracking | ✅ Done | Count generations per user |
| Build doc-to-quiz UI | ✅ Done | PDF/TXT upload with drag-drop |
| Create smart chunking algorithm | ✅ Done | Smart question boundary detection |
| Add progress indicator | ✅ Done | Real-time progress with status messages |
| Error handling & retries | ✅ Done | Validation, deduplication, rate limiting |

### Phase 4: Monetization ⏸️

| Task | Status | Notes |
|------|--------|-------|
| Set up Stripe products | ⏸️ Paused | Free, Pro, Team tiers |
| Create checkout API | ⏸️ Paused | /api/stripe/checkout |
| Create webhook handler | ⏸️ Paused | /api/webhooks/stripe |
| Add pricing page | ⏸️ Paused | /pricing |
| Implement usage limits | ⏸️ Paused | AI generations, quiz count |

### Phase 5: Retention ✅

| Task | Status | Notes |
|------|--------|-------|
| Add gamification table | ✅ Done | XP, level, streaks |
| Implement XP earning | ✅ Done | Quiz completion, mistake practice |
| Implement streak tracking | ✅ Done | Daily visit streak |
| Create badge system | ✅ Done | Achievement badges |
| Add XP/level to UI | ✅ Done | Dashboard, headers, results |
| Achievement toasts | ✅ Done | Real-time notifications |


### Phase 6: Mobile 📋

| Task | Status | Notes |
|------|--------|-------|
| PWA optimization | 📋 Todo | Manifest, icons, offline |
| Test on mobile devices | 📋 Todo | iOS Safari, Android Chrome |
| Set up Capacitor | 📋 Todo | Native wrapper |
| App store submissions | 📋 Todo | iOS, Android |

---

## AI Engine Details

### Capabilities

| Feature | Input | Output |
|---------|-------|--------|
| **Text-to-Quiz** | Raw text paragraph | Array of Question objects |
| **Doc-to-Quiz** | PDF/TXT file | Array of Question objects |
| **Optimizer** | Existing quiz | Improved questions |
| **Difficulty Tune** | Quiz + target level | Adjusted questions |

### Smart Chunking Algorithm

For large PDFs (>10k chars), content is chunked:

1. **Extract** text from PDF using pdf-parse
2. **Detect** question patterns:
   - `QUESTION_START`: `/^(\d{1,3})[.\)]\s/m` → "1.", "23)", "100."
   - `ANSWER_OPTION`: `/^[A-E][.\)]\s/m` → "A)", "B.", "C)"
3. **Build** question blocks (20-25 per batch)
4. **Validate** each block has answer options
5. **Batch** send to Gemini for parsing
6. **Post-process**: deduplicate, validate JSON

### Pricing & Limits

| Tier | AI Generations | Cost |
|------|----------------|------|
| Free | 3/month | $0 |
| Pro | Unlimited | TBD |
| Team | Unlimited + more users | TBD |

### Models

| Model | Use Case | Cost |
|-------|----------|------|
| **Gemini 1.5 Flash** | Text-to-Quiz, Doc-to-Quiz MVP | $0.075/1M tokens |
| **Gemini 1.5 Pro** | Fallback for complex docs | $3.50/1M tokens |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | App runs without errors | 0 crashes |
| 2 | First organization created | 1 org |
| 3 | AI quizzes generated | 100 quizzes |
| 4 | Daily active users | 50 DAU |
| 5 | Paying subscribers | 10 Pro users |
| 6 | App store rating | 4.0+ stars |

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Optional
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
GOOGLE_AI_API_KEY=your_gemini_key
```

---

## Quick Links

- [README](./README.md) - Setup & running locally
- [ROADMAP](./.brain/ROADMAP.md) - Detailed phase breakdown
- [DATA_MODEL](./.brain/DATA_MODEL.md) - Schema reference
- [AI_ENGINE](./.brain/AI_ENGINE.md) - AI implementation details
- [ORGANIZATIONS](./.brain/ORGANIZATIONS.md) - Org feature specs
- [GAMIFICATION](./.brain/GAMIFICATION.md) - XP/badges design
- [BILLING](./.brain/BILLING.md) - Pricing & Stripe setup

---

*This document is the single source of truth for the QuizCreator project.*
