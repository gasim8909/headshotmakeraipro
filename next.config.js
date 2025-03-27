/** @type {import('next').NextConfig} */

const nextConfig = {
  // Optimize for Netlify deployment
  output: 'standalone',
  
  // Disable image optimization during development to improve DX
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
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
  
  // Remove tempo for production build to avoid compatibility issues
  experimental: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEMPO ? {
    // NextJS 15+: 
    // Temporarily disabling tempo-devtools for production builds
  } : {},

  // Ensure TypeScript errors don't fail production builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Ensure ESLint errors don't fail production builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
