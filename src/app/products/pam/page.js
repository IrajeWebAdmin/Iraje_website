import PamHero from "@/components/Pam/PamHero";
import PamIntro from "@/components/Pam/PamIntro";
import PamChallenge from "@/components/Pam/PamChallenge";
import PamSolution from "@/components/Pam/PamSolution";
import PamPillars from "@/components/Pam/PamPillars";
import PamArchitecture from "@/components/Pam/PamArchitecture";
import PamDifferentiators from "@/components/Pam/PamDifferentiators";
import PamComparison from "@/components/Pam/PamComparison";
import PamMaturity from "@/components/Pam/PamMaturity";
import PamCompliance from "@/components/Pam/PamCompliance";
import PamIndustries from "@/components/Pam/PamIndustries";
import PamWhyIraje from "@/components/Pam/PamWhyIraje";
import PamContact from "@/components/Pam/PamContact";

export default function PamPage() {
  return (
    <>
      <PamHero />
      <PamIntro />
      <PamChallenge />
      <PamSolution />
      <PamPillars />
      <PamArchitecture />
      <PamDifferentiators />
      <PamComparison />
      <PamMaturity />
      <PamCompliance />
      <PamIndustries />
      <PamWhyIraje />
      <PamContact />
    </>
  );
}

export const metadata = {
  title: "Iraje PAM | Privileged Access Management",
  description:
    "Iraje PAM manages, monitors and controls privileged access across your enterprise — turning scattered, ungoverned admin rights into a centralised, monitored and auditable, Zero Trust control plane.",
  keywords: [
    "PAM",
    "Privileged Access Management",
    "Privileged Identity Management",
    "Zero Trust",
    "Session Recording",
    "Password Vaulting",
    "Just-in-Time Access",
  ],
};
