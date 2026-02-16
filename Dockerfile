FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files after build
RUN rm -rf src node_modules && \
    npm ci --only=production

# Run as non-root user
USER node

# Start the bot
CMD ["node", "dist/index.js"]
