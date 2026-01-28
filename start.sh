#!/bin/bash
# Render deployment startup script

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | xargs)
fi

# Ensure directories exist
mkdir -p server/data
mkdir -p server/uploads
mkdir -p server/logs
mkdir -p server/backups

# Initialize database if it doesn't exist
if [ ! -f server/data/rodb.db ]; then
  echo "Initializing database..."
  node server/config/initDatabase.js
fi

# Start the server
echo "Starting RODB server..."
node server/app.js
