-- ==============================================================================
-- BCONOMY SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Execute this script in the Supabase Dashboard -> SQL Editor

-- 1. Create player_state table with sequential player_id starting from 1
create table if not exists public.player_state (
  id uuid references auth.users on delete cascade primary key,
  player_id bigint generated always as identity (start with 1) unique not null,
  username text unique not null,
  email text,
  cash numeric not null default 0,
  rank_index integer not null default 0,
  prestige_count integer not null default 0,
  state_revision bigint not null default 0 constraint player_state_state_revision_nonnegative check (state_revision >= 0),
  state jsonb not null default '{
    "schemaVersion": 2,
    "cash": 0,
    "rankIndex": 0,
    "prestigeCount": 0,
    "prestigePoints": 0,
    "inventory": {},
    "tools": { "mine": 1, "explore": 1, "hunt": 1, "fish": 1 },
    "perks": { "investiture": 0, "cronyism": 0, "backchannel": 0, "partiality": 0, "serendipity": 0, "numismatist": 0, "amnesiac": 0, "water_byproducts": 0, "jackpot_fever": 0 },
    "cooldowns": { "mine": 0, "explore": 0, "hunt": 0, "fish": 0, "work": 0 },
    "farm": {
      "waterAvailableAt": 0,
      "markedPlotIds": [],
      "storage": { "Blueberry": 0, "Golden Wheat": 0, "Melon": 0, "Coffee": 0, "Pumpkin": 0 },
      "plots": [{ "id": 1, "level": 0, "crop": null, "plantedAt": 0, "nextHarvestAt": 0 }]
    },
    "shop": {
      "lastRestockAt": 0,
      "nextRestockAt": 0,
      "sellPrices": {},
      "buyListings": {},
      "boosterListings": {}
    },
    "boosters": {
      "activeUntil": {
        "mine": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
        "explore": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
        "fish": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
        "hunt": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 }
      }
    },
    "lockedItems": [],
    "favoriteItems": [],
    "shopWishlist": {}
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.player_state
  add column if not exists state_revision bigint not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'player_state_state_revision_nonnegative'
      and conrelid = 'public.player_state'::regclass
  ) then
    alter table public.player_state
      add constraint player_state_state_revision_nonnegative check (state_revision >= 0);
  end if;
end $$;

-- 2. Create Indexes for performance
create index if not exists idx_player_state_player_id on public.player_state(player_id);
create index if not exists idx_player_state_username on public.player_state(lower(username));
create index if not exists idx_player_state_email on public.player_state(lower(email));

-- 3. Enable Row Level Security (RLS)
alter table public.player_state enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public profiles viewable by anyone" on public.player_state;
drop policy if exists "Users can read own profile" on public.player_state;
drop policy if exists "Users can update own state" on public.player_state;
drop policy if exists "Users can insert own profile" on public.player_state;

-- RLS Policies
create policy "Users can read own profile"
  on public.player_state
  for select
  using (auth.uid() = id);

-- Player-state writes are server-authoritative. The service role bypasses RLS;
-- authenticated browser clients retain read-only access to their own profile.

-- 4. Automated User Creation Trigger
-- When a user registers via Supabase Auth, automatically create their player_state row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_username text;
  final_username text;
  user_count int;
begin
  desired_username := nullif(trim(new.raw_user_meta_data->>'username'), '');
  
  if desired_username is null then
    if new.email is not null and position('@' in new.email) > 1 then
      desired_username := split_part(new.email, '@', 1);
    else
      desired_username := 'Player_' || substr(new.id::text, 1, 8);
    end if;
  end if;

  -- Ensure username is unique if collision occurs
  final_username := desired_username;
  select count(*) into user_count from public.player_state where lower(username) = lower(final_username);
  if user_count > 0 then
    final_username := desired_username || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.player_state (id, username, email)
  values (new.id, final_username, new.email);
  
  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Updated At Trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  if new.state is not null then
    if (new.state->>'cash') is not null then
      new.cash = coalesce((new.state->>'cash')::numeric, 0);
    end if;
    if (new.state->>'rankIndex') is not null then
      new.rank_index = coalesce((new.state->>'rankIndex')::integer, 0);
    end if;
    if (new.state->>'prestigeCount') is not null then
      new.prestige_count = coalesce((new.state->>'prestigeCount')::integer, 0);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_player_state_updated on public.player_state;
create trigger on_player_state_updated
  before update on public.player_state
  for each row execute procedure public.handle_updated_at();

-- 6. Idempotent, revision-checked command commits
create table if not exists public.player_command_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  command_id uuid not null,
  resulting_revision bigint not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, command_id)
);

create index if not exists idx_player_command_receipts_created_at
  on public.player_command_receipts(created_at);

alter table public.player_command_receipts enable row level security;

create or replace function public.commit_player_command(
  p_user_id uuid,
  p_expected_revision bigint,
  p_command_id uuid,
  p_state jsonb,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  current_revision bigint;
  existing_receipt public.player_command_receipts%rowtype;
begin
  select * into existing_receipt
  from public.player_command_receipts
  where user_id = p_user_id and command_id = p_command_id;

  if found then
    return jsonb_build_object(
      'status', 'duplicate',
      'revision', existing_receipt.resulting_revision,
      'result', existing_receipt.result
    );
  end if;

  select state_revision into current_revision
  from public.player_state
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('status', 'missing');
  end if;

  if current_revision <> p_expected_revision then
    return jsonb_build_object('status', 'conflict', 'revision', current_revision);
  end if;

  update public.player_state
  set state = p_state,
      state_revision = current_revision + 1,
      last_active_at = timezone('utc'::text, now())
  where id = p_user_id;

  insert into public.player_command_receipts(user_id, command_id, resulting_revision, result)
  values (p_user_id, p_command_id, current_revision + 1, coalesce(p_result, '{}'::jsonb));

  delete from public.player_command_receipts
  where user_id = p_user_id
    and created_at < timezone('utc'::text, now()) - interval '24 hours';

  return jsonb_build_object(
    'status', 'applied',
    'revision', current_revision + 1,
    'result', coalesce(p_result, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.commit_player_command(uuid, bigint, uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.commit_player_command(uuid, bigint, uuid, jsonb, jsonb) to service_role;

-- 7. Multiplayer faction identity and shared-data foundation
create extension if not exists pgcrypto with schema extensions;

alter table public.player_state
  add column if not exists account_kind text not null default 'registered',
  add column if not exists last_active_at timestamp with time zone not null default timezone('utc'::text, now()),
  add column if not exists guest_migrated_at timestamp with time zone;

-- Existing installations retain their previous column default unless it is changed
-- explicitly. New states are normalized by the game service before first use.
alter table public.player_state
  alter column state set default '{"schemaVersion": 2}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'player_state_account_kind_valid'
      and conrelid = 'public.player_state'::regclass
  ) then
    alter table public.player_state
      add constraint player_state_account_kind_valid
      check (account_kind in ('registered', 'guest'));
  end if;
end $$;

create table if not exists public.factions (
  id uuid primary key default gen_random_uuid(),
  faction_number bigint generated always as identity unique not null,
  name text not null constraint factions_name_length check (char_length(trim(name)) between 1 and 32),
  description text not null default '' constraint factions_description_length check (char_length(description) <= 160),
  membership_mode text not null default 'invite_only'
    constraint factions_membership_mode_valid check (membership_mode in ('invite_only', 'code_only', 'public')),
  leader_id uuid not null references public.player_state(id) on delete restrict,
  treasury_balance numeric(30, 0) not null default 0 constraint factions_treasury_nonnegative check (treasury_balance >= 0),
  lifetime_contribution numeric(30, 0) not null default 0 constraint factions_lifetime_nonnegative check (lifetime_contribution >= 0),
  revision bigint not null default 0 constraint factions_revision_nonnegative check (revision >= 0),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_factions_public_directory
  on public.factions(membership_mode, lower(name), faction_number);
create unique index if not exists idx_factions_one_leadership
  on public.factions(leader_id);

create table if not exists public.faction_members (
  faction_id uuid not null references public.factions(id) on delete cascade,
  player_id uuid not null references public.player_state(id) on delete cascade,
  faction_rank text not null default 'private'
    constraint faction_members_rank_valid check (faction_rank in ('private', 'corporal', 'sergeant', 'lieutenant', 'leader')),
  lifetime_contribution numeric(30, 0) not null default 0
    constraint faction_members_contribution_nonnegative check (lifetime_contribution >= 0),
  joined_at timestamp with time zone not null default timezone('utc'::text, now()),
  last_faction_activity_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (faction_id, player_id),
  unique (player_id)
);

create unique index if not exists idx_faction_members_one_leader
  on public.faction_members(faction_id)
  where faction_rank = 'leader';
create index if not exists idx_faction_members_roster
  on public.faction_members(faction_id, faction_rank, joined_at);

-- Validate the two structural invariants at transaction commit. Deferring this
-- check allows an ownership transfer to update both membership rows atomically.
create or replace function public.faction_enforce_membership_invariants()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  affected_faction_id uuid;
  recorded_leader_id uuid;
  leader_count integer;
  member_count integer;
  owner_is_leader boolean;
begin
  if tg_table_name = 'factions' then
    affected_faction_id := coalesce(new.id, old.id);
  else
    affected_faction_id := coalesce(new.faction_id, old.faction_id);
  end if;

  select leader_id into recorded_leader_id
  from public.factions
  where id = affected_faction_id;
  if not found then return null; end if;

  select count(*),
         count(*) filter (where faction_rank = 'leader'),
         coalesce(bool_or(player_id = recorded_leader_id) filter (where faction_rank = 'leader'), false)
  into member_count, leader_count, owner_is_leader
  from public.faction_members
  where faction_id = affected_faction_id;

  if member_count > 20 then
    raise exception using errcode = '23514', message = 'A faction cannot contain more than 20 members.';
  end if;
  if leader_count <> 1 or not owner_is_leader then
    raise exception using errcode = '23514', message = 'A faction must have exactly one Leader who matches its owner.';
  end if;
  return null;
end;
$$;

drop trigger if exists faction_membership_invariants_on_factions on public.factions;
create constraint trigger faction_membership_invariants_on_factions
  after insert or update on public.factions
  deferrable initially deferred
  for each row execute function public.faction_enforce_membership_invariants();

drop trigger if exists faction_membership_invariants_on_members on public.faction_members;
create constraint trigger faction_membership_invariants_on_members
  after insert or update or delete on public.faction_members
  deferrable initially deferred
  for each row execute function public.faction_enforce_membership_invariants();

revoke all on function public.faction_enforce_membership_invariants() from public, anon, authenticated;

create table if not exists public.faction_boosts (
  faction_id uuid not null references public.factions(id) on delete cascade,
  action_type text not null constraint faction_boosts_action_valid check (action_type in ('mine', 'explore', 'hunt', 'fish', 'work')),
  level integer not null default 0 constraint faction_boosts_level_valid check (level between 0 and 36),
  mode text not null default 'duration' constraint faction_boosts_mode_valid check (mode in ('duration', 'continuous')),
  cost_per_hour numeric(30, 0) not null default 0 constraint faction_boosts_cost_nonnegative check (cost_per_hour >= 0),
  active_until timestamp with time zone,
  last_processed_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (faction_id, action_type)
);

create table if not exists public.faction_join_requests (
  id uuid primary key default gen_random_uuid(),
  faction_id uuid not null references public.factions(id) on delete cascade,
  applicant_id uuid not null references public.player_state(id) on delete cascade,
  message text not null constraint faction_join_request_message_length check (char_length(message) between 1 and 200),
  status text not null default 'pending'
    constraint faction_join_request_status_valid check (status in ('pending', 'accepted', 'rejected', 'withdrawn', 'cancelled')),
  reviewer_id uuid references public.player_state(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  reviewed_at timestamp with time zone,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create unique index if not exists idx_faction_join_requests_one_pending
  on public.faction_join_requests(faction_id, applicant_id)
  where status = 'pending';
create index if not exists idx_faction_join_requests_applicant
  on public.faction_join_requests(applicant_id, status, created_at desc);
create index if not exists idx_faction_join_requests_review
  on public.faction_join_requests(faction_id, status, created_at);

create table if not exists public.faction_invitations (
  id uuid primary key default gen_random_uuid(),
  faction_id uuid not null references public.factions(id) on delete cascade,
  recipient_id uuid not null references public.player_state(id) on delete cascade,
  sender_id uuid references public.player_state(id) on delete set null,
  status text not null default 'pending'
    constraint faction_invitation_status_valid check (status in ('pending', 'accepted', 'declined', 'revoked', 'cancelled')),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  responded_at timestamp with time zone,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create unique index if not exists idx_faction_invitations_one_pending
  on public.faction_invitations(faction_id, recipient_id)
  where status = 'pending';
create index if not exists idx_faction_invitations_recipient
  on public.faction_invitations(recipient_id, status, created_at desc);

create table if not exists public.faction_access_codes (
  id uuid primary key default gen_random_uuid(),
  faction_id uuid not null references public.factions(id) on delete cascade,
  code_hash text not null unique,
  created_by uuid references public.player_state(id) on delete set null,
  consumed_by uuid references public.player_state(id) on delete set null,
  status text not null default 'active'
    constraint faction_access_code_status_valid check (status in ('active', 'consumed', 'reset')),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  consumed_at timestamp with time zone,
  reset_at timestamp with time zone
);

create unique index if not exists idx_faction_access_codes_one_active
  on public.faction_access_codes(faction_id)
  where status = 'active';

create table if not exists public.faction_treasury_ledger (
  id bigint generated always as identity primary key,
  faction_id uuid not null references public.factions(id) on delete cascade,
  actor_id uuid references public.player_state(id) on delete set null,
  entry_type text not null
    constraint faction_treasury_entry_type_valid check (entry_type in ('deposit', 'boost_purchase', 'boost_extension', 'continuous_drain', 'migration')),
  amount_delta numeric(30, 0) not null,
  balance_after numeric(30, 0) not null constraint faction_treasury_balance_after_nonnegative check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_faction_treasury_ledger_history
  on public.faction_treasury_ledger(faction_id, created_at desc, id desc);

create table if not exists public.faction_activity (
  id bigint generated always as identity primary key,
  faction_id uuid references public.factions(id) on delete set null,
  actor_id uuid references public.player_state(id) on delete set null,
  target_id uuid references public.player_state(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_faction_activity_history
  on public.faction_activity(faction_id, created_at desc, id desc);

create table if not exists public.faction_notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.player_state(id) on delete cascade,
  faction_id uuid references public.factions(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_faction_notifications_inbox
  on public.faction_notifications(recipient_id, read_at, created_at desc);

create table if not exists public.faction_message_bags (
  player_id uuid primary key references public.player_state(id) on delete cascade,
  remaining_message_ids integer[] not null default '{}'::integer[],
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.faction_rate_events (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.player_state(id) on delete cascade,
  action_type text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_faction_rate_events_window
  on public.faction_rate_events(player_id, action_type, created_at desc);

create table if not exists public.faction_command_receipts (
  user_id uuid not null references public.player_state(id) on delete cascade,
  command_id uuid not null,
  command_type text not null,
  result jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  primary key (user_id, command_id)
);

create index if not exists idx_faction_command_receipts_created_at
  on public.faction_command_receipts(created_at);

create table if not exists public.faction_migration_receipts (
  player_id uuid primary key references public.player_state(id) on delete cascade,
  imported_faction boolean not null default false,
  migrated_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.factions enable row level security;
alter table public.faction_members enable row level security;
alter table public.faction_boosts enable row level security;
alter table public.faction_join_requests enable row level security;
alter table public.faction_invitations enable row level security;
alter table public.faction_access_codes enable row level security;
alter table public.faction_treasury_ledger enable row level security;
alter table public.faction_activity enable row level security;
alter table public.faction_notifications enable row level security;
alter table public.faction_message_bags enable row level security;
alter table public.faction_rate_events enable row level security;
alter table public.faction_command_receipts enable row level security;
alter table public.faction_migration_receipts enable row level security;

-- Shared faction records are never read or written directly by browser clients.
-- The service role calls the validated functions defined below.

create or replace function public.faction_rank_weight(p_rank text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(p_rank, ''))
    when 'private' then 0
    when 'corporal' then 1
    when 'sergeant' then 2
    when 'lieutenant' then 3
    when 'leader' then 4
    else -1
  end;
$$;

create or replace function public.faction_cost_per_hour(p_level integer)
returns numeric
language sql
immutable
as $$
  select case
    when greatest(0, least(36, coalesce(p_level, 0))) = 0 then 0::numeric
    when greatest(0, least(36, coalesce(p_level, 0))) <= 16
      then floor(100000::numeric * power(greatest(0, least(36, coalesce(p_level, 0)))::numeric, 2))
    else floor(
      25600000::numeric * power(1.25::numeric, greatest(0, least(36, coalesce(p_level, 0))) - 16)
      + 10000000::numeric * power((greatest(0, least(36, coalesce(p_level, 0))) - 16)::numeric, 2)
    )
  end;
$$;

create or replace function public.faction_multiplier(p_level integer)
returns numeric
language sql
immutable
as $$
  select 1::numeric + greatest(0, least(36, coalesce(p_level, 0)))::numeric * 0.25::numeric;
$$;

create or replace function public.faction_take_rate_limit(
  p_player_id uuid,
  p_action_type text,
  p_limit integer,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns boolean
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  recent_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_player_id::text || ':' || p_action_type, 0));
  delete from public.faction_rate_events
  where player_id = p_player_id
    and action_type = p_action_type
    and created_at <= p_now - interval '10 minutes';

  select count(*) into recent_count
  from public.faction_rate_events
  where player_id = p_player_id
    and action_type = p_action_type
    and created_at > p_now - interval '10 minutes';

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.faction_rate_events(player_id, action_type, created_at)
  values (p_player_id, p_action_type, p_now);
  return true;
end;
$$;

create or replace function public.faction_process_boosts(
  p_faction_id uuid,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  boost_row public.faction_boosts%rowtype;
  current_balance numeric;
  elapsed_cost numeric;
  charged numeric;
  changed boolean := false;
begin
  select treasury_balance into current_balance
  from public.factions
  where id = p_faction_id
  for update;

  if not found then
    return;
  end if;

  for boost_row in
    select * from public.faction_boosts
    where faction_id = p_faction_id
    order by case action_type
      when 'mine' then 1 when 'explore' then 2 when 'hunt' then 3 when 'fish' then 4 else 5 end
    for update
  loop
    if boost_row.level = 0 then
      continue;
    end if;

    if boost_row.mode = 'duration' then
      if boost_row.active_until is not null and boost_row.active_until <= p_now then
        update public.faction_boosts
        set level = 0, cost_per_hour = 0, active_until = null, last_processed_at = p_now
        where faction_id = boost_row.faction_id and action_type = boost_row.action_type;
        changed := true;
      end if;
      continue;
    end if;

    elapsed_cost := floor(
      greatest(0, extract(epoch from (p_now - boost_row.last_processed_at)))
      * boost_row.cost_per_hour / 3600::numeric
    );

    if elapsed_cost <= 0 then
      continue;
    end if;

    charged := least(current_balance, elapsed_cost);
    current_balance := current_balance - charged;

    if charged > 0 then
      insert into public.faction_treasury_ledger(
        faction_id, entry_type, amount_delta, balance_after, metadata, created_at
      ) values (
        p_faction_id,
        'continuous_drain',
        -charged,
        current_balance,
        jsonb_build_object('actionType', boost_row.action_type, 'level', boost_row.level),
        p_now
      );
    end if;

    if current_balance <= 0 or charged < elapsed_cost then
      update public.faction_boosts
      set level = 0, cost_per_hour = 0, active_until = null, last_processed_at = p_now
      where faction_id = boost_row.faction_id and action_type = boost_row.action_type;
    else
      update public.faction_boosts
      set last_processed_at = p_now,
          active_until = null
      where faction_id = boost_row.faction_id and action_type = boost_row.action_type;
    end if;
    changed := true;
  end loop;

  if changed then
    update public.factions
    set treasury_balance = current_balance,
        revision = revision + 1,
        updated_at = p_now
    where id = p_faction_id;
  end if;
end;
$$;

revoke all on function public.faction_rank_weight(text) from public, anon, authenticated;
revoke all on function public.faction_cost_per_hour(integer) from public, anon, authenticated;
revoke all on function public.faction_multiplier(integer) from public, anon, authenticated;
revoke all on function public.faction_take_rate_limit(uuid, text, integer, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_process_boosts(uuid, timestamp with time zone) from public, anon, authenticated;
grant execute on function public.faction_rank_weight(text) to service_role;
grant execute on function public.faction_cost_per_hour(integer) to service_role;
grant execute on function public.faction_multiplier(integer) to service_role;
grant execute on function public.faction_take_rate_limit(uuid, text, integer, timestamp with time zone) to service_role;
grant execute on function public.faction_process_boosts(uuid, timestamp with time zone) to service_role;

create or replace function public.faction_get_snapshot(
  p_user_id uuid,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  membership_row public.faction_members%rowtype;
  faction_json jsonb := null;
  invitations_json jsonb := '[]'::jsonb;
  requests_json jsonb := '[]'::jsonb;
  notifications_json jsonb := '[]'::jsonb;
begin
  update public.player_state
  set last_active_at = p_now
  where id = p_user_id;

  if not found then
    return jsonb_build_object('status', 'missing_player');
  end if;

  select * into membership_row
  from public.faction_members
  where player_id = p_user_id;

  if found then
    perform public.faction_process_boosts(membership_row.faction_id, p_now);

    select jsonb_build_object(
      'id', f.id,
      'factionNumber', f.faction_number,
      'name', f.name,
      'description', f.description,
      'membershipMode', f.membership_mode,
      'leaderPlayerId', leader.player_id,
      'leaderUsername', leader.username,
      'treasuryBalance', f.treasury_balance,
      'lifetimeContribution', f.lifetime_contribution,
      'revision', f.revision,
      'createdAt', f.created_at,
      'viewerRank', membership_row.faction_rank,
      'memberCount', (select count(*) from public.faction_members count_member where count_member.faction_id = f.id),
      'members', coalesce((
        select jsonb_agg(jsonb_build_object(
          'playerId', member_profile.player_id,
          'username', member_profile.username,
          'factionRank', member.faction_rank,
          'lifetimeContribution', member.lifetime_contribution,
          'joinedAt', member.joined_at,
          'lastActiveAt', member_profile.last_active_at,
          'isGuest', member_profile.account_kind = 'guest'
        ) order by public.faction_rank_weight(member.faction_rank) desc, member.joined_at, member_profile.player_id)
        from public.faction_members member
        join public.player_state member_profile on member_profile.id = member.player_id
        where member.faction_id = f.id
      ), '[]'::jsonb),
      'boosts', coalesce((
        select jsonb_object_agg(boost.action_type, jsonb_build_object(
          'actionType', boost.action_type,
          'level', boost.level,
          'multiplier', public.faction_multiplier(boost.level),
          'mode', boost.mode,
          'costPerHour', boost.cost_per_hour,
          'activeUntil', boost.active_until,
          'remainingSeconds', case
            when boost.level = 0 then 0
            when boost.mode = 'duration' then greatest(0, floor(extract(epoch from (boost.active_until - p_now))))
            when boost.cost_per_hour > 0 then greatest(0, floor(f.treasury_balance / boost.cost_per_hour * 3600))
            else 0
          end
        ))
        from public.faction_boosts boost
        where boost.faction_id = f.id
      ), '{}'::jsonb),
      'accessCode', case when public.faction_rank_weight(membership_row.faction_rank) >= 3 then (
        select jsonb_build_object('active', true, 'createdAt', code.created_at, 'createdByPlayerId', creator.player_id)
        from public.faction_access_codes code
        left join public.player_state creator on creator.id = code.created_by
        where code.faction_id = f.id and code.status = 'active'
        limit 1
      ) else null end,
      'activity', coalesce((
        select jsonb_agg(activity_item.item order by activity_item.created_at desc, activity_item.id desc)
        from (
          select activity.id, activity.created_at, jsonb_build_object(
            'id', activity.id,
            'eventType', activity.event_type,
            'actorPlayerId', actor.player_id,
            'actorUsername', actor.username,
            'targetPlayerId', target.player_id,
            'targetUsername', target.username,
            'metadata', activity.metadata,
            'createdAt', activity.created_at
          ) as item
          from public.faction_activity activity
          left join public.player_state actor on actor.id = activity.actor_id
          left join public.player_state target on target.id = activity.target_id
          where activity.faction_id = f.id
          order by activity.created_at desc, activity.id desc
          limit 100
        ) activity_item
      ), '[]'::jsonb),
      'ledger', coalesce((
        select jsonb_agg(ledger_item.item order by ledger_item.created_at desc, ledger_item.id desc)
        from (
          select ledger.id, ledger.created_at, jsonb_build_object(
            'id', ledger.id,
            'entryType', ledger.entry_type,
            'actorPlayerId', actor.player_id,
            'actorUsername', actor.username,
            'amountDelta', ledger.amount_delta,
            'balanceAfter', ledger.balance_after,
            'metadata', ledger.metadata,
            'createdAt', ledger.created_at
          ) as item
          from public.faction_treasury_ledger ledger
          left join public.player_state actor on actor.id = ledger.actor_id
          where ledger.faction_id = f.id
          order by ledger.created_at desc, ledger.id desc
          limit 100
        ) ledger_item
      ), '[]'::jsonb)
    ) into faction_json
    from public.factions f
    join public.player_state leader on leader.id = f.leader_id
    where f.id = membership_row.faction_id;

    if public.faction_rank_weight(membership_row.faction_rank) >= 2 then
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', request.id,
        'applicantPlayerId', applicant.player_id,
        'applicantUsername', applicant.username,
        'message', request.message,
        'createdAt', request.created_at
      ) order by request.created_at), '[]'::jsonb)
      into requests_json
      from public.faction_join_requests request
      join public.player_state applicant on applicant.id = request.applicant_id
      where request.faction_id = membership_row.faction_id and request.status = 'pending';
    end if;

    if public.faction_rank_weight(membership_row.faction_rank) >= 1 then
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', invitation.id,
        'recipientPlayerId', recipient.player_id,
        'recipientUsername', recipient.username,
        'senderPlayerId', sender.player_id,
        'senderUsername', sender.username,
        'createdAt', invitation.created_at
      ) order by invitation.created_at desc), '[]'::jsonb)
      into invitations_json
      from public.faction_invitations invitation
      join public.player_state recipient on recipient.id = invitation.recipient_id
      left join public.player_state sender on sender.id = invitation.sender_id
      where invitation.faction_id = membership_row.faction_id and invitation.status = 'pending';
    end if;
  else
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', invitation.id,
      'factionNumber', faction.faction_number,
      'factionName', faction.name,
      'senderPlayerId', sender.player_id,
      'senderUsername', sender.username,
      'createdAt', invitation.created_at
    ) order by invitation.created_at desc), '[]'::jsonb)
    into invitations_json
    from public.faction_invitations invitation
    join public.factions faction on faction.id = invitation.faction_id
    left join public.player_state sender on sender.id = invitation.sender_id
    where invitation.recipient_id = p_user_id and invitation.status = 'pending';

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', request.id,
      'factionNumber', faction.faction_number,
      'factionName', faction.name,
      'message', request.message,
      'createdAt', request.created_at
    ) order by request.created_at desc), '[]'::jsonb)
    into requests_json
    from public.faction_join_requests request
    join public.factions faction on faction.id = request.faction_id
    where request.applicant_id = p_user_id and request.status = 'pending';
  end if;

  select coalesce(jsonb_agg(notification_item.item order by notification_item.created_at desc, notification_item.id desc), '[]'::jsonb)
  into notifications_json
  from (
    select notification.id, notification.created_at, jsonb_build_object(
      'id', notification.id,
      'eventType', notification.event_type,
      'payload', notification.payload,
      'readAt', notification.read_at,
      'createdAt', notification.created_at
    ) as item
    from public.faction_notifications notification
    where notification.recipient_id = p_user_id
    order by notification.created_at desc, notification.id desc
    limit 50
  ) notification_item;

  return jsonb_build_object(
    'status', 'ok',
    'membership', case when membership_row.player_id is null then null else jsonb_build_object(
      'factionId', membership_row.faction_id,
      'factionRank', membership_row.faction_rank,
      'joinedAt', membership_row.joined_at,
      'lifetimeContribution', membership_row.lifetime_contribution
    ) end,
    'faction', faction_json,
    'invitations', invitations_json,
    'joinRequests', requests_json,
    'notifications', notifications_json
  );
end;
$$;

create or replace function public.faction_list_public(
  p_user_id uuid,
  p_search text default '',
  p_limit integer default 24,
  p_offset integer default 0,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  clean_search text := left(lower(trim(coalesce(p_search, ''))), 64);
  safe_limit integer := greatest(1, least(50, coalesce(p_limit, 24)));
  safe_offset integer := greatest(0, coalesce(p_offset, 0));
  result_json jsonb;
begin
  update public.player_state set last_active_at = p_now where id = p_user_id;
  if not found then return jsonb_build_object('status', 'missing_player'); end if;

  select jsonb_build_object(
    'status', 'ok',
    'items', coalesce(jsonb_agg(directory_item.item order by directory_item.member_count desc, directory_item.faction_number), '[]'::jsonb),
    'offset', safe_offset,
    'limit', safe_limit
  ) into result_json
  from (
    select f.faction_number, count(member.player_id) as member_count, jsonb_build_object(
      'factionNumber', f.faction_number,
      'name', f.name,
      'description', f.description,
      'leaderPlayerId', leader.player_id,
      'leaderUsername', leader.username,
      'memberCount', count(member.player_id),
      'isFull', count(member.player_id) >= 20,
      'canRequest', count(member.player_id) < 20
        and not exists(select 1 from public.faction_members own_membership where own_membership.player_id = p_user_id)
        and not exists(
          select 1 from public.faction_join_requests own_request
          where own_request.faction_id = f.id and own_request.applicant_id = p_user_id and own_request.status = 'pending'
        ),
      'activeBoosts', coalesce((
        select jsonb_agg(jsonb_build_object(
          'actionType', boost.action_type,
          'level', boost.level,
          'multiplier', public.faction_multiplier(boost.level)
        ) order by boost.action_type)
        from public.faction_boosts boost
        where boost.faction_id = f.id
          and boost.level > 0
          and (boost.mode = 'continuous' or boost.active_until > p_now)
      ), '[]'::jsonb)
    ) as item
    from public.factions f
    join public.player_state leader on leader.id = f.leader_id
    left join public.faction_members member on member.faction_id = f.id
    where f.membership_mode = 'public'
      and (clean_search = '' or lower(f.name) like '%' || clean_search || '%'
        or lower(f.description) like '%' || clean_search || '%'
        or lower(leader.username) like '%' || clean_search || '%'
        or f.faction_number::text = clean_search)
    group by f.id, leader.player_id, leader.username
    order by count(member.player_id) desc, f.faction_number
    limit safe_limit offset safe_offset
  ) directory_item;
  return coalesce(result_json, jsonb_build_object('status', 'ok', 'items', '[]'::jsonb, 'offset', safe_offset, 'limit', safe_limit));
end;
$$;

create or replace function public.faction_next_join_message(
  p_user_id uuid,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  bag integer[];
  message_id integer;
begin
  if not public.faction_take_rate_limit(p_user_id, 'message_generate', 30, p_now) then
    return jsonb_build_object('status', 'error', 'code', 'RATE_LIMITED', 'message', 'Please wait before generating another join-request message.');
  end if;

  insert into public.faction_message_bags(player_id, remaining_message_ids, updated_at)
  values (p_user_id, '{}'::integer[], p_now)
  on conflict (player_id) do nothing;

  select remaining_message_ids into bag
  from public.faction_message_bags
  where player_id = p_user_id
  for update;

  if coalesce(array_length(bag, 1), 0) = 0 then
    select array_agg(message_index order by random()) into bag
    from generate_series(0, 47) message_index;
  end if;

  message_id := bag[1];
  bag := coalesce(bag[2:array_length(bag, 1)], '{}'::integer[]);
  update public.faction_message_bags
  set remaining_message_ids = bag, updated_at = p_now
  where player_id = p_user_id;

  return jsonb_build_object('status', 'ok', 'messageId', message_id, 'remainingCount', coalesce(array_length(bag, 1), 0));
end;
$$;

create or replace function public.faction_get_effect(
  p_user_id uuid,
  p_action_type text,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  faction_id_value uuid;
  faction_name_value text;
  boost_row public.faction_boosts%rowtype;
begin
  if p_action_type not in ('mine', 'explore', 'hunt', 'fish', 'work') then
    return jsonb_build_object('status', 'error', 'code', 'INVALID_ACTION', 'message', 'Choose a valid faction boost action.');
  end if;

  update public.player_state set last_active_at = p_now where id = p_user_id;
  select member.faction_id, faction.name into faction_id_value, faction_name_value
  from public.faction_members member
  join public.factions faction on faction.id = member.faction_id
  where member.player_id = p_user_id;

  if faction_id_value is null then
    return jsonb_build_object('status', 'ok', 'name', 'Faction', 'level', 0, 'multiplier', 1);
  end if;

  perform public.faction_process_boosts(faction_id_value, p_now);
  select * into boost_row
  from public.faction_boosts
  where faction_id = faction_id_value and action_type = p_action_type;

  return jsonb_build_object(
    'status', 'ok',
    'name', faction_name_value,
    'level', coalesce(boost_row.level, 0),
    'multiplier', public.faction_multiplier(coalesce(boost_row.level, 0))
  );
end;
$$;

revoke all on function public.faction_get_snapshot(uuid, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_list_public(uuid, text, integer, integer, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_next_join_message(uuid, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_get_effect(uuid, text, timestamp with time zone) from public, anon, authenticated;
grant execute on function public.faction_get_snapshot(uuid, timestamp with time zone) to service_role;
grant execute on function public.faction_list_public(uuid, text, integer, integer, timestamp with time zone) to service_role;
grant execute on function public.faction_next_join_message(uuid, timestamp with time zone) to service_role;
grant execute on function public.faction_get_effect(uuid, text, timestamp with time zone) to service_role;

drop function if exists public.faction_execute_command(uuid, uuid, bigint, text, jsonb, timestamp with time zone);
create or replace function public.faction_execute_command(
  p_user_id uuid,
  p_command_id uuid,
  p_expected_player_revision bigint,
  p_command_type text,
  p_payload jsonb default '{}'::jsonb,
  p_expected_faction_revision bigint default null,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  existing_receipt public.faction_command_receipts%rowtype;
  actor_member public.faction_members%rowtype;
  target_member public.faction_members%rowtype;
  faction_row public.factions%rowtype;
  invitation_row public.faction_invitations%rowtype;
  request_row public.faction_join_requests%rowtype;
  code_row public.faction_access_codes%rowtype;
  boost_row public.faction_boosts%rowtype;
  actor_profile public.player_state%rowtype;
  target_user_id uuid;
  target_player_number bigint;
  target_username text;
  target_faction_id uuid;
  target_faction_number bigint;
  command_result jsonb := '{}'::jsonb;
  receipt_result jsonb := '{}'::jsonb;
  clean_name text;
  clean_description text;
  clean_message text;
  clean_code text;
  next_mode text;
  next_rank text;
  amount_value numeric;
  hours_value numeric;
  cost_value numeric;
  balance_value numeric;
  level_value integer;
  player_cash numeric;
  member_count integer;
  pending_count integer;
  actor_weight integer;
  target_weight integer;
  next_weight integer;
  plaintext_code text;
  activity_type text;
  action_value text;
  player_state_json jsonb;
  player_revision_value bigint;
begin
  if p_command_id is null or p_command_type is null or trim(p_command_type) = '' then
    return jsonb_build_object('status', 'error', 'code', 'INVALID_COMMAND', 'message', 'A command ID and command type are required.');
  end if;

  select * into existing_receipt
  from public.faction_command_receipts
  where user_id = p_user_id and command_id = p_command_id;

  if found then
    select state, state_revision into player_state_json, player_revision_value
    from public.player_state where id = p_user_id;
    return jsonb_build_object(
      'status', 'duplicate',
      'result', existing_receipt.result,
      'playerState', player_state_json,
      'playerRevision', player_revision_value,
      'snapshot', public.faction_get_snapshot(p_user_id, p_now)
    );
  end if;

  select * into actor_profile
  from public.player_state
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('status', 'error', 'code', 'PLAYER_NOT_FOUND', 'message', 'Player profile not found.');
  end if;

  -- Recheck after taking the per-player lock. Two simultaneous retries can both
  -- miss the optimistic lookup above, but only the first may execute.
  select * into existing_receipt
  from public.faction_command_receipts
  where user_id = p_user_id and command_id = p_command_id;
  if found then
    return jsonb_build_object(
      'status', 'duplicate',
      'result', existing_receipt.result,
      'playerState', actor_profile.state,
      'playerRevision', actor_profile.state_revision,
      'snapshot', public.faction_get_snapshot(p_user_id, p_now)
    );
  end if;

  update public.player_state set last_active_at = p_now where id = p_user_id;
  select * into actor_member from public.faction_members where player_id = p_user_id;

  if actor_member.player_id is not null then
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if p_expected_faction_revision is null or faction_row.revision <> p_expected_faction_revision then
      return jsonb_build_object(
        'status', 'conflict',
        'code', 'FACTION_CONFLICT',
        'message', 'Faction data changed in another session. Review the latest faction state and try again.'
      );
    end if;
  end if;

  if p_command_type = 'faction.create' then
    if actor_member.player_id is not null then
      return jsonb_build_object('status', 'error', 'code', 'ALREADY_IN_FACTION', 'message', 'Leave your current faction before creating another one.');
    end if;
    if actor_profile.state_revision <> p_expected_player_revision then
      return jsonb_build_object('status', 'conflict', 'code', 'STATE_CONFLICT', 'message', 'Your progress changed. Refresh it and try again.');
    end if;

    clean_name := left(trim(coalesce(p_payload->>'name', '')), 32);
    clean_description := left(trim(coalesce(p_payload->>'description', '')), 160);
    next_mode := lower(coalesce(p_payload->>'membershipMode', 'invite_only'));
    if clean_name = '' then
      return jsonb_build_object('status', 'error', 'code', 'FACTION_NAME_REQUIRED', 'message', 'Enter a faction name.');
    end if;
    if next_mode not in ('invite_only', 'code_only', 'public') then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_MEMBERSHIP_MODE', 'message', 'Choose invite-only, code-only, or public membership.');
    end if;
    player_cash := greatest(0, coalesce((actor_profile.state->>'cash')::numeric, actor_profile.cash, 0));
    if player_cash < 1000000 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_CASH', 'message', 'Creating a faction costs $1,000,000 cash.');
    end if;

    insert into public.factions(name, description, membership_mode, leader_id, created_at, updated_at)
    values (clean_name, clean_description, next_mode, p_user_id, p_now, p_now)
    returning * into faction_row;

    insert into public.faction_members(faction_id, player_id, faction_rank, joined_at, last_faction_activity_at)
    values (faction_row.id, p_user_id, 'leader', p_now, p_now);
    insert into public.faction_boosts(faction_id, action_type, last_processed_at)
    select faction_row.id, action_type, p_now
    from unnest(array['mine', 'explore', 'hunt', 'fish', 'work']) action_type;

    player_cash := player_cash - 1000000;
    update public.player_state
    set state = jsonb_set(coalesce(state, '{}'::jsonb) - 'faction', '{cash}', to_jsonb(player_cash), true),
        state_revision = state_revision + 1,
        last_active_at = p_now
    where id = p_user_id
    returning state, state_revision into player_state_json, player_revision_value;

    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'faction_created', jsonb_build_object('name', clean_name, 'membershipMode', next_mode), p_now);
    command_result := jsonb_build_object('factionNumber', faction_row.faction_number, 'name', clean_name, 'membershipMode', next_mode);

  elsif p_command_type = 'faction.deposit' then
    if actor_member.player_id is null then
      return jsonb_build_object('status', 'error', 'code', 'NOT_IN_FACTION', 'message', 'Join a faction before making a treasury deposit.');
    end if;
    if actor_profile.state_revision <> p_expected_player_revision then
      return jsonb_build_object('status', 'conflict', 'code', 'STATE_CONFLICT', 'message', 'Your progress changed. Refresh it and try again.');
    end if;
    begin amount_value := (p_payload->>'amount')::numeric; exception when others then amount_value := 0; end;
    if amount_value <> floor(amount_value) or amount_value <= 0 or amount_value > 9007199254740991 then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_DEPOSIT', 'message', 'Enter a positive whole-number deposit.');
    end if;
    player_cash := greatest(0, coalesce((actor_profile.state->>'cash')::numeric, actor_profile.cash, 0));
    if player_cash < amount_value then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_CASH', 'message', 'You do not have enough personal cash for that deposit.');
    end if;

    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    perform public.faction_process_boosts(faction_row.id, p_now);
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    balance_value := faction_row.treasury_balance + amount_value;

    update public.factions
    set treasury_balance = balance_value,
        lifetime_contribution = lifetime_contribution + amount_value,
        revision = revision + 1,
        updated_at = p_now
    where id = faction_row.id;
    update public.faction_members
    set lifetime_contribution = lifetime_contribution + amount_value,
        last_faction_activity_at = p_now
    where faction_id = faction_row.id and player_id = p_user_id;

    player_cash := player_cash - amount_value;
    update public.player_state
    set state = jsonb_set(coalesce(state, '{}'::jsonb) - 'faction', '{cash}', to_jsonb(player_cash), true),
        state_revision = state_revision + 1,
        last_active_at = p_now
    where id = p_user_id
    returning state, state_revision into player_state_json, player_revision_value;

    insert into public.faction_treasury_ledger(faction_id, actor_id, entry_type, amount_delta, balance_after, created_at)
    values (faction_row.id, p_user_id, 'deposit', amount_value, balance_value, p_now);
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'treasury_deposit', jsonb_build_object('amount', amount_value, 'balanceAfter', balance_value), p_now);
    command_result := jsonb_build_object('deposited', amount_value, 'treasuryBalance', balance_value, 'remainingCash', player_cash);

  elsif p_command_type = 'faction.invitation.send' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 1 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot send invitations.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if faction_row.membership_mode <> 'invite_only' then
      return jsonb_build_object('status', 'error', 'code', 'WRONG_MEMBERSHIP_MODE', 'message', 'Invitations are available only in invite-only mode.');
    end if;
    if not public.faction_take_rate_limit(p_user_id, 'invitation_send', 30, p_now) then
      return jsonb_build_object('status', 'error', 'code', 'RATE_LIMITED', 'message', 'You have sent too many invitations recently. Please wait before trying again.');
    end if;
    begin target_player_number := (p_payload->>'playerId')::bigint; exception when others then target_player_number := null; end;
    select id, username into target_user_id, target_username from public.player_state where player_id = target_player_number;
    if target_user_id is null then
      return jsonb_build_object('status', 'error', 'code', 'PLAYER_NOT_FOUND', 'message', 'No player matches that Player ID.');
    end if;
    if target_user_id = p_user_id or exists(select 1 from public.faction_members where player_id = target_user_id) then
      return jsonb_build_object('status', 'error', 'code', 'PLAYER_UNAVAILABLE', 'message', 'That player already belongs to a faction.');
    end if;
    if exists(select 1 from public.faction_invitations where faction_id = faction_row.id and recipient_id = target_user_id and status = 'pending') then
      return jsonb_build_object('status', 'error', 'code', 'INVITATION_ALREADY_PENDING', 'message', 'That player already has a pending invitation from this faction.');
    end if;
    insert into public.faction_invitations(faction_id, recipient_id, sender_id, created_at, updated_at)
    values (faction_row.id, target_user_id, p_user_id, p_now, p_now)
    returning * into invitation_row;
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    values (target_user_id, faction_row.id, 'invitation_received', jsonb_build_object('factionName', faction_row.name, 'factionNumber', faction_row.faction_number, 'senderUsername', actor_profile.username), p_now);
    insert into public.faction_activity(faction_id, actor_id, target_id, event_type, created_at)
    values (faction_row.id, p_user_id, target_user_id, 'invitation_sent', p_now);
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    command_result := jsonb_build_object('invitationId', invitation_row.id, 'recipientPlayerId', target_player_number, 'recipientUsername', target_username);

  elsif p_command_type = 'faction.invitation.respond' then
    begin
      select * into invitation_row from public.faction_invitations where id = (p_payload->>'invitationId')::uuid for update;
    exception when others then
      return jsonb_build_object('status', 'error', 'code', 'INVITATION_NOT_FOUND', 'message', 'That invitation is no longer available.');
    end;
    if invitation_row.id is null or invitation_row.recipient_id <> p_user_id or invitation_row.status <> 'pending' then
      return jsonb_build_object('status', 'error', 'code', 'INVITATION_NOT_PENDING', 'message', 'That invitation is no longer pending.');
    end if;
    if actor_member.player_id is not null then
      return jsonb_build_object('status', 'error', 'code', 'ALREADY_IN_FACTION', 'message', 'Leave your current faction before accepting another invitation.');
    end if;
    if lower(coalesce(p_payload->>'decision', '')) = 'decline' then
      update public.faction_invitations set status = 'declined', responded_at = p_now, updated_at = p_now where id = invitation_row.id;
      insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
      select invitation_row.sender_id, faction.id, 'invitation_declined', jsonb_build_object('factionName', faction.name, 'recipientUsername', actor_profile.username), p_now
      from public.factions faction where faction.id = invitation_row.faction_id and invitation_row.sender_id is not null;
      command_result := jsonb_build_object('decision', 'declined');
    elsif lower(coalesce(p_payload->>'decision', '')) = 'accept' then
      select * into faction_row from public.factions where id = invitation_row.faction_id for update;
      select count(*) into member_count from public.faction_members where faction_id = faction_row.id;
      if member_count >= 20 then
        return jsonb_build_object('status', 'error', 'code', 'FACTION_FULL', 'message', 'This faction has reached its 20-member limit. The invitation remains pending.');
      end if;
      insert into public.faction_members(faction_id, player_id, faction_rank, joined_at, last_faction_activity_at)
      values (faction_row.id, p_user_id, 'private', p_now, p_now);
      update public.faction_invitations set status = 'accepted', responded_at = p_now, updated_at = p_now where id = invitation_row.id;
      update public.faction_invitations set status = 'cancelled', responded_at = p_now, updated_at = p_now where recipient_id = p_user_id and status = 'pending';
      update public.faction_join_requests set status = 'cancelled', reviewed_at = p_now, updated_at = p_now where applicant_id = p_user_id and status = 'pending';
      update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
      insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
      values (faction_row.id, p_user_id, 'member_joined', jsonb_build_object('method', 'invitation'), p_now);
      insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
      select invitation_row.sender_id, faction_row.id, 'invitation_accepted', jsonb_build_object('factionName', faction_row.name, 'recipientUsername', actor_profile.username), p_now
      where invitation_row.sender_id is not null;
      command_result := jsonb_build_object('decision', 'accepted', 'factionNumber', faction_row.faction_number, 'factionName', faction_row.name);
    else
      return jsonb_build_object('status', 'error', 'code', 'INVALID_DECISION', 'message', 'Choose Accept or Decline.');
    end if;

  elsif p_command_type = 'faction.invitation.revoke' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 1 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot revoke invitations.');
    end if;
    begin
      select * into invitation_row from public.faction_invitations where id = (p_payload->>'invitationId')::uuid for update;
    exception when others then invitation_row := null; end;
    if invitation_row.id is null or invitation_row.faction_id <> actor_member.faction_id or invitation_row.status <> 'pending' then
      return jsonb_build_object('status', 'error', 'code', 'INVITATION_NOT_PENDING', 'message', 'That invitation is no longer pending.');
    end if;
    if invitation_row.sender_id <> p_user_id then
      select * into target_member from public.faction_members where faction_id = actor_member.faction_id and player_id = invitation_row.sender_id;
      if target_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) <= public.faction_rank_weight(target_member.faction_rank) then
        return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'You may revoke only your own invitations or invitations sent by a lower-ranked member.');
      end if;
    end if;
    update public.faction_invitations set status = 'revoked', responded_at = p_now, updated_at = p_now where id = invitation_row.id;
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    select invitation_row.recipient_id, faction.id, 'invitation_revoked', jsonb_build_object('factionName', faction.name), p_now
    from public.factions faction where faction.id = invitation_row.faction_id;
    update public.factions set revision = revision + 1, updated_at = p_now where id = actor_member.faction_id;
    command_result := jsonb_build_object('invitationId', invitation_row.id, 'status', 'revoked');

  elsif p_command_type = 'faction.request.send' then
    if actor_member.player_id is not null then
      return jsonb_build_object('status', 'error', 'code', 'ALREADY_IN_FACTION', 'message', 'Leave your current faction before requesting another one.');
    end if;
    if not public.faction_take_rate_limit(p_user_id, 'join_request_send', 10, p_now) then
      return jsonb_build_object('status', 'error', 'code', 'RATE_LIMITED', 'message', 'You have sent too many join requests recently. Please wait before trying again.');
    end if;
    begin target_faction_number := (p_payload->>'factionNumber')::bigint; exception when others then target_faction_number := null; end;
    select * into faction_row from public.factions where faction_number = target_faction_number for update;
    if faction_row.id is null or faction_row.membership_mode <> 'public' then
      return jsonb_build_object('status', 'error', 'code', 'FACTION_NOT_PUBLIC', 'message', 'That faction is not accepting public join requests.');
    end if;
    select count(*) into member_count from public.faction_members where faction_id = faction_row.id;
    if member_count >= 20 then
      return jsonb_build_object('status', 'error', 'code', 'FACTION_FULL', 'message', 'This faction has reached its 20-member limit.');
    end if;
    select count(*) into pending_count from public.faction_join_requests where applicant_id = p_user_id and status = 'pending';
    if pending_count >= 5 then
      return jsonb_build_object('status', 'error', 'code', 'REQUEST_LIMIT_REACHED', 'message', 'You may have no more than five pending public join requests.');
    end if;
    if exists(select 1 from public.faction_join_requests where faction_id = faction_row.id and applicant_id = p_user_id and status = 'pending') then
      return jsonb_build_object('status', 'error', 'code', 'REQUEST_ALREADY_PENDING', 'message', 'You already have a pending request for this faction.');
    end if;
    clean_message := trim(regexp_replace(regexp_replace(coalesce(p_payload->>'message', ''), '[[:cntrl:]]+', ' ', 'g'), '[[:space:]]+', ' ', 'g'));
    if clean_message = '' then
      return jsonb_build_object('status', 'error', 'code', 'JOIN_MESSAGE_REQUIRED', 'message', 'Write a message before sending your join request.');
    end if;
    if char_length(clean_message) > 200 then
      return jsonb_build_object('status', 'error', 'code', 'JOIN_MESSAGE_TOO_LONG', 'message', 'Join-request messages cannot exceed 200 characters.');
    end if;
    insert into public.faction_join_requests(faction_id, applicant_id, message, created_at, updated_at)
    values (faction_row.id, p_user_id, clean_message, p_now, p_now)
    returning * into request_row;
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    command_result := jsonb_build_object('requestId', request_row.id, 'factionNumber', faction_row.faction_number, 'factionName', faction_row.name, 'message', clean_message);

  elsif p_command_type = 'faction.request.review' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 2 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot review join requests.');
    end if;
    begin
      select * into request_row from public.faction_join_requests where id = (p_payload->>'requestId')::uuid for update;
    exception when others then request_row := null; end;
    if request_row.id is null or request_row.faction_id <> actor_member.faction_id or request_row.status <> 'pending' then
      return jsonb_build_object('status', 'error', 'code', 'REQUEST_NOT_PENDING', 'message', 'That join request is no longer pending.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if lower(coalesce(p_payload->>'decision', '')) in ('reject', 'decline') then
      update public.faction_join_requests set status = 'rejected', reviewer_id = p_user_id, reviewed_at = p_now, updated_at = p_now where id = request_row.id;
      insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
      values (request_row.applicant_id, faction_row.id, 'join_request_declined', jsonb_build_object('factionName', faction_row.name), p_now);
      command_result := jsonb_build_object('decision', 'declined', 'requestId', request_row.id);
    elsif lower(coalesce(p_payload->>'decision', '')) = 'accept' then
      if exists(select 1 from public.faction_members where player_id = request_row.applicant_id) then
        update public.faction_join_requests set status = 'cancelled', reviewer_id = p_user_id, reviewed_at = p_now, updated_at = p_now where id = request_row.id;
        return jsonb_build_object('status', 'error', 'code', 'APPLICANT_UNAVAILABLE', 'message', 'That player has already joined another faction.');
      end if;
      select count(*) into member_count from public.faction_members where faction_id = faction_row.id;
      if member_count >= 20 then
        return jsonb_build_object('status', 'error', 'code', 'FACTION_FULL', 'message', 'This faction has reached its 20-member limit. The request remains pending.');
      end if;
      insert into public.faction_members(faction_id, player_id, faction_rank, joined_at, last_faction_activity_at)
      values (faction_row.id, request_row.applicant_id, 'private', p_now, p_now);
      update public.faction_join_requests set status = 'accepted', reviewer_id = p_user_id, reviewed_at = p_now, updated_at = p_now where id = request_row.id;
      update public.faction_join_requests set status = 'cancelled', reviewed_at = p_now, updated_at = p_now where applicant_id = request_row.applicant_id and status = 'pending';
      update public.faction_invitations set status = 'cancelled', responded_at = p_now, updated_at = p_now where recipient_id = request_row.applicant_id and status = 'pending';
      insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
      values (request_row.applicant_id, faction_row.id, 'join_request_accepted', jsonb_build_object('factionName', faction_row.name, 'factionNumber', faction_row.faction_number), p_now);
      insert into public.faction_activity(faction_id, actor_id, target_id, event_type, metadata, created_at)
      values (faction_row.id, p_user_id, request_row.applicant_id, 'member_joined', jsonb_build_object('method', 'public_request'), p_now);
      command_result := jsonb_build_object('decision', 'accepted', 'requestId', request_row.id);
    else
      return jsonb_build_object('status', 'error', 'code', 'INVALID_DECISION', 'message', 'Choose Accept or Reject.');
    end if;
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;

  elsif p_command_type = 'faction.request.withdraw' then
    begin
      select * into request_row from public.faction_join_requests where id = (p_payload->>'requestId')::uuid for update;
    exception when others then request_row := null; end;
    if request_row.id is null or request_row.applicant_id <> p_user_id or request_row.status <> 'pending' then
      return jsonb_build_object('status', 'error', 'code', 'REQUEST_NOT_PENDING', 'message', 'That join request is no longer pending.');
    end if;
    update public.faction_join_requests set status = 'withdrawn', reviewed_at = p_now, updated_at = p_now where id = request_row.id;
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    select member.player_id, request_row.faction_id, 'join_request_withdrawn', jsonb_build_object('applicantUsername', actor_profile.username), p_now
    from public.faction_members member
    where member.faction_id = request_row.faction_id and public.faction_rank_weight(member.faction_rank) >= 2;
    update public.factions set revision = revision + 1, updated_at = p_now where id = request_row.faction_id;
    command_result := jsonb_build_object('requestId', request_row.id, 'status', 'withdrawn');

  elsif p_command_type = 'faction.code.generate' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 3 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Only Lieutenants and the Leader may generate or reset a join code.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if faction_row.membership_mode <> 'code_only' then
      return jsonb_build_object('status', 'error', 'code', 'WRONG_MEMBERSHIP_MODE', 'message', 'Join codes are available only in code-only mode.');
    end if;
    update public.faction_access_codes set status = 'reset', reset_at = p_now where faction_id = faction_row.id and status = 'active';
    plaintext_code := 'BCF-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 4)) || '-'
      || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 4)) || '-'
      || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 4));
    insert into public.faction_access_codes(faction_id, code_hash, created_by, created_at)
    values (faction_row.id, encode(extensions.digest(plaintext_code, 'sha256'), 'hex'), p_user_id, p_now)
    returning * into code_row;
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'access_code_generated', jsonb_build_object('resetPrevious', exists(select 1 from public.faction_access_codes where faction_id = faction_row.id and status = 'reset')), p_now);
    command_result := jsonb_build_object('code', plaintext_code, 'createdAt', p_now, 'message', 'Copy this code now. For security, it will not be displayed again.');

  elsif p_command_type = 'faction.code.redeem' then
    if actor_member.player_id is not null then
      return jsonb_build_object('status', 'error', 'code', 'ALREADY_IN_FACTION', 'message', 'Leave your current faction before redeeming a join code.');
    end if;
    if not public.faction_take_rate_limit(p_user_id, 'code_redeem', 10, p_now) then
      return jsonb_build_object('status', 'error', 'code', 'RATE_LIMITED', 'message', 'Too many code attempts were made recently. Please wait before trying again.');
    end if;
    clean_code := upper(trim(coalesce(p_payload->>'code', '')));
    if clean_code !~ '^BCF-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$' then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_ACCESS_CODE', 'message', 'That code is invalid or no longer available.');
    end if;
    select * into code_row
    from public.faction_access_codes
    where code_hash = encode(extensions.digest(clean_code, 'sha256'), 'hex') and status = 'active'
    for update;
    if code_row.id is null then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_ACCESS_CODE', 'message', 'That code is invalid or no longer available.');
    end if;
    select * into faction_row from public.factions where id = code_row.faction_id for update;
    if faction_row.membership_mode <> 'code_only' then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_ACCESS_CODE', 'message', 'That code is invalid or no longer available.');
    end if;
    select count(*) into member_count from public.faction_members where faction_id = faction_row.id;
    if member_count >= 20 then
      return jsonb_build_object('status', 'error', 'code', 'FACTION_FULL', 'message', 'This faction has reached its 20-member limit. The code was not consumed.');
    end if;
    insert into public.faction_members(faction_id, player_id, faction_rank, joined_at, last_faction_activity_at)
    values (faction_row.id, p_user_id, 'private', p_now, p_now);
    update public.faction_access_codes set status = 'consumed', consumed_by = p_user_id, consumed_at = p_now where id = code_row.id;
    update public.faction_join_requests set status = 'cancelled', reviewed_at = p_now, updated_at = p_now where applicant_id = p_user_id and status = 'pending';
    update public.faction_invitations set status = 'cancelled', responded_at = p_now, updated_at = p_now where recipient_id = p_user_id and status = 'pending';
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'member_joined', jsonb_build_object('method', 'one_time_code'), p_now);
    command_result := jsonb_build_object('factionNumber', faction_row.faction_number, 'factionName', faction_row.name);

  elsif p_command_type = 'faction.member.rank' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 3 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot promote or demote members.');
    end if;
    begin target_player_number := (p_payload->>'playerId')::bigint; exception when others then target_player_number := null; end;
    select member.* into target_member
    from public.faction_members member
    join public.player_state profile on profile.id = member.player_id
    where member.faction_id = actor_member.faction_id and profile.player_id = target_player_number
    for update of member;
    next_rank := lower(coalesce(p_payload->>'factionRank', ''));
    actor_weight := public.faction_rank_weight(actor_member.faction_rank);
    target_weight := public.faction_rank_weight(target_member.faction_rank);
    next_weight := public.faction_rank_weight(next_rank);
    if target_member.player_id is null then
      return jsonb_build_object('status', 'error', 'code', 'TARGET_NOT_MEMBER', 'message', 'That player is not a member of this faction.');
    end if;
    if target_member.player_id = p_user_id then
      return jsonb_build_object('status', 'error', 'code', 'SELF_RANK_CHANGE_FORBIDDEN', 'message', 'You cannot change your own Faction Rank.');
    end if;
    if target_weight >= actor_weight or next_weight < 0 or next_weight >= actor_weight or next_rank = 'leader'
      or (actor_member.faction_rank = 'lieutenant' and next_weight >= 3) then
      return jsonb_build_object('status', 'error', 'code', 'RANK_CHANGE_FORBIDDEN', 'message', 'You may change only lower-ranked members to a Faction Rank below your own.');
    end if;
    update public.faction_members set faction_rank = next_rank, last_faction_activity_at = p_now
    where faction_id = actor_member.faction_id and player_id = target_member.player_id;
    select username into target_username from public.player_state where id = target_member.player_id;
    activity_type := case when next_weight > target_weight then 'member_promoted' else 'member_demoted' end;
    insert into public.faction_activity(faction_id, actor_id, target_id, event_type, metadata, created_at)
    values (actor_member.faction_id, p_user_id, target_member.player_id, activity_type, jsonb_build_object('oldRank', target_member.faction_rank, 'newRank', next_rank), p_now);
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    values (target_member.player_id, actor_member.faction_id, activity_type, jsonb_build_object('oldRank', target_member.faction_rank, 'newRank', next_rank), p_now);
    update public.factions set revision = revision + 1, updated_at = p_now where id = actor_member.faction_id;
    command_result := jsonb_build_object('playerId', target_player_number, 'username', target_username, 'oldRank', target_member.faction_rank, 'newRank', next_rank);

  elsif p_command_type = 'faction.member.remove' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 2 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot remove members.');
    end if;
    begin target_player_number := (p_payload->>'playerId')::bigint; exception when others then target_player_number := null; end;
    select member.* into target_member
    from public.faction_members member
    join public.player_state profile on profile.id = member.player_id
    where member.faction_id = actor_member.faction_id and profile.player_id = target_player_number
    for update of member;
    if target_member.player_id is null then
      return jsonb_build_object('status', 'error', 'code', 'TARGET_NOT_MEMBER', 'message', 'That player is not a member of this faction.');
    end if;
    if target_member.player_id = p_user_id or public.faction_rank_weight(target_member.faction_rank) >= public.faction_rank_weight(actor_member.faction_rank) then
      return jsonb_build_object('status', 'error', 'code', 'REMOVE_FORBIDDEN', 'message', 'You may remove only a lower-ranked faction member.');
    end if;
    select username into target_username from public.player_state where id = target_member.player_id;
    update public.faction_invitations set status = 'revoked', responded_at = p_now, updated_at = p_now
    where sender_id = target_member.player_id and faction_id = actor_member.faction_id and status = 'pending';
    delete from public.faction_members where faction_id = actor_member.faction_id and player_id = target_member.player_id;
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    select target_member.player_id, faction.id, 'member_removed', jsonb_build_object('factionName', faction.name, 'removedBy', actor_profile.username), p_now
    from public.factions faction where faction.id = actor_member.faction_id;
    insert into public.faction_activity(faction_id, actor_id, target_id, event_type, metadata, created_at)
    values (actor_member.faction_id, p_user_id, target_member.player_id, 'member_removed', jsonb_build_object('formerRank', target_member.faction_rank), p_now);
    update public.factions set revision = revision + 1, updated_at = p_now where id = actor_member.faction_id;
    command_result := jsonb_build_object('playerId', target_player_number, 'username', target_username, 'removed', true);

  elsif p_command_type = 'faction.leadership.transfer' then
    if actor_member.faction_rank <> 'leader' then
      return jsonb_build_object('status', 'error', 'code', 'LEADER_REQUIRED', 'message', 'Only the current Leader may transfer faction ownership.');
    end if;
    begin target_player_number := (p_payload->>'playerId')::bigint; exception when others then target_player_number := null; end;
    select member.* into target_member
    from public.faction_members member
    join public.player_state profile on profile.id = member.player_id
    where member.faction_id = actor_member.faction_id and profile.player_id = target_player_number
    for update of member;
    if target_member.player_id is null or target_member.player_id = p_user_id then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_SUCCESSOR', 'message', 'Choose another current faction member as the new Leader.');
    end if;
    update public.faction_members set faction_rank = 'lieutenant', last_faction_activity_at = p_now
    where faction_id = actor_member.faction_id and player_id = p_user_id;
    update public.faction_members set faction_rank = 'leader', last_faction_activity_at = p_now
    where faction_id = actor_member.faction_id and player_id = target_member.player_id;
    update public.factions set leader_id = target_member.player_id, revision = revision + 1, updated_at = p_now where id = actor_member.faction_id;
    select username into target_username from public.player_state where id = target_member.player_id;
    insert into public.faction_activity(faction_id, actor_id, target_id, event_type, metadata, created_at)
    values (actor_member.faction_id, p_user_id, target_member.player_id, 'leadership_transferred', jsonb_build_object('previousLeaderRank', 'lieutenant'), p_now);
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    values (target_member.player_id, actor_member.faction_id, 'leadership_received', jsonb_build_object('previousLeader', actor_profile.username), p_now);
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    values (p_user_id, actor_member.faction_id, 'leadership_transferred', jsonb_build_object('newLeaderUsername', target_username, 'newRank', 'lieutenant'), p_now);
    command_result := jsonb_build_object('newLeaderPlayerId', target_player_number, 'newLeaderUsername', target_username, 'previousLeaderRank', 'lieutenant');

  elsif p_command_type = 'faction.leave' then
    if actor_member.player_id is null then
      return jsonb_build_object('status', 'error', 'code', 'NOT_IN_FACTION', 'message', 'You are not currently in a faction.');
    end if;
    if actor_member.faction_rank = 'leader' then
      return jsonb_build_object('status', 'error', 'code', 'LEADER_MUST_TRANSFER', 'message', 'Transfer faction ownership or disband the faction before leaving.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    update public.faction_invitations set status = 'revoked', responded_at = p_now, updated_at = p_now
    where sender_id = p_user_id and faction_id = faction_row.id and status = 'pending';
    delete from public.faction_members where faction_id = actor_member.faction_id and player_id = p_user_id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'member_left', jsonb_build_object('formerRank', actor_member.faction_rank), p_now);
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    command_result := jsonb_build_object('left', true, 'factionName', faction_row.name);

  elsif p_command_type = 'faction.customize' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 3 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Only Lieutenants and the Leader may edit faction details.');
    end if;
    clean_name := left(trim(coalesce(p_payload->>'name', '')), 32);
    clean_description := left(trim(coalesce(p_payload->>'description', '')), 160);
    if clean_name = '' then
      return jsonb_build_object('status', 'error', 'code', 'FACTION_NAME_REQUIRED', 'message', 'Enter a faction name.');
    end if;
    update public.factions set name = clean_name, description = clean_description, revision = revision + 1, updated_at = p_now
    where id = actor_member.faction_id returning * into faction_row;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'faction_details_changed', jsonb_build_object('name', clean_name), p_now);
    command_result := jsonb_build_object('name', clean_name, 'description', clean_description);

  elsif p_command_type = 'faction.membership_mode.set' then
    if actor_member.faction_rank <> 'leader' then
      return jsonb_build_object('status', 'error', 'code', 'LEADER_REQUIRED', 'message', 'Only the Leader may change the faction membership mode.');
    end if;
    next_mode := lower(coalesce(p_payload->>'membershipMode', ''));
    if next_mode not in ('invite_only', 'code_only', 'public') then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_MEMBERSHIP_MODE', 'message', 'Choose invite-only, code-only, or public membership.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if faction_row.membership_mode = next_mode then
      return jsonb_build_object('status', 'error', 'code', 'MEMBERSHIP_MODE_UNCHANGED', 'message', 'The faction already uses that membership mode.');
    end if;
    if next_mode in ('code_only', 'public') then
      update public.faction_invitations set status = 'cancelled', responded_at = p_now, updated_at = p_now where faction_id = faction_row.id and status = 'pending';
    end if;
    if next_mode in ('invite_only', 'code_only') then
      update public.faction_join_requests set status = 'cancelled', reviewed_at = p_now, updated_at = p_now where faction_id = faction_row.id and status = 'pending';
    end if;
    if faction_row.membership_mode = 'code_only' and next_mode <> 'code_only' then
      update public.faction_access_codes set status = 'reset', reset_at = p_now where faction_id = faction_row.id and status = 'active';
    end if;
    update public.factions set membership_mode = next_mode, revision = revision + 1, updated_at = p_now where id = faction_row.id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'membership_mode_changed', jsonb_build_object('oldMode', faction_row.membership_mode, 'newMode', next_mode), p_now);
    command_result := jsonb_build_object('oldMode', faction_row.membership_mode, 'membershipMode', next_mode);

  elsif p_command_type = 'faction.boost.activate' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 2 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot manage faction boosts.');
    end if;
    action_value := lower(coalesce(p_payload->>'actionType', ''));
    if action_value not in ('mine', 'explore', 'hunt', 'fish', 'work') then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_ACTION', 'message', 'Choose a valid faction boost action.');
    end if;
    begin level_value := (p_payload->>'level')::integer; exception when others then level_value := 0; end;
    if level_value < 1 or level_value > 36 then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_BOOST_LEVEL', 'message', 'Choose a faction boost level from 1 through 36.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    perform public.faction_process_boosts(faction_row.id, p_now);
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    select * into boost_row from public.faction_boosts where faction_id = faction_row.id and action_type = action_value for update;
    cost_value := public.faction_cost_per_hour(level_value);
    next_mode := lower(coalesce(p_payload->>'mode', 'duration'));
    if next_mode not in ('duration', 'continuous') then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_BOOST_MODE', 'message', 'Choose fixed duration or continuous drain.');
    end if;
    if boost_row.level > 0 and boost_row.mode <> next_mode then
      return jsonb_build_object('status', 'error', 'code', 'BOOST_MODE_LOCKED', 'message', 'Stop the active boost before changing its operating mode.');
    end if;
    if next_mode = 'continuous' then
      if faction_row.treasury_balance < cost_value then
        return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_FACTION_POINTS', 'message', 'The treasury must cover at least one hour at the selected level.');
      end if;
      update public.faction_boosts
      set level = level_value, mode = 'continuous', cost_per_hour = cost_value, active_until = null, last_processed_at = p_now
      where faction_id = faction_row.id and action_type = action_value;
      activity_type := case when boost_row.level > 0 then 'boost_changed' else 'boost_activated' end;
      command_result := jsonb_build_object('actionType', action_value, 'level', level_value, 'mode', 'continuous', 'costPerHour', cost_value);
    else
      begin hours_value := (p_payload->>'durationHours')::numeric; exception when others then hours_value := 0; end;
      if hours_value < 0.1 or hours_value > 876000 then
        return jsonb_build_object('status', 'error', 'code', 'INVALID_DURATION', 'message', 'Enter a boost duration from 0.1 through 876,000 hours.');
      end if;
      cost_value := floor(cost_value * hours_value);
      if faction_row.treasury_balance < cost_value then
        return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_FACTION_POINTS', 'message', 'The faction treasury cannot cover that boost.');
      end if;
      balance_value := faction_row.treasury_balance - cost_value;
      update public.factions set treasury_balance = balance_value where id = faction_row.id;
      update public.faction_boosts
      set level = level_value,
          mode = 'duration',
          cost_per_hour = public.faction_cost_per_hour(level_value),
          active_until = case
            when boost_row.level = level_value and boost_row.mode = 'duration' and boost_row.active_until > p_now
              then boost_row.active_until + make_interval(secs => (hours_value * 3600)::double precision)
            else p_now + make_interval(secs => (hours_value * 3600)::double precision)
          end,
          last_processed_at = p_now
      where faction_id = faction_row.id and action_type = action_value;
      activity_type := case when boost_row.level = level_value and boost_row.active_until > p_now then 'boost_extended' else 'boost_activated' end;
      insert into public.faction_treasury_ledger(faction_id, actor_id, entry_type, amount_delta, balance_after, metadata, created_at)
      values (faction_row.id, p_user_id, case when activity_type = 'boost_extended' then 'boost_extension' else 'boost_purchase' end, -cost_value, balance_value, jsonb_build_object('actionType', action_value, 'level', level_value, 'hours', hours_value), p_now);
      command_result := jsonb_build_object('actionType', action_value, 'level', level_value, 'mode', 'duration', 'hours', hours_value, 'costPaid', cost_value, 'treasuryBalance', balance_value);
    end if;
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, activity_type, command_result, p_now);

  elsif p_command_type = 'faction.boost.stop' then
    if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 2 then
      return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot manage faction boosts.');
    end if;
    action_value := lower(coalesce(p_payload->>'actionType', ''));
    if action_value not in ('mine', 'explore', 'hunt', 'fish', 'work') then
      return jsonb_build_object('status', 'error', 'code', 'INVALID_ACTION', 'message', 'Choose a valid faction boost action.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    perform public.faction_process_boosts(faction_row.id, p_now);
    select * into boost_row from public.faction_boosts where faction_id = faction_row.id and action_type = action_value for update;
    if boost_row.level = 0 then
      return jsonb_build_object('status', 'error', 'code', 'BOOST_NOT_ACTIVE', 'message', 'That faction boost is not active.');
    end if;
    update public.faction_boosts set level = 0, cost_per_hour = 0, active_until = null, last_processed_at = p_now
    where faction_id = faction_row.id and action_type = action_value;
    update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'boost_stopped', jsonb_build_object('actionType', action_value, 'previousLevel', boost_row.level), p_now);
    command_result := jsonb_build_object('actionType', action_value, 'stopped', true, 'refund', 0);

  elsif p_command_type = 'faction.notification.read' then
    if coalesce(p_payload->>'notificationId', '') = 'all' then
      update public.faction_notifications set read_at = coalesce(read_at, p_now) where recipient_id = p_user_id and read_at is null;
      command_result := jsonb_build_object('read', 'all');
    else
      begin
        update public.faction_notifications set read_at = coalesce(read_at, p_now)
        where id = (p_payload->>'notificationId')::bigint and recipient_id = p_user_id;
      exception when others then
        return jsonb_build_object('status', 'error', 'code', 'NOTIFICATION_NOT_FOUND', 'message', 'That notification is no longer available.');
      end;
      if not found then return jsonb_build_object('status', 'error', 'code', 'NOTIFICATION_NOT_FOUND', 'message', 'That notification is no longer available.'); end if;
      command_result := jsonb_build_object('read', p_payload->>'notificationId');
    end if;

  elsif p_command_type = 'faction.disband' then
    if actor_member.faction_rank <> 'leader' then
      return jsonb_build_object('status', 'error', 'code', 'LEADER_REQUIRED', 'message', 'Only the Leader may disband the faction.');
    end if;
    select * into faction_row from public.factions where id = actor_member.faction_id for update;
    if trim(coalesce(p_payload->>'confirmationName', '')) <> faction_row.name then
      return jsonb_build_object('status', 'error', 'code', 'DISBAND_CONFIRMATION_MISMATCH', 'message', 'Enter the exact faction name to confirm disbanding.');
    end if;
    insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
    select member.player_id, faction_row.id, 'faction_disbanded', jsonb_build_object('factionName', faction_row.name), p_now
    from public.faction_members member where member.faction_id = faction_row.id and member.player_id <> p_user_id;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'faction_disbanded', jsonb_build_object('factionName', faction_row.name, 'forfeitedTreasury', faction_row.treasury_balance), p_now);
    command_result := jsonb_build_object('disbanded', true, 'factionName', faction_row.name, 'forfeitedTreasury', faction_row.treasury_balance);
    delete from public.factions where id = faction_row.id;

  else
    return jsonb_build_object('status', 'error', 'code', 'UNKNOWN_FACTION_COMMAND', 'message', 'That faction command is not supported.');
  end if;

  receipt_result := command_result;
  if p_command_type = 'faction.code.generate' then
    receipt_result := (command_result - 'code') || jsonb_build_object(
      'codeUnavailable', true,
      'message', 'This code was displayed only in the original generation response and cannot be retrieved.'
    );
  end if;
  insert into public.faction_command_receipts(user_id, command_id, command_type, result, created_at)
  values (p_user_id, p_command_id, p_command_type, receipt_result, p_now);
  delete from public.faction_command_receipts where user_id = p_user_id and created_at < p_now - interval '24 hours';

  if player_state_json is null then
    select state, state_revision into player_state_json, player_revision_value from public.player_state where id = p_user_id;
  end if;

  return jsonb_build_object(
    'status', 'applied',
    'result', command_result,
    'playerState', player_state_json,
    'playerRevision', player_revision_value,
    'snapshot', public.faction_get_snapshot(p_user_id, p_now)
  );
exception
  when unique_violation then
    return jsonb_build_object('status', 'error', 'code', 'CONCURRENT_CONFLICT', 'message', 'Faction membership changed before this action completed. Refresh and try again.');
  when foreign_key_violation then
    return jsonb_build_object('status', 'error', 'code', 'STALE_FACTION_DATA', 'message', 'Faction data changed before this action completed. Refresh and try again.');
end;
$$;

revoke all on function public.faction_execute_command(uuid, uuid, bigint, text, jsonb, bigint, timestamp with time zone) from public, anon, authenticated;
grant execute on function public.faction_execute_command(uuid, uuid, bigint, text, jsonb, bigint, timestamp with time zone) to service_role;

create or replace function public.faction_search_players(
  p_user_id uuid,
  p_search text,
  p_limit integer default 10,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  actor_member public.faction_members%rowtype;
  clean_search text := left(lower(trim(coalesce(p_search, ''))), 64);
  safe_limit integer := greatest(1, least(20, coalesce(p_limit, 10)));
  result_json jsonb;
begin
  update public.player_state set last_active_at = p_now where id = p_user_id;
  select * into actor_member from public.faction_members where player_id = p_user_id;
  if actor_member.player_id is null or public.faction_rank_weight(actor_member.faction_rank) < 1 then
    return jsonb_build_object('status', 'error', 'code', 'INSUFFICIENT_PERMISSION', 'message', 'Your Faction Rank cannot search for invitation recipients.');
  end if;
  if clean_search = '' then
    return jsonb_build_object('status', 'ok', 'items', '[]'::jsonb);
  end if;

  select jsonb_build_object('status', 'ok', 'items', coalesce(jsonb_agg(search_item.item order by search_item.username), '[]'::jsonb))
  into result_json
  from (
    select profile.username, jsonb_build_object(
      'playerId', profile.player_id,
      'username', profile.username,
      'isGuest', profile.account_kind = 'guest'
    ) as item
    from public.player_state profile
    where profile.id <> p_user_id
      and not exists(select 1 from public.faction_members member where member.player_id = profile.id)
      and (lower(profile.username) like '%' || clean_search || '%' or profile.player_id::text = replace(clean_search, '#', ''))
    order by lower(profile.username), profile.player_id
    limit safe_limit
  ) search_item;
  return coalesce(result_json, jsonb_build_object('status', 'ok', 'items', '[]'::jsonb));
end;
$$;

create or replace function public.faction_migrate_legacy_player(
  p_user_id uuid,
  p_state jsonb,
  p_expected_revision bigint,
  p_guest_import boolean default false,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  profile_row public.player_state%rowtype;
  faction_row public.factions%rowtype;
  legacy_faction jsonb;
  source_state jsonb;
  clean_name text;
  clean_description text;
  points_value numeric;
  lifetime_value numeric;
  action_name text;
  boost_json jsonb;
  level_value integer;
  mode_value text;
  active_until_value timestamp with time zone;
  migrated_revision bigint;
begin
  select * into profile_row from public.player_state where id = p_user_id for update;
  if not found then return jsonb_build_object('status', 'error', 'code', 'PLAYER_NOT_FOUND', 'message', 'Player profile not found.'); end if;

  if exists(select 1 from public.faction_migration_receipts where player_id = p_user_id) then
    return jsonb_build_object(
      'status', 'duplicate',
      'playerState', profile_row.state,
      'playerRevision', profile_row.state_revision,
      'snapshot', public.faction_get_snapshot(p_user_id, p_now)
    );
  end if;

  if p_guest_import then
    if profile_row.account_kind <> 'guest' or profile_row.guest_migrated_at is not null then
      return jsonb_build_object('status', 'error', 'code', 'GUEST_MIGRATION_ALREADY_COMPLETED', 'message', 'This guest identity has already completed its one-time migration.');
    end if;
    if profile_row.state_revision <> p_expected_revision or p_state is null or jsonb_typeof(p_state) <> 'object' then
      return jsonb_build_object('status', 'conflict', 'code', 'STATE_CONFLICT', 'message', 'Guest progress changed before migration. Refresh and try again.');
    end if;
    source_state := p_state;
  else
    source_state := profile_row.state;
  end if;

  legacy_faction := source_state->'faction';
  if legacy_faction is not null
    and jsonb_typeof(legacy_faction) = 'object'
    and lower(coalesce(legacy_faction->>'created', 'false')) = 'true'
    and not exists(select 1 from public.faction_members where player_id = p_user_id) then
    clean_name := left(trim(coalesce(legacy_faction->>'name', 'Unnamed Faction')), 32);
    if clean_name = '' then clean_name := 'Unnamed Faction'; end if;
    clean_description := left(trim(coalesce(legacy_faction->>'description', '')), 160);
    begin points_value := greatest(0, least(9007199254740991::numeric, floor((legacy_faction->>'points')::numeric))); exception when others then points_value := 0; end;
    begin lifetime_value := greatest(points_value, least(9007199254740991::numeric, floor((legacy_faction->>'lifetimeContributed')::numeric))); exception when others then lifetime_value := points_value; end;

    insert into public.factions(name, description, membership_mode, leader_id, treasury_balance, lifetime_contribution, created_at, updated_at)
    values (clean_name, clean_description, 'invite_only', p_user_id, points_value, lifetime_value, p_now, p_now)
    returning * into faction_row;
    insert into public.faction_members(faction_id, player_id, faction_rank, lifetime_contribution, joined_at, last_faction_activity_at)
    values (faction_row.id, p_user_id, 'leader', lifetime_value, p_now, p_now);

    foreach action_name in array array['mine', 'explore', 'hunt', 'fish', 'work'] loop
      boost_json := legacy_faction->'boosts'->action_name;
      begin level_value := greatest(0, least(36, coalesce((boost_json->>'level')::integer, 0))); exception when others then level_value := 0; end;
      mode_value := case when boost_json->>'mode' = 'continuous' then 'continuous' else 'duration' end;
      begin
        active_until_value := case
          when level_value > 0 and mode_value = 'duration' and (boost_json->>'activeUntil')::numeric > 0
            then to_timestamp((boost_json->>'activeUntil')::double precision / 1000)
          else null
        end;
      exception when others then active_until_value := null;
      end;
      if mode_value = 'duration' and (active_until_value is null or active_until_value <= p_now) then level_value := 0; end if;
      insert into public.faction_boosts(faction_id, action_type, level, mode, cost_per_hour, active_until, last_processed_at)
      values (faction_row.id, action_name, level_value, mode_value, public.faction_cost_per_hour(level_value), active_until_value, p_now);
    end loop;

    if points_value > 0 then
      insert into public.faction_treasury_ledger(faction_id, actor_id, entry_type, amount_delta, balance_after, metadata, created_at)
      values (faction_row.id, p_user_id, 'migration', points_value, points_value, jsonb_build_object('legacyFaction', true), p_now);
    end if;
    insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
    values (faction_row.id, p_user_id, 'legacy_faction_migrated', jsonb_build_object('name', clean_name), p_now);
  end if;

  source_state := jsonb_set(coalesce(source_state, '{}'::jsonb) - 'faction', '{schemaVersion}', '2'::jsonb, true);
  update public.player_state
  set state = source_state,
      state_revision = state_revision + 1,
      guest_migrated_at = case when p_guest_import then p_now else guest_migrated_at end,
      last_active_at = p_now
  where id = p_user_id
  returning state, state_revision into source_state, migrated_revision;

  insert into public.faction_migration_receipts(player_id, imported_faction, migrated_at)
  values (p_user_id, faction_row.id is not null, p_now);

  return jsonb_build_object(
    'status', 'applied',
    'importedFaction', faction_row.id is not null,
    'playerState', source_state,
    'playerRevision', migrated_revision,
    'snapshot', public.faction_get_snapshot(p_user_id, p_now)
  );
exception
  when unique_violation then
    return jsonb_build_object('status', 'error', 'code', 'MIGRATION_CONFLICT', 'message', 'Faction migration was already completed for this player.');
end;
$$;

create or replace function public.faction_cleanup_inactive_guest(
  p_user_id uuid,
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  profile_row public.player_state%rowtype;
  member_row public.faction_members%rowtype;
  faction_row public.factions%rowtype;
  successor_row public.faction_members%rowtype;
  successor_username text;
begin
  select * into profile_row
  from public.player_state
  where id = p_user_id
  for update;

  if not found or profile_row.account_kind <> 'guest' then
    return jsonb_build_object('status', 'skipped', 'reason', 'not_guest');
  end if;
  if profile_row.last_active_at > p_now - interval '365 days' then
    return jsonb_build_object('status', 'skipped', 'reason', 'active');
  end if;

  select * into member_row from public.faction_members where player_id = p_user_id for update;
  if member_row.player_id is not null then
    select * into faction_row from public.factions where id = member_row.faction_id for update;
    if member_row.faction_rank = 'leader' then
      select member.* into successor_row
      from public.faction_members member
      where member.faction_id = faction_row.id and member.player_id <> p_user_id
      order by public.faction_rank_weight(member.faction_rank) desc, member.joined_at, member.player_id
      limit 1
      for update;

      if successor_row.player_id is null then
        delete from public.factions where id = faction_row.id;
      else
        update public.faction_members set faction_rank = 'private' where faction_id = faction_row.id and player_id = p_user_id;
        update public.faction_members set faction_rank = 'leader', last_faction_activity_at = p_now where faction_id = faction_row.id and player_id = successor_row.player_id;
        update public.factions set leader_id = successor_row.player_id, revision = revision + 1, updated_at = p_now where id = faction_row.id;
        select username into successor_username from public.player_state where id = successor_row.player_id;
        insert into public.faction_activity(faction_id, target_id, event_type, metadata, created_at)
        values (faction_row.id, successor_row.player_id, 'inactive_guest_leadership_transfer', jsonb_build_object('newLeaderUsername', successor_username), p_now);
        insert into public.faction_notifications(recipient_id, faction_id, event_type, payload, created_at)
        values (successor_row.player_id, faction_row.id, 'leadership_received', jsonb_build_object('reason', 'The previous guest Leader was inactive for 365 days.'), p_now);
        delete from public.faction_members where faction_id = faction_row.id and player_id = p_user_id;
      end if;
    else
      insert into public.faction_activity(faction_id, actor_id, event_type, metadata, created_at)
      values (faction_row.id, p_user_id, 'inactive_guest_removed', jsonb_build_object('formerRank', member_row.faction_rank), p_now);
      delete from public.faction_members where faction_id = faction_row.id and player_id = p_user_id;
      update public.factions set revision = revision + 1, updated_at = p_now where id = faction_row.id;
    end if;
  end if;

  delete from auth.users where id = p_user_id;
  return jsonb_build_object('status', 'deleted', 'playerId', profile_row.player_id);
end;
$$;

create or replace function public.faction_cleanup_inactive_guests(
  p_now timestamp with time zone default timezone('utc'::text, now())
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  guest_row record;
  deleted_count integer := 0;
  cleanup_result jsonb;
begin
  for guest_row in
    select id from public.player_state
    where account_kind = 'guest' and last_active_at <= p_now - interval '365 days'
    order by last_active_at
  loop
    cleanup_result := public.faction_cleanup_inactive_guest(guest_row.id, p_now);
    if cleanup_result->>'status' = 'deleted' then deleted_count := deleted_count + 1; end if;
  end loop;
  return jsonb_build_object('status', 'ok', 'deletedCount', deleted_count);
end;
$$;

-- Recreate profile provisioning so anonymous guests are represented explicitly.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_username text;
  final_username text;
  user_count int;
  created_kind text;
begin
  created_kind := case
    when new.raw_user_meta_data->>'bconomy_guest' = 'true' or new.email is null then 'guest'
    else 'registered'
  end;
  desired_username := nullif(trim(new.raw_user_meta_data->>'username'), '');

  if desired_username is null then
    if created_kind = 'guest' then
      desired_username := 'Guest_' || substr(replace(new.id::text, '-', ''), 1, 10);
    elsif new.email is not null and position('@' in new.email) > 1 then
      desired_username := split_part(new.email, '@', 1);
    else
      desired_username := 'Player_' || substr(new.id::text, 1, 8);
    end if;
  end if;

  final_username := left(desired_username, 32);
  select count(*) into user_count from public.player_state where lower(username) = lower(final_username);
  if user_count > 0 then
    final_username := left(desired_username, 25) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.player_state (id, username, email, account_kind, last_active_at)
  values (new.id, final_username, new.email, created_kind, timezone('utc'::text, now()))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.faction_search_players(uuid, text, integer, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_migrate_legacy_player(uuid, jsonb, bigint, boolean, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_cleanup_inactive_guest(uuid, timestamp with time zone) from public, anon, authenticated;
revoke all on function public.faction_cleanup_inactive_guests(timestamp with time zone) from public, anon, authenticated;
grant execute on function public.faction_search_players(uuid, text, integer, timestamp with time zone) to service_role;
grant execute on function public.faction_migrate_legacy_player(uuid, jsonb, bigint, boolean, timestamp with time zone) to service_role;
grant execute on function public.faction_cleanup_inactive_guest(uuid, timestamp with time zone) to service_role;
grant execute on function public.faction_cleanup_inactive_guests(timestamp with time zone) to service_role;

-- Schema installation complete!
