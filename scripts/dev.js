#!/usr/bin/env node

// Set environment variables to suppress warnings in development
process.env.SUPPRESS_REDIS_WARNINGS = 'true';
process.env.NODE_ENV = 'development';
process.env.ENABLE_REDIS_DEV = 'false';

// Suppress specific Node.js deprecation warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filter out specific warnings we want to suppress in development
  const suppressPatterns = [
    'Redis Client Error',
    'ECONNREFUSED',
    'punycode module is deprecated',
    'DEP0040'
  ];
  
  const shouldSuppress = suppressPatterns.some(pattern => 
    message.includes(pattern)
  );
  
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};

// Start Next.js development server
require('next/dist/cli/next-dev').nextDev([]);
