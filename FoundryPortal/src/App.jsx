import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from './features/subscriptions-auth/msalClient';
import { fetchSubscriptions } from './api/SubscriptionsApi';
import { fetchFoundries } from './api/FoundriesApi';
import { fetchProjects } from './api/ProjectsApi';
import { fetchModels } from './api/ModelsApi';
import { fetchFoundryKeys } from './api/KeysApi';
import { fetchRoles } from './api/RolesApi';
import { fetchAgents } from './api/AgentsApi';
import Header from './Header';
import SubscriptionDashboard from './SubscriptionDashboard';
import ModelDetails from './features/subscriptions-auth/ModelDetails';
import LoginPage from './LoginPage';
import Home from './Home';

function ModelManagementPage() {
	return <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-xl shadow border border-gray-200"><h2 className="text-2xl font-bold mb-4">Model Management</h2><p>Model management features will appear here.</p></div>;
}
function AgentManagementPage() {
	return <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-xl shadow border border-gray-200"><h2 className="text-2xl font-bold mb-4">Agent Management</h2><p>Agent management features will appear here.</p></div>;
}

function App() {
	const [showLogin, setShowLogin] = useState(false);
	const { instance, accounts } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const navigate = useNavigate();
	const location = useLocation();

	// --- Inventory state (lives here so it survives tab navigation) ---
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
	const [agents, setAgents] = useState([]);
	const [isAgentsLoading, setIsAgentsLoading] = useState(false);
	const [inventoryError, setInventoryError] = useState(null);
	const [apiKey1, setApiKey1] = useState('');
	const [apiKey2, setApiKey2] = useState('');
	const [subscriptionRoles, setSubscriptionRoles] = useState([]);
	const [cognitiveRoles, setCognitiveRoles] = useState([]);
	const [azureAiRoles, setAzureAiRoles] = useState([]);

	const getAccessToken = () =>
		instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
			.then(result => result.accessToken)
			.catch(() => null);

	// Load Roles (subscription, cognitive, Azure AI) once the first subscription is known
	useEffect(() => {
		if (!subscriptions.length || !isAuthenticated || accounts.length === 0) return;
		instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
			.then(result => {
				const oid = accounts[0]?.idTokenClaims?.oid || accounts[0]?.localAccountId;
				console.log('[Roles] oid:', oid);
				return fetchRoles(result.accessToken, subscriptions[0].id, oid);
			})
			.then(({ subscription_roles = [], cognitive_roles = [], azure_ai_roles = [] }) => {
				console.log('[Roles] setting roles:', { subscription_roles, cognitive_roles, azure_ai_roles });
				setSubscriptionRoles(subscription_roles);
				setCognitiveRoles(cognitive_roles);
				setAzureAiRoles(azure_ai_roles);
			})
			.catch(err => console.error('[Roles]', err));
	}, [subscriptions]);

	// 1. Load Subscriptions when auth resolves
	useEffect(() => {
		if (!isAuthenticated || accounts.length === 0) return;
		setIsLoading(true);
		setInventoryError(null);
		instance.acquireTokenSilent({ ...loginRequest, account: accounts[0] })
			.then(result => fetchSubscriptions(result.accessToken))
			.then(data => setSubscriptions(data || []))
			.catch(err => setInventoryError(err.message))
			.finally(() => setIsLoading(false));
	}, [isAuthenticated, accounts.length]);

	// 2. Load Foundries when subscription changes
	useEffect(() => {
		if (selectedSubscription) {
			setIsFoundriesLoading(true);
			setInventoryError(null);
			getAccessToken().then(token => {
				if (!token) return;
				fetchFoundries(token, selectedSubscription, accounts[0]?.homeAccountId || '')
					.then(data => setFoundries(data || []))
					.catch(err => setInventoryError(err.message))
					.finally(() => setIsFoundriesLoading(false));
			});
		} else {
			setFoundries([]);
			setSelectedFoundry('');
		}
	}, [selectedSubscription, accounts]);

	// 3. On foundry change: load models first, then projects sequentially
	useEffect(() => {
		if (!selectedFoundry || !selectedSubscription) {
			setModels([]);
			setProjects([]);
			setSelectedProject('');
			return;
		}
		const foundryData = foundries.find(f => String(f.name) === String(selectedFoundry));
		if (!foundryData?.resource_group) return;

		setIsModelsLoading(true);
		setIsProjectsLoading(true);
		setModels([]);
		setProjects([]);
		setInventoryError(null);

		getAccessToken().then(token => {
			if (!token) {
				setIsModelsLoading(false);
				setIsProjectsLoading(false);
				return;
			}
			fetchModels(token, selectedSubscription, foundryData.resource_group, selectedFoundry)
				.then(data => setModels(data?.value || []))
				.catch(err => setInventoryError(err.message))
				.finally(() => setIsModelsLoading(false))
				.then(() =>
					fetchProjects(token, selectedFoundry, selectedSubscription, foundryData.resource_group)
						.then(data => setProjects(data || []))
						.catch(err => setInventoryError(err.message))
						.finally(() => setIsProjectsLoading(false))
				);
		});
	}, [selectedFoundry, selectedSubscription, foundries]);

	// 5. Load Agents when project changes
	useEffect(() => {
		const foundryData = foundries.find(f => String(f.name) === String(selectedFoundry));
		if (selectedProject && foundryData?.endpoint) {
			setIsAgentsLoading(true);
			setAgents([]);
			setInventoryError(null);
			getAccessToken().then(token => {
				if (!token) { setIsAgentsLoading(false); return; }
				fetchAgents(token, foundryData.endpoint)
					.then(data => setAgents(Array.isArray(data) ? data : []))
					.catch(err => setInventoryError(err.message))
					.finally(() => setIsAgentsLoading(false));
			});
		} else {
			setAgents([]);
		}
	}, [selectedProject, selectedFoundry, foundries]);

	// 6. Load API Keys when foundry changes
	useEffect(() => {
		const foundryData = foundries.find(f => String(f.name) === String(selectedFoundry));
		if (selectedFoundry && selectedSubscription && foundryData?.resource_group) {
			getAccessToken().then(token => {
				if (!token) return;
				fetchFoundryKeys(token, selectedSubscription, foundryData.resource_group, selectedFoundry)
					.then(data => {
						setApiKey1(data?.key1 || '');
						setApiKey2(data?.key2 || '');
					})
					.catch(() => {
						setApiKey1('');
						setApiKey2('');
					});
			});
		} else {
			setApiKey1('');
			setApiKey2('');
		}
	}, [selectedFoundry, selectedSubscription, foundries]);

	const handleSignInClick = () => setShowLogin(true);

	const handleProviderClick = (provider) => {
		setShowLogin(false);
		if (provider === 'google') {
			window.location.href = '/auth/google';
		} else if (provider === 'microsoft') {
			instance.loginPopup(loginRequest).catch((e) => console.error(e));
		}
	};

	const inventoryProps = {
		isAuthenticated,
		subscriptions, selectedSubscription, setSelectedSubscription, isLoading,
		foundries, selectedFoundry, setSelectedFoundry, isFoundriesLoading,
		projects, selectedProject, setSelectedProject, isProjectsLoading,
		models, isModelsLoading,
		agents, isAgentsLoading,
		apiKey1, apiKey2,
		error: inventoryError,
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col w-full max-w-full">
			<Header onSignInClick={handleSignInClick} userRoles={[...subscriptionRoles, ...cognitiveRoles, ...azureAiRoles]} />

			<main className="flex-grow w-full max-w-full px-2 md:px-4 py-4 md:py-8">
				<Routes>
					<Route path="/" element={<Home subscriptionRoles={subscriptionRoles} cognitiveRoles={cognitiveRoles} azureAiRoles={azureAiRoles} />} />
					<Route path="/inventory" element={<SubscriptionDashboard {...inventoryProps} />} />
					<Route path="/models" element={<ModelManagementPage />} />
					<Route path="/agents" element={<AgentManagementPage />} />
					<Route path="/model/:modelId" element={<ModelDetails />} />
				</Routes>
			</main>

			<footer className="bg-white border-t border-gray-200 py-4 md:py-6 w-full max-w-full">
				<div className="w-full max-w-full px-2 md:px-4 text-center text-sm text-gray-500">
					&copy; {new Date().getFullYear()} AIDataSense.com. All rights reserved.
				</div>
			</footer>

			{showLogin && (
				<div style={{
					position: 'fixed', top: 0, left: 0,
					width: '100vw', height: '100vh',
					background: 'rgba(0,0,0,0.2)',
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					zIndex: 1000,
				}}>
					<div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', padding: 32, minWidth: 240, maxWidth: '90vw' }}>
						<LoginPage onProviderClick={handleProviderClick} />
						<div style={{ textAlign: 'right', marginTop: 16 }}>
							<button onClick={() => setShowLogin(false)} style={{ color: '#888', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
