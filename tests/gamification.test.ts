import assert from "node:assert/strict";
import { test, describe } from "node:test";

// Replicate the logic from userProgress.ts for testing
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

const XP_REWARDS = {
    QUIZ_COMPLETED: 10,
    MISTAKE_PRACTICED: 5,
    PERFECT_SCORE: 20,
    FIRST_QUIZ_BONUS: 50,
    STREAK_BONUS_PER_DAY: 2,
};

function calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

function xpForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 1000;
    }
    return LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

function areConsecutiveDays(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

function isSameDay(date1: string, date2: string): boolean {
    return date1 === date2;
}

describe("Gamification - Level Calculation", () => {
    test("level 1 at 0 XP", () => {
        assert.equal(calculateLevel(0), 1);
    });

    test("level 1 at 99 XP", () => {
        assert.equal(calculateLevel(99), 1);
    });

    test("level 2 at 100 XP", () => {
        assert.equal(calculateLevel(100), 2);
    });

    test("level 3 at 300 XP", () => {
        assert.equal(calculateLevel(300), 3);
    });

    test("level 4 at 600 XP", () => {
        assert.equal(calculateLevel(600), 4);
    });

    test("level 5 at 1000 XP", () => {
        assert.equal(calculateLevel(1000), 5);
    });

    test("level 5 at 1499 XP (between level 5 and 6)", () => {
        assert.equal(calculateLevel(1499), 5);
    });

    test("level 6 at 1500 XP", () => {
        assert.equal(calculateLevel(1500), 6);
    });

    test("level 10 at 4500 XP", () => {
        assert.equal(calculateLevel(4500), 10);
    });

    test("levels above threshold array still work", () => {
        // Beyond the threshold array
        assert.equal(calculateLevel(10000), 10);
    });
});

describe("Gamification - XP for Next Level", () => {
    test("level 1 needs 100 XP for level 2", () => {
        assert.equal(xpForNextLevel(1), 100);
    });

    test("level 2 needs 300 XP for level 3", () => {
        assert.equal(xpForNextLevel(2), 300);
    });

    test("level 4 needs 1000 XP for level 5", () => {
        assert.equal(xpForNextLevel(4), 1000);
    });
});

describe("Gamification - Streak Calculation", () => {
    test("consecutive days are detected correctly", () => {
        assert.equal(areConsecutiveDays("2026-02-03", "2026-02-04"), true);
        assert.equal(areConsecutiveDays("2026-02-04", "2026-02-03"), true);
    });

    test("non-consecutive days are detected correctly", () => {
        assert.equal(areConsecutiveDays("2026-02-01", "2026-02-04"), false);
        assert.equal(areConsecutiveDays("2026-02-04", "2026-02-06"), false);
    });

    test("same day detection works", () => {
        assert.equal(isSameDay("2026-02-04", "2026-02-04"), true);
        assert.equal(isSameDay("2026-02-03", "2026-02-04"), false);
    });

    test("month boundary consecutive days", () => {
        assert.equal(areConsecutiveDays("2026-01-31", "2026-02-01"), true);
        assert.equal(areConsecutiveDays("2026-02-28", "2026-03-01"), true);
    });
});

describe("Gamification - XP Rewards", () => {
    test("quiz completion gives 10 XP", () => {
        assert.equal(XP_REWARDS.QUIZ_COMPLETED, 10);
    });

    test("mistake practice gives 5 XP", () => {
        assert.equal(XP_REWARDS.MISTAKE_PRACTICED, 5);
    });

    test("perfect score gives 20 XP bonus", () => {
        assert.equal(XP_REWARDS.PERFECT_SCORE, 20);
    });

    test("first quiz gives 50 XP bonus", () => {
        assert.equal(XP_REWARDS.FIRST_QUIZ_BONUS, 50);
    });

    test("streak bonus is 2 XP per day", () => {
        assert.equal(XP_REWARDS.STREAK_BONUS_PER_DAY, 2);
    });

    test("first quiz with perfect score gives correct XP", () => {
        const xp = XP_REWARDS.QUIZ_COMPLETED + XP_REWARDS.FIRST_QUIZ_BONUS + XP_REWARDS.PERFECT_SCORE;
        assert.equal(xp, 80); // 10 + 50 + 20
    });
});

describe("Gamification - Level Progression", () => {
    test("simulating quiz progression to level 2", () => {
        // Need 100 XP for level 2
        // Each quiz = 10 XP, so 10 quizzes for level 2
        let xp = 0;
        for (let i = 0; i < 10; i++) {
            xp += XP_REWARDS.QUIZ_COMPLETED;
        }
        assert.equal(xp, 100);
        assert.equal(calculateLevel(xp), 2);
    });

    test("first quiz gets to level 1 with good progress", () => {
        // First quiz with perfect score = 10 + 50 + 20 = 80 XP
        const xp = XP_REWARDS.QUIZ_COMPLETED + XP_REWARDS.FIRST_QUIZ_BONUS + XP_REWARDS.PERFECT_SCORE;
        assert.equal(calculateLevel(xp), 1);
        // Only need 20 more XP for level 2
        assert.equal(xpForNextLevel(1) - xp, 20);
    });

    test("streak bonus accumulates correctly", () => {
        // 7 day streak with daily quiz
        let xp = 0;
        for (let streak = 1; streak <= 7; streak++) {
            const streakBonus = Math.min(streak * XP_REWARDS.STREAK_BONUS_PER_DAY, 20);
            xp += XP_REWARDS.QUIZ_COMPLETED + streakBonus;
        }
        // Day 1: 10 + 2 = 12
        // Day 2: 10 + 4 = 14
        // Day 3: 10 + 6 = 16
        // Day 4: 10 + 8 = 18
        // Day 5: 10 + 10 = 20
        // Day 6: 10 + 12 = 22
        // Day 7: 10 + 14 = 24
        // Total = 12 + 14 + 16 + 18 + 20 + 22 + 24 = 126
        assert.equal(xp, 126);
    });
});
