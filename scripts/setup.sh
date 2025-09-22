#!/bin/bash

# EduNFT Setup Script
echo "🚀 Setting up EduNFT development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is 18+
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Check if PostgreSQL is running
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL or use Docker Compose"
    fi
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL or use Docker Compose"
fi

# Build shared package
echo "🔨 Building shared package..."
pnpm --filter @edunft/shared build

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start PostgreSQL (or use: docker-compose up -d postgres)"
echo "3. Run database migrations: pnpm prisma:migrate"
echo "4. Seed the database: pnpm prisma:seed"
echo "5. Start development servers: pnpm dev"
echo ""
echo "Or use Docker Compose for everything:"
echo "docker-compose up -d"
