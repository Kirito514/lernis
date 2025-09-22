@echo off
echo 🚀 Setting up EduNFT development environment...

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pnpm is not installed. Please install pnpm first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

echo ✅ pnpm version: 
pnpm --version

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Copy environment file
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration
) else (
    echo ✅ .env file already exists
)

REM Build shared package
echo 🔨 Building shared package...
pnpm --filter @edunft/shared build

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Start PostgreSQL (or use: docker-compose up -d postgres)
echo 3. Run database migrations: pnpm prisma:migrate
echo 4. Seed the database: pnpm prisma:seed
echo 5. Start development servers: pnpm dev
echo.
echo Or use Docker Compose for everything:
echo docker-compose up -d
pause
