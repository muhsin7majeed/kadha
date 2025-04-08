FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install

# Copy source and build
COPY . .

WORKDIR /app/server

RUN npm run build

# Set environment variables (in docker-compose)
CMD ["node", "dist/index.js"]
EXPOSE 5000
