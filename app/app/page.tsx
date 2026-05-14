import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { analyses, targetJobs } from "@/db/schema";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteAnalysis } from "./analyses/[id]/actions";

export default async function Dashboard() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.username ?? "there";

  const rows = user
    ? await db
        .select({
          id: analyses.id,
          createdAt: analyses.createdAt,
          hoursPerDay: analyses.hoursPerDay,
          title: analyses.title,
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
          <h1 className="font-serif text-4xl tracking-tight">
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
            const label =
              row.title ?? row.jobSnippet.split("\n")[0].slice(0, 80);
            return (
              <li
                key={row.id}
                className="group rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors flex items-center"
              >
                <Link
                  href={`/app/analyses/${row.id}`}
                  className="flex-1 min-w-0 p-4 flex items-center justify-between gap-4"
                >
                  <div className="font-medium truncate">{label}</div>
                  <div className="text-xs text-foreground/50 shrink-0">
                    {new Date(row.createdAt).toLocaleDateString()} ·{" "}
                    {row.hoursPerDay}h/day
                  </div>
                </Link>
                <form action={deleteAnalysis.bind(null, row.id)} className="pr-2">
                  <ConfirmDialog
                    title="Delete this analysis?"
                    body={`"${label}" will be permanently removed. This action cannot be undone.`}
                    confirmLabel="Delete"
                    triggerAriaLabel="Delete analysis"
                    triggerClassName="w-8 h-8 flex items-center justify-center rounded text-lg text-foreground/25 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    ✕
                  </ConfirmDialog>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
