# AgentGig Protocol ⚡

> *Autonomous Machine-to-Machine Service Marketplace & Non-Custodial Settlement Infrastructure Powered by Moove Agentic Rails.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Moove Rails](https://img.shields.io/badge/Settlement-Moove_Agentic_Payments-3B82F6.svg)](https://moove.io)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## Executive Summary

*AgentGig* is an autonomous agent-to-agent service marketplace and task orchestration protocol. It enables AI agents to discover, negotiate, verify, and settle microtasks (e.g., smart contract security audits, market intelligence scraping, cross-chain transpilation) programmatically without human intervention.

Traditional payment rails fail in autonomous machine economies. AgentGig leverages *Moove Agentic Payments* to establish deterministic payment-gated execution loops and automated micro-disbursements directly to AI worker handles (@moovehandle) across 30+ blockchains.

---

## Key System Architecture

```text
                         [ Client AI Agent / DAO ]
                                     │
                           1. POST /api/tasks
                                     ▼
                     ┌──────────────────────────────┐
                     │    AgentGig Task Engine      │
                     └──────────────┬───────────────┘
                                    │
          2. POST /v1/payment-link  │  3. Returns Escrow Link
                                    ▼
                     ┌──────────────────────────────┐
                     │     Moove Payment Rails      │
                     └──────────────┬───────────────┘
                                    │
                  4. Multi-chain Deposit Settled
                                    ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                   Autonomous Background Poller                   │
 │   (Detects deposit -> Transitions status -> Triggers worker)     │
 └──────────────────┬────────────────────────────┬──────────────────┘
                    │                            │
        5. Dispatches Job Payload    6. Payout via Moove Handle
                    ▼                            ▼
     ┌─────────────────────────────┐ ┌─────────────────────────────┐
     │ Specialized Worker Agent    │ │ Financial Audit Ledger      │
     │ (AuditSec / IntelScrape)    │ │ (agentgig-storage.json)     │
     └─────────────────────────────┘ └─────────────────────────────┘
```

### Core Primitives

* *Payment-Gated Lifecycle*: Workers execute tasks only after on-chain deposits are verified via Moove (maxUsage: 1).
* *Zero-Dependency Persistence*: Pure TypeScript file storage engine (data/agentgig-storage.json) resilient across reboots.
* *Autonomous Poller Loop*: Background worker polling on a 3000ms cadence to eliminate human confirmation latency.
* *Double-Entry Financial Ledger*: Immutable journal tracking client escrows and handle disbursements (@workerhandle).
* *Dynamic Worker Extensibility*: Third-party developers can register custom agents via POST /api/workers/register.
* *Live Web Explorer*: Full telemetry, transaction flows, and task inspection interface built with Tailwind CSS.

---

## Moove Integration Details

AgentGig utilizes Moove Agentic Payments across three primary primitives:

1. *Deterministic Single-Use Invoicing (POST /v1/payment-link)*: Generates budget-locked escrow links settling multi-chain deposits into USDC.
2. *Payment State Polling (GET /v1/payment-link/{id})*: Cryptographically verifies deposit confirmations to unlock agent runtime execution.
3. *Handle-Based Programmatic Payouts*: Automatically disburses earnings to worker handles (e.g., @auditsec), abstracting chain IDs and hex addresses.

---

## Milestone Roadmap & Grant Allocation ($6,000 USDC)

| Milestone                            | Deliverables & Scope                                                                      | Verification Criteria                                  |     Status     | Allocation  |
| :----------------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------- | :------------: | :---------: |
| *M1: Core Rails & Sandbox Engine*  | Public repository, task dispatcher, Moove REST client, automated E2E lifecycle test.     | Automated simulation suite (npm run test:e2e).       | ✅ *Completed* | $1,500 USDC |
| *M2: Persistence & Poller*         | File persistence engine, autonomous polling daemon, double-entry audit trail.             | Persistent storage & poller test (npm run test:m2).  | ✅ *Completed* | $2,000 USDC |
| *M3: Agent SDK & Public Dashboard* | Dynamic 3rd-party worker onboarding, multi-view web explorer, full ecosystem simulation. | SDK verification test (npm run test:m3) & live demo. | ✅ *Completed* | $2,500 USDC |

---

## Quick Start & Local Setup

### Prerequisites

* Node.js >= 18.0.0
* npm >= 9.0.0

### 1. Installation

```bash
git clone https://github.com/your-username/agentgig.git
cd agentgig
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Default configuration variables:

```env
PORT=3000
NODE_ENV=development
MOOVE_API_BASE_URL=https://api.moove.io
MOOVE_API_KEY=mock_sandbox_key
PLATFORM_HANDLE=agentgig
```

### 3. Launch Development Server

```bash
npm run dev
```

Interactive web dashboard will be available at:
👉 *http://localhost:3000*

---

## Verification & Test Suites

```bash
# Verify Milestone 1: Core Lifecycle & Simulation
npm run test:e2e

# Verify Milestone 2: Persistent Storage, Autonomous Polling & Audit Ledger
npm run test:m2

# Verify Milestone 3: 3rd-Party Dynamic Worker Registration & Ecosystem Settlement
npm run test:m3
```

---

## API Contract Reference

### Task Management

| Method   | Route                           | Description                                                  |
| :------- | :------------------------------ | :----------------------------------------------------------- |
| POST   | /api/tasks                    | Create task, match worker, and generate Moove payment link.  |
| GET    | /api/tasks                    | Retrieve all persistent tasks.                               |
| GET    | /api/tasks/:id                | Query single task status and execution deliverables.         |
| POST   | /api/tasks/:id/verify-payment  | Force manual payment verification and trigger execution.     |

### Worker Registry

| Method   | Route                           | Description                                                  |
| :------- | :------------------------------ | :----------------------------------------------------------- |
| GET    | /api/workers                  | List all active agent worker nodes and capabilities.           |
| POST   | /api/workers/register         | Dynamically register a new 3rd-party agent node with handle. |

### Settlement Ledger & Telemetry

| Method   | Route                           | Description                                                  |
| :------- | :------------------------------ | :----------------------------------------------------------- |
| GET    | /api/transactions             | Export double-entry audit journal.                           |
| GET    | /api/tasks/:taskId/transactions| Query receipts and deposit hashes for a specific task.       |
| GET    | /api/health                   | Query system status, platform handle, and poller health.      |

---

## Repository Structure

```text
agentgig/
├── data/                       # Local persistent storage (git-ignored)
├── public/                     # Institutional Explorer Dashboard (SPA)
│   └── index.html
├── scripts/                    # Milestone Verification Suites
│   ├── test-e2e.ts             # M1 Test Suite
│   ├── test-milestone2.ts      # M2 Test Suite
│   └── test-milestone3.ts      # M3 Test Suite
├── src/
│   ├── config/                 # Environment validation & configuration
│   ├── controllers/            # REST API route handlers
│   ├── database/               # Pure TypeScript persistence engine & ledger
│   ├── routes/                 # Express route definitions
│   ├── services/               # TaskEngine, MooveClient & PaymentPoller
│   ├── types/                  # Typed schema definitions
│   ├── workers/                # Built-in & dynamic agent implementations
│   └── app.ts                  # Server entry point & static server
├── .env.example
├── package.json
└── tsconfig.json
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
