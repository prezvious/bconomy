# Bconomy Faction API v2

Faction API v2 replaces the faction-wide optimistic revision gate with command-specific semantic preconditions. Solo gameplay remains on Game API v1. Both faction endpoints require a valid registered or anonymous bearer identity, JSON, and `X-Bconomy-API-Version: 2`.

## Why v2 exists

Faction snapshots still contain a broad `revision` for observation, but it is not a v2 concurrency token. Runtime boost accounting can advance that revision while a Leader reviews an unrelated membership-mode change. Rejecting the mode change in that case is a false conflict.

V2 instead asks, “Did the state that justified this exact command change?” The database locks the actor, faction, and relevant resource rows, validates those expectations, and applies the command in the same transaction. It never retries a semantically stale command automatically.

## Queries

`POST /api/factions/queries` keeps the v1 query envelope:

```json
{
  "type": "faction.snapshot",
  "payload": {}
}
```

Authorized boost objects include `configRevision`. Lieutenant and Leader snapshots also include the active access-code row ID as the opaque `accessCode.version`; plaintext remains available only in the original code-generation response.

Faction queries send the client's `knownRevision` and responses include the viewer's authoritative player `revision`. When that revision differs, the response also includes its matching `state`. This synchronizes a browser when first-use legacy migration advances the solo revision without repeatedly transferring an unchanged save. Clients must apply the pair atomically and only when the observed revision is newer, so an older overlapping query cannot roll back progress or associate a new revision with stale state.

## Commands

`POST /api/factions/commands`

```json
{
  "type": "faction.membership_mode.set",
  "commandId": "123e4567-e89b-42d3-a456-426614174000",
  "expectedRevision": 7,
  "expected": {
    "factionId": "123e4567-e89b-42d3-a456-426614174001",
    "membershipMode": "invite_only"
  },
  "payload": {
    "membershipMode": "public"
  }
}
```

Every command requires:

- A unique UUID `commandId`. Replaying it returns the stored result without applying the command twice, even if expectations later become stale.
- The current solo `expectedRevision`. This remains authoritative for commands that spend personal cash.
- An `expected` object with `factionId`. Use `null` when the reviewed state was unaffiliated.
- The typed command `payload`.

Unexpected or missing expectation fields return `INVALID_FACTION_EXPECTATION` before the database command is called.

## Semantic expectations

All commands validate `factionId`. Additional fields are required only when they protect a decision the player reviewed:

| Command | Additional `expected` state |
| --- | --- |
| `faction.membership_mode.set` | `membershipMode` |
| `faction.invitation.send` | `membershipMode` |
| `faction.code.generate` | `membershipMode`, `accessCodeVersion` (UUID or `null`) |
| `faction.customize` | `name`, `description` |
| `faction.member.rank`, `faction.member.remove` | `targetMember: { playerId, factionRank }` |
| `faction.boost.activate`, `faction.boost.stop` | `boost: { actionType, configRevision }` |
| `faction.disband` | `name`, `memberCount` |

Invitation, request, notification, join, redemption, deposit, leave, and transfer commands lock and validate the addressed row, current status, authority, capacity, membership, and other eligibility inside their transaction. They do not need duplicate client expectations for those transactional checks.

Officer boost changes increment `configRevision`. Continuous treasury drain, processing timestamps, and automatic duration expiration do not. This lets unrelated runtime accounting proceed without invalidating a reviewed officer action.

## Conflict response

When relevant reviewed state changed, the server returns HTTP 409:

```json
{
  "error": {
    "code": "FACTION_PRECONDITION_FAILED",
    "message": "Faction data relevant to this action changed while you were reviewing it.",
    "details": { "precondition": "membershipMode" }
  },
  "snapshot": {}
}
```

The browser installs the returned snapshot, explains which relevant state changed, and requires the player to review and confirm again. It does not automatically resubmit the rejected mutation.

Successful commands retain the established response fields: `result`, viewer-filtered `snapshot`, optional `state`, current player `revision`, and `duplicate`.

## Compatibility window

Faction API v1 remains available in v4.3.0 so already-open v4.2.x tabs continue to work. V1 responses include `Deprecation: true` and a warning that removal is scheduled for v4.4.0. V1 still uses `expectedFactionRevision`; new clients must use v2. Game API v1 is not deprecated.

The complete player rules are in [FACTIONS.md](FACTIONS.md). Deployment and protected-test-project requirements are in [../DEPLOYMENT.md](../DEPLOYMENT.md).
