# TDC Matchmaker AI — Deployment Guide

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Add your OpenAI API key to .env.local
npm run dev
```

Open http://localhost:3000 — you'll be redirected to /login.

**Demo credentials:**
- Username: `matchmaker`
- Password: `tdc2024`

## Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: TDC Matchmaker AI"
git remote add origin https://github.com/YOUR_USERNAME/tdc-matchmaker-ai.git
git push -u origin main
```

2. Go to vercel.com → New Project → Import your repo

3. Add environment variable in Vercel dashboard:
   - `OPENAI_API_KEY` = your OpenAI API key

4. Deploy! The app works without an OpenAI key too — AI features return intelligent fallback responses.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Framer Motion
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts (radar chart for compatibility visualization)
- **AI**: OpenAI GPT-4o (with graceful fallbacks)
- **UI**: Custom components built on Radix UI primitives
- **Hosting**: Vercel

## Project Write-up

### Tech Choices
Built with Next.js 16 App Router for seamless SSR/CSR hybrid rendering, TypeScript for type safety across the entire domain model, and Tailwind CSS v4 for a rapid, consistent dark design system. Zustand with localStorage persistence handles global state across the app — matching results are computed once and cached, keeping the UX snappy. Framer Motion drives all transitions, and Recharts powers the compatibility radar visualization.

### Matching Logic
The engine uses a 9-dimension weighted scoring system (total weight = 100) inspired by research into Shaadi.com, BharatMatrimony, Jeevansathi, Hinge, and Bumble:

- **Kids Preference (20%)** — highest weight; a yes/no mismatch is a genuine dealbreaker
- **Lifestyle Compatibility (15%)** — diet, smoking, drinking, and fitness aggregated into one score
- **Location Compatibility (10%)** — same city > same state > open to relocate
- **Education (10%)** — premier institution match bonus + partner preference alignment
- **Religion Alignment (10%)** — same religion + caste gets max score; "Any" preference is respected
- **Career Compatibility (10%)** — gender-specific logic: females prioritize career fit; males use experience gap
- **Family Values (10%)** — traditional/moderate/liberal scale with neighbor-score bonuses
- **Personality Fit (10%)** — MBTI compatibility map + introvert/extrovert distance scoring
- **Income Expectations (5%)** — gender-specific logic reflecting traditional preferences without hard filtering

For male clients: matches female candidates who are younger, shorter, earn comparably, and share kids preferences — using soft scoring, not hard filters.

For female clients: emphasizes career compatibility, education alignment, income floor, and relocation flexibility.

### AI Integration
Three AI-powered endpoints using OpenAI GPT-4o:
1. **Match Explanation** — given two profiles + score, generates summary/strengths/concerns/conversation starters in structured JSON
2. **Profile Summary** — one-click matchmaker briefing covering professional background, lifestyle, values, and what they're looking for
3. **AI Copilot Chat** — floating chatbot with full dashboard context (active client count, pipeline stats, current client being viewed) that can explain matches, filter candidates, detect at-risk clients, and draft personalized intro emails

All three endpoints have intelligent fallback responses when no OpenAI key is provided.

### Assumptions
- Data is stored in-memory (seeded on load) + localStorage for notes/sent matches; a production system would use PostgreSQL or Firebase
- 125 dummy profiles (25 managed clients + 100-person match pool per gender) are generated deterministically using a seeded random system with realistic Indian names, cities, colleges, and companies
- Authentication is simplified (username/password in Zustand store) — production would use NextAuth or Clerk
- The "Send Match" button triggers a mock email (toast notification + activity log) rather than a real SMTP call
