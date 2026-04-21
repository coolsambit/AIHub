

from __future__ import annotations
from fastapi import APIRouter


__all__ = ["router"]
router = APIRouter()

# Example HTTP endpoint for listing agents
@router.get("/", summary="List all agents")
def list_agents_sample():
    return [{"id": 1, "name": "Example Agent"}]


from coreAPIs.aihub import AIHub


class AgentsAPI(AIHub):
    """Lists project-level agent resources for a Foundry project."""
    def list(self) -> list[dict]:
        return self._get(
            f"/api/projects/{self.parts.project_name}/agents",
            api_version="2025-10-01-preview",
        )
