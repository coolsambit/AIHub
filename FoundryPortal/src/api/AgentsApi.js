import { apiUrl } from './config';

function agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName) {
  return `subscriptionId=${encodeURIComponent(subscriptionId)}&resourceGroup=${encodeURIComponent(resourceGroup)}&foundryName=${encodeURIComponent(foundryName)}&projectName=${encodeURIComponent(projectName)}`;
}

const headers = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

export async function fetchAgents(accessToken, subscriptionId, resourceGroup, foundryName, projectName) {
  const url = apiUrl(`/api/agents/?${agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName)}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load agents: ${await response.text()}`);
  return response.json();
}

export async function fetchAgentGuardrails(accessToken, subscriptionId, resourceGroup, foundryName, projectName, agentName) {
  const url = apiUrl(`/api/agents/${encodeURIComponent(agentName)}/guardrails?${agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName)}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load guardrails: ${await response.text()}`);
  return response.json();
}
