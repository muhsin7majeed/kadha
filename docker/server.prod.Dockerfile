FROM node:20-alpine AS builder

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server ./

# Generate Prisma client before building
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Don't run as root
USER node

EXPOSE 5000

CMD ["node", "dist/index.js"]
