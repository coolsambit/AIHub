from __future__ import annotations
from fastapi import APIRouter
import requests
from coreAPIs.aihub import AIHub

from pydantic import BaseModel

# Pydantic model for project output
class ProjectOut(BaseModel):
    name: str
    id: str
    status: str





router = APIRouter()


from fastapi import Query, HTTPException
import os
from azure.identity import DefaultAzureCredential
import json


def _build_foundry_endpoint(foundry_region_url: str, endpoint_path: str) -> str:
    """
    Build the full endpoint URL from the region base and endpoint path.
    """
    if not foundry_region_url or not endpoint_path:
        raise HTTPException(status_code=400, detail="Missing required 'foundryRegionUrl' or 'endpointPath' query parameter.")
    return foundry_region_url.rstrip("/") + "/" + endpoint_path.lstrip("/")

from typing import Optional, List

from typing import List

@router.get(
    "/",
    response_model=List[ProjectOut],
    summary="List projects from a Foundry instance"
)
def list_projects(
    foundryName: Optional[str] = Query(
        None,
        description="Name of the Foundry instance (e.g., Aids-Foundry-Dev)"
    ),
    subscriptionId: Optional[str] = Query(
        None,
        description="Azure Subscription ID for the Foundry resource"
    )
) -> List[ProjectOut]:
    """
    Returns a list of projects from a specified Foundry instance using ARM.

    - **foundryName** (query parameter): The Foundry instance name.
    - **subscriptionId** (query parameter): The Azure Subscription ID.
    - The API uses credentials from the current execution context (e.g., DefaultAzureCredential) to authenticate requests to Azure ARM.
    """
    if not foundryName or not subscriptionId:
        raise HTTPException(status_code=400, detail="Missing required 'foundryName' or 'subscriptionId' query parameter.")
    # Accept both /subscriptions/{guid} and just {guid}
    sub_id = subscriptionId
    if sub_id.startswith("/subscriptions/"):
        sub_id = sub_id[len("/subscriptions/"):]
    credential = DefaultAzureCredential()
    projects = ProjectsAPI.list_by_subscription(sub_id, foundryName, credential)
    return [ProjectOut(**p) for p in projects]

class ProjectsAPI(AIHub):
    """Lists projects for the account resolved from a Foundry endpoint."""
    def __init__(self, endpoint, credential, foundry_name=None):
        super().__init__(endpoint, credential)
        self.foundry_name = foundry_name

    def list(self) -> list[dict]:
        # Use the endpoint as-is, do not append /projects
        return self._get(
            "",
            api_version="2025-06-01",
        )

    @staticmethod
    def list_by_subscription(
        subscription_id: str,
        account_name: str,
        credential,
    ) -> list[dict]:
        """List Foundry projects from ARM for the given subscription/account."""
        if not subscription_id or not account_name:
            return []

        token = credential.get_token("https://management.azure.com/.default")
        url = (
            f"https://management.azure.com/subscriptions/{subscription_id}/resources"
            "?api-version=2021-04-01"
            "&$filter=resourceType eq 'Microsoft.CognitiveServices/accounts/projects'"
        )
        headers = {"Authorization": f"Bearer {token.token}"}

        rows: list[dict] = []
        target_account = account_name.strip().lower()
        next_url: str | None = url

        while next_url:
            response = requests.get(next_url, headers=headers, timeout=30)
            response.raise_for_status()

            payload = response.json() if response.content else {}
            values = payload.get("value", []) if isinstance(payload, dict) else []

            for item in values:
                if not isinstance(item, dict):
                    continue

                full_name = str(item.get("name") or "").strip()
                if "/" not in full_name:
                    continue

                account, project = full_name.split("/", 1)
                if account.strip().lower() != target_account:
                    continue

                properties = item.get("properties") if isinstance(item.get("properties"), dict) else {}
                rows.append(
                    {
                        "name": project,
                        "id": item.get("id"),
                        "status": properties.get("provisioningState") or properties.get("status") or "unknown",
                    }
                )

            next_url = payload.get("nextLink") if isinstance(payload, dict) else None

        return rows
