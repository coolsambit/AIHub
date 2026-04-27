import React, { useState } from 'react';
import WelcomeBanner from "./WelcomeBanner";
import ModelListItem from './features/subscriptions-auth/ModelListItem';
import ModelDetails from './features/subscriptions-auth/ModelDetails';

const SubscriptionDashboard = ({
	isAuthenticated,
	subscriptions, selectedSubscription, setSelectedSubscription, isLoading,
	foundries, selectedFoundry, setSelectedFoundry, isFoundriesLoading,
	projects, selectedProject, setSelectedProject, isProjectsLoading,
	models, isModelsLoading,
	apiKey1, apiKey2,
	error,
}) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedModel, setSelectedModel] = useState(null);

	const locationMap = {
		'Foundry North America': 'East US',
		'Foundry Europe': 'West Europe',
	};

	const selectedFoundryData = foundries.find(f => String(f.name) === String(selectedFoundry));
	const displayLocation = selectedFoundry ? locationMap[selectedFoundry] || selectedFoundryData?.location || 'N/A' : '';
	const displayProjectEndpoint = selectedFoundryData?.endpoint || '';
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
			<div className="w-full mt-4 mb-8">
				<WelcomeBanner title="" subtitle="">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">

						{/* Roles */}
						<div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col gap-2">
							<div className="flex items-center gap-2 mb-1">
								<svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.005-.07-1.99-.218-2.957z"/></svg>
								<p className="text-xs font-bold text-blue-900">Roles</p>
							</div>
							<div className="flex flex-col gap-1.5">
								<div>
									<p className="text-xs font-semibold text-gray-700">CS OpenAI Contributor</p>
									<p className="text-xs text-gray-500">Full access — fine-tune, deploy, and generate text.</p>
								</div>
								<div>
									<p className="text-xs font-semibold text-gray-700">CS OpenAI User</p>
									<p className="text-xs text-gray-500">View models and deployments. Perform inference; no changes allowed.</p>
								</div>
								<div>
									<p className="text-xs font-semibold text-gray-700">Cognitive Services User</p>
									<p className="text-xs text-gray-500">Read and list keys of Cognitive Services resources.</p>
								</div>
							</div>
							<a href="https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-ai-foundry" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium mt-auto pt-1">Learn more →</a>
						</div>

						{/* VNet Integration */}
						<div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col gap-2">
							<div className="flex items-center gap-2 mb-1">
								<svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="6" height="4" rx="1"/><rect x="16" y="7" width="6" height="4" rx="1"/><rect x="9" y="14" width="6" height="4" rx="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M5 11v2h14v-2M12 14v-1"/></svg>
								<p className="text-xs font-bold text-blue-900">VNet Integration</p>
							</div>
							<p className="text-xs text-gray-600">Azure AI Foundry supports Virtual Network integration to keep all traffic within your private network. Configure private endpoints and outbound rules to prevent public internet exposure.</p>
							<a href="https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/configure-private-link" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium mt-auto pt-1">Learn more →</a>
						</div>

						{/* Permissions */}
						<div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col gap-2">
							<div className="flex items-center gap-2 mb-1">
								<svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-5a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/></svg>
								<p className="text-xs font-bold text-blue-900">Permissions</p>
							</div>
							<p className="text-xs text-gray-600">Permissions are assigned at subscription, resource group, or resource scope and inherit downward. Use least-privilege — grant only the access required for the task at hand.</p>
							<a href="https://learn.microsoft.com/en-us/azure/role-based-access-control/overview" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium mt-auto pt-1">Learn more →</a>
						</div>

						{/* Azure Policy & Governance */}
						<div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm flex flex-col gap-2">
							<div className="flex items-center gap-2 mb-1">
								<svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.005-.07-1.99-.218-2.957z"/></svg>
								<p className="text-xs font-bold text-blue-900">Azure Policy & Governance</p>
							</div>
							<p className="text-xs text-gray-600">Azure Policy defines, assigns, and audits rules across resources to enforce organisational standards. Policies can restrict allowed SKUs, require tags, enforce network rules, and ensure compliance at scale.</p>
							<a href="https://learn.microsoft.com/en-us/azure/governance/policy/overview" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium mt-auto pt-1">Learn more →</a>
						</div>

					</div>
				</WelcomeBanner>
			</div>
			<div className="space-y-8">

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Configuration Panel */}
				<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
					{/* Row 1: Dropdowns */}
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
					</div>

					{/* Row 2: Location, Resource Group, Resource Group Region */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

					{/* Row 3: Foundry Endpoint, API Key 1, API Key 2 */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-700">Foundry Endpoint</label>
							<input
								type="text"
								value={displayProjectEndpoint}
								readOnly
								className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-700">API Key 1</label>
							<div className="flex items-center gap-2">
								<input
									type="password"
									value={apiKey1}
									readOnly
									placeholder={selectedFoundry ? '—' : ''}
									className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
								/>
								<button
									onClick={() => navigator.clipboard.writeText(apiKey1)}
									disabled={!apiKey1}
									title="Copy API Key 1"
									className="shrink-0 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-semibold text-gray-700">API Key 2</label>
							<div className="flex items-center gap-2">
								<input
									type="password"
									value={apiKey2}
									readOnly
									placeholder={selectedFoundry ? '—' : ''}
									className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700"
								/>
								<button
									onClick={() => navigator.clipboard.writeText(apiKey2)}
									disabled={!apiKey2}
									title="Copy API Key 2"
									className="shrink-0 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
								</button>
							</div>
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
