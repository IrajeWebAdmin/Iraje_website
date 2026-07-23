import HomeNavbar from "@/components/Navbar/HomeNavbar";
import EpmFooter from "@/components/Footer/EpmFooter";

// Chrome for the Contact page. Lives outside the (main) route group so it can
// use EpmFooter instead of inheriting HomeFooter, while keeping HomeNavbar.
export default function ContactLayout({ children }) {
  return (
    <>
      <HomeNavbar />
      {children}
      <EpmFooter />
    </>
  );
}
