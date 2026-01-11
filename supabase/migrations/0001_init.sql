-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quizzes_created_at_idx ON quizzes (created_at DESC);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON quizzes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON quizzes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON quizzes
  FOR DELETE USING (true);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leaderboard_quiz_id_idx ON leaderboard (quiz_id);
CREATE INDEX IF NOT EXISTS leaderboard_created_at_idx ON leaderboard (created_at DESC);
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS leaderboard_quiz_score_idx ON leaderboard (quiz_id, score DESC, duration ASC, created_at DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT WITH CHECK (true);

-- Flagged questions table
CREATE TABLE IF NOT EXISTS flagged_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT NOT NULL,
  question TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flagged_questions_quiz_id_idx ON flagged_questions (quiz_id);
CREATE INDEX IF NOT EXISTS flagged_questions_created_at_idx ON flagged_questions (created_at DESC);

ALTER TABLE flagged_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON flagged_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON flagged_questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON flagged_questions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON flagged_questions
  FOR DELETE USING (true);
