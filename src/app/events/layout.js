import AboutNavbar from "@/components/Navbar/AboutNavbar";
import PamFooter from "@/components/Footer/PamFooter";

// Chrome for the Events page: the white navbar with the soft shadow line (as in
// the Events design, and as About / University use) and the PAM page's navy footer.
export default function EventsLayout({ children }) {
  return (
    <>
      <AboutNavbar />
      {children}
      <PamFooter />
    </>
  );
}
