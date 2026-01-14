import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordScore = mutation({
    args: {
        quizId: v.string(),
        name: v.string(),
        score: v.number(),
        duration: v.number(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("leaderboard", {
            quizId: args.quizId,
            name: args.name,
            score: args.score,
            duration: args.duration,
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
        let q = ctx.db.query("leaderboard");

        if (args.quizId !== "global") {
            q = q.withIndex("by_quizId", (q) => q.eq("quizId", args.quizId));
        }

        const results = await q.collect();

        // Sort manually for now or use complex indexes if needed.
        // In Convex, we can sort by index.
        return results
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (a.duration !== b.duration) return a.duration - b.duration;
                return b._creationTime - a._creationTime;
            })
            .slice(0, args.limit || 10);
    },
});

export const getPersonalBest = query({
    args: {
        quizId: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("leaderboard");
        if (args.quizId !== "global") {
            q = q.withIndex("by_quizId", (q) => q.eq("quizId", args.quizId));
        }

        const results = await q.collect();
        const userResults = results.filter(r => r.name.toLowerCase() === args.name.toLowerCase());

        if (userResults.length === 0) return null;

        return userResults.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.duration !== b.duration) return a.duration - b.duration;
            return a._creationTime - b._creationTime;
        })[0];
    },
});

export const clear = mutation({
    handler: async (ctx) => {
        const entries = await ctx.db.query("leaderboard").collect();
        for (const entry of entries) {
            await ctx.db.delete(entry._id);
        }
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("leaderboard").collect();
    },
});
