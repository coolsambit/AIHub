
import { apiUrl } from './config';

export async function fetchSubscriptions(accessToken) {
	const res = await fetch(apiUrl("/api/subscriptions/"), {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		method: 'GET',
	});
	
	let data;
	try {
		data = await res.clone().json();
		console.log('[fetchSubscriptions] Response data:', data);
	} catch (e) {
	
		data = null;
	}
	if (!res.ok) throw new Error("Failed to load subscriptions");
	return (data || []).map(sub => ({
		id: sub.subscriptionId || sub.id,
		name: sub.displayName || sub.name || sub.subscriptionId || 'Unknown',
	}));
}
