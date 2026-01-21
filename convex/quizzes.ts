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

export const create = mutation({
    args: {
        name: v.string(),
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const quizId = await ctx.db.insert("quizzes", {
            name: args.name,
            questions: args.questions,
        });
        return quizId;
    },
});

export const get = query({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const list = query({
    handler: async (ctx) => {
        return await ctx.db.query("quizzes").collect();
    },
});

export const remove = mutation({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});

export const update = mutation({
    args: {
        id: v.id("quizzes"),
        questions: v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.id, { questions: args.questions });
    },
});
