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


def _resolve_data_plane(sub_id: str, resource_group: str, foundry_name: str, project: str, token: str) -> str | None:
    proj_url = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resource_group}"
        f"/providers/Microsoft.CognitiveServices/accounts/{foundry_name}"
        f"/projects/{project}?api-version={_API_VERSION}"
    )
    r = arm_get(proj_url, token)
    logging.info(f"[agents] project ARM status: {r.status_code}")
    if not r.ok:
        logging.error(f"[agents] project ARM error: {r.text[:300]}")
        return None
    endpoints = r.json().get("properties", {}).get("endpoints", {})
    dp = endpoints.get("AI Foundry API") or next(iter(endpoints.values()), None)
    logging.info(f"[agents] data plane endpoint: {dp}")
    return dp


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
    project = _short_name(projectName)

    logging.info(f"[agents] foundry={foundryName} project={project} rg={resourceGroup}")

    data_plane_base = _resolve_data_plane(sub_id, resourceGroup, foundryName, project, token)
    if not data_plane_base:
        raise HTTPException(status_code=404, detail="Could not resolve data plane endpoint for project")

    try:
        dp_client = AIProjectClient(endpoint=data_plane_base, credential=DefaultAzureCredential())
        raw_agents = list(dp_client.agents.list())
        logging.info(f"[agents] data plane returned {len(raw_agents)} agents")
    except Exception as e:
        logging.error(f"[agents] AIProjectClient error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    result = []
    for a in raw_agents:
        name = getattr(a, "name", None) or getattr(a, "id", None)
        logging.info(f"[agents] agent: id={getattr(a, 'id', None)} name={name}")
        result.append({
            "name": name,
            "id": getattr(a, "id", None),
            "displayName": name,
        })
    return result


def _to_dict(t) -> dict:
    """Normalise a tool object (SDK class or plain dict) to a plain Python dict."""
    if isinstance(t, dict):
        return t
    if hasattr(t, "as_dict"):
        return t.as_dict()
    if hasattr(t, "__dict__"):
        return {k: v for k, v in vars(t).items() if not k.startswith("_")}
    return {}


def _tool_label(t: dict) -> str:
    """For connection-backed tools show the connection name; otherwise show the type."""
    for key in ("azure_ai_search", "bing_grounding", "sharepoint_grounding", "azure_function"):
        blob = t.get(key) or {}
        conn_id = blob.get("index_connection_id") or blob.get("connection_id") or ""
        if conn_id:
            return conn_id.strip("/").split("/")[-1]
    return t.get("type") or str(t)


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

    logging.info(f"[tools] projectName={projectName} → project={project}")
    logging.info(f"[tools] foundryName={foundryName} resourceGroup={resourceGroup}")

    # Step 1: list agent application names from ARM
    apps_url = f"{account_base}/projects/{project}/applications?api-version={_API_VERSION}"
    logging.info(f"[tools] Step1 GET {apps_url}")
    apps_resp = arm_get(apps_url, token)
    logging.info(f"[tools] Step1 status: {apps_resp.status_code}")
    if not apps_resp.ok:
        logging.error(f"[tools] Step1 error: {apps_resp.text[:300]}")
        raise HTTPException(status_code=apps_resp.status_code, detail="Could not list agent applications")
    agent_names = [item.get("name") for item in apps_resp.json().get("value", []) if item.get("name")]
    logging.info(f"[tools] Step1 agents found: {agent_names}")

    # Step 2: resolve data plane endpoint
    proj_url = f"{account_base}/projects/{project}?api-version={_API_VERSION}"
    logging.info(f"[tools] Step2 GET {proj_url}")
    proj_resp = arm_get(proj_url, token)
    logging.info(f"[tools] Step2 status: {proj_resp.status_code}")
    if not proj_resp.ok:
        logging.error(f"[tools] Step2 error: {proj_resp.text[:300]}")
        raise HTTPException(status_code=proj_resp.status_code, detail="Could not resolve project endpoint")
    endpoints = proj_resp.json().get("properties", {}).get("endpoints", {})
    data_plane_base = endpoints.get("AI Foundry API") or next(iter(endpoints.values()), None)
    logging.info(f"[tools] Step2 data_plane_base: {data_plane_base}")
    if not data_plane_base:
        raise HTTPException(status_code=404, detail="Could not resolve data plane endpoint")

    # Step 3: for each agent get full definition (same pattern as inspect endpoint)
    dp_client = AIProjectClient(endpoint=data_plane_base, credential=DefaultAzureCredential())
    tool_map: dict[str, list[str]] = {}

    for name in agent_names:
        try:
            raw = dp_client.agents.get(name)
            agent_dict = dict(raw) if raw else {}
            defn = (agent_dict.get("versions") or {}).get("latest", {}).get("definition", {})
            raw_tools = defn.get("tools") or []
            logging.info(f"[tools] Agent '{name}' raw_tools: {raw_tools}")
            for t in raw_tools:
                t_dict = _to_dict(t)
                label = _tool_label(t_dict)
                tool_map.setdefault(label, [])
                if name not in tool_map[label]:
                    tool_map[label].append(name)
        except Exception as e:
            logging.warning(f"[tools] Could not fetch agent '{name}': {e}")

    logging.info(f"[tools] Final tool_map: {tool_map}")
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
