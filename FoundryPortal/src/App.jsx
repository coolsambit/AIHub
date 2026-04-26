// import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Header from './Header';
import SubscriptionDashboard from './features/subscriptions-auth/SubscriptionDashboard';
import ModelDetails from './features/subscriptions-auth/ModelDetails';
import LoginPage from './LoginPage';
import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './features/subscriptions-auth/msalClient';
import { Routes, Route } from 'react-router-dom';


function App() {
	const [showLogin, setShowLogin] = useState(false);
	const { instance } = useMsal();

	const handleSignInClick = () => setShowLogin(true);

	const handleProviderClick = (provider) => {
		setShowLogin(false);
		if (provider === 'google') {
			window.location.href = '/auth/google';
		} else if (provider === 'microsoft') {
			instance.loginRedirect(loginRequest)
				.catch((e) => console.error(e));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Header onSignInClick={handleSignInClick} />

			<main className="flex-grow container mx-auto px-4 py-8">
				<Routes>
					<Route path="/" element={<SubscriptionDashboard />} />
					<Route path="/model/:modelId" element={<ModelDetails />} />
				</Routes>
			</main>

			<footer className="bg-white border-t border-gray-200 py-6">
				<div className="container mx-auto px-4 text-center text-sm text-gray-500">
					&copy; {new Date().getFullYear()} Foundry Portal. All rights reserved.
				</div>
			</footer>

			{showLogin && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					background: 'rgba(0,0,0,0.2)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000
				}}>
					<div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', padding: 32, minWidth: 340 }}>
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