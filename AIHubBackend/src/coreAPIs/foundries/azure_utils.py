from azure.mgmt.resource import ResourceManagementClient
from azure.identity import DefaultAzureCredential

def get_resource_group_region(subscription_id: str, resource_group: str) -> str | None:
    """Fetch the region of a resource group using Azure ResourceManagementClient."""
    credential = DefaultAzureCredential()
    client = ResourceManagementClient(credential, subscription_id)
    try:
        rg = client.resource_groups.get(resource_group)
        return rg.location
    except Exception:
        return None
