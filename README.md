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
```
