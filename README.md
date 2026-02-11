# Node.js Express TypeScript API Boilerplate

> Production-ready REST API starter template with MongoDB, Redis, JWT authentication, RBAC, and Docker — built for web and mobile backends.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4-black.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A **Node.js**, **Express**, **TypeScript** backend boilerplate for building scalable REST APIs. Features **MongoDB** (Prisma ORM), **Redis** (cache & queues), **JWT** auth with refresh tokens, **role-based access control**, **Swagger** docs, and **Docker** support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker](#docker)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **Dual API mounts** — Web (`/api/web/v1`) and Mobile (`/api/mobile/v1`) with separate rate limits
- **JWT Authentication** — Access + refresh tokens, token blacklist on logout
- **RBAC** — Role-based permissions (ADMIN, MANAGER, USER) with Prisma
- **MongoDB + Prisma** — Type-safe schema, seeding, migrations via `db push`
- **Redis** — Sessions, rate limiting, BullMQ job queues
- **Swagger / OpenAPI** — Interactive docs at `/api/docs`
- **Security** — Helmet, CORS, HPP, rate limiting
- **Validation** — Zod schemas
- **Tests** — Unit (Jest) + integration (Supertest)

---

## Tech Stack

| Layer      | Technology                    |
|-----------|-------------------------------|
| Runtime   | Node.js 18+                  |
| Framework | Express.js                    |
| Language  | TypeScript (strict)           |
| Database  | MongoDB (Prisma ORM)          |
| Cache     | Redis (ioredis)               |
| Queue     | BullMQ                        |
| Auth      | JWT, bcrypt                   |
| Validation| Zod                           |
| Docs      | Swagger / OpenAPI 3           |
| Container | Docker, docker-compose        |

---

## Architecture

### High-Level Flow

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────────┐
│   Client    │────▶│  Express    │────▶│  Routes / Middleware │
│ (Web/Mobile)│     │   Server    │     │  (Auth, Validation)  │
└─────────────┘     └─────────────┘     └──────────┬───────────┘
                                                    │
         ┌──────────────────────────────────────────┼─────────────────────────────────────────┐
         ▼                                          ▼                                          ▼
┌─────────────────┐                    ┌─────────────────────┐                    ┌─────────────────────┐
│   Controllers   │                    │   Modules (Service) │                    │   Cache (Redis)     │
│  auth, profile, │───────calls───────▶│  auth, user, role   │───────writes───────▶│  refresh tokens,    │
│  users          │                    │                     │                    │  blacklist, OTP,   │
└────────┬────────┘                    └──────────┬──────────┘                    │  rate limit         │
         │                                        │                               └─────────────────────┘
         │                                        ▼
         │                               ┌─────────────────────┐
         │                               │  Database (MongoDB) │
         │                               │  Prisma ORM         │
         │                               └─────────────────────┘
         │
         └───────────────────▶ Response (JSON)
```

### Project Structure

```
src/
├── api/                    # API layer
│   ├── web/v1/            # Web/Dashboard API
│   │   ├── controllers/   # Request handlers
│   │   └── routes/       # Route definitions
│   └── mobile/v1/         # Mobile API (separate rate limits)
│       ├── controllers/
│       └── routes/
├── app.ts                  # Express app setup
├── server.ts               # Entry point
├── config/                # Environment & config
├── modules/                # Business logic (services)
│   ├── auth/              # Auth service, tokens
│   ├── user/              # User CRUD
│   └── role/              # Roles & permissions
├── common/                 # Shared utilities
│   ├── errors/            # AppError, error codes
│   ├── guards/            # requirePermission, requireOwnership
│   ├── middlewares/       # auth, validate, rateLimit, errorHandler
│   ├── validators/        # Zod schemas
│   └── utils/             # Response helpers
├── cache/                  # Redis operations
│   ├── blacklist.ts       # Token blacklist (logout)
│   ├── refresh.ts         # Refresh token storage
│   ├── rateLimit.ts       # Rate limiting
│   └── otp.ts             # OTP storage
├── health/                 # Health check endpoint
├── docs/                   # Swagger setup
└── jobs/                   # BullMQ job queues
```

### Request Flow

1. **Request** → Express (Helmet, CORS, HPP, JSON parser)
2. **Request ID** → Unique ID for tracing
3. **Rate Limit** → Web/Mobile specific limits
4. **Route** → Matched by path (`/api/web/v1/*` or `/api/mobile/v1/*`)
5. **Validation** → Zod schema (body, query)
6. **Auth** → JWT verify (`requireAuth` middleware)
7. **Guards** → `requirePermission`, `requireOwnership` (if needed)
8. **Controller** → Calls service layer
9. **Service** → Business logic, Prisma + Redis
10. **Response** → JSON (`{ success, data, meta }`)
11. **Error** → `errorHandler` catches and formats errors

### Layer Responsibilities

| Layer       | Responsibility                          |
|------------|------------------------------------------|
| **Routes** | Define paths, apply middlewares         |
| **Controllers** | Parse request, call services, send response |
| **Services** | Business logic, DB/Redis access        |
| **Guards** | Permission & ownership checks           |
| **Middleware** | Auth, validation, rate limit, errors   |
| **Cache**  | Redis: tokens, OTP, rate limit, locks   |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/hussainu6/node-express-api-boilerplate-.git
cd node-express-api-boilerplate-

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env — set MONGODB_URI, REDIS_URL, JWT_SECRET (min 32 chars)

# Start MongoDB & Redis (Docker)
docker compose up -d mongodb redis

# Initialize replica set (one-time, for Prisma)
docker exec -it <mongodb-container> mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"

# Apply schema & seed data
npm run db:push
npm run db:seed

# Run development server
npm run dev
```

Server runs at **http://localhost:3000**. Health check: `/health`, Swagger: `/api/docs`.

---

## Setup

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Docker)
- **Redis** (local or Docker)
- **npm** or **pnpm**

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable       | Description                         | Example                    |
|----------------|-------------------------------------|----------------------------|
| `MONGODB_URI`  | MongoDB connection string           | `mongodb://localhost:27017/boilerplate` |
| `REDIS_URL`    | Redis connection string             | `redis://localhost:6379`    |
| `JWT_SECRET`   | Secret for JWT signing (min 32 chars)| Your secure random string  |
| `CORS_ORIGINS` | Allowed origins (comma-separated)   | `http://localhost:3000`    |

### Database

Prisma uses **`db push`** for MongoDB (no migration files):

```bash
npm run db:push    # Apply schema
npm run db:seed    # Seed roles (ADMIN, MANAGER, USER) & permissions
```

### Running MongoDB & Redis

**Docker (recommended):**

```bash
docker compose up -d mongodb redis
```

For MongoDB replica set (required for Prisma transactions):

```bash
# Already configured in docker-compose. After start, init replica set:
docker exec -it <mongodb-container-name> mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

**Without Docker:** Install MongoDB Community and Redis (or Memurai on Windows) and run them locally.

---

## API Endpoints

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/health`                 | Health check          |
| GET    | `/api/docs`               | Swagger UI            |
| POST   | `/api/web/v1/auth/register`| Register user         |
| POST   | `/api/web/v1/auth/login`   | Login                 |
| POST   | `/api/web/v1/auth/refresh`| Refresh tokens        |
| POST   | `/api/web/v1/auth/logout` | Logout                |
| GET    | `/api/web/v1/profile`     | Get profile (auth)    |
| GET    | `/api/web/v1/users`       | List users (auth + `user:read`) |

Mobile API: replace `/web/` with `/mobile/` in paths.

---

## Testing

```bash
npm test              # Unit tests only (no DB required)
npm run test:unit     # Same as above
npm run test:integration  # Full API tests (needs MongoDB + Redis)
npm run test:all      # All tests
```

---

## Docker

Full stack (app + MongoDB + Redis):

```bash
docker compose up -d
```

Set `JWT_SECRET` and `CORS_ORIGINS` via `.env` or environment.

---

## Scripts

| Script             | Description                    |
|--------------------|--------------------------------|
| `npm run dev`      | Development (tsx watch)       |
| `npm run build`    | Compile TypeScript             |
| `npm start`        | Run production build           |
| `npm run db:push`   | Sync Prisma schema             |
| `npm run db:seed`  | Seed roles & permissions       |
| `npm run db:studio`| Open Prisma Studio             |
| `npm test`         | Unit tests                     |
| `npm run format`    | Prettier format                |

---

## License

MIT © [hussainu6](https://github.com/hussainu6)

---

**Keywords:** Node.js, Express, TypeScript, REST API, MongoDB, Redis, JWT, authentication, boilerplate, starter template, Prisma, Swagger, Docker
