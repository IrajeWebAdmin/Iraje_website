import EpmHero from "@/components/Epm/EpmHero";
import EpmThreat from "@/components/Epm/EpmThreat";
import EpmKillChain from "@/components/Epm/EpmKillChain";
import EpmStack from "@/components/Epm/EpmStack";
import EpmComparison from "@/components/Epm/EpmComparison";
import EpmCoreProblem from "@/components/Epm/EpmCoreProblem";
import EpmEightWays from "@/components/Epm/EpmEightWays";
import EpmPillars from "@/components/Epm/EpmPillars";
import EpmArchitecture from "@/components/Epm/EpmArchitecture";
import EpmDifferentiators from "@/components/Epm/EpmDifferentiators";
import EpmCompliance from "@/components/Epm/EpmCompliance";
import CapabilityStrip from "@/components/Epm/CapabilityStrip";

export default function EpmPage() {
  return (
    <>
      <EpmHero />
      <CapabilityStrip/>
      <EpmThreat />
      <EpmKillChain />
      <EpmStack />
      <EpmComparison />
      <EpmCoreProblem />
      <EpmEightWays />
      <EpmPillars />
      <EpmArchitecture />
      <EpmDifferentiators />
      <EpmCompliance />
    </>
  );
}

export const metadata = {
  title: "Iraje EPM | Endpoint Privilege Management",
  description:
    "Iraje EPM enforces least privilege on every endpoint — removing standing local admin rights, rotating local admin passwords hourly, and stopping ransomware before it can start.",
  keywords: [
    "EPM",
    "Endpoint Privilege Management",
    "Least Privilege",
    "Local Admin Rights",
    "Just-in-Time Elevation",
    "Ransomware Prevention",
  ],
};
