@echo off
echo Starting build process...
npm ci
npx vite build
echo Build completed successfully!