import { apiUrl } from './config';

const headers = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

export async function fetchConsumption(accessToken, subscriptionId) {
  const url = apiUrl(`/api/consumption/?subscriptionId=${encodeURIComponent(subscriptionId)}`);
  const res = await fetch(url, { headers: headers(accessToken) });
  if (!res.ok) throw new Error(`Failed to load consumption: ${await res.text()}`);
  return res.json();
}

export async function resetConsumption(accessToken, subscriptionId, apimSubscriptionId, model = '') {
  let qs = `subscriptionId=${encodeURIComponent(subscriptionId)}&apimSubscriptionId=${encodeURIComponent(apimSubscriptionId)}`;
  if (model) qs += `&model=${encodeURIComponent(model)}`;
  const url = apiUrl(`/api/consumption/reset?${qs}`);
  const res = await fetch(url, { method: 'DELETE', headers: headers(accessToken) });
  if (!res.ok) throw new Error(`Reset failed: ${await res.text()}`);
}
