
from __future__ import annotations
from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from azure.identity import DefaultAzureCredential


router = APIRouter()
__all__ = ["router"]

# List all foundries for the current user and subscription
@router.get("/", summary="List all foundries for the current user and subscription")
async def list_foundries(
    request: Request,
    user_id: str = Query("", alias="userId", description="User ID (optional, for delegated scenarios)"),
    subscription_id: str = Query(..., alias="subscriptionId", description="Azure Subscription ID")
) -> list[dict]:
    credential = DefaultAzureCredential()
    # Import FoundriesAPI from this file, not as a circular import
    api = FoundriesAPI([], credential)
    return api.list_items(user_id, subscription_id)








# Response model for foundry details
class FoundryDetailsResponse(BaseModel):
    resource_group: str | None
    resource_group_region: str | None
    projects: list[dict]

# Real endpoint for foundry details
@router.get("/details", response_model=FoundryDetailsResponse, summary="Get foundry details (resource group, region, projects)")
async def foundry_details(
    foundry: str = Query(..., description="Name of the Foundry instance (e.g., Aids-Foundry-Dev)"),
    subscription_id: str = Query(..., alias="subscriptionId", description="Azure Subscription ID")
) -> FoundryDetailsResponse:
    # --- DYNAMIC LOGIC ---
    # Import credential/project state from a shared location or dependency injection
    # For now, use a placeholder for credential and project cache
    import logging
    logging.basicConfig(level=logging.DEBUG)
    from coreAPIs.projects.api import ProjectsAPI
    from azure.identity import DefaultAzureCredential
    import os
    credential = DefaultAzureCredential()
    projects = []
    try:
        from coreAPIs.foundries.api import FoundriesAPI
        foundries_api = FoundriesAPI(projects, credential)
        foundry_obj = None
        configured = foundries_api.list_items("", subscription_id)
        logging.debug(f"[foundry_details] Found configured foundries: {configured}")
        for item in configured:
            if item.get("name") == foundry:
                foundry_obj = item
                break
        if not foundry_obj:
            logging.debug(f"[foundry_details] Foundry '{foundry}' not found in configured/discovered list.")
            raise Exception(f"Foundry '{foundry}' not found.")
        resource_group = foundry_obj.get("resource_group")
        resource_group_region = foundry_obj.get("resource_group_region")
        endpoint = foundry_obj.get("endpoint")
        logging.debug(f"[foundry_details] Foundry '{foundry}': resource_group={resource_group}, region={resource_group_region}, endpoint={endpoint}")
        rows = []
        if endpoint:
            try:
                rows = ProjectsAPI(endpoint, credential).list()
                logging.debug(f"[foundry_details] Projects for endpoint {endpoint}: {rows}")
            except Exception as proj_exc:
                logging.debug(f"[foundry_details] Error fetching projects for endpoint {endpoint}: {proj_exc}")
        else:
            logging.debug(f"[foundry_details] No endpoint found for foundry '{foundry}'")
        return FoundryDetailsResponse(
            resource_group=resource_group,
            resource_group_region=resource_group_region,
            projects=rows,
        )
    except Exception as e:
        logging.debug(f"[foundry_details] Exception: {e}")
        return FoundryDetailsResponse(
            resource_group=None,
            resource_group_region=None,
            projects=[],
        )


from dataclasses import dataclass
from typing import Any, Protocol

import requests
from azure.identity import DefaultAzureCredential

from coreAPIs.projects.api import ProjectsAPI


class FoundryConfigLike(Protocol):
    """Minimal shape required for configured foundry entries."""

    name: str
    endpoint: str
    subscription_id: str | None
    resource_group: str | None
    resource_group_region: str | None


@dataclass
class DiscoveredFoundry:
    """Foundry-like Azure AIServices account discovered from ARM."""

    name: str
    endpoint: str | None
    subscription_id: str | None
    location: str | None
    kind: str | None
    resource_group: str | None = None
    resource_group_region: str | None = None


class FoundriesAPI:
    """Applies subscription and access checks to configured foundry projects."""
    def __init__(self, projects: list[FoundryConfigLike], credential: DefaultAzureCredential) -> None:
        self.projects = projects
        self.credential = credential

    def list(self, user_id: str, subscription_id: str) -> list[FoundryConfigLike]:
        """Return configured foundry entries visible for the current subscription context."""
        if not subscription_id:
            return []

        available: list[FoundryConfigLike] = []

        for project in self.projects:
            project_subscription_id = getattr(project, "subscription_id", None)
            if project_subscription_id and project_subscription_id != subscription_id:
                continue

            try:
                # Listing projects validates the current principal can access this foundry endpoint.
                ProjectsAPI(project.endpoint, self.credential).list()
                available.append(project)
            except Exception:
                continue

        return available

    def _discover_foundries(self, subscription_id: str) -> list[DiscoveredFoundry]:
        """Discover AIServices resources in the selected subscription.

        This aligns the portal dropdown with Azure Portal behavior where users
        expect all Foundry-capable resources in the subscription, regardless of
        region, to appear in a single list.
        """
        if not subscription_id:
            return []

        token = self.credential.get_token("https://management.azure.com/.default")
        url = (
            f"https://management.azure.com/subscriptions/{subscription_id}/resources"
            "?api-version=2021-04-01"
            "&$filter=resourceType eq 'Microsoft.CognitiveServices/accounts'"
        )
        headers = {"Authorization": f"Bearer {token.token}"}

        items: list[DiscoveredFoundry] = []
        next_url: str | None = url
        while next_url:
            response = requests.get(next_url, headers=headers, timeout=30)
            response.raise_for_status()
            payload = response.json() if response.content else {}
            rows = payload.get("value", []) if isinstance(payload, dict) else []

            for row in rows:
                if not isinstance(row, dict):
                    continue

                kind = str(row.get("kind") or "").strip()
                if kind.lower() != "aiservices":
                    continue

                properties = row.get("properties") if isinstance(row.get("properties"), dict) else {}
                endpoint = properties.get("endpoint")
                if not endpoint:
                    custom_domain = str(properties.get("customSubDomainName") or "").strip()
                    if custom_domain:
                        endpoint = f"https://{custom_domain}.services.ai.azure.com"

                if not endpoint:
                    account_name = str(row.get("name") or "").strip()
                    if account_name:
                        endpoint = f"https://{account_name}.services.ai.azure.com"

                # Extract resource group and region from ARM id and location
                arm_id = row.get("id")
                resource_group = None
                if isinstance(arm_id, str):
                    # ARM id format: /subscriptions/{sub}/resourceGroups/{rg}/providers/...
                    parts = arm_id.split("/")
                    if "resourceGroups" in parts:
                        idx = parts.index("resourceGroups")
                        if idx + 1 < len(parts):
                            resource_group = parts[idx + 1]

                # Fetch the actual resource group region using Azure SDK
                from .azure_utils import get_resource_group_region
                resource_group_region = None
                if resource_group:
                    resource_group_region = get_resource_group_region(subscription_id, resource_group)
                if not resource_group_region:
                    resource_group_region = str(row.get("location") or "").strip() or None

                items.append(
                    DiscoveredFoundry(
                        name=str(row.get("name") or "").strip() or "unknown-foundry",
                        endpoint=endpoint,
                        subscription_id=subscription_id,
                        location=str(row.get("location") or "").strip() or None,
                        kind=kind,
                        resource_group=resource_group,
                        resource_group_region=resource_group_region,
                    )
                )

            next_url = payload.get("nextLink") if isinstance(payload, dict) else None

        return items

    def list_items(self, user_id: str, subscription_id: str) -> list[dict[str, str | None]]:
        """Return a UI-ready list payload for foundry selectors, including resource group and region."""
        configured = self.list(user_id, subscription_id)
        if configured:
            return [
                {
                    "name": project.name,
                    "endpoint": project.endpoint,
                    "subscription_id": project.subscription_id,
                    "resource_group": getattr(project, "resource_group", None),
                    "resource_group_region": getattr(project, "resource_group_region", None),
                }
                for project in configured
            ]

        discovered = self._discover_foundries(subscription_id)
        return [
            {
                "name": item.name,
                "endpoint": item.endpoint,
                "subscription_id": item.subscription_id,
                "location": item.location,
                "kind": item.kind,
                "resource_group": getattr(item, "resource_group", None) or None,
                "resource_group_region": getattr(item, "resource_group_region", None) or None,
            }
            for item in discovered
        ]
