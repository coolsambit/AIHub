from __future__ import annotations

import logging
from fastapi import APIRouter, Query, Request, HTTPException
from azure.identity import DefaultAzureCredential
from coreAPIs.arm_client import arm_get

__all__ = ["router"]
router = APIRouter()

_API_VERSION = "2025-10-01-preview"


@router.get("/", summary="List agent applications in a Foundry project")
@router.get("", include_in_schema=False)
def list_agents(
    request: Request,
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
    resourceGroup: str = Query(..., description="Resource Group name"),
    foundryName: str = Query(..., description="Foundry account name"),
    projectName: str = Query(..., description="Project name within the Foundry"),
):
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = DefaultAzureCredential().get_token("https://management.azure.com/.default").token

    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]

    url = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resourceGroup}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundryName}"
        f"/projects/{projectName}/applications?api-version={_API_VERSION}"
    )
    logging.info(f"Agents: GET {url}")

    try:
        response = arm_get(url, token)
    except Exception as e:
        logging.error(f"Agents: request error: {e}")
        raise HTTPException(status_code=500, detail=f"Request error: {e}")

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Agents API {response.status_code}: {response.text[:500]}",
        )

    payload = response.json() if response.content else {}
    items = payload.get("value", [])
    return [
        {
            "name": item.get("name"),
            "displayName": item.get("properties", {}).get("displayName"),
            "baseUrl": item.get("properties", {}).get("baseUrl"),
            "isEnabled": item.get("properties", {}).get("isEnabled"),
            "provisioningState": item.get("properties", {}).get("provisioningState"),
            "id": item.get("id"),
        }
        for item in items
    ]
