create table if not exists public.admin_pin_security_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  failed_attempts smallint not null default 0 check (failed_attempts between 0 and 5),
  locked_until timestamptz,
  verified_session_id uuid,
  verified_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_pin_security_state enable row level security;

revoke all on table public.admin_pin_security_state from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_pin_security_state to service_role;

create or replace function public.admin_pin_security_transition(
  p_user_id uuid,
  p_session_id uuid,
  p_action text,
  p_verified_until timestamptz default null
)
returns table (
  failed_attempts smallint,
  locked_until timestamptz,
  is_verified boolean,
  verified_until timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_failed_attempts smallint;
  v_locked_until timestamptz;
  v_verified_session_id uuid;
  v_verified_until timestamptz;
begin
  if p_user_id is null or p_session_id is null then
    raise exception 'invalid security state key';
  end if;

  if p_action not in ('status', 'failure', 'success', 'revoke') then
    raise exception 'invalid security state action';
  end if;

  insert into public.admin_pin_security_state (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select
    state.failed_attempts,
    state.locked_until,
    state.verified_session_id,
    state.verified_until
  into
    v_failed_attempts,
    v_locked_until,
    v_verified_session_id,
    v_verified_until
  from public.admin_pin_security_state as state
  where state.user_id = p_user_id
  for update;

  if v_locked_until is not null and v_locked_until <= v_now then
    v_failed_attempts := 0;
    v_locked_until := null;
  end if;

  if p_action = 'failure' and v_locked_until is null then
    v_failed_attempts := least((v_failed_attempts + 1)::smallint, 5::smallint);
    if v_failed_attempts >= 5 then
      v_locked_until := v_now + interval '5 minutes';
    end if;
  elsif p_action = 'success' and v_locked_until is null then
    v_failed_attempts := 0;
    v_verified_session_id := p_session_id;
    v_verified_until := greatest(
      v_now + interval '1 minute',
      least(coalesce(p_verified_until, v_now + interval '15 minutes'), v_now + interval '15 minutes')
    );
  elsif p_action = 'revoke' then
    v_verified_session_id := null;
    v_verified_until := null;
  end if;

  if v_verified_until is not null and v_verified_until <= v_now then
    v_verified_session_id := null;
    v_verified_until := null;
  end if;

  update public.admin_pin_security_state as state
  set
    failed_attempts = v_failed_attempts,
    locked_until = v_locked_until,
    verified_session_id = v_verified_session_id,
    verified_until = v_verified_until,
    updated_at = v_now
  where state.user_id = p_user_id;

  return query
  select
    v_failed_attempts,
    v_locked_until,
    (
      v_verified_session_id = p_session_id
      and v_verified_until is not null
      and v_verified_until > v_now
    ),
    v_verified_until;
end;
$$;

revoke all on function public.admin_pin_security_transition(uuid, uuid, text, timestamptz) from public, anon, authenticated;
grant execute on function public.admin_pin_security_transition(uuid, uuid, text, timestamptz) to service_role;
