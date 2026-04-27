export async function fetchAgents(accessToken, foundryEndpoint) {
  const url = `/api/agents/unpublished?foundryEndpoint=${encodeURIComponent(foundryEndpoint)}`;
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
