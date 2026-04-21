from __future__ import annotations
from fastapi import APIRouter, Request
__all__ = ["router"]
router = APIRouter()

# Example HTTP endpoint for listing subscriptions by user_id
from fastapi import Query


from azure.identity import DefaultAzureCredential
from azure.mgmt.cognitiveservices import CognitiveServicesManagementClient

@router.get("/", summary="List all subscriptions for the current Azure credential or delegated user")
async def list_subscriptions(request: Request):
    # Debug: print incoming headers
    print("[list_subscriptions] Request headers:", dict(request.headers))
    # Check for Authorization header (delegated user access)
    auth_header = request.headers.get("authorization")
    print("[list_subscriptions] Authorization header:", auth_header)
    if auth_header and auth_header.lower().startswith("bearer "):
        user_token = auth_header.split(" ", 1)[1]
        print("[list_subscriptions] Using user_token:", user_token[:20], "... (truncated)")
        api = SubscriptionsAPI(endpoint="https://management.azure.com", credential=None, user_token=user_token)
        result = api.list()
        print("[list_subscriptions] API result:", result)
        return result
    # Fallback to DefaultAzureCredential (service principal)
    credential = DefaultAzureCredential()
    api = SubscriptionsAPI(endpoint="https://management.azure.com", credential=credential, user_token=None)
    result = api.list()
    print("[list_subscriptions] API result (default cred):", result)
    return result



import requests
from azure.core.credentials import TokenCredential

# Adapter to use a raw token string as a TokenCredential for Azure SDK clients
class SimpleTokenCredential(TokenCredential):
    def __init__(self, token):
        self._token = token
    def get_token(self, *scopes, **kwargs):
        from azure.core.credentials import AccessToken
        import time
        # Token expiry: 1 hour from now (arbitrary, since we only use it for one call)
        return AccessToken(self._token, int(time.time()) + 3600)

from coreAPIs.aihub import AIHub


class SubscriptionsAPI(AIHub):
    """Reads Azure subscriptions from ARM for the current principal or delegated user."""
    def __init__(self, endpoint, credential=None, user_token=None):
        self.endpoint = endpoint
        self.credential = credential
        self.user_token = user_token

    def list(self) -> list[dict]:
        print("[SubscriptionsAPI.list] Called")
        if self.user_token:
            token_value = self.user_token
            azure_credential = SimpleTokenCredential(token_value)
            print("[SubscriptionsAPI.list] Using user_token:", token_value[:20], "... (truncated)")
        elif self.credential:
            token_value = self.credential.get_token("https://management.azure.com/.default").token
            azure_credential = self.credential
            print("[SubscriptionsAPI.list] Using DefaultAzureCredential token:", token_value[:20], "... (truncated)")
        else:
            raise RuntimeError("No credential or user token provided.")

        # Get all subscriptions
        print("[SubscriptionsAPI.list] Requesting subscriptions from Azure ARM API...")
        response = requests.get(
            "https://management.azure.com/subscriptions?api-version=2020-01-01",
            headers={"Authorization": f"Bearer {token_value}"},
            timeout=30,
        )
        print("[SubscriptionsAPI.list] Azure ARM response status:", response.status_code)
        try:
            payload = response.json()
            print("[SubscriptionsAPI.list] Azure ARM response payload:", payload)
        except Exception as e:
            print("[SubscriptionsAPI.list] Failed to parse JSON:", e)
            payload = {}
        value = payload.get("value") if isinstance(payload, dict) else None
        if not isinstance(value, list):
            print("[SubscriptionsAPI.list] No subscriptions found in payload.")
            return []

        # Only return subscriptions that have at least one Cognitive Services resource
        result = []
        for sub in value:
            sub_id = sub.get("subscriptionId")
            has_cognitive = False
            try:
                client = CognitiveServicesManagementClient(azure_credential, sub_id)
                accounts = list(client.accounts.list())
                has_cognitive = len(accounts) > 0
                print(f"[SubscriptionsAPI.list] Subscription {sub_id} has {len(accounts)} Cognitive Services accounts.")
            except Exception as e:
                print(f"[SubscriptionsAPI.list] Error checking Cognitive Services for {sub_id}: {e}")
                has_cognitive = False
            if has_cognitive:
                sub["hasCognitiveServices"] = True
                result.append(sub)
        if not result:
            print("[SubscriptionsAPI.list] No subscriptions with Cognitive Services found.")
            return [{"name": "Not found"}]
        print("[SubscriptionsAPI.list] Returning:", result)
        return result
