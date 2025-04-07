FROM node:20

WORKDIR /app

COPY package*.json package-lock.json ./
COPY client/package*.json package-lock.json ./client/
COPY server/package*.json package-lock.json ./server/

RUN npm ci

COPY client .

EXPOSE 3000

CMD ["npm", "run", "dev"]
