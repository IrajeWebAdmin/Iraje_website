import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] overflow-visible">
      
      {/* Background Image */}
      <Image
         src="/images/home/hh.png"
        alt="Iraje Identity Security Platform"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      {/* <div className="absolute inset-0 bg-[#1d2548]/70" /> */}

      {/* Content */}
      <div className="relative z-10 flex min-h-[95vh] items-center">
        {/* <div className="mx-auto w-full max-w-7xl px-6 lg:px-12"> */}
          <div className="container-global">
          <div className="max-w-xl">

            {/* SEO H1 */}
            <h1 className="mb-6 text-[clamp(2rem,1.2rem_+_3.6vw,3rem)] font-bold leading-tight text-white">
              One platform to secure every identity.
            </h1>

            <p className="mb-8 text-[clamp(0.875rem,0.8rem_+_0.4vw,1rem)] leading-relaxed text-gray-200">
              Iraje brings Privileged Access Management,
              Endpoint Privilege Management and Identity &
              Access Management together  agentless,
              Zero Trust and audit-ready from day one.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-white font-medium transition-all duration-300 hover:bg-blue-700 hover:scale-105"
            >
              Book a Demo
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}

