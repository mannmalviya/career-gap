"use server";

import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/ensure-user";
import { db } from "@/db/client";
import { analyses, resumes, targetJobs } from "@/db/schema";
import { runGapAnalysis } from "@/lib/llm";
import { uploadResumePdf } from "@/lib/storage";

export async function createAnalysis(formData: FormData) {
  const resumeText = (formData.get("resume") ?? "").toString().trim();
  const jobText = (formData.get("job") ?? "").toString().trim();
  const jobUrl = (formData.get("jobUrl") ?? "").toString().trim();
  const hoursPerDayRaw = (formData.get("hours") ?? "").toString().trim();
  const hoursPerDay = Number.parseInt(hoursPerDayRaw, 10);

  if (!resumeText || resumeText.length < 50) {
    throw new Error("Paste your resume (at least 50 characters).");
  }
  if (!jobText || jobText.length < 50) {
    throw new Error("Fetch a job posting URL before running the analysis.");
  }
  if (!Number.isFinite(hoursPerDay) || hoursPerDay < 1 || hoursPerDay > 16) {
    throw new Error("Hours per day must be between 1 and 16.");
  }

  const { clerkUserId } = await ensureUser();

  const file = formData.get("resumeFile");
  let filePath: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;
  if (file instanceof File && file.size > 0) {
    filePath = await uploadResumePdf({ clerkUserId, file });
    fileName = file.name;
    fileSize = file.size;
  }

  const [resume] = await db
    .insert(resumes)
    .values({
      clerkUserId,
      rawText: resumeText,
      filePath,
      fileName,
      fileSize,
    })
    .returning({ id: resumes.id });

  const [targetJob] = await db
    .insert(targetJobs)
    .values({ clerkUserId, rawText: jobText, sourceUrl: jobUrl || null })
    .returning({ id: targetJobs.id });

  const { title, gap_report, roadmap } = await runGapAnalysis({
    resumeText,
    jobText,
    hoursPerDay,
  });

  const [analysis] = await db
    .insert(analyses)
    .values({
      clerkUserId,
      resumeId: resume.id,
      targetJobId: targetJob.id,
      hoursPerDay,
      title,
      gapReport: gap_report,
      roadmap,
    })
    .returning({ id: analyses.id });

  redirect(`/app/analyses/${analysis.id}`);
}
