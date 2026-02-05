import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

/**
 * Create a new organization
 */
export const create = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // check if slug is taken
        const existing = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            throw new Error("Organization slug already taken");
        }

        const orgId = await ctx.db.insert("organizations", {
            name: args.name,
            slug: args.slug,
            ownerId: userId,
            createdAt: Date.now(),
            planId: "school", // Default for now
            settings: {},
        });

        // Add creator as admin
        await ctx.db.insert("orgMembers", {
            orgId,
            userId,
            role: "admin",
            addedAt: Date.now(),
            addedBy: userId,
        });

        return orgId;
    },
});

/**
 * Get organization details by slug
 */
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (!org) return null;

        // In future: check if user has access to view this org
        // For now, public org page logic might apply, or we restrict
        return org;
    },
});



/**
 * Get organization details by ID
 */
export const get = query({
    args: { id: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const org = await ctx.db.get(args.id);

        if (!org) return null;

        // Check if member?
        const member = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.id).eq("userId", userId))
            .first();

        if (!member) throw new Error("Unauthorized");

        return org;
    },
});
export const listMyOrgs = query({
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);

        const memberships = await ctx.db
            .query("orgMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const orgs = [];
        for (const member of memberships) {
            const org = await ctx.db.get(member.orgId);
            if (org) orgs.push(org);
        }

        return orgs;
    },
});

/**
 * Check if user is a member of an org (Helper)
 */
export const isMember = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        try {
            const userId = await getCurrentUserId(ctx);
            const member = await ctx.db
                .query("orgMembers")
                .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
                .first();
            return !!member;
        } catch {
            return false;
        }
    },
});
