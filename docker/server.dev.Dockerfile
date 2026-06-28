FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci
RUN npm i -D tsx

COPY server ./

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 5000

# Regenerate Prisma Client because the source tree is mounted in dev while node_modules is a persistent volume.
CMD npx prisma generate --schema=./src/prisma/schema.prisma && npx prisma migrate deploy --schema=./src/prisma/schema.prisma && npm run dev
