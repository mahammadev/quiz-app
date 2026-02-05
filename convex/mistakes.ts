import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getUserId = async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return identity.subject;
};

export const recordMistakes = mutation({
    args: {
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
        const clerkId = await getUserId(ctx);
        const { quizId, mistakes } = args;
        const now = Date.now();

        for (const mistake of mistakes) {
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
        questionId: v.string(),
    },
    handler: async (ctx, args) => {
        const clerkId = await getUserId(ctx);
        const mistake = await ctx.db
            .query("userMistakes")
            .withIndex("by_user_question", (q) =>
                q.eq("clerkId", clerkId).eq("questionId", args.questionId)
            )
            .unique();

        if (mistake) {
            await ctx.db.delete(mistake._id);
        }
    },
});

export const getMistakes = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("userMistakes")
            .withIndex("by_user", (q) => q.eq("clerkId", identity.subject))
            .order("desc")
            .collect();
    },
});

export const clearMistake = mutation({
    args: {
        quizId: v.string(),
        question: v.string(),
    },
    handler: async (ctx, args) => {
        const clerkId = await getUserId(ctx);
        const mistake = await ctx.db
            .query("userMistakes")
            .withIndex("by_user_quiz", (q) =>
                q.eq("clerkId", clerkId).eq("quizId", args.quizId)
            )
            .filter((q) => q.eq(q.field("question"), args.question))
            .unique();

        if (mistake) {
            await ctx.db.delete(mistake._id);
        }
    },
});

export const getMistakesByQuiz = query({
    args: { quizId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("userMistakes")
            .withIndex("by_user_quiz", (q) =>
                q.eq("clerkId", identity.subject).eq("quizId", args.quizId)
            )
            .collect();
    },
});
