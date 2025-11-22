## DysLearnAI — Complete Setup Guide

This project uses React (Vite) on the frontend, Auth0 for authentication, an Express API for secure persistence, and Supabase (Postgres) to store chats and messages per authenticated user.

### 1) Prerequisites
- Node.js 18+ and npm
- An Auth0 tenant (Admin access)
- A Supabase project (Admin access)

### 2) Auth0 Configuration
- Create a Single Page Application:
	- Allowed Callback URLs: `http://localhost:5173`
	- Allowed Logout URLs: `http://localhost:5173`
	- Allowed Web Origins: `http://localhost:5173`
- Create an API (for JWT access tokens):
	- Identifier (audience): e.g. `https://dyslearnai.api`
	- Signing Algorithm: RS256
- Save:
	- Domain: `your-tenant.us.auth0.com`
	- Client ID: from the SPA app
	- Audience: the API Identifier you created

### 3) Supabase Configuration
- Get project URL and keys:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never commit)

### 4) Create .env
Copy `.env.example` to `.env` and fill values:

```
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://dyslearnai.api

# Local API server base
VITE_API_BASE=http://localhost:8787/api

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Server-only (do not commit real values)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### 5) Apply Database Migration
Run the SQL in Supabase to create external chat tables:

- File: `supabase/migrations/20251122120000_add_ext_chat_tables.sql`
- Execute in Supabase SQL editor (or your preferred tool).

This creates tables:
- `ext_chats (id uuid pk, user_sub text, title text, created_at, updated_at)`
- `ext_messages (id uuid pk, chat_id uuid fk, role text, content text, created_at)`

Row Level Security is not required because the API uses the Supabase service role key.

### 6) Install and Run Locally (PowerShell)

``powershell
# From project root
npm install

# Start API server (uses .env values)
$env:PORT=8787; node server/index.mjs

# In a new terminal, start Vite dev server
npm run dev
``

Open `http://localhost:5173`. Use the Login button, complete Auth0 login, then create a new chat and send a message. Data should persist and appear under `ext_*` tables in Supabase.

Health check for API:

``powershell
Invoke-WebRequest http://localhost:8787/api/health | Select-Object -ExpandProperty Content
``

### 7) Auth0 Application Settings Recap
- Ensure these in the SPA application settings:
	- Allowed Callback URLs: `http://localhost:5173`
	- Allowed Logout URLs: `http://localhost:5173`
	- Allowed Web Origins: `http://localhost:5173`
- If you change ports for local dev, update these URLs accordingly.

### 8) Optional: Universal Login Branding
Create a Machine-to-Machine app in Auth0 (authorized for Management API with `update:branding`) and run:

``powershell
$env:AUTH0_MGMT_DOMAIN='your-tenant.us.auth0.com'
$env:AUTH0_MGMT_CLIENT_ID='YOUR_M2M_CLIENT_ID'
$env:AUTH0_MGMT_CLIENT_SECRET='YOUR_M2M_CLIENT_SECRET'
$env:AUTH0_BRAND_PRIMARY='#8B5CF6'; $env:AUTH0_BRAND_BACKGROUND='#FFFFF0'
npm run auth0:brand
```

### 9) Troubleshooting
- White page: check console. Ensure `.env` has `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`, restart Vite.
- 401 from API: ensure you set `VITE_AUTH0_AUDIENCE` and created an API in Auth0; restart app so tokens include that audience.
- API cannot connect to DB: verify `SUPABASE_SERVICE_ROLE_KEY` and `VITE_SUPABASE_URL` are set for the API process.

### 10) Production Notes (brief)
- Host frontend (Vite build) on your platform of choice.
- Host the Node API separately; set environment variables there.
- Update Auth0 Allowed URLs to your production domains.
