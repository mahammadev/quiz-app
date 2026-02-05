# AI Quiz Engine

> **Status**: Planning  
> **Last Updated**: 2026-02-04

---

## Capabilities

| Feature | Input | Output |
|---------|-------|--------|
| **Text-to-Quiz** | Raw text paragraph | Array of Question objects |
| **Doc-to-Quiz** | PDF/TXT file | Array of Question objects |
| **Optimizer** | Existing quiz | Improved questions |
| **Difficulty Tune** | Quiz + target level | Adjusted questions |

---

## Doc-to-Quiz: Smart Chunking Algorithm

### Problem
Large PDFs (300+ questions) exceed reliable AI output limits. Naive text splitting corrupts questions by separating the stem from its options.

### Solution: Question-Boundary Detection

```
ALGORITHM: SmartQuestionChunker

INPUT: Raw text from PDF
OUTPUT: Array of question blocks

1. EXTRACT text from PDF (using pdf-parse)

2. DETECT question patterns:
   - QUESTION_START: /^(\d{1,3})[.\)]\s/m   → "1.", "23)", "100."
   - QUESTION_LABEL: /^(Sual|Question|Q)\s*\d+/im
   - ANSWER_OPTION: /^[A-E][.\)]\s/m        → "A)", "B.", "C)"

3. BUILD question blocks:
   - Mark each QUESTION_START as block boundary
   - Include all text until next QUESTION_START
   - Validate each block has answer options

4. VALIDATE & MERGE:
   - If block has < 2 answer options → merge with previous
   - If block exceeds 2000 chars → skip or process as-is (AI handles it)

5. BATCH for AI:
   - Group 20-25 questions per batch
   - Send each batch to Gemini for structured parsing

6. POST-PROCESS:
   - Deduplicate by question hash
   - Validate JSON structure
   - Flag malformed questions
```

### Scanned PDF Handling
- Use OCR (Google Cloud Vision or Tesseract)
- Apply same chunking algorithm to OCR output
- Lower confidence threshold → may produce lower quality results
- **Note**: If OCR fails, show error to user - no human intervention needed

---

## Prompt Engineering

### System Prompt Template
```
You are a quiz parser. Convert the following text into a JSON array of questions.

Each question must have:
- id: unique string (generate UUID)
- type: "single" | "multiple" | "combination"
- question: the question text (clean, no option letters)
- answers: array of { label: "A", text: "..." }
- correct_answer: the label of the correct answer

Rules:
- Preserve original language (Azerbaijani or English)
- If a question references numbered statements, set type to "combination"
- Ensure exactly 4-5 answer options per question

Return ONLY valid JSON. No markdown, no explanation.
```

### Temperature Settings

| Task | Temperature | Rationale |
|------|-------------|-----------|
| Parsing existing questions | 0.2 | Need accuracy, not creativity |
| Generating new questions | 0.7 | Want variety |
| Optimizing/rewriting | 0.5 | Balance |

### Token Limits

| Task | Max Input | Max Output |
|------|-----------|------------|
| Parse batch (25 questions) | ~4000 | ~3000 |
| Generate from text | ~2000 | ~2000 |
| Optimize single question | ~500 | ~500 |

---

## Error Handling

| Error | Detection | Recovery |
|-------|-----------|----------|
| Malformed JSON | JSON.parse fails | Retry with stricter prompt (max 3x) |
| Missing fields | Schema validation | Inject defaults or skip question |
| Truncated output | Response cut off | Reduce batch size, retry |
| Duplicate questions | Hash comparison | Keep first occurrence |
| Wrong language | Language detection | Re-prompt with language hint |

### Fallback Flow
```
1. Try Gemini 1.5 Flash (fast, cheap)
2. If fails 3x → Try Gemini 1.5 Pro (more capable)
3. If still fails → Show error to user with helpful message
   (e.g., "Could not parse this document. Try a clearer PDF or paste text manually.")
```

**No human reviewers needed** - everything is automated or shows error to user.

---

## API Cost Estimates

| Model | Price per 1M tokens | Est. cost per 100 questions |
|-------|---------------------|----------------------------|
| Gemini 1.5 Flash | $0.075 input / $0.30 output | ~$0.02 |
| Gemini 1.5 Pro | $3.50 input / $10.50 output | ~$0.50 |

**Budget**: Free tier gets 3 generations ≈ $0.06/user/month max.

---

## Open Questions

- [ ] How to handle questions with images/diagrams in PDFs?
- [ ] Should we support question generation from URLs (web pages)?
- [ ] What's the max file size we accept? (Current: no limit defined)
