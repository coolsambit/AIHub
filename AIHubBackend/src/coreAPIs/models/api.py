
from __future__ import annotations
from fastapi import APIRouter
from coreAPIs.aihub import AIHub

__all__ = ["router"]

router = APIRouter()

# Example HTTP endpoint for listing models
@router.get("/", summary="List all models")
def list_models_sample():
    return [{"id": 1, "name": "Example Model"}]



class ModelsAPI(AIHub):
    """Lists model deployments available in the account."""
    def list(self) -> list[dict]:
        return self._get(
            f"/api/accounts/{self.parts.account_name}/models",
            api_version="2025-06-01",
        )
