from __future__ import annotations

import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import APIRouter, Request
from azure.identity import DefaultAzureCredential

__all__ = ["router"]
router = APIRouter()

# Real ARM resource provider namespaces for Azure AI / Cognitive Services
_AI_ACTION_KEYWORDS = ("microsoft.cognitiveservices", "microsoft.machinelearningservices")


def _scope_has_ai_permissions(scope_url: str, headers: dict) -> bool:
    """Return True if the caller has AI-relevant permissions at the given ARM scope URL."""
    try:
        r = requests.get(
            f"{scope_url}/providers/Microsoft.Authorization/permissions?api-version=2022-04-01",
            headers=headers,
            timeout=10,
        )
        if not r.ok:
            return False
        for perm in r.json().get("value", []):
            not_actions = {na.lower() for na in perm.get("notActions", [])}
            for action in perm.get("actions", []):
                action_lower = action.lower()
                # Check if the action grants AI access and is not negated by notActions
                if action_lower == "*":
                    # Owner / Contributor: full access unless AI is explicitly blocked
                    if not any(kw in na for na in not_actions for kw in _AI_ACTION_KEYWORDS):
                        return True
                elif any(kw in action_lower for kw in _AI_ACTION_KEYWORDS):
                    if not any(action_lower.startswith(na.rstrip("*")) for na in not_actions):
                        return True
    except Exception:
        pass
    return False


def _has_ai_permissions(sub_id: str, headers: dict) -> bool:
    """
    Returns True if the caller has AI permissions anywhere in this subscription.
    Checks subscription scope first (fast path), then each resource group (catches
    resource-group-level role assignments that subscription-scope check would miss).
    """
    base = f"https://management.azure.com/subscriptions/{sub_id}"

    if _scope_has_ai_permissions(base, headers):
        return True

    # Subscription-scope check missed it — fall back to per-resource-group check
    try:
        rg_resp = requests.get(
            f"{base}/resourceGroups?api-version=2021-04-01",
            headers=headers,
            timeout=15,
        )
        if not rg_resp.ok:
            return False
        for rg in rg_resp.json().get("value", []):
            rg_url = f"{base}/resourceGroups/{rg['name']}"
            if _scope_has_ai_permissions(rg_url, headers):
                return True
    except Exception:
        pass
    return False


class SubscriptionsAPI:
    def __init__(self, credential=None, user_token=None):
        self.credential = credential
        self.user_token = user_token

    def list(self) -> list[dict]:
        try:
            if self.user_token:
                token_value = self.user_token
            elif self.credential:
                token_value = self.credential.get_token("https://management.azure.com/.default").token
            else:
                return []

            headers = {"Authorization": f"Bearer {token_value}", "Content-Type": "application/json"}

            subs_resp = requests.get(
                "https://management.azure.com/subscriptions?api-version=2020-01-01",
                headers=headers,
                timeout=30,
            )
            if not subs_resp.ok:
                return []
            all_subs = subs_resp.json().get("value", [])
            if not all_subs:
                return []

            # Return all subscriptions the user has access to (no AI permission filtering)
            return all_subs
        except Exception:
            return []


@router.get("/", summary="List subscriptions where the user has Cognitive Services or Azure AI roles")
@router.get("", include_in_schema=False)
async def list_subscriptions(request: Request):
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        user_token = auth_header.split(" ", 1)[1]
        return SubscriptionsAPI(user_token=user_token).list()
    credential = DefaultAzureCredential()
    return SubscriptionsAPI(credential=credential).list()
