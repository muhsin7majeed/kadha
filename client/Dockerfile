# Stage 1: Build the React app
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install

RUN npm install
COPY . .

WORKDIR /app/client

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
