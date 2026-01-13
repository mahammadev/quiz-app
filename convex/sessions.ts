import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create exam session
export const createSession = mutation({
    args: {
        quizId: v.id("quizzes"),
        teacherId: v.id("users"),
        accessCode: v.string(),
        startTime: v.number(),
        endTime: v.number(),
        mode: v.union(v.literal("EXAM"), v.literal("PRACTICE")),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const sessionId = await ctx.db.insert("examSessions", {
            quizId: args.quizId,
            teacherId: args.teacherId,
            accessCode: args.accessCode.toUpperCase(),
            startTime: args.startTime,
            endTime: args.endTime,
            status: "PENDING",
            mode: args.mode,
            title: args.title,
            createdAt: Date.now(),
        });
        return sessionId;
    },
});

// Get session by access code
export const getSessionByAccessCode = query({
    args: { accessCode: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("examSessions")
            .withIndex("by_access_code", (q) => q.eq("accessCode", args.accessCode.toUpperCase()))
            .first();
    },
});

// Get session by ID
export const getSession = query({
    args: { sessionId: v.id("examSessions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.sessionId);
    },
});

// Get sessions by teacher
export const getTeacherSessions = query({
    args: { teacherId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("examSessions")
            .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
            .order("desc")
            .collect();
    },
});

// Get active sessions
export const getActiveSessions = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("examSessions")
            .withIndex("by_status", (q) => q.eq("status", "ACTIVE"))
            .collect();
    },
});

// Update session status
export const updateSessionStatus = mutation({
    args: {
        sessionId: v.id("examSessions"),
        status: v.union(v.literal("PENDING"), v.literal("ACTIVE"), v.literal("ARCHIVED")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, {
            status: args.status,
        });
    },
});

// Check if session is currently active (based on time)
export const isSessionActive = query({
    args: { sessionId: v.id("examSessions") },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) return false;

        const now = Date.now();
        return (
            session.status === "ACTIVE" &&
            session.startTime <= now &&
            session.endTime > now
        );
    },
});

// Delete session
export const deleteSession = mutation({
    args: { sessionId: v.id("examSessions") },
    handler: async (ctx, args) => {
        // Also delete all attempts for this session
        const attempts = await ctx.db
            .query("examAttempts")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect();

        for (const attempt of attempts) {
            await ctx.db.delete(attempt._id);
        }

        await ctx.db.delete(args.sessionId);
    },
});

// Get session participants count
export const getSessionParticipantsCount = query({
    args: { sessionId: v.id("examSessions") },
    handler: async (ctx, args) => {
        const attempts = await ctx.db
            .query("examAttempts")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .collect();

        return attempts.length;
    },
});

// Generate unique access code
export const generateAccessCode = query({
    handler: async () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking chars
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },
});
