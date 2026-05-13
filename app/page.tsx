import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-10 font-sans">
      <div className="flex flex-col items-center gap-4 max-w-xl text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Career-Gap
        </h1>
        <p className="text-lg text-foreground/70">
          Close the gap between where you are and the job you want. Paste a
          resume and a target job — get a personalized roadmap.
        </p>
      </div>

      <div className="flex gap-3">
        <Show when="signed-out">
          <Link
            href="/sign-up"
            className="rounded-full bg-foreground text-background px-5 h-11 flex items-center font-medium hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-foreground/15 px-5 h-11 flex items-center font-medium hover:bg-foreground/5"
          >
            Sign in
          </Link>
        </Show>
        <Show when="signed-in">
          <Link
            href="/app"
            className="rounded-full bg-foreground text-background px-5 h-11 flex items-center font-medium hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </Show>
      </div>
    </main>
  );
}
