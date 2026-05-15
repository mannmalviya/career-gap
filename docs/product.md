# Career-Gap - Product Spec

## Vision

Career-Gap helps you close the gap between where you are and the job you want, then helps an agent apply for you. You paste a target job, get a personalized roadmap of what to learn or build, and (later) hand off the boilerplate of applying to an AI agent that fills forms while you sleep.

## User stories

1. As a user, I want to see visually exactly what I need to do to be ready for the job I'm applying for.
2. As a user, I want an AI agent to autonomously apply for jobs for me - with a supervised mode (manual accepts) and a fully autonomous mode.
3. As a user, I want to keep track of all my previous analyses and how far along I am on each one.
4. As a user, I want stats on the jobs I've applied to: still open vs accepted vs rejected vs ghosted.

## Feature areas

### Career-Gap Analyzer

- Upload or paste a resume, paste a target job (URL or description). `[v0]`
- Side-by-side gap report: skills you have, skills the role wants, the delta. `[v0]`
- Concrete roadmap: things to learn, projects to build, with time estimates based on user-provided hours/day. `[v0]`
- Save analyses to a list; revisit and update progress. `[v0]`
- Auto-pull job content from a URL (server-side fetch + extract). `[v1]`
- Pull additional signal from LinkedIn / portfolio URL the user provides. `[v2]`

### Auto-Applier Agent

- Fills boilerplate application fields from a stored profile + resume. `[v2]`
- Supervised mode: agent pauses for approval after each field. `[v2]`
- Hybrid mode: per-field policy - some fields auto-fill, others ask. `[v3]`
- Fully auto mode: applies in the background; only pauses for "Danger Zone" fields it's unsure about. `[v3]`
- Captcha handoff - when a captcha appears, the user is pinged to solve it as a human. `[v3]`
- Role inference: agent reads your resume and proposes roles to apply for. `[v3]`
- Onboarding survey: alternate path to tell the agent what roles you want. `[v3]`
- Speech-to-text companion while the agent is busy applying. `[future]`

### Dashboard & Tracking

- Homepage shows applications the agent (or user) has submitted. `[v1]`
- Per-application status: applied / interviewing / accepted / rejected / ghosted. `[v1]`
- Aggregate stats: applied / acceptance rate / rejection rate / ghosted rate, over time. `[v1]`
- Per-application skill match score and competition signal. `[v2]`
- Inbox watcher ("Open Claw") that updates statuses by reading recruiter emails. `[future]`

## Out of scope (explicit)

- LinkedIn scraping or LinkedIn auto-apply (ToS / account-ban risk).
- Resume *writing* - Career-Gap analyzes resumes; it doesn't generate them.
- Interview prep, salary negotiation, or coaching content.
- Multi-user / team accounts. Single-user only.

## Glossary

- **Career gap** - the delta between a user's current skills/experience and what a target job requires.
- **Roadmap** - the ordered, time-estimated learning + project plan that closes a career gap for one job.
- **Hybrid manual mode** - Auto-Applier mode where some fields auto-fill and others require user approval, per a per-field policy.
- **Danger Zone field** - an application field the agent is not confident enough to fill autonomously (e.g., free-text "why do you want this role"); always escalates to the user even in fully-auto mode.
