#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, symlinkSync, rmSync } from 'fs';
import path from 'path';

console.log('🔨 Starting custom build process...');

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Create a symlink for shared directory in client folder for easier resolution
  const sharedSymlink = 'client/shared';
  if (existsSync(sharedSymlink)) {
    rmSync(sharedSymlink, { recursive: true, force: true });
  }
  try {
    symlinkSync('../shared', sharedSymlink, 'dir');
    console.log('📁 Created shared directory symlink');
  } catch (linkError) {
    console.log('⚠️  Could not create symlink, copying instead...');
    cpSync('shared', sharedSymlink, { recursive: true });
  }

  console.log('📦 Building frontend with Vite...');
  
  // Try simple config first, fallback to main config
  try {
    console.log('🔄 Trying simple Vite config...');
    execSync('npx vite build --config vite.simple.config.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (simpleError) {
    console.log('⚠️  Simple config failed, trying main config...');
    execSync('npx vite build --config vite.config.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  }

  console.log('⚙️  Building server with esbuild...');
  
  // Build server
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}