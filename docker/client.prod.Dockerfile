FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package*.json ./

RUN npm ci

COPY client ./
COPY CHANGELOG.md ./CHANGELOG.md

ARG VITE_APP_NAME=Kadha
ARG VITE_APP_URL=https://kadha.org
ARG VITE_API_URL=https://api.kadha.org

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
