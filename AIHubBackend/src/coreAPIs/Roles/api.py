from __future__ import annotations

import requests
from fastapi import APIRouter, Request
import re
import os
def is_oid(value: str) -> bool:
    # OID is a 36-char UUID
    return bool(re.fullmatch(r"[0-9a-fA-F\-]{36}", value))

def get_graph_token() -> str:
    # Use client credentials from environment variables
    tenant_id = os.environ.get("AZURE_TENANT_ID")
    client_id = os.environ.get("AZURE_CLIENT_ID")
    client_secret = os.environ.get("AZURE_CLIENT_SECRET")
    if not all([tenant_id, client_id, client_secret]):
        raise RuntimeError("Missing Graph API credentials in environment variables.")
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default"
    }
    resp = requests.post(token_url, data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]

def resolve_oid_from_upn(upn: str) -> str:
    token = get_graph_token()
    url = f"https://graph.microsoft.com/v1.0/users/{upn}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    if resp.status_code == 404:
        raise ValueError(f"User not found in AAD: {upn}")
    resp.raise_for_status()
    return resp.json().get("id")
from azure.identity import DefaultAzureCredential

__all__ = ["router"]
router = APIRouter()

CS_OPENAI_ROLES = {
    # Cognitive Services / OpenAI data-plane roles
    "a001fd3d-188f-4b5d-821b-7da978bf7442": "Cognitive Services OpenAI Contributor",
    "5e0bd9bd-7b93-4f28-af87-19fc36ad61bd": "Cognitive Services OpenAI User",
    "a97b65f3-24c7-4388-baec-2e87135dc908": "Cognitive Services User",
    "25fbc0a9-bd7c-42a3-aa1a-3b75d497ee68": "Cognitive Services Contributor",
    # Azure AI roles
    "64702f94-c441-49e6-a78b-ef80e0188fee": "Azure AI Developer",
    "b78c5d69-af96-48a3-bf8d-a8b4d507de25": "Azure AI Administrator",
    "3afb7f49-54cb-416e-8c09-6dc049efa503": "Azure AI Inference Deployment Operator",
    # Broad subscription roles
    "8e3af657-a8ff-443c-a75c-2fe8c4bcb635": "Owner",
    "b24988ac-6180-42a0-ab88-20f7382dd24c": "Contributor",
    "acdd72a7-3385-48ef-bd42-f606fba81ae7": "Reader",
}


def _role_name_from_assignment(assignment: dict) -> str | None:
    role_def_id = assignment.get("properties", {}).get("roleDefinitionId", "")
    guid = role_def_id.split("/")[-1].lower()
    return CS_OPENAI_ROLES.get(guid)



@router.get("/", summary="List the current user's subscription and Cognitive Services OpenAI role assignments")
async def list_roles(request: Request, subscription_id: str, user_id: str):
    print(f"[Roles] received headers: {{ { {k: v[:20] for k, v in request.headers.items()} } }}")
    # Resolve OID if needed
    oid = user_id
    if not is_oid(user_id):
        try:
            oid = resolve_oid_from_upn(user_id)
            print(f"[Roles] resolved UPN {user_id} to OID {oid}")
        except Exception as e:
            print(f"[Roles] failed to resolve OID for {user_id}: {e}")
            return {"subscription_roles": [], "cs_openai_roles": []}

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
            return {"subscription_roles": [], "cs_openai_roles": []}

    headers = {"Authorization": f"Bearer {token}"}
    url = (
        f"https://management.azure.com/subscriptions/{subscription_id}"
        f"/providers/Microsoft.Authorization/roleAssignments"
        f"?api-version=2022-04-01&$filter=assignedTo('{oid}')"
    )

    try:
        resp = requests.get(url, headers=headers, timeout=30)
        print(f"[Roles] ARM status: {resp.status_code}, body: {resp.text[:500]}")
        assignments = resp.json().get("value", [])
    except Exception as e:
        print(f"[Roles] error: {e}")
        return {"subscription_roles": [], "cs_openai_roles": []}

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
