import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const update = mutation({
    args: {
        clerkId: v.optional(v.string()),
        guestId: v.optional(v.string()),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const { clerkId, guestId, name } = args;
        const now = Date.now();

        let existing;

        // 1. Try to find by clerkId
        if (clerkId) {
            existing = await ctx.db
                .query("presence")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
                .unique();
        }

        // 2. If not found by clerkId, try guestId
        if (!existing && guestId) {
            existing = await ctx.db
                .query("presence")
                .withIndex("by_guestId", (q) => q.eq("guestId", guestId))
                .unique();
        }

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastSeen: now,
                name,
                clerkId: clerkId || existing.clerkId,
                guestId: guestId || existing.guestId
            });
        } else {
            await ctx.db.insert("presence", { clerkId, guestId, name, lastSeen: now });
        }
    },
});

export const getOnlineUsers = query({
    handler: async (ctx) => {
        const threshold = Date.now() - 30000; // 30 seconds ago
        return await ctx.db
            .query("presence")
            .withIndex("by_lastSeen", (q) => q.gt("lastSeen", threshold))
            .collect();
    },
});

// Clean up old presence records
export const cleanup = mutation({
    handler: async (ctx) => {
        const threshold = Date.now() - 3600000; // 1 hour ago
        const oldRecords = await ctx.db
            .query("presence")
            .withIndex("by_lastSeen", (q) => q.lt("lastSeen", threshold))
            .collect();

        for (const record of oldRecords) {
            await ctx.db.delete(record._id);
        }
    },
});
