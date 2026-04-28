from __future__ import annotations

from fastapi import APIRouter, Query, HTTPException
from azure.identity import DefaultAzureCredential
import requests

__all__ = ["router"]
router = APIRouter()


@router.get("/unpublished", summary="List agents from Foundry project")
def list_unpublished_agents(
    foundryEndpoint: str = Query(..., description="Base URL of the Foundry resource, e.g. https://aids-foundry-dev.services.ai.azure.com"),
):
    try:
        credential = DefaultAzureCredential()
        token = credential.get_token("https://ai.azure.com/.default").token
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to acquire token: {e}")

    url = f"{foundryEndpoint.rstrip('/')}/openai/assistants?api-version=2025-01-01-preview"
    headers = {"Authorization": f"Bearer {token}", "Connection": "close"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request error: {e}")

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Foundry API {response.status_code}: {response.text[:500]}"
        )

    payload = response.json() if response.content else {}
    # OpenAI-compatible list response uses "data"; ARM-style uses "value"
    return payload.get("data", payload.get("value", [])) if isinstance(payload, dict) else []
