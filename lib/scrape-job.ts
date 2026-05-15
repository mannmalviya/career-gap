const JINA_BASE = "https://r.jina.ai/";
const MIN_TEXT_LENGTH = 400;
const FETCH_TIMEOUT_MS = 30_000;

const LOGIN_WALL_PHRASES = [
  "keep me signed in",
  "forgot password",
  "sign in to continue",
  "you need to sign in",
  "join linkedin",
  "create your free account",
  "please sign in",
  "log in to view",
];

function normalizeJobUrl(parsed: URL): URL {
  if (parsed.hostname.endsWith("linkedin.com")) {
    const jobId = parsed.searchParams.get("currentJobId");
    if (jobId && /^\d+$/.test(jobId)) {
      return new URL(`https://www.linkedin.com/jobs/view/${jobId}`);
    }
  }
  return parsed;
}

function looksLikeLoginWall(text: string): boolean {
  const lower = text.toLowerCase();
  return LOGIN_WALL_PHRASES.some((p) => lower.includes(p));
}

export async function scrapeJob(rawUrl: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must start with http:// or https://");
  }

  const target = normalizeJobUrl(parsed);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${JINA_BASE}${target.toString()}`, {
      signal: controller.signal,
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "markdown",
      },
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Timed out fetching the job posting.");
    }
    throw new Error("Couldn't reach the job page.");
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`Couldn't fetch the job posting (status ${res.status}).`);
  }

  const text = (await res.text()).trim();
  if (looksLikeLoginWall(text)) {
    throw new Error(
      "This page is behind a login wall (LinkedIn, Indeed, etc. often block scrapers). Try the company's own careers page or a public job board like Greenhouse, Lever, or Ashby.",
    );
  }
  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "Got too little text back. The page might block scrapers - try a different link (e.g. the company's own careers page).",
    );
  }
  return text;
}
