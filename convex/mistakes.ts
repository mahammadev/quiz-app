import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordMistakes = mutation({
    args: {
        clerkId: v.string(),
        quizId: v.string(),
        mistakes: v.array(
            v.object({
                questionId: v.string(),
                question: v.string(),
                answers: v.array(v.string()),
                correctAnswer: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { clerkId, quizId, mistakes } = args;
        const now = Date.now();

        for (const mistake of mistakes) {
            // Check if this specific mistake already exists to avoid duplicates
            const existing = await ctx.db
                .query("userMistakes")
                .withIndex("by_user_question", (q) =>
                    q.eq("clerkId", clerkId).eq("questionId", mistake.questionId)
                )
                .unique();

            if (!existing) {
                await ctx.db.insert("userMistakes", {
                    clerkId,
                    quizId,
                    questionId: mistake.questionId,
                    question: mistake.question,
                    answers: mistake.answers,
                    correctAnswer: mistake.correctAnswer,
                    createdAt: now,
                });
            }
        }
    },
});

export const resolveMistake = mutation({
    args: {
        clerkId: v.string(),
        questionId: v.string(),
    },
    handler: async (ctx, args) => {
        const mistake = await ctx.db
            .query("userMistakes")
            .withIndex("by_user_question", (q) =>
                q.eq("clerkId", args.clerkId).eq("questionId", args.questionId)
            )
            .unique();

        if (mistake) {
            await ctx.db.delete(mistake._id);
        }
    },
});

export const getMistakes = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userMistakes")
            .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
            .order("desc")
            .collect();
    },
});

export const clearMistake = mutation({
    args: {
        clerkId: v.string(),
        quizId: v.string(),
        question: v.string(),
    },
    handler: async (ctx, args) => {
        const mistake = await ctx.db
            .query("userMistakes")
            .withIndex("by_user_quiz", (q) =>
                q.eq("clerkId", args.clerkId).eq("quizId", args.quizId)
            )
            .filter((q) => q.eq(q.field("question"), args.question))
            .unique();

        if (mistake) {
            await ctx.db.delete(mistake._id);
        }
    },
});

export const getMistakesByQuiz = query({
    args: { clerkId: v.string(), quizId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("userMistakes")
            .withIndex("by_user_quiz", (q) =>
                q.eq("clerkId", args.clerkId).eq("quizId", args.quizId)
            )
            .collect();
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("userMistakes").collect();
    },
});
