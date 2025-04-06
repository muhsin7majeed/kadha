# Use Node.js for building
FROM node:20 

WORKDIR /app

# Copy root package.json and lock file to install all workspace dependencies
COPY package.json package-lock.json ./

# Install all dependencies (including client/server workspaces)
RUN npm install

# Copy everything else (client and server included)
COPY . .

EXPOSE 3000 5000
