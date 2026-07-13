import AboutNavbar from "@/components/Navbar/AboutNavbar";
import CertFooter from "@/components/Footer/CertFooter";

// Chrome for the Certification page. Lives outside the (main) route group so
// it supplies its own navbar/footer (the "Iraje University" identity) instead
// of inheriting HomeNavbar/HomeFooter — mirrors products/epm and products/pam.
export default function CertificationLayout({ children }) {
  return (
    <div className="bg-white text-ink antialiased">
      <AboutNavbar />
      <main>{children}</main>
      <CertFooter />
    </div>
  );
}
