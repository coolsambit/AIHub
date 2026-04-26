
from __future__ import annotations

from fastapi import Query, HTTPException
from azure.identity import DefaultAzureCredential
import requests

from fastapi import APIRouter


__all__ = ["router"]
router = APIRouter()
# New endpoint to fetch agents directly from Foundry resource (not ARM)
@router.get("/unpublished", summary="List all agents (applications) from Foundry endpoint, including unpublished")
def list_unpublished_agents(
    foundryEndpoint: str = Query(..., description="Base URL of the Foundry resource, e.g. https://aids-foundry-dev.eastus.ai.azure.com"),
    projectName: str = Query(..., description="Project Name")
):
    if not (foundryEndpoint and projectName):
        raise HTTPException(status_code=400, detail="Missing required parameters.")

    credential = DefaultAzureCredential()
    token = credential.get_token("https://ai.azure.com/.default")
    url = f"{foundryEndpoint.rstrip('/')}/api/projects/{projectName}/applications?api-version=2025-10-01-preview"
    headers = {"Authorization": f"Bearer {token.token}"}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    payload = response.json() if response.content else {}
    return payload.get("value", []) if isinstance(payload, dict) else []

@router.get("/sdk", summary="List agents using direct REST API (Agent-SDK style)")
def list_agents_sdk(
    foundryEndpoint: str = Query(..., description="Base URL of the Foundry resource, e.g. https://aids-foundry-dev.eastus.ai.azure.com"),
    projectName: str = Query(..., description="Project Name")
):
    """
    Lists agents (applications) for a Foundry project using the direct REST API approach (Agent-SDK style).
    """
    if not (foundryEndpoint and projectName):
        raise HTTPException(status_code=400, detail="Missing required parameters.")

    credential = DefaultAzureCredential()
    token = credential.get_token("https://ai.azure.com/.default")
    url = f"{foundryEndpoint.rstrip('/')}/api/projects/{projectName}/applications?api-version=2025-10-01-preview"
    headers = {"Authorization": f"Bearer {token.token}"}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    payload = response.json() if response.content else {}
    return payload.get("value", []) if isinstance(payload, dict) else []




from fastapi import Query, HTTPException
from azure.identity import DefaultAzureCredential
import requests

# List applications (agents) for a Foundry project
@router.get("/applications", summary="List all applications (agents) for a Foundry project")
def list_applications(
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
    resourceGroupName: str = Query(..., description="Resource Group Name"),
    accountName: str = Query(..., description="Cognitive Services Account Name (Foundry)", alias="accountName"),
    projectName: str = Query(..., description="Project Name")
):
    """
    Returns a list of applications (agents) for a given Foundry project using ARM.
    """
    if not (subscriptionId and resourceGroupName and accountName and projectName):
        raise HTTPException(status_code=400, detail="Missing required parameters.")

    credential = DefaultAzureCredential()
    token = credential.get_token("https://management.azure.com/.default")
    url = (
        f"https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/"
        f"Microsoft.CognitiveServices/accounts/{accountName}/projects/{projectName}/applications?api-version=2025-10-01-preview"
    )
    headers = {"Authorization": f"Bearer {token.token}"}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    payload = response.json() if response.content else {}
    # TEMP: Return the full payload for debugging
    return payload


from coreAPIs.aihub import AIHub


class AgentsAPI(AIHub):
    """Lists project-level agent resources for a Foundry project."""
    def list(self) -> list[dict]:
        return self._get(
            f"/api/projects/{self.parts.project_name}/agents",
            api_version="2025-10-01-preview",
        )
