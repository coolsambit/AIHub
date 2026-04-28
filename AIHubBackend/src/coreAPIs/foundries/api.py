
from __future__ import annotations

import logging
from fastapi import APIRouter, Request, Query
from azure.identity import DefaultAzureCredential
from coreAPIs.arm_client import arm_get

router = APIRouter()
__all__ = ["router"]

_CS_API_VERSION = "2025-06-01"


@router.get("/", summary="List all AIServices foundries in the selected subscription")
@router.get("", include_in_schema=False)
async def list_foundries(
    request: Request,
    subscription_id: str = Query(..., alias="subscriptionId", description="Azure Subscription ID"),
    user_id: str = Query("", alias="userId", description="Ignored — auth comes from Bearer token"),
) -> list[dict]:
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        try:
            token = DefaultAzureCredential().get_token("https://management.azure.com/.default").token
        except Exception as e:
            logging.error(f"Azure credential error: {e}")
            return [{"error": f"Azure credential error: {e}"}]

    try:
        return _list_aiservices_foundries(subscription_id, token)
    except Exception as e:
        logging.error(f"Foundries API error: {e}")
        return [{"error": f"Foundries API error: {e}"}]


def _list_aiservices_foundries(subscription_id: str, token: str) -> list[dict]:
    """Fetch all AIServices accounts in the subscription via the CognitiveServices provider API."""
    url: str | None = (
        f"https://management.azure.com/subscriptions/{subscription_id}"
        f"/providers/Microsoft.CognitiveServices/accounts?api-version={_CS_API_VERSION}"
    )
    results: list[dict] = []

    while url:
        response = arm_get(url, token)
        response.raise_for_status()
        payload = response.json()

        for account in payload.get("value", []):
            if str(account.get("kind", "")).lower() != "aiservices":
                continue

            resource_group = _extract_resource_group(account.get("id", ""))
            props = account.get("properties") or {}
            endpoint = props.get("endpoint") or _endpoint_fallback(account)
            location = str(account.get("location") or "").strip()

            results.append({
                "name": account.get("name", ""),
                "endpoint": endpoint,
                "subscription_id": subscription_id,
                "location": location,
                "kind": account.get("kind", ""),
                "resource_group": resource_group,
                "resource_group_region": location,
            })

        url = payload.get("nextLink")

    return results


def _extract_resource_group(arm_id: str) -> str | None:
    parts = arm_id.split("/")
    if "resourceGroups" in parts:
        idx = parts.index("resourceGroups")
        if idx + 1 < len(parts):
            return parts[idx + 1]
    return None


def _endpoint_fallback(account: dict) -> str | None:
    name = str(account.get("name") or "").strip().lower()
    return f"https://{name}.cognitiveservices.azure.com/" if name else None


# Thin compatibility shim — kept so package-level imports don't break
class FoundriesAPI:
    def __init__(self, *args, **kwargs):
        pass

    def list_items(self, subscription_id: str, token: str) -> list[dict]:
        return _list_aiservices_foundries(subscription_id, token)
