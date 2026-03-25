# TOP 100 Aerospace & Aviation

Reputation-weighted professional index for women in aerospace and aviation. Institutional record, not a social network.

**MVP Launch: May 20, 2026**

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Base44 managed backend |
| Data layer | Base44 SDK (`entities/`, `functions/`) |
| Auth | Base44 managed auth |
| Styling | Tailwind only |

## Prerequisites

- Node.js 18+
- npm 9+
- Access to the Base44 project (required for backend/data — contact team)

## Local Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env

# Start dev server
npm run dev
```

App runs at `http://localhost:5173` by default.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_WORLDMONITOR_URL` | Yes (GlobalIntelligence page) | Vercel URL of the deployed World Monitor app |

Set these in `.env` locally and in your Vercel project settings for production.

## Key Routes

| Route | Description |
|---|---|
| `/profiles/:id` | Honoree profile (role-based view) |
| `/feed` | Reputation-weighted signal feed |
| `/missions/:id` | Mission Room |
| `/projects/:id` | Project Container |
| `/sponsors/:sponsor_id` | Sponsor patron-of-record page |
| `/global-intelligence` | Live geopolitical intelligence dashboard |

Legacy routes (`/Profile`, `/PublicProfile`, `/Nominee`) are being deprecated — see PLATFORM-66.

## Project Structure

```
src/
  pages/          ← Route-level views
  components/
    epics/        ← Feature components organized by Jira epic
    capabilities/ ← Shared cross-cutting components
  api/            ← Base44 SDK calls
  hooks/          ← Shared stateful logic
entities/         ← Data model definitions
functions/        ← Serverless backend functions
docs/plans/       ← Architecture decisions and implementation plans
scripts/          ← Automation scripts (migration, barrel generation)
```

## Build

```bash
npm run build     # Production build
npm run preview   # Preview production build locally
```

## For AI Agents

Read `CLAUDE.md` before touching any code. It contains architecture rules, the Jira harness workflow, epic dependency chain, and the definition of done.
