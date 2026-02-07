import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

/**
 * Add a member to an organization
 * (Currently allows direct add for testing, later will be invitation-based)
 */
export const addMember = mutation({
    args: {
        orgId: v.id("organizations"),
        userClerkId: v.string(), // The user to add
        role: v.string(), // "teacher" | "student" | "admin"
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // Check if requester is an admin of the org
        const requesterMembership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!requesterMembership || requesterMembership.role !== "admin") {
            throw new Error("Unauthorized: Only admins can add members");
        }

        // Check if user is already a member
        const existing = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", args.userClerkId))
            .first();

        if (existing) {
            throw new Error("User is already a member of this organization");
        }

        await ctx.db.insert("orgMembers", {
            orgId: args.orgId,
            userId: args.userClerkId,
            role: args.role,
            addedAt: Date.now(),
            addedBy: userId,
        });
    },
});

/**
 * List members of an organization
 */
export const listMembers = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // Check membership
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!membership) {
            throw new Error("Unauthorized: Not a member of this organization");
        }

        const members = await ctx.db
            .query("orgMembers")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Join with users table
        const membersWithUser = await Promise.all(
            members.map(async (m) => {
                const user = await ctx.db
                    .query("users")
                    .withIndex("by_clerkId", (q) => q.eq("clerkId", m.userId))
                    .first();
                return {
                    ...m,
                    user: user || { fullName: "Unknown User", email: "" },
                };
            })
        );

        return membersWithUser;
    },
});

/**
 * Update a member's role
 */
export const updateRole = mutation({
    args: {
        memberId: v.id("orgMembers"),
        newRole: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const targetMember = await ctx.db.get(args.memberId);

        if (!targetMember) throw new Error("Member not found");

        // Check if requester is admin of that org
        const requesterMembership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", targetMember.orgId).eq("userId", userId))
            .first();

        if (!requesterMembership || requesterMembership.role !== "admin") {
            throw new Error("Unauthorized: Only admins can update roles");
        }

        await ctx.db.patch(args.memberId, { role: args.newRole });
    },
});

/**
 * Get the current user's role in an organization by slug
 */
export const getMyRole = query({
    args: { orgSlug: v.string() },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.orgSlug))
            .unique();

        if (!org) return null;

        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", org._id).eq("userId", userId))
            .unique();

        return membership?.role || null;
    },
});

