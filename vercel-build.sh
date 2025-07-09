#!/bin/bash

# Vercel build script that includes database migration
echo "🚀 Starting Vercel build process..."

# Run the migration first
echo "📊 Running database migration..."
node migrate-db.js

# Then run the normal build
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"