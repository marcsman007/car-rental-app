# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first (for caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for Tailwind build)
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the React build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config for SPA routing + API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
