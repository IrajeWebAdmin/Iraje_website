import AboutNavbar from "@/components/Navbar/AboutNavbar";
import AboutFooter from "@/components/Footer/AboutFooter";

// Chrome for the About page. Lives outside the (main) route group so it can
// supply its own navbar/footer instead of inheriting HomeNavbar/HomeFooter
// (mirrors how products/epm and products/pam provide their own chrome).
export default function AboutLayout({ children }) {
  return (
    <>
      <AboutNavbar />
      {children}
      <AboutFooter />
    </>
  );
}
