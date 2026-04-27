export async function fetchRoles(token, subscriptionId, userId) {
    console.log('[Roles] token present:', !!token, '| userId:', userId);
    if (!token) {
        console.warn('[Roles] skipping — no token');
        return { subscription_roles: [], cs_openai_roles: [] };
    }
    const resp = await fetch(
        `/api/Roles/?subscription_id=${encodeURIComponent(subscriptionId)}&user_id=${encodeURIComponent(userId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await resp.json();
    console.log('[Roles] raw response:', data);
    return data;
}
