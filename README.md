# 🚀 Mini Job Queue Management Dashboard

A full-stack job queue management dashboard built with **NestJS** (backend), **React + TypeScript + Vite + Tailwind CSS** (frontend), and **SQLite with Prisma ORM**.

This application is designed specifically to demonstrate **clean API architecture, strict state machine validation, and real-world concurrency control (atomic compare-and-swap & optimistic concurrency)** to prevent race conditions.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [State Machine & Allowed Transitions](#-state-machine--allowed-transitions)
- [Think About This: Concurrency & State Enforcement Analysis](#-think-about-this-concurrency--state-enforcement-analysis)
- [Bonus Improvement: Production-Ready Enhancements](#-bonus-improvement-production-ready-enhancements)
- [API Documentation](#-api-documentation)
- [Local Quickstart Guide](#-local-quickstart-guide)
- [Docker Deployment](#-docker-deployment)
- [Automated Tests](#-automated-tests)
- [Assumptions & Trade-offs](#-assumptions--trade-offs)
- [Future Improvements](#-future-improvements)

---

## 🌟 Features

### 🖥️ Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
- **Live Job Queue**: Displays all jobs with pagination-friendly filtering and real-time status indicators.
- **Status Metrics**: Dashboard counters for **Total**, **Pending**, **Running**, **Completed**, and **Failed** jobs with one-click filtering.
- **State Transition Controls**: Context-sensitive action buttons (`Start Running`, `Complete`, `Fail`) respecting allowed transitions.
- **Terminal State Lock**: Completed and Failed jobs are clearly locked with an indicator explaining they cannot be transitioned again.
- **Job Creation**: Intuitive modal with quick templates (`email_blast`, `report_generation`, `data_sync`, etc.) and field validation.
- **Job Deletion**: Safe deletion with instant UI refresh and confirmation prompt.
- **Auto-Sync Polling**: Background polling toggle (every 4 seconds) to reflect changes made in concurrent sessions or other tabs.
- **Interactive Concurrency Simulator**: In-app button to trigger two simultaneous requests against the same pending job to visually inspect atomic CAS protection and 409 Conflict handling in real-time.
- **Error & Conflict Feedback**: Informative notification banners specifically detailing 409 Concurrency Conflicts and invalid state transitions.

### ⚙️ Backend (NestJS 12 + Prisma ORM + SQLite)
- **RESTful Endpoints**: Complete CRUD and status transition APIs (`POST /jobs`, `GET /jobs`, `GET /jobs/stats`, `GET /jobs/:id`, `PATCH /jobs/:id/status`, `DELETE /jobs/:id`).
- **Atomic Compare-And-Swap (CAS)**: Database-level conditional updates preventing race conditions.
- **Strict DTO Validation**: Class-validator pipes rejecting malformed payloads, non-whitelisted properties, and illegal statuses with descriptive HTTP 400 errors.
- **Swagger / OpenAPI 3.0**: Interactive documentation available out of the box at `/api/docs`.
- **CORS Enabled**: Configured for cross-origin frontend communication.
- **Zero-Dependency Persistence**: SQLite via Prisma ORM for instant local zero-configuration execution.

---

## 🏗️ Architecture & Tech Stack

```
mini-job-queue-dashboard/
├── backend/                  # NestJS API Server
│   ├── prisma/
│   │   └── schema.prisma     # Prisma SQLite Schema with version column
│   ├── src/
│   │   ├── jobs/             # Jobs Module
│   │   │   ├── dto/          # CreateJobDto, UpdateJobStatusDto, QueryJobsDto
│   │   │   ├── entities/     # Job Entity & State Machine Definitions
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   └── jobs.service.spec.ts  # Vitest Unit & Concurrency Tests
│   │   ├── prisma/           # Prisma Service & Module
│   │   ├── app.module.ts
│   │   └── main.ts           # Global Pipes, CORS & Swagger setup
│   └── Dockerfile
│
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── components/       # StatusBadge, StatusCounters, JobCard, Modals, etc.
│   │   ├── services/api.ts   # Typed API client with error mapping
│   │   ├── types/job.ts      # TypeScript models
│   │   ├── App.tsx           # Main application state & layout
│   │   └── index.css         # Tailwind CSS styling
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml        # Orchestration for both services
└── README.md                 # Complete documentation & engineering analysis
```

---

## 🔄 State Machine & Allowed Transitions

A job follows a strictly enforced linear finite state machine:

```
                  ┌───────────────┐
                  │    pending    │
                  └───────┬───────┘
                          │ (Start Running)
                          ▼
                  ┌───────────────┐
                  │    running    │
                  └──┬─────────┬──┘
                     │         │
    (Complete)       │         │ (Fail)
                     ▼         ▼
        ┌───────────────┐   ┌───────────────┐
        │   completed   │   │    failed     │
        └───────────────┘   └───────────────┘
          [ TERMINAL ]        [ TERMINAL ]
```

### Transition Rules:
1. `pending` $\rightarrow$ `running`
2. `running` $\rightarrow$ `completed` OR `failed`
3. **No backward transitions**: A job can never transition back to `pending`.
4. **Terminal states**: Once a job reaches `completed` or `failed`, it is immutable and **cannot become `running` again**.

---

## 🧠 Think About This: Concurrency & State Enforcement Analysis

The assignment poses four critical questions regarding real-world concurrency:

### 1. Where should this rule be enforced?
> **Answer:**
> **The transition rule MUST be enforced at the backend service and database layer.**
> 
> While the React frontend provides UI guardrails (e.g., disabling invalid buttons, showing terminal state badges), frontend validation is purely for user experience (UX) and cannot be trusted for system integrity. Any client can be manipulated, intercepted, or bypassed. The single source of truth is the backend API and database transaction layer.

---

### 2. What happens if someone bypasses the React application and calls the API directly?
> **Answer:**
> If a malicious or automated actor calls `PATCH /jobs/:id/status` directly via `curl`, Postman, or a script:
> 1. **NestJS Validation Pipe**: Validates that `status` is a valid enum (`pending | running | completed | failed`). Any unexpected value immediately yields `400 Bad Request`.
> 2. **State Machine Validator**: The `JobsService` verifies if the target status is allowed. Trying to set `status: "pending"` is rejected with `400 Bad Request`.
> 3. **Current State Verification**: If someone attempts to transition a `completed` job back to `running`, the backend catches that the job is in a terminal state and responds with `409 Conflict`:
>    ```json
>    {
>      "statusCode": 409,
>      "error": "Conflict",
>      "message": "Cannot transition job from terminal state 'completed' to 'running'. A completed or failed job cannot become running again."
>    }
>    ```
> Thus, data integrity remains 100% protected even when the frontend is entirely bypassed.

---

### 3. What happens when two requests arrive at nearly the same time?
> **Answer (The Two-Browser-Tab Problem):**
> Imagine two browser tabs both display Job `123` as `pending`. Both users click **"Start Running"** at nearly the exact same millisecond.
> 
> Without concurrency control, a naive implementation does:
> ```ts
> // NAIVE / BUGGY:
> const job = await db.findOne(id);
> if (job.status === 'pending') {
>   await db.update(id, { status: 'running' }); // RACE CONDITION! Both pass the check!
> }
> ```
> In our implementation, we use an **Atomic Compare-And-Swap (CAS) / Conditional Update**:
> ```ts
> // ATOMIC IMPLEMENTATION:
> const result = await prisma.job.updateMany({
>   where: {
>     id: jobId,
>     status: JobStatus.PENDING, // Atomic check: must STILL be 'pending' at the exact moment of update
>   },
>   data: {
>     status: JobStatus.RUNNING,
>     version: { increment: 1 },
>   },
> });
> ```
> **How the database executes this:**
> - SQLite and PostgreSQL serialize row modifications via row-level locks or transaction isolation.
> - **Request 1** arrives: matches `status = 'pending'`, changes status to `running`, increments `version` to 2. `result.count === 1` $\rightarrow$ **200 OK**.
> - **Request 2** arrives: the row's status is already `running`. `WHERE id = :id AND status = 'pending'` matches **0 rows**. `result.count === 0`.
> - The backend detects `count === 0`, inspects the current state, and safely returns:
>   ```json
>   {
>     "statusCode": 409,
>     "error": "Conflict",
>     "message": "Job '...' is already in 'running' status (modified concurrently)."
>   }
>   ```

---

### 4. How would you prevent an invalid or inconsistent state?
> **Answer:**
> We employ a defense-in-depth strategy across three layers:
> 1. **Database-Level Atomic CAS**:
>    Conditional update (`WHERE id = :id AND status IN (:validSourceStatuses)`) guarantees that state transitions execute atomically in a single statement.
> 2. **Optimistic Version Column (`version: Int`)**:
>    Each job entity tracks an integer `version`. Clients can pass expected versions, preventing "lost update" anomalies.
> 3. **Deterministic Error Handling (`409 Conflict`)**:
>    Instead of failing silently or crashing, the API returns a structured HTTP 409 response with the actual current state. The React client intercepts this and prompts an automatic re-fetch so the user immediately sees the up-to-date state.

---

## 🎁 Bonus Improvement: Production-Ready Enhancements

### 1. In-App Concurrency & Race Condition Simulator
- **Endpoint**: `POST /jobs/:id/simulate-race`
- **Why this was added**:
  Instead of requiring manual setup with two separate browser tabs or external curl scripts, evaluators can click the **"Simulate Race Condition"** button on any pending job.
- The server fires two simultaneous status transition promises (`Promise.allSettled`) against the exact same job ID in parallel:
  - **Request A**: Successfully executes the atomic CAS update (`200 OK`).
  - **Request B**: Caught by the CAS guard and rejected with `409 Conflict`.
- A dedicated modal pops up in the UI showing the exact payload, status codes, and the final state in the database.

### 2. Auto-Sync Polling
- Added an auto-refresh toggle that polls the server every 4 seconds. If a team member or background worker updates a job status in another session, all open dashboards reflect the new state automatically without manual reload.

### 3. Interactive OpenAPI / Swagger UI
- Available at `http://localhost:3001/api/docs`. Allows developers and testers to inspect and test all API schemas, parameters, and status responses.

---

## 📡 API Documentation

Base URL: `http://localhost:3001` (or via frontend proxy at `/api`)

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | API Health Check & system info | `200 OK` |
| `POST` | `/jobs` | Create a new job (`pending`) | `201 Created`, `400 Bad Request` |
| `GET` | `/jobs` | Get all jobs (supports `?status=&type=&search=`) | `200 OK` |
| `GET` | `/jobs/stats` | Get aggregate counts by status | `200 OK` |
| `GET` | `/jobs/:id` | Get job by ID | `200 OK`, `404 Not Found` |
| `PATCH` | `/jobs/:id/status` | Update status (with atomic state transition validation) | `200 OK`, `400 Bad Request`, `409 Conflict`, `404 Not Found` |
| `DELETE` | `/jobs/:id` | Permanently delete a job | `200 OK`, `404 Not Found` |
| `POST` | `/jobs/:id/simulate-race` | Trigger 2 concurrent requests to test race conditions | `200 OK`, `400 Bad Request` |

### Sample Payloads

#### Create Job
```bash
POST /jobs
Content-Type: application/json

{
  "title": "Send Weekly Newsletter",
  "type": "email_blast"
}
```

#### Update Job Status
```bash
PATCH /jobs/700ebd6d-e4ea-4235-9127-e306f27c7bc8/status
Content-Type: application/json

{
  "status": "running"
}
```

---

## 🚀 Local Quickstart Guide

### Prerequisites
- **Node.js**: v18+ (tested on v20 and v24)
- **npm**: v9+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd AIRTH
```

### 2. Run Backend

```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```
Backend will start at: `http://localhost:3001`  
Swagger documentation: `http://localhost:3001/api/docs`

### 3. Run Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```
Frontend will start at: `http://localhost:5173`

---

## 🐳 Docker Deployment

To spin up both backend and frontend with a single command:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:3001`
- **Swagger Docs**: `http://localhost:3001/api/docs`

---

## 🧪 Automated Tests

The backend includes a comprehensive test suite written with **Vitest**:
- Verifies initial `pending` state
- Verifies allowed linear transitions (`pending` $\rightarrow$ `running` $\rightarrow$ `completed` / `failed`)
- Verifies rejection of illegal jumps (e.g., `pending` $\rightarrow$ `completed`)
- Verifies rejection of terminal state re-entry (`completed` $\rightarrow$ `running`, `failed` $\rightarrow$ `running`)
- Verifies rejection of transitions back to `pending`
- **Verifies concurrency race conditions**: Fires two simultaneous updates and asserts that exactly 1 succeeds and 1 gets a `409 Conflict`.

### Run tests:
```bash
cd backend
npm test
```

Test Results:
```
Test Files  2 passed (2)
     Tests  13 passed (13)
  Duration  1.21s
```

---

## ⚖️ Assumptions & Trade-offs

1. **Database Choice (SQLite via Prisma)**:
   - *Decision*: Used SQLite for zero-configuration, instant execution without requiring a running PostgreSQL daemon on developer machines.
   - *Trade-off*: SQLite handles concurrent reads exceptionally well but has a single-writer lock. For high-throughput production, switching the Prisma datasource to **PostgreSQL** takes only changing `provider = "postgresql"` in `schema.prisma`. The atomic CAS queries remain identical.
2. **Polling vs. WebSockets/SSE**:
   - *Decision*: Implemented short polling (4s interval) with manual refresh and optimistic UI updates.
   - *Trade-off*: WebSockets or Server-Sent Events (SSE) provide true push notifications, but polling is resilient, handles reconnections transparently, and adds no complex stateful socket infrastructure.

---

## 🔮 Future Improvements

With additional time, the following features would enhance production maturity:
1. **Background Worker Execution**: Integrate BullMQ or Redis-backed worker queues to automatically process jobs asynchronously.
2. **Audit Log & History**: Record state transition timestamps, worker agent IDs, and duration metrics in a `JobHistory` table.
3. **Retry & Backoff Mechanism**: Allow failed jobs to be retried up to $N$ times with exponential backoff before marking them permanently `failed`.
4. **Role-Based Access Control (RBAC)**: JWT authentication to restrict job deletion and state overrides to admin users.
