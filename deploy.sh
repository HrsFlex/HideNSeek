#!/bin/bash

# Deployment script for Anonymous Chatroom
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building production image...${NC}"

# Build the Docker image
docker-compose build --no-cache

echo -e "${BLUE}🧪 Running health check...${NC}"

# Start the application
docker-compose up -d

# Wait for the application to start
sleep 10

# Check if the application is healthy
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and running!${NC}"
    echo -e "${GREEN}🌐 Access your chat app at: http://localhost${NC}"
    echo -e "${YELLOW}📊 View logs with: docker-compose logs -f${NC}"
    echo -e "${YELLOW}🛑 Stop with: docker-compose down${NC}"
else
    echo -e "${RED}❌ Health check failed. Check logs with: docker-compose logs${NC}"
    docker-compose down
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Quick commands:${NC}"
echo -e "  View logs:     ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop app:      ${YELLOW}docker-compose down${NC}"
echo -e "  Restart app:   ${YELLOW}docker-compose restart${NC}"
echo -e "  View status:   ${YELLOW}docker-compose ps${NC}"