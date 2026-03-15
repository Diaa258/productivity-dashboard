#!/bin/bash

echo "🚀 Setting up Productivity Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env-template.txt .env
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please edit .env file with your Jira and Jenkins credentials"
else
    echo "✅ Environment file already exists"
fi

# Setup database
echo "🗄️  Setting up database..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to create database tables"
    exit 1
fi

echo "✅ Database setup complete"

echo ""
echo "🎉 Setup complete! You can now run the application with:"
echo "   npm run dev"
echo ""
echo "📖 For more information, see README.md"