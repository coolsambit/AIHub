import React, { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './msalClient';
import { fetchSubscriptions } from '../../api/SubscriptionsApi';
import { fetchFoundries } from '../../api/FoundriesApi';

const SubscriptionDashboard = () => {
	const { instance, accounts, inProgress } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const [subscriptions, setSubscriptions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedSubscription, setSelectedSubscription] = useState('');
	const [foundries, setFoundries] = useState([]);
	const [isFoundriesLoading, setIsFoundriesLoading] = useState(false);
	const [selectedFoundry, setSelectedFoundry] = useState('');

	const locationMap = {
		'f1': 'North America - East US',
		'f2': 'Europe - West Europe',
		'f3': 'Asia Pacific - Singapore',
	};

	/**
	 * Helper to acquire token for API calls
	 */
	const getAccessToken = async () => {
		if (accounts.length === 0) {
			throw new Error('No active account found. Please sign in again.');
		}
		const tokenResponse = await instance.acquireTokenSilent({
			...loginRequest,
			account: accounts[0],
		});
		return tokenResponse.accessToken;
	};

	// Fetch Subscriptions on mount (no longer gated by authentication)
	useEffect(() => {
		const loadSubscriptions = async () => {
			try {
				setIsLoading(true);
				setError(null);
				let data = [];
				if (isAuthenticated && accounts.length > 0) {
					const accessToken = await getAccessToken();
					data = await fetchSubscriptions(accessToken);
				}
				setSubscriptions(
					(data || []).map(sub => ({
						id: sub.subscriptionId || sub.id,
						name: sub.displayName || sub.name,
						...sub
					}))
				);
			} catch (err) {
				setError(`Subscription Load Error: ${err.message}`);
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		if (inProgress === "none") {
			loadSubscriptions();
		}
	}, [instance, accounts, isAuthenticated, inProgress]);


	// Fetch Foundries when Subscription changes
	useEffect(() => {
		const loadFoundries = async () => {
			if (!selectedSubscription) {
				setFoundries([]);
				setSelectedFoundry('');
				return;
			}
			try {
				setIsFoundriesLoading(true);
				setError(null);
				if (isAuthenticated && accounts.length > 0) {
					const accessToken = await getAccessToken();
					// Use the user's email (username) as userId
					const userId = accounts[0]?.username || '';
					console.log('[SubscriptionDashboard] Calling fetchFoundries with:', {
						accessToken: accessToken ? '[REDACTED]' : undefined,
						selectedSubscription,
						userId
					});
					const data = await fetchFoundries(accessToken, selectedSubscription, userId);
					console.log('[SubscriptionDashboard] Foundries API returned:', data);
					setFoundries(data || []);
					if (data && data.length > 0) {
						setSelectedFoundry(data[0].id);
					} else {
						setSelectedFoundry('');
					}
				}
			} catch (err) {
				setError(`Foundry Load Error: ${err.message}`);
				console.error("Error fetching foundries:", err);
			} finally {
				setIsFoundriesLoading(false);
			}
		};
		if (isAuthenticated && selectedSubscription && inProgress === "none" && accounts.length > 0) {
			loadFoundries();
		}
	}, [selectedSubscription, instance, accounts, isAuthenticated, inProgress]);

	// Derive the location string for display
	const selectedFoundryData = foundries.find(f => String(f.id) === String(selectedFoundry));

	const displayLocation =  selectedFoundryData?.location || ''
	const displayResourceGroup = selectedFoundryData?.resource_group || '';
	const displayResourceGroupRegion = selectedFoundryData?.resource_group_region || '';

		return (
			<div className="space-y-8">
				{/* Always-visible Welcome and Portal Description */}
				<div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 text-blue-900 px-6 py-5 rounded-xl shadow-sm text-center">
					<h2 className="text-2xl font-bold mb-2">Welcome to Foundry Portal</h2>
					<p className="text-base mb-1">This portal lets you explore, manage, and monitor your Foundry resources and subscriptions in one place.</p>
					   {!isAuthenticated && (
						   <div className="mt-3 flex justify-center">
							   <span className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl text-base font-semibold shadow-sm">You must sign in</span>
						   </div>
					   )}
				</div>

				   {/* Controls Panel */}
				   <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
					   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						   {/* Subscription Dropdown */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Subscription</label>
							   <select 
								   value={selectedSubscription}
								   onChange={(e) => setSelectedSubscription(e.target.value)}
								   disabled={isLoading || !isAuthenticated}
								   className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${!isAuthenticated ? 'bg-gray-100 text-gray-700' : 'bg-white'} disabled:bg-gray-100`}
							   >
								   <option value="">Select a Subscription...</option>
								   {subscriptions.map(sub => (
									   <option key={sub.id} value={sub.id}>{sub.name}</option>
								   ))}
							   </select>
						   </div>

						   {/* Foundry Dropdown */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Foundry</label>
							   <select 
								   value={selectedFoundry}
								   onChange={(e) => setSelectedFoundry(e.target.value)}
								   disabled={!selectedSubscription || isFoundriesLoading}
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-50"
							   >
								   <option value="">{isFoundriesLoading ? 'Loading foundries...' : 'Select a Foundry...'}</option>
								   {foundries.map(f => (
									   <option key={f.id} value={f.id}>{f.name}</option>
								   ))}
							   </select>
						   </div>

						   {/* Project Dropdown */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Project</label>
							   <select 
								   value={''}
								   onChange={() => {}}
								   disabled={true}
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-50"
							   >
								   <option value="">Select a Project...</option>
								   {/* TODO: Populate with real project options */}
							   </select>
						   </div>

						   {/* Location (readonly) */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Location</label>
							   <input
								   type="text"
								   value={displayLocation}
								   readOnly
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							   />
						   </div>

						   {/* Resource Group (readonly) */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Resource Group</label>
							   <input
								   type="text"
								   value={displayResourceGroup}
								   readOnly
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							   />
						   </div>

						   {/* Resource Group Region (readonly) */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Resource Group Region</label>
							   <input
								   type="text"
								   value={displayResourceGroupRegion}
								   readOnly
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							   />
						   </div>
					   </div>
				   </div>

				{/* Foundry Details Panel - visually distinct, light theme */}
				{selectedFoundry && (
					<div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200 mt-2">
						<h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
							<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
							Foundry Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white/80 rounded-lg p-4 border border-blue-100">
								<label className="block text-xs font-semibold text-blue-600">Location</label>
								<div className="text-blue-900 font-medium">{displayLocation || 'N/A'}</div>
							</div>
							<div className="bg-white/80 rounded-lg p-4 border border-blue-100">
								<label className="block text-xs font-semibold text-blue-600">Resource Group</label>
								<div className="text-blue-900 font-medium">{displayResourceGroup || 'N/A'}</div>
							</div>
							<div className="bg-white/80 rounded-lg p-4 border border-blue-100">
								<label className="block text-xs font-semibold text-blue-600">Resource Group Location</label>
								<div className="text-blue-900 font-medium">{displayResourceGroupRegion || 'N/A'}</div>
							</div>
						</div>
					</div>
				)}

				{/* Details Section */}
				   <div className="flex justify-between items-center mt-8">
					   <h2 className="text-2xl font-bold text-gray-800">Foundry Details</h2>
				   </div>

				{/* Logic for showing specific selection details or error states */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{isLoading ? (
						<div className="col-span-full py-20 flex justify-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
						</div>
					) : error ? (
						<div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
							<p className="font-semibold">Error loading subscriptions</p>
							<p className="text-sm">{error}</p>
						</div>
					) : selectedSubscription ? (
						// Show details for the selected subscription
						subscriptions.filter(sub => sub.id === selectedSubscription).map((sub) => (
							<div key={sub.id} className="col-span-full bg-white p-6 rounded-xl shadow-sm border border-blue-200">
								<div className="flex items-center space-x-4 mb-4">
									<div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
									<h3 className="text-xl font-bold text-gray-900">{sub.name}</h3>
								</div>
								<p className="text-gray-600 mb-4">{sub.description || 'Cloud-native foundry environment.'}</p>
								<div className="flex space-x-6 text-sm">
									<div className="text-gray-500 font-mono">ID: {sub.id}</div>
									<div className="text-blue-600 font-semibold uppercase tracking-wider">Status: {sub.status}</div>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
							Please select a subscription from the dropdown above to view details.
						</div>
					)}
				</div>
			</div>
		);
};

export default SubscriptionDashboard;