"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { ensureUser } from "@/lib/ensure-user";

export async function updatePreferences(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await ensureUser();

  const raw = (formData.get("hours") ?? "").toString().trim();
  const hours = raw === "" ? null : Number.parseInt(raw, 10);
  if (hours !== null && (!Number.isFinite(hours) || hours < 1 || hours > 16)) {
    throw new Error("Hours per day must be between 1 and 16 (or blank).");
  }

  await db
    .update(users)
    .set({ defaultHoursPerDay: hours, updatedAt: sql`now()` })
    .where(sql`${users.clerkUserId} = ${userId}`);

  revalidatePath("/app/profile");
}
