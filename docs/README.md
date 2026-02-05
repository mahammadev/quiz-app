# QuizCreator Documentation

> Complete technical documentation for the QuizCreator platform
> **Last Updated**: 2026-02-04

---

## 📚 Documentation Index

### 🚀 Getting Started
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) | What this app is, value prop, target users | 5 min |
| [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) | System design, data flow, tech decisions | 10 min |
| [02-SETUP.md](./02-SETUP.md) | Complete dev environment setup | 15 min |
| [03-ENVIRONMENT.md](./03-ENVIRONMENT.md) | All environment variables explained | 5 min |

### 💻 Technical Reference
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [04-DATABASE.md](./04-DATABASE.md) | Convex schema, relationships, queries | 15 min |
| [05-API-ROUTES.md](./05-API-ROUTES.md) | All API endpoints with examples | 10 min |
| [06-COMPONENTS.md](./06-COMPONENTS.md) | Component patterns and key components | 10 min |

### 🤖 AI Engine (Updates Monthly)
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [07-AI-ENGINE/01-README.md](./07-AI-ENGINE/01-README.md) | AI overview and quick reference | 3 min |
| [07-AI-ENGINE/02-MODELS.md](./07-AI-ENGINE/02-MODELS.md) | Gemini models, configs, pricing | 5 min |
| [07-AI-ENGINE/03-PROMPTS.md](./07-AI-ENGINE/03-PROMPTS.md) | All prompts used in the system | 5 min |
| [07-AI-ENGINE/04-CHUNKING.md](./07-AI-ENGINE/04-CHUNKING.md) | PDF processing algorithm | 8 min |
| [07-AI-ENGINE/05-ERROR-HANDLING.md](./07-AI-ENGINE/05-ERROR-HANDLING.md) | Fallback flows and retries | 5 min |
| [07-AI-ENGINE/06-CHANGELOG.md](./07-AI-ENGINE/06-CHANGELOG.md) | **Track every AI update (dated)** | Ongoing |

### 🎯 Feature Documentation
| Document | Purpose | Status |
|----------|---------|--------|
| [08-FEATURES/01-AUTHENTICATION.md](./08-FEATURES/01-AUTHENTICATION.md) | Clerk integration | ✅ Complete |
| [08-FEATURES/02-ORGANIZATIONS.md](./08-FEATURES/02-ORGANIZATIONS.md) | Multi-user org system | ✅ Complete |
| [08-FEATURES/03-QUIZZES.md](./08-FEATURES/03-QUIZZES.md) | Quiz creation and management | ✅ Complete |
| [08-FEATURES/04-EXAM-SESSIONS.md](./08-FEATURES/04-EXAM-SESSIONS.md) | Live quiz sessions | ✅ Complete |
| [08-FEATURES/05-GAMIFICATION.md](./08-FEATURES/05-GAMIFICATION.md) | XP, levels, badges | ✅ Complete |
| [08-FEATURES/06-PAYMENTS.md](./08-FEATURES/06-PAYMENTS.md) | Stripe integration | ⏸️ Planned |

### 🛠️ Operations
| Document | Purpose | Read Time |
|----------|---------|-----------|
| [09-DEPLOYMENT.md](./09-DEPLOYMENT.md) | Production deployment guide | 10 min |
| [10-TESTING.md](./10-TESTING.md) | Testing strategy and examples | 8 min |
| [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md) | Common errors and solutions | 10 min |
| [99-CHANGELOG.md](./99-CHANGELOG.md) | Project-wide changes | Ongoing |

---

## 🎯 Who Should Read What?

### New Developer
1. Start with [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md)
2. Read [02-SETUP.md](./02-SETUP.md) to get running
3. Reference [03-ENVIRONMENT.md](./03-ENVIRONMENT.md) for env vars
4. Skim [04-DATABASE.md](./04-DATABASE.md) to understand data model

### Returning Developer
- Check [99-CHANGELOG.md](./99-CHANGELOG.md) for recent changes
- Reference specific feature docs as needed
- Review [07-AI-ENGINE/06-CHANGELOG.md](./07-AI-ENGINE/06-CHANGELOG.md) for AI updates

### Debugging
1. Check [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md) first
2. Review relevant feature documentation
3. Check [05-API-ROUTES.md](./05-API-ROUTES.md) for API behavior
4. Review [07-AI-ENGINE/05-ERROR-HANDLING.md](./07-AI-ENGINE/05-ERROR-HANDLING.md) for AI issues

---

## 📝 How to Update This Documentation

### Adding New Features
1. Create feature doc in `08-FEATURES/`
2. Update this README with link
3. Update [99-CHANGELOG.md](./99-CHANGELOG.md)
4. Cross-reference related docs

### Updating AI Documentation (Monthly)
1. Update [07-AI-ENGINE/06-CHANGELOG.md](./07-AI-ENGINE/06-CHANGELOG.md) with dated entry
2. Update relevant model/prompt files
3. Note breaking changes and migration steps

### Style Guide
- Use clear headers (## for sections, ### for subsections)
- Include code examples in fenced blocks
- Add tables for structured data
- Use Mermaid for diagrams
- Keep lines under 100 characters
- Date all significant changes

---

## 🔗 External References

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Google Gemini API](https://ai.google.dev/docs)

---

*This documentation is the single source of truth for QuizCreator technical details.*
