FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /demo

COPY demo/package*.json ./
RUN npm ci --omit=dev

COPY demo ./

CMD ["npm", "run", "capture"]
