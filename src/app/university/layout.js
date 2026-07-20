import AboutNavbar from "@/components/Navbar/AboutNavbar";
import UniversityFooter from "@/components/Footer/UniversityFooter";

// Chrome for the University page. Lives outside the (main) route group so it can
// use AboutNavbar instead of inheriting HomeNavbar (mirrors About/EPM/PAM), and
// its own UniversityFooter instead of the shared HomeFooter.
export default function UniversityLayout({ children }) {
  return (
    <>
      <AboutNavbar />
      {children}
      <UniversityFooter />
    </>
  );
}
