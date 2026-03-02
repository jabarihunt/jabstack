# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Build argument for public URL (needed at build time)
ARG PUBLIC_APP_URL=$PUBLIC_APP_URL

# Set as environment variable for the build
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "./build/index.js"]
