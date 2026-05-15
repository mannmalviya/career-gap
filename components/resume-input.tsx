"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  fileName?: string;
  initialText?: string;
};

export function ResumeInput({
  name,
  fileName: fileFieldName = `${name}File`,
  initialText = "",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(initialText);
  const [uploadName, setUploadName] = useState<string | null>(
    initialText.length > 0 ? "Saved resume" : null,
  );
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setInputFile(file: File | null) {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    fileInputRef.current.files = dt.files;
  }

  async function parseFile(file: File) {
    setParsing(true);
    setError(null);
    try {
      const lower = file.name.toLowerCase();
      const isPdf =
        file.type === "application/pdf" || lower.endsWith(".pdf");
      const isPlainText =
        lower.endsWith(".txt") ||
        lower.endsWith(".md") ||
        file.type === "text/plain" ||
        file.type === "text/markdown";

      let fullText = "";

      if (isPdf) {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const parts: string[] = [];
          for (const item of content.items) {
            if (!("str" in item)) continue;
            parts.push(item.str);
            parts.push(item.hasEOL ? "\n" : " ");
          }
          pages.push(
            parts
              .join("")
              .replace(/[ \t]+\n/g, "\n")
              .replace(/\n{3,}/g, "\n\n")
              .trim(),
          );
        }
        fullText = pages.join("\n\n").trim();
      } else if (isPlainText) {
        fullText = (await file.text()).trim();
      } else {
        setError("Please upload a PDF.");
        return;
      }

      if (!fullText) {
        setError(
          "Couldn't extract any text from that file (it may be scanned or empty).",
        );
        return;
      }
      setText(fullText);
      setUploadName(file.name);
      setInputFile(file);
    } catch (e) {
      setError(
        `Couldn't parse file: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    } finally {
      setParsing(false);
    }
  }

  function clear() {
    setUploadName(null);
    setText("");
    setInputFile(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        type="file"
        name={fileFieldName}
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className="hidden"
        disabled={parsing}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) parseFile(file);
        }}
      />

      {uploadName ? (
        <div className="rounded-lg border border-foreground/15 p-4 flex items-center gap-3">
          <input type="hidden" name={name} value={text} />
          <span className="text-sm">📄 {uploadName}</span>
          <button
            type="button"
            onClick={clear}
            className="ml-auto text-foreground/40 hover:text-foreground text-sm"
            aria-label="Remove resume"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) parseFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={
            "rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 py-10 transition-colors " +
            (dragOver
              ? "border-foreground/50 bg-foreground/[0.04]"
              : "border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.02]")
          }
        >
          {parsing ? (
            <span className="text-sm text-foreground/60">Parsing PDF…</span>
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
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
