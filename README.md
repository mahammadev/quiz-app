# Quiz App

A Next.js quiz app with Supabase-backed persistence for quizzes, leaderboard results, and flagged questions.

## Supabase migrations

Migrations live in `supabase/migrations`. A sample seed file is available at `supabase/seed.sql` to make local setups reproducible.

### Local Supabase

1. Install the Supabase CLI.
2. Start the local stack:

```bash
supabase start
```

3. Apply migrations and seed data:

```bash
supabase db reset
```

### Hosted Supabase

1. Link your project:

```bash
supabase link --project-ref <project-ref>
```

2. Push migrations:

```bash
supabase db push
```

3. (Optional) Apply seed data by running the seed file in the SQL editor or via `psql`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
## Overview
This project is a Next.js quiz app that lets you upload or paste quiz JSON, configure quiz options, take the quiz, and review your results. It also stores quizzes and leaderboard data in Supabase.

## Quiz flow
1. **Upload** a JSON file (or paste JSON) with quiz questions.
2. **Configure** the quiz (shuffle answers, study mode, etc.).
3. **Take the quiz** and answer each question.
4. **Review results** and retry incorrect answers if desired.

## Sample quiz JSON format
The upload flow in `components/file-upload.tsx` expects a JSON array (or a single object) with the following shape:

```json
[
  {
    "question": "What is the capital of France?",
    "answers": ["Paris", "London", "Rome", "Berlin"],
    "correct_answer": "Paris"
  },
  {
    "question": "2 + 2 = ?",
    "answers": ["3", "4", "5", "22"],
    "correct_answer": "4"
  }
]
```

## Environment variables
Copy `.env.example` to `.env.local` and fill in the required values.

## Running locally
Install dependencies, then use the scripts from `package.json`:

```bash
npm run dev
npm run build
npm run test
```
