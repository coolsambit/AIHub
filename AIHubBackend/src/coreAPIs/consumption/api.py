from __future__ import annotations

import os
import logging
import requests
from fastapi import APIRouter, Query, Request, HTTPException

__all__ = ["router"]
router = APIRouter()

_APIM_RG      = "AI-102"
_APIM_SERVICE = "AIGatewayAIDS"
_APIM_GW_URL  = "https://aigatewayadis.azure-api.net"
_APIM_API_VER = "2023-05-01-preview"
_SKIP_SUBS    = {"master"}   # built-in APIM subscriptions to exclude


def _token(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    raise HTTPException(status_code=401, detail="No bearer token")


def _admin_key() -> str:
    key = os.getenv("APIM_ADMIN_KEY", "")
    if not key:
        raise HTTPException(status_code=500, detail="APIM_ADMIN_KEY env var not configured")
    return key


def _arm_base(azure_sub_id: str) -> str:
    return (
        f"https://management.azure.com/subscriptions/{azure_sub_id}"
        f"/resourceGroups/{_APIM_RG}"
        f"/providers/Microsoft.ApiManagement/service/{_APIM_SERVICE}"
    )


def _arm_get(url: str, token: str) -> dict:
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=15)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text[:300])
    return resp.json()


def _gw_get(path: str, admin_key: str) -> requests.Response:
    return requests.get(
        f"{_APIM_GW_URL}{path}",
        headers={"Ocp-Apim-Subscription-Key": admin_key},
        timeout=10,
    )


def _gw_delete(path: str, admin_key: str) -> requests.Response:
    return requests.delete(
        f"{_APIM_GW_URL}{path}",
        headers={"Ocp-Apim-Subscription-Key": admin_key},
        timeout=10,
    )


@router.get("/", summary="Token consumption per project per model from APIM cache")
def get_consumption(
    request: Request,
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
):
    token     = _token(request)
    admin_key = _admin_key()
    arm_base  = _arm_base(subscriptionId)

    # 1. List APIM subscriptions (one per project)
    subs_data = _arm_get(
        f"{arm_base}/subscriptions?api-version={_APIM_API_VER}&$top=100",
        token,
    )
    apim_subs = [
        s for s in subs_data.get("value", [])
        if s.get("name") not in _SKIP_SUBS
    ]
    logging.info(f"[consumption] {len(apim_subs)} APIM subscriptions found")

    # 2. Fetch usage from APIM gateway for each subscription
    result = []
    for sub in apim_subs:
        sub_id      = sub.get("name", "")
        display     = sub.get("properties", {}).get("displayName", sub_id)
        scope       = sub.get("properties", {}).get("scope", "")

        try:
            resp = _gw_get(f"/internal/usage?subscriptionId={sub_id}", admin_key)
            models = resp.json().get("models", []) if resp.ok else []
        except Exception as e:
            logging.warning(f"[consumption] usage fetch failed for {sub_id}: {e}")
            models = []

        result.append({
            "subscriptionId": sub_id,
            "displayName":    display,
            "scope":          scope,
            "models":         models,   # [{model, tokensUsed, tokenLimit}]
        })

    return result


@router.delete("/reset", summary="Reset token counter for a project (optionally a specific model)")
def reset_consumption(
    request: Request,
    subscriptionId:     str = Query(..., description="Azure Subscription ID"),
    apimSubscriptionId: str = Query(..., description="APIM Subscription ID to reset"),
    model:              str = Query("",  description="Model name — omit to reset all models"),
):
    _token(request)   # validate auth
    admin_key = _admin_key()

    path = f"/internal/usage?subscriptionId={apimSubscriptionId}"
    if model:
        path += f"&model={model}"

    resp = _gw_delete(path, admin_key)
    if not resp.ok and resp.status_code != 204:
        raise HTTPException(status_code=resp.status_code, detail=f"APIM reset failed: {resp.text[:200]}")

    logging.info(f"[consumption] reset {apimSubscriptionId} model={model or 'ALL'}")
    return {"status": "reset", "apimSubscriptionId": apimSubscriptionId, "model": model or "all"}
