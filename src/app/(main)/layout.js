import HomeNavbar from "@/components/Navbar/HomeNavbar";
import HomeFooter from "@/components/Footer/HomeFooter";

// Chrome for the main marketing site (home + future light-themed pages).
// Lives in a route group so product pages (e.g. /products/epm) can supply
// their own navbar/footer without inheriting these.
export default function MainLayout({ children }) {
  return (
    <>
      <HomeNavbar />
      {children}
      <HomeFooter />
    </>
  );
}
