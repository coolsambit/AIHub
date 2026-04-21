# Project Authentication and Authorization

When creating an Azure AI Foundry Project, you may see this message:

"We'll grant your identity the Azure AI User role.

To enable other users:

Assign Azure AI User to develop.
Assign Azure AI Project Manager to manage settings."

## What this means

1. Your account is automatically assigned Azure AI User on the new project.
2. Other users are not automatically added.
3. You must explicitly assign roles to other users or groups.

## Role guidance

### Azure AI User

Use this role for:

- Developers who build and test agents
- Application teams that invoke project resources
- Day-to-day project usage

### Azure AI Project Manager

Use this role for:

- Team leads and platform admins
- Project-level settings and management tasks
- Governance and configuration operations

## Recommended team model

1. Assign Azure AI User to developer groups.
2. Assign Azure AI Project Manager to platform/admin groups.
3. Avoid broad roles like Owner unless required.

## Important note

This project creation message is expected behavior. Azure is informing you that only your own identity gets initial access, and everyone else must be granted access explicitly.
