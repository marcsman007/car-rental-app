# Stage 1: Build stage (with all dependencies)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install all dependencies (dev + prod)
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Optional: build step (uncomment if you use TypeScript or other build tools)
# RUN npm run build

# Stage 2: Production stage (only prod dependencies)
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source from builder
COPY --from=builder /app ./

# Expose backend port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
