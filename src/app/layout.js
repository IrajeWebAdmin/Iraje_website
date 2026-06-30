import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
    style: ["normal", "italic"],
});

export const metadata = {
  title: "Iraje | Privileged Security",
  description:
    "Iraje secures every privileged identity across access, endpoints and identity.",
};

// Root layout: html/body + the global default font only.
// Per-section chrome (navbar/footer) is supplied by route-group layouts:
//   (main)/layout.js          -> HomeNavbar + HomeFooter
//   products/epm/layout.js     -> EpmNavbar + EpmFooter
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className}`}>
        {children}
      </body>
    </html>
  );
}
