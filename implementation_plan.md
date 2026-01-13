# Master Plan Implementation: Teacher UI & Exam System

This plan outlines the steps to upgrade the MVP to a production-ready exam platform with Teacher and Student roles, based on the provided Master Plan.

## Phase 1: The Architecture (Database & Schema) [DONE]
- [x] **Step 1.1**: Define Zod schemas for new tables in `lib/schema.ts`.
  - `UserProfile` (Teacher/Student)
  - `ExamSession` (Active exam instances)
  - `ExamAttempt` (Student submissions)
  - Update `Quiz` schema to ensure JSONB content compatibility.
- [x] **Step 1.2**: Create Supabase migration file.
  - table `profiles` (links to `auth.users`)
  - table `exam_sessions`
  - table `exam_attempts`
  - Update `quizzes` if necessary.

## Phase 2: The Teacher Experience (Creator Flow) [DONE]
- [x] **Step 2.1**: Teacher Dashboard UI.
  - View library of quizzes.
  - "Create Quiz" entry point.
- [x] **Step 2.2**: Quiz Builder UI (`/teacher/create`).
  - Form builder for questions.
  - Dynamic field rendering.
- [x] **Step 2.3**: Data Transformation Logic.
  - Frontend TS function to convert Form Data -> JSON structure.
  - Save to Supabase `quizzes.content`.

## Phase 3: The Activation Flow (Going Live) [DONE]
- [x] **Step 3.1**: Session Configuration UI.
  - Set PIN, Timer, Mode (Exam/Practice).
- [x] **Step 3.2**: Backend Session Logic.
  - Generate Access Code.
  - Create `exam_session` record.

## Phase 4: The Student Experience (Test Taker) [DONE]
- [x] **Step 4.1**: Student Lobby (`/exam/join`).
  - Auth check.
  - PIN entry.
  - "Waiting Room" status check.
- [x] **Step 4.2**: Exam Interface.
  - Render questions from `quizzes.content`.
  - "Heartbeat" mechanism (save draft every 30s).
- [x] **Step 4.3**: Submission & Grading.
  - Server-side grading (or secure client-side calculation verified server-side).
  - Update `exam_attempts` status.

## Phase 5: Verification & Polish [DONE]
- [x] **Step 5.1**: End-to-end testing of the flow.
- [x] **Step 5.2**: UI Polish (Aesthetics check).
