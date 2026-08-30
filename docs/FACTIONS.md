# Bconomy Multiplayer Factions

Bconomy v4.3.0 makes Faction the game's player-to-player system. Every other gameplay system remains solo. Factions do not add achievements, lotteries, quests, chat, direct messages, or automated gameplay.

## Membership

- A player may belong to one faction at a time.
- A faction may contain no more than 20 members, including its Leader.
- Every faction has exactly one Leader. The Leader is also the faction owner.
- A non-Leader may leave immediately. There is no membership cooldown.
- A Leader must transfer ownership to another current member before leaving, or permanently disband the faction.

Creating a faction costs $1,000,000 and makes the creator its sole Leader. The creator chooses one of three membership modes:

| Mode | How a player joins |
| --- | --- |
| Invite-only | A Corporal or higher sends an invitation, and the recipient accepts it. |
| Code-only | A player redeems the currently active one-time code. |
| Public requests | A player finds the faction in the public directory and sends a message for officer review. |

Only the Leader may change the membership mode. Changing modes closes incompatible pending recruitment records and invalidates an incompatible active code.

## Join-request messages

Every new public join request begins with a freshly generated cheerful message. The player can edit that message or choose **Regenerate** before sending it. Regenerating asks for confirmation before it replaces an edited message.

The system contains 48 complete messages and keeps a shuffled per-player bag. A message does not repeat for that player until the current 48-message cycle is exhausted. Submitted messages are required, normalized on the server, limited to 200 characters, and escaped when displayed.

## One-time codes

- Only a Lieutenant or the Leader may generate or reset a code.
- A code has no time expiration.
- Plaintext is displayed once, immediately after generation. The database stores only its SHA-256 hash.
- The first successful redemption consumes the code.
- A reset invalidates the prior code immediately.
- An invalid attempt, an ineligible player, or a full faction does not consume a valid code.
- No replacement code is generated automatically.

## Faction Ranks

Faction Ranks are separate from Bconomy's solo career and prestige progression. From least to most access, they are Private, Corporal, Sergeant, Lieutenant, and Leader. Permissions are fixed for every faction, and higher Faction Ranks inherit the permissions below them.

| Permission | Private | Corporal | Sergeant | Lieutenant | Leader |
| --- | :---: | :---: | :---: | :---: | :---: |
| View the faction, roster, permissions, and activity | Yes | Yes | Yes | Yes | Yes |
| Deposit personal cash into the treasury | Yes | Yes | Yes | Yes | Yes |
| Receive shared faction boosts | Yes | Yes | Yes | Yes | Yes |
| Leave the faction | Yes | Yes | Yes | Yes | Transfer first |
| Send invitations in Invite-only mode | No | Yes | Yes | Yes | Yes |
| Revoke an invitation they sent | No | Yes | Yes | Yes | Yes |
| Review public join requests | No | No | Yes | Yes | Yes |
| Remove lower-ranked members | No | No | Yes | Yes | Yes |
| Activate, extend, modify, or stop boosts | No | No | Yes | Yes | Yes |
| Promote or demote members below Lieutenant | No | No | No | Yes | Yes |
| View code status, generate a code, or reset the code | No | No | No | Yes | Yes |
| Edit the faction name and description | No | No | No | Yes | Yes |
| Change the membership mode | No | No | No | No | Yes |
| Promote a member to Lieutenant | No | No | No | No | Yes |
| Transfer leadership or disband the faction | No | No | No | No | Yes |

A member cannot change their own Faction Rank. An administrator may act only on a member below the administrator's own rank. A Lieutenant can assign only Private, Corporal, or Sergeant. The Leader can promote a member as high as Lieutenant. Leadership itself changes only through the ownership-transfer command.

## Shared treasury and boosts

Every member may deposit personal cash into the faction treasury at a one-to-one rate: $1 cash becomes 1 Faction Point. Deposits cannot be withdrawn, reversed, or refunded.

Sergeants, Lieutenants, and the Leader may use the treasury for shared boosts. Mining, Exploring, Hunting, Fishing, and Work each support Levels 1 through 36, from 1.25× through 10.00×. A boost can use a fixed duration or continuous drain. The server processes the treasury and resolves the current multiplier when a member performs the matching solo action. The browser cannot supply an authoritative faction multiplier.

## Guest players and retention

When Supabase is configured, Bconomy creates an anonymous guest identity automatically. A guest can create, join, lead, and administer a faction without first using the visible Sign In or Create Account flows.

Creating an account upgrades that same identity. The Player ID, solo progress, Faction Rank, contributions, and membership are preserved.

A guest identity is deleted after 365 days without activity. Cleanup also removes the guest's faction membership. If the guest was the Leader, ownership transfers to the eligible remaining member with the highest Faction Rank; the earliest join time breaks a rank tie, followed by Player ID for a deterministic result. If no member remains, the faction is disbanded.

## Consistency and security

- Shared faction tables use Row Level Security and are not directly accessible from browser clients.
- Reads and writes pass through service-only database functions.
- Mutations use expected player revisions, command-specific reviewed-state preconditions, and unique command IDs for conflict detection and idempotency. Runtime boost accounting does not invalidate an unrelated reviewed command.
- A genuine reviewed-state conflict refreshes the faction snapshot and requires review and confirmation again; the browser never retries the mutation automatically.
- Capacity and eligibility are rechecked inside the transaction that joins a player.
- Deferred database triggers reject any committed faction with more than 20 members or without exactly one Leader who matches the owner record.
- Legacy local factions are imported once, then removed from player-state schema version 2.

The canonical product specification is [2026-08-28-multiplayer-factions-design.md](superpowers/specs/2026-08-28-multiplayer-factions-design.md). The current faction HTTP contract is documented in [GAME_API_V2.md](GAME_API_V2.md); solo gameplay remains in [GAME_API_V1.md](GAME_API_V1.md).
