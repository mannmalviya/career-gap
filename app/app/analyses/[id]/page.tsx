import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { analyses } from "@/db/schema";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteAnalysis } from "./actions";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const [analysis] = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.id, id), eq(analyses.clerkUserId, userId)))
    .limit(1);

  if (!analysis) notFound();

  const { gapReport, roadmap, hoursPerDay, createdAt, title } = analysis;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/app"
            className="text-sm text-foreground/60 hover:underline w-fit"
          >
            ← Back to dashboard
          </Link>
          <form action={deleteAnalysis.bind(null, id)}>
            <ConfirmDialog
              title="Delete this analysis?"
              body="This analysis will be permanently removed. This action cannot be undone."
              confirmLabel="Delete"
              triggerClassName="text-sm text-foreground/50 hover:text-red-500 transition-colors"
            >
              Delete
            </ConfirmDialog>
          </form>
        </div>
        <h1 className="font-serif text-4xl tracking-tight mt-2">
          {title ?? "Gap analysis"}
        </h1>
        <p className="text-sm text-foreground/60">
          {new Date(createdAt).toLocaleString()} · {hoursPerDay}h/day pace
        </p>
      </div>

      {gapReport && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Gap report</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-foreground/10 p-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-3">
                Matched skills
              </h3>
              <ul className="flex flex-col gap-3">
                {gapReport.matched_skills.map((m, i) => (
                  <li key={i}>
                    <div className="font-medium text-sm">{m.skill}</div>
                    <div className="text-xs text-foreground/60 mt-0.5">
                      {m.evidence}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-foreground/10 p-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-3">
                Missing skills
              </h3>
              <ul className="flex flex-col gap-3">
                {gapReport.missing_skills.map((m, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{m.skill}</span>
                      <span
                        className={
                          "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded " +
                          (m.importance === "must-have"
                            ? "bg-red-500/15 text-red-500"
                            : "bg-foreground/10 text-foreground/70")
                        }
                      >
                        {m.importance}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/60 mt-0.5">
                      {m.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {gapReport.strengths.length > 0 && (
            <div className="rounded-lg border border-foreground/10 p-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-2">
                Strengths beyond the role
              </h3>
              <ul className="list-disc list-inside text-sm flex flex-col gap-1">
                {gapReport.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {gapReport.gaps.length > 0 && (
            <div className="rounded-lg border border-foreground/10 p-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-2">
                Higher-level gaps
              </h3>
              <ul className="list-disc list-inside text-sm flex flex-col gap-1">
                {gapReport.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {roadmap && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Roadmap</h2>
            <span className="text-sm text-foreground/60">
              ~{roadmap.est_total_hours}h · {roadmap.est_days_at_pace} days at{" "}
              {hoursPerDay}h/day
            </span>
          </div>
          <p className="text-sm text-foreground/70">{roadmap.summary}</p>

          <ol className="flex flex-col gap-3">
            {[...roadmap.items]
              .sort((a, b) => a.priority - b.priority)
              .map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-foreground/10 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/50 font-mono">
                      #{item.priority}
                    </span>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70">
                      {item.type}
                    </span>
                    <span className="text-xs text-foreground/50 ml-auto">
                      ~{item.est_hours}h
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 mt-2">
                    {item.description}
                  </p>
                </li>
              ))}
          </ol>
        </section>
      )}
    </div>
  );
}
