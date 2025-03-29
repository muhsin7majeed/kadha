# 🛠 What to Watch - Project Setup Guide

Welcome to the **What to Watch** app! Follow these instructions to set up and run the application locally using Docker.


## ⚙️ Prerequisites

Make sure you have the following installed:

- Docker Desktop
- Docker Compose
- Node.js (if running outside of Docker)
- WSL (if using Windows)


## 🚀 Setup with Docker

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd what-to-watch-app
```

### 2️⃣ Environment Variables

- Create a `.env` file in the **server** directory:
  ```bash
  touch server/.env
  ```
- Add the following variables:
  ```env
  PORT=5000
  MONGO_URI=mongodb://mongo:27017/what-to-watch
  ```
- For the client, add a `.env` file if needed, with Vite-specific variables (optional).

### 3️⃣ Build and Run Containers

```bash
docker-compose up --build
```

- `--build` ensures fresh images are created if there are code or config changes.

### 4️⃣ Access the App

- Client: [http://localhost:3000](http://localhost:3000)
- Server API: [http://localhost:5000](http://localhost:5000)


## 🐳 Docker Commands Cheat Sheet

### Start Containers

```bash
docker-compose up
```

### Rebuild and Start

```bash
docker-compose up --build
```

### Stop Containers

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f
```

### Access a Running Container

```bash
docker exec -it <container_name> /bin/bash
```

### Check Container Status

```bash
docker ps
```


## 🛠 Development Notes

- Server runs on **port 5000**.
- Client runs on **port 3000** using Vite.
- MongoDB runs on **port 27017**.
- Nodemon is used for live server reloading in development.


Happy coding! 🚀
