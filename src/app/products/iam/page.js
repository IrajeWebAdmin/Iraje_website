import IamHero from "@/components/Iam/IamHero";
import IamStrip from "@/components/Iam/IamStrip";
import IamProblem from "@/components/Iam/IamProblem";
import IamLifecycle from "@/components/Iam/IamLifecycle";
import IamCapabilities from "@/components/Iam/IamCapabilities";
import IamAuthentication from "@/components/Iam/IamAuthentication";
import IamGovernance from "@/components/Iam/IamGovernance";
import IamPlatform from "@/components/Iam/IamPlatform";
import IamIntegrations from "@/components/Iam/IamIntegrations";
import IamCompliance from "@/components/Iam/IamCompliance";
import IamCta from "@/components/Iam/IamCta";

export default function IamPage() {
  return (
    <>
      <IamHero />
      <IamStrip />
      <IamProblem />
      <IamLifecycle />
      <IamCapabilities />
      {/* IamAuthentication and IamGovernance share one tinted band. */}
      <IamAuthentication />
      <IamGovernance />
      <IamPlatform />
      <IamIntegrations />
      <IamCompliance />
      <IamCta />
    </>
  );
}

export const metadata = {
  title: "Iraje IAM | Identity & Access Management",
  description:
    "Iraje IAM decides who gets access to what, for how long, and on whose approval — then proves it. HR-driven joiner, mover and leaver automation, adaptive authentication and audit-ready access certification.",
  keywords: [
    "IAM",
    "Identity and Access Management",
    "Identity Governance",
    "Joiner Mover Leaver",
    "Single Sign-On",
    "Adaptive MFA",
    "Access Certification",
    "Segregation of Duties",
  ],
};
