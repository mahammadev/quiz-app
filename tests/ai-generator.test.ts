import assert from "node:assert/strict";
import { test, describe } from "node:test";

import { parseQuestions, validateQuestion } from "../lib/ai-generator";

describe("AI Generator - Question Validation", () => {
    test("validates a correct question object", () => {
        const validQuestion = {
            question: "What is the capital of France?",
            answers: ["Paris", "London", "Berlin", "Madrid"],
            correct_answer: "Paris",
        };

        assert.equal(validateQuestion(validQuestion), true);
    });

    test("rejects question with empty question text", () => {
        const invalidQuestion = {
            question: "",
            answers: ["Paris", "London", "Berlin", "Madrid"],
            correct_answer: "Paris",
        };

        assert.equal(validateQuestion(invalidQuestion), false);
    });

    test("rejects question with too few answers", () => {
        const invalidQuestion = {
            question: "What is 2+2?",
            answers: ["4"],
            correct_answer: "4",
        };

        assert.equal(validateQuestion(invalidQuestion), false);
    });

    test("rejects question where correct_answer is not in answers", () => {
        const invalidQuestion = {
            question: "What is the capital of France?",
            answers: ["London", "Berlin", "Madrid", "Rome"],
            correct_answer: "Paris",
        };

        assert.equal(validateQuestion(invalidQuestion), false);
    });

    test("rejects non-object input", () => {
        assert.equal(validateQuestion("not an object"), false);
        assert.equal(validateQuestion(null), false);
        assert.equal(validateQuestion(undefined), false);
        assert.equal(validateQuestion(123), false);
    });

    test("rejects question with empty answers array", () => {
        const invalidQuestion = {
            question: "What is 2+2?",
            answers: [],
            correct_answer: "4",
        };

        assert.equal(validateQuestion(invalidQuestion), false);
    });
});

describe("AI Generator - parseQuestions", () => {
    test("parses valid JSON array of questions", () => {
        const jsonString = JSON.stringify([
            {
                question: "What is 2+2?",
                answers: ["3", "4", "5", "6"],
                correct_answer: "4",
            },
            {
                question: "What is 3+3?",
                answers: ["5", "6", "7", "8"],
                correct_answer: "6",
            },
        ]);

        const result = parseQuestions(jsonString);

        assert.equal(result.success, true);
        assert.equal(result.questions?.length, 2);
        assert.equal(result.questions?.[0].question, "What is 2+2?");
        assert.equal(result.questions?.[1].correct_answer, "6");
    });

    test("handles JSON wrapped in markdown code block", () => {
        const jsonString = `\`\`\`json
[
    {
        "question": "What is 2+2?",
        "answers": ["3", "4", "5", "6"],
        "correct_answer": "4"
    }
]
\`\`\``;

        const result = parseQuestions(jsonString);

        assert.equal(result.success, true);
        assert.equal(result.questions?.length, 1);
    });

    test("handles JSON wrapped in plain code block", () => {
        const jsonString = `\`\`\`
[
    {
        "question": "What is 2+2?",
        "answers": ["3", "4", "5", "6"],
        "correct_answer": "4"
    }
]
\`\`\``;

        const result = parseQuestions(jsonString);

        assert.equal(result.success, true);
        assert.equal(result.questions?.length, 1);
    });

    test("returns error for invalid JSON", () => {
        const result = parseQuestions("not valid json");

        assert.equal(result.success, false);
        assert.ok(result.error?.includes("Failed to parse JSON"));
    });

    test("returns error for non-array JSON", () => {
        const result = parseQuestions(JSON.stringify({ question: "test" }));

        assert.equal(result.success, false);
        assert.equal(result.error, "Response is not an array");
    });

    test("returns error for empty array", () => {
        const result = parseQuestions(JSON.stringify([]));

        assert.equal(result.success, false);
        assert.equal(result.error, "No questions generated");
    });

    test("filters out invalid questions but keeps valid ones", () => {
        const jsonString = JSON.stringify([
            {
                question: "Valid question",
                answers: ["a", "b", "c", "d"],
                correct_answer: "a",
            },
            {
                question: "", // Invalid: empty question
                answers: ["a", "b"],
                correct_answer: "a",
            },
            {
                question: "Another valid question",
                answers: ["x", "y", "z", "w"],
                correct_answer: "y",
            },
        ]);

        const result = parseQuestions(jsonString);

        assert.equal(result.success, true);
        assert.equal(result.questions?.length, 2);
        assert.equal(result.questions?.[0].question, "Valid question");
        assert.equal(result.questions?.[1].question, "Another valid question");
    });

    test("trims whitespace from questions and answers", () => {
        const jsonString = JSON.stringify([
            {
                question: "  What is 2+2?  ",
                answers: ["  3  ", "  4  ", "  5  ", "  6  "],
                correct_answer: "  4  ",
            },
        ]);

        const result = parseQuestions(jsonString);

        assert.equal(result.success, true);
        assert.equal(result.questions?.[0].question, "What is 2+2?");
        assert.equal(result.questions?.[0].answers[1], "4");
        assert.equal(result.questions?.[0].correct_answer, "4");
    });
});
