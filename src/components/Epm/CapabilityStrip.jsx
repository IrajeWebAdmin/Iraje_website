import Image from "next/image";
import Link from "next/link";
import epm from "@/data/epm";


// `offsetClassName` controls how far the strip is pulled up into the hero above
// it, so each page can tune the overlap (PAM sits lower than EPM).
// `items` lets a page swap in its own capability copy (PAM discovers devices,
// EPM discovers endpoints); it defaults to the EPM strip.
export default function CapabilityStrip ({ offsetClassName = "-mt-24", items }){
    const strip = items ?? epm.hero.strip;

    return(

         <div className={`epm-container relative z-30 mb-16 hidden lg:block ${offsetClassName}`} >
          <div className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] lg:grid-cols-6">
            {strip.map((item) => (
              <div
                key={item.name}
                className="group flex min-h-[170px] flex-col items-center justify-center border-r border-[#E5E7EB] px-6 text-center last:border-r-0"
              >
                {/* Replace with your own icon */}
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={34}
                  height={34}
                  className="mb-5 transition-transform duration-300 ease-out group-hover:scale-125"
                />

                <h3 className="text-[22px] font-semibold text-[#0451CC] transition-transform duration-300 ease-out group-hover:scale-110">
                  {item.name}
                </h3>

                <p className="mt-2 text-[15px]  text-[#7C92C8]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

    );
}