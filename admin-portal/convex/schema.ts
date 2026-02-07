import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        clerkId: v.string(), // Clerk's unique ID
        isPlatformOwner: v.optional(v.boolean()), // Super-admin flag
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_email", ["email"])
        .index("search_name", ["fullName"]),

    quizzes: defineTable({
        name: v.string(),
        creatorId: v.string(), // Clerk ID of the creator (required)
        createdAt: v.number(), // Timestamp (required)
        orgId: v.optional(v.id("organizations")), // Optional: Organization this quiz belongs to
        visibility: v.optional(v.string()), // Optional: "private", "org", "public"
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
    })
        .index("by_creator", ["creatorId"])
        .index("by_name", ["name"])
        .index("by_orgId", ["orgId"]),

    subscriptions: defineTable({
        userId: v.string(),
        stripeSubscriptionId: v.string(),
        status: v.string(), // active, canceled, etc.
        planId: v.string(), // pro, elite, etc.
        endsAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    examSessions: defineTable({
        quizId: v.id("quizzes"),
        accessCode: v.string(), // 6-digit PIN
        creatorId: v.string(),
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
        .index("by_creator", ["creatorId"])
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
        .index("by_quiz_score", ["quizId", "score", "duration"])
        .index("by_score", ["score", "duration"]),

    flagged_questions: defineTable({
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        creatorId: v.string(), // Owner of the quiz (required)
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
        activity: v.optional(v.string()),
        path: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        ip: v.optional(v.string()),
    })
        .index("by_lastSeen", ["lastSeen"])
        .index("by_clerkId", ["clerkId"])
        .index("by_guestId", ["guestId"]),

    organizations: defineTable({
        name: v.string(),
        slug: v.string(),           // unique URL-friendly name
        createdAt: v.number(),
        ownerId: v.string(),        // Clerk ID of creator (Admin)
        planId: v.string(),         // "school"
        settings: v.object({
            customLogo: v.optional(v.string()),
            customDomain: v.optional(v.string()),
        }),
        studentJoinCode: v.optional(v.string()), // For students to auto-join
    })
        .index("by_slug", ["slug"])
        .index("by_owner", ["ownerId"])
        .index("by_code", ["studentJoinCode"]),

    orgMembers: defineTable({
        orgId: v.id("organizations"),
        userId: v.string(),         // Clerk ID
        role: v.string(),           // "admin" | "teacher" | "student"
        addedAt: v.number(),
        addedBy: v.string(),        // Clerk ID of who invited them
    })
        .index("by_org", ["orgId"])
        .index("by_user", ["userId"])
        .index("by_org_user", ["orgId", "userId"]),

    invitations: defineTable({
        email: v.string(),
        orgId: v.id("organizations"),
        role: v.string(),           // "admin" | "teacher"
        token: v.string(),
        invitedBy: v.string(),      // Clerk ID
        status: v.string(),         // "pending" | "accepted" | "revoked"
    })
        .index("by_token", ["token"])
        .index("by_email", ["email"])
        .index("by_org", ["orgId"]),

    aiUsage: defineTable({
        userId: v.string(),         // Clerk ID
        month: v.string(),          // "2026-02" format
        count: v.number(),          // Number of AI generations this month
    })
        .index("by_user_month", ["userId", "month"]),

    userProgress: defineTable({
        clerkId: v.string(),            // Clerk user ID
        xp: v.number(),                 // Total experience points
        level: v.number(),              // Current level (1-5+)
        streak: v.number(),             // Current streak in days
        lastActiveDate: v.string(),     // "2026-02-04" format for streak tracking
        badges: v.array(v.string()),    // Array of badge IDs earned
        quizzesCompleted: v.number(),   // Total quizzes completed
        perfectScores: v.number(),      // Total 100% quiz scores
        aiQuizzesGenerated: v.number(), // AI quizzes generated (for badge)
    })
        .index("by_clerk", ["clerkId"])
        .index("by_xp", ["xp"])
        .index("by_level", ["level"]),

    classes: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        orgId: v.id("organizations"),
        teacherId: v.string(), // Clerk ID
        createdAt: v.number(),
    })
        .index("by_org", ["orgId"])
        .index("by_teacher", ["teacherId"]),

    classMembers: defineTable({
        classId: v.id("classes"),
        userId: v.string(), // Clerk ID
        joinedAt: v.number(),
    })
        .index("by_class", ["classId"])
        .index("by_user", ["userId"])
        .index("by_class_user", ["classId", "userId"]),

    assignments: defineTable({
        quizId: v.id("quizzes"),
        classId: v.id("classes"),
        orgId: v.id("organizations"),
        assignedAt: v.number(),
        dueDate: v.optional(v.number()),
    })
        .index("by_class", ["classId"])
        .index("by_org", ["orgId"]),
});
