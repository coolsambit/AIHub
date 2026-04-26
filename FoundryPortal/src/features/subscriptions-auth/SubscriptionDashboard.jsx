
import React, { useState, useEffect } from 'react';
import ModelListItem from './ModelListItem';
import ModelDetails from './ModelDetails';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './msalClient';
import { fetchSubscriptions } from '../../api/SubscriptionsApi';
import { fetchFoundries } from '../../api/FoundriesApi';
import { fetchProjects } from '../../api/ProjectsApi';
import { fetchModels } from '../../api/ModelsApi';


const SubscriptionDashboard = () => {
	const { instance, accounts, inProgress } = useMsal();
	const isAuthenticated = useIsAuthenticated();

	const [modalOpen, setModalOpen] = useState(false);
	const [selectedModel, setSelectedModel] = useState(null);

	const [subscriptions, setSubscriptions] = useState([]);
	const [selectedSubscription, setSelectedSubscription] = useState('');

	const [foundries, setFoundries] = useState([]);
	const [selectedFoundry, setSelectedFoundry] = useState('');

	const [projects, setProjects] = useState([]);
	const [selectedProject, setSelectedProject] = useState('');

	const [models, setModels] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [isFoundriesLoading, setIsFoundriesLoading] = useState(false);
	const [isProjectsLoading, setIsProjectsLoading] = useState(false);
	const [isModelsLoading, setIsModelsLoading] = useState(false);
	const [error, setError] = useState(null);


		// Helper to get access token
		const getAccessToken = async () => {
			if (inProgress !== "none" || accounts.length === 0) return null;
			const tokenResponse = await instance.acquireTokenSilent({
				...loginRequest,
				account: accounts[0],
			});
			return tokenResponse.accessToken;
		};


		// 1. Load Subscriptions on login
		useEffect(() => {
			if (isAuthenticated && inProgress === "none") {
				setIsLoading(true);
				getAccessToken().then(token => {
					if (!token) return;
					fetchSubscriptions(token)
						.then(data => setSubscriptions(data || []))
						.catch(err => setError(err.message))
						.finally(() => setIsLoading(false));
				});
			}
		}, [isAuthenticated, inProgress]);


		// 2. Load Foundries when subscription changes
		useEffect(() => {
			if (selectedSubscription) {
				setIsFoundriesLoading(true);
				getAccessToken().then(token => {
					if (!token) return;
					fetchFoundries(token, selectedSubscription, accounts[0]?.homeAccountId || "")
						.then(data => setFoundries(data || []))
						.catch(err => setError(err.message))
						.finally(() => setIsFoundriesLoading(false));
				});
			} else {
				setFoundries([]);
				setSelectedFoundry('');
			}
		}, [selectedSubscription, accounts]);


		// 3. Load Projects when foundry changes
		useEffect(() => {
			if (selectedFoundry && selectedSubscription) {
				setIsProjectsLoading(true);
				getAccessToken().then(token => {
					if (!token) return;
					fetchProjects(token, selectedFoundry, selectedSubscription)
						.then(data => setProjects(data || []))
						.catch(err => setError(err.message))
						.finally(() => setIsProjectsLoading(false));
				});
			} else {
				setProjects([]);
				setSelectedProject('');
			}
		}, [selectedFoundry, selectedSubscription]);

		// 4. Load Models when foundry changes
		useEffect(() => {
			if (selectedFoundry && selectedSubscription) {
				const foundryData = foundries.find(f => String(f.name) === String(selectedFoundry));
				if (!foundryData?.resource_group) return;
				setIsModelsLoading(true);
				setModels([]);
				getAccessToken().then(token => {
					if (!token) return;
					fetchModels(token, selectedSubscription, foundryData.resource_group, selectedFoundry)
						.then(data => setModels(data?.value || []))
						.catch(err => setError(err.message))
						.finally(() => setIsModelsLoading(false));
				});
			} else {
				setModels([]);
			}
		}, [selectedFoundry, selectedSubscription, foundries]);

	// Static location map for demonstration, normally part of foundry data
	const locationMap = {
		'Foundry North America': 'East US',
		'Foundry Europe': 'West Europe',
	};

	// Centralized derivation of data based on selection
	const selectedFoundryData = foundries.find(f => String(f.name) === String(selectedFoundry));

	const displayLocation = selectedFoundry
		? locationMap[selectedFoundry] || selectedFoundryData?.location || 'N/A'
		: '';

	const displayResourceGroup = selectedFoundryData?.resource_group || '';
	const displayResourceGroupRegion = selectedFoundryData?.resource_group_region || '';

	const handleModelClick = (model) => {
		setSelectedModel(model);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedModel(null);
	};

	return (
		<>
			<div className="space-y-8">
				{/* Welcome Banner */}
				<div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 text-blue-900 px-6 py-5 rounded-xl shadow-sm text-center">
					<h2 className="text-2xl font-bold mb-2">Welcome to Foundry Portal</h2>
					<p className="text-base mb-1">Explore and monitor your Foundry resources in one place.</p>
					{!isAuthenticated && (
						<div className="mt-3 flex justify-center">
							<span className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl text-base font-semibold shadow-sm">You must sign in</span>
						</div>
					)}
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Configuration Panel */}
				<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-700">Location</label>
							<input
								type="text"
								value={displayLocation}
								readOnly
								className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-700">Resource Group</label>
							<input
								type="text"
								value={displayResourceGroup}
								readOnly
								className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							/>
						</div>

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

				{/* Dashboard Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
					<div className="flex flex-col gap-8">
						{/* Model Information Panel */}
						<div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200">
							<h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
								<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z" /></svg>
								Model Information
							</h3>
							<div className="mb-8">
								<h4 className="text-lg font-semibold text-blue-700 mb-2">Pooled Model</h4>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{!selectedFoundry ? (
										<div className="col-span-full text-gray-400 italic">Select a foundry to view models.</div>
									) : isModelsLoading ? (
										<div className="col-span-full text-gray-400 italic">Loading models...</div>
									) : models.length === 0 ? (
										<div className="col-span-full text-gray-400 italic">No models found.</div>
									) : (
										models.map(model => (
											<ModelListItem key={model.id} model={model} onClick={() => handleModelClick(model)} />
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
			</div>

			{/* Modal for Model Details */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleCloseModal}>
					<div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 sm:mx-auto flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
						<div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 shrink-0">
							<h3 className="text-lg font-semibold text-gray-900">Model Details</h3>
							<button
								className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none leading-none"
								onClick={handleCloseModal}
								aria-label="Close"
							>
								&times;
							</button>
						</div>
						<div className="overflow-y-auto flex-1">
							<ModelDetails model={selectedModel} onBack={handleCloseModal} />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default SubscriptionDashboard;