/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  allowedDevOrigins: ['*.trycloudflare.com'],
  experimental: {serverActions: {allowedOrigins: ['*.trycloudflare.com'],},},
  reactCompiler: true,
  // Loaded by Node at runtime instead of bundled: Google's sign-in library
  // reads its own files and environment at runtime (guide Stage 8a).
  serverExternalPackages: ["google-auth-library"],
};

export default nextConfig;
