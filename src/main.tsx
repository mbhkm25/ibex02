import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app/App.tsx";
import "./styles/index.css";

// Validate environment variables
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!auth0Domain || !auth0ClientId || !auth0Audience) {
  const missing = [];
  if (!auth0Domain) missing.push('VITE_AUTH0_DOMAIN');
  if (!auth0ClientId) missing.push('VITE_AUTH0_CLIENT_ID');
  if (!auth0Audience) missing.push('VITE_AUTH0_AUDIENCE');
  
  console.error('❌ Missing Auth0 environment variables:', missing.join(', '));
  console.error('Please set these variables in Vercel or .env.local');
  
  // Show error message in production
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; text-align: center; padding: 20px;">
        <div>
          <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
          <p style="color: #6b7280; margin-bottom: 8px;">Missing Auth0 environment variables:</p>
          <p style="color: #374151; font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px;">
            ${missing.join(', ')}
          </p>
          <p style="color: #6b7280; margin-top: 16px; font-size: 14px;">
            Please configure these in Vercel Dashboard → Settings → Environment Variables
          </p>
        </div>
      </div>
    `;
  }
}

// Get redirect URI - handle both local and Vercel deployments
const getRedirectUri = () => {
  // In production, use the current origin
  if (import.meta.env.PROD) {
    return window.location.origin + "/callback";
  }
  // In development, use localhost
  return window.location.origin + "/callback";
};

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={auth0Domain || ""}
    clientId={auth0ClientId || ""}
    authorizationParams={{
      redirect_uri: getRedirectUri(),
      audience: auth0Audience || "",
      scope: "openid profile email offline_access",
    }}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);
