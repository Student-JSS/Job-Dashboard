# Mini Job Queue Management Dashboard

A full-stack, real-time job queue management dashboard built with **NestJS**, **React 19**, and **SQLite (Prisma ORM)**. It demonstrates robust engineering patterns for handling background jobs, including strict linear state transitions, atomic Compare-And-Swap (CAS) query updates to eliminate race conditions, real-time auto-synchronization, and an in-app race condition simulator.

---

## Key Features

- **Strict State Machine Lifecycle**: Enforces valid transitions (`pending` → `running` → `completed` / `failed`). Terminal states (`completed`, `failed`) are immutable.
- **Atomic Concurrency Control**: Uses atomic database Compare-And-Swap (CAS) queries with version incrementing to guarantee zero race conditions when concurrent workers or tabs update the same job.
- **In-App Race Simulator**: Dedicated endpoint and UI test tool (`POST /jobs/:id/simulate-race`) that fires two simultaneous status update requests in parallel to empirically demonstrate `200 OK` vs. `409 Conflict` resolution.
- **Real-Time Auto-Sync & Polling**: Configurable 3-second background auto-synchronization with visual countdown timer, manual refresh controls, and last-synced indicators.
- **Flexible UI Views**: Toggle between **Card View** and **Table View** with live statistics counter cards (`Total`, `Pending`, `Running`, `Completed`, `Failed`).
- **Comprehensive Filtering & Search**: Instant client and server filtering by status (`ALL`, `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`) and live search by title, type, or UUID.
- **Interactive OpenAPI / Swagger Documentation**: Built-in Swagger UI available at `/api/docs` for testing all endpoints and reviewing request/response schemas.
- **Docker Ready**: Pre-configured `Dockerfile` for backend and frontend, plus a root `docker-compose.yml` with Nginx reverse proxy integration.

---

## State Machine & Lifecycle Rules

### State Diagram

Jobs follow a strict linear transition path:

```text
       ┌───────────┐
       │  PENDING  │  (Initial state)
       └─────┬─────┘
             │
             ▼
       ┌───────────┐
       │  RUNNING  │  (In-progress)
       └─────┬─────┘
             ├──────────────────────┐
             ▼                      ▼
      ┌─────────────┐        ┌────────────┐
      │  COMPLETED  │        │   FAILED   │  (Terminal states)
      └─────────────┘        └────────────┘
```

### Transition Matrix

| From State | Allowed Target States | Disallowed Target States | Response on Violation |
| --- | --- | --- | --- |
| `pending` | `running` | `completed`, `failed`, `pending` | `409 Conflict` |
| `running` | `completed`, `failed` | `pending`, `running` | `400 Bad Request` / `409 Conflict` |
| `completed` | *None (Terminal)* | Any | `409 Conflict` |
| `failed` | *None (Terminal)* | Any | `409 Conflict` |

---

## Concurrency & Race Condition Resolution

### The "Two-Tab / Two-Worker" Problem

If two background workers or browser tabs view a job in `pending` status at the exact same millisecond and both attempt to claim it ("Start Job"), standard `SELECT` followed by `UPDATE` queries suffer from race conditions:

1. **Request A** reads job (`status = pending`).
2. **Request B** reads job (`status = pending`).
3. **Request A** updates job to `running`.
4. **Request B** updates job to `running`.
5. **Result**: Both workers believe they own the job, resulting in duplicate background processing or corrupted data.

### The Atomic CAS Solution

This system eliminates race conditions directly at the database layer using Prisma's atomic `updateMany`:

```typescript
const result = await this.prisma.job.updateMany({
  where: {
    id: id,
    status: JobStatus.PENDING, // Conditional execution check
  },
  data: {
    status: JobStatus.RUNNING,
    version: { increment: 1 },  // Optimistic revision control
  },
});
```

- **Execution**: The database evaluates the `WHERE` condition and applies the `UPDATE` in a single atomic transaction.
- **Winner (Request A)**: Matches the `pending` status, updates the row to `running`, increments `version`. `result.count === 1`. Returns `200 OK`.
- **Loser (Request B)**: Finds the row is no longer `pending`. `result.count === 0`. The service detects zero modified rows, queries the current state, and returns `409 Conflict` ("Job was already updated by another process").

---

## Technology Stack

### Backend
- **Framework**: NestJS 12 (TypeScript, REST)
- **Database & ORM**: SQLite via Prisma ORM 6
- **Validation**: `class-validator` & `class-transformer`
- **Documentation**: Swagger / OpenAPI 12 (`@nestjs/swagger`)
- **Testing**: Vitest 4, Supertest

### Frontend
- **Framework**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS 4 (Obsidian & Indigo minimal theme)
- **Icons**: Lucide React
- **API Client**: Custom typed `fetch` wrapper with unified error handling

### DevOps & Deployment
- **Containers**: Docker (Multi-stage Node 20 Alpine builds), Nginx Alpine
- **Orchestration**: Docker Compose
- **Platform Presets**: Vercel (Frontend SPA), Render (Backend Web Service)

---

## Project Structure

```text
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Prisma SQLite schema & models
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/               # Request validation DTOs
│   │   │   ├── entities/          # Job entity & transition definitions
│   │   │   ├── jobs.controller.ts # REST API routes & Swagger metadata
│   │   │   ├── jobs.service.ts    # Business logic & atomic CAS queries
│   │   │   └── jobs.service.spec.ts # Vitest unit & concurrency tests
│   │   ├── prisma/                # Prisma service module
│   │   ├── app.module.ts          # Root NestJS module
│   │   └── main.ts                # Bootstrap, CORS, ValidationPipe, Swagger setup
│   ├── Dockerfile                 # Production backend container build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Header, Cards, Table, Modals)
│   │   ├── services/api.ts        # Typed API service layer
│   │   ├── types/job.ts           # Shared TypeScript interfaces
│   │   └── App.tsx                # Dashboard layout & state orchestration
│   ├── vercel.json                # Vercel SPA rewrite rules
│   ├── nginx.conf                 # Nginx reverse proxy configuration
│   ├── Dockerfile                 # Production frontend container build
│   └── package.json
├── docker-compose.yml             # Full-stack local orchestration
├── package.json                   # Root workspace scripts
└── README.md
```

---

## Database Schema

Defined in `backend/prisma/schema.prisma`:

```prisma
model Job {
  id        String   @id @default(uuid())
  title     String
  type      String
  status    String   @default("pending")
  version   Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
}
```

---

## Local Setup & Quickstart

### Prerequisites
- **Node.js**: v20 or newer
- **npm**: v9 or newer

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

- **Backend API**: `http://localhost:3001`
- **Swagger Documentation**: `http://localhost:3001/api/docs`

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Dashboard**: `http://localhost:5173`

---

## API Reference

Base URL: `http://localhost:3001` (or relative `/api` when proxying via Nginx)

| Method | Endpoint | Description | Status Codes |
| --- | --- | --- | --- |
| `GET` | `/` | Health check & service info | `200` |
| `POST` | `/jobs` | Create a new job (`pending`) | `201`, `400` |
| `GET` | `/jobs` | List jobs (`?status=`, `?search=`) | `200` |
| `GET` | `/jobs/stats` | Retrieve total and status counts | `200` |
| `GET` | `/jobs/:id` | Get job details by ID | `200`, `404` |
| `PATCH` | `/jobs/:id/status` | Execute atomic status transition | `200`, `400`, `404`, `409` |
| `DELETE` | `/jobs/:id` | Delete job by ID | `200`, `404` |
| `POST` | `/jobs/:id/simulate-race` | Trigger 2 parallel updates to verify CAS lock | `200`, `400` |

### Sample Payloads

#### Create Job (`POST /jobs`)

```json
{
  "title": "Process Monthly Payroll",
  "type": "payroll_processing"
}
```

#### Update Job Status (`PATCH /jobs/:id/status`)

```json
{
  "status": "running"
}
```

---

## Automated Testing

Run the Vitest suite in the backend directory:

```bash
cd backend
npm test
```

### Test Coverage Highlights
- Default state initialization on job creation (`pending`, `version: 1`).
- Valid transitions (`pending` → `running` → `completed`/`failed`).
- Rejection of illegal transitions (`pending` directly to `completed`).
- Immutability enforcement on terminal states (`completed`, `failed`).
- Parallel race condition simulation asserting 1 success (`200`) and 1 conflict (`409`).

---

## Deployment Guide

### Option 1: Docker Compose (Local or VPS)

To launch both frontend, backend, and Nginx proxy in isolated containers:

```bash
docker compose up --build -d
```

- **Frontend Dashboard**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/api/docs`

To stop the services:
```bash
docker compose down
```

---

### Option 2: Cloud Deployment (Vercel + Render)

#### Backend (Render Web Service)
1. Push the repository to GitHub.
2. Create a **New Web Service** on Render.
3. Connect your repository and configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm run start:prod`
4. Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `file:./dev.db`

#### Frontend (Vercel)
1. Create a **New Project** on Vercel and select your GitHub repository.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment Variables:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com`

---

## Design Trade-offs & Architecture Notes

1. **SQLite with Prisma**: Selected for instant zero-dependency local execution. In high-throughput distributed production environments, Prisma allows swapping to PostgreSQL simply by changing the `provider` in `schema.prisma`.
2. **Polling vs. WebSockets**: Polling was chosen because it is stateless, resilient against network drops, auto-reconnecting, and ideal for standard dashboard monitoring without persistent socket connection overhead.
3. **Database-Level State Enforcement**: Transition rules are enforced inside the database update queries, guaranteeing data integrity even if API endpoints are called directly via Postman or `curl`.

---

## License

This project is licensed under the MIT License.
