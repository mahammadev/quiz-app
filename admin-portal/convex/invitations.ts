import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

// --- Create Invite ---

export const create = mutation({
    args: {
        orgId: v.id("organizations"),
        email: v.string(),
        role: v.string(), // "admin", "teacher"
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // 1. Check permissions (Admin only)
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!membership || membership.role !== "admin") {
            throw new Error("Unauthorized: Only admins can manage invitations");
        }

        // 2. Check if user is already a member (by email lookup? We only have Clerk IDs in orgMembers)
        // We can't easily check if *this email* is already a member unless we store emails in orgMembers or look up user by email.
        // `users` table has email, but `orgMembers` uses userId.
        // For MVP, we'll skip this check or implement it via user lookup if possible.
        // Assuming we rely on frontend validation or post-accept check.

        // 3. Create Invite
        // Basic token generation (UUID-like enough for now)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const inviteId = await ctx.db.insert("invitations", {
            orgId: args.orgId,
            email: args.email.toLowerCase().trim(),
            role: args.role,
            token,
            invitedBy: userId,
            status: "pending",
        });


        return { inviteId, token };
    },
});

// --- Accept Invite ---

export const accept = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // 1. Find invite
        const invite = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!invite) throw new Error("Invalid or expired invitation");
        if (invite.status !== "pending") throw new Error("Invitation is no longer valid");

        // 2. Check if already member
        const existing = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", invite.orgId).eq("userId", userId))
            .first();

        if (existing) {
            // Already member, just mark invite as accepted?
            // Or error? Let's error to be clean.
            // Actually, if they are already member, just consume the invite gracefully.
            await ctx.db.patch(invite._id, { status: "accepted" });
            return { orgId: invite.orgId, alreadyMember: true };
        }

        // 3. Add to Org
        await ctx.db.insert("orgMembers", {
            orgId: invite.orgId,
            userId,
            role: invite.role,
            addedAt: Date.now(),
            addedBy: invite.invitedBy,
        });

        // 4. Update invite status
        await ctx.db.patch(invite._id, { status: "accepted" });

        return { orgId: invite.orgId, alreadyMember: false };
    },
});

// --- Revoke/Cancel Invite ---

export const revoke = mutation({
    args: { inviteId: v.id("invitations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const invite = await ctx.db.get(args.inviteId);
        if (!invite) throw new Error("Invite not found");

        // Check Admin permissions for the ORG of the invite
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", invite.orgId).eq("userId", userId))
            .first();

        if (!membership || membership.role !== "admin") {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.inviteId, { status: "revoked" });
    },
});


// --- Queries ---

export const listByOrg = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // Auth check
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        // Only Admins see invites? Or teachers too? Usually Admin.
        if (!membership || membership.role !== "admin") {
            throw new Error("Unauthorized");
        }

        return await ctx.db
            .query("invitations")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();
    },
});

export const getByToken = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const invite = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!invite || invite.status !== "pending") return null;

        const org = await ctx.db.get(invite.orgId);
        return { invite, org };
    },
});

