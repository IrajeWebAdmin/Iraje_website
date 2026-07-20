import { FiLink } from "react-icons/fi";

// Full-screen "Coming Soon" placeholder shown for routes that aren't built yet
// (wired to the global app/not-found.js). Navy gradient backdrop + a blurred,
// semi-transparent panel that holds the wordmark and note.
export default function ComingSoon() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(90%_70%_at_50%_12%,#15398a_0%,#0c2a66_38%,#07183a_72%,#030d20_100%)] px-6 py-20">
      <div className="flex flex-col items-center px-10 py-14 text-center">
        {/* Faded watermark icon */}
        <FiLink className="mb-2 h-14 w-14 text-white/[0.08]" aria-hidden="true" />

        <p className="font-serif text-4xl font-medium text-white sm:text-5xl">
          Coming
        </p>
        <p className="-mt-1 font-display text-6xl font-extrabold tracking-tight text-[#FFCE0C] sm:text-8xl">
          SOON
        </p>

        <p className="mt-4 max-w-xs text-xs leading-relaxed tracking-wide text-white/70 sm:text-sm">
          This page is currently under development and will be available soon.
        </p>
      </div>
    </section>
  );
}
