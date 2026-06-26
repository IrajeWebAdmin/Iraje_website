import Image from "next/image";
import Link from "next/link";
import epm from "@/data/epm";


export default function CapabilityStrip (){
    const {  strip } = epm.hero;

    return(

         <div className="epm-container relative z-30 -mt-24 mb-16 hidden lg:block" >
          <div className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] lg:grid-cols-6">
            {strip.map((item) => (
              <div
                key={item.name}
                className="flex min-h-[170px] flex-col items-center justify-center border-r border-[#E5E7EB] px-6 text-center last:border-r-0"
              >
                {/* Replace with your own icon */}
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={34}
                  height={34}
                  className="mb-5"
                />

                <h3 className="text-[18px] font-semibold text-[#0451CC]">
                  {item.name}
                </h3>

                <p className="mt-2 text-[11px] tracking-[0.18em] text-[#7C92C8] uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

    );
}