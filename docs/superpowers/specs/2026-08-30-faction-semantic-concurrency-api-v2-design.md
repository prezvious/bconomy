# Faction Semantic Concurrency and API v2 Design

## Goal

Faction commands must conflict only when state relevant to the player's reviewed action has changed. Automatic boost accounting, unrelated deposits, and ordinary member actions must not prevent a Leader from changing recruitment from Invite-only to Public requests.

This ships in Bconomy v4.3.0 as Faction API v2. Solo game endpoints remain on API v1. Faction API v1 and its existing database RPC remain available for the v4.3.0 rollout bridge and are removed in v4.4.0 after usage telemetry confirms old browser tabs have drained.

## Concurrency Contract

Faction API v2 replaces the blanket `expectedFactionRevision` gate with an `expected` object captured from the exact snapshot displayed when an action begins. All commands issued as a current member include `factionId`. Commands add only the semantic state on which their intent depends:

- Membership-mode changes include the displayed `membershipMode`.
- Faction customization includes the displayed `name` and `description`.
- Rank changes and member removals include the target player and displayed Faction Rank.
- Boost activation and stopping include the action and a stable `configRevision` that changes only when an officer changes boost configuration.
- Code generation includes the active access-code version, or `null` when no code is active.
- Disbanding includes the confirmed faction name and displayed member count.
- Mode-dependent invitation and code creation includes the displayed membership mode.
- Commands already identified by a request, invitation, membership, or code record continue to validate that record and its current eligibility under row locks.

`expectedRevision` remains the solo player-state concurrency token for cash-changing behavior and faction creation. Command IDs remain the idempotency key and are checked before semantic preconditions so a legitimate retry replays its original result.

A genuine mismatch returns HTTP 409 with `FACTION_PRECONDITION_FAILED`, a stable `details.precondition` key, and the latest viewer-filtered snapshot. The client refreshes, explains which reviewed condition changed, and requires a new confirmation. It never retries a confirmed mutation automatically.

## Database and Server

The canonical schema adds `faction_execute_command_v2` alongside the unchanged v1 function. V2 locks the relevant faction and resource rows, checks authority and command-specific expectations, then applies the mutation atomically. It does not compare the faction-wide revision before every member command.

Faction boosts gain a non-negative `config_revision`. Officer activation, extension, level changes, and stopping increment it. Continuous FP drain, `last_processed_at` changes, and automatic duration expiration do not. The existing faction `revision` remains snapshot/change metadata but is not a v2 concurrency token. Access-code snapshots expose the active row ID as an opaque version only to ranks already authorized to view code status.

The Express faction gateway accepts header versions 1 and 2 during v4.3.0. V1 delegates to the legacy RPC and emits deprecation telemetry. V2 validates `expected`, delegates to the new RPC, and fetches a latest snapshot for semantic conflicts. Logs contain API version, command type, outcome, timing, and the failed precondition key, but never player IDs, faction IDs, payloads, or expected/actual values.

## Browser Behavior

The browser removes its module-global faction revision cache. API v2 callers construct expectations from the currently rendered snapshot before any confirmation dialog opens. Mutation controls are disabled while the latest faction refresh is unresolved, including when cached content is visible.

Faction UI cache and in-flight responses are scoped to the current authenticated identity and render generation. Every authentication change clears cached faction data, and responses from older identities or generations are ignored. Conflict responses replace the visible snapshot and show reason-specific guidance before the player may initiate the action again.

## Verification and Rollout

Supabase CLI provides the disposable local database runtime. A cross-platform Node orchestrator starts the local stack, applies the root re-runnable schema, executes real RPC/HTTP concurrency tests, and stops services in `finally`. Pull requests and main pushes run this local gate.

An exclusive `supabase-test` GitHub environment stores `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_ROLE_KEY`, and `SUPABASE_TEST_DB_URL`. Main pushes and manual dispatches run a protected remote smoke suite. Tests create run-scoped identities, clean them in `finally`, and a daily safeguard deletes tagged orphans older than 24 hours. Production is never a test target.

Required scenarios cover continuous drain and member actions before a mode change, genuine concurrent mode/detail/rank/boost/code/member changes, command replay, cross-identity response isolation, recruitment cleanup, and v1 bridge behavior. Existing tests remain green.

Deployment order is schema first, local and protected test gates second, dual-version server plus v2 client third, and remote smoke verification last. Because v1 remains intact, an application rollback to v4.2.0 remains safe. V1 usage and semantic-precondition failures are monitored before removing the adapter and RPC in v4.4.0.
