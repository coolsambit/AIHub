from __future__ import annotations

import requests
from fastapi import APIRouter, Query, Request, HTTPException
from fastapi.responses import JSONResponse
from azure.identity import DefaultAzureCredential

__all__ = ["router"]
router = APIRouter()


@router.get("/", summary="List API keys for a Cognitive Services / Foundry account")
@router.get("", include_in_schema=False)
async def list_keys(
    request: Request,
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
    resourceGroupName: str = Query(..., description="Resource Group Name"),
    accountName: str = Query(..., description="Cognitive Services account name (Foundry)"),
):
    sub_id = subscriptionId
    if sub_id.startswith("/subscriptions/"):
        sub_id = sub_id[len("/subscriptions/"):]

    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = DefaultAzureCredential().get_token("https://management.azure.com/.default").token

    url = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resourceGroupName}"
        f"/providers/Microsoft.CognitiveServices/accounts/{accountName}"
        f"/listKeys?api-version=2023-05-01"
    )
    resp = requests.post(url, headers={"Authorization": f"Bearer {token}"}, timeout=30)
    if not resp.ok:
        return JSONResponse(status_code=resp.status_code, content={"error": resp.text})
    return resp.json()
