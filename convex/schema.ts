import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users - synced from Clerk authentication
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        role: v.union(v.literal("TEACHER"), v.literal("STUDENT"), v.literal("ADMIN")),
        fullName: v.string(),
        createdAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"]),

    // Quizzes - templates created by teachers
    quizzes: defineTable({
        name: v.string(),
        teacherId: v.optional(v.id("users")), // Optional for backward compatibility
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
        createdAt: v.optional(v.number()), // Optional for backward compatibility
    })
        .index("by_name", ["name"])
        .index("by_teacher", ["teacherId"]),

    // Exam Sessions - specific instances of quizzes with timing and access control
    examSessions: defineTable({
        quizId: v.id("quizzes"),
        teacherId: v.id("users"),
        accessCode: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        status: v.union(
            v.literal("PENDING"),
            v.literal("ACTIVE"),
            v.literal("ARCHIVED")
        ),
        mode: v.union(
            v.literal("EXAM"),      // Hide results until teacher releases
            v.literal("PRACTICE")   // Show results immediately
        ),
        title: v.string(),
        createdAt: v.number(),
    })
        .index("by_access_code", ["accessCode"])
        .index("by_teacher", ["teacherId"])
        .index("by_status", ["status"])
        .index("by_quiz", ["quizId"]),

    // Exam Attempts - student submissions for exam sessions
    examAttempts: defineTable({
        sessionId: v.id("examSessions"),
        studentId: v.id("users"),
        answersDraft: v.array(
            v.object({
                questionIndex: v.number(),
                selectedAnswer: v.string(),
            })
        ),
        finalScore: v.optional(v.number()),
        submittedAt: v.optional(v.number()),
        lastSavedAt: v.number(),
        createdAt: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_student", ["studentId"])
        .index("by_session_student", ["sessionId", "studentId"]),

    // Leaderboard - public quiz results (existing)
    leaderboard: defineTable({
        quizId: v.string(),
        name: v.string(),
        score: v.number(),
        duration: v.number(),
    })
        .index("by_quizId", ["quizId"])
        .index("by_score", ["score", "duration"]),

    // Flagged Questions - student-reported issues (existing)
    flagged_questions: defineTable({
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        upvotes: v.number(),
    }).index("by_quizId", ["quizId"]),
});
