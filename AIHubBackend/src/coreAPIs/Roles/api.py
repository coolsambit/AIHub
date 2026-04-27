from __future__ import annotations

import requests
from concurrent.futures import ThreadPoolExecutor
from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, Request

__all__ = ["router"]
router = APIRouter()

CS_OPENAI_ROLES = {
    "a001fd3d-188f-4b5d-821b-7da978bf7442": "Cognitive Services OpenAI Contributor",
    "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd": "Cognitive Services OpenAI User",
    "a97b65f3-24c7-4388-baec-2e87135dc908": "Cognitive Services User",
    "25fbc0a9-bd7c-42a3-aa1a-3b75d497ee68": "Cognitive Services Contributor",
    "64702f94-c441-49e6-a78b-ef80e0188fee": "Azure AI Developer",
    "b78c5d69-af96-48a3-bf8d-a8b4d507de25": "Azure AI Administrator",
    "3afb7f49-54cb-416e-8c09-6dc049efa503": "Azure AI Inference Deployment Operator",
    "8e3af657-a8ff-443c-a75c-2fe8c4bcb635": "Owner",
    "b24988ac-6180-42a0-ab88-20f7382dd24c": "Contributor",
    "acdd72a7-3385-48ef-bd42-f606fba81ae7": "Reader",
}



@router.get("/", summary="List the current user's subscription and Cognitive Services OpenAI role assignments")
@router.get("", include_in_schema=False)
async def list_roles(request: Request, subscription_id: str, user_id: str):
    oid = user_id

    auth_header = request.headers.get("authorization", "")
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        try:
            credential = DefaultAzureCredential()
            token = credential.get_token("https://management.azure.com/.default").token
            print("[Roles] using DefaultAzureCredential fallback")
        except Exception as e:
            print(f"[Roles] credential fallback failed: {e}")
            return {"subscription_roles": [], "cognitive_roles": [], "azure_ai_roles": []}

    headers = {"Authorization": f"Bearer {token}"}

    def fetch_pages(filter_expr: str) -> list:
        url = (
            f"https://management.azure.com/subscriptions/{subscription_id}"
            f"/providers/Microsoft.Authorization/roleAssignments"
            f"?api-version=2022-04-01&$filter={filter_expr}"
        )
        items = []
        while url:
            try:
                r = requests.get(url, headers=headers, timeout=20)
                print(f"[Roles] {filter_expr[:30]} → {r.status_code}, {len(r.content)} bytes")
                if not r.ok:
                    break
                data = r.json()
                items.extend(data.get("value", []))
                url = data.get("nextLink")
            except Exception as e:
                print(f"[Roles] fetch error ({filter_expr[:30]}): {e}")
                break
        return items

    # Run assignedTo (cross-scope, eventually consistent) and principalId eq
    # (subscription-scope, always reliable) in parallel, then merge.
    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            f_assigned = pool.submit(fetch_pages, f"assignedTo('{oid}')")
            f_direct   = pool.submit(fetch_pages, f"principalId eq '{oid}'")
            assigned   = f_assigned.result()
            direct     = f_direct.result()

        seen, assignments = set(), []
        for a in assigned + direct:
            aid = a.get("id", "")
            if aid not in seen:
                seen.add(aid)
                assignments.append(a)

        print(f"[Roles] merged {len(assigned)} assignedTo + {len(direct)} direct → {len(assignments)} unique")
    except Exception as e:
        print(f"[Roles] error: {e}")
        return {"subscription_roles": [], "cognitive_roles": [], "azure_ai_roles": []}

    # Role GUID sets
    cognitive_guids = {
        "a001fd3d-188f-4b5d-821b-7da978bf7442",
        "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd",
        "a97b65f3-24c7-4388-baec-2e87135dc908",
        "25fbc0a9-bd7c-42a3-aa1a-3b75d497ee68",
    }
    azure_ai_guids = {
        "64702f94-c441-49e6-a78b-ef80e0188fee",
        "b78c5d69-af96-48a3-bf8d-a8b4d507de25",
        "3afb7f49-54cb-416e-8c09-6dc049efa503",
    }
    subscription_guids = {
        "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
        "b24988ac-6180-42a0-ab88-20f7382dd24c",
        "acdd72a7-3385-48ef-bd42-f606fba81ae7",
    }

    cognitive_roles = []
    azure_ai_roles = []
    subscription_roles = []

    for a in assignments:
        role_id = a.get("properties", {}).get("roleDefinitionId", "").split("/")[-1].lower()
        role_name = CS_OPENAI_ROLES.get(role_id)
        if not role_name:
            continue
        if role_id in cognitive_guids:
            cognitive_roles.append(role_name)
        elif role_id in azure_ai_guids:
            azure_ai_roles.append(role_name)
        elif role_id in subscription_guids:
            subscription_roles.append(role_name)

    # Remove duplicates, preserve order
    def dedup(seq):
        seen = set()
        return [x for x in seq if not (x in seen or seen.add(x))]
    cognitive_roles = dedup(cognitive_roles)
    azure_ai_roles = dedup(azure_ai_roles)
    subscription_roles = dedup(subscription_roles)

    return {
        "cognitive_roles": cognitive_roles,
        "azure_ai_roles": azure_ai_roles,
        "subscription_roles": subscription_roles
    }
