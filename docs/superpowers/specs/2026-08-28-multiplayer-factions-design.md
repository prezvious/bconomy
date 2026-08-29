# Bconomy Multiplayer Factions Design

## Purpose

Replace the current player-local faction object with one server-authoritative multiplayer faction system. Factions are Bconomy's only player-to-player feature. Gathering, farming, inventory, crafting, the System Shop, tools, career progression, prestige, and gambling remain solo systems.

This release does not add achievements, lotteries, quests, faction chat, private messaging, automatic player actions, or other automated gameplay.

## Product rules

- A player may belong to no more than one faction.
- A faction may contain no more than 20 members, including its Leader.
- Every faction has exactly one Leader. The Leader is the faction owner.
- Faction Ranks are separate from Bconomy's career ranks.
- Faction Ranks, from lowest to highest, are Private, Corporal, Sergeant, Lieutenant, and Leader.
- Rank permissions are fixed and cannot be customized.
- A faction uses exactly one membership mode at a time: invite-only, code-only, or public.
- Treasury funds and action boosts are shared by all current faction members.
- Every member may deposit personal cash into the faction treasury at the existing 1:1 rate.
- Treasury deposits are irreversible and cannot be withdrawn or refunded.
- There is no cooldown after leaving, being removed from, or joining a faction.
- Both registered and guest players may use the complete faction system.

## Shared-data architecture

Faction data moves out of the player save and into normalized, shared database records. Personal game progress remains in the existing player state.

### Identity

Registered players continue to use their authenticated Supabase identity. A guest automatically receives an anonymous server identity without seeing a sign-in or sign-up prompt. The anonymous session is stored in the browser and authorizes the same server-side faction commands as a registered session.

After an anonymous identity is created, the guest's full game state becomes server-authoritative. This is required because a browser-owned cash balance could otherwise be edited and deposited into a shared faction treasury.

An anonymous identity can later be upgraded to a registered account. The upgrade preserves the same player identity, personal game state, faction membership, Faction Rank, contribution history, pending invitations, and pending requests.

### Tables

The database adds the following records. Names may change during implementation only when required by an established repository convention; their responsibilities must remain separate.

#### `factions`

- UUID primary key and immutable public faction ID
- Name, description, and membership mode
- Leader player ID
- Shared treasury balance and lifetime contribution total
- Created and updated timestamps
- Revision or equivalent concurrency value

Faction names are not required to be unique. Listings disambiguate equal names with the Leader's username and immutable public faction ID.

#### `faction_members`

- Faction ID and player ID composite identity
- Fixed Faction Rank
- Joined timestamp
- Lifetime contribution within this faction
- Last faction activity timestamp

A uniqueness constraint on player ID enforces one faction per player. A transaction and locked faction row enforce the 20-member limit.

#### `faction_join_requests`

- Request ID, faction ID, and applicant player ID
- Submitted message
- Pending, accepted, rejected, withdrawn, or cancelled status
- Reviewer player ID when applicable
- Created, reviewed, and updated timestamps

A partial unique constraint permits only one pending request from a player to a given faction. A player may hold no more than five pending public requests across all factions.

#### `faction_invitations`

- Invitation ID, faction ID, recipient player ID, and sender player ID
- Pending, accepted, declined, revoked, or cancelled status
- Created, responded, and updated timestamps

A partial unique constraint permits only one pending invitation from a faction to a given player.

#### `faction_access_codes`

- Code record ID and faction ID
- Cryptographic code hash; plaintext codes are never stored
- Creator player ID
- Active, consumed, or reset status
- Created, consumed, and reset timestamps
- Consuming player ID when used

Only one active code may exist per faction. The code does not expire with time. One successful redemption consumes it permanently. A new code must be generated manually. Resetting an unused code invalidates it immediately and creates a different code.

#### `faction_treasury_ledger`

- Ledger entry ID, faction ID, and actor player ID
- Deposit, boost purchase, boost extension, continuous-drain, or migration entry type
- Signed Faction Point delta and resulting balance
- Structured operation metadata
- Created timestamp

The ledger is append-only. A member leaving does not erase contribution history.

#### `faction_boosts`

- Faction ID and action type composite identity
- Level, mode, cost per hour, active-until time, and last-processed time

There is one record for each existing faction action: Mine, Explore, Hunt, Fish, and Work. Existing multiplier levels, cost formulas, fixed-duration behavior, and continuous-drain behavior remain unchanged.

#### `faction_activity`

- Activity ID, faction ID, actor player ID, and optional target player ID
- Typed event and safe display metadata
- Created timestamp

Events include deposits, boost changes, joins, departures, removals, promotions, demotions, code generation or reset, ownership transfer, customization, membership-mode changes, and disbanding.

#### `faction_notifications`

- Notification ID, recipient player ID, faction ID when retained, event type, safe display payload, read time, and created time

Notifications are informational. They never accept invitations, apply promotions, activate boosts, or perform any other gameplay action automatically.

#### `faction_message_bags`

- Player ID
- Current shuffled list of unused default-message IDs
- Updated timestamp

The server refills and reshuffles the bag only after all message IDs have been used. This prevents repetition for a player until the complete message pool has cycled, including across browser sessions.

### Transaction boundary

All multiplayer mutations are server-authoritative, idempotent, and transactional. The database operation locks every affected player, membership, and faction row before validating permissions or balances. The system must prevent:

- Two simultaneous joins from exceeding 20 members
- Two players consuming the same one-time code
- Concurrent deposits or spending from losing updates
- Duplicate execution after a network retry
- Conflicting promotions, removals, or leadership transfers
- A faction temporarily or permanently having zero or multiple Leaders

Personal cash and shared treasury changes commit in one database transaction. A failed deposit or boost purchase changes neither balance.

Game actions resolve the player's membership and effective faction multiplier on the server at execution time. The browser never supplies an authoritative faction multiplier.

## Faction Ranks and permissions

Every faction page contains a Rank Permissions view with this complete matrix.

| Permission | Private | Corporal | Sergeant | Lieutenant | Leader |
|---|:---:|:---:|:---:|:---:|:---:|
| View the faction, roster, permissions, and activity | Yes | Yes | Yes | Yes | Yes |
| Deposit personal cash into the treasury | Yes | Yes | Yes | Yes | Yes |
| Receive shared faction boosts | Yes | Yes | Yes | Yes | Yes |
| Leave the faction | Yes | Yes | Yes | Yes | Transfer first |
| Send invitations in invite-only mode | No | Yes | Yes | Yes | Yes |
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

Additional enforcement rules:

- Nobody can promote themselves.
- An administrator may act only on a member below the administrator's own rank.
- A Sergeant may remove Privates and Corporals but cannot change any member's rank.
- A Lieutenant may promote or demote Privates, Corporals, and Sergeants. A Lieutenant cannot alter another Lieutenant or the Leader.
- The Leader may promote or demote any non-Leader member, including promotion to Lieutenant.
- The Leader cannot leave while still Leader.
- Leadership transfer selects an existing member, promotes that member to Leader, and demotes the previous Leader to Lieutenant in one transaction.
- Leadership transfer requires an explicit confirmation that names both players and describes the irreversible authority change.

## Membership modes and flows

### Common rules

- The Leader counts toward the 20-member limit.
- Pending invitations, join requests, and unused codes do not reserve a slot.
- Every successful join rechecks the membership count inside the transaction.
- A player who already belongs to a faction cannot accept an invitation, redeem a code, or send a join request.
- Joining a faction cancels all of that player's other pending invitations and join requests atomically.
- There is no faction-switching cooldown.
- Network-level rate limiting prevents spam without imposing a gameplay membership cooldown. One player may submit at most 10 join requests, send at most 30 invitations, redeem at most 10 codes, and generate at most 30 default messages in any rolling 10-minute period.

Changing the membership mode requires a confirmation that lists the effects. Switching to invite-only cancels pending public join requests and invalidates the active access code. Switching to code-only cancels pending public join requests and invitations. Switching to public cancels pending invitations and invalidates the active access code. Closed records remain available for audit history.

### Invite-only

- Invite-only factions do not appear in the public directory.
- Corporals, Sergeants, Lieutenants, and the Leader may search for a player by username or Player ID and send an invitation.
- A recipient may accept or decline.
- Acceptance joins the player immediately as a Private after the server rechecks eligibility and capacity.
- If the faction is full, acceptance fails clearly and leaves the invitation pending.
- A sender may revoke their own pending invitation. A higher-ranked administrator may revoke an invitation created by a lower-ranked member.

### Code-only

- Code-only factions do not appear in the public directory.
- Only Lieutenants and the Leader may view the code's active status, generate a code, or reset the code.
- The plaintext code is displayed once, immediately after generation. It cannot be retrieved later because only its cryptographic hash is stored.
- A code is cryptographically random, stored only as a hash, and compared in constant time where practical.
- A code has no expiration date.
- The first successful redemption joins the player immediately as a Private and consumes the code.
- An invalid, used, or reset code cannot reveal whether a faction exists.
- If the faction is full or the redeemer is otherwise ineligible, redemption fails without consuming the code.
- After successful use, no new code is generated automatically. A Lieutenant or the Leader must generate one manually.

### Public

- Public factions appear in a searchable directory.
- Each listing shows the faction name, immutable faction ID, description, Leader, member count, active boosts, and whether a request can currently be submitted.
- A full faction may remain visible, but its Request to Join control is disabled with the explanation "This faction has reached its 20-member limit."
- A player submits a join request with a generated or edited message.
- Sergeants, Lieutenants, and the Leader may accept or reject requests.
- Acceptance joins the applicant as a Private after rechecking membership and capacity.
- If capacity is no longer available, acceptance fails without closing the request.
- Applicants may withdraw their own pending requests.

## Join-request messages

The request composer is available for public factions and contains:

- A newly generated cheerful default message
- An editable multiline field
- A Regenerate button
- A Send Request button
- A live character counter
- A 200-character limit

Opening a new request composer consumes the next default message from the player's server-side shuffle bag. Regenerate consumes another message and replaces the field. If the player has edited the field, Regenerate asks for confirmation before discarding the edit.

The server trims leading and trailing whitespace, collapses unsupported control characters, rejects an empty message, and rejects content longer than 200 Unicode characters. Submitted text is escaped at rendering time and is visible only to the applicant and members who may review requests.

The initial pool contains the following 48 complete messages. These are independent messages, not one repeated fill-in template.

1. "Hello! I brought good energy, sturdy tools, and an unreasonable amount of enthusiasm. I would love to help your faction thrive!"
2. "Greetings, future friends! I am ready to gather, contribute, and cheer loudly whenever the treasury number goes up."
3. "Your faction looks like a grand place to grow. May I join the crew and add my shovel to the cause?"
4. "Hello there! I have supplies to share, boosts to celebrate, and plenty of room in my schedule for faction teamwork."
5. "I spotted your faction and thought, 'Those people look delightfully productive.' I would be happy to join you!"
6. "Ready for one more cheerful worker? I would love to contribute, learn the ropes, and help keep the faction thriving."
7. "Salutations! My inventory is organized, my tools are polished, and my faction spirit is ready to go."
8. "I come bearing optimism, determination, and hopefully enough materials to be useful. May I join your faction?"
9. "Your banner caught my eye! I would love to work alongside your members and contribute to our shared success."
10. "Hello! I am looking for a friendly faction where every deposit and good idea can help the whole team."
11. "I would be delighted to join your ranks, pitch in where I can, and celebrate every boost with appropriate enthusiasm."
12. "Good day! I am ready to turn solo progress into shared momentum with your excellent-looking faction."
13. "Your faction seems full of possibility. I would love a chance to contribute and make the treasury sparkle."
14. "Hello, team! I have a can-do attitude, a well-used toolkit, and great respect for a properly funded faction boost."
15. "I am searching for a faction to call home, and yours looks like a wonderfully lively place to contribute."
16. "May I join your crew? I promise good manners, steady contributions, and cheerful greetings on arrival."
17. "A friendly adventurer reporting for duty! I would be glad to support your faction and grow alongside its members."
18. "Hello! Your faction has excellent energy. I would love to bring some of my own and help build something impressive."
19. "I have arrived with ambition, supplies, and a suspiciously polished pickaxe. I would be thrilled to join you."
20. "Your faction looks like it knows how to turn teamwork into progress. I would love to lend a hand."
21. "Greetings! I am ready to gather boldly, deposit responsibly, and appreciate every multiplier we earn together."
22. "I would love to join your faction and help make each shared boost feel like a tiny economic festival."
23. "Hello, potential teammates! I am eager to contribute, improve, and share in the faction's next big step forward."
24. "I found your faction while exploring and decided it looked far too cheerful to pass by without saying hello."
25. "Please consider this my enthusiastic knock on the faction door. I would be happy to join and contribute."
26. "I am looking for good company and a shared treasury worthy of enthusiastic deposits. Your faction looks perfect."
27. "Hello! I would be honored to start as a Private, learn from the team, and earn trust through steady contributions."
28. "My tools are ready and my pockets are prepared for responsible treasury deposits. May I join the faction?"
29. "Greetings from a hopeful recruit! I would love to help your members gather more, grow more, and prosper together."
30. "Your faction looks like a fine home for productive adventures. I would be delighted to become part of it."
31. "Hello! I bring patience for cooldowns, excitement for boosts, and a sincere wish to support the team."
32. "I would love to add my name to your roster and my contributions to our future faction victories."
33. "A cheerful hello from your possible newest Private! I am ready to contribute and make myself useful."
34. "Your faction seems to have both style and momentum. I would be thrilled to help with the momentum part."
35. "I am ready to trade the lone road for a shared banner, friendly members, and some excellent teamwork."
36. "Hello, faction leaders! I would love the opportunity to contribute faithfully and grow with your community."
37. "I bring a positive attitude and a strong belief that every good treasury begins with one honest deposit."
38. "Your roster has room, my faction slot is empty, and this feels like the beginning of a splendid partnership."
39. "Greetings! I am hoping to find a faction that values teamwork, steady progress, and the occasional happy boost dance."
40. "I would be pleased to join your faction, support its operations, and help keep the shared economy moving forward."
41. "Hello! I am packed, prepared, and positively delighted by the possibility of joining your faction."
42. "I saw your faction listing and immediately imagined all the excellent progress we could make together."
43. "May I come aboard? I bring helpful hands, careful contributions, and enough optimism to fill a storage shed."
44. "Your faction sounds like a wonderful team. I would love to contribute my effort and share in its adventures."
45. "Hello from a friendly recruit! I am eager to help fund boosts and add another dependable name to the roster."
46. "I am seeking a faction with heart, purpose, and room for one more enthusiastic contributor. Yours looks just right."
47. "Please consider my request to join. I am ready to work hard, contribute fairly, and enjoy the journey together."
48. "A bright hello to the whole faction! I would be delighted to join, contribute, and help our shared banner flourish."

## Shared treasury and boosts

### Deposits

- Every member may deposit a positive whole-number cash amount.
- The server reads the member's authoritative cash balance.
- One successful transaction deducts the cash, credits an equal number of Faction Points, increments the member's contribution, increments the faction's lifetime contribution, and appends ledger and activity entries.
- Funds cannot be withdrawn, reclaimed after leaving, or transferred between factions.
- A failed or retried request cannot duplicate the deposit.

### Boost administration

Sergeants, Lieutenants, and the Leader may manage boosts. The existing five actions, 36 levels, cost curve, fixed-duration mode, and continuous mode remain unchanged.

Every current member receives the effective shared boost immediately. Leaving removes the benefit immediately; joining grants it immediately. No grace period or membership cooldown applies.

Stopping a boost does not refund spent Faction Points. Continuous drain and duration expiration are existing faction mechanics, not new automated player actions. Processing must be deterministic from stored timestamps so a request does not pay twice for elapsed time.

## Leadership, departure, and disbanding

### Promotion and demotion

Every rank change identifies the actor, target, old rank, new rank, and time in the activity feed. The server validates both the actor's current rank and the target's current rank inside the transaction.

### Leadership transfer

- Only the current Leader may initiate a transfer.
- The target must be a current member of the same faction.
- The confirmation names the target and states that the current Leader will become a Lieutenant.
- The transfer changes both ranks and the faction's Leader reference atomically.
- The transfer creates notifications for both players and an activity entry visible to the faction.

### Leaving and removal

- A non-Leader may leave immediately after confirmation.
- An authorized member may remove only a lower-ranked member.
- Leaving or removal cancels that player's pending faction-specific administrative records as applicable.
- Contribution history remains in the ledger, but the former member loses access to private faction data and active boosts immediately.
- Neither path creates a cooldown.

### Disbanding

Only the Leader may disband. Confirmation requires entering the faction name. Disbanding removes all memberships, invalidates invitations and codes, closes join requests, stops boosts, and preserves only the minimum audit records required for integrity. Treasury funds are not refunded or transferred to any player.

## Guest migration and retention

### One-time migration

On the first faction-capable release:

1. Create an anonymous server identity for a guest without presenting an authentication form.
2. Normalize and upload the existing local player save once.
3. If the local save contains a faction, create a shared faction with that guest as its sole Leader.
4. Preserve the faction name, description, treasury balance, lifetime contribution, and active boosts.
5. Record an immutable migration receipt tied to the anonymous identity.
6. Reject every later attempt to repeat the local import.
7. Use only the server-owned player state after migration.

Historic local guest data cannot be cryptographically verified. The one-time import deliberately accepts this transition risk to preserve honest players' progress. The manual states that all later shared-economy values are server-authoritative.

### Inactivity deletion

A guest identity becomes eligible for deletion after 365 complete days without authenticated or anonymous game activity. Successful game API activity refreshes the last-active time. Merely possessing an expired browser session does not refresh it.

A daily maintenance transaction deletes eligible guests, so deletion occurs no earlier than 365 complete inactive days and no later than 366 complete inactive days. Faction access also performs the same idempotent eligibility check before returning data, which prevents an already-eligible abandoned identity from affecting current membership or leadership.

Before deleting an inactive guest:

- Remove ordinary membership and pending invitations or requests.
- If the guest is a Leader, transfer leadership to the highest-ranked remaining member.
- If multiple members share that rank, select the member with the earliest join time.
- If no other member remains, disband the faction.
- Never transfer faction treasury funds into a personal account.

Guest cleanup is operational maintenance, not automated gameplay. Cleanup must be idempotent and produce the appropriate faction activity and member notifications.

The interface and handbook clearly state that an anonymous guest is recoverable only while the browser retains its session. Clearing browser data can make the identity inaccessible immediately, even though the server retains the abandoned record for up to 365 inactive days.

## Interface design

The existing Faction visual language remains in place. New views use native dialogs, semantic CSS tokens, keyboard focus handling, reduced-motion support, and responsive controls consistent with the rest of Bconomy.

### Player without a faction

The Faction page exposes five destinations:

1. **Discover** — searchable public faction directory
2. **Invitations** — pending invitations with Accept and Decline
3. **Join by Code** — code entry and clear validation feedback
4. **Create Faction** — existing creation fields plus membership mode
5. **My Requests** — pending public requests with message preview and Withdraw

### Faction member

The Faction page exposes six destinations:

1. **Overview** — identity, membership mode, current membership out of 20, the viewer's Faction Rank, treasury summary, and active boosts
2. **Members** — searchable rank-sorted roster with username, Player ID, contribution, join date, last-active status, and permitted member actions
3. **Operations** — shared treasury and existing boost controls, gated by Faction Rank
4. **Recruitment** — the controls appropriate to the current membership mode and the viewer's permissions
5. **Activity** — faction administration and economy history
6. **Rank Permissions** — the complete fixed matrix and plain-language explanations

The UI may hide actions that a rank can never perform. When context would otherwise be confusing, it displays the disabled control with a precise permission explanation. The server remains authoritative in both cases.

Destructive and high-authority actions use explicit confirmation dialogs. This includes removals, demotions, code resets, leadership transfer, leaving, membership-mode changes that cancel records, and disbanding.

On narrow screens, administration tables become stacked cards with accessible action menus. No workflow requires horizontal page scrolling. Every dialog restores focus to its initiating control.

## Notifications and privacy

Durable in-game notifications cover:

- Invitations received, accepted, declined, or revoked
- Join requests accepted, rejected, or withdrawn
- Promotion and demotion
- Removal from a faction
- Leadership transfer
- Faction disbanding

Notifications contain usernames and public faction identity only. Member email addresses are never exposed. Join-request messages remain visible only to the applicant and current authorized reviewers. The release does not add general faction chat or direct messaging.

## Errors and recovery

Every failure returns a stable machine-readable code and a concise player-facing explanation. Required cases include:

- Player already belongs to a faction
- Faction is full
- Request or invitation is no longer pending
- Player already has a pending request or invitation
- Five-request limit reached
- Invalid, consumed, or reset code
- Insufficient permission or changed Faction Rank
- Target is not a faction member
- Target rank is not below the actor's rank
- Leader must transfer ownership before leaving
- Insufficient personal cash or Faction Points
- Faction revision changed during review
- Anonymous session is unavailable or expired
- One-time migration was already completed

After a stale-data response, the client refreshes the faction view and preserves safe unsent form text where possible. A network failure never reports success until the server confirms the transaction. Retrying with the same command ID returns the original result without repeating the mutation.

## Handbook requirements

The searchable Help handbook in `public/js/helpTopics.js` adds clear, grammatically correct topics for:

- Multiplayer faction overview and the 20-member limit
- Creating a faction
- Invite-only membership
- One-time, non-expiring codes
- Public listings and join requests
- Generated, editable join-request messages
- All five Faction Ranks and their fixed permissions
- Promotions, demotions, removals, and leadership transfer
- Shared deposits, the treasury ledger, and shared boosts
- Leaving and disbanding
- Guest identities, local-session loss, and 365-day inactivity deletion
- Existing-faction and guest-save migration

Every use of "rank" in faction documentation is written as "Faction Rank" unless the context cannot be confused with career progression. Documentation describes visible rules and outcomes without exposing secrets, code hashes, internal authorization details, or hidden economic formulas.

## Migration and compatibility

- Add the shared faction schema before enabling the new client.
- Convert every existing signed-in faction into one shared faction whose current player is Leader.
- Preserve its name, description, treasury, lifetime contribution, and active boosts.
- Convert each guest faction during that guest's one-time anonymous migration.
- Remove the embedded faction object from the canonical player-state schema after successful migration.
- During a bounded compatibility window, read legacy embedded faction data only through the idempotent migration path; never use it as live shared state.
- Existing solo engines continue to receive an effective faction multiplier through an explicit server-provided input rather than reading browser faction state.
- Update the game API, release notes, comprehensive documentation, player-facing Help, and displayed version consistently.

## Verification

### Database and service tests

- Exactly one faction membership per player
- Exactly one Leader per faction after every operation
- 20-member limit under simultaneous acceptance and code redemption
- Fixed permission boundary for every actor rank and target rank
- Promotion, demotion, and ownership-transfer invariants
- Atomic personal-cash and shared-treasury deposits
- Simultaneous deposits and boost spending
- Idempotent retries for every mutation
- One-time, non-expiring code use and manual reset
- Public request limits, duplicate prevention, withdrawal, acceptance, and cancellation after joining
- Invitation acceptance, decline, revocation, and full-faction behavior
- Guest state migration can run exactly once
- Registered-account upgrade preserves the anonymous identity's faction data
- Guest cleanup at 365 complete inactive days and not before
- Deterministic inactive-Leader succession
- Shared boost application and removal on join or departure

### Message tests

- The pool contains at least 40 complete messages; the initial target is 48
- Every default message is nonempty and no longer than 200 Unicode characters
- Every message is a complete, grammatically correct sentence or group of sentences
- Shuffle bags do not repeat an ID until the pool cycles
- Regenerate preserves an edited message until replacement is confirmed
- Submitted edits are trimmed, normalized, length-checked, stored safely, and escaped when rendered

### Client tests

- Correct member and non-member destinations
- Correct controls for every Faction Rank and membership mode
- Directory search and full-faction state
- Request composer generation, editing, regeneration, counter, submission, and withdrawal
- Member roster sorting, search, contextual actions, and permission explanations
- Confirmation wording for rank changes, code reset, transfer, departure, mode change, and disbanding
- Durable notification rendering and read state
- Keyboard operation, focus restoration, reduced motion, and accessible names
- Responsive behavior down to the repository's supported 360-pixel width

### Regression and editorial review

- Run the complete existing automated test suite.
- Add shared-faction integration coverage without weakening solo-engine tests.
- Smoke-test registered and anonymous player flows in two independent browser sessions.
- Verify simultaneous member actions against the deployed database transaction functions.
- Review every new interface string and handbook topic for accuracy, clarity, ambiguity, spelling, and grammar before release.

## Release acceptance criteria

The feature is ready only when:

- Two independent players can join the same faction and observe the same treasury, roster, and boosts.
- All three membership modes work exactly as specified.
- The complete fixed Faction Rank permission matrix is enforced by the server.
- Leadership can be transferred without producing zero or multiple Leaders.
- Twenty is a hard concurrency-safe member limit.
- Every member can deposit, and authorized ranks can spend shared Faction Points on existing boosts.
- Public join requests always begin with a fresh editable message from a pool of at least 40 and support regeneration.
- Registered and guest players can use the system without guest-facing sign-in requirements.
- Existing factions and guest saves migrate through their approved paths.
- The 365-day guest-retention rule and all faction features are documented in the Help handbook.
- No achievements, lotteries, quests, general messaging, or automatic gameplay systems have been added.
- All new and existing tests pass, and the new player-facing copy passes editorial review.
