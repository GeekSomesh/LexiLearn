-- External-auth friendly chat tables keyed by Auth0 subject (user_sub)
create table if not exists ext_chats (
  id uuid primary key default gen_random_uuid(),
  user_sub text not null,
  title text not null default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ext_chats_user_sub on ext_chats(user_sub);

create table if not exists ext_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references ext_chats(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_ext_messages_chat_id on ext_messages(chat_id);

-- RLS optional: we will access via service role from our backend, so no RLS here
alter table ext_chats disable row level security;
alter table ext_messages disable row level security;
