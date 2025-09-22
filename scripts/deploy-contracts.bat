@echo off
echo 🚀 Deploying EduNFT contracts to Mumbai testnet...

REM Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please create it from env.example
    pause
    exit /b 1
)

REM Check if PRIVATE_KEY is set
findstr /C:"PRIVATE_KEY=" .env | findstr /C:"0x" >nul
if errorlevel 1 (
    echo ❌ PRIVATE_KEY not set in .env file
    pause
    exit /b 1
)

REM Check if MUMBAI_RPC_URL is set
findstr /C:"MUMBAI_RPC_URL=" .env | findstr /C:"https://" >nul
if errorlevel 1 (
    echo ❌ MUMBAI_RPC_URL not set in .env file
    pause
    exit /b 1
)

echo ✅ Environment variables configured

REM Install contract dependencies
echo 📦 Installing contract dependencies...
cd contracts
pnpm install

REM Deploy contracts
echo 🚀 Deploying contracts to Mumbai...
pnpm deploy:mumbai

echo 🎉 Contract deployment complete!
echo.
echo ⚠️  Don't forget to:
echo 1. Update CONTRACT_ADDRESS in your .env files
echo 2. Verify the contract on Polygonscan
echo.
pause
