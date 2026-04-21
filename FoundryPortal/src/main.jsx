import React from 'react';
import ReactDOM from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './features/subscriptions-auth/msalClient';
import App from './App';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

// Ensure MSAL is initialized before rendering the app
msalInstance.initialize().then(() => {
	ReactDOM.createRoot(document.getElementById('root')).render(
		<React.StrictMode>
			<MsalProvider instance={msalInstance}>
				<App />
			</MsalProvider>
		</React.StrictMode>
	);
}).catch(e => {
	console.error("MSAL Initialization failed:", e);
	document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif;"><h1>Auth Initialization Error</h1><p>${e.message}</p></div>`;
});