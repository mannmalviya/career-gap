import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Landing() {
  return (
    <main className="font-sans">
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
        <BridgeMark className="w-12 h-12 mb-8 text-foreground" />

        <h1 className="font-serif text-5xl sm:text-7xl tracking-tight max-w-3xl leading-[1.05]">
          Close the skills gap to your next job.
        </h1>

        <p className="text-lg sm:text-xl text-foreground/70 mt-6 max-w-xl leading-relaxed">
          Career-Gap compares your resume to any job description and gives you
          a concrete roadmap to get hired.
        </p>

        <div className="flex gap-3 mt-10">
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground text-background px-6 h-12 flex items-center font-medium hover:opacity-90"
            >
              Get started →
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-foreground/15 px-6 h-12 flex items-center font-medium hover:bg-foreground/5"
            >
              Sign in
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app"
              className="rounded-full bg-foreground text-background px-6 h-12 flex items-center font-medium hover:opacity-90"
            >
              Go to dashboard →
            </Link>
          </Show>
        </div>
      </section>

      <section className="border-t border-foreground/10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-sans text-sm uppercase tracking-wider text-foreground/50 text-center mb-12">
            What you get
          </h2>

          <div className="grid gap-10 sm:grid-cols-3">
            <Feature
              title="Honest gap report"
              body="A side-by-side view of skills you have, skills the job wants, and which gaps matter most — with evidence from your resume."
            />
            <Feature
              title="Realistic roadmap"
              body="A prioritized plan with hour estimates, tailored to how much time you can dedicate per day."
            />
            <Feature
              title="Save and revisit"
              body="Every analysis is saved to your account. Come back as you close skills off the list, or run new ones for different roles."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-sans text-sm uppercase tracking-wider text-foreground/50 text-center mb-12">
            How it works
          </h2>

          <ol className="grid gap-8 sm:grid-cols-3">
            <Step n={1} title="Drop your resume">
              Upload a PDF or paste the text. Career-Gap parses it locally in
              your browser.
            </Step>
            <Step n={2} title="Paste the target job">
              Drop in any job description — we pull out the skills, seniority,
              and what matters.
            </Step>
            <Step n={3} title="Get your roadmap">
              An AI analysis runs in seconds. You get a gap report and an
              ordered plan to close it.
            </Step>
          </ol>
        </div>
      </section>

      <section className="border-t border-foreground/10 px-6 py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
          Ready to see your gap?
        </h2>
        <p className="text-foreground/70 mt-3">
          One analysis takes about 30 seconds.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="rounded-full bg-foreground text-background px-6 h-12 flex items-center font-medium hover:opacity-90"
            >
              Get started →
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app/new"
              className="rounded-full bg-foreground text-background px-6 h-12 flex items-center font-medium hover:opacity-90"
            >
              Run an analysis →
            </Link>
          </Show>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-foreground/65 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-2">
      <span className="text-xs font-mono text-foreground/40">
        {String(n).padStart(2, "0")}
      </span>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-foreground/65 leading-relaxed">{children}</p>
    </li>
  );
}

function BridgeMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
    >
      <rect x="2" y="23" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="20" y="23" width="10" height="2" rx="1" fill="currentColor" />
      <path
        d="M 6 23 C 6 10 26 10 26 23"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
