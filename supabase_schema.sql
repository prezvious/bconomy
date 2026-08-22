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
  state jsonb not null default '{
    "cash": 0,
    "rankIndex": 0,
    "prestigeCount": 0,
    "prestigePoints": 0,
    "inventory": {},
    "tools": { "mine": 1, "explore": 1, "hunt": 1, "fish": 1 },
    "perks": { "investiture": 0, "cronyism": 0, "backchannel": 0, "partiality": 0, "serendipity": 0, "numismatist": 0, "amnesiac": 0, "water_byproducts": 0, "jackpot_fever": 0 },
    "cooldowns": { "mine": 0, "explore": 0, "hunt": 0, "fish": 0, "work": 0 },
    "faction": null,
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
    }
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create policy "Users can update own state"
  on public.player_state
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.player_state
  for insert
  with check (auth.uid() = id);

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

-- Schema installation complete!
