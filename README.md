# Inventory and Order Management System

Production-ready full-stack assessment project with a React frontend, FastAPI backend, PostgreSQL database, and Docker Compose orchestration.

## Features

- Product CRUD with unique SKU validation, price validation, and non-negative stock.
- Customer create/list/detail/delete with unique email validation.
- Order create/list/detail/delete with backend-calculated totals.
- Inventory protection: insufficient stock is rejected and successful orders reduce stock automatically.
- Dashboard summary for total products, customers, orders, and low-stock products.
- Demo products, customers, and orders are seeded into a fresh database volume for reviewer convenience.
- Responsive React UI with form validation, success messages, and API error handling.

## Tech Stack

- Frontend: React, Vite, JavaScript
- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL
- Containerization: Docker and Docker Compose

## Local Docker Setup

1. Copy environment defaults:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with a strong `POSTGRES_PASSWORD`.

3. Start the full stack:

   ```bash
   docker compose up --build
   ```

4. Open the app:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API docs: http://localhost:8000/docs

## API Endpoints

### Products

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`

### Customers

- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`

### Orders

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

### Dashboard

- `GET /dashboard`

## Deployment Notes

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full reviewer-ready deployment checklist.

Backend can be deployed to Render, Railway, or Fly.io using `backend/Dockerfile`. Configure:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `SEED_DEMO_DATA` (`true` for reviewer demo data, `false` for an empty production database)

Frontend can be deployed to Vercel or Netlify from the `frontend` directory. Configure:

- `VITE_API_URL`

For Docker Hub, build and push the backend image:

```bash
docker build -t your-dockerhub-user/inventory-backend:latest ./backend
docker push your-dockerhub-user/inventory-backend:latest
```

## Verification

Offline-friendly backend business logic tests are included:

```bash
cd backend
python -m unittest discover -s tests
```

With dependencies installed, also run:

```bash
cd frontend
npm install
npm run build
```
