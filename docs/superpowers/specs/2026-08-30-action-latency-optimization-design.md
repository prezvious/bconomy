# Action Latency Optimization Design

**Date:** 2026-08-30

**Status:** Approved direction; implementation pending

**Scope:** Reduce the time between clicking a core action button and receiving its authoritative result without weakening persistence, revision checks, idempotency, or faction correctness.

## Problem

A signed-in core action currently waits for several remote operations in series:

1. Verify the access token with Supabase Auth.
2. Load the player profile and state.
3. Update `last_active_at`.
4. Read the command receipt table.
5. Load the authoritative faction effect.
6. Execute the in-process action engine.
7. Commit the new state and command receipt atomically.

The activity update is redundant with the following player-state commit. The receipt read is redundant on the normal path because `commit_player_command` already checks the same command ID atomically. Inactive-guest cleanup is also awaited from the generic game context and can therefore delay the first action handled by a new serverless instance.

The browser keeps the clicked button in its loading state until this entire path completes. Afterward, it rebuilds the header, inventory, and action panel, which can add client-side work for mature inventories.

## Goals

- Remove avoidable remote round trips from every signed command.
- Preserve server-authoritative state and revision conflict handling.
- Preserve exactly-once command effects and stored results for retries.
- Preserve authoritative faction boosts for core actions.
- Keep guest inactivity tracking and cleanup functional.
- Make server-side phase timings observable before pursuing deeper architectural changes.

## Non-goals

- Optimistic local rewards or client-authoritative actions.
- A rewrite of the command gateway or action engine.
- Changing action rewards, cooldowns, faction behavior, or persistence semantics.
- Returning state deltas instead of full player state in the first implementation.

## Considered Approaches

### A. Remove redundant work in the existing flow — recommended

Keep the current command architecture but remove the receipt pre-read, fold activity tracking into the atomic commit, and take inactive-guest cleanup off the action request path. Add phase timing around context loading, faction lookup, engine execution, and commit.

This has the lowest migration risk and removes two normal-path database calls plus a possible cold-instance cleanup call.

### B. Consolidate action context into a database RPC

Create one RPC that loads the player state, revision, prior command receipt, and current faction effect. Combine it with cached local JWT verification.

This can reduce latency further, but it couples more command behavior to the database schema and requires a larger security and migration review. It should be considered after approach A is measured in production.

### C. Execute actions optimistically in the browser

Show rewards and cooldowns immediately, then reconcile with the server.

This improves perceived latency but duplicates random action execution, complicates rollback and revision conflicts, and exposes more game logic to manipulation. It is not appropriate for the authoritative action path.

## Selected Design

### Command persistence

`commit_player_command` remains the only successful signed-command state mutation. Its update of `player_state` will also set `last_active_at` to the database clock. State, revision, activity time, and command receipt therefore advance in the same transaction.

The server will no longer query `player_command_receipts` before executing a command. The commit function already checks the receipt before locking and updating player state. On a duplicate, it returns the stored result and resulting revision. The existing duplicate branch will load the latest state and return the stored result; duplicate retries remain correct even though the in-process engine may have performed discarded work before the commit detects the duplicate.

### Guest cleanup

`resolveGameContext` will stop awaiting global inactive-guest cleanup. Cleanup remains available on profile/session-oriented paths, so application startup and account access continue to maintain the retention policy without placing the scan in every command path on a newly started serverless instance.

Successful signed commands refresh activity through `commit_player_command`. Profile loading and faction-specific operations retain their existing activity updates. Rejected, conflicted, and cooldown-blocked commands do not count as persisted activity.

### Timing telemetry

Game-command logs will include phase durations for:

- `contextMs`: token verification and player-state load.
- `factionMs`: authoritative faction-effect lookup, when applicable.
- `engineMs`: synchronous command execution.
- `commitMs`: atomic state and receipt commit.
- `durationMs`: total request processing time.

The command response will expose the same phases through a standards-compatible `Server-Timing` header when headers have not already been sent. Timing values contain durations only and no player identifiers or state.

### Client behavior

The first implementation keeps the serialized POST queue and full rerenders. These protect revision ordering and limit scope while server timing is established. If telemetry shows material time after the server response, a follow-up will update only the changed inventory entries, header fields, and cooldown row.

### High-level action-engine follow-up

The transmutation implementation currently performs one random-number draw per common item. Its runtime therefore scales with awarded quantity and can become significant for endgame multipliers. A separate follow-up should replace this with a bounded binomial sampler and cap the aggregate probability to `1`. That change is excluded from the first patch because it can alter the reward distribution and needs dedicated statistical tests.

## Error Handling and Invariants

- A revision conflict must not mutate state or `last_active_at`.
- A duplicate command must return its original stored result and the current authoritative state.
- A failed commit must not report action success.
- Faction lookup failure continues to fail closed; no local faction multiplier fallback is allowed.
- Guest/local-state command behavior remains unchanged.
- Telemetry failures must never fail a game command.

## Verification

1. Run the existing engine, API, identity recovery, faction, and UI contract suites.
2. Add a schema contract assertion that `commit_player_command` updates `last_active_at` in the same player-state update.
3. Add a server contract assertion that the signed command path no longer pre-reads command receipts or calls `touchPlayerActivity` through `resolveGameContext`.
4. Verify duplicate command IDs return the stored result without incrementing the revision twice.
5. Verify successful commands increment the revision and activity timestamp together.
6. Verify conflict and rejected commands do not update state.
7. Confirm command responses include valid timing phase values and logs remain free of state or tokens.

## Rollout

Deploy the schema change before or together with the server change. The schema update is backward-compatible: older servers can call the updated function, while newer servers depend on it to refresh activity. Compare `contextMs`, `factionMs`, `engineMs`, `commitMs`, and total duration after deployment. Only then decide whether the consolidated context RPC, transmutation sampler, or targeted client rendering is warranted.
