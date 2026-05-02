from __future__ import annotations

import logging
from urllib.parse import urlparse

import requests
from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, HTTPException, Query, Request

from coreAPIs.arm_client import arm_get

__all__ = ["router"]
router = APIRouter()

_ARM_VERSION = "2025-10-01-preview"
_DP_VERSION  = "2025-06-01"


def _token(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return DefaultAzureCredential().get_token("https://management.azure.com/.default").token


def _resolve_dp(sub_id: str, resource_group: str, foundry_name: str, project: str, token: str):
    account_base = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resource_group}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundry_name}"
    )
    proj_url = f"{account_base}/projects/{project}?api-version={_ARM_VERSION}"
    r = arm_get(proj_url, token)
    if not r.ok:
        return None, None
    endpoints = r.json().get("properties", {}).get("endpoints", {})
    dp_full = endpoints.get("AI Foundry API") or next(iter(endpoints.values()), None)
    if not dp_full:
        return None, None
    parsed = urlparse(dp_full)
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    parts = [p for p in parsed.path.strip("/").split("/") if p]
    proj_name = parts[-1] if parts else project
    return base_url, proj_name


@router.get("/", summary="List connections in a Foundry project")
@router.get("", include_in_schema=False)
def list_connections(
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
    projectName: str = Query(...),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    project = projectName.strip("/").split("/")[-1]

    base_url, proj_name = _resolve_dp(sub_id, resourceGroup, foundryName, project, token)
    if not base_url:
        raise HTTPException(status_code=404, detail="Could not resolve data plane endpoint")

    dp_token = DefaultAzureCredential().get_token("https://ai.azure.com/.default").token
    url = f"{base_url}/api/projects/{proj_name}/connections?api-version={_DP_VERSION}"
    logging.info(f"[connections] GET {url}")

    try:
        r = requests.get(url, headers={"Authorization": f"Bearer {dp_token}"}, timeout=30)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not r.ok:
        logging.warning(f"[connections] {r.status_code}: {r.text[:200]}")
        raise HTTPException(status_code=r.status_code, detail=r.text[:300])

    payload = r.json() if r.content else {}
    items = payload.get("value", []) if isinstance(payload, dict) else (payload if isinstance(payload, list) else [])

    return [
        {
            "name": item.get("name"),
            "type": (
                item.get("properties", {}).get("category")
                or item.get("connectionType")
                or item.get("type")
                or "Unknown"
            ),
            "target": item.get("properties", {}).get("target") or item.get("target"),
            "isShared": item.get("properties", {}).get("isSharedToAll", False),
        }
        for item in items if isinstance(item, dict)
    ]
