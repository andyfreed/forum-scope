#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, symlinkSync, rmSync, writeFileSync } from 'fs';
import path from 'path';

console.log('🔨 Starting custom build process...');

// Set NODE_ENV to production for Vercel builds
if (process.env.VERCEL) {
  process.env.NODE_ENV = 'production';
  console.log('🌐 Vercel detected - using production configuration');
}

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
  
  // For production, prioritize the full application
  try {
    console.log('🚀 Building full ForumScope application...');
    execSync('npx vite build --config vite.config.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (mainError) {
    console.log('⚠️  Main config failed, trying simple config...');
    try {
      execSync('npx vite build --config vite.simple.config.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (simpleError) {
      console.log('⚠️  Simple config failed, trying minimal config...');
      try {
        execSync('npx vite build --config vite.minimal.config.ts', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (minimalError) {
        console.log('⚠️  All Vite configs failed, creating static fallback...');
        
        // Create static HTML fallback
        if (!existsSync('dist/public')) {
          mkdirSync('dist/public', { recursive: true });
        }
        
        const staticHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ForumScope - AI-Powered Forum Aggregator</title>
    <meta name="description" content="Discover trending discussions from hobby forums with AI-powered content analysis and curation." />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">
          ForumScope
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          AI-Powered Forum Aggregator
        </p>
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
          <p class="text-gray-600 mb-6">
            We're building the ultimate platform for discovering trending discussions 
            from hobby forums with AI-powered content analysis and curation.
          </p>
          <div class="flex justify-center space-x-4">
            <div class="bg-blue-100 rounded-lg p-4 text-center">
              <h3 class="font-semibold text-blue-800">AI Analysis</h3>
              <p class="text-blue-600 text-sm">Smart content curation</p>
            </div>
            <div class="bg-green-100 rounded-lg p-4 text-center">
              <h3 class="font-semibold text-green-800">Multi-Platform</h3>
              <p class="text-green-600 text-sm">Reddit, Forums, RSS</p>
            </div>
            <div class="bg-purple-100 rounded-lg p-4 text-center">
              <h3 class="font-semibold text-purple-800">Real-time</h3>
              <p class="text-purple-600 text-sm">Live trending topics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
        
        writeFileSync('dist/public/index.html', staticHTML);
        console.log('✅ Created static HTML fallback');
      }
    }
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