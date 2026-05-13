import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function ensureUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("User has no email");

  await db
    .insert(users)
    .values({ clerkUserId: user.id, email })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email, updatedAt: sql`now()` },
    });

  return { clerkUserId: user.id, email };
}
