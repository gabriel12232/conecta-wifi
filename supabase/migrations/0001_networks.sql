create table if not exists public.networks (
 id text primary key check (id ~ '^[a-f0-9]{48}$'),
 owner uuid not null references auth.users(id) on delete cascade,
 ssid text not null check (octet_length(ssid) between 1 and 32),
 place text not null default '',
 security text not null check (security in ('WPA','WEP','nopass')),
 hidden boolean not null default false,
 secret text not null,
 created timestamptz not null default now(),
 updated timestamptz not null default now()
);
create index if not exists networks_owner_created_idx on public.networks(owner, created desc);
alter table public.networks enable row level security;
revoke all on public.networks from anon, authenticated;
grant all on public.networks to service_role;
-- Credentials are handled exclusively by the server, which authorizes ownership
-- using a verified Supabase user. Anonymous clients cannot enumerate this table.
-- Public sharing reads exactly one random token through the server.
