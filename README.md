# TDC Matchmaker AI

An AI-powered matchmaking operations platform built for **The Date Crew** — a professional matchmaking agency. Helps matchmakers manage 100+ clients, evaluate compatibility, run matches, and communicate with clients using AI.

**[Live Demo](https://ai-matchmaker-eight.vercel.app)** &nbsp;·&nbsp; **[GitHub](https://github.com/Aditya0105singh/AI-matchmaker)**

```
Login:  matchmaker  /  tdc2024
```

---

## Overview

Most matchmaking agencies run on spreadsheets and WhatsApp. This platform replaces that with a proper internal CRM — built around the actual workflows a matchmaker uses daily: reviewing profiles, running compatibility checks, drafting introductions, and tracking client journeys.

The goal was not to build a dating app. The goal was to build **operational software** that a professional matchmaker would actually pay for.

---

## Features

### Dashboard
- KPI cards — total clients, active pipeline, matched, success rate, new this week
- Full client table with sortable columns (readiness score, match count, last contact)
- Priority alert panel — flags inactive clients, unmatched actives, incomplete profiles
- Pipeline breakdown by status

### Client Management
- 100 managed clients (70M + 30F) with realistic Indian profiles
- Sortable, filterable data table with 10 columns
- Status segmentation: Active · Paused · Matched · Onboarding · Churned

### Client Profile (6 Tabs)
| Tab | Content |
|---|---|
| Overview | Personal, career, education, contact details |
| Family | Religion, caste, family background, lifestyle, manglik status |
| Preferences | Partner age / height / income range, religion and city preference |
| Notes | Call, meeting, and feedback notes with timestamped timeline |
| Matches | Top 20 ranked candidates with comparison mode (up to 3 at once) |
| AI Insights | One-click profile summary + relationship readiness breakdown |

### Matching Engine

A 9-dimension weighted compatibility scoring system (weights sum to 100):

| Dimension | Weight | Notes |
|---|---|---|
| Kids Preference | 20% | Highest — dealbreaker if misaligned |
| Lifestyle Compatibility | 15% | Diet, smoking, drinking, fitness aggregated |
| Location Compatibility | 10% | Same city > same state > open to relocate |
| Education Compatibility | 10% | Premier institution bonus |
| Religion Alignment | 10% | Caste sub-score included |
| Career Compatibility | 10% | Gender-specific logic |
| Family Values | 10% | Traditional / moderate / liberal scale |
| Personality Fit | 10% | MBTI compatibility map + introvert/extrovert distance |
| Income Expectations | 5% | Soft gender-specific preference |

**Gender-specific logic:**
- **Male clients** → soft preference for younger, shorter, lower-income partners with aligned kids views
- **Female clients** → career fit, income floor, and relocation flexibility weighted higher
- No hard filters — all scoring is weighted to preserve match diversity

Each match returns: total score, confidence score, compatibility tags, and a radar chart breakdown.

### AI Features (Groq · llama-3.3-70b-versatile)

| Feature | Description |
|---|---|
| Match Explanation | Structured analysis: summary, strengths, concerns, conversation starters |
| Profile Summary | One-click matchmaker brief: background, values, partner preferences |
| AI Copilot | Floating chatbot, 5 suggestion chips, full pipeline context awareness |
| Intro Email | Personalised match introduction email generated with one click |

All AI endpoints include intelligent fallback responses when no API key is configured — the app is fully usable without an API key.

### Match Actions
- Send Match modal with AI-generated introduction email
- Compatibility radar chart (Recharts)
- Compare mode — side-by-side dimension breakdown for up to 3 candidates
- Sent-match status tracked per client with toast notifications

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Zustand with localStorage persistence |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Charts | Recharts |
| Animations | Framer Motion |
| Hosting | Vercel |

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/Aditya0105singh/AI-matchmaker.git
cd AI-matchmaker
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**

Create `.env.local` in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com) → No credit card required.

**4. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with `matchmaker` / `tdc2024`.

---

## Project Structure

```
tdc-matchmaker-ai/
├── app/
│   ├── (app)/
│   │   ├── dashboard/          # Operations dashboard page
│   │   ├── clients/
│   │   │   ├── page.tsx        # Client list (sortable table)
│   │   │   └── [id]/page.tsx   # Client profile (6 tabs)
│   │   └── layout.tsx          # Auth guard + shared layout
│   ├── api/ai/
│   │   ├── chat/               # AI Copilot endpoint
│   │   ├── match-explanation/  # Match analysis endpoint
│   │   └── profile-summary/    # Profile summary endpoint
│   └── login/
│
├── components/
│   ├── copilot/                # Floating AI chatbot widget
│   ├── layout/                 # Sidebar navigation
│   ├── matching/               # Match cards, radar chart, send modal
│   ├── notes/                  # Notes timeline
│   ├── profile/                # Tab content (overview, family, preferences)
│   └── ui/                     # Design system (Button, Badge, Card, Input…)
│
├── lib/
│   ├── matching-engine.ts      # 9-dimension weighted scoring algorithm
│   ├── seed-data.ts            # 300 realistic Indian profiles
│   ├── openai-client.ts        # Groq client (OpenAI-compatible SDK)
│   └── utils.ts
│
├── store/
│   └── app-store.ts            # Zustand global store
│
└── types/
    └── index.ts                # Full domain model (Profile, MatchScore, Note…)
```

---

## Data Model

**300 total profiles** generated with realistic Indian data:

| Category | Count | Purpose |
|---|---|---|
| Male clients | 70 | Managed by matchmaker, shown in dashboard |
| Female clients | 30 | Managed by matchmaker, shown in dashboard |
| Female candidates | 100 | Match pool for male clients |
| Male candidates | 100 | Match pool for female clients |

Profile fields include: personal details, education, career, family background, religion/caste, lifestyle (diet/smoking/drinking/fitness), personality type (MBTI), partner preferences, and matchmaker metadata.

Notes and sent-match state persist to `localStorage`. A production version would use PostgreSQL + NextAuth.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `GROQ_API_KEY = your_key`
4. Click Deploy

---

## Design Notes

**Why Groq over OpenAI?**
Groq's Llama inference is ~10× faster for chat workloads and the free tier covers this use case. The Groq API is OpenAI-compatible — same SDK, different `baseURL`.

**Why weighted scoring over hard filters?**
Hard filters (e.g. "must be same religion") leave users with zero results and frustrate them. A weighted scoring system lets every candidate get a score and lets the matchmaker make the final judgement call. This is how premium agencies actually operate.

**Why Zustand over Redux / Context?**
Much lighter for a single internal tool. The `persist` middleware handles localStorage in one line of config. No boilerplate.

---

## Assignment Context

Built as a take-home project for The Date Crew's Full Stack Developer Intern role.

**Requirements covered:**
- ✅ Login, dashboard, client list, detailed profile view
- ✅ 100 managed clients + 200-profile matching pool
- ✅ Gender-specific matching logic with 9 weighted dimensions
- ✅ AI match explanations, profile summaries, copilot chatbot
- ✅ Send Match flow with AI-generated personalised intro emails
- ✅ Compatibility radar chart, notes timeline, match comparison mode
- ✅ Live hosted on Vercel

---

*Built by Aditya Singh*
