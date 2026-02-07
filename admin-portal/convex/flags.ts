import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

import { getCurrentUserId } from "./utils";

/**
 * Helper: Check if user owns the quiz associated with a flag
 * NOTE: This is stubbed for now - will be fully implemented with School tier
 * Currently allows: quiz creator OR flag creator
 */
const requireFlagAccess = async (
    ctx: { auth: { getUserIdentity: () => Promise<Record<string, unknown> | null> }; db: any },
    flagId: Id<"flagged_questions">
) => {
    const userId = await getCurrentUserId(ctx);
    const flag = await ctx.db.get(flagId);

    if (!flag) {
        throw new Error("Flag not found");
    }

    // 1. Direct Owner Check (if flag.creatorId stores quiz owner)
    if (flag.creatorId === userId) {
        return { userId, flag };
    }

    // 2. Deep Check via Quiz (necessary for Org permissions)
    // flag.quizId is a string, cast to ID to fetch
    const quiz = await ctx.db.get(flag.quizId as Id<"quizzes">);

    if (!quiz) {
        // If quiz is gone, maybe allow delete? But for now fail safe.
        throw new Error("Associated quiz not found");
    }

    // Check Quiz Owner
    if (quiz.creatorId === userId) {
        return { userId, flag, quiz };
    }

    // Check Org Admin
    if (quiz.orgId) {
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q: any) => q.eq("orgId", quiz.orgId).eq("userId", userId))
            .first();

        if (membership && membership.role === "admin") {
            return { userId, flag, quiz };
        }
    }

    throw new Error("Forbidden: Not authorized to modify this flag");
};

/**
 * Flag a question as potentially incorrect or problematic
 */
export const flagQuestion = mutation({
    args: {
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        creatorId: v.string(), // Now required - pass the quiz creator's ID
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("flagged_questions", {
            quizId: args.quizId,
            question: args.question,
            reason: args.reason,
            creatorId: args.creatorId,
            upvotes: 0,
        });
        return id;
    },
});

/**
 * Get flags for a specific quiz or all flags
 */
export const getFlags = query({
    args: { quizId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (args.quizId) {
            return await ctx.db
                .query("flagged_questions")
                .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("flagged_questions").order("desc").collect();
    },
});

/**
 * Update a flag's reason (owner check)
 */
export const updateFlag = mutation({
    args: {
        id: v.id("flagged_questions"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        await requireFlagAccess(ctx, args.id);
        await ctx.db.patch(args.id, { reason: args.reason });
    },
});

/**
 * Upvote a flagged question (anyone can do this)
 */
export const upvoteFlag = mutation({
    args: { id: v.id("flagged_questions") },
    handler: async (ctx, args) => {
        const flag = await ctx.db.get(args.id);
        if (!flag) throw new Error("Flag not found");
        await ctx.db.patch(args.id, { upvotes: flag.upvotes + 1 });
    },
});

/**
 * Delete a flag (owner check)
 */
export const deleteFlag = mutation({
    args: { id: v.id("flagged_questions") },
    handler: async (ctx, args) => {
        await requireFlagAccess(ctx, args.id);
        await ctx.db.delete(args.id);
    },
});

/**
 * List all flags (for debugging/admin - will be scoped to org in School tier)
 */
export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("flagged_questions").collect();
    },
});
