import industries from "@/data/industries";

export default function IndustryBanner() {
  return (
    <section className="overflow-hidden bg-[#0451CC] py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 lg:flex-row lg:gap-10">
        {/* Left Text (static) */}
        <p className="shrink-0 text-lg font-medium text-white/70">
          Trusted across regulated industries
        </p>

        {/* Sliding industries (infinite marquee) */}
        <div className="marquee-mask relative w-full min-w-0 overflow-hidden lg:flex-1">
          <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
            {/* Two identical copies so the -50% translate loops seamlessly.
                The second copy is aria-hidden to avoid duplicate announcements. */}
            {[...industries, ...industries].map((industry, i) => (
              <span
                key={i}
                aria-hidden={i >= industries.length}
                className="mx-6 whitespace-nowrap text-lg font-medium text-white transition duration-300 hover:text-white/70 lg:mx-8"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
