import AboutNavbar from "@/components/Navbar/AboutNavbar";
import HomeFooter from "@/components/Footer/HomeFooter";

// Chrome for the University page. Lives outside the (main) route group so it can
// use AboutNavbar instead of inheriting HomeNavbar (mirrors About/EPM/PAM).
export default function UniversityLayout({ children }) {
  return (
    <>
      <AboutNavbar />
      {children}
      <HomeFooter />
    </>
  );
}
