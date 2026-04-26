from __future__ import annotations

import requests
from fastapi import APIRouter, Request
from azure.identity import DefaultAzureCredential
from coreAPIs.aihub import AIHub

__all__ = ["router"]
router = APIRouter()


class SubscriptionsAPI(AIHub):
    """Lists Azure subscriptions that contain at least one Cognitive Services account."""

    def __init__(self, endpoint, credential=None, user_token=None):
        self.endpoint = endpoint
        self.credential = credential
        self.user_token = user_token

    def list(self) -> list[dict]:
        if self.user_token:
            token_value = self.user_token
        elif self.credential:
            token_value = self.credential.get_token("https://management.azure.com/.default").token
        else:
            raise RuntimeError("No credential or user token provided.")

        headers = {"Authorization": f"Bearer {token_value}", "Content-Type": "application/json"}

        # Step 1: get all subscriptions the user can access
        subs_resp = requests.get(
            "https://management.azure.com/subscriptions?api-version=2020-01-01",
            headers=headers,
            timeout=30,
        )
        try:
            subs_payload = subs_resp.json()
        except Exception:
            return []
        all_subs = subs_payload.get("value") if isinstance(subs_payload, dict) else None
        if not isinstance(all_subs, list) or not all_subs:
            return []

        # Step 2: single Resource Graph query to find which subscriptions have
        # Cognitive Services accounts — avoids N slow per-subscription SDK calls.
        sub_ids = [s["subscriptionId"] for s in all_subs if s.get("subscriptionId")]
        try:
            graph_resp = requests.post(
                "https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2022-10-01",
                headers=headers,
                json={
                    "subscriptions": sub_ids,
                    "query": "Resources | where type =~ 'microsoft.cognitiveservices/accounts' | distinct subscriptionId",
                },
                timeout=30,
            )
            graph_payload = graph_resp.json()
            cognitive_sub_ids = {
                row["subscriptionId"]
                for row in (graph_payload.get("data") or [])
                if isinstance(row, dict) and row.get("subscriptionId")
            }
        except Exception:
            cognitive_sub_ids = set()

        return [s for s in all_subs if s.get("subscriptionId") in cognitive_sub_ids]


@router.get("/", summary="List subscriptions that have Cognitive Services resources")
async def list_subscriptions(request: Request):
    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        user_token = auth_header.split(" ", 1)[1]
        return SubscriptionsAPI(endpoint="https://management.azure.com", user_token=user_token).list()
    credential = DefaultAzureCredential()
    return SubscriptionsAPI(endpoint="https://management.azure.com", credential=credential).list()
