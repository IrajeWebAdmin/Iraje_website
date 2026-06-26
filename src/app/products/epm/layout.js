import EpmNavbar from "@/components/Navbar/EpmNavbar";
import EpmFooter from "@/components/Footer/EpmFooter";

// Font is inherited from the root layout (Poppins, site-wide).
export default function EpmLayout({ children }) {
  return (
    <div className="bg-white text-ink antialiased">
      <EpmNavbar />
      <main>{children}</main>
      <EpmFooter />
    </div>
  );
}
