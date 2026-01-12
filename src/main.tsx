import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./app/App.tsx";
import "./styles/index.css";

// Updated configuration based on your latest message
const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-0rlg3lescok8mwu0.us.auth0.com";
// Corrected Client ID from your latest message
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez"; 
// const audience = import.meta.env.VITE_AUTH0_AUDIENCE || "https://api.ibex.app";

if (!clientId) {
  console.warn("Auth0 Client ID not found. Please set VITE_AUTH0_CLIENT_ID in your .env file.");
}

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    useRefreshTokens={true}
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: window.location.origin + "/callback",
      // audience: audience, // Commented out to fix "Service not found" error until API is created in Auth0
      scope: "openid profile email",
    }}
  >
    <App />
  </Auth0Provider>
);
