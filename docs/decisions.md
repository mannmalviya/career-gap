# Career-Gap — Open Design Decisions

ADR-lite. Each entry: question, why it's open, options with trade-offs, status. Append new decisions as they come up; don't delete resolved ones — mark them `decided on YYYY-MM-DD` so the rationale is preserved.

---

## 1. Auto-Applier browser automation approach

**Why open:** This is the central technical choice of the entire product. It cascades into hosting cost, captcha UX, the realism of the "local-only desktop variant" promise, and onboarding friction.

**Options:**

- **Browser extension (Chrome / Edge).** Agent runs as a content-script + side-panel UI inside the user's already-logged-in browser. Privacy-strong (credentials never leave the device), captcha is native, manual-approve UX is native. Trade-off: extension store review, Chrome-first means deferred Safari/Firefox, harder telemetry.
- **Cloud headless via Browserbase / Stagehand.** Hosted Chromium with LLM-driven control. Slick demos, scalable. Trade-off: paid per session, captcha needs session-video streaming back to the user, "local-only" desktop story becomes a separate product.
- **Local Playwright on user machine.** Spawn a headed Playwright locally. Best privacy story. Trade-off: requires installation step at sign-up — bad onboarding for a web app.

**Status:** open. Decide before starting v2.

---

## 2. Job-discovery search methodology

**Why open:** Once postings are flowing in (v4), "find me relevant jobs" needs an actual algorithm. The choice ties to what we already index (resume embeddings).

**Options:**

- Keyword + structured filters (location, comp, level).
- Vector search over postings using pgvector (Supabase supports it natively).
- LLM-as-ranker over a candidate set retrieved by 1 or 2.
- Hybrid: keyword pre-filter → vector rank → LLM re-rank top N.

**Status:** open. Revisit when v4 is on deck.

---

## 3. Async / long-running work runtime

**Why open:** Career-gap analysis fits in a single Vercel function call. Auto-applier sessions and inbox watchers do not — they're minutes-to-hours long.

**Options:**

- Vercel functions with streaming + chained invocations (cheapest, hits timeout limits).
- Managed queue: Trigger.dev or Inngest (event-driven, retry semantics, observability built in).
- Separate worker process on Fly.io / Railway (most control, more ops).

**Status:** open. Revisit when v2 is on deck.

---

## 4. Inbox-watcher feature ("Open Claw")

**Why open:** Reading user email is high-value (auto-update application statuses) but a major OAuth + privacy + UX surface. Likely needs a dedicated design pass and probably its own privacy disclosure.

**Status:** open, deferred to `[future]` in the roadmap.

---

## 5. Clerk ↔ Supabase user-id linkage

**Why open:** Clerk owns user identity; our DB needs to reference it. Two clean approaches.

**Options:**

- **No `users` table.** Every user-owned row carries a `clerk_user_id` text column. Simplest. Lose the ability to JOIN locally for analytics; lose a place to hang app-owned user fields.
- **Thin local `users` table mirrored from Clerk.** Webhook on Clerk user create / update keeps it in sync. Enables joins, gives a place for app-owned fields (preferences, default hours-per-day, etc.).

**Status:** open. Decide during v0 implementation, the moment you write the first user-owned table. Recommendation if not specified: **thin local `users` table** — the cost is one webhook handler and the upside compounds.
