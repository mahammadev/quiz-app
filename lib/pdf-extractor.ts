/**
 * PDF Text Extractor with Smart Chunking
 * Extracts text from PDFs and splits into question-aware chunks for AI processing
 */

/**
 * Result of PDF extraction
 */
export interface PDFExtractionResult {
    success: boolean;
    text?: string;
    pageCount?: number;
    error?: string;
}

/**
 * A chunk of text ready for AI processing
 */
export interface TextChunk {
    text: string;
    startIndex: number;
    endIndex: number;
    estimatedQuestions: number;
}

/**
 * Result of chunking operation
 */
export interface ChunkingResult {
    chunks: TextChunk[];
    totalCharacters: number;
    estimatedTotalQuestions: number;
}

// Question pattern detection (matches common question formats)
const QUESTION_PATTERNS = [
    /^\d{1,3}[.)]\s/m,                    // "1.", "23)", "100."
    /^(Sual|Question|Q)\s*\d+/im,         // "Sual 1", "Question 5", "Q1"
    /^[A-E][.)]\s/m,                       // Answer options "A)", "B."
];

// Optimal chunk sizes for Gemini API
const MAX_CHUNK_SIZE = 8000;  // characters per chunk
const TARGET_QUESTIONS_PER_CHUNK = 20;
const MIN_CHUNK_SIZE = 500;

/**
 * Extract text from PDF buffer
 * Note: This runs server-side only
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
    try {
        // Dynamic import to ensure it only runs server-side
        const pdfParseModule = await import("pdf-parse");
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;

        const data = await pdfParse(buffer, {
            // Preserve layout for better question detection
            normalizeWhitespace: true,
        });

        if (!data.text || data.text.trim().length === 0) {
            return {
                success: false,
                error: "PDF appears to be empty or contains only images (scanned documents require OCR)",
            };
        }

        return {
            success: true,
            text: data.text,
            pageCount: data.numpages,
        };
    } catch (e) {
        return {
            success: false,
            error: `Failed to parse PDF: ${e instanceof Error ? e.message : String(e)}`,
        };
    }
}

/**
 * Detect if a line looks like the start of a new question
 */
function isQuestionStart(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Check numbered question patterns (1., 2), Q1, etc.)
    if (/^\d{1,3}[.)]\s/.test(trimmed)) return true;
    if (/^(Sual|Question|Q)\s*\d+/i.test(trimmed)) return true;

    // Check for question marks at end of short lines (likely question text)
    if (trimmed.endsWith("?") && trimmed.length < 200) return true;

    return false;
}

/**
 * Detect if a line looks like an answer option
 */
function isAnswerOption(line: string): boolean {
    const trimmed = line.trim();
    return /^[A-Ea-e][.)]\s/.test(trimmed);
}

/**
 * Smart chunking algorithm that respects question boundaries
 * 
 * Algorithm:
 * 1. Split text into lines
 * 2. Identify question boundaries
 * 3. Group questions into chunks of ~20 questions each
 * 4. Ensure chunks don't split questions mid-way
 */
export function smartChunkText(text: string): ChunkingResult {
    const lines = text.split(/\r?\n/);
    const chunks: TextChunk[] = [];

    let currentChunk = "";
    let currentChunkStart = 0;
    let currentQuestionCount = 0;
    let totalQuestions = 0;
    let charIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineWithNewline = line + "\n";

        // Check if this line starts a new question
        const startsNewQuestion = isQuestionStart(line);

        if (startsNewQuestion) {
            totalQuestions++;
            currentQuestionCount++;

            // Check if we should start a new chunk
            const wouldExceedSize = currentChunk.length + lineWithNewline.length > MAX_CHUNK_SIZE;
            const hasEnoughQuestions = currentQuestionCount >= TARGET_QUESTIONS_PER_CHUNK;

            if (currentChunk.length > MIN_CHUNK_SIZE && (wouldExceedSize || hasEnoughQuestions)) {
                // Save current chunk
                chunks.push({
                    text: currentChunk.trim(),
                    startIndex: currentChunkStart,
                    endIndex: charIndex - 1,
                    estimatedQuestions: currentQuestionCount - 1, // Don't count the new question
                });

                // Start new chunk with this question
                currentChunk = lineWithNewline;
                currentChunkStart = charIndex;
                currentQuestionCount = 1;
            } else {
                currentChunk += lineWithNewline;
            }
        } else {
            currentChunk += lineWithNewline;
        }

        charIndex += lineWithNewline.length;
    }

    // Add remaining text as final chunk
    if (currentChunk.trim().length > 0) {
        chunks.push({
            text: currentChunk.trim(),
            startIndex: currentChunkStart,
            endIndex: charIndex - 1,
            estimatedQuestions: currentQuestionCount,
        });
    }

    // If no chunks were created but we have text, create a single chunk
    if (chunks.length === 0 && text.trim().length > 0) {
        chunks.push({
            text: text.trim(),
            startIndex: 0,
            endIndex: text.length - 1,
            estimatedQuestions: Math.max(1, Math.floor(text.length / 500)), // Rough estimate
        });
    }

    return {
        chunks,
        totalCharacters: text.length,
        estimatedTotalQuestions: totalQuestions || chunks.reduce((sum, c) => sum + c.estimatedQuestions, 0),
    };
}

/**
 * Simple chunking for plain text (non-PDF) that's too long
 * Splits on paragraph boundaries
 */
export function simpleChunkText(text: string, maxChunkSize: number = MAX_CHUNK_SIZE): TextChunk[] {
    if (text.length <= maxChunkSize) {
        return [{
            text: text.trim(),
            startIndex: 0,
            endIndex: text.length - 1,
            estimatedQuestions: Math.max(1, Math.floor(text.length / 500)),
        }];
    }

    const paragraphs = text.split(/\n\n+/);
    const chunks: TextChunk[] = [];
    let currentChunk = "";
    let currentChunkStart = 0;
    let charIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWithBreak = paragraph + "\n\n";

        if (currentChunk.length + paragraphWithBreak.length > maxChunkSize && currentChunk.length > 0) {
            chunks.push({
                text: currentChunk.trim(),
                startIndex: currentChunkStart,
                endIndex: charIndex - 1,
                estimatedQuestions: Math.max(1, Math.floor(currentChunk.length / 500)),
            });
            currentChunk = paragraphWithBreak;
            currentChunkStart = charIndex;
        } else {
            currentChunk += paragraphWithBreak;
        }

        charIndex += paragraphWithBreak.length;
    }

    if (currentChunk.trim().length > 0) {
        chunks.push({
            text: currentChunk.trim(),
            startIndex: currentChunkStart,
            endIndex: charIndex - 1,
            estimatedQuestions: Math.max(1, Math.floor(currentChunk.length / 500)),
        });
    }

    return chunks;
}

/**
 * Process a PDF file and return chunks ready for AI processing
 */
export async function processPDFFile(buffer: Buffer): Promise<{
    success: boolean;
    chunks?: TextChunk[];
    pageCount?: number;
    totalCharacters?: number;
    error?: string;
}> {
    const extraction = await extractTextFromPDF(buffer);

    if (!extraction.success || !extraction.text) {
        return {
            success: false,
            error: extraction.error,
        };
    }

    const chunking = smartChunkText(extraction.text);

    return {
        success: true,
        chunks: chunking.chunks,
        pageCount: extraction.pageCount,
        totalCharacters: chunking.totalCharacters,
    };
}
