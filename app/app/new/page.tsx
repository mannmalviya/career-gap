"use client";

import { useState, useTransition } from "react";
import { createAnalysis } from "./actions";

export default function NewAnalysisPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);

  async function parsePdf(file: File) {
    if (file.type !== "application/pdf") {
      setError("That doesn't look like a PDF. Try again or paste text.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        pages.push(text);
      }
      const fullText = pages.join("\n\n").trim();
      if (!fullText) {
        setError(
          "Couldn't extract any text from that PDF (it may be scanned). Paste it manually instead.",
        );
        return;
      }
      setResumeText(fullText);
      setPdfName(file.name);
    } catch (e) {
      setError(
        `Couldn't parse PDF: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    } finally {
      setParsing(false);
    }
  }

  function clear() {
    setPdfName(null);
    setResumeText("");
    setPasteMode(false);
  }

  const showTextarea = !!pdfName || pasteMode || resumeText.length > 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">New analysis</h1>
        <p className="text-foreground/60 mt-1">
          Drop your resume PDF and a target job description. We&apos;ll
          generate a gap report and a concrete roadmap.
        </p>
      </div>

      <form
        action={(formData) => {
          setError(null);
          formData.set("resume", resumeText);
          startTransition(async () => {
            try {
              await createAnalysis(formData);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Something went wrong.",
              );
            }
          });
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Your resume</span>

          {pdfName ? (
            <div className="rounded-lg border border-foreground/15 p-4 flex items-center gap-3">
              <span className="text-sm">📄 {pdfName}</span>
              <button
                type="button"
                onClick={clear}
                className="ml-auto text-foreground/40 hover:text-foreground text-sm"
                aria-label="Remove PDF"
              >
                ✕
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) parsePdf(file);
              }}
              className={
                "rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 py-12 transition-colors " +
                (dragOver
                  ? "border-foreground/50 bg-foreground/[0.04]"
                  : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]")
              }
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={parsing}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) parsePdf(file);
                  e.target.value = "";
                }}
              />
              {parsing ? (
                <span className="text-sm text-foreground/60">
                  Parsing PDF…
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    Drop your resume PDF here
                  </span>
                  <span className="text-xs text-foreground/60">
                    or click to browse
                  </span>
                </>
              )}
            </label>
          )}

          {showTextarea && (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
              rows={10}
              placeholder={
                pdfName
                  ? "Parsed text — review and clean up if needed"
                  : "Paste your resume here…"
              }
              className="rounded-md border border-foreground/15 bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-foreground/40"
            />
          )}

          {!pdfName && !pasteMode && (
            <button
              type="button"
              onClick={() => setPasteMode(true)}
              className="text-xs text-foreground/60 hover:text-foreground self-start mt-1"
            >
              Or paste text directly →
            </button>
          )}

          {pdfName && (
            <span className="text-xs text-foreground/50">
              PDF parsed — review and clean up artifacts before submitting.
            </span>
          )}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Target job description</span>
          <textarea
            name="job"
            required
            rows={10}
            placeholder="Paste the full job description here…"
            className="rounded-md border border-foreground/15 bg-transparent p-3 font-mono text-sm focus:outline-none focus:border-foreground/40"
          />
        </label>

        <label className="flex flex-col gap-2 max-w-xs">
          <span className="text-sm font-medium">Hours per day</span>
          <input
            type="number"
            name="hours"
            min={1}
            max={16}
            defaultValue={2}
            required
            className="rounded-md border border-foreground/15 bg-transparent p-2 focus:outline-none focus:border-foreground/40"
          />
          <span className="text-xs text-foreground/50">
            Used to estimate how long the roadmap will take.
          </span>
        </label>

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending || parsing}
            className="rounded-full bg-foreground text-background px-5 h-11 flex items-center font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-wait"
          >
            {isPending ? "Analyzing…" : "Run analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
