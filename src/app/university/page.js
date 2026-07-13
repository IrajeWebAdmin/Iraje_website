import UniversityHero from "@/components/University/UniversityHero";
import UniversitySkills from "@/components/University/UniversitySkills";
import UniversityIntro from "@/components/University/UniversityIntro";
import UniversityMasterCourse from "@/components/University/UniversityMasterCourse";
import UniversityCertification from "@/components/University/UniversityCertification";
import UniversityFormats from "@/components/University/UniversityFormats";
import UniversityRequestForm from "@/components/University/UniversityRequestForm";

export default function UniversityPage() {
  return (
    <>
      <UniversityHero />
      <UniversitySkills />
      <UniversityIntro />
      <UniversityMasterCourse />
      <UniversityCertification />
      <UniversityFormats />
      <UniversityRequestForm />
    </>
  );
}

export const metadata = {
  title: "Iraje University | Cybersecurity & IAM Training and Certification",
  description:
    "A dedicated academy for Identity & Access Management and modern cyber defence. Master cybersecurity through CyberTantra and get certified across Iraje PAM, EPM and IAM.",
};
