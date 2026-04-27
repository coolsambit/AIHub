from __future__ import annotations

from typing import List

import requests
from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

__all__ = ["router"]
router = APIRouter()


class ProjectOut(BaseModel):
    name: str
    id: str
    status: str


def _token_from_request(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1]
    return DefaultAzureCredential().get_token("https://management.azure.com/.default").token


@router.get("/", response_model=List[ProjectOut], summary="List projects in a Foundry account")
@router.get("", response_model=List[ProjectOut], include_in_schema=False)
def list_projects(
    request: Request,
    foundryName: str = Query(...),
    subscriptionId: str = Query(...),
    resourceGroup: str = Query(...),
) -> List[ProjectOut]:
    sub_id = subscriptionId.removeprefix("/subscriptions/").strip("/").split("/")[0]

    headers = {"Authorization": f"Bearer {_token_from_request(request)}"}

    base = (
        f"https://management.azure.com/subscriptions/{sub_id}"
        f"/resourceGroups/{resourceGroup}/providers/Microsoft.CognitiveServices/accounts/{foundryName}"
        f"/projects?api-version=2025-06-01"
    )

    rows: list[ProjectOut] = []
    next_url: str | None = base
    while next_url:
        r = requests.get(next_url, headers=headers, timeout=30)
        if not r.ok:
            raise HTTPException(
                status_code=r.status_code,
                detail=f"ARM projects API {r.status_code}: {r.text[:400]}",
            )
        payload = r.json() if r.content else {}
        for item in payload.get("value", []):
            if not isinstance(item, dict):
                continue
            props = item.get("properties") or {}
            rows.append(ProjectOut(
                name=item.get("name", ""),
                id=item.get("id", ""),
                status=props.get("provisioningState") or props.get("status") or "unknown",
            ))
        next_url = payload.get("nextLink")

    return rows
