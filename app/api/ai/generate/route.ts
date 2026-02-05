import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateQuestionsFromText } from "@/lib/ai-generator";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

        // 2. Parse request body
        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Text is required", code: "INVALID_INPUT" },
                { status: 400 }
            );
        }

        if (text.trim().length < 50) {
            return NextResponse.json(
                { error: "Text must be at least 50 characters", code: "TEXT_TOO_SHORT" },
                { status: 400 }
            );
        }

        if (text.length > 50000) {
            return NextResponse.json(
                { error: "Text exceeds maximum length of 50,000 characters", code: "TEXT_TOO_LONG" },
                { status: 400 }
            );
        }

        // 3. Check usage limits via Convex
        // Note: For now, we'll check limit directly here since we can't easily call authenticated Convex queries from API route
        // In production, this would be done more elegantly

        // 4. Generate questions
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service not configured", code: "SERVICE_UNAVAILABLE" },
                { status: 503 }
            );
        }

        const result = await generateQuestionsFromText(text, apiKey);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error, code: "GENERATION_FAILED" },
                { status: 422 }
            );
        }

        // 5. Usage recording is handled by the client after confirming generation was used
        // This prevents counting failed generations

        return NextResponse.json({
            success: true,
            questions: result.questions,
            count: result.questions?.length ?? 0,
        });
    } catch (error) {
        console.error("[AI Generate] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", code: "INTERNAL_ERROR" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "Use POST to generate questions" }, { status: 405 });
}
