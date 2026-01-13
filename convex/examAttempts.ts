import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Start a new exam attempt
export const startAttempt = mutation({
    args: {
        sessionId: v.id("examSessions"),
        studentId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Check if attempt already exists
        const existing = await ctx.db
            .query("examAttempts")
            .withIndex("by_session_student", (q) =>
                q.eq("sessionId", args.sessionId).eq("studentId", args.studentId)
            )
            .first();

        if (existing) {
            return existing._id;
        }

        // Create new attempt
        const attemptId = await ctx.db.insert("examAttempts", {
            sessionId: args.sessionId,
            studentId: args.studentId,
            answersDraft: [],
            lastSavedAt: Date.now(),
            createdAt: Date.now(),
        });

        return attemptId;
    },
});

// Save draft answers (heartbeat auto-save)
export const saveDraft = mutation({
    args: {
        attemptId: v.id("examAttempts"),
        answersDraft: v.array(
            v.object({
                questionIndex: v.number(),
                selectedAnswer: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.attemptId, {
            answersDraft: args.answersDraft,
            lastSavedAt: Date.now(),
        });
    },
});

// Submit exam attempt
export const submitAttempt = mutation({
    args: {
        attemptId: v.id("examAttempts"),
        finalAnswers: v.array(
            v.object({
                questionIndex: v.number(),
                selectedAnswer: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const attempt = await ctx.db.get(args.attemptId);
        if (!attempt) throw new Error("Attempt not found");

        // Get session and quiz to calculate score
        const session = await ctx.db.get(attempt.sessionId);
        if (!session) throw new Error("Session not found");

        const quiz = await ctx.db.get(session.quizId);
        if (!quiz) throw new Error("Quiz not found");

        // Calculate score
        let correct = 0;
        args.finalAnswers.forEach((answer) => {
            const question = quiz.questions[answer.questionIndex];
            if (question && question.correct_answer === answer.selectedAnswer) {
                correct++;
            }
        });

        const finalScore = Math.round((correct / quiz.questions.length) * 100);

        // Update attempt with final score
        await ctx.db.patch(args.attemptId, {
            answersDraft: args.finalAnswers,
            finalScore,
            submittedAt: Date.now(),
            lastSavedAt: Date.now(),
        });

        return finalScore;
    },
});

// Get student's attempt for a session
export const getStudentAttempt = query({
    args: {
        sessionId: v.id("examSessions"),
        studentId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("examAttempts")
            .withIndex("by_session_student", (q) =>
                q.eq("sessionId", args.sessionId).eq("studentId", args.studentId)
            )
            .first();
    },
});

// Get attempt by ID
export const getAttempt = query({
    args: { attemptId: v.id("examAttempts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.attemptId);
    },
});

// Get all attempts for a session (for teacher to view results)
export const getSessionAttempts = query({
    args: { sessionId: v.id("examSessions") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("examAttempts")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect();
    },
});

// Get student's attempt results with details
export const getAttemptResults = query({
    args: { attemptId: v.id("examAttempts") },
    handler: async (ctx, args) => {
        const attempt = await ctx.db.get(args.attemptId);
        if (!attempt) return null;

        const session = await ctx.db.get(attempt.sessionId);
        if (!session) return null;

        const quiz = await ctx.db.get(session.quizId);
        if (!quiz) return null;

        const student = await ctx.db.get(attempt.studentId);

        return {
            attempt,
            session,
            quiz,
            student,
        };
    },
});

// Check if student can submit (not already submitted)
export const canSubmit = query({
    args: { attemptId: v.id("examAttempts") },
    handler: async (ctx, args) => {
        const attempt = await ctx.db.get(args.attemptId);
        return attempt ? !attempt.submittedAt : false;
    },
});
