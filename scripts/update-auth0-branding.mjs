// Update Auth0 Universal Login branding to match site colors
// Requires Node 18+ (global fetch) and a Machine-to-Machine app with 'update:branding'
// Env vars required:
//  - AUTH0_MGMT_DOMAIN (e.g. dev-abc123.us.auth0.com)
//  - AUTH0_MGMT_CLIENT_ID
//  - AUTH0_MGMT_CLIENT_SECRET
// Optional:
//  - AUTH0_BRAND_PRIMARY (hex) default #8B5CF6
//  - AUTH0_BRAND_BACKGROUND (hex) default #FFFFF0
//  - AUTH0_BRAND_LOGO_URL

const domain = process.env.AUTH0_MGMT_DOMAIN;
const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;

if (!domain || !clientId || !clientSecret) {
  console.error("Missing AUTH0_MGMT_DOMAIN / AUTH0_MGMT_CLIENT_ID / AUTH0_MGMT_CLIENT_SECRET in env");
  process.exit(1);
}

const primary = (process.env.AUTH0_BRAND_PRIMARY || "#8B5CF6").trim();
const background = (process.env.AUTH0_BRAND_BACKGROUND || "#FFFFF0").trim();
const logoUrl = process.env.AUTH0_BRAND_LOGO_URL?.trim();

async function getMgmtToken() {
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to get token: ${res.status} ${txt}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function patchBranding(token) {
  const body = {
    colors: { primary, page_background: background },
  };
  if (logoUrl) body.logo_url = logoUrl;

  const res = await fetch(`https://${domain}/api/v2/branding`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Branding update failed: ${res.status} ${txt}`);
  }
  return res.json();
}

(async () => {
  try {
    console.log("Updating Auth0 branding...", { domain, primary, background, logoUrl });
    const token = await getMgmtToken();
    const out = await patchBranding(token);
    console.log("Branding updated:", out);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
