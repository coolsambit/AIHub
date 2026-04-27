
from __future__ import annotations
from fastapi import APIRouter

__all__ = ["router"]
router = APIRouter()

# Example HTTP endpoint for listing connections
@router.get("/", summary="List all connections")
@router.get("", include_in_schema=False)
def list_connections_sample():
    return [{"id": 1, "name": "Example Connection"}]


from coreAPIs.aihub import AIHub


class ConnectionsAPI(AIHub):
    """Lists project-level connections for a Foundry project."""
    def list(self) -> list[dict]:
        return self._get(
            f"/api/projects/{self.parts.project_name}/connections",
            api_version="2025-06-01",
        )
