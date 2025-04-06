/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Define environment variables with default values to ensure they're available during build
  env: {
    NEXT_PUBLIC_IS_MAINTENANCE: process.env.NEXT_PUBLIC_IS_MAINTENANCE || 'false',
    NEXT_PUBLIC_SCHEDULED_MAINTENANCE: process.env.NEXT_PUBLIC_SCHEDULED_MAINTENANCE || 'false',
  },
  // Server external packages that need special handling
  serverExternalPackages: ['sharp', 'canvas'],
  // Suppress hydration warnings for body attributes added by browser extensions
  experimental: {
    suppressHydrationWarning: true,
  },
};

module.exports = nextConfig; 