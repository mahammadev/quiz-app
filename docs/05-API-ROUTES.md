# API Routes

> Complete reference for all API endpoints
> **Last Updated**: 2026-02-04

---

## Overview

QuizCreator uses **Next.js API Routes** for server-side operations that require:
- External API calls (Gemini, Stripe webhooks)
- File uploads (multipart/form-data)
- Complex processing that exceeds Convex limits

**Total API Routes**: 5
**Location**: `app/api/**/route.ts`

---

## API Route List

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/ai/generate` | POST | Generate quiz from text | ✅ Required |
| `/api/ai/generate-pdf` | POST | Generate quiz from PDF/TXT | ✅ Required |
| `/api/ip` | GET | Get client IP address | ❌ None |
| `/api/version` | GET | Get app version | ❌ None |

---

## POST /api/ai/generate

Generate quiz questions from text using Google Gemini.

### Endpoint

```
POST /api/ai/generate
Content-Type: application/json
```

### Authentication

**Required**: Yes (Clerk session)

**Error Response** (401):
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### Request Body

```typescript
{
  text: string  // 50-50,000 characters
}
```

**Example**:
```json
{
  "text": "The capital of France is Paris. Paris is located on the Seine River..."
}
```

### Success Response (200)

```typescript
{
  success: true,
  questions: [
    {
      question: string,
      answers: string[],
      correct_answer: string
    }
  ],
  count: number
}
```

**Example**:
```json
{
  "success": true,
  "questions": [
    {
      "question": "What is the capital of France?",
      "answers": ["Paris", "London", "Berlin", "Madrid"],
      "correct_answer": "Paris"
    },
    {
      "question": "Which river flows through Paris?",
      "answers": ["Seine", "Thames", "Danube", "Rhine"],
      "correct_answer": "Seine"
    }
  ],
  "count": 2
}
```

### Error Responses

#### 400 - Bad Request

**Invalid Input**:
```json
{
  "error": "Text is required",
  "code": "INVALID_INPUT"
}
```

**Text Too Short** (< 50 chars):
```json
{
  "error": "Text must be at least 50 characters",
  "code": "TEXT_TOO_SHORT"
}
```

**Text Too Long** (> 50,000 chars):
```json
{
  "error": "Text exceeds maximum length of 50,000 characters",
  "code": "TEXT_TOO_LONG"
}
```

#### 422 - Unprocessable Entity

**AI Generation Failed**:
```json
{
  "error": "Failed to generate valid questions from text",
  "code": "GENERATION_FAILED"
}
```

**Limit Reached** (Free tier):
```json
{
  "error": "Monthly AI generation limit reached",
  "code": "LIMIT_REACHED",
  "limit": 3,
  "used": 3
}
```

#### 503 - Service Unavailable

**AI Service Not Configured**:
```json
{
  "error": "AI service not configured",
  "code": "SERVICE_UNAVAILABLE"
}
```

**Gemini API Error**:
```json
{
  "error": "Gemini API error: 429 - Rate limit exceeded",
  "code": "AI_SERVICE_ERROR"
}
```

### Implementation Flow

```
1. Validate auth (Clerk)
2. Parse & validate request body
3. Check usage limits (Convex)
4. Call Gemini API with system prompt
5. Parse JSON response
6. Validate question format
7. Return questions to client
```

### Code Location

- **Route**: `app/api/ai/generate/route.ts`
- **Generator Logic**: `lib/ai-generator.ts`
- **Usage Tracking**: `convex/ai.ts`

### Testing

```bash
# With curl (requires auth cookie)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The solar system has eight planets. Mercury is closest to the sun..."
  }'
```

---

## POST /api/ai/generate-pdf

Generate quiz questions from PDF or TXT file.

### Endpoint

```
POST /api/ai/generate-pdf
Content-Type: multipart/form-data
```

### Authentication

**Required**: Yes (Clerk session)

### Request Body

**Form Data**:
```
file: File  // PDF or TXT, max 10MB
```

**Supported Formats**:
- `application/pdf` - PDF documents
- `text/plain` - Plain text files

### Success Response (200)

```typescript
{
  success: true,
  questions: [
    {
      question: string,
      answers: string[],
      correct_answer: string
    }
  ],
  count: number,
  metadata: {
    totalCharacters: number,
    pageCount?: number,
    chunksProcessed: number,
    duplicatesRemoved: number
  }
}
```

**Example**:
```json
{
  "success": true,
  "questions": [
    {
      "question": "What is photosynthesis?",
      "answers": ["Process using sunlight", "Cell division", "Digestion", "Respiration"],
      "correct_answer": "Process using sunlight"
    }
  ],
  "count": 1,
  "metadata": {
    "totalCharacters": 15420,
    "pageCount": 5,
    "chunksProcessed": 1,
    "duplicatesRemoved": 0
  }
}
```

### Error Responses

#### 400 - Bad Request

**No File**:
```json
{
  "error": "No file provided",
  "code": "INVALID_INPUT"
}
```

**Invalid File Type**:
```json
{
  "error": "Only PDF and TXT files are supported",
  "code": "INVALID_FILE_TYPE"
}
```

**File Too Large** (> 10MB):
```json
{
  "error": "File size exceeds 10MB limit",
  "code": "FILE_TOO_LARGE"
}
```

**Text Too Short**:
```json
{
  "error": "File content is too short (minimum 50 characters)",
  "code": "TEXT_TOO_SHORT"
}
```

#### 422 - Unprocessable Entity

**PDF Processing Failed**:
```json
{
  "error": "Failed to parse PDF. File may be corrupted or password protected.",
  "code": "PDF_PROCESSING_FAILED"
}
```

**Scanned PDF** (no text layer):
```json
{
  "error": "PDF appears to be scanned images. Try pasting text manually.",
  "code": "PDF_PROCESSING_FAILED"
}
```

**No Questions Generated**:
```json
{
  "error": "No questions could be generated from this document",
  "code": "GENERATION_FAILED",
  "details": ["Chunk 1: Invalid JSON response"]
}
```

#### 503 - Service Unavailable

Same as `/api/ai/generate`

### Implementation Flow

```
1. Validate auth (Clerk)
2. Parse multipart form data
3. Validate file type (PDF/TXT)
4. Validate file size (< 10MB)
5. Extract text:
   - PDF: pdf-parse library
   - TXT: direct read
6. Smart chunking (respect question boundaries)
7. Process each chunk with Gemini
8. Deduplicate questions
9. Return results with metadata
```

### Processing Details

**PDF Processing**:
- Library: `pdf-parse`
- Extracts text from PDF pages
- Preserves layout for question detection
- Fails on scanned/image-only PDFs

**Smart Chunking**:
- Max 8,000 chars per chunk
- Groups ~20 questions per batch
- Detects question boundaries using patterns:
  - Numbered: `1.`, `2)`, `100.`
  - Labeled: `Question 1`, `Q1`
  - Options: `A)`, `B.`, `C)`

**Rate Limiting**:
- 500ms delay between chunks
- Prevents Gemini API rate limits

### Code Location

- **Route**: `app/api/ai/generate-pdf/route.ts`
- **PDF Logic**: `lib/pdf-extractor.ts`
- **Generator**: `lib/ai-generator.ts`

### Testing

```bash
# With curl
curl -X POST http://localhost:3000/api/ai/generate-pdf \
  -F "file=@/path/to/document.pdf"
```

Or use the UI at `/dashboard` → Create Quiz → Upload File

---

## GET /api/ip

Get the client's IP address.

### Endpoint

```
GET /api/ip
```

### Authentication

**Required**: No

### Success Response (200)

```typescript
{
  ip: string
}
```

**Example**:
```json
{
  "ip": "192.168.1.100"
}
```

### Use Cases

- Presence tracking
- Rate limiting by IP
- Analytics
- Security logging

### Implementation

```typescript
// app/api/ip/route.ts
export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             'unknown'
  
  return Response.json({ ip })
}
```

### Code Location

- **Route**: `app/api/ip/route.ts`

---

## GET /api/version

Get the current application version.

### Endpoint

```
GET /api/version
```

### Authentication

**Required**: No

### Success Response (200)

```typescript
{
  version: string,
  buildDate: string,
  environment: string
}
```

**Example**:
```json
{
  "version": "0.2.0",
  "buildDate": "2026-02-04T12:00:00Z",
  "environment": "development"
}
```

### Use Cases

- Version checking in UI
- Debugging
- Cache busting
- Update notifications

### Code Location

- **Route**: `app/api/version/route.ts`
- **Version Source**: `package.json` or `lib/version.ts`

---

## Error Handling

### Standard Error Format

All errors follow this structure:

```typescript
{
  error: string,      // Human-readable message
  code: string,       // Machine-readable code
  details?: any       // Additional context (optional)
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid auth |
| 405 | Method Not Allowed | Wrong HTTP method |
| 422 | Unprocessable | Valid input but processing failed |
| 500 | Internal Error | Unexpected server error |
| 503 | Service Unavailable | External service down |

### Error Codes Reference

| Code | Description | Route |
|------|-------------|-------|
| `UNAUTHORIZED` | Not authenticated | All protected routes |
| `INVALID_INPUT` | Missing or malformed input | /generate, /generate-pdf |
| `TEXT_TOO_SHORT` | Text < 50 characters | /generate |
| `TEXT_TOO_LONG` | Text > 50,000 characters | /generate |
| `INVALID_FILE_TYPE` | Not PDF or TXT | /generate-pdf |
| `FILE_TOO_LARGE` | File > 10MB | /generate-pdf |
| `PDF_PROCESSING_FAILED` | PDF parse error | /generate-pdf |
| `GENERATION_FAILED` | AI failed to generate | /generate, /generate-pdf |
| `LIMIT_REACHED` | Free tier exhausted | /generate, /generate-pdf |
| `SERVICE_UNAVAILABLE` | AI service down | /generate, /generate-pdf |
| `AI_SERVICE_ERROR` | Gemini API error | /generate, /generate-pdf |
| `INTERNAL_ERROR` | Unexpected error | All routes |

---

## Authentication

### How Auth Works

1. User signs in via Clerk (sets session cookie)
2. Cookie sent with every API request automatically
3. Route handler validates session via Clerk
4. User ID available for database queries

### Protecting a Route

```typescript
import { auth } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }
  
  // Proceed with authenticated request...
}
```

### Public Routes

Routes without auth:
- `/api/ip`
- `/api/version`
- `/api/webhooks/*` (Phase 5)

---

## Rate Limiting

### Current Implementation

**AI Routes** (`/api/ai/*`):
- Per-user limit: 3/month (free tier)
- Tracked in `aiUsage` table
- Checked before processing

**No IP-based rate limiting yet** (future enhancement)

### Future: Stripe Webhooks

When implemented (Phase 5):
- `/api/webhooks/stripe` - No auth, signature verification
- Stripe validates webhook signature
- Idempotency handled via Stripe event IDs

---

## Testing APIs

### Using curl

```bash
# Test public endpoint
curl http://localhost:3000/api/version

# Test protected endpoint (need valid session)
curl http://localhost:3000/api/ip

# Test AI generation (authenticated)
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -b "session_cookie=value" \
  -d '{"text": "Test content..."}'
```

### Using Postman/Insomnia

1. Set base URL: `http://localhost:3000`
2. For protected routes, sign in via browser first
3. Copy session cookie from browser DevTools
4. Add as Cookie header in request

### Integration Tests

See `tests/` directory for automated tests.

Run tests:
```bash
npm test
```

---

## Future API Routes (Phase 5)

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/stripe/checkout` | POST | Create checkout session | ✅ Required |
| `/api/webhooks/stripe` | POST | Handle Stripe events | ❌ Webhook sig |
| `/api/billing/portal` | GET | Customer billing portal | ✅ Required |

---

*For client-side data fetching patterns, see [04-DATABASE.md](./04-DATABASE.md). For troubleshooting, see [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md).*
