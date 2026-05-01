from __future__ import annotations

import logging
from fastapi import APIRouter, Query, Request, HTTPException
from azure.identity import DefaultAzureCredential
from coreAPIs.arm_client import arm_get

__all__ = ["router"]
router = APIRouter()

_API_VERSION = "2025-10-01-preview"


def _token(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return DefaultAzureCredential().get_token("https://management.azure.com/.default").token


def _short_name(arm_id_or_name: str) -> str:
    """Return the last path segment of a full ARM resource ID, or the string as-is."""
    return arm_id_or_name.strip("/").split("/")[-1]


def _base(sub_id: str, resource_group: str, foundry_name: str, project_name: str) -> str:
    return (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resource_group}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundry_name}"
        f"/projects/{_short_name(project_name)}"
    )


@router.get("/", summary="List agent applications in a Foundry project")
@router.get("", include_in_schema=False)
def list_agents(
    request: Request,
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
    resourceGroup: str = Query(..., description="Resource Group name"),
    foundryName: str = Query(..., description="Foundry account name"),
    projectName: str = Query(..., description="Project name within the Foundry"),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    url = f"{_base(sub_id, resourceGroup, foundryName, projectName)}/applications?api-version={_API_VERSION}"
    logging.info(f"Agents list: GET {url}")

    try:
        response = arm_get(url, token)
    except Exception as e:
        logging.error(f"Agents list error: {e}")
        raise HTTPException(status_code=500, detail=f"Request error: {e}")

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Agents API {response.status_code}: {response.text[:500]}",
        )

    payload = response.json() if response.content else {}
    items = payload.get("value", [])
    return [
        {
            "name": item.get("name"),
            "displayName": item.get("properties", {}).get("displayName"),
            "baseUrl": item.get("properties", {}).get("baseUrl"),
            "isEnabled": item.get("properties", {}).get("isEnabled"),
            "provisioningState": item.get("properties", {}).get("provisioningState"),
            "id": item.get("id"),
        }
        for item in items
    ]


@router.get("/{agentName}", summary="Get full details of a single agent, including guardrail assignments")
def get_agent(
    agentName: str,
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
    projectName: str = Query(...),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    url = f"{_base(sub_id, resourceGroup, foundryName, projectName)}/applications/{agentName}?api-version={_API_VERSION}"
    logging.info(f"Agent detail: GET {url}")

    try:
        response = arm_get(url, token)
    except Exception as e:
        logging.error(f"Agent detail error: {e}")
        raise HTTPException(status_code=500, detail=f"Request error: {e}")

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Agent API {response.status_code}: {response.text[:500]}",
        )

    item = response.json() if response.content else {}
    props = item.get("properties", {})
    return {
        "name": item.get("name"),
        "id": item.get("id"),
        "displayName": props.get("displayName"),
        "baseUrl": props.get("baseUrl"),
        "isEnabled": props.get("isEnabled"),
        "provisioningState": props.get("provisioningState"),
        "guardrailConfiguration": props.get("guardrailConfiguration"),
        "guardrailId": props.get("guardrailId"),
        "properties": props,  # full properties so no data is hidden
    }


@router.get("/{agentName}/guardrails", summary="List all guardrails in the project and flag which are assigned to this agent")
def get_agent_guardrails(
    agentName: str,
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
    projectName: str = Query(...),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    base = _base(sub_id, resourceGroup, foundryName, projectName)

    # Fetch the agent so we know which guardrail(s) it references
    agent_url = f"{base}/applications/{agentName}?api-version={_API_VERSION}"
    logging.info(f"Agent guardrails (agent fetch): GET {agent_url}")
    try:
        agent_resp = arm_get(agent_url, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Request error fetching agent: {e}")
    if not agent_resp.ok:
        raise HTTPException(status_code=agent_resp.status_code, detail=agent_resp.text[:500])

    agent_props = (agent_resp.json() if agent_resp.content else {}).get("properties", {})
    assigned_id = agent_props.get("guardrailId") or agent_props.get("guardrailConfiguration", {}).get("guardrailId") if isinstance(agent_props.get("guardrailConfiguration"), dict) else None

    # Fetch all guardrails at the project level (path may not exist in all API versions)
    gr_url = f"{base}/guardrails?api-version={_API_VERSION}"
    logging.info(f"Agent guardrails (project list): GET {gr_url}")
    items = []
    try:
        gr_resp = arm_get(gr_url, token)
        if gr_resp.ok:
            items = (gr_resp.json() if gr_resp.content else {}).get("value", [])
        else:
            logging.warning(f"Guardrails list not available ({gr_resp.status_code}): {gr_resp.text[:300]}")
    except Exception as e:
        logging.error(f"Guardrails list request error: {e}")
    return {
        "agentName": agentName,
        "assignedGuardrailId": assigned_id,
        "guardrails": [
            {
                "name": g.get("name"),
                "id": g.get("id"),
                "assignedToThisAgent": g.get("id") == assigned_id or g.get("name") == assigned_id,
                "properties": g.get("properties", {}),
            }
            for g in items
        ],
    }
