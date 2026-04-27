import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMsal, useIsAuthenticated, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { loginRequest } from './features/subscriptions-auth/msalClient';

const ROLE_STYLES = {
	'Cognitive Services OpenAI Contributor':         { label: 'OpenAI Contributor',    cls: 'bg-green-100 text-green-700 border-green-300'   },
	'Cognitive Services OpenAI User':                { label: 'OpenAI User',            cls: 'bg-blue-100 text-blue-700 border-blue-300'     },
	'Cognitive Services User':                       { label: 'CS User',                cls: 'bg-purple-100 text-purple-700 border-purple-300'},
	'Cognitive Services Contributor':                { label: 'CS Contributor',         cls: 'bg-teal-100 text-teal-700 border-teal-300'     },
	'Azure AI Developer':                            { label: 'AI Developer',           cls: 'bg-indigo-100 text-indigo-700 border-indigo-300'},
	'Azure AI Administrator':                        { label: 'AI Admin',               cls: 'bg-red-100 text-red-700 border-red-300'        },
	'Azure AI Inference Deployment Operator':        { label: 'AI Deployment Operator', cls: 'bg-orange-100 text-orange-700 border-orange-300'},
	'Owner':                                         { label: 'Owner',                  cls: 'bg-yellow-100 text-yellow-800 border-yellow-300'},
	'Contributor':                                   { label: 'Contributor',            cls: 'bg-sky-100 text-sky-700 border-sky-300'        },
	'Reader':                                        { label: 'Reader',                 cls: 'bg-gray-100 text-gray-600 border-gray-300'     },
};
const roleStyle = (role) => ROLE_STYLES[role] ?? { label: role, cls: 'bg-gray-100 text-gray-600 border-gray-300' };

const Header = ({ onSignInClick, userRoles = [] }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const { instance, accounts } = useMsal();
	const isAuthenticated = useIsAuthenticated();
	const activeAccount = accounts[0];
	const location = useLocation();
	const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

	 const handleLogin = () => {
		 if (onSignInClick) {
			 onSignInClick();
		 } else {
			 instance.loginRedirect(loginRequest).catch((e) => console.error(e));
		 }
	 };

	const handleLogout = () => {
		instance.logoutRedirect({ postLogoutRedirectUri: "/" });
	};

	// Navigation links
	const navLinks = [
		{ to: "/", label: "Home" },
		{ to: "/inventory", label: "Inventory" },
		{ to: "/models", label: "Model Hub" },
		{ to: "/agents", label: "Agent Hub" },
	];

	return (
		<header className="bg-white shadow-sm border-b border-gray-200">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
				<div className="flex items-center space-x-2">
					<div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
						<span className="text-white font-bold">F</span>
					</div>
					<span className="text-xl font-bold text-gray-800 tracking-tight">Foundry</span>
				</div>

				{/* Hamburger button for mobile */}
				<button
					className="md:hidden flex items-center px-2 py-1 border rounded text-gray-700 border-gray-300 hover:bg-gray-100 focus:outline-none"
					onClick={() => setMenuOpen((open) => !open)}
					aria-label="Toggle navigation menu"
				>
					<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>

				{/* Navigation Bar - desktop */}
				<nav className="hidden md:flex items-center space-x-6">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className={`font-medium transition-colors ${isActive(link.to) ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5' : 'text-gray-700 hover:text-blue-600'}`}
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* Auth controls - desktop */}
				<div className="hidden md:flex items-center space-x-4">
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
							<div className="flex flex-col items-end">
								<button
									onClick={handleLogin}
									className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium mb-1"
								>
									Sign In
								</button>
							</div>
						</div>
					</UnauthenticatedTemplate>
				</div>

				{/* Mobile menu dropdown */}
				{menuOpen && (
					<div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-md z-50 md:hidden animate-fade-in">
						<nav className="flex flex-col space-y-1 py-2 px-4">
							{navLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
									className={`py-2 px-2 rounded font-medium transition-colors ${isActive(link.to) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'}`}
									onClick={() => setMenuOpen(false)}
								>
									{link.label}
								</Link>
							))}
							<div className="border-t border-gray-100 my-2" />
							<AuthenticatedTemplate>
								{activeAccount && (
									<div className="flex flex-col space-y-2">
										<span className="text-sm text-gray-600 font-medium">{activeAccount.name}</span>
										<button
											onClick={() => { setMenuOpen(false); handleLogout(); }}
											className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
										>
											Sign Out
										</button>
									</div>
								)}
							</AuthenticatedTemplate>
							<UnauthenticatedTemplate>
								<button
									onClick={() => { setMenuOpen(false); handleLogin(); }}
									className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
								>
									Sign In
								</button>
							</UnauthenticatedTemplate>
						</nav>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;