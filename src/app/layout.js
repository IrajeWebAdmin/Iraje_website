import { Poppins } from "next/font/google";
import "./globals.css";
import { ClearChunkFlag } from "./clear-chunk-flag";

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

// Lets the CDN (Firebase Hosting) keep a page for at most 1 hour. Without this
// every static page is sent with s-maxage=31536000 (1 year), so after a deploy
// visitors could keep getting old pages whose JS chunks no longer exist.
// Applies to every route below this layout.
export const revalidate = 3600;

// Root layout: html/body + the global default font only.
// Per-section chrome (navbar/footer) is supplied by route-group layouts:
//   (main)/layout.js          -> HomeNavbar + HomeFooter
//   products/epm/layout.js     -> EpmNavbar + EpmFooter
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className}`}>
        <ClearChunkFlag />
        {children}
      </body>
    </html>
  );
}
