# ⚡ PrimeTrade Task Manager API

> **Scalable REST API** with JWT Authentication, Role-Based Access Control, and a React frontend — built for the PrimeTrade.ai Backend Intern assignment.

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Express](https://img.shields.io/badge/Express-4.x-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen) ![React](https://img.shields.io/badge/React-18-61dafb) ![Docker](https://img.shields.io/badge/Docker-ready-blue) ![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📌 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start (Local)](#quick-start-local)
- [Quick Start (Docker)](#quick-start-docker)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Security Practices](#security-practices)
- [Scalability Note](#scalability-note)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express.js 4.x |
| Database | MongoDB 7 (Mongoose ODM) |
| Auth | JWT (Access + Refresh tokens) |
| Validation | express-validator |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Logging | Winston |
| Security | Helmet, bcryptjs, rate-limit |
| Frontend | React 18 (no CRA deps beyond essentials) |
| Cache (opt.) | Redis 7 |
| Deployment | Docker + Docker Compose |

---

## ✅ Features

### Backend
- **User Registration & Login** — bcrypt-hashed passwords, JWT access + refresh tokens
- **Role-Based Access Control** — `user` and `admin` roles with middleware guards
- **Task CRUD** — create, read (paginated, filtered, searchable), update, soft-delete
- **API Versioning** — all routes under `/api/v1/`
- **Input Validation** — every endpoint validated via express-validator
- **Error Handling** — global error middleware, standardized JSON responses
- **Swagger Docs** — live at `/api/docs`
- **Logging** — structured logs via Winston (console + file)
- **Rate Limiting** — global 100 req/15min, auth endpoints 20 req/15min
- **Soft Delete** — tasks marked `isDeleted` rather than removed
- **Full-text Search** — MongoDB text index on task title + description

### Frontend
- Login / Register pages with client-side validation
- JWT stored in localStorage, auto-refresh on 401
- Protected dashboard (redirect if unauthenticated)
- Tasks table with status, priority, due date, tags
- Create / Edit / Delete tasks (modal form)
- Admin panel: view all users, promote/demote roles
- Toast notifications for all API responses

---

## 📁 Project Structure

```
primetrade-api/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── swagger.js         # OpenAPI spec config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js # Register, login, logout, me, users
│   │   │   └── task.controller.js # CRUD + stats
│   │   ├── middleware/
│   │   │   ├── auth.js            # authenticate, authorize, optionalAuth
│   │   │   ├── errorHandler.js    # Global error + 404
│   │   │   └── validate.js        # express-validator runner
│   │   ├── models/
│   │   │   ├── User.js            # User schema (bcrypt hook, toSafeObject)
│   │   │   └── Task.js            # Task schema (soft delete, text index)
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /auth/...
│   │   │   └── task.routes.js     # /tasks/...
│   │   ├── utils/
│   │   │   ├── apiResponse.js     # sendSuccess / sendError helpers
│   │   │   └── logger.js          # Winston logger
│   │   ├── validators/
│   │   │   ├── auth.validator.js  # Registration, login rules
│   │   │   └── task.validator.js  # Create, update, query rules
│   │   └── server.js              # Express app, middleware, routes
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js                 # All pages + styles (single-file)
│   │   └── index.js
│   └── package.json
│
├── docker-compose.yml             # MongoDB + Redis + Backend + Frontend
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT secrets

# 3. Start dev server (with auto-reload)
npm run dev

# Server: http://localhost:5000
# API Docs: http://localhost:5000/api/docs
# Health: http://localhost:5000/health
```

### Frontend

```bash
cd frontend

npm install
npm start

# App: http://localhost:3000
```

---

## 🐳 Quick Start (Docker)

```bash
# From project root — spins up MongoDB + Redis + Backend + Frontend
docker-compose up --build

# Services:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:5000
#   API Docs  →  http://localhost:5000/api/docs
#   MongoDB   →  localhost:27017
#   Redis     →  localhost:6379
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`

Full interactive docs: `http://localhost:5000/api/docs`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, receive JWT |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Invalidate refresh token |
| GET | `/auth/me` | ✅ | Get current user profile |
| GET | `/auth/users` | ✅ Admin | List all users |
| PATCH | `/auth/users/:id/role` | ✅ Admin | Change user role |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | Get tasks (paginated, filtered) |
| GET | `/tasks/:id` | ✅ | Get single task |
| POST | `/tasks` | ✅ | Create task |
| PATCH | `/tasks/:id` | ✅ | Update task |
| DELETE | `/tasks/:id` | ✅ | Soft delete task |
| GET | `/tasks/stats` | ✅ Admin | Aggregated statistics |

### Query Params for GET /tasks

```
?page=1&limit=10&status=todo&priority=high&sortBy=createdAt&order=desc&search=api
```

### Response Format

```json
{
  "success": true,
  "message": "Tasks fetched",
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email", "value": "bad-email" }
  ]
}
```

---

## 🗄 Database Schema

### User Collection

```
users {
  _id          ObjectId  (PK)
  name         String    (2–50 chars)
  email        String    (unique, lowercase)
  password     String    (bcrypt, never returned)
  role         Enum      ['user', 'admin']
  isActive     Boolean   (default: true)
  lastLogin    Date
  refreshTokens [String] (rotated on each use)
  createdAt    Date
  updatedAt    Date
}

Indexes:
  - email (unique)
  - role
```

### Task Collection

```
tasks {
  _id          ObjectId  (PK)
  title        String    (3–100 chars)
  description  String    (max 500)
  status       Enum      ['todo', 'in_progress', 'done']
  priority     Enum      ['low', 'medium', 'high']
  dueDate      Date      (optional)
  tags         [String]  (max 5)
  owner        ObjectId  (ref: User)
  isDeleted    Boolean   (soft delete)
  createdAt    Date
  updatedAt    Date
}

Indexes:
  - (owner, status) compound
  - (owner, priority) compound
  - (title, description) text index (full-text search)
```

---

## 🔒 Security Practices

| Practice | Implementation |
|---|---|
| Password hashing | bcryptjs with salt rounds = 12 |
| JWT signing | HS256, short-lived access (7d) + refresh rotation |
| Refresh token storage | Stored in DB, invalidated on logout |
| Input sanitization | express-validator on every route |
| HTTP headers | Helmet (CSP, HSTS, XSS protection) |
| Rate limiting | 100/15min global, 20/15min on auth routes |
| CORS | Whitelist-only origin |
| Soft deletes | No data permanently destroyed |
| Admin self-promotion | Blocked — can't assign own admin role on register |
| Non-root Docker | Runs as `nodejs` user in container |
| Sensitive field hiding | `password` and `refreshTokens` use `select: false` |
| Body size limit | 10kb max request body |

---

## 📈 Scalability Note

This project is architected to scale horizontally and vertically:

### 1. Stateless API (Horizontal Scaling)
JWT-based auth means no server-side session state. Any number of backend instances can serve any request — no sticky sessions required. Deploy behind a **load balancer** (Nginx / AWS ALB) and scale backend pods independently.

### 2. Database Scalability
MongoDB supports **replica sets** for high availability and **sharding** for horizontal data distribution. The task collection's compound indexes ensure query performance stays flat as data grows.

### 3. Caching Layer (Redis)
Redis is included in Docker Compose. Hot paths like task listings, user profiles, and stats can be cached with a simple wrapper around controller logic — reducing DB load by 80%+ for read-heavy workloads.

### 4. Microservices Migration Path
The folder structure separates concerns cleanly:
- Auth logic → extract to `auth-service`
- Tasks logic → extract to `task-service`
- Notifications → add `notification-service`

Each service communicates via REST or a message broker (RabbitMQ / Kafka). The versioned API (`/api/v1/`) allows non-breaking incremental migrations.

### 5. Container Orchestration
Docker Compose → **Kubernetes** in production:
- Each service as a Deployment with HPA (auto-scaling on CPU/memory)
- MongoDB Operator or Atlas for managed DB
- Redis Cluster for cache HA
- Ingress controller (Nginx / Traefik) for SSL termination + routing

### 6. Observability
Winston logs are structured JSON — compatible with **Datadog**, **CloudWatch**, **ELK Stack**, or any log aggregator. Add Prometheus metrics middleware for request rate / latency dashboards.

---

## 👤 Author

Vignesh Padala

B.Tech CSE (AI & ML) Student

