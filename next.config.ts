// next.config.js or next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // …other config…
  allowedDevOrigins: ['localhost', '192.168.208.1'],  // ✅ top-level
  experimental: {
    // only your _other_ experimental flags go here…
  },
}

export default nextConfig
