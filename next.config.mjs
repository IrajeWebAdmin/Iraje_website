/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'standalone',
  allowedDevOrigins: ['*.trycloudflare.com'],
  experimental: {serverActions: {allowedOrigins: ['*.trycloudflare.com'],},},
  reactCompiler: true,
};

export default nextConfig;
