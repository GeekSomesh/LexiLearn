import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = (import.meta.env.VITE_AUTH0_DOMAIN as string | undefined) || '';
const clientId = (import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined) || '';
const audience = (import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined) || undefined;

const rootEl = document.getElementById('root')!;

if (!domain || !clientId) {
  console.group('Auth0 configuration missing');
  console.warn('Auth0 not configured. Define VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env.');
  console.log('Current import.meta.env.VITE_AUTH0_DOMAIN =', domain);
  console.log('Current import.meta.env.VITE_AUTH0_CLIENT_ID =', clientId);
  console.groupEnd();
  createRoot(rootEl).render(
    <StrictMode>
      <div style={{fontFamily:'system-ui',padding:'2rem'}}>
        <h1>Configuration Error</h1>
        <p>Auth0 environment variables are missing.</p>
        <ul>
          <li>Add <code>VITE_AUTH0_DOMAIN</code> and <code>VITE_AUTH0_CLIENT_ID</code> to <code>.env</code>.</li>
          <li>Restart the dev server after adding them.</li>
        </ul>
      </div>
    </StrictMode>
  );
} else {
  console.log('[auth0] Using domain', domain, 'clientId', clientId);
  createRoot(rootEl).render(
    <StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{ redirect_uri: window.location.origin, ...(audience ? { audience } : {}) }}
      >
        <App />
      </Auth0Provider>
    </StrictMode>
  );
}
