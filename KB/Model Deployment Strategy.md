# Model Deployment Strategy

This guide explains how to share model deployments across multiple Business Unit (BU) projects in Azure AI Foundry.

## Can multiple BU projects share the same model pool?

Yes, with one key condition:

1. The BU projects must be under the same Foundry Hub (same backing Azure AI Services/OpenAI resource).

If that condition is met, multiple projects can use shared model deployments.

## How shared deployment works

1. Create model deployments centrally at the hub/resource level.
2. Configure BU projects to use those shared deployments.
3. Standardize deployment names and model versions for consistency.

## When sharing is a good fit

Use shared deployments when:

1. BUs have similar model requirements.
2. Traffic patterns are predictable.
3. Cost optimization and operational simplicity are priorities.

## Risks in a shared model pool

### 1. Capacity contention

A traffic spike from one BU can affect others.

Mitigation:

1. Set throughput guardrails and monitor token usage.
2. Use quotas and alerts per BU/project.

### 2. Latency variability

Shared workloads can introduce response-time jitter.

Mitigation:

1. Reserve dedicated deployments for latency-sensitive workloads.

### 3. Governance complexity

Many teams sharing one pool requires strong policy and ownership.

Mitigation:

1. Use project-scoped RBAC and Entra groups.
2. Implement chargeback/showback by project tags and usage metrics.

## Recommended operating model

### Tier 1: Shared baseline pool

1. One shared deployment per common model family.
2. Used by most BU workloads.

### Tier 2: Dedicated critical pool

1. Dedicated deployments for high-priority or high-volume BUs.
2. Used when strict SLO or isolation is required.

This hybrid model balances cost and reliability.

## If projects are in different hubs

If BU projects are in different hubs/resources, they cannot directly share the same in-hub deployment pool.

Options:

1. Consolidate those projects into the same hub for true pooled sharing.
2. Keep separate hubs and duplicate deployments with independent capacity controls.

## Recommended rollout plan

1. Start with one shared deployment for each required model.
2. Baseline usage for 2 to 4 weeks.
3. Identify noisy tenants and SLO-sensitive workloads.
4. Split only those workloads into dedicated deployments.
5. Review monthly for quota, cost, and performance drift.

## Decision summary

1. Same hub + moderate usage: use shared deployments.
2. Same hub + strict isolation/SLO: use hybrid (shared + dedicated).
3. Different hubs: no direct pool sharing; consolidate or duplicate.

## Foundry UI context notes

### Why BU1 may appear selected by default

Azure AI Foundry often opens with the last-used project selected (for example, BU1).
This is a UI context behavior and does not by itself make deployments BU1-exclusive.

What matters for sharing is the deployment target resource, not which project was auto-selected in the portal header.

Checklist:

1. Confirm BU1 and BU2 are connected to the same backing resource.
2. Create the shared deployment in that common target.
3. Validate BU2 can invoke the same deployment name.

### Deployment Type options in deployment details

When creating a deployment, these options control hosting and serving behavior:

1. Global Standard
- Real-time online inference.
- Best for interactive apps without strict data-zone residency constraints.

2. Data Zone Standard
- Real-time online inference in a constrained geography/data zone.
- Use when compliance or residency requirements demand geographic boundaries.

3. Global Batch
- Asynchronous batch processing for large offline workloads.
- Not typically used for interactive chat or agent responses.

For shared BU chat/agent usage, choose either Global Standard or Data Zone Standard based on compliance requirements.

## Model Types

Azure AI Foundry exposes **5 model types**. Deployability and access method differ for each.

| # | Model Type | Examples | Deployable via Foundry Catalog | Deployment Path |
|---|---|---|---|---|
| 1 | **Azure OpenAI Models** | GPT-4o, GPT-4, o1, o3, DALL-E 3, Whisper | ✅ Yes | Foundry → Deployments → **Azure OpenAI** |
| 2 | **Serverless API Models** | Llama 3, Phi-4, Mistral, Command R, Jamba | ✅ Yes | Foundry → Deployments → **Serverless API** (pay-per-token, no infra) |
| 3 | **Managed Compute Models** | Llama, Falcon, HuggingFace open-weight | ✅ Yes | Foundry → Deployments → **Managed Compute** (bring your own cluster) |
| 4 | **Fine-tunable Base Models** | GPT-3.5-turbo (fine-tune), Phi variants | ⚠️ After fine-tuning only | Fine-tune job first → deploy the resulting fine-tuned version |
| 5 | **Cognitive Services / Registry Models** | Azure AI Content Understanding, Speech, Vision, Language | ❌ No — not catalog-deployable | Provision a standalone **Azure AI Services** resource → connect it to the Hub as a linked resource → call via REST or SDK |

### Notes on Cognitive Services / Registry Models (Type 5)

These models surface in the Foundry Model Catalog with a URI of the form:

```
azureml://registries/azureml-cogsvc/models/<ModelName>/versions/<Version>
```

This is an Azure ML registry reference, not a Foundry-deployable artifact. The deploy button in the catalog will not provision an endpoint. You must:

1. Provision an **Azure AI Services** resource in the Azure portal.
2. **Connect** that resource to your Foundry Hub as a linked resource (Hub Settings → Linked Resources).
3. Call the model via the AI Services REST endpoint or the Azure SDK using `DefaultAzureCredential`.

### Summary: can it be deployed?

| Deployable | Model Types |
|---|---|
| ✅ Yes | Azure OpenAI Models, Serverless API Models, Managed Compute Models |
| ⚠️ Conditional | Fine-tunable Base Models (only after a fine-tune job completes) |
| ❌ No | Cognitive Services / Registry Models (`azureml-cogsvc` registry) |
