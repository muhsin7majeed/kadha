FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm install --only=production

# Copy source and build
COPY server ./
RUN npm run build

# Set environment variables (in docker-compose)
CMD ["node", "dist/index.js"]
EXPOSE 5000