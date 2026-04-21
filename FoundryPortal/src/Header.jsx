import React from 'react';
import { useMsal, useIsAuthenticated, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './features/subscriptions-auth/msalClient';

const Header = () => {
	const { instance, accounts } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const activeAccount = accounts[0];

	const handleLogin = () => {
		instance.loginRedirect(loginRequest).catch((e) => console.error(e));
	};

	const handleLogout = () => {
		instance.logoutRedirect({ postLogoutRedirectUri: "/" });
	};

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
						<span className="text-white font-bold">F</span>
					</div>
					<span className="text-xl font-bold text-gray-800 tracking-tight">Foundry Portal</span>
				</div>

				<div className="flex items-center space-x-4">
					<AuthenticatedTemplate>
						{activeAccount && (
							<div className="flex items-center space-x-4">
								<span className="text-sm text-gray-600 font-medium">{activeAccount.name}</span>
								<button
									onClick={handleLogout}
									className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
								>
									Sign Out
								</button>
							</div>
						)}
					</AuthenticatedTemplate>

					   <UnauthenticatedTemplate>
						   <div className="flex items-center">
							   <button 
								   onClick={handleLogin}
								   className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
							   >
								   Sign In
							   </button>
						   </div>
					   </UnauthenticatedTemplate>
				</div>
			</div>
		</header>
	);
};

export default Header;