# AIHub — Azure AI Foundry Management Portal

A two-tier web application for managing and exploring Azure AI Foundry resources. Administrators sign in with Microsoft Entra ID and get a live view of subscriptions, foundries, projects, models, agents, connections, and guardrails across their Azure estate.

---

## Architecture and Security

### System Block Diagram

```
╔══════════════════════════════════════════════════════════════════════════╗
║                          USER / BROWSER                                  ║
║                                                                          ║
║   ┌──────────────────────────────────────────────────────────────────┐  ║
║   │               FoundryPortal  (React + Vite SPA)                  │  ║
║   │                                                                   │  ║
║   │  ModelHub │ Inventory │ Tools │ Connections │ Consumption Panel   │  ║
║   └─────────────────────────┬────────────────────────────────────────┘  ║
║                             │  MSAL v4  loginPopup()                     ║
╚═════════════════════════════╪════════════════════════════════════════════╝
                              │
                    ┌─────────▼──────────┐
                    │    Azure AD         │  ◄─ Identity Provider
                    │    (Entra ID)       │     App Registration
                    │                     │     Scopes: openid, profile
                    └─────────┬──────────┘
                              │  JWT Bearer Token
                              │  (in Authorization header)
                              ▼
╔══════════════════════════════════════════════════════════════════════════╗
║               Azure Function App  —  AIHubApis                           ║
║               FastAPI / Python 3.13   (centralus)                        ║
║                                                                          ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  ║
║  │/projects │ │/models   │ │/agents   │ │/keys     │ │/consumption │  ║
║  │/foundries│ │/subscript│ │/connecti │ │/Roles    │ │             │  ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────────┘  ║
║                                                                          ║
║  ┌────────────────────────────────────────────────────────────────────┐ ║
║  │  IDENTITY:  DefaultAzureCredential                                  │ ║
║  │             → User-Assigned Managed Identity  (AIManagedIdentity)   │ ║
║  │             AZURE_CLIENT_ID env var required                        │ ║
║  └────────────────────────────────────────────────────────────────────┘ ║
║                                                                          ║
╚═══════╤═══════════════════════════════════════════════╤════════════════╝
        │                                               │
        │  Managed Identity token                       │  APIM_ADMIN_KEY
        │  (ARM REST API + Azure AI SDK)                │  (app setting)
        │                                               │
        ▼                                               ▼
┌─────────────────────────┐              ┌──────────────────────────────┐
│   Azure AI Foundry       │              │  APIM  —  AIGatewayAIDS      │
│   Hub  (AI-102 RG)       │              │  Resource Group: AI-102       │
│                          │              │                               │
│  • Hub + Projects        │              │  AI Gateway policies:         │
│  • Agents & Tools        │              │  • azure-openai-token-limit   │
│  • Model deployments     │  ◄───calls───│  • Per-subscription quotas    │
│  • Connections           │              │  • APIM internal cache        │
│  • Foundry Local         │              │    usage|{subscriptionId}     │
│                          │              │  • GET  /internal/usage       │
│  Roles needed:           │              │  • DEL  /internal/usage       │
│  Azure AI Developer      │              │                               │
└─────────────────────────┘              │  Named Values:                │
                                         │  • APIM_ADMIN_KEY (secret)    │
                                         └──────────────────────────────┘
```

### Authentication & Trust Boundaries

| Layer | Auth Mechanism | Trust Direction |
|-------|---------------|-----------------|
| Browser → Backend | Azure AD JWT Bearer token | User must sign in |
| Backend → Foundry | Managed Identity (no stored keys) | Identity-based |
| Backend → APIM | APIM_ADMIN_KEY (app setting) | Key-based — rotate periodically |
| Backend → Storage | Connection string (app setting) | Key-based ⚠ |
| GitHub → Azure | AZURE_RBAC_CREDENTIALS secret | Service Principal (env: dev) |

### Token Consumption Data Flow

```
User calls AI model via APIM
      │
      ▼
APIM outbound policy intercepts response
      │  reads prompt_tokens + completion_tokens
      ▼
APIM cache  →  usage|{subscriptionId}  →  {"gpt-4o": {"used": N, "limit": M}}
      │
      ▼
ConsumptionPanel (frontend)
      │  GET /api/consumption/?subscriptionId=...
      ▼
AIHubApis  →  APIM /internal/usage  →  returns JSON
      │
      ▼
Rendered as progress bars per project per model
```

### Security Notes

- **Strong**: Backend-to-Foundry uses Managed Identity — no stored credentials for AI service access
- **Acceptable**: APIM admin key is stored in Function App settings (not in git) — rotate periodically
- **Improvement opportunity**: `AzureWebJobsStorage` uses a connection string; can be migrated to Managed Identity via `AzureWebJobsStorage__accountName` app setting
- **CORS**: FastAPI is configured with `allow_origins=["*"]` — acceptable for internal tooling, restrict if ever customer-facing
- **Token validation**: The Bearer token from the browser is forwarded to ARM but not independently validated server-side

**Frontend** — React 18 + Vite + Tailwind CSS, deployed to Azure App Service (`FoundryDevPortal`)  
**Backend** — Python FastAPI hosted as an Azure Function App (`AIHubApis`)  
**Auth** — MSAL v4 (`@azure/msal-browser`) with Azure AD, using `loginPopup`. Scope: `https://management.azure.com/.default`  
**External IdP** — Google accounts supported via Entra ID B2B External Identities federation

---

## Repository Structure

```
AIHub/
├── AIHubBackend/                   # Python FastAPI backend
│   └── src/coreAPIs/
│       ├── main.py                 # FastAPI app, CORS, router registration
│       ├── arm_client.py           # Shared ARM HTTP client with retry
│       ├── subscriptions/          # List Azure subscriptions
│       ├── foundries/              # Discover AI Foundry accounts
│       ├── projects/               # List projects within a Foundry
│       ├── models/                 # List model deployments
│       ├── agents/                 # List agents, get details, get guardrails
│       ├── connections/            # List Foundry connections
│       ├── keys/                   # Retrieve Foundry API keys
│       └── Roles/                  # RBAC role assignments
│
├── FoundryPortal/                  # React frontend
│   └── src/
│       ├── App.jsx                 # Root — all inventory state, auth, effects
│       ├── SubscriptionDashboard.jsx  # Main dashboard (subscription → foundry → project)
│       ├── Home.jsx                # Info page — agent types, model types, frameworks
│       ├── api/                    # API client modules (one per resource type)
│       └── features/subscriptions-auth/
│           ├── msalClient.js       # MSAL config
│           ├── AgentDetails.jsx    # Agent detail panel + guardrails grid
│           └── ModelDetails.jsx    # Model detail panel
│
└── .github/workflows/
    ├── master_AIHubBackend.yml     # Deploy backend on push to master
    └── master_FoundryDevPortal.yml # Deploy frontend on push to master
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/subscriptions/` | List Azure subscriptions |
| GET | `/foundries/` | List AI Foundry accounts |
| GET | `/projects/` | List projects in a Foundry |
| GET | `/models/` | List model deployments |
| GET | `/agents/` | List agents in a project |
| GET | `/agents/{agentName}` | Full agent details including guardrail assignments |
| GET | `/agents/{agentName}/guardrails` | Project-level guardrails with assignment flag |
| GET | `/connections/` | List Foundry connections |
| GET | `/keys/` | Retrieve Foundry API keys |
| GET | `/Roles/` | RBAC role assignments |

All endpoints accept a Bearer token forwarded from the frontend. Query parameters include `subscriptionId`, `resourceGroup`, `foundryName`, and `projectName` as required.

---

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+
- Azure CLI (`az login`)
- An Azure subscription with AI Foundry resources

### Backend

```bash
cd AIHubBackend
pip install -r requirements.txt
uvicorn src.coreAPIs.main:app --host 0.0.0.0 --port 8020 --reload
```

Swagger UI available at `http://localhost:8020/docs`

### Frontend

```bash
cd FoundryPortal
npm install
npm run dev
```

Portal runs at `http://localhost:5173`

Set the backend URL in `FoundryPortal/.env`:

```env
VITE_API_BASE_URL=http://localhost:8020
```

---

## Deployment

Both services deploy automatically via GitHub Actions **on every push to `master`**.

| Service | Target | Workflow |
|---------|--------|----------|
| Backend | Azure Function App — `AIHubApis` | `master_AIHubBackend.yml` |
| Frontend | Azure App Service — `FoundryDevPortal` | `master_FoundryDevPortal.yml` |

Development work should be done on the `Dev` branch. Merge to `master` only when ready to deploy.

```bash
# Merge Dev to master to trigger deployment
git checkout master
git merge Dev
git push origin master
```

---

## Authentication

### Microsoft (Entra ID)
Users sign in with their Microsoft / Azure AD account. The frontend acquires a token scoped to `https://management.azure.com/.default` and forwards it to the backend, which passes it directly to ARM.

### Google (B2B Federation)
Google accounts are supported via Entra ID External Identities. The flow is:

```
User clicks Google → Microsoft login page → enters Gmail →
Entra detects Google domain → redirects to Google →
Google authenticates → Entra issues Azure AD token → portal loads
```

**Setup required:**
1. Google Cloud Console — create OAuth 2.0 client, add redirect URIs:
   - `https://login.microsoftonline.com/common/federation/oauth2`
   - `https://login.microsoftonline.com/te/{tenantId}/oauth2/authresp`
2. Entra ID → External Identities → All identity providers → Google — paste client ID and secret
3. Invite Google users as guest users in the Entra tenant

---

## Branch Strategy

| Branch | Purpose | Auto-deploys |
|--------|---------|--------------|
| `master` | Production — protected, merge only | Yes |
| `Dev` | Active development | No |

Direct pushes to `master` and `Dev` are blocked via GitHub branch protection rules.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 |
| Frontend build | Vite 5 |
| Styling | Tailwind CSS 4 |
| Auth (frontend) | MSAL Browser v4 |
| Routing | React Router v7 |
| Backend framework | FastAPI |
| Backend runtime | Python 3.12 |
| Backend hosting | Azure Function App (Flex Consumption) |
| Frontend hosting | Azure App Service |
| CI/CD | GitHub Actions |
| Azure identity | DefaultAzureCredential + Bearer token forwarding |
