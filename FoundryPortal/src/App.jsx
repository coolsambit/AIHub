import React from 'react';
// import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Header from './Header';
import SubscriptionDashboard from './features/subscriptions-auth/SubscriptionDashboard';

function App() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Header />
			
			<main className="flex-grow container mx-auto px-4 py-8">
			   <SubscriptionDashboard />
			</main>

			<footer className="bg-white border-t border-gray-200 py-6">
				<div className="container mx-auto px-4 text-center text-sm text-gray-500">
					&copy; {new Date().getFullYear()} Foundry Portal. All rights reserved.
				</div>
			</footer>
		</div>
	);
}

export default App;