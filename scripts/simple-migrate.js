/**
 * Simple data migration script
 * Copies all data from dev to production
 */

const { ConvexHttpClient } = require("convex/browser");

const DEV_URL = "https://uncommon-reindeer-392.convex.cloud";
const PROD_URL = "https://adept-oyster-574.convex.cloud";

const devClient = new ConvexHttpClient(DEV_URL);
const prodClient = new ConvexHttpClient(PROD_URL);

async function copyTable(tableName, mutationName, dataKey) {
    console.log(`\n📋 Copying ${tableName}...`);

    try {
        // Get all data from dev
        const listFunction = `${tableName}:list`;
        let devData = [];

        try {
            devData = await devClient.query(listFunction);
        } catch (error) {
            console.log(`  ⚠️  No list query for ${tableName}, skipping`);
            return { success: 0, failed: 0, skipped: true };
        }

        if (!devData || devData.length === 0) {
            console.log(`  ✓ Table is empty`);
            return { success: 0, failed: 0, skipped: true };
        }

        console.log(`  📥 Found ${devData.length} records in dev`);

        // Clean the data (remove _id and _creationTime)
        const cleanData = devData.map(item => {
            const { _id, _creationTime, ...rest } = item;
            return rest;
        });

        // Import to production in batches
        const batchSize = 50;
        let totalSuccess = 0;
        let totalFailed = 0;

        for (let i = 0; i < cleanData.length; i += batchSize) {
            const batch = cleanData.slice(i, i + batchSize);

            try {
                const result = await prodClient.mutation(mutationName, {
                    [dataKey]: batch
                });

                totalSuccess += result.success || 0;
                totalFailed += result.failed || 0;

                console.log(`  📤 Progress: ${Math.min(i + batchSize, cleanData.length)}/${cleanData.length}`);
            } catch (error) {
                console.error(`  ❌ Batch failed:`, error.message);
                totalFailed += batch.length;
            }
        }

        console.log(`  ✅ Complete: ${totalSuccess} succeeded, ${totalFailed} failed`);
        return { success: totalSuccess, failed: totalFailed, skipped: false };

    } catch (error) {
        console.error(`  ❌ Error copying ${tableName}:`, error.message);
        return { success: 0, failed: 0, skipped: false, error: error.message };
    }
}

async function migrate() {
    console.log("🚀 Starting migration from dev to production\n");
    console.log(`📍 Dev:  ${DEV_URL}`);
    console.log(`📍 Prod: ${PROD_URL}\n`);

    const tables = [
        { name: "users", mutation: "dataMigration:bulkInsertUsers", key: "users" },
        { name: "quizzes", mutation: "dataMigration:bulkInsertQuizzes", key: "quizzes" },
        { name: "leaderboard", mutation: "dataMigration:bulkInsertLeaderboard", key: "entries" },
        { name: "flagged_questions", mutation: "dataMigration:bulkInsertFlags", key: "flags" },
        { name: "userMistakes", mutation: "dataMigration:bulkInsertMistakes", key: "mistakes" },
    ];

    const results = [];

    for (const table of tables) {
        const result = await copyTable(table.name, table.mutation, table.key);
        results.push({ table: table.name, ...result });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));

    for (const result of results) {
        if (result.skipped) {
            console.log(`${result.table.padEnd(20)} - Skipped (empty or no query)`);
        } else if (result.error) {
            console.log(`${result.table.padEnd(20)} - Error: ${result.error}`);
        } else {
            console.log(`${result.table.padEnd(20)} - ✓ ${result.success} records`);
        }
    }

    console.log("=".repeat(60));
    console.log("\n✅ Migration complete!");
}

migrate().catch(error => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
});
