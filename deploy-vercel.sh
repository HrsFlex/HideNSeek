#!/bin/bash

# Vercel Deployment Script for Anonymous Chatroom
set -e

echo "🚀 Deploying Anonymous Chatroom to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ vercel.json not found. Make sure you're in the project root directory.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building React application...${NC}"

# Build the React app
npm run build

echo -e "${BLUE}🔧 Verifying Vercel configuration...${NC}"

# Check if api directory exists
if [ ! -d "api" ]; then
    echo -e "${RED}❌ API directory not found. Creating it now...${NC}"
    mkdir -p api
fi

# Check if API index file exists
if [ ! -f "api/index.js" ]; then
    echo -e "${RED}❌ API index.js not found in api/ directory.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All files ready for deployment${NC}"

echo -e "${BLUE}🌐 Deploying to Vercel...${NC}"

# Deploy to Vercel
npx vercel --prod

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "  1. ${YELLOW}Visit your Vercel URL${NC}"
echo -e "  2. ${YELLOW}Test room creation with code like '1943'${NC}"
echo -e "  3. ${YELLOW}Open another browser tab and join the same room${NC}"
echo -e "  4. ${YELLOW}Test real-time messaging${NC}"
echo ""
echo -e "${GREEN}🔗 Your chat app is now live on Vercel!${NC}"