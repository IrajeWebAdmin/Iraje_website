import CertHero from "@/components/Certification/CertHero";
import CertTracks from "@/components/Certification/CertTracks";
import CertHowItWorks from "@/components/Certification/CertHowItWorks";
import CertDashboard from "@/components/Certification/CertDashboard";
import CertExamEngine from "@/components/Certification/CertExamEngine";
import CertCertificate from "@/components/Certification/CertCertificate";
import CertRoadmap from "@/components/Certification/CertRoadmap";
import CertVerify from "@/components/Certification/CertVerify";
import CertEnroll from "@/components/Certification/CertEnroll";

export default function CertificationPage() {
  return (
    <>
      <CertHero />
      <CertTracks />
      <CertHowItWorks />
      <CertDashboard />
      <CertExamEngine />
      <CertCertificate />
      <CertRoadmap />
      <CertVerify />
      <CertEnroll />
    </>
  );
}

export const metadata = {
  title: "Iraje University & Certification Program | PAM, EPM & CyberTantra",
  description:
    "Industry-recognised Iraje certifications across PAM, EPM and CyberTantra — from Associate fundamentals to Administrator-level governance. Learn online, sit a proctored exam, and earn a verifiable digital certificate.",
};
