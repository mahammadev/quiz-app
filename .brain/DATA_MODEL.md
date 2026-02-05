# Data Model

> **Status**: Active  
> **Last Updated**: 2026-02-04

---

## Entity Relationship

```
User (Clerk)
    │
    ├── Quiz
    │     ├── Question[]
    │     └── Session
    │           └── Attempt[]
    │
    ├── Subscription
    ├── Mistakes[]
    └── Achievements[]
```

---

## Core Tables (Convex Schema)

### users
| Field | Type | Notes |
|-------|------|-------|
| clerkId | string | Primary identifier from Clerk |
| email | string | |
| fullName | string | |
| createdAt | number | Timestamp |

### quizzes
| Field | Type | Notes |
|-------|------|-------|
| _id | Id<"quizzes"> | Convex auto-generated |
| creatorId | string | **Required**. Clerk ID of owner |
| name | string | Quiz title |
| questions | Question[] | Array of question objects |
| createdAt | number | Timestamp |

### subscriptions
| Field | Type | Notes |
|-------|------|-------|
| userId | string | Clerk ID |
| stripeSubscriptionId | string | |
| status | string | active, past_due, canceled |
| planId | string | free, pro, team |
| endsAt | number? | For canceled subs |

### leaderboard
| Field | Type | Notes |
|-------|------|-------|
| quizId | string | |
| clerkId | string? | Optional (guests allowed) |
| name | string | Display name |
| score | number | |
| duration | number | Time in ms |
| createdAt | number | |

### userMistakes
| Field | Type | Notes |
|-------|------|-------|
| clerkId | string | User who made the mistake |
| quizId | string | |
| questionId | string | Unique ID of the question |
| question | string | The question text |
| answers | string[] | All options |
| correctAnswer | string | |
| createdAt | number | |

---

## Question Schema

### Current Format (Legacy)
```json
{
  "question": "What is 2+2?\n1) option A\n2) option B",
  "answers": ["1,2,4", "1,3,4", "2,4,5"],
  "correct_answer": "1,2,4"
}
```

### Target Format (v2)
```json
{
  "id": "q_abc123",
  "type": "combination",
  "question": "Yumşaq bacarıqlar.....",
  "statements": [
    { "num": 1, "text": "şifahi ünsiyyət bacarıqları" },
    { "num": 2, "text": "yazılı ünsiyyət bacarıqları" }
  ],
  "answers": [
    { "label": "A", "value": [1, 2, 4] },
    { "label": "B", "value": [1, 3, 4] }
  ],
  "correct_answer": "A",
  "metadata": {
    "difficulty": "medium",
    "category": "Soft Skills"
  }
}
```

### Question Types

| Type | Description | Answer Format |
|------|-------------|---------------|
| `single` | Pick one answer (A/B/C/D) | String: `"A"` |
| `multiple` | Pick multiple answers | Array: `["A", "C"]` |
| `combination` | Pick which numbered statements are correct | String: `"A"` (where A = [1,2,4]) |
| `true_false` | Two options only | String: `"true"` or `"false"` |

### ID Generation
- **Method**: UUID v4 (not hash of question text)
- **Why**: Allows editing question text without breaking tracking

---

## Quiz Sharing Model

Sharing is **direct link only**—no public directory.

| Scenario | Behavior |
|----------|----------|
| Creator shares link | Anyone with link can take the quiz |
| Guest takes quiz | Results shown immediately, not saved |
| Signed-in user takes quiz | Results saved to their Mistakes/Stats |
| Link expires? | Never (unless creator deletes quiz) |

**No account required to take a shared quiz.**

---

## Indexes

| Table | Index | Fields | Purpose |
|-------|-------|--------|---------|
| quizzes | by_creator | creatorId | List user's quizzes |
| leaderboard | by_quiz_score | quizId, score, duration | Fast sorted leaderboards |
| userMistakes | by_user | clerkId | Get user's mistakes |
| subscriptions | by_user | userId | Check subscription status |
