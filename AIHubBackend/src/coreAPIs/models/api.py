
from __future__ import annotations


from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import requests
from azure.identity import DefaultAzureCredential

__all__ = ["router"]


router = APIRouter()


# Updated endpoint for listing models via Azure REST API

@router.get("/", summary="List all models (deployments)")
def list_models(
    subscriptionId: str = Query(..., description="Azure Subscription ID"),
    resourceGroupName: str = Query(..., description="Azure Resource Group Name"),
    accountName: str = Query(..., description="Cognitive Services Account Name (Foundry resource)"),
    api_version: str = Query("2025-06-01", alias="api-version", description="API version (default: 2025-06-01)")
):
    """
    Returns a list of model deployments for a specified Foundry resource using ARM.

    - **subscriptionId**: Azure Subscription ID
    - **resourceGroupName**: Azure Resource Group Name
    - **accountName**: Cognitive Services Account Name (Foundry resource)
    - **api-version**: API version (default: 2025-06-01)
    """
    if not subscriptionId or not resourceGroupName or not accountName:
        raise HTTPException(status_code=400, detail="Missing required parameters.")

    # Accept both /subscriptions/{guid} and just {guid}
    sub_id = subscriptionId
    if sub_id.startswith("/subscriptions/"):
        sub_id = sub_id[len("/subscriptions/"):]

    credential = DefaultAzureCredential()
    token = credential.get_token("https://management.azure.com/.default")

    url = (
        f"https://management.azure.com/subscriptions/{sub_id}/resourceGroups/{resourceGroupName}/"
        f"providers/Microsoft.CognitiveServices/accounts/{accountName}/deployments?api-version={api_version}"
    )
    headers = {"Authorization": f"Bearer {token.token}"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except Exception as e:
        status = response.status_code if 'response' in locals() and hasattr(response, 'status_code') else 500
        return JSONResponse(status_code=status, content={"error": str(e), "details": getattr(response, 'text', str(e))})




