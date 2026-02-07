import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Level thresholds: Level 1 (0 XP), Level 2 (100 XP), Level 3 (300 XP), Level 4 (600 XP), Level 5 (1000 XP)
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

// XP rewards
const XP_REWARDS = {
    QUIZ_COMPLETED: 10,
    MISTAKE_PRACTICED: 5,
    PERFECT_SCORE: 20,
    FIRST_QUIZ_BONUS: 50,
    STREAK_BONUS_PER_DAY: 2, // Extra XP per streak day
};

// Badge definitions
export const BADGES = {
    FIRST_QUIZ: { id: "first_quiz", name: "First Quiz", description: "Completed your first quiz" },
    STREAK_7: { id: "streak_7", name: "Week Warrior", description: "Maintained a 7-day streak" },
    STREAK_30: { id: "streak_30", name: "Monthly Master", description: "Maintained a 30-day streak" },
    ACCURACY_100: { id: "accuracy_100", name: "Perfectionist", description: "Scored 100% on a quiz" },
    AI_EARLY_ADOPTER: { id: "ai_early_adopter", name: "AI Early Adopter", description: "Generated your first AI quiz" },
    LEVEL_5: { id: "level_5", name: "Rising Star", description: "Reached Level 5" },
    QUIZZES_10: { id: "quizzes_10", name: "Quiz Enthusiast", description: "Completed 10 quizzes" },
    QUIZZES_50: { id: "quizzes_50", name: "Quiz Master", description: "Completed 50 quizzes" },
};

/**
 * Calculate level from XP
 */
function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

/**
 * Get XP needed for next level
 */
function xpForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 1000;
    }
    return LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
    return new Date().toISOString().split("T")[0];
}

/**
 * Check if two dates are consecutive days
 */
function areConsecutiveDays(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

/**
 * Check if dates are the same day
 */
function isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
}

/**
 * Get or create user progress record
 */
export const getOrCreateProgress = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const clerkId = identity.subject;
        const existing = await ctx.db
            .query("userProgress")
            .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (existing) return existing;

        // Create new progress record
        const id = await ctx.db.insert("userProgress", {
            clerkId,
            xp: 0,
            level: 1,
            streak: 0,
            lastActiveDate: "",
            badges: [],
            quizzesCompleted: 0,
            perfectScores: 0,
            aiQuizzesGenerated: 0,
        });

        return await ctx.db.get(id);
    },
});

/**
 * Get user stats (read-only)
 */
export const getUserStats = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const clerkId = identity.subject;
        const progress = await ctx.db
            .query("userProgress")
            .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (!progress) {
            return {
                xp: 0,
                level: 1,
                streak: 0,
                badges: [],
                quizzesCompleted: 0,
                perfectScores: 0,
                xpForNextLevel: LEVEL_THRESHOLDS[1],
                xpProgress: 0,
            };
        }

        const nextLevelXp = xpForNextLevel(progress.level);
        const currentLevelXp = LEVEL_THRESHOLDS[progress.level - 1] || 0;
        const xpInCurrentLevel = progress.xp - currentLevelXp;
        const xpNeededForLevel = nextLevelXp - currentLevelXp;

        return {
            xp: progress.xp,
            level: progress.level,
            streak: progress.streak,
            badges: progress.badges,
            quizzesCompleted: progress.quizzesCompleted,
            perfectScores: progress.perfectScores,
            xpForNextLevel: nextLevelXp,
            xpProgress: Math.round((xpInCurrentLevel / xpNeededForLevel) * 100),
        };
    },
});

/**
 * Award XP and check for level up, returns any new achievements
 */
export const awardXP = mutation({
    args: {
        reason: v.string(), // "quiz_completed" | "mistake_practiced" | "perfect_score"
        quizScore: v.optional(v.number()), // 0-100 for quiz completion
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const clerkId = identity.subject;
        let progress = await ctx.db
            .query("userProgress")
            .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
            .unique();

        // Create if doesn't exist
        if (!progress) {
            const id = await ctx.db.insert("userProgress", {
                clerkId,
                xp: 0,
                level: 1,
                streak: 0,
                lastActiveDate: "",
                badges: [],
                quizzesCompleted: 0,
                perfectScores: 0,
                aiQuizzesGenerated: 0,
            });
            progress = await ctx.db.get(id);
            if (!progress) throw new Error("Failed to create progress");
        }

        const today = getTodayString();
        const newBadges: string[] = [];
        let xpToAdd = 0;
        let quizzesCompleted = progress.quizzesCompleted;
        let perfectScores = progress.perfectScores;

        // Calculate XP based on reason
        switch (args.reason) {
            case "quiz_completed":
                xpToAdd = XP_REWARDS.QUIZ_COMPLETED;
                quizzesCompleted += 1;

                // First quiz bonus
                if (quizzesCompleted === 1 && !progress.badges.includes("first_quiz")) {
                    xpToAdd += XP_REWARDS.FIRST_QUIZ_BONUS;
                    newBadges.push("first_quiz");
                }

                // Perfect score bonus
                if (args.quizScore === 100) {
                    xpToAdd += XP_REWARDS.PERFECT_SCORE;
                    perfectScores += 1;
                    if (!progress.badges.includes("accuracy_100")) {
                        newBadges.push("accuracy_100");
                    }
                }

                // Quiz milestone badges
                if (quizzesCompleted === 10 && !progress.badges.includes("quizzes_10")) {
                    newBadges.push("quizzes_10");
                }
                if (quizzesCompleted === 50 && !progress.badges.includes("quizzes_50")) {
                    newBadges.push("quizzes_50");
                }
                break;

            case "mistake_practiced":
                xpToAdd = XP_REWARDS.MISTAKE_PRACTICED;
                break;

            case "ai_quiz_generated":
                if (!progress.badges.includes("ai_early_adopter")) {
                    newBadges.push("ai_early_adopter");
                }
                break;
        }

        // Streak bonus
        if (progress.streak > 0) {
            xpToAdd += Math.min(progress.streak * XP_REWARDS.STREAK_BONUS_PER_DAY, 20); // Cap at 20 bonus XP
        }

        // Calculate new XP and level
        const newXp = progress.xp + xpToAdd;
        const newLevel = calculateLevel(newXp);
        const leveledUp = newLevel > progress.level;

        // Level 5 badge
        if (newLevel >= 5 && !progress.badges.includes("level_5")) {
            newBadges.push("level_5");
        }

        // Update streak
        let newStreak = progress.streak;
        if (progress.lastActiveDate === "") {
            newStreak = 1;
        } else if (!isSameDay(progress.lastActiveDate, today)) {
            if (areConsecutiveDays(progress.lastActiveDate, today)) {
                newStreak = progress.streak + 1;
            } else {
                newStreak = 1; // Reset streak
            }
        }

        // Streak badges
        if (newStreak >= 7 && !progress.badges.includes("streak_7")) {
            newBadges.push("streak_7");
        }
        if (newStreak >= 30 && !progress.badges.includes("streak_30")) {
            newBadges.push("streak_30");
        }

        // Update database
        await ctx.db.patch(progress._id, {
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            lastActiveDate: today,
            badges: [...progress.badges, ...newBadges],
            quizzesCompleted,
            perfectScores,
        });

        return {
            xpGained: xpToAdd,
            newXp,
            newLevel,
            leveledUp,
            newBadges,
            streak: newStreak,
        };
    },
});

/**
 * Update streak (call on app open/activity)
 */
export const checkAndUpdateStreak = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { streak: 0, streakBroken: false };

        const clerkId = identity.subject;
        const progress = await ctx.db
            .query("userProgress")
            .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (!progress) return { streak: 0, streakBroken: false };

        const today = getTodayString();

        // Already active today
        if (isSameDay(progress.lastActiveDate, today)) {
            return { streak: progress.streak, streakBroken: false };
        }

        let newStreak = progress.streak;
        let streakBroken = false;

        if (progress.lastActiveDate === "") {
            newStreak = 1;
        } else if (areConsecutiveDays(progress.lastActiveDate, today)) {
            newStreak = progress.streak + 1;
        } else {
            // Streak broken
            newStreak = 1;
            streakBroken = progress.streak > 0;
        }

        const newBadges: string[] = [];
        if (newStreak >= 7 && !progress.badges.includes("streak_7")) {
            newBadges.push("streak_7");
        }
        if (newStreak >= 30 && !progress.badges.includes("streak_30")) {
            newBadges.push("streak_30");
        }

        await ctx.db.patch(progress._id, {
            streak: newStreak,
            lastActiveDate: today,
            badges: [...progress.badges, ...newBadges],
        });

        return { streak: newStreak, streakBroken, newBadges };
    },
});

/**
 * Record AI quiz generation (for badge tracking)
 */
export const recordAIQuizGenerated = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const clerkId = identity.subject;
        let progress = await ctx.db
            .query("userProgress")
            .withIndex("by_clerk", (q) => q.eq("clerkId", clerkId))
            .unique();

        if (!progress) {
            const id = await ctx.db.insert("userProgress", {
                clerkId,
                xp: 0,
                level: 1,
                streak: 0,
                lastActiveDate: getTodayString(),
                badges: [],
                quizzesCompleted: 0,
                perfectScores: 0,
                aiQuizzesGenerated: 0,
            });
            progress = await ctx.db.get(id);
            if (!progress) throw new Error("Failed to create progress");
        }

        const newBadges: string[] = [];
        if (progress.aiQuizzesGenerated === 0 && !progress.badges.includes("ai_early_adopter")) {
            newBadges.push("ai_early_adopter");
        }

        await ctx.db.patch(progress._id, {
            aiQuizzesGenerated: progress.aiQuizzesGenerated + 1,
            badges: [...progress.badges, ...newBadges],
        });

        return { newBadges };
    },
});

/**
 * Get leaderboard (top users by XP)
 */
export const getLeaderboard = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;

        const users = await ctx.db
            .query("userProgress")
            .withIndex("by_xp")
            .order("desc")
            .take(limit);

        return users.map((u, index) => ({
            rank: index + 1,
            clerkId: u.clerkId,
            xp: u.xp,
            level: u.level,
            streak: u.streak,
            badges: u.badges.length,
        }));
    },
});
