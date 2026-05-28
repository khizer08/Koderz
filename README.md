# Koderz:-

Koderz is a small full-stack algorithm learning project with:

- a React frontend for learning, visualizing, comparing, and analyzing algorithms
- an Express backend with REST APIs
- a Python analyzer used by the backend for AST-based complexity analysis
- MongoDB for saving analysis history

## Project structure

```text
Koderz/
|-- frontend/   React app
|-- backend/    Express + MongoDB API
|-- analyzer/   Python analyzer
`-- README.md
```

## What you need

Install these first:

- Node.js 18+ and npm
- Python 3.x
- MongoDB local server, or a MongoDB Atlas connection string

This repo was checked in an environment with:

- Node.js `v22.15.0`
- npm `11.12.1`
- Python `3.x`

## Quick start

Open two terminals: one for the backend and one for the frontend.

### 1. Start MongoDB

If you use local MongoDB, make sure it is running before starting the backend.

Default local connection used by this project:

```env
mongodb://localhost:27017/koderz
```

If you use MongoDB Atlas, put your Atlas URI in `backend/.env`.

### 2. Configure and run the backend

In PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Configure and run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The frontend runs on:

```text
http://localhost:3000
```

If you only want to explore the current UI, the frontend can be started by itself.
For full-stack development and API testing, run both frontend and backend.

## Environment variables

The backend uses `backend/.env`.

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/koderz
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## How the app currently works

- `frontend/` contains the UI.
- `backend/` exposes API routes for algorithm data, comparison, and analysis history.
- `analyzer/analyzer.py` is called by the backend for deeper Python code analysis.

Important note:

- The frontend currently performs its analyzer view locally inside `frontend/src/App.jsx`.
- The backend is still useful for API testing and saving analysis history.
- For the Python-based backend analyzer, the backend expects `python3` to be available in your PATH.

## Useful backend routes

Once the backend is running, these routes are available:

```text
GET    /api/health
GET    /api/algorithms
GET    /api/algorithms/:slug
POST   /api/algorithms/visualize
POST   /api/comparison/benchmark
POST   /api/analysis/analyze
GET    /api/analysis/history/:sessionId
GET    /api/analysis/:id
DELETE /api/analysis/:id
```

## Troubleshooting

### Frontend does not start

Make sure you ran:

```powershell
cd frontend
npm install
npm start
```

This repo needs these frontend entry files:

- `frontend/public/index.html`
- `frontend/src/index.js`

They should now be present.

### Backend cannot connect to MongoDB

Check:

- MongoDB is running locally, or
- `MONGO_URI` in `backend/.env` points to a valid Atlas database

### Python analyzer does not run

The backend invokes `python3` to run the analyzer inside `analyzer/analyzer.py`.

If `python3` is not available on your machine, install Python and make sure it is added to PATH.

If Python is missing, the backend code falls back to a JavaScript heuristic analyzer.

### Strange `{backend` folder at the repo root

There is an extra malformed folder in the repo named `{backend`.
It does not appear to be part of the working app and can be ignored while running the project.

## Recommended run order

1. Start MongoDB
2. Start the backend from `backend/`
3. Start the frontend from `frontend/`
4. Open `http://localhost:3000`

## Next cleanup items--

These are not required just to run the project, but they would improve it:

- wire the frontend analyzer UI to the backend API
- add a root-level script to start frontend and backend together
- remove the malformed `{backend` folder
- add lockfiles and basic setup docs for contributors