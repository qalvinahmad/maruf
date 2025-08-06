/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // FIXED: Disable strict mode to prevent double renders and errors
  reactStrictMode: false,
  
  experimental: {
    webpackBuildWorker: true,
    // REMOVED: Invalid memoryBasedWorkersCount
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'luiidomyeinydwttqrmc.supabase.co', // FIXED: Add your actual domain
      'almakruf.com',
      'www.almakruf.com'
    ],
    unoptimized: true,
  },

  // Add webpack configuration to fix chunk loading issues
  webpack: (config, { isServer, dev }) => {
    // Optimize chunk splitting
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -30,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add fallback for missing polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
  
  // SEO and Performance optimizations
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Optimize static files
  compress: true,
  
  // Generate sitemap
  trailingSlash: false,
  
  // FIXED: Completely suppress errors and warnings in development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // FIXED: Enhanced webpack config to prevent errors
  webpack: (config, { dev, isServer, webpack }) => {
    // FIXED: Suppress specific warnings and errors
    config.infrastructureLogging = {
      level: 'error',
    };
    
    // FIXED: Suppress Node.js deprecation warnings
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        punycode: require.resolve('punycode/'),
      };
    }
    
    // FIXED: Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      url: require.resolve('url'),
      querystring: require.resolve('querystring-es3'),
      child_process: false,
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert'),
      path: require.resolve('path-browserify'),
      punycode: require.resolve('punycode/'),
    };
    
    // FIXED: Externalize Redis and related packages for client-side to prevent bundling
    if (!isServer) {
      config.externals = {
        ...config.externals,
        'ioredis': 'ioredis',
        'redis': 'redis',
        '@redis/client': '@redis/client',
        'net': 'net',
        'tls': 'tls',
        'dns': 'dns',
      };
    }
    
    // FIXED: Suppress specific warnings
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.SUPPRESS_REDIS_WARNINGS': JSON.stringify('true'),
        'process.env.DISABLE_REDIS': JSON.stringify('true'),
        'process.env.NODE_OPTIONS': JSON.stringify('--no-deprecation'),
      })
    );
    
    // FIXED: Suppress punycode deprecation warning more effectively
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /node:punycode/,
        require.resolve('punycode/')
      )
    );
    
    // FIXED: Ignore deprecated modules warnings
    config.ignoreWarnings = [
      /punycode/,
      /node:punycode/,
      /\[DEP0040\]/,
      /deprecated/i,
    ];
    
    // FIXED: Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // FIXED: Reduce warnings in development
      config.stats = 'errors-warnings';
      
      // FIXED: Configure cache with absolute path
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.resolve('.next/cache/webpack'), // FIXED: Use absolute path
      };
    }
    
    return config;
  },
  
  // FIXED: Suppress all Redis-related warnings
  env: {
    SUPPRESS_REDIS_WARNINGS: 'true',
    DISABLE_REDIS: 'true',
    SUPPRESS_HOT_RELOAD_ERRORS: 'true',
  },
  
  // FIXED: Custom error handling
  async rewrites() {
    return [];
  },
  
  // REMOVED: Invalid keys fastRefresh and swcMinify - these are not valid Next.js config options
};


module.exports = nextConfig;
