FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src node_modules && \
    npm ci --only=production

# Run as non-root user
USER node

# Start the bot
CMD ["node", "dist/index.js"]
