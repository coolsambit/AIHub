# Support Model

## Overview

Azure support is split into different support channels and plans:

- Billing support: Available without paid technical support plans.
- Technical support: Depends on your Azure support plan tier.
- Service-specific support: Some Microsoft 365/Fabric issues are best handled through Microsoft 365 admin support.

## Support Types

### 1) Billing Support (No paid technical plan required)

Use this for:

- Refund or credit requests
- Unexpected charges
- Invoice and payment issues
- Cost spike investigation requests tied to billing impact

Portal path:

- Azure Portal -> Cost Management + Billing -> Help + support -> New support request
- Issue type: Billing

### 2) Technical Support (Plan-dependent)

Use this for:

- Configuration or platform troubleshooting
- Service incidents or feature issues
- Root cause analysis for engineering problems

Availability depends on support plan (Developer / Standard / Professional Direct, etc.).

### 3) Microsoft 365 / Fabric Admin Support

Use this when the issue involves:

- Fabric/Power BI admin boundaries
- Cross-tenant ownership of Fabric artifacts
- Admin-scoped Fabric diagnostic routing

Portal path:

- https://admin.microsoft.com -> Support -> New service request

## Practical Guidance for Cross-Tenant Log Ingestion Issues

If a Log Analytics workspace receives diagnostic logs from a source resource in a different tenant/subscription boundary:

1. Raise a Billing support request for cost impact and credit/refund assessment.
2. Raise or link a Technical/Fabric support request for ownership and remediation of the emitting diagnostic setting.
3. Provide evidence:
   - Tenant mismatch error (for example, InvalidAuthenticationTokenTenant)
   - Source resource ID
   - Destination Log Analytics workspace ID
   - Ingestion volume evidence (KQL output)

## Recommended Ticket Ask

Include these asks explicitly in your case:

- Identify exact owner and control plane for the emitting diagnostic setting.
- Disable or reduce high-volume diagnostic categories (for example, Engine) at source.
- Provide RCA (root cause analysis) and preventive actions.
- Evaluate billing adjustment/credit for the impacted period.

## Temporary Cost Protection While Waiting

Apply short-term controls while support investigates:

- Set Log Analytics daily cap (`--quota`) to limit further spend.
- Monitor high-cost category ingestion hourly with KQL.
- Remove non-essential diagnostic categories where you have ownership.
