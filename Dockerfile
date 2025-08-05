# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --only=production
RUN cd client && npm install --only=production

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Remove client source code and dev dependencies to reduce image size
RUN rm -rf client/src client/public client/node_modules
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S chatapp -u 1001

# Change ownership of app directory
RUN chown -R chatapp:nodejs /app
USER chatapp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]