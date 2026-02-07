import { internalMutation, mutation } from "./_generated/server";

/**
 * Migration: Backfill quizzes without creatorId
 * 
 * Run this ONCE before making creatorId required in schema.
 * Usage: Run from Convex dashboard or via `npx convex run migrations:backfillCreatorId`
 */
export const backfillCreatorId = internalMutation({
    handler: async (ctx) => {
        const quizzes = await ctx.db.query("quizzes").collect();

        let updated = 0;
        let skipped = 0;

        for (const quiz of quizzes) {
            if (!quiz.creatorId) {
                await ctx.db.patch(quiz._id, {
                    creatorId: "legacy-migration",
                    createdAt: quiz.createdAt || quiz._creationTime,
                });
                updated++;
            } else {
                skipped++;
            }
        }

        // Also backfill flagged_questions
        const flags = await ctx.db.query("flagged_questions").collect();
        let flagsUpdated = 0;

        for (const flag of flags) {
            if (!flag.creatorId) {
                // Try to get creatorId from the quiz
                const quiz = await ctx.db.query("quizzes")
                    .filter(q => q.eq(q.field("_id"), flag.quizId))
                    .first();

                await ctx.db.patch(flag._id, {
                    creatorId: quiz?.creatorId || "legacy-migration",
                });
                flagsUpdated++;
            }
        }

        return {
            quizzes: { updated, skipped },
            flags: { updated: flagsUpdated },
        };
    },
});

/**
 * One-time callable version (for testing)
 */
export const runBackfill = mutation({
    handler: async (ctx) => {
        // No auth required - this is a one-time migration run from CLI

        const quizzes = await ctx.db.query("quizzes").collect();
        let quizzesUpdated = 0;

        for (const quiz of quizzes) {
            if (!quiz.creatorId) {
                await ctx.db.patch(quiz._id, {
                    creatorId: "legacy-migration",
                    createdAt: quiz.createdAt || quiz._creationTime,
                });
                quizzesUpdated++;
            }
        }

        // Also backfill flagged_questions
        const flags = await ctx.db.query("flagged_questions").collect();
        let flagsUpdated = 0;

        for (const flag of flags) {
            if (!flag.creatorId) {
                await ctx.db.patch(flag._id, {
                    creatorId: "legacy-migration",
                });
                flagsUpdated++;
            }
        }

        return {
            quizzes: { updated: quizzesUpdated, total: quizzes.length },
            flags: { updated: flagsUpdated, total: flags.length }
        };
    },
});
