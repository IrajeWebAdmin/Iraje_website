import industries from "@/data/industries";

export default function IndustryBanner() {
  return (
    <section className="bg-[#0451CC] py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 lg:justify-between">

        {/* Left Text */}
        <p className="text-lg font-medium text-white/70">
          Trusted across regulated industries
        </p>

        {/* Industries */}
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {industries.map((industry) => (
            <span
              key={industry}
              className=" text-lg font-medium text-white transition duration-300 hover:text-white/70 cursor-pointer">
              {industry}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}