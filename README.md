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

Phase 3 - Analytics Models

Phase 4 - Seed System

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

Next phase:

Phase 3 - Analytics Models
