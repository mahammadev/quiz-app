import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        clerkId: v.string(), // Clerk's unique ID
        role: v.string(),    // ADMIN, TEACHER, STUDENT
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_role", ["role"])
        .index("search_name", ["fullName"]),

    quizzes: defineTable({
        name: v.string(),
        teacherId: v.optional(v.string()), // Clerk ID of the creator
        createdAt: v.optional(v.number()),
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
    })
        .index("by_teacher", ["teacherId"])
        .index("by_name", ["name"]),

    examSessions: defineTable({
        quizId: v.id("quizzes"),
        accessCode: v.string(), // 6-digit PIN
        teacherId: v.string(),
        startTime: v.number(),
        endTime: v.optional(v.number()),
        status: v.string(),    // LOBBY, ACTIVE, COMPLETED
        settings: v.object({
            timer: v.optional(v.number()), // in minutes
            shuffleQuestions: v.boolean(),
            showResults: v.boolean(),
        }),
    })
        .index("by_accessCode", ["accessCode"])
        .index("by_teacher", ["teacherId"])
        .index("by_status", ["status"]),

    examAttempts: defineTable({
        sessionId: v.id("examSessions"),
        studentId: v.string(), // Clerk ID
        studentName: v.string(),
        answersDraft: v.any(), // JSON map of question index to chosen answer
        finalScore: v.optional(v.number()),
        submittedAt: v.optional(v.number()),
        lastHeartbeat: v.number(),
    })
        .index("by_session", ["sessionId"])
        .index("by_student", ["studentId"])
        .index("by_session_and_student", ["sessionId", "studentId"]),

    leaderboard: defineTable({
        quizId: v.string(),
        name: v.string(),
        avatarUrl: v.optional(v.string()),
        clerkId: v.optional(v.string()),
        score: v.number(),
        duration: v.number(),
        createdAt: v.optional(v.number()),
    })
        .index("by_quizId", ["quizId"])
        .index("by_score", ["score", "duration"]),

    flagged_questions: defineTable({
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        teacherId: v.optional(v.string()), // Teacher who owns the quiz
        upvotes: v.number(),
    }).index("by_quizId", ["quizId"]),

    userMistakes: defineTable({
        clerkId: v.string(),
        quizId: v.string(), // Use string to match flagged_questions and leaderboard
        questionId: v.string(), // Unique ID for the question (e.g. hash or quizId-index)
        question: v.string(),
        answers: v.array(v.string()),
        correctAnswer: v.string(),
        createdAt: v.number(),
    })
        .index("by_user", ["clerkId"])
        .index("by_user_quiz", ["clerkId", "quizId"])
        .index("by_user_question", ["clerkId", "questionId"]),

    presence: defineTable({
        clerkId: v.optional(v.string()),
        guestId: v.optional(v.string()), // Unique ID for guests
        name: v.string(),
        lastSeen: v.number(),
    })
        .index("by_lastSeen", ["lastSeen"])
        .index("by_clerkId", ["clerkId"])
        .index("by_guestId", ["guestId"]),
});
