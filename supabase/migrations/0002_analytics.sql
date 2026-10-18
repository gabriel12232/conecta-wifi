-- Execute uma vez no SQL Editor do mesmo projeto Supabase.
create table if not exists public.network_events (
 network_id text not null references public.networks(id) on delete cascade,
 session_id uuid not null,
 event text not null check (event in ('view','copy','download','print')),
 day date not null default ((now() at time zone 'UTC')::date),
 primary key (network_id, session_id, event, day)
);
create index if not exists network_events_day_idx on public.network_events(day, network_id);
alter table public.network_events enable row level security;
revoke all on public.network_events from anon, authenticated;
grant all on public.network_events to service_role;

create or replace function public.network_analytics(p_owner uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
 select coalesce(jsonb_agg(to_jsonb(summary)), '[]'::jsonb) from (
   select e.network_id, e.day, e.event, count(*)::integer as count
   from public.network_events e
   join public.networks n on n.id = e.network_id
   where n.owner = p_owner
     and e.day >= ((now() at time zone 'UTC')::date - 29)
   group by e.network_id, e.day, e.event
 ) summary;
$$;
revoke all on function public.network_analytics(uuid) from public, anon, authenticated;
grant execute on function public.network_analytics(uuid) to service_role;
