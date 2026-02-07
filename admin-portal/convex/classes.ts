import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserId } from "./utils";

// --- Class Management ---

// --- Queries ---

export const get = query({
    args: { id: v.id("classes") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const classDoc = await ctx.db.get(args.id);
        if (!classDoc) return null;

        // Check Permissions
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", userId))
            .first();

        if (!membership) throw new Error("Unauthorized");

        // If student, check if member of class
        if (membership.role === "student") {
            const isMember = await ctx.db
                .query("classMembers")
                .withIndex("by_class_user", (q) => q.eq("classId", args.id).eq("userId", userId))
                .first();
            if (!isMember) throw new Error("Unauthorized");
        }

        return classDoc;
    },
});

export const listMembers = query({
    args: { classId: v.id("classes") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const classDoc = await ctx.db.get(args.classId);
        if (!classDoc) throw new Error("Class not found");

        // Check Permissions (Same as get)
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", userId))
            .first();

        if (!membership) throw new Error("Unauthorized");

        const members = await ctx.db
            .query("classMembers")
            .withIndex("by_class", (q) => q.eq("classId", args.classId))
            .collect();

        // Enrich with user details
        const enrichedMembers = await Promise.all(members.map(async (m) => {
            const user = await ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", m.userId))
                .first();
            return {
                ...m,
                user
            };
        }));

        return enrichedMembers;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        orgId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // 1. Check Permissions (Admin or Teacher)
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!membership || (membership.role !== "admin" && membership.role !== "teacher")) {
            throw new Error("Unauthorized: Only admins or teachers can create classes");
        }

        // 2. Create Class
        const classId = await ctx.db.insert("classes", {
            name: args.name,
            description: args.description,
            orgId: args.orgId,
            teacherId: userId,
            createdAt: Date.now(),
        });

        return classId;
    },
});

export const listByOrg = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        // 1. Verify membership
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", args.orgId).eq("userId", userId))
            .first();

        if (!membership) throw new Error("Unauthorized");

        // 2. Return all classes for the org
        // In the future, we might filter: Students only see classes they are in.
        // Teachers see classes they teach + maybe others?
        // Admins see all.
        
        if (membership.role === "student") {
            // Students only see classes they are members of
            const memberships = await ctx.db
                .query("classMembers")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
            
            const classes = [];
            for (const m of memberships) {
                const c = await ctx.db.get(m.classId);
                if (c && c.orgId === args.orgId) classes.push(c);
            }
            return classes;
        }

        // Teachers/Admins see all (for now, simplistic)
        return await ctx.db
            .query("classes")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .collect();
    },
});

// --- Class Membership ---

export const addMember = mutation({
    args: {
        classId: v.id("classes"),
        userId: v.string(), // Clerk ID of student
    },
    handler: async (ctx, args) => {
        const requesterId = await getCurrentUserId(ctx);
        const classDoc = await ctx.db.get(args.classId);
        if (!classDoc) throw new Error("Class not found");

        // Permission check: Must be Admin or the Teacher of this class
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", requesterId))
            .first();

        const isTeacher = classDoc.teacherId === requesterId;
        const isAdmin = membership?.role === "admin";

        if (!isTeacher && !isAdmin) {
            throw new Error("Unauthorized to add members to this class");
        }

        // Check if student is in the Org
        const studentOrgMembership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", args.userId))
            .first();
        
        if (!studentOrgMembership) {
            throw new Error("User is not a member of the organization");
        }

        // Check duplicates
        const existing = await ctx.db
            .query("classMembers")
            .withIndex("by_class_user", (q) => q.eq("classId", args.classId).eq("userId", args.userId))
            .first();
        
        if (existing) return; // Already added

        await ctx.db.insert("classMembers", {
            classId: args.classId,
            userId: args.userId,
            joinedAt: Date.now(),
        });
    },
});

// --- Assignments ---

export const listAssignments = query({
    args: { classId: v.id("classes") },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const classDoc = await ctx.db.get(args.classId);
        if (!classDoc) throw new Error("Class not found");

        // Permission: Must be Member of Class OR Admin/Teacher of Org
        // 1. Check Org Role
        const orgMembership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", userId))
            .first();

        let hasAccess = false;
        if (orgMembership && (orgMembership.role === "admin" || orgMembership.role === "teacher")) {
            hasAccess = true;
        } else {
            // 2. Check Class Membership
            const classMembership = await ctx.db
                .query("classMembers")
                .withIndex("by_class_user", (q) => q.eq("classId", args.classId).eq("userId", userId))
                .first();
            if (classMembership) hasAccess = true;
        }

        if (!hasAccess) throw new Error("Unauthorized");

        const assignments = await ctx.db
            .query("assignments")
            .withIndex("by_class", (q) => q.eq("classId", args.classId))
            .collect();

        // Join with Quiz details
        const enriched = await Promise.all(assignments.map(async (a) => {
            const quiz = await ctx.db.get(a.quizId);
            return {
                ...a,
                quizName: quiz?.name || "Unknown Quiz",
                quizQuestionCount: quiz?.questions.length || 0,
            };
        }));

        return enriched;
    }
});

export const assignQuiz = mutation({
    args: {
        quizId: v.id("quizzes"),
        classId: v.id("classes"),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);
        const classDoc = await ctx.db.get(args.classId);
        if (!classDoc) throw new Error("Class not found");

        // Verify Teacher/Admin
        const membership = await ctx.db
            .query("orgMembers")
            .withIndex("by_org_user", (q) => q.eq("orgId", classDoc.orgId).eq("userId", userId))
            .first();
        
        if (!membership || (membership.role !== "admin" && membership.role !== "teacher")) {
            throw new Error("Unauthorized");
        }

        await ctx.db.insert("assignments", {
            quizId: args.quizId,
            classId: args.classId,
            orgId: classDoc.orgId,
            assignedAt: Date.now(),
            dueDate: args.dueDate,
        });
    }
});
