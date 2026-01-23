FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server ./

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 5000

# Run migrations then start dev server
CMD npx prisma migrate deploy --schema=./src/prisma/schema.prisma && npm run dev