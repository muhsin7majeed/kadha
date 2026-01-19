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

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Copy built code
COPY --from=builder /app/dist ./dist

# Copy Prisma schema (needed for migrations) and generated client
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create db directory with correct permissions for node user
RUN mkdir -p /app/db && chown -R node:node /app/db

# Don't run as root
USER node

EXPOSE 5000

CMD ["node", "dist/index.js"]
