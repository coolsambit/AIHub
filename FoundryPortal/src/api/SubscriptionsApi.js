
// Calls the backend API to get Azure subscriptions for the logged-in user
export async function fetchSubscriptions(accessToken) {

	const res = await fetch("/api/subscriptions/", {
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
	return data;
}
