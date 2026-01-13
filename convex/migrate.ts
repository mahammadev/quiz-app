import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { createClient } from "@supabase/supabase-js";
import { internal } from "./_generated/api";

// This action will fetch data from Supabase and insert it into Convex.
// You need to set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Convex dashboard first:
// npx convex env set SUPABASE_URL ...
// npx convex env set SUPABASE_SERVICE_ROLE_KEY ...

export const importFromSupabase = action({
    args: {},
    handler: async (ctx) => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Convex environment variables.");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Fetching quizzes from Supabase...");
        const { data: quizzes, error: qError } = await supabase.from("quizzes").select("*");
        if (qError) throw new Error(`Failed to fetch quizzes: ${qError.message}`);

        const idMap: Record<string, string> = {};

        if (quizzes) {
            console.log(`Migrating ${quizzes.length} quizzes...`);
            for (const q of quizzes) {
                const newId = await ctx.runMutation(internal.migrate.insertQuiz, {
                    name: q.name,
                    questions: q.questions,
                });
                idMap[q.id] = newId;
            }
        }

        console.log("Fetching leaderboard from Supabase...");
        const { data: leaderboard, error: lError } = await supabase.from("leaderboard").select("*");
        if (lError) throw new Error(`Failed to fetch leaderboard: ${lError.message}`);

        if (leaderboard) {
            console.log(`Migrating ${leaderboard.length} leaderboard entries...`);
            for (const entry of leaderboard) {
                const quizId = idMap[entry.quiz_id] || entry.quiz_id;
                await ctx.runMutation(internal.migrate.insertLeaderboard, {
                    quizId,
                    name: entry.name,
                    score: entry.score,
                    duration: entry.duration,
                });
            }
        }

        console.log("Fetching flags from Supabase...");
        const { data: flags, error: fError } = await supabase.from("flagged_questions").select("*");
        if (fError) throw new Error(`Failed to fetch flags: ${fError.message}`);

        if (flags) {
            console.log(`Migrating ${flags.length} flagged questions...`);
            for (const f of flags) {
                const quizId = idMap[f.quiz_id] || f.quiz_id;
                await ctx.runMutation(internal.migrate.insertFlag, {
                    quizId,
                    question: f.question,
                    reason: f.reason,
                    upvotes: f.upvotes || 0,
                });
            }
        }

        return "Migration successful!";
    },
});

export const insertQuiz = internalMutation({
    args: {
        name: v.string(),
        questions: v.any(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("quizzes", {
            name: args.name,
            questions: args.questions,
        });
    },
});

export const insertLeaderboard = internalMutation({
    args: {
        quizId: v.string(),
        name: v.string(),
        score: v.number(),
        duration: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("leaderboard", {
            quizId: args.quizId,
            name: args.name,
            score: args.score,
            duration: args.duration,
        });
    },
});

export const insertFlag = internalMutation({
    args: {
        quizId: v.string(),
        question: v.string(),
        reason: v.string(),
        upvotes: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("flagged_questions", {
            quizId: args.quizId,
            question: args.question,
            reason: args.reason,
            upvotes: args.upvotes,
        });
    },
});
