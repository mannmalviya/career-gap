import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { users, resumes } from "@/db/schema";
import { ensureUser } from "@/lib/ensure-user";
import { NewAnalysisForm } from "./new-analysis-form";

export default async function NewAnalysisPage() {
  const { userId } = await auth();
  if (!userId) return null;

  await ensureUser();

  const [u] = await db
    .select({ defaultResumeId: users.defaultResumeId })
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  let defaultResumeText = "";
  if (u?.defaultResumeId) {
    const [r] = await db
      .select({ rawText: resumes.rawText })
      .from(resumes)
      .where(eq(resumes.id, u.defaultResumeId))
      .limit(1);
    if (r) defaultResumeText = r.rawText;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">New analysis</h1>
        <p className="text-foreground/60 mt-1">
          {defaultResumeText
            ? "Using your saved resume - edit it inline if needed. Then paste a target job posting URL."
            : "Drop your resume PDF and paste a target job posting URL. We'll generate a gap report and a concrete roadmap."}
        </p>
      </div>

      <NewAnalysisForm defaultResumeText={defaultResumeText} />
    </div>
  );
}
