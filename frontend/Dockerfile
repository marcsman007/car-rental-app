# ---------- Build Stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files first (enables smarter caching for npm install)
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Ensure a clean build
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
