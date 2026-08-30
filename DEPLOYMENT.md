# Bconomy v4.3.0 Deployment Guide: Vercel and Supabase

This guide deploys Bconomy with Supabase Auth, PostgreSQL-backed solo saves, and server-authoritative multiplayer factions. Apply the canonical database schema before the v4.3.0 application so Faction API v2 and boost configuration revisions exist when the client switches to semantic preconditions.

## 1. Rotate Previously Exposed Credentials

Rotate every Supabase credential that has ever appeared in repository history, especially the service-role key. Never put credential values in source files, documentation, client-side JavaScript, screenshots, or issue comments.

Use newly generated values only in the deployment provider's encrypted environment-variable store. A service-role key is a server secret and must never be exposed to the browser.

## 2. Enable Anonymous Guest Identities

In the Supabase Dashboard, open **Authentication → Providers → Anonymous Sign-Ins** and enable anonymous sign-ins. Bconomy uses a real anonymous Auth user for every guest so guests can join factions without opening a registration or sign-in form.

Creating an account upgrades that same Auth user. Do not add a workflow that creates a second user during upgrade, because the Player ID, solo progress, and faction membership must remain attached to one identity.

## 3. Apply the Supabase Schema

1. Open the target project in the Supabase Dashboard.
2. Open **SQL Editor** and create a new query.
3. Run the complete [supabase_schema.sql](supabase_schema.sql) file.

The script is re-runnable. It creates or updates:

- `player_state`, including `account_kind`, `last_active_at`, `guest_migrated_at`, and revision-checked solo state.
- `player_command_receipts` for 24-hour solo-command idempotency.
- Shared faction, membership, boost, request, invitation, access-code, ledger, activity, notification, message-bag, rate-limit, and receipt tables.
- Transactional faction query, command, legacy-migration, and inactive-guest-cleanup functions.
- Deferred invariants that require at most 20 members and exactly one Leader matching each faction's recorded owner.
- Row Level Security that permits a player to read only their own profile while keeping all shared faction rows and state writes behind server-authoritative functions.

Run the updated schema before deploying the application. The script is re-runnable and retains the v1 faction RPC during the v4.3.0 compatibility window.

### Dedicated faction test project

Create an exclusive, resettable Supabase project that is never used for production or staging traffic. In the GitHub `supabase-test` environment, configure:

```text
SUPABASE_TEST_URL=<test project URL>
SUPABASE_TEST_ANON_KEY=<test anonymous key>
SUPABASE_TEST_SERVICE_ROLE_KEY=<test service-role key>
SUPABASE_TEST_DB_URL=<test direct PostgreSQL connection string>
```

Protected main-branch and manual smoke runs apply the canonical schema twice, create run-tagged Auth identities and faction data, verify semantic concurrency through HTTP, and clean the run in `finally`. A daily workflow removes tagged identities older than 24 hours. The runner refuses remote execution unless the exclusive-project guard is set and refuses a test URL matching the application URL in the same process.

For local integration testing, install Docker and run `npm run test:factions:local`. The checked-in Supabase CLI configuration starts an isolated stack, applies the schema twice, runs the same suite, and stops without retaining database state.

## 4. Configure Server Environment Variables

Set these values in Vercel Project Settings or the equivalent server environment:

```text
SUPABASE_URL=<project URL from Supabase API settings>
SUPABASE_ANON_KEY=<new anonymous key>
SUPABASE_SERVICE_ROLE_KEY=<new service-role key>
BCONOMY_DEV_COMMANDS=false
BCONOMY_DEV_USER_IDS=
```

Do not prefix the service-role variable with `NEXT_PUBLIC_`, `VITE_`, or another client-exposed prefix.

Developer cash commands are fail-closed. Leave `BCONOMY_DEV_COMMANDS=false` in production unless an explicit operational need has been approved. When enabled, authorization is:

| Request path | Additional requirement | Result |
| --- | --- | --- |
| Direct local development | Non-production process, loopback socket, localhost/loopback Host, and no proxy-forwarding headers | Allowed |
| Remote or production | Authenticated player UUID appears in comma-separated `BCONOMY_DEV_USER_IDS` | Allowed |
| Forwarded/spoofed local request | Any proxy-forwarding header is present | Denied unless the authenticated UUID is allowlisted |
| Switch disabled | None | Always denied |

`ALLOW_DEV_COMMANDS=true` is accepted as a deprecated one-release alias for the master switch and produces a startup warning. It does not weaken the request or actor checks. The UUID allowlist is server-only and is never returned by configuration APIs.

## 5. Configure Inactive-Guest Cleanup

The server performs a guarded opportunistic cleanup, but production should also schedule the database function once per day with Supabase Cron or an equivalent trusted scheduler:

```sql
select public.faction_cleanup_inactive_guests();
```

The function deletes anonymous accounts after 365 complete days without activity. Membership cleanup is deterministic: a departing Leader is replaced by the highest Faction Rank, then earliest join time, then Player ID; an empty faction is deleted. Registered accounts are not included.

## 6. Deploy

### Git integration

1. Connect the repository to Vercel.
2. Set the three environment variables for every intended environment.
3. Deploy the verified `main` branch.

### Vercel CLI

```bash
npm install --global vercel
vercel
```

## 7. Verify the Release

Run the local regression suite before deployment:

```bash
npm test
```

After deploying to a staging environment, verify:

- `GET /api/health` reports a healthy application.
- A new browser automatically receives an anonymous guest identity and completes its one-time device migration.
- Registering that guest preserves the same Player ID, solo save, and faction membership.
- A repeated solo or faction command with the same `commandId` does not apply twice.
- A stale `expectedRevision` returns a conflict without overwriting newer progress.
- Runtime boost drain can advance a faction snapshot revision without blocking an unrelated reviewed membership-mode change.
- Changing the exact membership mode, target rank, boost configuration, or active code version being reviewed returns `FACTION_PRECONDITION_FAILED`, includes a latest snapshot, and requires confirmation again.
- Two different players can create, discover, request access to, join, and view the same faction.
- Invite-only, one-time-code-only, and public join-request modes enforce their distinct entry paths.
- Each new join request offers a newly selected cheerful default message, while allowing edits or regeneration before submission.
- Fixed rank permissions prevent a member from managing an equal or higher-ranked member.
- All members can deposit, the shared treasury updates once, and an active faction boost is applied authoritatively to the matching solo action.
- Redeeming a one-time code consumes it; resetting it invalidates the earlier code; no membership cooldown or code expiry is introduced.
- The 20-member limit is enforced inside the join transaction.
- A controlled staging guest with more than 365 days of inactivity is deleted and Leader succession follows the documented order.
- Singular `/api/faction/*`, `/api/auth/lookup-email`, and `/api/auth/sync` return `410 Gone`.

Solo transport is documented in [docs/GAME_API_V1.md](docs/GAME_API_V1.md), faction transport in [docs/GAME_API_V2.md](docs/GAME_API_V2.md), and complete player and operator rules in [docs/FACTIONS.md](docs/FACTIONS.md).

## 8. Authentication and Save Behavior

- Players begin with a server-backed anonymous guest identity and do not need to see a sign-in prompt to use factions.
- Players can upgrade a guest with a unique username, optional email, and password.
- Sign-in accepts a username or email plus password; username resolution happens only on the trusted server.
- Guest and registered browser requests carry the player's access token as a bearer token.
- Solo and multiplayer commands are validated server-side and protected by idempotency receipts. Faction v2 uses command-specific semantic preconditions; cash-changing commands also retain player revision checks.
- Player-state schema version 2 contains only solo state. Faction membership, treasury, boosts, requests, invitations, codes, ranks, and logs live in shared PostgreSQL tables.
- Existing registered and guest device saves receive one legacy-faction migration; the local faction field is removed afterward.
