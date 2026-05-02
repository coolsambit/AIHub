from __future__ import annotations

import logging
from fastapi import APIRouter, Query, Request, HTTPException
from azure.ai.projects import AIProjectClient
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


@router.get("/tools", summary="Aggregate tool types in use across all agents in a project")
def list_tools(
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
    projectName: str = Query(...),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    project = _short_name(projectName)

    account_base = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resourceGroup}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundryName}"
    )
    proj_url = f"{account_base}/projects/{project}?api-version={_API_VERSION}"
    proj_resp = arm_get(proj_url, token)
    if not proj_resp.ok:
        raise HTTPException(status_code=proj_resp.status_code, detail="Could not resolve project endpoint")

    endpoints = proj_resp.json().get("properties", {}).get("endpoints", {})
    data_plane_base = endpoints.get("AI Foundry API") or next(iter(endpoints.values()), None)
    if not data_plane_base:
        raise HTTPException(status_code=404, detail="Could not resolve data plane endpoint")

    try:
        dp_client = AIProjectClient(endpoint=data_plane_base, credential=DefaultAzureCredential())
        agents = list(dp_client.agents.list())
    except Exception as e:
        logging.warning(f"[tools] AIProjectClient error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    tool_map: dict[str, list[str]] = {}
    for agent in agents:
        agent_name = getattr(agent, "name", None) or str(agent)
        tools = getattr(agent, "tools", None) or []
        for t in tools:
            t_type = t.get("type", str(t)) if isinstance(t, dict) else str(t)
            tool_map.setdefault(t_type, [])
            if agent_name not in tool_map[t_type]:
                tool_map[t_type].append(agent_name)

    return [{"type": t, "agents": names} for t, names in sorted(tool_map.items())]


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
        "properties": props,
    }
