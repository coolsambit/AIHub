from __future__ import annotations

import logging

from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, HTTPException, Query, Request

from coreAPIs.arm_client import arm_get

__all__ = ["router"]
router = APIRouter()

_ARM_VERSION = "2025-10-01-preview"


def _token(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return DefaultAzureCredential().get_token("https://management.azure.com/.default").token


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

    url = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resourceGroup}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundryName}"
        f"/projects/{project}/connections?api-version={_ARM_VERSION}"
    )

    logging.info(f"[connections] projectName={projectName} → project={project}")
    logging.info(f"[connections] GET {url}")

    r = arm_get(url, token)
    logging.info(f"[connections] Response status: {r.status_code}")

    if not r.ok:
        logging.error(f"[connections] Error body: {r.text[:300]}")
        raise HTTPException(status_code=r.status_code, detail=r.text[:300])

    items = r.json().get("value", []) if r.content else []
    logging.info(f"[connections] Found {len(items)} connections: {[i.get('name') for i in items if isinstance(i, dict)]}")

    return [
        {
            "name": item.get("name"),
            "type": (
                item.get("properties", {}).get("category")
                or item.get("properties", {}).get("authType")
                or item.get("type")
                or "Unknown"
            ),
            "target": item.get("properties", {}).get("target"),
            "isShared": item.get("properties", {}).get("isSharedToAll", False),
        }
        for item in items if isinstance(item, dict)
    ]
