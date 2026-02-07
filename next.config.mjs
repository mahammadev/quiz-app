/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed ignoreBuildErrors - will properly handle TS errors instead
  images: {
    unoptimized: true,
  },
  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Enable experimental optimizations
  experimental: {
    // optimizeCss: true, // Potential conflict with Turbopack in experimental Next.js versions
    memoryLimit: 512, // MB - Reduce memory footprint
  },
}

export default nextConfig
