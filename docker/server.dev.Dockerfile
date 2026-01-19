FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci

COPY server ./

# Generate Prisma client
RUN npx prisma generate --schema=./src/prisma/schema.prisma

EXPOSE 5000

CMD ["npm", "run", "dev"]