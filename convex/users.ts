import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sync user from Clerk webhook
export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        fullName: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existing) {
            // Update existing user
            await ctx.db.patch(existing._id, {
                email: args.email,
                fullName: args.fullName,
            });
            return existing._id;
        }

        // Create new user with default STUDENT role
        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            fullName: args.fullName,
            role: "STUDENT",
            createdAt: Date.now(),
        });

        return userId;
    },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});

// Get user by ID
export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Get all users (admin only - we'll add auth checks later)
export const getAllUsers = query({
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// Get users by role
export const getUsersByRole = query({
    args: { role: v.union(v.literal("TEACHER"), v.literal("STUDENT"), v.literal("ADMIN")) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", args.role))
            .collect();
    },
});

// Search users by email or name
export const searchUsers = query({
    args: { searchTerm: v.string() },
    handler: async (ctx, args) => {
        const allUsers = await ctx.db.query("users").collect();
        const searchLower = args.searchTerm.toLowerCase();

        return allUsers.filter(
            (user) =>
                user.email.toLowerCase().includes(searchLower) ||
                user.fullName.toLowerCase().includes(searchLower)
        );
    },
});

// Update user role (admin only - we'll add auth checks later)
export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("TEACHER"), v.literal("STUDENT"), v.literal("ADMIN")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            role: args.role,
        });
    },
});

// Delete user (admin only - we'll add auth checks later)
export const deleteUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.userId);
    },
});
