export async function fetchFoundryKeys(accessToken, subscriptionId, resourceGroupName, accountName) {
  let cleanSubId = subscriptionId;
  if (typeof cleanSubId === 'string' && cleanSubId.startsWith('/subscriptions/')) {
    cleanSubId = cleanSubId.replace('/subscriptions/', '');
  }
  const url = `/api/keys/?subscriptionId=${encodeURIComponent(cleanSubId)}&resourceGroupName=${encodeURIComponent(resourceGroupName)}&accountName=${encodeURIComponent(accountName)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  console.log('[fetchFoundryKeys] status:', response.status, 'data:', data);
  if (!response.ok) throw new Error(data?.error || 'Failed to fetch API keys');
  return data;
}
