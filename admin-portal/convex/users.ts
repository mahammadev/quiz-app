import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Insert or update the user information in the database.
 * This should be called every time the user logs in.
 */
export const store = mutation({
    args: {
        fullName: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication");
        }

        const clerkId = identity.subject;

        // Check if the user already exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .unique();

        const normalizedEmail = args.email.toLowerCase().trim();

        if (user !== null) {
            // If we've seen this user before, update their name/email
            await ctx.db.patch(user._id, {
                fullName: args.fullName,
                email: normalizedEmail,
            });
            return user._id;
        }

        // If it's a new user, insert them
        // First user ever becomes the Platform Owner automatically
        const usersCount = (await ctx.db.query("users").collect()).length;
        
        return await ctx.db.insert("users", {
            fullName: args.fullName,
            email: normalizedEmail,
            clerkId: clerkId,
            isPlatformOwner: usersCount === 0,
        });
    },
});

export const getMe = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});
