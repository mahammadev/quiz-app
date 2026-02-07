import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordScore = mutation({
    args: {
        quizId: v.string(),
        name: v.string(),
        clerkId: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        score: v.number(),
        duration: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        // Use subject if logged in, otherwise use provided clerkId or nothing
        const userId = identity?.subject || args.clerkId;

        const id = await ctx.db.insert("leaderboard", {
            quizId: args.quizId,
            name: args.name,
            clerkId: userId,
            avatarUrl: args.avatarUrl,
            score: args.score,
            duration: args.duration,
            createdAt: Date.now(),
        });
        return id;
    },
});

export const getLeaderboard = query({
    args: {
        quizId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q;
        if (args.quizId === "global") {
            q = ctx.db.query("leaderboard")
                .withIndex("by_score")
                .order("desc");
        } else {
            q = ctx.db.query("leaderboard")
                .withIndex("by_quiz_score", (q) => q.eq("quizId", args.quizId))
                .order("desc");
        }

        return await q.take(args.limit || 10);
    },
});

export const getPersonalBest = query({
    args: {
        quizId: v.string(),
        name: v.string(),
        clerkId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = identity?.subject || args.clerkId;

        if (userId) {
            // Find best by user ID
            let q = ctx.db.query("leaderboard")
                .withIndex("by_score", (q) => q)
                .filter(q => q.eq(q.field("clerkId"), userId));

            if (args.quizId !== "global") {
                q = q.filter(q => q.eq(q.field("quizId"), args.quizId));
            }

            const results = await q.collect();
            return results.sort((a, b) => b.score - a.score || a.duration - b.duration)[0] || null;
        }

        // Fallback to name search for guests
        let q = ctx.db.query("leaderboard")
            .filter(q => q.eq(q.field("name"), args.name));

        if (args.quizId !== "global") {
            q = q.filter(q => q.eq(q.field("quizId"), args.quizId));
        }

        const results = await q.collect();
        return results.sort((a, b) => b.score - a.score || a.duration - b.duration)[0] || null;
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("leaderboard").collect();
    },
});
