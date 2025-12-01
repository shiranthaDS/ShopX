# ShopX

Modern E-Commerce Platform (MERN) with a microservices architecture.

This repo currently includes the Authentication Service and a single React frontend (shared for the whole system). Additional services (Product, Inventory, Cart, Order, Payment, Notification) can be added under `backend/` following the same pattern.

## Structure
- `backend/auth-service` — Express + MongoDB (JWT via httpOnly cookie)
- `frontend` — Vite + React + Tailwind (Login, Register)
 - `backend/product-service` — Product CRUD, filtering, image upload, categories endpoint

## Prerequisites
- Node.js 18+
- NPM 9+

## Quick Start

1) Auth Service (backend)

```zsh
cd backend/auth-service
cp .env.example .env
# .env is already prefilled with your MongoDB URI and defaults
npm install
npm run dev
```

Backend runs on `http://localhost:4001`.

2) Frontend

```zsh
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

The frontend is configured to call the backend at `http://localhost:4001` and uses `credentials: 'include'` so the httpOnly cookie is set properly.

3) Product Service (backend)

```zsh
cd backend/product-service
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:4002`.

## API (Auth)
## API (Products)
- `GET /api/products` list with query params: `page, limit, category, search, minPrice, maxPrice`
- `GET /api/products/:id` single product
- `GET /api/products/meta/categories` distinct categories
- `POST /api/products` (admin) multipart form: `title, description, price, categories, images[]`
- `PUT /api/products/:id` (admin) partial update + optional new `images[]`
- `DELETE /api/products/:id` (admin) soft delete (sets `active=false`)

Image uploads served from `/uploads/*` in product service.
- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/auth/me` (requires cookie)
- `POST /api/auth/logout` (requires cookie)

Responses include a sanitized `user` object. JWT is set/cleared via `Set-Cookie` on the `shopx_token` cookie.

## Notes
- CORS is configured to allow `http://localhost:5173` with `credentials`.
- Each service should use its own database name (this one uses `auth`).
 - Product service uses `product` database name.
- For production, set `NODE_ENV=production` and ensure HTTPS so cookies are sent with `secure`.

## Next Services
- Product Catalog, Inventory, Cart, Order, Payment, Notification — create a folder per service under `backend/` and reuse the patterns here (Express app, `.env`, routes, models).
