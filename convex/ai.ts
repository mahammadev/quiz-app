import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getUserId = async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return identity.subject;
};

/**
 * Get the current month in "YYYY-MM" format
 */
const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Get the current AI usage count for a user this month
 */
export const getUsage = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { count: 0, limit: 3, plan: "free" };

        const userId = identity.subject;
        const month = getCurrentMonth();

        const usage = await ctx.db
            .query("aiUsage")
            .withIndex("by_user_month", (q) =>
                q.eq("userId", userId).eq("month", month)
            )
            .unique();

        // TODO: Check subscription for plan (using "free" as default for now)
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const plan = subscription?.status === "active" ? subscription.planId : "free";
        const limit = plan === "free" ? 3 : Infinity;

        return {
            count: usage?.count ?? 0,
            limit,
            plan,
        };
    },
});

/**
 * Check if user can generate (has remaining quota)
 */
export const canGenerate = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { allowed: false, reason: "Not authenticated" };

        const userId = identity.subject;
        const month = getCurrentMonth();

        // Check subscription
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const plan = subscription?.status === "active" ? subscription.planId : "free";

        // Pro/School users have unlimited
        if (plan !== "free") {
            return { allowed: true, reason: null };
        }

        // Check free tier limit
        const usage = await ctx.db
            .query("aiUsage")
            .withIndex("by_user_month", (q) =>
                q.eq("userId", userId).eq("month", month)
            )
            .unique();

        const count = usage?.count ?? 0;
        if (count >= 3) {
            return {
                allowed: false,
                reason: "Free tier limit reached (3/month). Upgrade to Pro for unlimited generations.",
            };
        }

        return { allowed: true, remaining: 3 - count };
    },
});

/**
 * Record an AI generation usage
 */
export const recordUsage = mutation({
    handler: async (ctx) => {
        const userId = await getUserId(ctx);
        const month = getCurrentMonth();

        const existing = await ctx.db
            .query("aiUsage")
            .withIndex("by_user_month", (q) =>
                q.eq("userId", userId).eq("month", month)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                count: existing.count + 1,
            });
        } else {
            await ctx.db.insert("aiUsage", {
                userId,
                month,
                count: 1,
            });
        }
    },
});
