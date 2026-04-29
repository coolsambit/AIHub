// MSAL configuration for Azure AD authentication
export const msalConfig = {
	auth: {
		clientId: "083a5e1b-48a1-4677-b712-15e1f02eddba", // TODO: Replace with your Azure AD App clientId
		authority: "https://login.microsoftonline.com/3c373eae-82b1-4e6e-9697-91ecfa5a5d5f", // Tenant-specific authority
		redirectUri: window.location.origin + "/", // Works for both localhost and production
	},
	cache: {
		cacheLocation: "sessionStorage",
		storeAuthStateInCookie: false,
	},
};

export const loginRequest = {
	scopes: [
		"https://management.azure.com/.default"
	] // Request Azure Management API access for subscription listing
};
