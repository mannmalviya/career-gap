import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { GapReport, Roadmap } from "@/db/schema";

const MODEL = google("gemini-2.5-flash");

const SYSTEM_PROMPT = `You are an expert career coach. Given a candidate's resume and a target job, you produce a candid, specific gap analysis and a concrete roadmap to close the gap.

Be specific over generic. Use the candidate's actual experience as evidence. When something is missing, say so plainly. The roadmap must be doable, ordered by priority, with realistic hour estimates.`;

const gapAnalysisSchema = z.object({
  gap_report: z.object({
    matched_skills: z
      .array(
        z.object({
          skill: z.string(),
          evidence: z
            .string()
            .describe("Quote or paraphrase from the resume."),
        }),
      )
      .describe(
        "Skills the job requires that the candidate clearly has, each with evidence from the resume.",
      ),
    missing_skills: z
      .array(
        z.object({
          skill: z.string(),
          importance: z.enum(["must-have", "nice-to-have"]),
          reason: z.string(),
        }),
      )
      .describe(
        "Skills the job requires that the candidate does not clearly have.",
      ),
    strengths: z
      .array(z.string())
      .describe("Candidate strengths that go beyond what the job requires."),
    gaps: z
      .array(z.string())
      .describe(
        "Higher-level gaps that aren't single skills (e.g. seniority, domain, scale).",
      ),
  }),
  roadmap: z.object({
    summary: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        type: z.enum(["learn", "build", "practice"]),
        est_hours: z.number(),
        priority: z
          .number()
          .int()
          .describe("1 = highest priority. Order accordingly."),
      }),
    ),
    est_total_hours: z.number(),
    est_days_at_pace: z
      .number()
      .describe(
        "Calendar days to complete given the candidate's hours per day.",
      ),
  }),
});

export async function runGapAnalysis(args: {
  resumeText: string;
  jobText: string;
  hoursPerDay: number;
}): Promise<{ gap_report: GapReport; roadmap: Roadmap }> {
  const { resumeText, jobText, hoursPerDay } = args;

  const { object } = await generateObject({
    model: MODEL,
    schema: gapAnalysisSchema,
    system: SYSTEM_PROMPT,
    prompt: `<resume>
${resumeText}
</resume>

<target_job>
${jobText}
</target_job>

The candidate can dedicate ${hoursPerDay} hours per day. Use that pace to compute est_days_at_pace.`,
  });

  return object as { gap_report: GapReport; roadmap: Roadmap };
}
