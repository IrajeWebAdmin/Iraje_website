import events from "@/data/events";

// Top of the Events page: the "Iraje Live" video card. Set in src/data/events.js:
// a YouTube video (video.youtubeId) plays here with a "Watch on YouTube" link
// below; or a site-hosted file (video.src); otherwise a placeholder is drawn —
// dark navy glow, LIVE badge, level bars, play button and studio caption.
export default function EventsVideo() {
  const { youtubeId, title, watchOnYoutube, src, poster, badge, caption } = events.video;

  return (
    <section className="bg-white pt-24 pb-6">
      <div className="container-global">
        <div className="relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,#0f3a8a_0%,#0a1f4d_45%,#060f26_100%)] shadow-[0px_10px_30px_0px_#0C1E3A26]">
          {youtubeId ? (
            // youtube-nocookie: YouTube's privacy-enhanced player (no tracking
            // cookies until the visitor presses play).
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : src ? (
            <video
              src={src}
              poster={poster ?? undefined}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              {/* LIVE badge */}
              <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-md bg-[#e5252b] px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-white sm:top-5 sm:left-5">
                <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
                {badge}
              </span>

              {/* Audio-level bars */}
              <span className="absolute top-5 right-5 flex h-5 items-end gap-1" aria-hidden>
                {[10, 16, 12, 20].map((h, i) => (
                  <span key={i} className="w-1 rounded-sm bg-[#6f9bff]" style={{ height: h }} />
                ))}
              </span>

              {/* Play button (decorative until a real video is added) */}
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur-sm sm:h-16 sm:w-16">
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>

              {/* Caption */}
              <p className="absolute bottom-4 left-4 text-[11px] tracking-[0.28em] text-white/70 uppercase sm:bottom-5 sm:left-6 sm:text-xs">
                {caption}
              </p>
              <span className="sr-only">Video coming soon</span>
            </>
          )}
        </div>

        {youtubeId && (
          <div className="mx-auto mt-3 flex max-w-6xl justify-end">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-azure hover:underline"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  fill="#ff0000"
                  d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"
                />
                <path fill="#fff" d="M9.6 15.6 15.8 12 9.6 8.4z" />
              </svg>
              {watchOnYoutube}
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
