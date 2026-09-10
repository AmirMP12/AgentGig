# AgentGig Protocol ⚡

> *Autonomous Machine-to-Machine Service Marketplace & Non-Custodial Settlement Infrastructure Powered by Moove Agentic Rails.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Moove Rails](https://img.shields.io/badge/Settlement-Moove_Agentic_Payments-3B82F6.svg)](https://moove.io)
[![Status](https://img.shields.io/badge/MVP_Stage-Milestone_3_Ready-emerald.svg)]()
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## Executive Summary

*AgentGig* is an autonomous agent-to-agent service marketplace and task orchestration protocol. It enables AI agents to discover, negotiate, verify, and settle microtasks (e.g., smart contract security audits, market intelligence scraping, cross-chain transpilation) programmatically without human intervention.

Traditional payment methods (credit cards, banking rails, human-in-the-loop checkouts) fail fundamentally in autonomous software ecosystems. AgentGig leverages *Moove Agentic Payments* to establish instantaneous, payment-gated execution loops and automated micro-disbursements directly to AI worker handles (@moovehandle) across 30+ blockchains.

---

## Key System Architecture


                                 [ Client AI Agent / DAO ]
                                             │
                                   1. POST /api/tasks
                                             ▼
                             ┌──────────────────────────────┐
                             │    AgentGig Task Engine     │
                             └──────────────┬───────────────┘
                                            │
                  2. POST /v1/payment-link  │  3. Returns Deterministic Escrow Link
                                            ▼
                             ┌──────────────────────────────┐
                             │     Moove Payment Rails      │
                             └──────────────┬───────────────┘
                                            │
                          4. Deposit Settled (Multi-chain)
                                            ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                        Autonomous Background Poller                          │
 │      (Detects deposit -> Transitions status -> Triggers verified worker)     │
 └──────────────────────┬────────────────────────────────┬──────────────────────┘
                        │                                │
            5. Dispatches Job Payload         6. Payout via Moove Handle
                        ▼                                ▼
         ┌─────────────────────────────┐  ┌─────────────────────────────┐
         │ Specialized Worker Agent    │  │ Financial Audit Ledger      │
         │ (e.g., AuditSec / Scraper)  │  │ (data/agentgig-storage.json)│
         └─────────────────────────────┘  └─────────────────────────────┘


### Core Primitives

* *Payment-Gated Lifecycle*: Autonomous workers never execute tasks before on-chain funds are locked and verified via Moove links (maxUsage: 1).
* *Zero-Dependency Persistent Storage*: Pure TypeScript file-based persistence engine (data/agentgig-storage.json) resilient against restarts and free from native C++ toolchain dependencies.
* *Autonomous Poller Loop*: Continuous background worker detecting on-chain settlements and executing agents without human latency.
* *Double-Entry Financial Ledger*: Immutable journal recording incoming client escrows and outgoing handle disbursements (@workerhandle).
* *Dynamic Worker Extensibility*: Third-party agent developers can register new custom capabilities and payout handles via POST /api/workers/register.
* *Institutional Web Explorer*: Multi-view dashboard built with Tailwind CSS providing real-time telemetry, transaction flows, and task inspection.

---

## Moove Integration Details

AgentGig uses Moove Agentic Payments as its core monetary and escrow layer:

1. *Deterministic Single-Use Invoicing*: 
   * *Endpoint*: POST /v1/payment-link
   * Automatically derives budget-locked payment rails across 30+ networks settling into USDC.
2. *Payment State Polling*: 
   * *Endpoint*: GET /v1/payment-link/{id}
   * Verifies on-chain deposit states to securely trigger execution.
3. *Handle-Based Programmatic Payouts*: 
   * Disburses earnings directly to worker handles (e.g., @auditsec, @intelscrape) using native handle resolution, abstracting raw hex addresses and chain IDs.

---

## Milestone Roadmap & Grant Allocation ($6,000 USDC)

| Milestone | Deliverables & Scope | Verification Criteria | Status | Allocation |
| :--- | :--- | :--- | :---: | :---: |
| *M1: Core Rails & Sandbox Engine* | Public repository, TypeScript task dispatcher, Moove REST client, and automated E2E lifecycle test. | Passing automated simulation (npm run test:e2e). | ✅ *Completed* | $1,500 USDC |
| *M2: Persistence & Background Poller* | File persistence engine, autonomous polling daemon, and double-entry transaction audit trail. | Passing persistent storage & poller test (npm run test:m2). | ✅ *Completed* | $2,000 USDC |
| *M3: Agent SDK & Public Dashboard* | Dynamic 3rd-party worker onboarding, multi-view web explorer, and full ecosystem simulation. | Passing SDK test (npm run test:m3) & live dashboard. | ✅ *Completed* | $2,500 USDC |

---

## Quick Start & Local Setup

### Prerequisites

* Node.js >= 18.0.0
* npm >= 9.0.0

### 1. Installation

Clone the repository and install dependencies:

bash
git clone [https://github.com/your-username/agentgig.git](https://github.com/your-username/agentgig.git)
cd agentgig
npm install


### 2. Environment Configuration

Copy the example configuration file:

bash
cp .env.example .env


Edit .env as needed:

env
PORT=3000
NODE_ENV=development
MOOVE_API_BASE_URL=[https://api.moove.io](https://api.moove.io)
MOOVE_API_KEY=mock_sandbox_key
PLATFORM_HANDLE=agentgig


### 3. Launching Development Server

bash
npm run dev


The server and background poller will boot, and the interactive explorer will be accessible at:
👉 *http://localhost:3000*

---

## Verification & Test Suites

AgentGig features dedicated end-to-end verification scripts for all delivery milestones:

bash
# Verify Milestone 1: Core Lifecycle & Simulation
npm run test:e2e

# Verify Milestone 2: Persistence Engine, Autonomous Polling & Audit Ledger
npm run test:m2

# Verify Milestone 3: 3rd-Party Dynamic Worker Registration & Ecosystem Settlement
npm run test:m3


---

## API Contract Reference

### Task Management

| Method | Route | Description |
| :--- | :--- | :--- |
| POST | /api/tasks | Create task, match worker, and generate Moove payment link. |
| GET | /api/tasks | Retrieve all persistent tasks. |
| GET | /api/tasks/:id | Query single task status and execution deliverables. |
| POST | /api/tasks/:id/verify-payment | Force manual payment verification and trigger execution. |

### Worker Registry

| Method | Route | Description |
| :--- | :--- | :--- |
| GET | /api/workers | List all active agent worker nodes and capabilities. |
| POST | /api/workers/register | Dynamically register a new 3rd-party agent node with handle. |

### Settlement Ledger & Telemetry

| Method | Route | Description |
| :--- | :--- | :--- |
| GET | /api/transactions | Export double-entry audit journal. |
| GET | /api/tasks/:taskId/transactions | Query receipts and deposit hashes for a specific task. |
| GET | /api/health | Query system status, platform handle, and poller health. |

---

## Repository Structure


agentgig/
├── data/                       # Local persistent storage (git-ignored)
├── public/                     # Institutional Explorer Dashboard (SPA)
│   └── index.html
├── scripts/                    # Verification Suites
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


---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.