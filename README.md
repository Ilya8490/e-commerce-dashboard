# E-Commerce Analytics Dashboard

## Overview

E-Commerce Analytics Dashboard is a full-stack analytics platform built with the MERN stack and TypeScript.

The application helps online store owners track:

- Revenue
- Orders
- Conversion Funnel
- Product Performance
- Customer Analytics
- Traffic Sources

The project is designed as a portfolio application and currently uses seeded mock data while being architected for future WooCommerce integration.

---

## Features

### Authentication

- JWT Authentication
- httpOnly cookies
- Protected routes
- User registration and login

### Dashboard

- Revenue overview
- Orders overview
- Conversion rate
- Average order value
- Revenue trends

### Products

- Product performance
- Revenue ranking
- Inventory overview
- Search and sorting
- CSV export

### Funnel Analytics

- Visit -> Product View -> Add to Cart -> Checkout -> Order

### Traffic Analytics

- Organic traffic
- Paid traffic
- Direct traffic
- Social traffic
- Email traffic

### Customer Analytics

- New vs Returning customers
- Lifetime Value (LTV)
- Top customers

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

---

## Architecture

Frontend

Client -> API -> Analytics Service

Backend

Routes -> Services -> Commerce Adapter -> Data Source

Current Data Source

MockCommerceAdapter

Future Data Source

WooCommerceAdapter

---

## Future WooCommerce Integration

Planned integration:

- Products Sync
- Orders Sync
- Customers Sync

Data Source:

WooCommerce REST API

Planned Environment Variables:

```env
MONGO_URI=
JWT_SECRET=
WC_API_URL=
WC_CONSUMER_KEY=
WC_CONSUMER_SECRET=
```

---

## Demo Credentials

Email:

demo@demo.com

Password:

demo1234

---

## Local Development

Install dependencies

```bash
npm install
```

Run development servers

```bash
npm run dev
```

Seed database

```bash
npm run seed
```

Run tests

```bash
npm run test
```

Run linting

```bash
npm run lint
```

Run type checking

```bash
npm run typecheck
```

---

## Project Structure

```text
root
├── client
├── server
├── shared
├── package.json
├── tsconfig.base.json
└── README.md
```

The project uses npm workspaces:

- `client` - React/Vite frontend workspace
- `server` - Express API workspace
- `shared` - shared TypeScript contracts for domain entities

---

## Roadmap

Phase 1 - Project Foundation - Complete

Phase 2 - Authentication - Complete

Phase 3 - Analytics Models - Complete

Phase 4 - Seed System - Complete

Phase 5 - Dashboard API

Phase 6 - Frontend Foundation

Phase 7 - Dashboard UI

Phase 8 - Products

Phase 9 - Funnel & Traffic

Phase 10 - Deployment

Phase 11 - WooCommerce Integration

Maintain README.md throughout development. After each completed phase, update the README with architecture decisions, available features, setup instructions, and progress status.

---

## Phase 1 Status

Completed foundation work:

- npm workspaces configured
- TypeScript base configuration added
- ESLint flat config added
- Prettier config added
- `client`, `server`, and `shared` workspaces created
- `.env.example` files created for client and server
- Shared domain entity contracts added:
  - `Order`
  - `Product`
  - `User`
  - `Session`
  - `FunnelEvent`
  - `Customer`

Available commands:

```bash
npm run dev
npm run lint
npm run seed
npm run test
npm run typecheck
```

## Phase 2 Status

Completed authentication work:

- MongoDB connection uses `MONGO_URI`
- User schema added with:
  - `email`
  - `passwordHash`
  - `storeName`
  - `createdAt`
- Auth endpoints added:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- bcrypt password hashing added
- JWT signing and verification added
- httpOnly auth cookie added
- Protected route middleware added
- Zod request validation added
- Standard error response format added:

```json
{
  "error": "message",
  "field": "optional"
}
```

Manual auth test flow:

1. Copy `server/.env.example` to `server/.env`
2. Set `MONGO_URI` and `JWT_SECRET`
3. Run `npm run dev`
4. Register with `POST http://localhost:4000/api/auth/register`
5. Login with `POST http://localhost:4000/api/auth/login`
6. Verify the session with `GET http://localhost:4000/api/auth/me`
7. Logout with `POST http://localhost:4000/api/auth/logout`
8. Confirm `GET http://localhost:4000/api/auth/me` returns `401`

## Phase 3 Status

Completed analytics model work:

- Added MongoDB/Mongoose models for:
  - `Order`
  - `Product`
  - `Customer`
  - `Session`
  - `FunnelEvent`
- Added optional `externalId` fields to `Order`, `Product`, and `Customer`
- Reserved `externalId` for future WooCommerce entity IDs
- Added model indexes for query and sync readiness:
  - `userId`
  - `createdAt` on created analytics entities
  - `date` on time-series analytics entities
  - compound sparse `{ userId, externalId }` where WooCommerce mapping will apply
- Updated shared TypeScript contracts to align with backend analytics models
- Added model tests for enums, indexes, optional external IDs, and seed-compatible order structure

WooCommerce integration note:

No WooCommerce API connection is implemented in this phase. The models are only prepared for future synchronization.

## Phase 4 Status

Completed seed system work:

- Added `server/scripts/seed.ts`
- Added root `npm run seed` command
- Seed script drops and recreates the target MongoDB database
- Seed script is idempotent
- Demo user is created with bcrypt password hashing:
  - Email: `demo@demo.com`
  - Password: `demo1234`
  - Store Name: `Demo Store`
- Generated related demo analytics data:
  - 20 products
  - 20 customers
  - 50 orders
  - 90 session records
  - 450 funnel event records across 90 days
- Orders are linked to customers and products
- Order totals are calculated from product item prices
- `externalId` remains unset for products, customers, and orders until WooCommerce integration exists
- Added seed tests for counts, relationships, idempotency, password hashing, order totals, and funnel progression

Latest seed statistics:

```text
users:        1
products:     20
customers:    20
orders:       50
sessions:     90
funnelEvents: 450
```

Manual seed test flow:

1. Copy `server/.env.example` to `server/.env` if needed
2. Set `MONGO_URI`
3. Run `npm run seed`
4. Confirm the command prints the expected seed statistics
5. Re-run `npm run seed` and confirm the same statistics are printed again

Next phase:

Phase 5 - Dashboard API
