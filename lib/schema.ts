import { z } from 'zod'

// --- Base Schemas (Internal Structure) ---

/**
 * Question structure used within the 'quizzes' JSONB column
 */
export const QuestionSchema = z.object({
    question: z.string().min(1),
    answers: z.array(z.string().min(1)).min(2),
    correct_answer: z.string().min(1),
    _originalIndex: z.number().optional(),
})

// --- Entity Schemas (App-level objects with camelCase) ---

/**
 * Quizzes table schema
 */
export const QuizSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    questions: z.array(QuestionSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
})

/**
 * Leaderboard entry schema
 */
export const LeaderboardSchema = z.object({
    id: z.string().uuid(),
    quizId: z.string().min(1),
    name: z.string().trim().min(1).max(64),
    score: z.number().int().min(0),
    duration: z.number().int().min(0),
    createdAt: z.string(),
    updatedAt: z.string(),
})

/**
 * Flagged Question schema
 */
export const FlaggedQuestionSchema = z.object({
    id: z.string().uuid(),
    quizId: z.string().min(1),
    question: z.string().min(1),
    reason: z.string().min(1),
    upvotes: z.number().int().default(0),
    createdAt: z.string(),
    updatedAt: z.string(),
})

// --- API Request Schemas ---

export const PostScoreSchema = z.object({
    name: z.string().trim().min(1).max(64),
    score: z.number().int().min(0),
    duration: z.number().int().min(0),
})

export const PostFlagSchema = z.object({
    question: z.string().min(1),
    reason: z.string().min(1),
})

export const PatchFlagSchema = z.object({
    id: z.string().uuid(),
    reason: z.string().min(1),
})

export const UpvoteFlagSchema = z.object({
    flagId: z.string().uuid(),
})

// --- TypeScript Types ---

export type Question = z.infer<typeof QuestionSchema>
export type Quiz = z.infer<typeof QuizSchema>
export type LeaderboardEntry = z.infer<typeof LeaderboardSchema>
export type FlaggedQuestion = z.infer<typeof FlaggedQuestionSchema>

export type PostScoreRequest = z.infer<typeof PostScoreSchema>
export type PostFlagRequest = z.infer<typeof PostFlagSchema>
export type PatchFlagRequest = z.infer<typeof PatchFlagSchema>
export type UpvoteFlagRequest = z.infer<typeof UpvoteFlagSchema>
