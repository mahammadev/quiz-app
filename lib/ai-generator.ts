/**
 * AI Quiz Generator
 * Utilities for generating quiz questions from text using Google Gemini
 */

// Question validation result type
export interface ParsedQuestion {
    question: string;
    answers: string[];
    correct_answer: string;
}

export interface GenerationResult {
    success: boolean;
    questions?: ParsedQuestion[];
    error?: string;
}

/**
 * System prompt for quiz generation
 */
const SYSTEM_PROMPT = `You are a quiz question generator. Convert the following text into quiz questions.

Each question must have:
- question: the question text (clear and concise)
- answers: an array of exactly 4 answer options
- correct_answer: the text of the correct answer (must match one of the answers exactly)

Rules:
- Generate 5-10 questions depending on the text length
- Questions should test understanding, not just recall
- Each question must have exactly 4 answer options
- Only one answer should be correct
- Preserve the original language of the input text
- Return ONLY valid JSON array. No markdown, no explanation.

Example output format:
[
  {
    "question": "What is the capital of France?",
    "answers": ["Paris", "London", "Berlin", "Madrid"],
    "correct_answer": "Paris"
  }
]`;

/**
 * Validate a single parsed question
 */
export function validateQuestion(q: unknown): q is ParsedQuestion {
    if (typeof q !== "object" || q === null) return false;

    const obj = q as Record<string, unknown>;

    // Check required fields
    if (typeof obj.question !== "string" || obj.question.trim() === "") {
        return false;
    }

    if (!Array.isArray(obj.answers) || obj.answers.length < 2) {
        return false;
    }

    // All answers must be non-empty strings
    if (!obj.answers.every((a: unknown) => typeof a === "string" && a.trim() !== "")) {
        return false;
    }

    if (typeof obj.correct_answer !== "string" || obj.correct_answer.trim() === "") {
        return false;
    }

    // Correct answer must be in the answers array
    if (!obj.answers.includes(obj.correct_answer)) {
        return false;
    }

    return true;
}

/**
 * Parse and validate AI response into questions
 */
export function parseQuestions(responseText: string): GenerationResult {
    try {
        // Try to extract JSON from the response (handle markdown code blocks)
        let jsonStr = responseText.trim();

        // Remove markdown code blocks if present
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.slice(7);
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();

        const parsed = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) {
            return { success: false, error: "Response is not an array" };
        }

        if (parsed.length === 0) {
            return { success: false, error: "No questions generated" };
        }

        // Validate each question
        const validQuestions: ParsedQuestion[] = [];
        const errors: string[] = [];

        for (let i = 0; i < parsed.length; i++) {
            if (validateQuestion(parsed[i])) {
                validQuestions.push({
                    question: parsed[i].question.trim(),
                    answers: parsed[i].answers.map((a: string) => a.trim()),
                    correct_answer: parsed[i].correct_answer.trim(),
                });
            } else {
                errors.push(`Question ${i + 1} is malformed`);
            }
        }

        if (validQuestions.length === 0) {
            return { success: false, error: `All questions invalid: ${errors.join(", ")}` };
        }

        return { success: true, questions: validQuestions };
    } catch (e) {
        return { success: false, error: `Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
}

/**
 * Generate quiz questions from text using Gemini API
 */
export async function generateQuestionsFromText(
    text: string,
    apiKey: string
): Promise<GenerationResult> {
    if (!text || text.trim().length < 50) {
        return { success: false, error: "Text is too short. Please provide at least 50 characters." };
    }

    if (!apiKey) {
        return { success: false, error: "Google AI API key is not configured." };
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: SYSTEM_PROMPT },
                                { text: `\n\nText to convert into quiz:\n\n${text}` },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
            };
        }

        const data = await response.json();

        // Extract text from Gemini response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return { success: false, error: "No content generated from AI" };
        }

        return parseQuestions(generatedText);
    } catch (e) {
        return {
            success: false,
            error: `API request failed: ${e instanceof Error ? e.message : String(e)}`,
        };
    }
}
