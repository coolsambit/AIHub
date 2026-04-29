import { apiUrl } from './config';

export async function fetchFoundryKeys(accessToken, subscriptionId, resourceGroupName, accountName) {
  let cleanSubId = subscriptionId;
  if (typeof cleanSubId === 'string' && cleanSubId.startsWith('/subscriptions/')) {
    cleanSubId = cleanSubId.replace('/subscriptions/', '');
  }
  const url = apiUrl(`/api/keys/?subscriptionId=${encodeURIComponent(cleanSubId)}&resourceGroupName=${encodeURIComponent(resourceGroupName)}&accountName=${encodeURIComponent(accountName)}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  let data;
  try {
    data = await response.clone().json();
    console.log('[fetchFoundryKeys] status:', response.status, 'data:', data);
  } catch (e) {
    data = null;
  }
  if (!response.ok) throw new Error(data?.error || `Keys request failed (HTTP ${response.status})`);
  return data;
}
