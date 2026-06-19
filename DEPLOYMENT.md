# Deployment Guide

This project matches the assignment deliverables with:

- GitHub repository link
- Docker Hub backend image link
- Live backend API URL
- Live frontend URL

Recommended free-hosting path:

- Backend API: Render
- PostgreSQL: Render Postgres
- Frontend: Vercel
- Backend image: Docker Hub

## 1. Push to GitHub

Create an empty GitHub repository, then run from the project root:

```bash
git init
git add .
git commit -m "Build inventory and order management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-and-order-management-system.git
git push -u origin main
```

## 2. Push Backend Image to Docker Hub

Start Docker Desktop first, then run:

```bash
docker login
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-order-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-order-backend:latest
```

Submit this as the Docker Hub image link:

```text
https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-order-backend
```

## 3. Deploy Backend on Render

Option A, Blueprint:

1. In Render, create a new Blueprint.
2. Connect the GitHub repository.
3. Select the root `render.yaml`.
4. Deploy the generated web service and Postgres database.

Option B, manual Docker web service:

1. Create a new Render Web Service from the GitHub repository.
2. Set runtime/language to Docker.
3. Set Dockerfile path to `./backend/Dockerfile`.
4. Set Docker context to `./backend`.
5. Add a Render Postgres database.
6. Set backend environment variables:

```text
DATABASE_URL=<Render internal Postgres connection string>
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SEED_DEMO_DATA=true
```

After deployment, test:

```text
https://YOUR_RENDER_SERVICE.onrender.com/health
https://YOUR_RENDER_SERVICE.onrender.com/docs
```

## 4. Deploy Frontend on Vercel

1. Import the same GitHub repository in Vercel.
2. Set the project root directory to `frontend`.
3. Use the Vite defaults:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

4. Add this environment variable:

```text
VITE_API_URL=https://YOUR_RENDER_SERVICE.onrender.com
```

5. Deploy.

## 5. Update Backend CORS

After Vercel gives you the live frontend URL, update Render's `CORS_ORIGINS`:

```text
https://YOUR_VERCEL_APP.vercel.app,http://localhost:3000,http://localhost:5173
```

Redeploy the backend service, then verify the frontend can load dashboard, products, customers, and orders.

## Submission Checklist

- GitHub repository: `https://github.com/YOUR_USERNAME/inventory-and-order-management-system`
- Docker Hub backend image: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-order-backend`
- Live frontend URL: `https://YOUR_VERCEL_APP.vercel.app`
- Live backend API URL: `https://YOUR_RENDER_SERVICE.onrender.com`
