import React, { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './msalClient';

import { fetchSubscriptions } from '../../api/SubscriptionsApi';
import { fetchFoundries } from '../../api/FoundriesApi';
import { fetchProjects } from '../../api/ProjectsApi';
import { fetchModels } from '../../api/ModelsApi';

const SubscriptionDashboard = () => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [foundries, setFoundries] = useState([]);
  const [isFoundriesLoading, setIsFoundriesLoading] = useState(false);
  const [selectedFoundry, setSelectedFoundry] = useState(''); // stores foundry.name
  const [projects, setProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  // Models state
  const [models, setModels] = useState([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState(null);

  // Fetch projects when Foundry changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedFoundry || !selectedSubscription) {
        setProjects([]);
        setSelectedProject('');
        return;
      }
      try {
        setIsProjectsLoading(true);
        setError(null);
        if (isAuthenticated && accounts.length > 0) {
          const accessToken = await getAccessToken();
          const foundryName = selectedFoundry;
          const data = await fetchProjects(accessToken, foundryName, selectedSubscription);
          const projectList = data || [];
          setProjects(projectList);
          if (projectList.length > 0) {
            setSelectedProject(projectList[0].id || projectList[0].name || '');
          } else {
            setSelectedProject('');
          }
        }
      } catch (err) {
        setError(`Project Load Error: ${err.message}`);
        console.error('Error fetching projects:', err);
      } finally {
        setIsProjectsLoading(false);
      }
    };
    loadProjects();
  }, [selectedFoundry, selectedSubscription, isAuthenticated, accounts]);


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
						setSelectedFoundry(data[0].name);
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
	const selectedFoundryData = foundries.find(f => String(f.name) === String(selectedFoundry));

	const displayLocation =  selectedFoundryData?.location || ''
	const displayResourceGroup = selectedFoundryData?.resource_group || '';
	const displayResourceGroupRegion = selectedFoundryData?.resource_group_region || '';

	// Fetch models when Foundry, Subscription, and Foundry details are set, after projects are loaded
	useEffect(() => {
		// Only run after Foundry and Subscription are set, and Foundry details are available
		const loadModels = async () => {
			setModels([]);
			setModelsError(null);
			if (!selectedFoundry || !selectedSubscription) return;
			// Find foundry details for resourceGroup, location, etc.
			const foundryObj = foundries.find(f => String(f.name) === String(selectedFoundry));
			if (!foundryObj || !foundryObj.resource_group) return;
			try {
				setIsModelsLoading(true);
				if (isAuthenticated && accounts.length > 0) {
					const accessToken = await getAccessToken();
					const subscriptionId = selectedSubscription;
					const resourceGroupName = foundryObj.resource_group;
					const accountName = selectedFoundry;
					// Optionally use foundryObj.location or foundryObj.version if needed
					const apiVersion = foundryObj.version || "2025-06-01";
					const data = await fetchModels(accessToken, subscriptionId, resourceGroupName, accountName, apiVersion);
					setModels(data?.value || []);
				}
			} catch (err) {
				setModelsError(`Models Load Error: ${err.message}`);
				setModels([]);
				console.error('Error fetching models:', err);
			} finally {
				setIsModelsLoading(false);
			}
		};
		// Only trigger after projects are loaded (i.e., isProjectsLoading is false)
		if (!isProjectsLoading) {
			loadModels();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFoundry, selectedSubscription, foundries, isProjectsLoading, isAuthenticated, accounts]);

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
									<option key={f.name} value={f.name}>{f.name}</option>
								))}
							</select>
						   </div>

						   {/* Project Dropdown */}
						   <div className="space-y-2">
							   <label className="block text-sm font-semibold text-gray-700">Project</label>
							   <select
								   value={selectedProject}
								   onChange={e => setSelectedProject(e.target.value)}
								   disabled={isProjectsLoading || !selectedFoundry}
								   className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-50"
							   >
								   <option value="">{isProjectsLoading ? 'Loading projects...' : 'Select a Project...'}</option>
								   {projects.map(p => (
									   <option key={p.id || p.name} value={p.id || p.name}>{p.name || p.id}</option>
								   ))}
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



								{/* 2x2 grid: Model Information, Agents Available, Tools, Foundry Connections */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
									{/* Left column */}
									<div className="flex flex-col gap-8">
										{/* Model Information Panel */}
										<div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200">
											<h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
												<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
												Model Information
											</h3>
											{/* Pooled Model Section (all models for now) */}
											<div className="mb-8">
												<h4 className="text-lg font-semibold text-blue-700 mb-2">Pooled Model</h4>
												<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
													{isModelsLoading ? (
														<div className="col-span-full text-blue-400 italic">Loading models...</div>
													) : modelsError ? (
														<div className="col-span-full text-red-500 italic">{modelsError}</div>
													) : models.length === 0 ? (
														<div className="col-span-full text-gray-400 italic">No pooled models found.</div>
													) : (
														models.map((model, idx) => (
															<div key={model.id || model.name || idx} className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm flex flex-col items-start">
																<div className="font-semibold text-blue-800">{model.name || model.id}</div>
																<div className="text-xs text-gray-500">{model.properties?.modelFormat || model.modelFormat || ''}</div>
																<div className="text-xs text-gray-500">{model.properties?.provisioningState || model.provisioningState || ''}</div>
															</div>
														))
													)}
												</div>
											</div>
										</div>
										{/* Tools Panel */}
										<div className="bg-gradient-to-br from-white via-yellow-50 to-yellow-100 p-8 rounded-2xl shadow-lg border border-yellow-200">
											<h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
												<svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" /></svg>
												Tools
											</h3>
											<div className="mb-8">
												<div className="col-span-full h-16"></div>
											</div>
										</div>
									</div>
									{/* Right column */}
									<div className="flex flex-col gap-8">
										{/* Agents Available Panel */}
										<div className="bg-gradient-to-br from-white via-green-50 to-green-100 p-8 rounded-2xl shadow-lg border border-green-200">
											<h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
												<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
												Agents Available
											</h3>
											<div className="mb-8">
												<div className="col-span-full h-16"></div>
											</div>
										</div>
										{/* Foundry Connections Panel */}
										<div className="bg-gradient-to-br from-white via-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg border border-purple-200">
											<h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
												<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-5a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 4v4" /></svg>
												Foundry Connections
											</h3>
											<div className="mb-8">
												<div className="col-span-full h-16"></div>
											</div>
										</div>
									</div>
								</div>

				   {/* Foundry Details section removed as requested */}
			</div>
		);
};

export default SubscriptionDashboard;