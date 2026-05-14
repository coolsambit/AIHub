from __future__ import annotations

import logging
import xml.etree.ElementTree as ET

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, HTTPException, Query, Request

from coreAPIs.arm_client import arm_get, arm_post

__all__ = ["router"]
router = APIRouter()

_ARM_VERSION = "2025-10-01-preview"
_RAI_VERSION = "2025-04-01-preview"
_APIM_VERSION = "2023-05-01-preview"


# ── Shared helpers ────────────────────────────────────────────────────────────

def _token(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return DefaultAzureCredential().get_token("https://management.azure.com/.default").token


def _short(arm_id: str) -> str:
    return arm_id.strip("/").split("/")[-1]


def _account_base(sub_id: str, rg: str, account: str) -> str:
    return (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{rg}"
        f"/providers/Microsoft.CognitiveServices/accounts/{account}"
    )


def _safe_get(url: str, token: str, label: str) -> dict | None:
    try:
        r = arm_get(url, token)
        if r.ok:
            return r.json() if r.content else {}
        logging.warning(f"[inspect] {label}: HTTP {r.status_code} — {r.text[:200]}")
        return None
    except Exception as e:
        logging.error(f"[inspect] {label} error: {e}")
        return None


def _safe_get_with_status(url: str, token: str, label: str) -> tuple[dict | None, int]:
    try:
        r = arm_get(url, token)
        logging.info(f"[inspect] {label}: HTTP {r.status_code}")
        if r.ok:
            return (r.json() if r.content else {}), r.status_code
        return None, r.status_code
    except Exception as e:
        logging.error(f"[inspect] {label} error: {e}")
        return None, 0


# ── APIM XML normaliser ───────────────────────────────────────────────────────

def _try_cast(value: str):
    if value.isdigit():
        return int(value)
    try:
        return float(value)
    except ValueError:
        return value


def _parse_element(elem) -> dict:
    node = {"type": elem.tag}
    for k, v in elem.attrib.items():
        node[k.replace("-", "_")] = _try_cast(v)
    children = list(elem)
    if children:
        node["children"] = [_parse_element(c) for c in children]
    text = (elem.text or "").strip()
    if text and not children:
        node["value"] = text
    return node


def _normalize_apim_xml(xml_string: str) -> dict:
    try:
        root = ET.fromstring(xml_string)
    except ET.ParseError:
        return {"error": "invalid XML"}
    result = {}
    for section in ["inbound", "backend", "outbound", "on-error"]:
        sec = root.find(section)
        if sec is not None:
            result[section] = [_parse_element(c) for c in sec]
    return result


def _extract_gateway_guardrails(policy_json: dict) -> dict:
    guardrails = {
        "rate_limit": None,
        "token_limit": None,
        "pii_masking": False,
        "auth_enforced": False,
        "semantic_cache": False,
    }
    for p in policy_json.get("inbound", []):
        t = p.get("type", "")
        if t == "rate-limit":
            guardrails["rate_limit"] = {
                "calls": p.get("calls"),
                "period": p.get("renewal_period"),
            }
        if t == "azure-openai-token-limit":
            guardrails["token_limit"] = {
                "tokens_per_minute": p.get("tokens_per_minute"),
            }
        if t == "azure-openai-semantic-cache-lookup":
            guardrails["semantic_cache"] = True
        if t == "set-body" and "mask" in p.get("value", "").lower():
            guardrails["pii_masking"] = True
        if t in ("validate-jwt", "authentication-managed-identity"):
            guardrails["auth_enforced"] = True
    return guardrails


# ── Composite endpoint ────────────────────────────────────────────────────────

@router.get(
    "/agents/{agentName}/guardrails",
    summary="Multi-layer guardrail inspection: agent → deployment → RAI policy → APIM gateway",
)
def inspect_agent_guardrails(
    agentName: str,
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
    projectName: str = Query(...),
    apimName: str = Query(None, description="APIM service name (optional)"),
    apimApiId: str = Query(None, description="APIM API ID — defaults to foundryName if not provided"),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    project = _short(projectName)
    account_base = _account_base(sub_id, resourceGroup, foundryName)
    resolved_apim_api_id = apimApiId or foundryName

    result = {}

    # ── Layer 1: Agent definition via AIProjectClient (data plane) ───────────────
    project_url = f"{account_base}/projects/{project}?api-version={_ARM_VERSION}"
    project_data = _safe_get(project_url, token, "Project")
    data_plane_base = None
    if project_data:
        endpoints = project_data.get("properties", {}).get("endpoints", {})
        data_plane_base = endpoints.get("AI Foundry API") or next(iter(endpoints.values()), None)

    if not data_plane_base:
        raise HTTPException(status_code=404, detail=f"Could not resolve data plane endpoint for foundry '{foundryName}'")

    dp_agent = None
    rai_policy_name_from_agent = None
    try:
        dp_client = AIProjectClient(endpoint=data_plane_base, credential=DefaultAzureCredential())
        dp_agent_raw = dp_client.agents.get(agentName)
        dp_agent = dict(dp_agent_raw) if dp_agent_raw else None
        if dp_agent:
            definition = (dp_agent.get("versions") or {})
            latest = definition.get("latest", {})
            defn = latest.get("definition", {})
            rai_arm_id = defn.get("rai_config", {}).get("rai_policy_name", "")
            if rai_arm_id:
                rai_policy_name_from_agent = rai_arm_id.strip("/").split("/")[-1]
            tools = [t.get("type", str(t)) for t in defn.get("tools", [])]
            result["agent"] = {
                "name": agentName,
                "displayName": dp_agent.get("name"),
                "model": defn.get("model"),
                "instructions": defn.get("instructions"),
                "tools": tools,
                "guardrailPolicyName": rai_policy_name_from_agent,
            }
        logging.info(f"[inspect] Data plane agent guardrail: {rai_policy_name_from_agent}")
    except Exception as e:
        logging.warning(f"[inspect] AIProjectClient error: {e}")
        result["agent"] = {"name": agentName, "guardrailPolicyName": None}

    result["agentGuardrail"] = None
    deployment_name = None

    # ── Layer 2: Model deployment → raiPolicyName ─────────────────────────────
    result["model"] = {
        "deployment": deployment_name,
        "model_name": None,
        "rai_policy": None,
        "capacity": None,
    }
    rai_policy_name = None

    if deployment_name:
        dep_url = f"{account_base}/deployments/{deployment_name}?api-version={_ARM_VERSION}"
        logging.info(f"[inspect] Deployment: GET {dep_url}")
        dep_data = _safe_get(dep_url, token, "Deployment")
        if dep_data:
            dep_props = dep_data.get("properties", {})
            rai_policy_name = dep_props.get("raiPolicyName")
            result["model"]["rai_policy"] = rai_policy_name
            result["model"]["model_name"] = dep_props.get("model", {}).get("name")
            result["model"]["capacity"] = dep_props.get("currentCapacity")

    # ── Layer 3: RAI Policy — agent-level overrides model-level ─────────────────
    effective_rai = rai_policy_name_from_agent or rai_policy_name
    result["guardrails"] = {"available": False, "contentFilters": [], "raw": {}}

    if effective_rai:
        rai_url = (
            f"{account_base}/raiPolicies/{effective_rai}"
            f"?api-version={_RAI_VERSION}"
        )
        logging.info(f"[inspect] RAI Policy: GET {rai_url}")
        rai_data = _safe_get(rai_url, token, "RAI Policy")
        if rai_data:
            rai_props = rai_data.get("properties", {})
            result["guardrails"] = {
                "available": True,
                "contentFilters": rai_props.get("contentFilters", []),
                "raw": rai_props,
            }

    # ── Layer 4: APIM / AI Gateway policies ───────────────────────────────────
    result["gateway"] = None

    if apimName:
        apim_url = (
            f"https://management.azure.com/subscriptions/{sub_id}"
            f"/resourceGroups/{resourceGroup}"
            f"/providers/Microsoft.ApiManagement/service/{apimName}"
            f"/apis/{resolved_apim_api_id}/policies?api-version={_APIM_VERSION}"
        )
        logging.info(f"[inspect] APIM: GET {apim_url}")
        try:
            apim_resp = arm_get(apim_url, token)
            if apim_resp.ok:
                apim_json = apim_resp.json() if apim_resp.content else {}
                xml_value = (
                    apim_json.get("value", {})
                    .get("properties", {})
                    .get("value", "")
                )
                if xml_value:
                    normalized = _normalize_apim_xml(xml_value)
                    result["gateway"] = {
                        "raw": normalized,
                        "guardrails": _extract_gateway_guardrails(normalized),
                    }
            else:
                logging.warning(f"[inspect] APIM policies: {apim_resp.status_code}")
        except Exception as e:
            logging.error(f"[inspect] APIM error: {e}")

    return result


# ── Model deployment guardrail endpoint ──────────────────────────────────────

@router.get(
    "/models/{deploymentName}/guardrails",
    summary="Guardrail inspection for a model deployment: deployment → RAI policy",
)
def inspect_model_guardrails(
    deploymentName: str,
    request: Request,
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
    foundryName: str = Query(...),
):
    token = _token(request)
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]
    account_base = _account_base(sub_id, resourceGroup, foundryName)

    result = {
        "deployment": {"name": deploymentName, "raiPolicy": None, "modelName": None},
        "guardrails": {"available": False, "contentFilters": [], "raw": {}},
    }

    dep_url = f"{account_base}/deployments/{deploymentName}?api-version={_ARM_VERSION}"
    logging.info(f"[inspect] Model deployment: GET {dep_url}")
    dep_data = _safe_get(dep_url, token, "Deployment")
    if dep_data:
        dep_props = dep_data.get("properties", {})
        rai_policy_name = dep_props.get("raiPolicyName")
        result["deployment"]["raiPolicy"] = rai_policy_name
        result["deployment"]["modelName"] = dep_props.get("model", {}).get("name")

        if rai_policy_name:
            rai_url = (
                f"{account_base}/raiPolicies/{rai_policy_name}"
                f"?api-version={_RAI_VERSION}"
            )
            logging.info(f"[inspect] Model RAI Policy: GET {rai_url}")
            rai_data = _safe_get(rai_url, token, "RAI Policy")
            if rai_data:
                rai_props = rai_data.get("properties", {})
                result["guardrails"] = {
                    "available": True,
                    "contentFilters": rai_props.get("contentFilters", []),
                    "raw": rai_props,
                }

    return result
