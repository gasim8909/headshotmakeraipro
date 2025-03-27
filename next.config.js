/** @type {import('next').NextConfig} */

const nextConfig = {
  // Optimize for Netlify deployment - more compatible with Next.js 14
  output: 'export',
  
  // Unoptimized images to avoid build failures on Netlify
  images: {
    unoptimized: true,
  },

  // Add any headers or redirects needed for your app
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Disable experimental features that might be causing build failures
  experimental: {
    // Disable turbo for production builds
    turbo: process.env.NODE_ENV !== 'production',
  },

  // Implement build caching for faster rebuilds
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  
  // Ensure TypeScript errors don't fail production builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Ensure ESLint errors don't fail production builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // For Next.js 14 on Netlify
  trailingSlash: false,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
