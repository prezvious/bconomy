# Bconomy Release Notes

Personal game updates, changelogs, and version history.

---

## [v4.1.0] — 2026-08-29

### Added
- **Progression Rules API & Authoritative Previews**:
  - Added `GET /api/data/progression-rules` publishing game advancement constraints (`maxTargetedTierAdvance: 3000`).
  - Added structured preview status feedback (`READY`, `INSUFFICIENT_CASH`, `ALREADY_REACHED`) with exact next-tier costs and remaining deficit calculations.
- **Player Identity Recovery Protocol**:
  - Added seamless guest session recovery with automatic snapshot migration, preserving local device progress across expired guest tokens.
  - Added registered account identity recovery banner (`#identity-recovery-notice`) with state caching and sign-in recovery prompts, preventing registered progress from being overwritten or downgraded to guest accounts.

### Changed
- **Server-Authoritative Developer Command Security**:
  - Promoted `dev.setCash` and `dev.addCash` to canonical developer commands, secured by a fail-closed master switch (`BCONOMY_DEV_COMMANDS=true`).
  - Implemented request-level authorization allowing direct local development (loopback address, localhost host header, no proxy-forwarding headers) and remote/production actor authorization via `BCONOMY_DEV_USER_IDS` allowlists.
  - Proxy-forwarded requests now automatically deny dev command execution unless explicitly allowlisted by UUID.
  - Replaced duplicate client-side rank advancement calculations with authoritative backend previews.

### Deprecated
- `player.setCash` and `player.addCash` command names are deprecated and will be removed in a future release; use `dev.setCash` and `dev.addCash`.
- `ALLOW_DEV_COMMANDS` environment variable is deprecated; use `BCONOMY_DEV_COMMANDS`.

### Fixed
- **Rank Advancement & Ascension Edge Cases**:
  - Enforced free Tier 0 God ascension (Tier 0 to Tier 1 Rank 0) while properly charging ascension fees on Tier 1+.
  - Hardened targeted rank advancement against invalid, negative, or non-finite inputs (`INVALID_TARGET`, `TARGET_TIER_OUT_OF_RANGE`).
  - Added field validation error display (`#targeted-tier-error`) in targeted rank-up dialog.
- **Perk Simulator Null-Safety**:
  - Added default target initialization and null-safety guards across all Perk Simulator allocation sliders and preview routines.

---

## [v4.0.1] — 2026-08-29

### Fixed
- **Targeted Rank Advancement Indexing**:
  - Corrected `newRank` return value in `RankPrestigeEngine.targetedRankUp` to return the 1-based rank number (e.g. Rank 81 Legate) instead of the internal 0-based array index.
- **Targeted Rank Modal Feedback & Accessibility**:
  - Refined modal messaging when player has reached peak rank (Rank 107 God), has insufficient funds in Next or Max Affordable modes, or has already reached the target tier/rank in Custom mode.
  - Dynamically updated confirmation button labels to "Insufficient Funds" or "Already Reached" with appropriate disabled states.
  - Improved keyboard accessibility and dialog focus restoration to return focus to the triggering element (action button or header rank tracker).

### Improvements
- **Defensive Player State Normalization**:
  - Added centralized `normalizeStateInvariants` ensuring cash balance is clamped to `[0, Number.MAX_SAFE_INTEGER]`, rankIndex is clamped to valid bounds `[0, 106]`, prestige points and count are non-negative integers, and nested state objects (`perks`, `inventory`, `tools`, `cooldowns`) are initialized with valid structures.
  - Hardened header stats and deficit tracker against uninitialized rank metadata or legacy save formats.

### Developer Tooling & API
- **Development Mode Cash Commands**:
  - Added typed server-authoritative `player.setCash` and `player.addCash` (with `dev.setCash` / `dev.addCash` aliases) commands guarded by server dev mode checks (`NODE_ENV !== 'production'` or `ALLOW_DEV_COMMANDS=true`).
  - Added `devMode` status flag to `/api/config/auth`.
  - Updated browser console helpers `window.setCash` and `window.addCash` to route through typed game command gateways when signed in or playing as guest.

---

## [v4.0.0] — 2026-08-29

### Added
- **Multiplayer factions**:
  - Added shared factions for up to 20 players, with exactly one Leader-owner and the fixed Faction Ranks Private, Corporal, Sergeant, Lieutenant, and Leader.
  - Added Invite-only, Code-only, and Public-request membership modes, searchable public listings, invitations, join-request review, member removal, rank changes, ownership transfer, departure, and disbanding.
  - Added one-time join codes that never expire by time, are shown once after generation, are stored only as hashes, and become invalid after one successful redemption or an authorized reset.
  - Added 48 cheerful default join-request messages delivered through a per-player shuffle bag. Every request starts with a new message that can be edited or regenerated before sending.
- **Shared faction economy**:
  - Added irreversible one-to-one cash deposits from every member into a shared Faction Point treasury.
  - Added shared fixed-duration and continuous action boosts for Mining, Exploring, Hunting, Fishing, and Work, plus a treasury ledger, activity history, notifications, and lifetime contribution totals.
- **Guest multiplayer identities**:
  - Added automatic anonymous guest identities so players can use factions without first signing in or creating an account.
  - Added same-identity guest account upgrades that preserve solo progress, Player ID, and faction membership.
  - Added 365-day inactivity cleanup with deterministic Leader succession to the highest-ranked, earliest-joined eligible member.

### Changed
- Player-state schema version 2 removes client-owned faction data. Faction membership, recruitment, ranks, treasury, boosts, codes, activity, and notifications now live in server-authoritative PostgreSQL records.
- Game actions resolve the acting player's current shared faction multiplier on the server. All non-faction game systems remain solo.
- Expanded the searchable in-game handbook from 49 to 59 topics with complete faction and guest-retention guidance.

### Security and Integrity
- Added Row Level Security to every shared faction table and restricted all faction reads and writes to service-only validated functions.
- Added revision checks, idempotent command receipts, rate limits, hash-only access-code storage, transactional capacity checks, and deferred enforcement of one Leader-owner and the 20-member maximum.
- Added one-time legacy migration for existing local factions and device guest saves; migration removes the obsolete local faction field only after shared import completes.

### Breaking Changes
- Multiplayer factions require a configured Supabase project with anonymous sign-ins enabled and the v4.0.0 schema applied before the application is deployed.
- The former singular `/api/faction/*` local-state endpoints and faction commands in the general game gateway are removed. Clients must use `/api/factions/queries` and `/api/factions/commands` with a registered or anonymous bearer identity.

## [v3.2.0] — 2026-08-25

### Added
- **Career and prestige planning**:
  - Added a live next-rank deficit tracker in the global header and authoritative Next, Max Affordable, and Custom rank previews.
  - Added an interactive Prestige & Perk Simulator for current, next-ascension, and future-hypothetical point budgets with weighted recommendations, manual allocation, exact effect deltas, and atomic Ascend & Apply.
  - Added exact Max Affordable tool upgrades with cumulative material totals and next-level blockers.
- **Shop and booster ergonomics**:
  - Added a persistent restock wishlist with listing highlights, wishlist-only filtering, and configurable newly-available, every-restock, or once-per-membership alerts.
  - Added configurable sell-price percentage badges and color progress bars calculated from each authoritative `[s_min, s_max]` range.
  - Added Extend All Active Boosters with an exact review plan and atomic inventory consumption.
- **Inventory organization**:
  - Added universal item locking and favoriting independently of item ownership.
  - Added checkbox selection, Shift-range selection, optional lasso selection, and a sticky batch toolbar for lock, unlock, favorite, unfavorite, and sell handoff actions.
- **Crafting navigation**:
  - Added Where Is This Used reverse lookup with direct consumers and downstream dependency paths.
  - Added inline Craft Max Affordable results for Direct and Recursive modes.
  - Added one-click direct crafting of missing intermediate inputs while preserving parent-recipe context.

### Changed
- Introduced canonical item metadata and versioned player-state normalization with automatic legacy pinned-item migration.
- Routed browser game queries and mutations through versioned, typed `/api/game/queries` and `/api/game/commands` gateways.
- Signed-in commands now use verified bearer tokens, optimistic state revisions, idempotent command receipts, and explicit cloud-versus-device reconciliation.

### Security
- Removed unsafe email-discovery and full-state sync behavior; obsolete endpoints now return `410 Gone`.
- Supabase credentials are environment-only. Rotate any credential that appeared in repository history before deploying this release.

---

## [v3.1.1] — 2026-08-24

### Changed
- Replaced the oversized, horizontally scrolling phone navigation with a fixed five-destination bar for Actions, Farm, Inventory, Crafting, and More.
- Added a compact, accessible More sheet for Shop, Tools, Rank & Ascension, Gambling, Faction, and Settings while preserving the full desktop sidebar.

### Fixed
- Reflowed narrow gathering cards so action buttons, cooldown progress, Ready states, and Work streak details stay within their cards.
- Stacked Crop Storage claim controls when necessary and constrained narrow flex and grid children to prevent page-level horizontal overflow.

---

## [v3.1.0] — 2026-08-24

### Added
- **Customizable keyboard controls**:
  - Added 18 remappable shortcuts covering all main sections, Mine, Explore, Hunt, Fish, Work, contextual Help, Console command entry, and theme switching.
  - Added searchable Controls & Commands settings with key-chord capture, conflict swapping, unbinding, individual resets, full resets, and browser-local persistence.
  - Added accessible shortcut annotations while suppressing global shortcuts during text entry, IME composition, key repeat, and open dialogs.
- **Customizable slash commands**:
  - Added editable primary names and up to five aliases for every existing Console command.
  - Preserved canonical commands and built-in aliases as permanent recovery names.
  - Added keyboard-operated autocomplete; Enter or Tab completes the selected command before a second Enter runs it.
- **Contextual and full Help**:
  - Added Help immediately before Console in the bottom-right utility dock.
  - Added section- and subfeature-aware Help that follows the player's current workflow.
  - Added a searchable, categorized 49-topic handbook opened through Browse all topics or `/help`.

### Changed
- Unified Help and Console into a switchable desktop rail and responsive drawer that remembers its open state while starting in Console mode.
- Added mobile safe-area placement, 44-pixel compact touch targets, focus restoration, current hotkey and command references, contextual page titles, and spoiler-safe player-facing Help copy.

### Fixed
- Improved the Crafting landing layout and bounded sidebar scrolling on shorter displays.
- Made long Crafting detail views vertically scrollable so recipes, plans, and controls remain reachable.

---

## [v3.0.0] — 2026-08-24

### New Features
- **Large-scale realistic crafting catalog**:
  - Added 450 general-purpose raw materials and 216 craftable products across 18 practical domains.
  - Added 130 intermediate components, 86 finished products, 10 legacy derived components, and 15 socket modules.
  - Every entry includes an explicit unit, acquisition route, rarity, practical description, and bill of materials.
- **Direct and recursive crafting**:
  - Direct mode consumes only the listed inputs.
  - Recursive mode expands missing crafted inputs into an authoritative dependency plan, consuming owned intermediates before making more.
  - Preview and execution share one planner, with atomic execution, shortage reporting, surplus accounting, maximum-run calculation, and locked-item protection.
- **Three crafting interfaces**:
  - Standard master/detail, Compact expandable cards, and Super Compact virtualized rows.
  - Added search, filters, sorting, persistent view preferences, responsive details dialogs, and accessible operation feedback.
- **Shared quantity presets**:
  - Added editable `1 / 10 / 100 / 1000 / Max` defaults with global, system, and item-level inheritance.
  - Integrated the same controls and confirmation policies into crafting, shop buying, shop selling, booster activation, socket-module crafting, tool upgrades, and perk upgrades.

### Improvements
- Successful Mine, Explore, Hunt, and Fish actions now award 8–15 distinct new material stacks using weighted sampling without replacement.
- New crafting materials remain separate from shop inventory and transmutation while remaining available to facilities, tools, buildings, and future systems through the shared inventory model.
- Added generated catalog and implementation documentation, API coverage, catalog invariant tests, planner tests, drop-distribution tests, preset tests, and UI contract tests.

### Safety and Integrity
- Crafting previews never mutate state, and failed executions cannot consume partial inputs.
- Locked inventory entries are never counted as available and cannot be consumed by direct or recursive crafting.
- Catalog validation rejects duplicate IDs, unresolved inputs, cycles, quota drift, unreachable materials, and intermediates with no downstream consumer.

---

## [v2.0] — 2026-08-23

### New Features
- **Smart Adaptive Multi-Unit Duration Conversion**:
  - Long booster and cooldown timers automatically convert into readable breakdowns across years (`y`), months (`mo`), weeks (`w`), days (`d`), hours (`h`), minutes (`m`), and seconds (`s`).
  - 5 configurable breakdown styles: **Smart Adaptive** (top 3 units, e.g. `371y 7mo 1w`), **Compact Adaptive** (top 2 units), **Full Breakdown** (all units), **Days & Hours**, and **Raw Hours**.
  - Multi-million hour timers are cleanly formatted without cluttering the interface.
- **In-Place Timer Hover Expiration Conversion**:
  - Hovering over active booster and faction timers dynamically swaps the countdown in-place with its calculated calendar expiration timestamp (`dd/mm/yyyy HH:mm:ss`).
  - 9 supported date formats (`DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY`, `YYYY-MM-DD`, `YYYY/MM/DD`, `MM/DD/YYYY`, `D MMM YYYY`, `MMM D, YYYY`, `Day, D Month YYYY`).
  - 5 supported time styles (`24-Hour`, `24-Hour Short`, `12-Hour`, `12-Hour Short`, `Date Only`).
  - Device Local Timezone and UTC support.
- **Interactive Release Notes Modal**:
  - Accessible directly from the **Bconomy v2.0** button in the sidebar footer.
  - Searchable changelogs with instant version filtering.

### Improvements
- **Display & Timers Preferences Card**:
  - Added personalizable duration style, date format, time format, and timezone options with interactive live preview pill in Settings.
- **Bulk Booster Integration**:
  - Standardized duration deltas and projected expiration dates across the Bulk Booster activation table.

### Bug Fixes
- **Booster Bulk Delta Formatting**:
  - Prevented phantom `+Expired` text when adding 0-quantity boosters, accurately displaying `+0s`.

---

## [v1.4] — 2026-08-23

### Improvements
- **Shop Engine Calculations**:
  - Optimized bulk buy equal-distribution strategy across inventory catalog.
  - Clamped large cash balances safely and removed negative signs on projected purchase costs.
- **Rank & Ascension Scaling**:
  - Preserved cash balance on ascension leaps and optimized multi-tier calculations for multi-quadrillion balances.

---

## [v1.3] — 2026-08-23

### New Features
- **Player Account Profile Modal**:
  - Inspect verified Player ID (`#1`, `#2`, ...), Guild Master username, linked email, and account status.
  - Integrated direct sign out and profile management.
- **Stat Folio Header Redesign**:
  - Upgraded top bar with clean rectangular cards, tabular numeric typography, and responsive single-bar layout.

---

## [v1.2] — 2026-08-22

### New Features
- **Cloud Authentication & Sync**:
  - Integrated Supabase authentication with email & password accounts and cloud vault backup.
  - Assigned sequential integer Player IDs (`#1`, `#2`, `#100`) on signup.
- **Dynamic Name Generator & Password Strength Meter**:
  - Comprehensive English dictionary word bank generating single-word and fantasy guild master usernames.
  - Interactive password meter checking length, numbers, symbols, and mixed case with visual segments.

---

## [v1.1] — 2026-08-21

### New Features
- **Level 500 Tools & Socket Overclocking**:
  - Procedural gathering recipes scaling up to Level 500 with up to 10 Chrono Module sockets and cooldown reduction.
  - Bulk tool upgrading with atomic transaction safety.
- **Farm Abundance & Multi-Cycle Yields**:
  - Water Abundance leveling up to Level 10 multiplying yield bonuses and byproducts across accelerated cycles.
- **Toast Notification Coalescing**:
  - Grouped repeated alerts into pulse badges, added category filtering, and introduced quiet minimal density mode.

---

## [v1.0] — 2026-08-20

### New Features
- **Initial Game Launch**:
  - Primary actions: Mine, Explore, Hunt, and Work with stamina/cooldown engines.
  - Farm plot management with crops, watering cycles, and plot level upgrades.
  - Shop buy/sell with restock intervals, markup formulas, and loot booster multipliers.
  - Rank progression, ascension prestige perks, gambling games (Coinflip, Slots), and Guild Factions.
