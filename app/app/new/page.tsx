"use client";

import { useState, useTransition } from "react";
import { createAnalysis } from "./actions";

export default function NewAnalysisPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New analysis</h1>
        <p className="text-foreground/60 mt-1">
          Paste your resume and a target job description. We&apos;ll generate a
          gap report and a concrete roadmap.
        </p>
      </div>

      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            try {
              await createAnalysis(formData);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Something went wrong.");
            }
          });
        }}
        className="flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Your resume</span>
          <textarea
            name="resume"
            required
            rows={12}
            placeholder="Paste your full resume here…"
            className="rounded-md border border-foreground/15 bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-foreground/40"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Target job description</span>
          <textarea
            name="job"
            required
            rows={10}
            placeholder="Paste the full job description here…"
            className="rounded-md border border-foreground/15 bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-foreground/40"
          />
        </label>

        <label className="flex flex-col gap-2 max-w-xs">
          <span className="text-sm font-medium">Hours per day</span>
          <input
            type="number"
            name="hours"
            min={1}
            max={16}
            defaultValue={2}
            required
            className="rounded-md border border-foreground/15 bg-transparent p-2 focus:outline-none focus:border-foreground/40"
          />
          <span className="text-xs text-foreground/50">
            Used to estimate how long the roadmap will take.
          </span>
        </label>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-foreground text-background px-5 h-11 flex items-center font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
          >
            {isPending ? "Analyzing…" : "Run analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
