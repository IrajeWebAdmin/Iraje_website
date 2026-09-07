import IamNavbar from "@/components/Navbar/IamNavbar";
import IamFooter from "@/components/Footer/IamFooter";

// Font is inherited from the root layout (Poppins, site-wide).
// Per-section chrome for the IAM product page (navy hero, light body, navy footer).
export default function IamLayout({ children }) {
  return (
    <div className="bg-white text-ink antialiased">
      <IamNavbar />
      <main>{children}</main>
      <IamFooter />
    </div>
  );
}
