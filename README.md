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

- Revenue, orders, conversion rate, and average order value KPI cards
- Delta badges for revenue and order movement
- Revenue trend line chart
- Orders by status donut chart
- Loading and error states for dashboard data

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

Phase 5 - Dashboard API - Complete

Phase 6 - Frontend Foundation - Complete

Phase 7 - Dashboard UI - Complete

Phase 8 - Products - Complete

Phase 9 - Funnel & Traffic - Complete

Phase 10 - Customers - Complete

Phase 11 - Deployment

Phase 12 - WooCommerce Integration

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
  - 50 products
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
products:     50
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

## Phase 5 Status

Completed dashboard API work:

- Added protected REST endpoints under `/api`
- All dashboard routes use auth middleware
- Routes call services, services call the commerce adapter, and the adapter owns MongoDB access
- Added overview endpoint:
  - `GET /api/dashboard/overview?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added product endpoint:
  - `GET /api/products?sort=revenue|units&order=asc|desc&search=&page=1&limit=20`
- Added funnel endpoint:
  - `GET /api/funnel?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added traffic endpoint:
  - `GET /api/traffic?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added customer endpoint:
  - `GET /api/customers?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added CSV export endpoint:
  - `GET /api/export/csv?entity=orders|products&from=YYYY-MM-DD&to=YYYY-MM-DD`

The overview endpoint now returns:

```json
{
  "revenue": 6328.55,
  "orders": 48,
  "cvr": 0.06,
  "aov": 131.84,
  "revenueDelta": 100,
  "ordersDelta": 100,
  "revenueChart": [{ "date": "2026-05-01", "revenue": 405.46 }],
  "orderStatusChart": [{ "status": "delivered", "count": 30 }]
}
```

## Phase 6 Status

Completed frontend foundation work:

- Added React Router v6 routes for:
  - `/login`
  - `/register`
  - `/dashboard`
  - `/products`
  - `/funnel`
  - `/traffic`
  - `/customers`
- Added auth context and protected route handling
- Added Axios API client with `withCredentials: true`
- Added TanStack Query provider
- Added Zustand global store for:
  - `theme`
  - `dateRange`
- Added persisted light/dark mode support
- Added Tailwind CSS setup
- Added shadcn-style UI primitives:
  - `Button`
  - `Card`
  - `Input`
  - `Label`
- Added app layout with sidebar and topbar
- Added placeholder protected pages
- Added root error boundary

## Phase 7 Status

Completed dashboard UI work:

- Replaced the dashboard placeholder with a real dashboard page
- Connected the page to:
  - `GET /api/dashboard/overview?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Uses TanStack Query and the shared Axios client
- Uses the global Zustand `dateRange`
- Added KPI cards for:
  - Total Revenue
  - Total Orders
  - Conversion Rate
  - Average Order Value
- Added loading skeletons and error fallbacks
- Added revenue `LineChart` using Recharts
- Added orders by status donut chart using Recharts
- Added backend `orderStatusChart` data to the overview response
- Kept existing overview response fields unchanged
- Dark and light mode styling is supported by the shared theme tokens

Dashboard screenshot placeholder:

```text
docs/screenshots/dashboard-phase-7.png
```

Known limitations:

- Date range controls are stored in Zustand but are not exposed as editable UI controls yet
- Dashboard charts use seeded demo data only
- WooCommerce integration is not implemented yet

## Phase 8 Status

Completed products page work:

- Replaced the products placeholder with a real products table page
- Connected the page to:
  - `GET /api/products?sort=revenue|units&order=asc|desc&search=&page=1&limit=20`
- Uses TanStack Query and the shared Axios client
- Added 300ms debounced search by product name or category
- Added sort controls for:
  - Revenue
  - Units
- Added order controls for:
  - Asc
  - Desc
- Added pagination and page size controls
- Added responsive products table with:
  - Row number
  - Product name
  - Category
  - Price
  - Units sold
  - Revenue
  - Stock
- Price and revenue values are formatted as EUR in the UI
- Added low-stock badge for products with stock below 10
- Added loading skeletons, empty state, and error state
- Added CSV export button using:
  - `GET /api/export/csv?entity=products`
- CSV export downloads through the browser with the existing httpOnly cookie session
- Dark and light mode styling remains supported by shared theme tokens

Known limitations:

- Product data still comes from seeded demo records
- CSV export uses the backend's default date range unless date filters are added to the UI
- Product table does not yet include product detail drill-downs or inventory actions

## Phase 9 Status

Completed funnel and traffic page work:

- Replaced the funnel placeholder with a real funnel analytics page
- Connected the funnel page to:
  - `GET /api/funnel?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Uses TanStack Query and the shared Axios client
- Uses the global Zustand `dateRange`
- Added funnel summary cards
- Added horizontal Recharts `BarChart` in a `ResponsiveContainer`
- Added step-by-step conversion table for:
  - Visit
  - Product View
  - Add To Cart
  - Checkout
  - Order
- Shows count and conversion rate from the previous step
- Added loading skeleton, error state, and empty state
- Replaced the traffic placeholder with a real traffic analytics page
- Connected the traffic page to:
  - `GET /api/traffic?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Added traffic source summary cards
- Added Recharts donut chart in a `ResponsiveContainer`
- Added traffic source performance list with visits and percentage share
- Added top source summary
- Added loading skeleton, error state, and empty state
- Dark and light mode styling remains supported by shared theme tokens

Known limitations:

- Funnel and traffic data still comes from seeded demo records
- Date range controls are stored in Zustand but still are not exposed as editable UI controls
- WooCommerce integration is not implemented yet

## Phase 10 Status

Completed customers page work:

- Replaced the customers placeholder with a real customers page
- Connected the page to:
  - `GET /api/customers?from=YYYY-MM-DD&to=YYYY-MM-DD`
- Uses TanStack Query and the shared Axios client
- Uses the global Zustand `dateRange`
- Added summary cards for:
  - New Customers
  - Returning Customers
  - Total Customers
- Added top customers by LTV table with:
  - Name
  - Email
  - Lifetime Value
- Lifetime value is formatted as EUR in the UI
- Added loading skeletons, error state, and empty state
- Dark and light mode styling remains supported by shared theme tokens

Known limitations:

- Customer data still comes from seeded demo records
- Date range controls are stored in Zustand but still are not exposed as editable UI controls
- Customer detail drill-downs are not implemented yet
- WooCommerce integration is not implemented yet

Next phase:

Phase 11 - Deployment
