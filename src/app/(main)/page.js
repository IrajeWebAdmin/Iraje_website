import Hero from "@/components/Home/Hero";
import ProductCards from "@/components/Home/ProductCards";
import WhyIraje from "@/components/Home/WhyIraje";
import IndustryBanner from "@/components/Home/IndustryBanner";
import TrustCompliance from "@/components/Home/TrustCompliance";
import StatsSection from "@/components/Home/StatsSection";
import ResourceSection from "@/components/Home/ResourceSection";
import Testimonials from "@/components/Home/Testimonials";
import CTASection from "@/components/Home/CTASection";

export default function Home() {
  return (
    <>
     <Hero/>
     <ProductCards/>
     <WhyIraje/>
     <IndustryBanner/>
     <TrustCompliance/>
     {/* <StatsSection/> */}
     <ResourceSection/>
     <Testimonials/>
     <CTASection/>
    </>
  );
}

export const metadata = {
  title: "Iraje | Identity Security Platform",

  description:
    "Secure every identity with Privileged Access Management, Endpoint Privilege Management and Identity & Access Management.",

  keywords: [
    "PAM",
    "IAM",
    "EPM",
    "Identity Security",
    "Access Management",
  ],
};
