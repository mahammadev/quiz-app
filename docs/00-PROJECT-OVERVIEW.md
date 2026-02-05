# Project Overview

> What QuizCreator is, who it's for, and what makes it unique
> **Last Updated**: 2026-02-04

---

## What Is QuizCreator?

**QuizCreator** is a **personal quiz generation platform** that turns any text or PDF into an interactive quiz for study, teaching, or exam preparation.

Unlike quiz marketplaces or learning management systems, QuizCreator focuses on **individual productivity** - giving each user a private workspace to create, manage, and share their own quizzes without public directories or social features.

### Core Value Proposition

| For Individuals | For Teachers | For Everyone |
|-----------------|--------------|--------------|
| Turn study materials into quizzes in seconds | Create curriculum-based quizzes and share with students | Your data is yours - no tracking or ads |
| Track weak areas with personalized mistake logs | See student results and engagement | Private workspace with full ownership |
| AI-generated questions from any content | Bulk-convert past papers to practice tests | No account required to take shared quizzes |

---

## What This Is NOT

To prevent scope creep and maintain focus:

| Feature | Status | Why |
|---------|--------|-----|
| **Quiz Marketplace** | ❌ Not Planned | No "explore" or "trending" pages. Users find quizzes via direct links only. |
| **Social Platform** | ❌ Not Planned | No followers, comments, likes, or public profiles. |
| **Learning Management System** | ❌ Not Planned | No course structures, grading workflows, or student rosters. |
| **Public Quiz Directory** | ❌ Not Planned | Quizzes are private by default. Sharing is link-based only. |
| **Multi-tenant SaaS** | ❌ Not Planned | Each user has their own isolated workspace, not shared infrastructure. |

### Why These Limits?

1. **Focus**: We solve ONE problem well - quiz creation
2. **Privacy**: No public exposure of user content
3. **Simplicity**: Easier to build, maintain, and explain
4. **Speed to Market**: Launch core features faster without social complexity

---

## Target Users

### 1. Individual Learners
**Profile**: Students preparing for exams, professionals studying new topics

**Pain Point**: "I have too many notes and PDFs. How do I study efficiently?"

**How We Help**:
- Upload any PDF or paste text
- AI generates quiz questions automatically
- Track mistakes to focus weak areas
- Study anytime, anywhere

**Example User**: Sarah is preparing for her medical board exam. She uploads her 200-page study guide PDF. QuizCreator generates 500 practice questions. She takes quizzes daily, reviewing her mistake log to focus on cardiology concepts she keeps getting wrong.

### 2. Teachers & Tutors
**Profile**: Educators creating assessments for students

**Pain Point**: "Creating quizzes manually takes hours. I want to focus on teaching."

**How We Help**:
- Paste curriculum content, get instant quiz
- Share via simple link (no student accounts needed)
- See who completed the quiz and their scores
- Organizations feature for class management

**Example User**: Mr. Johnson teaches high school biology. He pastes his lesson notes into QuizCreator, generates a 20-question quiz in 30 seconds, and shares the link with his 30 students. He checks the leaderboard to see class performance.

### 3. Exam Preparers
**Profile**: Test-takers converting past papers to digital format

**Pain Point**: "Paper past exams are hard to practice with. I want instant feedback."

**How We Help**:
- Upload scanned past exam PDFs
- AI extracts and structures questions
- Practice with instant scoring
- Track improvement over time

**Example User**: Alex is preparing for the bar exam. He has 50 past exam PDFs. He uploads them to QuizCreator, which extracts thousands of practice questions. He tracks his scores to see improvement from 60% to 85% over 3 months.

---

## Key Features

### ✅ Implemented

| Feature | Description | User Value |
|---------|-------------|------------|
| **AI Text-to-Quiz** | Paste text, AI generates questions | Create quizzes in seconds, not hours |
| **AI PDF-to-Quiz** | Upload PDF/TXT, extract questions | Bulk convert study materials |
| **Smart Chunking** | Handles large documents (10MB+) | Process entire textbooks |
| **Mistakes Tracking** | Auto-saves wrong answers | Focused practice on weak areas |
| **Exam Sessions** | Live quizzes with access codes | Real-time classroom assessments |
| **Organizations** | Admin/Teacher/Student roles | School-wide quiz management |
| **Gamification** | XP, levels, streaks, badges | Engagement and habit formation |
| **Leaderboards** | Score tracking and rankings | Competition and motivation |
| **Usage Tracking** | AI generation limits | Fair free tier, upgrade path |

### 🚧 In Progress

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe Payments** | Pro/Team subscription tiers | Researching |

### 📋 Planned

| Feature | Description | Priority |
|---------|-------------|----------|
| **PWA Mobile App** | Installable on phones/tablets | High |
| **Quiz Analytics** | Completion rates, hard questions | Medium |
| **Templates Library** | Pre-built quiz templates | Low |
| **API Access** | Third-party integrations | Low |

---

## Product Philosophy

### 1. Privacy First
- No public quiz directories
- No user tracking beyond app analytics
- No selling of user data
- Users own their content completely

### 2. Speed Matters
- AI generates questions in 2-5 seconds
- PDF processing with real-time progress
- No loading screens for core actions
- Optimistic UI updates

### 3. Simplicity Over Features
- One clear path for each action
- No feature bloat
- Defaults that work for 80% of users
- Advanced options hidden but accessible

### 4. AI as Augmentation, Not Replacement
- AI generates drafts, user reviews and edits
- Users maintain full control
- AI suggestions, human decisions
- Transparency about AI-generated content

---

## Business Model

### Current: Free Tier
- 3 AI generations per month
- Unlimited manual quiz creation
- All features included
- No credit card required

### Future: Pro Tier ($TBD/month)
- Unlimited AI generations
- Priority processing
- Advanced analytics
- Custom branding
- Priority support

### Future: Team/School Tier ($TBD/month)
- Everything in Pro
- Multiple admin accounts
- SSO integration
- Usage analytics dashboard
- Dedicated support

---

## Success Metrics

| Phase | Metric | Target | Current |
|-------|--------|--------|---------|
| 1 | App stability | 0 crashes | ✅ Achieved |
| 2 | First organization | 1 active org | ✅ Achieved |
| 3 | AI quizzes generated | 100 quizzes | 🔄 In Progress |
| 4 | Daily active users | 50 DAU | 📋 Not started |
| 5 | Paying customers | 10 Pro users | 📋 Not started |
| 6 | Mobile installs | 100 downloads | 📋 Not started |

---

## Competitive Landscape

| Competitor | Their Strength | Our Differentiation |
|------------|---------------|---------------------|
| **Quizlet** | Large user base, study modes | AI generation, no public marketplace |
| **Kahoot** | Live games, engagement | Private quizzes, PDF processing |
| **Google Forms** | Free, simple | AI quiz generation, gamification |
| **Typeform** | Beautiful forms | Purpose-built for quizzes, AI features |
| **AI Quiz Generators** | AI features | Complete platform, not just generation |

**Our Moat**: AI-powered quiz generation + complete quiz management + privacy-focused design

---

## Roadmap Summary

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1: Foundation** | Auth, basic CRUD, ownership | ✅ Complete |
| **Phase 2: Organizations** | Multi-user, roles, invites | ✅ Complete |
| **Phase 3: AI Engine** | Text/PDF to quiz generation | ✅ Complete |
| **Phase 4: Gamification** | XP, levels, badges, streaks | ✅ Complete |
| **Phase 5: Monetization** | Stripe, pricing tiers | ⏸️ Paused |
| **Phase 6: Mobile** | PWA, app stores | 📋 Planned |

See [99-CHANGELOG.md](./99-CHANGELOG.md) for detailed history.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **No Central Admin** | Per-user ownership | Simpler, no abuse vector |
| **Link-based Sharing** | No public directory | Privacy, no content moderation needed |
| **Clerk over Auth0** | Drop-in React integration | Faster setup, better DX |
| **Convex over Firebase** | Type safety, real-time | Better for complex queries |
| **Gemini over GPT-4** | Cost, context window | 20x cheaper, 1M token context |
| **No LMS Features** | Focus on quiz creation | Avoid feature creep |

---

*This document defines what QuizCreator is and isn't. When in doubt, refer back to these principles.*
