// Simple build check script to help diagnose Next.js build issues on Netlify
const fs = require('fs');
const path = require('path');

console.log('=== Build Environment Check ===');

// Check Node.js environment
console.log(`Node.js version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'undefined'}`);

// Check critical environment variables
console.log('\n=== Critical Environment Variables ===');
const criticalVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'POLAR_ACCESS_TOKEN',
];

criticalVars.forEach(varName => {
  console.log(`${varName}: ${process.env[varName] ? '✓ Set' : '✗ Missing'}`);
});

// Check Next.js config
console.log('\n=== Next.js Config ===');
try {
  const nextConfig = require('./next.config.js');
  console.log('Next.js config loaded successfully');
  console.log('Output mode:', nextConfig.output || 'default');
  console.log('Image optimization:', nextConfig.images?.unoptimized ? 'disabled' : 'enabled');
} catch (err) {
  console.error('Failed to load Next.js config:', err.message);
}

// Check package.json
console.log('\n=== Package.json Check ===');
try {
  const packageJson = require('./package.json');
  console.log('Next.js version:', packageJson.dependencies.next);
  console.log('React version:', packageJson.dependencies.react);
  
  // Check for potential incompatibilities
  if (packageJson.dependencies.next.includes('15')) {
    console.warn('⚠️ Warning: Using Next.js 15, which might have compatibility issues with Netlify');
  }
} catch (err) {
  console.error('Failed to load package.json:', err.message);
}

console.log('\n=== Build Check Complete ===');
