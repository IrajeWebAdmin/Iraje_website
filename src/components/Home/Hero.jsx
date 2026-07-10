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
      {/* pb reserves the space the floating ProductCards overlap into
          (see ProductCards' -mt-20/-mt-32/-mt-48), so the centered content
          — and the "Book a Demo" button — always clears the cards on
          shorter/smaller viewports instead of colliding with the PAM card. */}
      <div className="relative z-10 flex min-h-[95vh] items-center pb-28 sm:pb-40 md:pb-52">
        {/* <div className="mx-auto w-full max-w-7xl px-6 lg:px-12"> */}
          <div className="container-global">
          <div className="max-w-xl">

            {/* SEO H1 */}
            <h1 className="mb-6 text-[clamp(2rem,1.2rem_+_3.6vw,3rem)] font-bold leading-tight text-white">
              One platform to secure every identity.
            </h1>

            <p className="mb-8 epm-body leading-relaxed text-gray-200">
              Iraje brings Privileged Access Management [PAM], Endpoint Privilege Management [EPM] and Identity & Access Management [IAM] together with Zero-Trust security architecture & compliance ready from day one. 
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-[#1d2548] font-semibold transition-all duration-300 hover:bg-gray-100 hover:scale-105"
            >
              Book a Demo
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}

