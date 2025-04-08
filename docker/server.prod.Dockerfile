FROM node:20

WORKDIR /app

COPY server/package*.json ./

RUN npm install --production

RUN npm run build

COPY server ./

EXPOSE 5000
CMD ["node", "dist/index.js"]
