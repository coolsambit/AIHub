// ProjectsApi.js
// Fetches projects for a given foundry and subscription

export async function fetchProjects(accessToken, foundryName, subscriptionId) {
  const url = `/api/projects?foundryName=${encodeURIComponent(foundryName)}&subscriptionId=${encodeURIComponent(subscriptionId)}`;
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
    console.log('[fetchProjects] Response data:', data);
  } catch (e) {
    data = null;
  }
  if (!response.ok) throw new Error('Failed to load projects');
  return data;
}
