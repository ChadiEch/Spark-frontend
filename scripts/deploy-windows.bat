@echo off
REM Deployment script for Winnerforce Spark Platform (Windows)

echo Starting deployment process...

REM Check if we're on the main branch
git branch --show-current | findstr /C:"main" >nul
if %errorlevel% neq 0 (
    echo Warning: You are not on the main branch. Do you want to continue? (y/N)
    set /p response=""
    if /i not "%response%"=="y" (
        echo Deployment cancelled.
        exit /b 1
    )
)

REM Pull latest changes
echo Pulling latest changes...
git pull origin main

REM Install dependencies
echo Installing dependencies...
npm ci

REM Build the frontend
echo Building frontend...
npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo Build failed. Deployment cancelled.
    exit /b 1
)

REM Restart the server (assuming PM2 is used)
echo Restarting server...
cd server
npm ci
pm2 restart server.js

echo Deployment completed successfully!