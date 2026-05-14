"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { analyses } from "@/db/schema";

export async function deleteAnalysis(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(analyses)
    .where(and(eq(analyses.id, id), eq(analyses.clerkUserId, userId)));

  revalidatePath("/app");
  redirect("/app");
}
