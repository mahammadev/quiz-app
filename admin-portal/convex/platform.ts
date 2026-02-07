import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

/**
 * Check if the current user is a platform owner
 */
export const isPlatformOwner = query({
    handler: async (ctx) => {
        try {
            const userId = await getCurrentUserId(ctx);
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
                .unique();
            return user?.isPlatformOwner ?? false;
        } catch {
            return false;
        }
    },
});

/**
 * List all organizations on the platform
 */
export const listAllOrganizations = query({
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
            .unique();

        if (!user?.isPlatformOwner) {
            throw new Error("Unauthorized: Platform Owner only");
        }

        const orgs = await ctx.db.query("organizations").collect();
        
        // Enrich with owner details
        return await Promise.all(orgs.map(async (org) => {
            const owner = await ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", org.ownerId))
                .unique();
            return {
                ...org,
                ownerName: owner?.fullName ?? "Unknown",
                ownerEmail: owner?.email ?? "Unknown",
            };
        }));
    },
});

/**
 * Create a new organization from the platform level
 */
export const createOrganization = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        ownerEmail: v.string(), // We'll assign it to this user if they exist
    },
    handler: async (ctx, args) => {
        const adminId = await getCurrentUserId(ctx);
        const admin = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", adminId))
            .unique();

        if (!admin?.isPlatformOwner) {
            throw new Error("Unauthorized");
        }

        // 1. Check if slug exists
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) throw new Error("Slug already taken");

        // 2. Find the owner by email
        const targetEmail = args.ownerEmail.toLowerCase().trim();
        let owner = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", targetEmail))
            .unique();

        if (!owner) {
            // Fallback for non-normalized legacy users
            const allUsers = await ctx.db.query("users").collect();
            const found = allUsers.find(u => u.email.toLowerCase().trim() === targetEmail);
            
            if (found) {
                // Auto-fix the legacy user's email casing
                await ctx.db.patch(found._id, { email: targetEmail });
                owner = found as any; // Cast for now to satisfy TS if needed
            }
        }

        if (!owner) throw new Error(`Owner user not found for "${targetEmail}". They must sign in once first.`);

        const finalOwner = owner as { clerkId: string };
        
        // 3. Create Org
        const orgId = await ctx.db.insert("organizations", {
            name: args.name,
            slug: args.slug,
            ownerId: finalOwner.clerkId,
            createdAt: Date.now(),
            planId: "school",
            settings: {},
        });

        // 4. Add owner as Admin member
        await ctx.db.insert("orgMembers", {
            orgId,
            userId: finalOwner.clerkId,
            role: "admin",
            addedAt: Date.now(),
            addedBy: adminId,
        });

        return orgId;
    },
});

/**
 * Super-secret (but safe) mutation to claim ownership if no owner exists
 * or to promote the first user.
 */
export const claimPlatformOwnership = mutation({
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
            .unique();

        if (!user) throw new Error("User not found");

        const existingOwner = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("isPlatformOwner"), true))
            .first();

        if (existingOwner && existingOwner.clerkId !== userId) {
            throw new Error("Platform already has an owner");
        }

        await ctx.db.patch(user._id, { isPlatformOwner: true });
        return true;
    },
});
