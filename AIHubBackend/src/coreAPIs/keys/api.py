from __future__ import annotations

import logging
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from azure.identity import DefaultAzureCredential
from coreAPIs.arm_client import arm_post

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
    try:
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
        resp = arm_post(url, token)

        try:
            body = resp.json()
        except ValueError:
            body = {"error": resp.text or f"HTTP {resp.status_code}"}

        if not resp.ok:
            logging.error(f"listKeys ARM error {resp.status_code}: {body}")
            return JSONResponse(status_code=resp.status_code, content=body if isinstance(body, dict) else {"error": str(body)})

        return body

    except Exception as e:
        logging.error(f"Keys API unhandled error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
