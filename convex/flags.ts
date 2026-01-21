import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const requireAdmin = async (ctx: { auth: { getUserIdentity: () => Promise<Record<string, unknown> | null> } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }
    const role =
        (identity.publicMetadata as { role?: string } | undefined)?.role ||
        (identity.customClaims as { public_metadata?: { role?: string } } | undefined)?.public_metadata?.role ||
        (identity.customClaims as { publicMetadata?: { role?: string } } | undefined)?.publicMetadata?.role ||
        (identity as { public_metadata?: { role?: string } } | null | undefined)?.public_metadata?.role ||
        (identity as { role?: string } | null | undefined)?.role;
    if (!role || role.toLowerCase() !== "admin") {
        throw new Error("Forbidden");
    }
};

export const flagQuestion = mutation({
    args: {
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("flagged_questions", {
            quizId: args.quizId,
            question: args.question,
            reason: args.reason,
            upvotes: 0,
        });
        return id;
    },
});

export const getFlags = query({
    args: { quizId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let q = ctx.db.query("flagged_questions");
        if (args.quizId) {
            q = q.withIndex("by_quizId", (q) => q.eq("quizId", args.quizId));
        }
        return await q.order("desc").collect();
    },
});

export const updateFlag = mutation({
    args: {
        id: v.id("flagged_questions"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.id, { reason: args.reason });
    },
});

export const upvoteFlag = mutation({
    args: { id: v.id("flagged_questions") },
    handler: async (ctx, args) => {
        const flag = await ctx.db.get(args.id);
        if (!flag) throw new Error("Flag not found");
        await ctx.db.patch(args.id, { upvotes: flag.upvotes + 1 });
    },
});

export const deleteFlag = mutation({
    args: { id: v.id("flagged_questions") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("flagged_questions").collect();
    },
});
