/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.trycloudflare.com'],
  experimental: {serverActions: {allowedOrigins: ['*.trycloudflare.com'],},},
  reactCompiler: true,
};

export default nextConfig;
