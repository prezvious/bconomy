# Bconomy Game API v1

Bconomy uses Game API v1 for solo gameplay. Faction API v1 remains temporarily available in v4.3.0 only as a compatibility bridge for already-open v4.2.x tabs; new faction clients use [Faction API v2](GAME_API_V2.md). Application release, transport, and player-state schema versions are independent.

## Identity

When Supabase is configured, the browser obtains an anonymous guest session automatically from `POST /api/auth/guest`. Registered players and anonymous guests then use the same bearer-authenticated command model. Creating an account through `POST /api/auth/signup` while carrying a guest bearer token upgrades the same Auth user and preserves its Player ID, solo state, and faction membership.

`POST /api/player/guest-migrate` performs one device-to-server migration for a new guest identity. It imports normalized solo progress and, when present, creates a shared faction from the legacy local faction before removing the local field. The request requires the current guest bearer token, `expectedRevision`, and `deviceState`.

An unauthenticated local-state envelope remains available for solo gameplay when persistence is not configured. Multiplayer faction endpoints always require a valid registered or anonymous bearer identity.

## Solo gameplay transport

### Query

`POST /api/game/queries`

Send `X-Bconomy-API-Version: 1` and `Content-Type: application/json`.

```json
{
  "type": "progression.summary",
  "payload": {},
  "guestState": {}
}
```

Queries do not commit state. `guestState` is accepted only when the request has no bearer identity.

### Command

`POST /api/game/commands`

```json
{
  "type": "shop.setWishlist",
  "commandId": "123e4567-e89b-42d3-a456-426614174000",
  "expectedRevision": 7,
  "payload": {
    "itemIds": ["Diamond"],
    "wished": true,
    "addedAt": 1787587200000
  }
}
```

Bearer-authenticated commands require a UUID `commandId` and the last observed non-negative `expectedRevision`. The server loads the player's normalized state, executes one registered operation, commits against the expected revision, and stores a 24-hour idempotency receipt. A repeated command ID returns the prior result without applying the mutation twice.

Successful commands include `result`, normalized `state`, the resulting `revision`, and `duplicate`. Successful queries include `result` and the observed revision.

### Solo query types

- Catalog: `catalog.items`
- Career and prestige: `progression.summary`, `progression.target`, `prestige.simulate`, `prestige.optimize`
- Tools: `tool.previewUpgrade`, `tool.maxAffordable`
- Crafting: `crafting.preview`, `crafting.maxAffordable`, `crafting.whereUsed`, `crafting.intermediate`
- Farming: `farm.upgradePreview`, `farm.bulkUpgradePreview`
- Shop and boosters: `shop.sellRolls`, `shop.bulkSellPreview`, `shop.bulkBuyPreview`, `booster.bulkPreview`, `booster.extendActivePreview`

### Solo command types

- Player and inventory: `player.reset`, `inventory.setFlags`, `shop.setWishlist`
- Actions and tools: `action.perform`, `tool.upgrade`, `tool.upgradeBulk`, `tool.socketInstall`, `tool.socketUninstall`, `tool.moduleCraft`
- Crafting: `crafting.execute`, `crafting.craftIntermediate`
- Career and prestige: `rank.up`, `prestige.ascend`, `prestige.upgradePerk`, `prestige.targetedRankUp`, `prestige.applyAllocation`, `prestige.ascendAndApply`
- Farming: `farm.refresh`, `farm.plant`, `farm.plantAll`, `farm.uproot`, `farm.uprootSame`, `farm.upgrade`, `farm.upgradeBulk`, `farm.waterAll`, `farm.addPlot`, `farm.claim`, `farm.useMelon`
- Shop and boosters: `shop.refresh`, `shop.restock`, `shop.buy`, `shop.sell`, `shop.buyBooster`, `shop.bulkSell`, `shop.bulkBuy`, `booster.bulkActivate`, `booster.extendActive`, `booster.use`, `booster.activate`
- Gambling: `gambling.coinflip`, `gambling.slots`

`src/api/gameGateway.js` is the canonical solo registry. The faction commands that existed in this registry before v4.0.0 have been removed.

### Authoritative faction effects on solo actions

For a bearer-authenticated `action.perform`, the server reads the player's current faction membership and boost directly from PostgreSQL. It supplies that internal context to `ActionEngine`; a browser-supplied `factionContext` is overwritten. Unauthenticated local requests receive no faction context. Factions therefore affect the matching solo action without making any other game system multiplayer.

## Deprecated multiplayer faction transport

Faction API v1 is deprecated and scheduled for removal in v4.4.0. Responses include `Deprecation: true` and an HTTP `Warning` header. Game API v1 is unaffected.

Both faction endpoints require `Authorization: Bearer <access token>`, `X-Bconomy-API-Version: 1`, and JSON content. Shared rows are never returned through direct Supabase browser access.

### Faction query

`POST /api/factions/queries`

```json
{
  "type": "faction.directory",
  "payload": { "search": "builders", "limit": 24, "offset": 0 }
}
```

Query types:

- `faction.snapshot` — viewer membership, permitted faction data, invitations or requests, and personal notifications.
- `faction.directory` — searchable public factions with member count, Leader, description, and active boosts.
- `faction.playerSearch` — eligible invitation recipients; requires Corporal or higher.
- `faction.joinMessage` — the next message from the viewer's shuffled 48-message bag.

### Faction command

`POST /api/factions/commands`

```json
{
  "type": "faction.request.send",
  "commandId": "123e4567-e89b-42d3-a456-426614174000",
  "expectedRevision": 7,
  "expectedFactionRevision": null,
  "payload": {
    "factionNumber": 42,
    "message": "Hello! I would love to contribute and grow with your faction."
  }
}
```

Every faction command requires a UUID command ID and the player's current solo-state revision. A current member also sends the faction revision from the latest snapshot as `expectedFactionRevision`; an unaffiliated player sends `null`. Cash-changing operations use the player revision for atomic balance changes, member operations reject stale faction revisions, and all commands use the command ID for faction-specific idempotency.

Command types:

- Foundation and treasury: `faction.create`, `faction.deposit`
- Invitations: `faction.invitation.send`, `faction.invitation.respond`, `faction.invitation.revoke`
- Public requests: `faction.request.send`, `faction.request.review`, `faction.request.withdraw`
- One-time codes: `faction.code.generate`, `faction.code.redeem`
- Members and ownership: `faction.member.rank`, `faction.member.remove`, `faction.leadership.transfer`, `faction.leave`, `faction.disband`
- Administration: `faction.customize`, `faction.membership_mode.set`, `faction.notification.read`
- Shared boosts: `faction.boost.activate`, `faction.boost.stop`

A successful command returns its operation `result`, a new viewer-filtered `snapshot`, optional updated solo `state`, the current player `revision`, and `duplicate`. Code generation includes plaintext in the original operation result exactly once; later snapshots and idempotent duplicate responses expose only active status.

## State and migration rules

- Player-state schema version 2 contains solo progress only and removes `faction` during normalization.
- Legacy `pinnedItems` migrate to `favoriteItems`; invalid owned flags are cleaned while wishlist entries remain independent of ownership.
- Existing registered saves run a one-time legacy faction migration before faction access.
- New guest identities run one device migration before faction access.
- Guest activity updates `last_active_at`. An identity inactive for 365 days is deleted with deterministic faction membership and Leader cleanup.

## Stable error behavior

Common codes include:

- `INCOMPATIBLE_CLIENT` — the required endpoint-specific API version was omitted.
- `INVALID_AUTH` / `FACTION_IDENTITY_REQUIRED` — the bearer identity is absent or invalid.
- `GUEST_MIGRATION_REQUIRED` — the new guest has not completed its one-time device import.
- `GUEST_EXPIRED` — the guest identity exceeded 365 days without activity and was deleted.
- `UNKNOWN_QUERY` / `UNKNOWN_COMMAND` — the solo operation is not registered.
- `UNKNOWN_FACTION_QUERY` / `UNKNOWN_FACTION_COMMAND` — the faction operation is not registered.
- `STATE_CONFLICT` — the player revision changed before commit.
- `FACTION_CONFLICT` — shared faction data changed after the member's last snapshot.
- `INSUFFICIENT_PERMISSION` / `LEADER_REQUIRED` — the viewer's fixed Faction Rank does not authorize the action.
- `FACTION_FULL` — the 20-member limit was rechecked inside the join transaction.
- `RATE_LIMITED` — the network abuse limit was reached; this is not a faction membership cooldown.

Domain errors do not commit partial state. Capacity, rank, mode, eligibility, and one-time-code status are checked in the same database transaction as the mutation.

## Removed endpoints

- Singular `/api/faction/*` local-state endpoints return `410 Gone`.
- `/api/auth/sync`, `/api/auth/lookup-email`, and `/api/player/sync` remain removed or unavailable for arbitrary routine full-state writes.

The full player-facing rules are in [FACTIONS.md](FACTIONS.md). Deployment requirements are in [../DEPLOYMENT.md](../DEPLOYMENT.md).
