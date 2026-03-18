# Multi-stage build for React frontend

# Stage 1: Base & Dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files and install dependencies (cached layer)
COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

# Stage 2: Development (For Live Sync)
FROM base AS development
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "--port", "80"]

# Stage 3: Build
FROM base AS build
# Copy source code and build
COPY . .
RUN npm run build

# Stage 4: Production with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]