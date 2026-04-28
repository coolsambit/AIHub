export async function fetchAgents(accessToken, subscriptionId, resourceGroup, foundryName, projectName) {
  const url = `/api/agents/?subscriptionId=${encodeURIComponent(subscriptionId)}&resourceGroup=${encodeURIComponent(resourceGroup)}&foundryName=${encodeURIComponent(foundryName)}&projectName=${encodeURIComponent(projectName)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to load agents: ${err}`);
  }
  return response.json();
}
