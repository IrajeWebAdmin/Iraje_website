"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import events from "@/data/events";

// "The Archive": year tabs (Upcoming Event · 2026 · 2025 · 2024) over a grid of
// event cards. Each card has a photo slider, date · location, the title and the
// start of the recap; "Read More..." opens the full recap.

// The first ~110 characters of the recap, cut at a word, for the closed card.
function preview(text, max = 110) {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).replace(/[,;:]$/, "");
}

function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white stroke-[2.5]" aria-hidden>
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white stroke-[2.5]" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

// Full-screen view of one event's photos. A native <dialog> opened with
// showModal(): it sits above everything, keeps keyboard focus inside, and Esc
// closes it. Clicking the dark area around the photo closes it too; ← / → and
// the ‹ › buttons move between photos (shared with the card's slider, so the
// card shows the same photo after closing).
function Lightbox({ images, index, title, onStep, onClose }) {
  const ref = useRef(null);
  const count = images.length;

  useEffect(() => {
    const dialog = ref.current;
    // Guarded because React runs effects twice in development. The cleanup
    // must NOT call dialog.close(): that fires the dialog's "close" event,
    // which would call onClose and shut the viewer the moment it opened.
    // Unmounting removes the dialog anyway.
    if (!dialog.open) dialog.showModal();
    // Stop the page behind from scrolling while the photo is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  function onKeyDown(e) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") onStep(-1);
    if (e.key === "ArrowRight") onStep(1);
  }

  const closeOnBackdrop = (e) => e.target === e.currentTarget && onClose();

  return (
    <dialog
      ref={ref}
      aria-label={`${title} — photos`}
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={closeOnBackdrop}
      className="m-0 h-full max-h-none w-full max-w-none bg-black/90 p-0 backdrop:bg-black/60"
    >
      {/* Clicks on this padded area (not the photo) also close the viewer. */}
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-10"
        onClick={closeOnBackdrop}
      >
        <div className="relative h-[min(80vh,900px)] w-full max-w-6xl">
          <Image
            key={images[index]}
            src={images[index]}
            alt={`${title} — photo ${index + 1} of ${count}`}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <p className="text-sm text-white/80">
          {title}
          {count > 1 && ` · ${index + 1} / ${count}`}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close photo"
        autoFocus
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/30"
      >
        <CloseIcon />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2b4ea8]/85 shadow-md transition hover:bg-[#2b4ea8] sm:left-6"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-azure shadow-md transition hover:bg-brand sm:right-6"
          >
            <Chevron direction="right" />
          </button>
        </>
      )}
    </dialog>
  );
}

// Event photos with ‹ › buttons and position dots. With no photos, the blue
// placeholder is drawn; with one photo, no buttons are needed. Clicking the
// photo opens it full-screen in the Lightbox.
function PhotoSlider({ images, title }) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const count = images.length;
  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(135deg,#13235c_0%,#1a3fa8_55%,#1f5cff_100%)]">
      {count === 0 ? (
        // Placeholder until photos are added in src/data/events.js
        <span className="absolute top-1/2 left-1/2 h-3 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[2px]" aria-hidden />
      ) : (
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`View photo ${index + 1} of ${count} larger`}
          className="group absolute inset-0 cursor-zoom-in"
        >
          <Image
            key={images[index]}
            src={images[index]}
            alt={`${title} — photo ${index + 1} of ${count}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </button>
      )}

      {zoomed && (
        <Lightbox
          images={images}
          index={index}
          title={title}
          onStep={go}
          onClose={() => setZoomed(false)}
        />
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#2b4ea8]/85 shadow-md transition hover:bg-[#2b4ea8]"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-azure shadow-md transition hover:bg-brand"
          >
            <Chevron direction="right" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
            {images.map((src, i) => (
              <span key={src} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EventCard({ event, open, onToggle, readMore, readLess }) {
  const title = event.titleLines.join(" ");
  const short = preview(event.description);
  const truncated = short.length < event.description.length;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-mist bg-white">
      <PhotoSlider images={event.images ?? []} title={title} />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-slate-soft">
          {event.date} · {event.location}
        </p>
        <h3 className="mt-3 text-lg leading-snug font-medium text-ink">
          {event.titleLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-shuttle">
          {open || !truncated ? event.description : short}
          {truncated && (
            <>
              {" "}
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="font-medium text-azure hover:underline"
              >
                {open ? readLess : readMore}
              </button>
            </>
          )}
        </p>
      </div>
    </article>
  );
}

export default function EventsArchive() {
  const { eyebrow, heading, intro, tabs, defaultTab, readMore, readLess } = events.archive;
  const [tab, setTab] = useState(defaultTab);
  const [openCards, setOpenCards] = useState(() => new Set());

  const list = events.byTab[tab] ?? [];

  function toggle(key) {
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <section className="bg-white pt-10 pb-20">
      <div className="container-global">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-normal text-ink sm:text-4xl">{heading}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-shuttle">{intro}</p>

          <div role="tablist" aria-label="Event year" className="mt-6 flex flex-wrap gap-2">
            {tabs.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full border px-5 py-2 text-xs font-medium transition ${
                    active ? "border-ink bg-ink text-white" : "border-mist bg-white text-ink hover:border-slate-soft"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((event) => {
              const key = `${tab}-${event.date}-${event.titleLines.join(" ")}`;
              return (
                <EventCard
                  key={key}
                  event={event}
                  open={openCards.has(key)}
                  onToggle={() => toggle(key)}
                  readMore={readMore}
                  readLess={readLess}
                />
              );
            })}
          </div>

          {list.length === 0 && <p className="mt-6 text-sm text-shuttle">No events here yet.</p>}
        </div>
      </div>
    </section>
  );
}
