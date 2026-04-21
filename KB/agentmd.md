# Azure AI Foundry Notes (Agent, Networking, and Setup)

This guide summarizes the key concepts discussed for creating and operating Azure AI Foundry resources and agents.

## 1. Resource Group Region vs Resource Region

When creating a Foundry resource, Azure asks for:

- Resource Group
- Region (Location)

These are not the same.

### Resource Group region

- Stores metadata for the resource group.
- Does not force all resources in that group to be in the same region.

### Foundry resource region

- Where the Foundry service actually runs.
- Controls feature/model availability, capacity/quota, latency, and residency behavior.

Example:

- Resource Group: East US
- Foundry resource: East US 2

This is valid.

## 2. Public vs Private Access

Think in two gates:

1. Network gate: Can the request reach the endpoint?
2. Identity gate: Is the caller authorized (Entra ID token + RBAC)?

### Public access

- Endpoint is reachable over the internet.
- Can still be restricted by firewall/network rules.

### Private access

- Endpoint is reachable only through private Azure networking.
- Usually uses Private Endpoint (private IP in a VNet).
- No direct public internet path when public access is disabled.

## 3. What "Selected networks" Means

"Selected networks" means access is restricted to approved network paths only.

Common patterns:

1. Public endpoint enabled, but only approved VNet/subnet/IP rules allowed.
2. Private Endpoint-based access for private-only connectivity.

## 4. Cross-Subscription Access (Why It Works or Fails)

A subscription is a management/billing boundary, not automatic network connectivity.

Another subscription can access your Foundry only if all required parts are configured:

1. Network path exists (public allowed, or private connectivity via peering/VWAN/ExpressRoute).
2. DNS resolves correctly (especially private DNS for private endpoints).
3. NSG/UDR/firewall allows traffic.
4. Caller identity has correct RBAC permissions.

If any one of these is missing, access fails.

## 5. Private Endpoint at Scale (100s of BUs)

Not every BU needs its own private endpoint, but every BU needs private connectivity to one that exists.

Common enterprise models:

1. Shared hub private endpoint
- One/few endpoints in a central network hub.
- BU VNets connect via peering or Virtual WAN.
- Central DNS and policy control.

2. Per-BU private endpoint
- Strong isolation.
- Higher operational overhead.

3. Hybrid
- Shared by default.
- Dedicated endpoints for high-security BUs.

## 6. Standard vs Basic vs Network-Secured Agent Setup

### Basic AI agent setup

- Simplest setup path.
- Best for quick demos/POCs.
- Fewer networking controls.

### Standard Agent setup

- More complete API-based setup.
- Supports network injection options.
- Better for normal enterprise app integration.

### Network-secured Agent template setup

- Most locked-down enterprise pattern.
- Required when strict network-secured agent architecture is needed.

### Meaning of the warning

If you see this warning:

"Agents APIs only support network injection for Standard Agent set-up. If you would like to deploy a network secured Agent set-up, deploy an Agent template."

It means:

- Standard Agent API path supports only specific network injection capabilities.
- For full network-secured topology, use Agent template deployment.

## 7. Practical Decision Guide

1. Learning or quick POC: Basic setup.
2. App integration with API flow: Standard setup.
3. Strict private networking/compliance: Network-secured Agent template setup.

## 8. Foundry Naming and Management Group Notes

### Foundry renaming

- Foundry resource names are immutable after creation.
- To change name, create a new resource and migrate.

### Management groups

- Subscriptions can be moved between management groups.
- Tenant Root Management Group cannot be removed.
- Moving a subscription changes inherited policy/RBAC scope.

## 9. Recommended Enterprise Baseline

1. Separate Foundry by environment (Dev/Cert/Prod).
2. Use private networking for production.
3. Use managed identity and least-privilege RBAC.
4. Centralize onboarding (projects, RBAC groups, policy checks, DNS/network validation).
5. Choose region based on Foundry capability availability first, then latency/compliance.
