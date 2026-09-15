# Mini Job Queue Dashboard

A lightweight job queue management dashboard built with NestJS, React, and SQLite (via Prisma ORM). Implements strict linear state transitions and atomic compare-and-swap (CAS) queries to prevent race conditions during concurrent status updates.

---

## Tech Stack

- **Backend**: NestJS, Prisma ORM, SQLite, Class Validator, Vitest
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **DevOps**: Docker, Docker Compose, Nginx

---

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Prisma SQLite schema with version column
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/              # Request validation DTOs
│   │   │   ├── entities/         # State machine rules & types
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts   # Atomic CAS update logic
│   │   │   └── jobs.service.spec.ts
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/           # UI components (cards, table, modals, badges)
│   │   ├── services/api.ts       # Typed API client
│   │   ├── types/job.ts
│   │   └── App.tsx
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## State Machine & Concurrency Design

### State Lifecycle
Jobs follow a strict linear transition path:

```
pending -> running -> completed
                   -> failed
```

- A job starts in `pending`.
- `pending` can only transition to `running`.
- `running` can transition to either `completed` or `failed`.
- `completed` and `failed` are terminal states and cannot be transitioned again.
- Jobs cannot be reverted back to `pending`.

---

### Concurrency & State Enforcement Details

#### 1. Enforcement Layer
State transition rules are enforced directly at the **backend service and database query layer**. 

While the React UI disables unavailable action buttons for a better user experience, frontend checks can be bypassed by calling the API directly (e.g. via `curl` or Postman). Enforcing transitions inside the database update ensures the system remains consistent regardless of the client.

#### 2. Direct API Calls & Validation
If a request bypasses the frontend and hits the API directly:
- Invalid statuses or missing fields are caught by NestJS `ValidationPipe` and return `400 Bad Request`.
- Transitions targeting `pending` return `400 Bad Request`.
- Attempts to transition a `completed` or `failed` job return `409 Conflict`.
- Invalid state transitions (e.g. `pending` directly to `completed`) return `409 Conflict`.

#### 3. Concurrent Requests (The Two-Tab Problem)
If two users or tabs see a job as `pending` and attempt to start it at the same time, naive code (`SELECT` then `UPDATE`) can suffer from a race condition where both see `pending` and both execute `UPDATE`.

To prevent this, status transitions use an **Atomic Compare-And-Swap (CAS)** query:

```typescript
const result = await this.prisma.job.updateMany({
  where: {
    id,
    status: JobStatus.PENDING, // Must still be pending at execution time
  },
  data: {
    status: JobStatus.RUNNING,
    version: { increment: 1 },
  },
});
```

- **Request 1** commits first: updates status to `running`, increments `version`. `result.count === 1`. Returns `200 OK`.
- **Request 2** executes: the row is no longer `pending`. `result.count === 0`. The server queries the latest state and returns `409 Conflict` explaining that the job was already updated.
- Zero race conditions, no inconsistent state.

#### 4. Preventing Inconsistent States
- Atomic conditional writes (`WHERE id = :id AND status IN (...)`) guarantee that only 1 process can claim the transition.
- An integer `version` field tracks state revisions.
- Deterministic HTTP responses (`409 Conflict`) inform the client to refresh its state.

---

## Production Improvements

### 1. In-App Concurrency Tester
The dashboard includes an inline test button (`Simulate Race`) and endpoint (`POST /jobs/:id/simulate-race`). It fires two simultaneous status updates to the same job in parallel (`Promise.allSettled`), displaying how the atomic CAS query resolves the collision with 1 success (200) and 1 conflict (409).

### 2. Auto-Sync Polling
The dashboard polls every 4 seconds (toggleable in the header), ensuring that status changes made by background processes or another user are reflected without requiring manual page reloads.

### 3. Swagger / OpenAPI Documentation
Interactive API docs are available at `/api/docs` for testing all endpoints and inspecting schemas.

---

## API Reference

Base URL: `http://localhost:3001` (or `/api` via frontend proxy)

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | Health check & API info | `200` |
| `POST` | `/jobs` | Create a job (`pending`) | `201`, `400` |
| `GET` | `/jobs` | Get all jobs (`?status=`, `?type=`, `?search=`) | `200` |
| `GET` | `/jobs/stats` | Status count breakdown | `200` |
| `GET` | `/jobs/:id` | Get job by ID | `200`, `404` |
| `PATCH` | `/jobs/:id/status` | Update job status with CAS check | `200`, `400`, `404`, `409` |
| `DELETE` | `/jobs/:id` | Delete job by ID | `200`, `404` |
| `POST` | `/jobs/:id/simulate-race` | Trigger 2 concurrent updates on a job | `200`, `400` |

### Sample Payloads

**Create a Job (`POST /jobs`):**
```json
{
  "title": "Monthly Invoices",
  "type": "billing"
}
```

**Update Status (`PATCH /jobs/:id/status`):**
```json
{
  "status": "running"
}
```

---

## Quickstart

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Run Backend
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```
- API: `http://localhost:3001`
- Swagger Docs: `http://localhost:3001/api/docs`

### 2. Run Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend: `http://localhost:5173`

---

## Docker Setup

Run both services with Docker Compose:

```bash
docker compose up --build
```

- Frontend: `http://localhost` (Port 80)
- Backend: `http://localhost:3001`

---

## Running Tests

Run the backend test suite:

```bash
cd backend
npm test
```

Tests cover:
- Creation and default `pending` status
- Valid transitions (`pending` -> `running` -> `completed` / `failed`)
- Rejection of invalid transitions and terminal state changes
- Concurrent race conditions (asserting 1 success, 1 conflict)
- Deletion and 404 handling

---

## Trade-offs & Notes

1. **SQLite with Prisma**:
   Chosen for local setup simplicity with zero external service dependencies. In production with high write throughput, changing the database provider to PostgreSQL requires updating only the `provider` line in `prisma/schema.prisma`. The atomic CAS queries remain the same.

2. **Polling vs. WebSockets**:
   Lightweight polling was chosen over WebSockets because it is stateless, auto-reconnects cleanly, and does not require managing persistent socket connections across instances.
