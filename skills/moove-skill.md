# Moove Agentic Payments Integration Specification

## 1. Environment Requirements
- MOOVE_API_BASE_URL: Base URL for REST endpoints (e.g. https://api.moove.xyz)
- MOOVE_API_KEY: Secret authentication token

## 2. Authentication
Requests must include header:
X-API-Key: <MOOVE_API_KEY> or Authorization: Bearer <MOOVE_API_KEY>

## 3. Endpoints Contract
- Create Payment Link:
  POST /v1/payment-link
  Body: { "toAmount": "10.00", "description": "AgentGig-Task-ID", "maxUsage": 1 }
  Response: { "id": "pl_123", "url": "https://moove.xyz/pay/pl_123", "status": "pending" }

- Verify Payment Link Status:
  GET /v1/payment-link/{id}
  Response: { "id": "pl_123", "status": "completed", "amount": "10.00" }