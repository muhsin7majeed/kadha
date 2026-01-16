# What to Watch Server

A Node.js server for the What to Watch application.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add your environment variables:

```env
PORT=3000
```

## Development

To run the server in development mode with hot-reload:

```bash
npm run dev
```

## Production

To build and run the server in production mode:

```bash
npm run build
npm start
```

## API Endpoints

- `GET /`: Welcome message

## Project Structure

```
src/
  ├── index.ts        # Main server file
  ├── routes/         # API routes
  ├── controllers/    # Route controllers
  ├── models/         # Data models
  └── middleware/     # Custom middleware
```
