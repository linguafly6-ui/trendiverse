import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Pages serves the app via next-on-pages; keep image handling
    // compatible with the static Pages output while allowing remote sources.
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default nextConfig
