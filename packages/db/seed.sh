#!/bin/bash

# Seed script to populate database with mock data
# This script runs the TypeScript seed file using Prisma

set -e

echo "🚀 Starting database seed..."
echo ""

# Navigate to db package directory
cd "$(dirname "$0")"

# Check if .env file exists and DATABASE_URL is set
if [ ! -f "../../apps/web/.env" ]; then
  echo "⚠️  Warning: .env file not found at apps/web/.env"
  echo "   Please ensure DATABASE_URL is set in your environment"
fi

# Check if Prisma client is generated
if [ ! -d "prisma/generated" ]; then
  echo "📦 Generating Prisma client..."
  bun run db:generate
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  bun install
fi

# Check if tsx is available (for running TypeScript)
if ! command -v tsx &> /dev/null && ! command -v bun &> /dev/null; then
  echo "❌ Error: Neither 'tsx' nor 'bun' is available"
  echo "   Please install bun: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# Run the seed script
echo "🌱 Running seed script..."
echo ""

if command -v bun &> /dev/null; then
  bun run prisma/seed.ts
elif command -v tsx &> /dev/null; then
  tsx prisma/seed.ts
else
  echo "❌ Error: No TypeScript runner found"
  exit 1
fi

echo ""
echo "✅ Seed completed!"

