import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const RESUME_BUCKET = "resumes";

let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set");

  cached = createClient(url, secretKey, {
    auth: { persistSession: false },
  });
  return cached;
}

export async function uploadResumePdf(args: {
  clerkUserId: string;
  file: File;
}): Promise<string> {
  const { clerkUserId, file } = args;
  const path = `${clerkUserId}/${crypto.randomUUID()}.pdf`;
  const buffer = await file.arrayBuffer();

  const { error } = await getClient()
    .storage.from(RESUME_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });
  if (error) throw new Error(`Resume upload failed: ${error.message}`);

  return path;
}
