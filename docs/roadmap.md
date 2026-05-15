# Career-Gap - Roadmap

Each phase ends with something demo-able end-to-end.

## v0 - App shell + Career-Gap Analyzer

- Clerk sign-in / sign-up, protected `/app/*` routes, sign-out.
- User profile page (read-only Clerk profile + a few app-owned preferences).
- Signed-in dashboard chrome (nav, layout, empty states).
- Paste-resume + paste-job → gap report + roadmap.
- Save analyses to a list; revisit one.

**Verification:** a brand-new visitor can sign up, paste two real artifacts, and see a coherent roadmap in under 60s.

## v1 - Application Tracker

- Manually add an application (link a `target_job` to an `applications` row).
- Status field: applied / interviewing / accepted / rejected / ghosted.
- Basic stats page: counts and rates over time.
- Auto-pull job content from a URL (server-side fetch + extract).

**Verification:** add 5 applications, change statuses, see correct counts.

## v2 - Auto-Applier (supervised mode)  *(4–6 weeks)*

- **Resolve decision #1 (browser automation approach) first.**
- Build the field-by-field approval UX.
- Fill boilerplate fields from stored profile + resume.
- Per-application skill match score.

**Verification:** agent completes one real Greenhouse and one real Lever application end-to-end with a human approving each field.

## v3 - Auto-Applier (hybrid + fully auto)

- Per-field auto/manual policy.
- "Danger Zone" heuristic (free-text fields, anything legally sensitive, anything below a confidence threshold).
- Captcha handoff (notification → human solves → agent resumes).
- Background applies queue.
- Role inference from resume; onboarding survey alternate.

**Verification:** agent applies to 10 jobs overnight in fully-auto mode; user reviews and tweaks 0–2 of them in the morning.

## v4 - Job discovery via ATS APIs

- Adapters for Greenhouse, Lever, Ashby, Workable public job-board APIs.
- Resume embedding + pgvector (Supabase) ranking against pulled postings.
- "Find me jobs that fit" surface.

**Verification:** given a resume, system returns a ranked list of 50+ relevant openings from real companies, with no manual seeding.

## future

- Tauri desktop app (data stays local).
- Inbox watcher ("Open Claw") for status auto-updates.
- Speech-to-text companion during agent sessions.
