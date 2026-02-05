# Setup Guide

> Complete development environment setup from scratch
> **Last Updated**: 2026-02-04

---

## Prerequisites

Before starting, ensure you have:

| Requirement | Version | How to Check |
|-------------|---------|--------------|
| **Node.js** | 18.x or higher | `node --version` |
| **npm** | 9.x or higher | `npm --version` |
| **Git** | 2.x or higher | `git --version` |
| **A code editor** | VS Code recommended | - |

### Installing Node.js

If you don't have Node.js installed:

**macOS** (using Homebrew):
```bash
brew install node
```

**Windows**:
Download from [nodejs.org](https://nodejs.org) and run the installer

**Linux**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Step 1: Clone & Install

### 1.1 Clone the Repository

```bash
git clone <repository-url>
cd QuizCreator
```

### 1.2 Install Dependencies

```bash
npm install
```

This will install ~250 packages including:
- Next.js 16
- React 19
- Convex
- Clerk
- Tailwind CSS
- shadcn/ui components

**Expected output:**
```
added 247 packages, and audited 248 packages in 15s
```

---

## Step 2: Environment Variables Setup

You need to configure environment variables for 3 external services:
1. **Convex** (database)
2. **Clerk** (authentication)
3. **Google AI** (optional, for AI features)

### 2.1 Create Environment File

```bash
cp .env.example .env.local
```

### 2.2 Set Up Convex

**2.2.1 Install Convex CLI**
```bash
npm install -g convex
```

**2.2.2 Initialize Convex Project**
```bash
npx convex dev
```

This will:
- Create a new Convex project (or connect to existing)
- Open browser for authentication
- Generate `NEXT_PUBLIC_CONVEX_URL`

**2.2.3 Add Convex URL to .env.local**

After initialization, you'll see:
```
Your Convex deployment is running at:
https://<your-project>.convex.cloud
```

Copy this to `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud
```

**Verification:**
```bash
npx convex status
```
Should show: `✔ Project is ready`

### 2.3 Set Up Clerk

**2.3.1 Create Clerk Account**

1. Go to [clerk.com](https://clerk.com)
2. Sign up (free tier available)
3. Create a new application
4. Choose "Next.js" as the framework

**2.3.2 Get API Keys**

In Clerk Dashboard → API Keys:

Copy these values to `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**2.3.3 Configure Clerk Redirect URLs**

In Clerk Dashboard → Configure → URLs:

**Development:**
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

**Production:**
- Sign-in URL: `https://yourdomain.com/sign-in`
- (Same for others with your domain)

**2.3.4 Enable OAuth (Optional)**

For Google sign-in:
1. Clerk Dashboard → User & Authentication → Social Connections
2. Enable Google
3. Configure OAuth credentials (follow Clerk instructions)

**Verification:**
Run the app and try signing up/in. Should work without errors.

### 2.4 Set Up Google AI (Optional)

**Note:** AI features work without this, but will return 503 errors.

**2.4.1 Get Google AI API Key**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

**2.4.2 Add to .env.local**

```bash
GOOGLE_AI_API_KEY=AIza...
```

**2.4.3 Enable Billing (Optional)**

Free tier: 60 requests/minute, generous monthly quota
Paid tier: Required for higher limits

**Verification:**
Test AI generation in the app. Should generate questions.

### 2.5 Final Environment File

Your `.env.local` should look like:

```bash
# Required - Convex
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud

# Required - Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional - Google AI (for quiz generation)
GOOGLE_AI_API_KEY=AIza...

# Optional - Stripe (for payments - Phase 5)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Step 3: Run Development Server

### 3.1 Start Convex Dev Server

In one terminal:
```bash
npx convex dev
```

This watches for changes to `convex/` folder and deploys automatically.

**Expected output:**
```
✔ Convex dev server is running
✔ Project is ready
Watching for changes...
```

### 3.2 Start Next.js Dev Server

In another terminal:
```bash
npm run dev
```

**Expected output:**
```
> my-v0-project@0.2.0 dev
> next dev

  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.4s
```

### 3.3 Verify Setup

Open [http://localhost:3000](http://localhost:3000) in your browser.

**You should see:**
- Landing page loads
- "Sign In" button works
- Can create account
- Dashboard loads after sign-in

---

## Step 4: Post-Setup Verification

### 4.1 Check All Services

Run this verification checklist:

| Check | How | Expected Result |
|-------|-----|-----------------|
| **Landing page** | Visit `/` | Loads without errors |
| **Sign up** | Click "Get Started" | Creates account, redirects to dashboard |
| **Dashboard** | After sign-in | Shows "Create Quiz" button |
| **Create quiz** | Click "Create Quiz" → "AI Generate" | Opens AI generator modal |
| **AI generation** | Paste text, click generate | Returns questions (if GOOGLE_AI_API_KEY set) |
| **Save quiz** | Click "Use These Questions" | Quiz appears in library |
| **Database** | Check Convex dashboard | New quiz record exists |

### 4.2 Test Organization Features

1. Go to dashboard
2. Click "Create Organization"
3. Fill in name and slug
4. Verify org is created
5. Copy join code
6. Test joining from another account

### 4.3 Test Quiz Taking

1. Create a quiz
2. Click "Share" to get link
3. Open link in incognito window
4. Take quiz as guest
5. Verify results show

---

## Common Setup Issues

### Issue: "Cannot find module 'convex'"

**Solution:**
```bash
npm install
# or
npm install convex
```

### Issue: "Clerk: Missing publishable key"

**Solution:**
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Restart dev server after adding env vars

### Issue: "Convex: Unable to connect"

**Solution:**
```bash
# Check if convex dev is running
npx convex status

# If not, start it
npx convex dev

# Verify URL in .env.local matches convex dashboard
```

### Issue: "AI generation returns 503"

**Solution:**
- Check `GOOGLE_AI_API_KEY` is set
- Verify key is valid in Google AI Studio
- Check Google AI quota not exceeded

### Issue: "Module not found: Can't resolve '@clerk/nextjs'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- --port 3001
```

---

## Development Workflow

### Daily Development

**Terminal 1** (Convex):
```bash
npx convex dev
# Keep running, auto-deploys changes
```

**Terminal 2** (Next.js):
```bash
npm run dev
# Keep running, hot-reload on changes
```

**Browser:**
- Open http://localhost:3000
- Use Chrome DevTools for debugging

### Making Changes

| What You're Changing | Files to Edit | Auto-reload? |
|---------------------|---------------|--------------|
| **UI Components** | `components/*.tsx` | Yes (Next.js) |
| **Pages** | `app/**/page.tsx` | Yes (Next.js) |
| **API Routes** | `app/api/**/route.ts` | Yes (Next.js) |
| **Database Functions** | `convex/*.ts` | Yes (Convex) |
| **Schema** | `convex/schema.ts` | Yes (Convex) |
| **Environment** | `.env.local` | No (restart required) |

### Database Migrations

Convex handles migrations automatically when you change `schema.ts`.

**To add a new table:**
1. Edit `convex/schema.ts`
2. Save file
3. Convex auto-deploys
4. New table available immediately

**To backfill data:**
```bash
npx convex run migrations/backfillNewField
```

---

## Production Setup

### Build for Production

```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (8/8)
✓ Finalizing page optimization
```

### Environment Variables for Production

Copy `.env.local` to production environment (Vercel, etc.):

**Required:**
- `NEXT_PUBLIC_CONVEX_URL` (production deployment URL)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production)
- `CLERK_SECRET_KEY` (production)

**Optional:**
- `GOOGLE_AI_API_KEY` (same as dev)
- `STRIPE_SECRET_KEY` (for payments)

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

See [09-DEPLOYMENT.md](./09-DEPLOYMENT.md) for detailed production deployment.

---

## Next Steps

After setup is complete:

1. **Read the Architecture** → [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)
2. **Understand the Database** → [04-DATABASE.md](./04-DATABASE.md)
3. **Explore Features** → [08-FEATURES/](./08-FEATURES/)
4. **Check API Reference** → [05-API-ROUTES.md](./05-API-ROUTES.md)

---

*Setup complete! You're ready to develop. If you encounter issues not covered here, check [11-TROUBLESHOOTING.md](./11-TROUBLESHOOTING.md).*
