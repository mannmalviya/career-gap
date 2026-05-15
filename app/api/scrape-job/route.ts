import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { scrapeJob } from "@/lib/scrape-job";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body.url !== "string" || !body.url.trim()) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const text = await scrapeJob(body.url.trim());
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Scrape failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
