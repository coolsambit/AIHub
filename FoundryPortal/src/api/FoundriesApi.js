// Calls the backend API to get Foundries for a given subscription
export async function fetchFoundries(accessToken, subscriptionId, userId) {
	// Remove '/subscriptions/' prefix if present
	let cleanSubscriptionId = subscriptionId;
	if (typeof cleanSubscriptionId === 'string' && cleanSubscriptionId.startsWith('/subscriptions/')) {
		cleanSubscriptionId = cleanSubscriptionId.replace('/subscriptions/', '');
	}
	// ...existing code...
	const url = `/api/foundries/?userId=${encodeURIComponent(userId)}&subscriptionId=${encodeURIComponent(cleanSubscriptionId)}`;
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
		console.log('[fetchFoundries] Response data:', data);
	} catch (e) {
		data = null;
	}
	if (!response.ok) throw new Error("Failed to load foundries");
	return data;
}
