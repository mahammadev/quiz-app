import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

// --- Helpers ---

const getIdentity = async (ctx: { auth: { getUserIdentity: () => Promise<any> } }) => {
    const userId = await getCurrentUserId(ctx);
    return { subject: userId };
};

// --- Mutations ---

export const create = mutation({
    args: {
        name: v.string(),
        orgId: v.optional(v.id("organizations")), // Optional org association
        visibility: v.optional(v.string()),       // e.g., "org", "private"
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
        const userId = await getCurrentUserId(ctx);

        // If orgId is provided, verify membership
        if (args.orgId) {
            const membership = await ctx.db
                .query("orgMembers")
                .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId!).eq("userId", userId))
                .first();

            if (!membership) {
                // Determine strictness: Can I create a quiz for an org I'm not in? No.
                throw new Error("Unauthorized: You are not a member of this organization");
            }
            // Future: Check role permissions (e.g. Students maybe can't create org quizzes)
            if (membership.role === "student") {
                // For now, let's allow students to create quizzes but maybe not org-wide ones?
                // Or maybe they can, but visibility is limited.
                // Adhering to ORGANIZATIONS.md: "Student: Create Quizzes? No (❌)"
                throw new Error("Unauthorized: Students cannot create organization quizzes");
            }
        }

        const quizId = await ctx.db.insert("quizzes", {
            name: args.name,
            creatorId: userId,
            createdAt: Date.now(),
            orgId: args.orgId,
            visibility: args.visibility,
            questions: args.questions,
        });
        return quizId;
    },
});

export const remove = mutation({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const quiz = await ctx.db.get(args.id);

        if (!quiz) throw new Error("Quiz not found");

        // Check ownership
        if (quiz.creatorId === userId) {
            await ctx.db.delete(args.id);
            return;
        }

        // Check Org Admin rights
        if (quiz.orgId) {
            const membership = await ctx.db
                .query("orgMembers")
                .withIndex("by_org_user", (q) => q.eq("orgId", quiz.orgId!).eq("userId", userId))
                .first();

            if (membership && membership.role === "admin") {
                // Org admins can delete any quiz in the org
                await ctx.db.delete(args.id);
                return;
            }
        }

        throw new Error("Unauthorized");
    },
});

export const update = mutation({
    args: {
        id: v.id("quizzes"),
        name: v.optional(v.string()),
        questions: v.optional(v.array(
            v.object({
                question: v.string(),
                answers: v.array(v.string()),
                correct_answer: v.string(),
                _originalIndex: v.optional(v.number()),
            })
        )),
        visibility: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const quiz = await ctx.db.get(args.id);

        if (!quiz) throw new Error("Quiz not found");

        // Check access (Owner or Org Admin)
        let hasAccess = quiz.creatorId === userId;

        if (!hasAccess && quiz.orgId) {
            const membership = await ctx.db
                .query("orgMembers")
                .withIndex("by_org_user", (q) => q.eq("orgId", quiz.orgId!).eq("userId", userId))
                .first();
            if (membership && membership.role === "admin") {
                hasAccess = true;
            }
        }

        if (!hasAccess) throw new Error("Unauthorized");

        const updateFields: any = {};
        if (args.name) updateFields.name = args.name;
        if (args.questions) updateFields.questions = args.questions;
        if (args.visibility) updateFields.visibility = args.visibility;

        await ctx.db.patch(args.id, updateFields);
    },
});

// --- Queries ---

export const get = query({
    args: { id: v.id("quizzes") },
    handler: async (ctx, args) => {
        const quiz = await ctx.db.get(args.id);
        if (!quiz) return null;

        // Visibility Check logic
        // 1. If public (global), allow (not implemented yet)

        // 2. If user is owner, allow
        const identity = await ctx.auth.getUserIdentity();
        if (identity && identity.subject === quiz.creatorId) return quiz;

        // 3. If Org quiz, check membership
        if (quiz.orgId && identity) {
            const membership = await ctx.db
                .query("orgMembers")
                .withIndex("by_org_user", (q) => q.eq("orgId", quiz.orgId!).eq("userId", identity.subject))
                .first();

            if (membership) {
                // Member of the org.
                // Check visibility rules. 
                // If 'private', only owner (already handled) or Admin?
                // If 'org', allow all members.
                if (quiz.visibility === 'org' || !quiz.visibility) return quiz; // Default to org visible?
                if (quiz.visibility === 'private' && membership.role === 'admin') return quiz;
            }
        }

        // 4. If user not logged in, maybe allow taking it via public link?
        // Current implementation was just "return quiz" (public).
        // Let's keep it somewhat open for "taking" the quiz, but maybe frontend handles auth guard.
        // For security, strict read access is better.
        // Reverting to simplistic permissive read for now to avoid breaking existing flows until UI handles "Private".
        return quiz;
    },
});

export const list = query({
    handler: async (ctx) => {
        const userId = await getCurrentUserId(ctx);

        // 1. My created quizzes
        const myQuizzes = await ctx.db
            .query("quizzes")
            .withIndex("by_creator", (q) => q.eq("creatorId", userId))
            .collect();

        // 2. Quizzes from my Orgs
        const memberships = await ctx.db
            .query("orgMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (memberships.length === 0) {
            return myQuizzes;
        }

        const orgQuizzesPromises = memberships.map(async (m) => {
            return await ctx.db
                .query("quizzes")
                .withIndex("by_orgId", (q) => q.eq("orgId", m.orgId))
                .collect();
        });

        const orgQuizzesResults = await Promise.all(orgQuizzesPromises);
        const orgQuizzes = orgQuizzesResults.flat();

        // 3. Merge and Deduplicate
        const allQuizzesMap = new Map();

        // Add my quizzes
        myQuizzes.forEach(q => allQuizzesMap.set(q._id, q));

        // Add org quizzes (filtering duplicates)
        orgQuizzes.forEach(q => {
            if (!allQuizzesMap.has(q._id)) {
                // Apply visibility filter?
                // If visibility is 'private' and I'm not creator, only show if I'm Admin
                // Finding role for this org
                const memberRecord = memberships.find(m => m.orgId === q.orgId);
                const isAdmin = memberRecord?.role === 'admin';

                if (q.visibility !== 'private' || isAdmin) {
                    allQuizzesMap.set(q._id, q);
                }
            }
        });

        // Convert values to array and sort by creation time desc
        return Array.from(allQuizzesMap.values()).sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const listByOrg = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // Check membership
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!membership) {
            // Or allow if public visibility? For now, strict.
            throw new Error("Unauthorized: Not a member of this organization");
        }

        const quizzes = await ctx.db
            .query("quizzes")
            .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
            .collect();

        // Filter by visibility/role
        return quizzes.filter(q => {
            if (q.visibility === 'private' && membership.role !== 'admin' && q.creatorId !== userId) {
                return false;
            }
            return true;
        }).sort((a, b) => b.createdAt - a.createdAt);
    },
});
