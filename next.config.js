/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  images: {
    domains: [
      'images.pexels.com',
      'illustrations.popsy.co',
      'cdn.jsdelivr.net',
      'your-image-domain.com',
      'luiidomyeinydwttqrmc.supabase.co'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    unoptimized: true
  },
  experimental: {
    esmExternals: true,
    webpackBuildWorker: true,
    serverActions: {
      enabled: true
    }
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, apikey, authorization' }
        ]
      }
    ];
  },
  serverRuntimeConfig: {
    prerender: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        punycode: false
      };
    }
    
    // Remove problematic image optimization rules
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.test && rule.test.toString().includes('\\.(gif|png|jpe?g|svg|webp)')) {
        return false;
      }
      return true;
    });
    
    return config;
  },
  pageExtensions: ['jsx', 'js', 'ts', 'tsx']
};

module.exports = nextConfig;
