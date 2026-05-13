import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { analyses, targetJobs } from "@/db/schema";

export default async function Dashboard() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.username ?? "there";

  const rows = user
    ? await db
        .select({
          id: analyses.id,
          createdAt: analyses.createdAt,
          hoursPerDay: analyses.hoursPerDay,
          jobSnippet: targetJobs.rawText,
        })
        .from(analyses)
        .innerJoin(targetJobs, eq(analyses.targetJobId, targetJobs.id))
        .where(eq(analyses.clerkUserId, user.id))
        .orderBy(desc(analyses.createdAt))
        .limit(20)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome, {name}.
          </h1>
          <p className="text-foreground/60 mt-1">
            {rows.length === 0
              ? "You haven't run any analyses yet."
              : `${rows.length} ${rows.length === 1 ? "analysis" : "analyses"}.`}
          </p>
        </div>
        <Link
          href="/app/new"
          className="rounded-full bg-foreground text-background px-5 h-10 flex items-center font-medium hover:opacity-90"
        >
          New analysis
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-foreground/15 p-10 flex flex-col items-center text-center gap-3">
          <p className="font-medium">Run your first Career-Gap analysis</p>
          <p className="text-sm text-foreground/60 max-w-md">
            Paste your resume and a target job description. You&apos;ll get a
            gap report and a roadmap to close it.
          </p>
          <Link
            href="/app/new"
            className="rounded-full bg-foreground text-background px-5 h-10 flex items-center font-medium hover:opacity-90 mt-2"
          >
            Start
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => {
            const firstLine = row.jobSnippet.split("\n")[0].slice(0, 80);
            return (
              <li key={row.id}>
                <Link
                  href={`/app/analyses/${row.id}`}
                  className="block rounded-lg border border-foreground/10 p-4 hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-medium truncate">{firstLine}</div>
                    <div className="text-xs text-foreground/50 shrink-0">
                      {new Date(row.createdAt).toLocaleDateString()} ·{" "}
                      {row.hoursPerDay}h/day
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
