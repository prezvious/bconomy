# Bconomy Game API v1

Bconomy v3.2.0 routes browser gameplay through two typed endpoints. The server loads or validates the player state, executes the authoritative engine operation, and returns a normalized state snapshot.

## Transport

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

Queries never commit state. `guestState` is used only without an authenticated bearer token.

### Command

`POST /api/game/commands`

Send `X-Bconomy-API-Version: 1` and `Content-Type: application/json`.

```json
{
  "type": "shop.setWishlist",
  "commandId": "123e4567-e89b-42d3-a456-426614174000",
  "expectedRevision": 7,
  "payload": {
    "itemIds": ["Diamond"],
    "wished": true,
    "addedAt": 1787587200000
  },
  "guestState": {}
}
```

Authenticated commands require `Authorization: Bearer <access token>`, a UUID `commandId`, and the last observed `expectedRevision`. Guest commands return the next guest state in the response envelope and do not write to Supabase.

## Responses

Successful queries include `result` and the observed `revision`. Successful commands include `result`, the normalized `state`, the resulting `revision`, and whether an existing idempotency receipt was replayed.

Stable error codes include:

- `INCOMPATIBLE_CLIENT` — the request omitted API version 1.
- `UNKNOWN_QUERY` / `UNKNOWN_COMMAND` — the operation type is not registered.
- `DOMAIN_REJECTED` — the engine rejected the operation without mutating state.
- `STATE_CONFLICT` — the cloud state changed after the client’s last read.
- `INVALID_AUTH` — bearer authentication is invalid or expired.

## Query Types

- Catalog: `catalog.items`
- Career and prestige: `progression.summary`, `progression.target`, `prestige.simulate`, `prestige.optimize`
- Tools: `tool.previewUpgrade`, `tool.maxAffordable`
- Crafting: `crafting.preview`, `crafting.maxAffordable`, `crafting.whereUsed`, `crafting.intermediate`
- Farming: `farm.upgradePreview`, `farm.bulkUpgradePreview`
- Shop and boosters: `shop.sellRolls`, `shop.bulkSellPreview`, `shop.bulkBuyPreview`, `booster.bulkPreview`, `booster.extendActivePreview`

## Command Types

- Player and inventory: `player.reset`, `inventory.setFlags`, `shop.setWishlist`
- Actions and tools: `action.perform`, `tool.upgrade`, `tool.upgradeBulk`, `tool.socketInstall`, `tool.socketUninstall`, `tool.moduleCraft`
- Crafting: `crafting.execute`, `crafting.craftIntermediate`
- Career and prestige: `rank.up`, `prestige.ascend`, `prestige.upgradePerk`, `prestige.targetedRankUp`, `prestige.applyAllocation`, `prestige.ascendAndApply`
- Farming: `farm.refresh`, `farm.plant`, `farm.plantAll`, `farm.uproot`, `farm.uprootSame`, `farm.upgrade`, `farm.upgradeBulk`, `farm.waterAll`, `farm.addPlot`, `farm.claim`, `farm.useMelon`
- Shop and boosters: `shop.refresh`, `shop.restock`, `shop.buy`, `shop.sell`, `shop.buyBooster`, `shop.bulkSell`, `shop.bulkBuy`, `booster.bulkActivate`, `booster.extendActive`, `booster.use`, `booster.activate`
- Gambling and factions: `gambling.coinflip`, `gambling.slots`, `faction.refresh`, `faction.create`, `faction.deposit`, `faction.activateBoost`, `faction.stopBoost`, `faction.customize`

The gateway registry in `src/api/gameGateway.js` is the canonical list. Adding an operation requires gateway registration, client integration, input validation, and regression coverage.

## State and Migration Rules

- Every state passes through `normalizePlayerState(...)` before engine execution.
- State schema version 1 separates `lockedItems`, `favoriteItems`, and `shopWishlist`.
- Legacy `pinnedItems` migrate to `favoriteItems` and are removed from the normalized save.
- Lock/favorite flags for unowned items are cleaned up; wishlist entries persist independently of ownership.
- Signed-in writes use `commit_player_command(...)` to compare revisions, commit atomically, and record a 24-hour idempotency receipt.

## Deprecated Endpoints

`POST /api/auth/sync` and `POST /api/auth/lookup-email` return `410 Gone`. Clients must use command commits and the normal sign-in endpoint. No endpoint accepts arbitrary browser-supplied cloud state for routine synchronization.
