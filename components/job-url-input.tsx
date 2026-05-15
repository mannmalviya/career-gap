"use client";

import { useState } from "react";

export function JobUrlInput() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetching(true);
    setError(null);
    setText("");
    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't fetch the page.");
      setText(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't fetch the page.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="job" value={text} />
      <input type="hidden" name="jobUrl" value={url} />

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (text) setText("");
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              fetchUrl();
            }
          }}
          placeholder="https://..."
          required
          className="flex-1 rounded-md border border-foreground/15 bg-transparent p-2 focus:outline-none focus:border-foreground/40"
        />
        <button
          type="button"
          onClick={fetchUrl}
          disabled={fetching || !url.trim()}
          className="rounded-md border border-foreground/15 px-4 hover:bg-foreground/[0.04] disabled:opacity-50"
        >
          {fetching ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {text && (
        <>
          <div className="rounded-md border border-foreground/15 bg-foreground/[0.02] p-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs text-foreground/80">
            {text}
          </div>
          <span className="text-xs text-foreground/50">
            Extracted {text.length.toLocaleString()} characters. If this looks
            wrong, try a different URL (a company&apos;s own careers page
            usually works best).
          </span>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
