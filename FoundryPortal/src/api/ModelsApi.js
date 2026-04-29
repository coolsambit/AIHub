import { apiUrl } from './config';

export async function fetchModels(accessToken, subscriptionId, resourceGroupName, accountName, apiVersion = "2025-06-01") {
  // Remove '/subscriptions/' prefix if present
  let cleanSubscriptionId = subscriptionId;
  if (typeof cleanSubscriptionId === 'string' && cleanSubscriptionId.startsWith('/subscriptions/')) {
    cleanSubscriptionId = cleanSubscriptionId.replace('/subscriptions/', '');
  }
  const url = apiUrl(`/api/models/?subscriptionId=${encodeURIComponent(cleanSubscriptionId)}&resourceGroupName=${encodeURIComponent(resourceGroupName)}&accountName=${encodeURIComponent(accountName)}&api-version=${encodeURIComponent(apiVersion)}`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'GET',
  });
  let data;
  try {
    data = await response.clone().json();
    console.log('[fetchModels] Response data:', data);
  } catch (e) {
    data = null;
  }
  if (!response.ok) throw new Error('Failed to load models');
  return data;
}
