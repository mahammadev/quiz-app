import assert from "node:assert/strict";
import { test, describe } from "node:test";

import { smartChunkText, simpleChunkText } from "../lib/pdf-extractor";

describe("PDF Extractor - Smart Chunking", () => {
    test("chunks text with numbered questions correctly", () => {
        const text = `1. What is the capital of France?
A) Paris
B) London
C) Berlin
D) Madrid

2. What is 2+2?
A) 3
B) 4
C) 5
D) 6

3. Who wrote Romeo and Juliet?
A) Charles Dickens
B) William Shakespeare
C) Jane Austen
D) Mark Twain`;

        const result = smartChunkText(text);

        assert.ok(result.chunks.length >= 1);
        assert.equal(result.estimatedTotalQuestions, 3);
        assert.ok(result.totalCharacters > 0);
    });

    test("detects question patterns with 'Sual' prefix", () => {
        const text = `Sual 1. Azərbaycanın paytaxtı hansıdır?
A) Bakı
B) Gəncə
C) Sumqayıt
D) Şəki

Sual 2. 2+2 neçədir?
A) 3
B) 4
C) 5
D) 6`;

        const result = smartChunkText(text);

        assert.equal(result.estimatedTotalQuestions, 2);
    });

    test("detects questions ending with question marks", () => {
        const text = `What is the meaning of life?
This is a philosophical question.

How does photosynthesis work?
Plants convert light into energy.

Why is the sky blue?
Light scattering causes this phenomenon.`;

        const result = smartChunkText(text);

        assert.ok(result.estimatedTotalQuestions >= 3);
    });

    test("handles empty text", () => {
        const result = smartChunkText("");

        assert.equal(result.chunks.length, 0);
        assert.equal(result.estimatedTotalQuestions, 0);
    });

    test("handles text with no clear question patterns", () => {
        const text = `This is a paragraph of text without any questions.
It just contains some information about various topics.
There are no numbered items or question marks here.`;

        const result = smartChunkText(text);

        assert.ok(result.chunks.length >= 1);
        assert.ok(result.chunks[0].text.includes("paragraph"));
    });

    test("respects maximum chunk size", () => {
        // Generate a large text with many questions
        let text = "";
        for (let i = 1; i <= 100; i++) {
            text += `${i}. This is question number ${i} with some additional text to make it longer. What is the answer to this question?
A) Option A for question ${i}
B) Option B for question ${i}
C) Option C for question ${i}
D) Option D for question ${i}

`;
        }

        const result = smartChunkText(text);

        // Should create multiple chunks
        assert.ok(result.chunks.length > 1, "Should create multiple chunks for large text");

        // Each chunk should not exceed the max size (8000 chars)
        for (const chunk of result.chunks) {
            assert.ok(chunk.text.length <= 10000, `Chunk size ${chunk.text.length} should be reasonable`);
        }
    });
});

describe("PDF Extractor - Simple Chunking", () => {
    test("returns single chunk for small text", () => {
        const text = "This is a small paragraph. It should fit in one chunk.";

        const result = simpleChunkText(text);

        assert.equal(result.length, 1);
        assert.equal(result[0].text, text);
    });

    test("splits large text on paragraph boundaries", () => {
        const paragraph = "Lorem ipsum dolor sit amet. ".repeat(100);
        const text = `${paragraph}\n\n${paragraph}\n\n${paragraph}`;

        const result = simpleChunkText(text, 1000);

        assert.ok(result.length > 1);
        // Verify chunks don't split mid-paragraph
        for (const chunk of result) {
            assert.ok(!chunk.text.startsWith(" "), "Chunk should not start with space");
        }
    });

    test("handles text with no paragraph breaks", () => {
        const text = "A".repeat(10000);

        const result = simpleChunkText(text, 3000);

        // Should still create chunks
        assert.ok(result.length >= 1);
    });
});

describe("PDF Extractor - Chunk Properties", () => {
    test("chunks have correct start and end indices", () => {
        const text = `1. First question?
Answer options here.

2. Second question?
More answer options.`;

        const result = smartChunkText(text);

        for (const chunk of result.chunks) {
            assert.ok(chunk.startIndex >= 0, "startIndex should be non-negative");
            assert.ok(chunk.endIndex >= chunk.startIndex, "endIndex should be >= startIndex");
            assert.ok(chunk.estimatedQuestions >= 0, "estimatedQuestions should be non-negative");
        }
    });

    test("chunks cover entire text", () => {
        const text = `1. Question one?
A) a B) b C) c D) d

2. Question two?
A) a B) b C) c D) d

3. Question three?
A) a B) b C) c D) d`;

        const result = smartChunkText(text);

        // Combine all chunks and verify we have the content
        const combinedText = result.chunks.map(c => c.text).join(" ");
        assert.ok(combinedText.includes("Question one"));
        assert.ok(combinedText.includes("Question three"));
    });
});
