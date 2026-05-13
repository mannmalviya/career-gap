import { Webhook } from "svix";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };
  const body = await req.text();

  let event: ClerkUserEvent;
  try {
    event = new Webhook(secret).verify(body, headers) as ClerkUserEvent;
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  if (event.type === "user.deleted") {
    await db.delete(users).where(sql`${users.clerkUserId} = ${event.data.id}`);
    return Response.json({ ok: true });
  }

  const primaryId = event.data.primary_email_address_id;
  const primary = event.data.email_addresses?.find((e) => e.id === primaryId);
  const email = primary?.email_address ?? event.data.email_addresses?.[0]?.email_address;
  if (!email) return new Response("No email on user", { status: 400 });

  await db
    .insert(users)
    .values({ clerkUserId: event.data.id, email })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email, updatedAt: sql`now()` },
    });

  return Response.json({ ok: true });
}
