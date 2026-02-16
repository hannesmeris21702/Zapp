#!/bin/bash

# Installation script for Cetus Liquidity Rebalance Bot
# This script helps you set up the bot quickly

set -e

echo "🚀 Installing Cetus Liquidity Rebalance Bot..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version more robustly
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d '.' -f 1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v 2>/dev/null || echo 'unknown')"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file - please edit it with your configuration"
    echo ""
else
    echo "⚠️  .env file already exists - skipping"
    echo ""
fi

# Build the project
echo "🔨 Building TypeScript project..."
npm run build
echo ""

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Sui wallet private key and pool address"
echo "2. Review QUICKSTART.md for configuration guide"
echo "3. Test with dry run: npm run dev"
echo "4. Go live: Set DRY_RUN=false in .env and run: npm start"
echo ""
echo "📚 For detailed documentation, see README.md"
