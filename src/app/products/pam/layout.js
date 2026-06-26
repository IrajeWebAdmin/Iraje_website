import PamNavbar from "@/components/Navbar/PamNavbar";
import PamFooter from "@/components/Footer/PamFooter";

// Font is inherited from the root layout (Poppins, site-wide).
// Per-section chrome for the PAM product page (navy hero, light body, navy footer).
export default function PamLayout({ children }) {
  return (
    <div className="bg-white text-ink antialiased">
      <PamNavbar />
      <main>{children}</main>
      <PamFooter />
    </div>
  );
}
