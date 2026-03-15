Write-Host "🚀 Setting up Productivity Dashboard..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Setup environment file
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    Copy-Item "env-template.txt" ".env"
    Write-Host "✅ Environment file created (.env)" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your Jira and Jenkins credentials" -ForegroundColor Yellow
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

# Setup database
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database tables" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database setup complete" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup complete! You can now run the application with:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 For more information, see README.md" -ForegroundColor Cyan
