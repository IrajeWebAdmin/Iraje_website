import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-[#F8F9FC] py-24">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">
        <div
          className="rounded-[24px] bg-gradient-to-r from-[#153A8A] to-[#2563FF] px-8 py-16 text-center shadow-xl md:px-16 ">
          {/* Small Heading */}
          <span className="text-lg font-medium text-white/60">Get Started</span>

          {/* Main Heading */}
          <h2 className="mt-4 text-[clamp(1.875rem,1.2rem_+_2.6vw,3rem)] font-bold text-white">
            See the Iraje platform in action
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            Book a personalised demo, or dive into the resources, datasheets and
            case studies to learn more.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Book Demo */}
            <Link
              href="/contact"
              className="min-w-[180px] rounded-xl bg-white px-8 py-3 font-medium text-black transition-all duration-300 hover:scale-105 hover:shadow-lg ">
              Book a Demo
            </Link>

            {/* Resources */}
            <Link
              href="/resources"
              className="min-w-[180px] rounded-xl border border-white bg-transparent  px-8 py-3 font-medium text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 hover:shadow-lg"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
