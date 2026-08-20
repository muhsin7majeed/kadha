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

# Copy Prisma config, schema (needed for migrations) and generated client
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create persistent-data mount points with the correct permissions for the node user.
RUN mkdir -p /app/db /app/backups && chown -R node:node /app/db /app/backups

# Don't run as root
USER node

EXPOSE 5000

# Back up the existing database before running migrations, then start the server.
CMD node dist/scripts/database-backup.js backup && npx prisma migrate deploy --schema=./src/prisma/schema.prisma && node dist/index.js
