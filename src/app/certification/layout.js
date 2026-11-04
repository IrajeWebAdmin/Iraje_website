import AboutNavbar from "@/components/Navbar/AboutNavbar";
import CertFooter from "@/components/Footer/CertFooter";
import HideOnPaths from "@/components/Footer/HideOnPaths";

// Learner-portal pages render their own top bar (PortalHeader: logo + user
// menu) and have no footer, so the shared chrome stays out of their way.
// The dashboard renders it itself; the learning pages get it from learn/layout.js.
const PORTAL_PATHS = ["/certification/dashboard"];
const PORTAL_PREFIXES = ["/certification/learn/"];

// Chrome for the Certification page. Lives outside the (main) route group so
// it supplies its own navbar/footer (the "Iraje University" identity) instead
// of inheriting HomeNavbar/HomeFooter — mirrors products/epm and products/pam.
// The sign-in and password pages (change, forgot, reset) have no footer;
// portal pages have neither navbar nor footer.
export default function CertificationLayout({ children }) {
  return (
    <div className="text-ink bg-white antialiased">
      <HideOnPaths paths={PORTAL_PATHS} prefixes={PORTAL_PREFIXES}>
        <AboutNavbar />
      </HideOnPaths>
      <main>{children}</main>
      <HideOnPaths
        paths={[
          "/certification/login",
          "/certification/change-password",
          "/certification/forgot-password",
          "/certification/reset-password",
          ...PORTAL_PATHS,
        ]}
        prefixes={PORTAL_PREFIXES}
      >
        <CertFooter />
      </HideOnPaths>
    </div>
  );
}
