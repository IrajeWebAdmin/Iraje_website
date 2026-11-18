/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  // One ID per build (Cloud Build passes $BUILD_ID via the Dockerfile). Lets
  // Next.js spot a visitor whose page came from an older build and do a full
  // reload instead of requesting JS chunks that no longer exist.
  deploymentId: process.env.DEPLOYMENT_VERSION || `build-${Date.now()}`,
  // Tunnels for showing the dev server to others: Cloudflare quick tunnels and
  // VS Code / GitHub port forwarding (dev tunnels). Only in development, so the
  // live site never accepts form posts from a tunnel address.
  allowedDevOrigins: ['*.trycloudflare.com', '*.devtunnels.ms'],
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      serverActions: {
        allowedOrigins: ['*.trycloudflare.com', '*.devtunnels.ms'],
      },
    },
  }),
  reactCompiler: true,
  // Loaded by Node at runtime instead of bundled: Google's sign-in library
  // reads its own files and environment at runtime (guide Stage 8a).
  // ExcelJS (report downloads) is a Node library that reads its own files.
  // pdf.js (reading label positions in certificate designs) loads its worker
  // file from its own folder.
  serverExternalPackages: ["google-auth-library", "exceljs", "pdfjs-dist"],
};

export default nextConfig;
