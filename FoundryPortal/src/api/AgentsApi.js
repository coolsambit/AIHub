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

export async function fetchAgentGuardrails(accessToken, subscriptionId, resourceGroup, foundryName, projectName, agentName, apimName, apimApiId) {
  let qs = agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName);
  if (apimName) qs += `&apimName=${encodeURIComponent(apimName)}`;
  if (apimApiId) qs += `&apimApiId=${encodeURIComponent(apimApiId)}`;
  const url = apiUrl(`/api/inspect/agents/${encodeURIComponent(agentName)}/guardrails?${qs}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load guardrails: ${await response.text()}`);
  return response.json();
}

export async function fetchModelGuardrails(accessToken, subscriptionId, resourceGroup, foundryName, deploymentName) {
  const qs = `subscriptionId=${encodeURIComponent(subscriptionId)}&resourceGroup=${encodeURIComponent(resourceGroup)}&foundryName=${encodeURIComponent(foundryName)}`;
  const url = apiUrl(`/api/inspect/models/${encodeURIComponent(deploymentName)}/guardrails?${qs}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load model guardrails: ${await response.text()}`);
  return response.json();
}

export async function fetchConnections(accessToken, subscriptionId, resourceGroup, foundryName, projectName) {
  const url = apiUrl(`/api/connections/?${agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName)}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load connections: ${await response.text()}`);
  return response.json();
}

export async function fetchTools(accessToken, subscriptionId, resourceGroup, foundryName, projectName) {
  const url = apiUrl(`/api/agents/tools?${agentQueryParams(subscriptionId, resourceGroup, foundryName, projectName)}`);
  const response = await fetch(url, { headers: headers(accessToken) });
  if (!response.ok) throw new Error(`Failed to load tools: ${await response.text()}`);
  return response.json();
}
