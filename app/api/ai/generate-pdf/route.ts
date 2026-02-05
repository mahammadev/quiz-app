import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateQuestionsFromText, ParsedQuestion } from "@/lib/ai-generator";
import { processPDFFile, smartChunkText } from "@/lib/pdf-extractor";

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized", code: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        // 2. Parse multipart form data
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided", code: "INVALID_INPUT" },
                { status: 400 }
            );
        }

        // 3. Validate file type
        const allowedTypes = ["application/pdf", "text/plain"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Only PDF and TXT files are supported", code: "INVALID_FILE_TYPE" },
                { status: 400 }
            );
        }

        // 4. Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size exceeds 10MB limit", code: "FILE_TOO_LARGE" },
                { status: 400 }
            );
        }

        // 5. Get API key
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service not configured", code: "SERVICE_UNAVAILABLE" },
                { status: 503 }
            );
        }

        // 6. Extract text based on file type
        let chunks: { text: string; estimatedQuestions: number }[];
        let totalCharacters: number;
        let pageCount: number | undefined;

        if (file.type === "application/pdf") {
            const buffer = Buffer.from(await file.arrayBuffer());
            const result = await processPDFFile(buffer);

            if (!result.success || !result.chunks) {
                return NextResponse.json(
                    { error: result.error || "Failed to process PDF", code: "PDF_PROCESSING_FAILED" },
                    { status: 422 }
                );
            }

            chunks = result.chunks;
            totalCharacters = result.totalCharacters || 0;
            pageCount = result.pageCount;
        } else {
            // Plain text file
            const text = await file.text();
            if (text.trim().length < 50) {
                return NextResponse.json(
                    { error: "File content is too short (minimum 50 characters)", code: "TEXT_TOO_SHORT" },
                    { status: 400 }
                );
            }

            const chunkResult = smartChunkText(text);
            chunks = chunkResult.chunks;
            totalCharacters = chunkResult.totalCharacters;
        }

        // 7. Process chunks and generate questions
        const allQuestions: ParsedQuestion[] = [];
        const errors: string[] = [];
        let processedChunks = 0;

        for (const chunk of chunks) {
            if (chunk.text.trim().length < 50) {
                continue; // Skip very short chunks
            }

            const result = await generateQuestionsFromText(chunk.text, apiKey);
            processedChunks++;

            if (result.success && result.questions) {
                allQuestions.push(...result.questions);
            } else if (result.error) {
                errors.push(`Chunk ${processedChunks}: ${result.error}`);
            }

            // Add a small delay between API calls to avoid rate limiting
            if (chunks.length > 1 && processedChunks < chunks.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (allQuestions.length === 0) {
            return NextResponse.json(
                {
                    error: errors.length > 0
                        ? `Failed to generate questions: ${errors[0]}`
                        : "No questions could be generated from this document",
                    code: "GENERATION_FAILED",
                    details: errors,
                },
                { status: 422 }
            );
        }

        // 8. Deduplicate questions by question text
        const seenQuestions = new Set<string>();
        const uniqueQuestions = allQuestions.filter(q => {
            const normalized = q.question.toLowerCase().trim();
            if (seenQuestions.has(normalized)) {
                return false;
            }
            seenQuestions.add(normalized);
            return true;
        });

        return NextResponse.json({
            success: true,
            questions: uniqueQuestions,
            count: uniqueQuestions.length,
            metadata: {
                totalCharacters,
                pageCount,
                chunksProcessed: processedChunks,
                duplicatesRemoved: allQuestions.length - uniqueQuestions.length,
            },
        });
    } catch (error) {
        console.error("[AI Generate PDF] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: "Use POST with multipart form data containing a 'file' field" },
        { status: 405 }
    );
}
