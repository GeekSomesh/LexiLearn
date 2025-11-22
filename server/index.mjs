import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const PORT = process.env.PORT || 8787;
const AUTH0_DOMAIN = process.env.AUTH0_MGMT_DOMAIN || process.env.VITE_AUTH0_DOMAIN || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!AUTH0_DOMAIN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing AUTH0_MGMT_DOMAIN/VITE_AUTH0_DOMAIN or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const client = jwksRsa.expressJwtSecret
  ? jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    })
  : null;

async function verifyAuth0Token(token) {
  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error('JWKS client unavailable'));
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) return reject(new Error('Invalid token'));
    client(decoded.header, (err, key) => {
      if (err) return reject(err);
      const signingKey = key.publicKey || key.rsaPublicKey;
      jwt.verify(
        token,
        signingKey,
        {
          audience: undefined, // allow default SPA audience
          issuer: `https://${AUTH0_DOMAIN}/`,
          algorithms: ['RS256'],
        },
        (error, verified) => {
          if (error) return reject(error);
          resolve(verified);
        }
      );
    });
  });
}

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const verified = await verifyAuth0Token(token);
    req.user = { sub: verified.sub, email: verified.email };
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/chats', requireAuth, async (req, res) => {
  const { sub } = req.user;
  const { data, error } = await supabase
    .from('ext_chats')
    .select('*')
    .eq('user_sub', sub)
    .order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ chats: data });
});

app.post('/api/chats', requireAuth, async (req, res) => {
  const { sub } = req.user;
  const title = (req.body?.title || 'New Chat').slice(0, 200);
  const { data, error } = await supabase
    .from('ext_chats')
    .insert({ user_sub: sub, title })
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ chat: data });
});

app.get('/api/chats/:id/messages', requireAuth, async (req, res) => {
  const chatId = req.params.id;
  const { data, error } = await supabase
    .from('ext_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data });
});

app.post('/api/chats/:id/messages', requireAuth, async (req, res) => {
  const chatId = req.params.id;
  const { role, content } = req.body || {};
  if (!role || !content) return res.status(400).json({ error: 'role and content required' });
  const { data, error } = await supabase
    .from('ext_messages')
    .insert({ chat_id: chatId, role, content })
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: data });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
