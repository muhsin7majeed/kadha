FROM node:20

WORKDIR /app
COPY server/package*.json ./
RUN npm install

COPY server ./

# For hot reload, install nodemon
RUN npm install -g nodemon

EXPOSE 5000
CMD ["npm", "run", "dev"]