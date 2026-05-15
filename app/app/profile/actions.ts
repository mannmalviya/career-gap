"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { resumes, users } from "@/db/schema";
import { ensureUser } from "@/lib/ensure-user";
import { uploadResumePdf } from "@/lib/storage";

export async function setDefaultResume(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await ensureUser();

  const text = (formData.get("resume") ?? "").toString().trim();
  if (!text || text.length < 50) {
    throw new Error("Paste your resume (at least 50 characters).");
  }

  const file = formData.get("resumeFile");
  let filePath: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;
  if (file instanceof File && file.size > 0) {
    filePath = await uploadResumePdf({ clerkUserId: userId, file });
    fileName = file.name;
    fileSize = file.size;
  }

  const [r] = await db
    .insert(resumes)
    .values({
      clerkUserId: userId,
      rawText: text,
      filePath,
      fileName,
      fileSize,
    })
    .returning({ id: resumes.id });

  await db
    .update(users)
    .set({ defaultResumeId: r.id, updatedAt: sql`now()` })
    .where(sql`${users.clerkUserId} = ${userId}`);

  revalidatePath("/app/profile");
  revalidatePath("/app/new");
}

export async function removeDefaultResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ defaultResumeId: null, updatedAt: sql`now()` })
    .where(sql`${users.clerkUserId} = ${userId}`);

  revalidatePath("/app/profile");
  revalidatePath("/app/new");
}
