#!/bin/bash

# Deployment script for Winnerforce Spark Platform

echo "Starting deployment process..."

# Check if we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "Warning: You are not on the main branch. Do you want to continue? (y/N)"
  read -r response
  if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Deployment cancelled."
    exit 1
  fi
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Deployment cancelled."
  exit 1
fi

# Restart the server (assuming PM2 is used)
echo "Restarting server..."
cd server
npm ci
pm2 restart server.js

echo "Deployment completed successfully!"