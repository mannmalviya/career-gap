# Career-Gap — Architecture

## Tech stack

| Layer | Choice | Status |
|---|---|---|
| Hosting | Vercel | decided |
| Database | Supabase (managed Postgres) | decided |
| Auth | Clerk | decided |
| Frontend | Next.js 15 (App Router) + TypeScript | tentative — confirm |
| Styling | Tailwind + shadcn/ui | tentative — confirm |
| ORM / migrations | Drizzle ORM + Drizzle Kit | tentative — confirm |
| LLM | Anthropic Claude SDK, default `claude-sonnet-4-6`, prompt caching on | tentative — confirm |
| File storage | Supabase Storage | tentative — confirm |

## System diagram

```
  Browser
    │
    ▼
  Clerk (sign-in/up, session)
    │
    ▼
  Next.js on Vercel
    ├─ RSC + route handlers + server actions
    ├─ middleware.ts protects /app/*
    └─ all DB / LLM / storage I/O happens server-side
        │
        ├──▶ Supabase Postgres (via Drizzle, plain pg connection)
        ├──▶ Anthropic Claude API (lib/llm.ts wrapper)
        └──▶ Supabase Storage (resume PDFs, exported plans)

  [future] Auto-Applier Worker
    └── plugs in here; talks to the same DB; runtime TBD (decision #3)
```

## Data model sketch

Initial tables (Drizzle pseudo-schema; final decision on `users` table per open decision #5):

- `users` — `clerk_user_id` (PK, text), `email`, `created_at`. *Optional* — could be omitted entirely and `clerk_user_id` referenced directly on every row.
- `resumes` — `id`, `clerk_user_id`, `version`, `storage_key`, `parsed_text`, `parsed_struct (jsonb)`, `created_at`.
- `target_jobs` — `id`, `clerk_user_id`, `source_url`, `raw_text`, `parsed_struct (jsonb)`, `created_at`.
- `analyses` — `id`, `clerk_user_id`, `resume_id`, `target_job_id`, `gap_report (jsonb)`, `roadmap (jsonb)`, `hours_per_day`, `created_at`, `updated_at`.
- `applications` — `id`, `clerk_user_id`, `target_job_id`, `status (enum)`, `applied_at`, `last_status_at`, `notes`. *(v1+)*

All user-owned rows include `clerk_user_id` and are queried with `WHERE clerk_user_id = ?` at the query layer.

## Auth flow

1. Clerk handles sign-in / sign-up / session entirely (hosted UI or `<SignIn />` components).
2. `middleware.ts` uses `clerkMiddleware()` to gate `/app/*` and `/api/app/*`.
3. Server-side, every action calls `auth()` from `@clerk/nextjs/server` and reads `userId`.
4. **Never trust a client-supplied user id.** Every DB query authorizes by the server-derived `userId`.
5. No Supabase Row-Level Security — Postgres has no view of Clerk sessions; auth is enforced in the Next.js layer.

## LLM usage patterns

- All calls go through `lib/llm.ts` (one wrapper, one place to swap models / add logging / inject caching headers).
- **Prompt caching** is enabled on:
  - the user's parsed resume (large, stable, reused across many analyses for that user)
  - the parsed target job (reused if the user re-runs analysis with different parameters or a new resume version)
- The variable parts of the prompt (instructions, hours/day, current focus) stay outside the cache.
- Token-budget guardrail: cap analysis-prompt input tokens; truncate the resume to the most recent N positions if it exceeds.
- Stream responses to the UI for the gap report + roadmap so the user sees progress.

## Repo layout (proposed)

```
career-gap/
├── app/                  Next.js App Router routes
│   ├── (marketing)/      Landing / unauthenticated pages
│   ├── (app)/            Protected app surface
│   │   ├── analyses/
│   │   ├── applications/   (v1+)
│   │   └── settings/
│   └── api/              Route handlers
├── lib/
│   ├── llm.ts            Anthropic wrapper (caching, model defaults)
│   ├── auth.ts           Clerk helpers
│   └── jobs/             Job-source parsers (URL fetch, ATS adapters)
├── db/
│   ├── schema.ts         Drizzle schema
│   ├── client.ts
│   └── migrations/
├── prompts/              Versioned prompt templates
├── docs/                 Product / architecture / roadmap / decisions
└── CLAUDE.md             Pointer + thin conventions
```
