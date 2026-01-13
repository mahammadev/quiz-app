-- Migration 0003: Add Auth Profiles and Exam System

-- Enums
-- Note: Check if types exist first or just create them. 
-- In pure SQL migrations usually needed `DO $$ ...` to check existence or just rely on fresh init.
-- For standard Supabase migrations, we assume sequential execution.

CREATE TYPE user_role AS ENUM ('TEACHER', 'STUDENT');
CREATE TYPE session_status AS ENUM ('PENDING', 'ACTIVE', 'ARCHIVED');
CREATE TYPE attempt_status AS ENUM ('STARTED', 'SUBMITTED');

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Update Quizzes Table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);

-- Exam Sessions Table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_code TEXT NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status session_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_sessions_access_code ON exam_sessions(access_code);
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

-- Exam Session Policies
CREATE POLICY "Public can view active sessions by code" 
  ON exam_sessions FOR SELECT 
  USING (status = 'ACTIVE'); 

CREATE POLICY "Teachers can view their own sessions" 
  ON exam_sessions FOR SELECT 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert sessions" 
  ON exam_sessions FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own sessions" 
  ON exam_sessions FOR UPDATE 
  USING (auth.uid() = teacher_id);

-- Exam Attempts Table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answers_draft JSONB DEFAULT '{}'::jsonb,
  final_score INTEGER,
  status attempt_status NOT NULL DEFAULT 'STARTED',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_attempts_session_student ON exam_attempts(session_id, student_id);
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Exam Attempt Policies
CREATE POLICY "Students can view own attempts" 
  ON exam_attempts FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attempts" 
  ON exam_attempts FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts" 
  ON exam_attempts FOR UPDATE 
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view attempts for their sessions" 
  ON exam_attempts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM exam_sessions 
      WHERE exam_sessions.id = exam_attempts.session_id 
      AND exam_sessions.teacher_id = auth.uid()
    )
  );
