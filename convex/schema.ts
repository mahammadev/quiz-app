import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    quizzes: defineTable({
        name: v.string(),
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
    }).index("by_name", ["name"]),

    leaderboard: defineTable({
        quizId: v.string(), // This could be the quiz _id.toString() or a custom slug
        name: v.string(),
        score: v.number(),
        duration: v.number(),
    })
        .index("by_quizId", ["quizId"])
        .index("by_score", ["score", "duration"]),

    flagged_questions: defineTable({
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        upvotes: v.number(),
    }).index("by_quizId", ["quizId"]),
});
