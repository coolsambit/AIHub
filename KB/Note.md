
## Foundry Hierarchy

![Foundry Hierarchy](diagrams/foundry-hierarchy.png)


# Deletion Scope Notes for Azure AI Foundry

## What Gets Deleted

1. Deleting a Foundry parent resource (hub/account) deletes child projects under it.
2. Deleting a single project removes only that project and does not delete the entire Foundry parent.

## Safe Rule

1. If you want to clean up one workload, delete only the project.
2. If you delete the Foundry parent, treat it as deleting the full hierarchy under it.

## Before You Delete

1. Export anything you need (prompts, configs, connection information).
2. Check dependent app integrations.
3. Confirm there are no active deployments you still need.

## DR-Aware Topology

![DR-Aware Foundry Topology](diagrams/foundry-dr-aware.png)

Source: [diagrams/foundry-dr-aware.mmd](diagrams/foundry-dr-aware.mmd)


