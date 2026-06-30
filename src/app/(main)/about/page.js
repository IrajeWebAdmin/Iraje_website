import AboutHero from "@/components/About/AboutHero";
import AboutWhoWeAre from "@/components/About/AboutWhoWeAre";
import AboutCustomers from "@/components/About/AboutCustomers";
import AboutPartners from "@/components/About/AboutPartners";
import AboutCulture from "@/components/About/AboutCulture";
import AboutCta from "@/components/About/AboutCta";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutWhoWeAre />
      <AboutCustomers />
      <AboutPartners />
      <AboutCulture />
      <AboutCta />
    </>
  );
}

export const metadata = {
  title: "About Iraje | Privileged Identity & Access Security",
  description:
    "For over two decades Iraje has helped organisations protect their privileged accounts, endpoints and identities — trusted across banking, healthcare, government, manufacturing and telecom.",
};
