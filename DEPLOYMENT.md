# Bconomy Deployment Guide: Vercel & Supabase

This guide deploys Bconomy with Supabase Auth, PostgreSQL-backed player saves, and server-authoritative game commands.

## 1. Rotate Previously Exposed Credentials

Before deploying v3.2.0, rotate every Supabase credential that has ever appeared in repository history, especially the service-role key. Never put credential values in source files, documentation, client-side JavaScript, screenshots, or issue comments.

Use newly generated values only in the deployment provider’s encrypted environment-variable store. A service-role key is a server secret and must never be exposed to the browser.

## 2. Apply the Supabase Schema

1. Open the target project in the Supabase Dashboard.
2. Open **SQL Editor** and create a new query.
3. Run the complete [supabase_schema.sql](supabase_schema.sql) file.

The script is re-runnable. It creates or updates:

- `player_state`, including `state_revision` for optimistic concurrency.
- Row Level Security that lets authenticated users read only their own profile while keeping state writes server-authoritative.
- Automatic profile provisioning for new Auth users.
- `player_command_receipts` and `commit_player_command(...)` for idempotent, revision-checked command commits.

For an existing database, run the updated script before deploying the new application code. Do not deploy the v3.2.0 server against an older schema.

## 3. Configure Server Environment Variables

Set these values in Vercel Project Settings or the equivalent server environment:

```text
SUPABASE_URL=<project URL from Supabase API settings>
SUPABASE_ANON_KEY=<new anonymous key>
SUPABASE_SERVICE_ROLE_KEY=<new service-role key>
```

Do not prefix the service-role variable with `NEXT_PUBLIC_`, `VITE_`, or any other client-exposed prefix.

## 4. Deploy

### Git Integration

1. Connect the repository to Vercel.
2. Set the three environment variables for every intended environment.
3. Deploy the verified `main` branch.

### Vercel CLI

```bash
npm install --global vercel
vercel
```

## 5. Verify the Release

Run the local regression suite before deployment:

```bash
npm test
```

After deployment, verify:

- `GET /api/health` reports a healthy application.
- Guest actions persist only in the device save.
- A signed-in player can read their cloud profile and commit one command.
- A repeated command with the same `commandId` does not apply twice.
- A stale `expectedRevision` returns a conflict and does not overwrite newer progress.
- Device/cloud divergence presents the explicit reconciliation choice.
- `/api/auth/lookup-email` and `/api/auth/sync` return `410 Gone`.

The versioned request contract is documented in [docs/GAME_API_V1.md](docs/GAME_API_V1.md).

## 6. Authentication and Save Behavior

- Players can register with a unique username, optional email, and password.
- Sign-in accepts a username or email plus password; username resolution happens only on the trusted server.
- Authenticated browser requests carry the player access token as a bearer token.
- Game mutations are validated and executed on the server, then committed with an expected state revision and idempotency receipt.
- Guest and authenticated saves use separate browser storage. Linking a device save to an account requires an explicit import choice.
