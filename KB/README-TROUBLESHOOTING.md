# Troubleshooting and Operational Notes

This guide keeps issue handling out of the main README so onboarding stays short.

## Common Runtime Errors

### Invalid JSON payload

Error:

```json
{"error":"Invalid JSON payload: Expecting value: line 1 column 1 (char 0)"}
```

Cause:

- You opened an API endpoint in a browser or called it with `GET`.
- The agent endpoint expects `POST` with JSON.

Fix:

1. Use health routes in browser:
   - `GET /liveness`
   - `GET /readiness`
2. Use `POST /runs` for actual chat calls with JSON body.

PowerShell example:

```powershell
$body = @{
  input = "Hi there"
  stream = $false
} | ConvertTo-Json

Invoke-RestMethod \
  -Method POST \
  -Uri "http://localhost:8088/runs" \
  -ContentType "application/json" \
  -Body $body
```

### server_error (bad_request) Capability Host is unavailable in this region

Error:

```text
server_error (bad_request) Capability Host is unavailable in this region
```

Cause:

- Your Foundry project region does not currently support hosted agent capability.

Observed scenario:

- Foundry and project in Central Region.
- Local agent server healthy and reachable.
- Request reaches backend, then fails due to regional capability.

Fix:

1. Create or use a Foundry project in a region that supports Agents.
2. Deploy your model in that project.
3. Update `.env`:
   - `FOUNDRY_PROJECT_ENDPOINT`
   - `FOUNDRY_MODEL_DEPLOYMENT_NAME`
4. Restart the app and retry `POST /runs`.

Validation checklist:

1. Local server:
   - `GET /liveness` returns `200`.
2. API route:
   - `POST /runs` is used (not `/chat`).
3. Region support:
   - Agent creation/features are available in the target Foundry region UI.

## Endpoint Reference

- `POST /runs` : main invoke endpoint
- `POST /responses` : equivalent invoke route
- `GET /liveness` : process health
- `GET /readiness` : app readiness

Default local port from current setup: `8088`.

## Notes for This Repo

- Python 3.10+ required (3.12 used locally).
- `DefaultAzureCredential` is used for auth.
- `.env` values are loaded with `load_dotenv(override=False)`.
