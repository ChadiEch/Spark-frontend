#!/bin/bash

# Health check script for Winnerforce Spark Platform

HEALTH_ENDPOINT="http://localhost:5001/api/health"
TIMEOUT=30

echo "Checking application health..."

# Wait for the application to start
for i in $(seq 1 $TIMEOUT); do
  response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)
  if [ "$response" = "200" ]; then
    echo "Application is healthy!"
    exit 0
  fi
  echo "Waiting for application to start... ($i/$TIMEOUT)"
  sleep 1
done

echo "Application failed to start within $TIMEOUT seconds."
exit 1