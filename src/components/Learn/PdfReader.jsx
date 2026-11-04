"use client";

import { useEffect, useRef, useState } from "react";

// Shows a PDF ONE PAGE AT A TIME with Previous / Next buttons — no scrolling.
// On the last page, "Next" becomes "Mark as read", which calls onFinish().
// There is no "jump to page", so the only way to the last page is through
// every page. ← / → keys turn pages too.
//
// PDF.js decodes the file; its background "worker" is served from
// /pdf.worker.min.mjs (copied into public/ by scripts/copy-pdf-worker.mjs).
export default function PdfReader({ src, onFinish, finishing = false, alreadyRead = false }) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [drawing, setDrawing] = useState(false);

  // 1) Load the document once per file.
  useEffect(() => {
    let cancelled = false;
    // pdfjs-dist 6: the loading task (not the document) owns destroy(); it
    // also frees the document once loaded.
    let task;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      if (cancelled) return;
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      task = pdfjs.getDocument({ url: src });
      const doc = await task.promise;
      if (cancelled) return;
      setPdf(doc);
      setPage(1);
      setStatus("ready");
    })().catch((err) => {
      console.error("[PdfReader]", err);
      if (!cancelled) setStatus("error");
    });
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [src]);

  // 2) Draw the current page whenever it changes, fitted to the frame's width.
  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    let task;
    (async () => {
      setDrawing(true);
      const p = await pdf.getPage(page);
      if (cancelled) return;
      const fit = frameRef.current.clientWidth / p.getViewport({ scale: 1 }).width;
      const viewport = p.getViewport({ scale: fit * (window.devicePixelRatio || 1) });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      task = p.render({ canvas, canvasContext: canvas.getContext("2d"), viewport });
      await task.promise;
      if (!cancelled) setDrawing(false);
    })().catch((err) => {
      // Clicking Next quickly cancels the old page's drawing — that is expected.
      if (err?.name !== "RenderingCancelledException") console.error("[PdfReader]", err);
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, page]);

  const total = pdf?.numPages ?? 0;
  const onLastPage = total > 0 && page === total;
  const go = (step) => setPage((p) => Math.min(Math.max(p + step, 1), total));

  // Keyboard: ← and → turn pages (→ stops at the last page).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" && !onLastPage) go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (status === "error") {
    return (
      <p className="py-10 text-center text-sm text-red-600">
        The study material could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return (
    <div onContextMenu={(e) => e.preventDefault()} className="rounded-2xl border border-mist bg-white">
      <div ref={frameRef} className="relative min-h-[300px] p-3">
        {status === "loading" && <p className="py-10 text-center text-sm text-shuttle">Loading study material…</p>}
        <canvas
          ref={canvasRef}
          className={`w-full rounded-lg transition-opacity ${drawing ? "opacity-60" : ""}`}
          aria-label={`Page ${page} of ${total}`}
        />
      </div>

      {total > 0 && (
        <div className="border-t border-mist p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={page === 1}
              className="rounded-xl border border-mist px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-sm text-shuttle">
              Page {page} of {total}
            </span>

            {onLastPage ? (
              <button
                type="button"
                onClick={onFinish}
                disabled={finishing || alreadyRead}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {alreadyRead ? "✓ Read" : finishing ? "Saving…" : "✓ Mark as read"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Next →
              </button>
            )}
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-mist">
            <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${(page / total) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
