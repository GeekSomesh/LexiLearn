import { useAuth0 } from '@auth0/auth0-react';

export type ChatRow = { id: string; title: string; created_at: string; updated_at: string };
export type MessageRow = { id: string; chat_id: string; role: 'user'|'assistant'; content: string; created_at: string };

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '';

async function withAuth(token: string, path: string, init?: RequestInit) {
  const full = API_BASE ? `${API_BASE}${path}` : `/api${path}`;
  const res = await fetch(full, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchChats(token: string): Promise<ChatRow[]> {
  const json = await withAuth(token, '/chats', { method: 'GET' });
  return json.chats as ChatRow[];
}

export async function createChat(token: string, title: string): Promise<ChatRow> {
  const json = await withAuth(token, '/chats', { method: 'POST', body: JSON.stringify({ title }) });
  return json.chat as ChatRow;
}

export async function fetchMessages(token: string, chatId: string): Promise<MessageRow[]> {
  const json = await withAuth(token, `/chats/${chatId}/messages`, { method: 'GET' });
  return json.messages as MessageRow[];
}

export async function addMessage(token: string, chatId: string, role: 'user'|'assistant', content: string): Promise<MessageRow> {
  const json = await withAuth(token, `/chats/${chatId}/messages`, { method: 'POST', body: JSON.stringify({ role, content }) });
  return json.message as MessageRow;
}
