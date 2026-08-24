# Bconomy Quality-of-Life Program Design

## Delivery

Ship the approved work as one implementation program with four dependency-ordered feature groups: state authority and inventory, shop and boosters, crafting, then career/prestige/tools. The published release may combine the groups when all are complete, but the code boundaries and validation gates remain independently testable.

## State and API foundation

- Normalize every save through a versioned player-state schema. Migrate valid owned `pinnedItems` to visual-only `favoriteItems`, retain `lockedItems` as the universal protection list, and keep `shopWishlist` independent of ownership.
- Build one canonical item registry for shared inventory, farm, shop, booster, tool-module, and crafting catalog items. Lock/favorite actions operate only on currently owned shared-inventory items; flags are cleared when quantity reaches zero.
- Route game behavior through typed domain commands and read-only queries. Signed-in commands use bearer ownership, server-loaded canonical state, monotonic revisions, compare-and-swap persistence, and idempotency keys. Guests pass an explicit local-state envelope through the same handlers.
- Keep existing feature routes as deprecated v3 adapters. Remove unsafe cross-user profile/state writes and public email disclosure.
- Rotate the exposed Supabase service credential, remove hardcoded service-secret fallbacks, add database revision/idempotency support, and make cloud/device save replacement explicit at sign-in.

## Inventory, shop, and boosters

- Rename Pins to Favorites without changing protection semantics. Add inline Lock/Favorite controls and a Select mode with accessible checkboxes, desktop lasso, Shift-range selection, hidden-selection counts, and a sticky batch toolbar for selling and organization.
- Add a cloud-synced wishlist over every known item. Shop matches remain in their familiar positions but receive strong highlighting, a match count, and a Wishlist-only filter. In-app restock alerts support newly available, every matching restock, and once-per-membership modes.
- Show Sell Market range position as an accessible badge/progress bar. Default bands are Terrible below 50%, Medium from 50% through 79%, and Great at 80% or higher; display, thresholds, and semantic colors are browser settings.
- Add Extend All Active to Shop and Actions booster summaries. It previews active T1-T6 slots, consumes all unlocked matching owned boosters, reports skips and projected expiries, then recomputes and commits atomically.

## Crafting

- Generate direct and transitive reverse-use indexes from the validated recipe catalog. Expose Where Is This Used from Inventory and Crafting, with cycle-safe expansion and navigation that clears only filters hiding the chosen recipe.
- Resolve Direct and Recursive maximum craft counts inline, including output and next-run blockers. Cache by recipe, mode, catalog version, and state revision; execute with the symbolic `max` request so the server always recomputes.
- In Direct mode, let a player craft the exact missing amount of an intermediate without leaving the parent when immediate inputs are available. Otherwise navigate to that intermediate and preserve a session back-to-parent stack; never switch modes implicitly.

## Career, perks, and tools

- Put a live next-rank deficit/ready tracker in the header. At God it becomes the ascension deficit. Its modal supports Next, Max Affordable, and Custom Target using server previews.
- Embed a session-only perk simulator with Current, Next Ascension, and Future budgets. Current allocations apply atomically; Next can atomically ascend under existing rules and apply the allocation; Future is informational.
- Provide editable manual allocations and a deterministic weighted optimizer over Career, Actions/Loot, Farming, and Gambling, with optional per-perk weights. Score normalized engine-effect deltas, exclude the nonfunctional Backchannel perk, and label recommendations as weighted guidance rather than economic guarantees.
- Upgrade tool Max Affordable previews to show reachable level, levels gained, cumulative costs, first blocking level, shortages, and locked quantities before revalidated execution.

## Defaults and constraints

- Ascension deducts its fee, preserves remaining cash and all non-rank progression, resets rank to Peasant, increments tier, and awards five Prestige Points.
- Favorites never protect items. Item transfer, farm-storage locking, installed-module locking, OS notifications, and per-item sell-roll settings are out of scope.
- Interface settings remain browser-local; wishlist membership is player state. The simulator defaults to Next Ascension, five future ascensions, and balanced goal weights.
- Preserve the current responsive visual language, semantic CSS tokens, Lucide iconography, keyboard focus behavior, reduced-motion support, and non-color status labels.

## Verification and rollout

- Preserve all existing tests and add engine, API, migration, conflict/idempotency, settings, DOM contract, keyboard/pointer, responsive, and accessibility coverage for every new behavior.
- Publish only after a clean full test run and runtime smoke tests for guest and signed paths.
- Treat the database migration and credential rotation as a write-maintenance deployment gate. Use a verified restore point and forward recovery; never restore the insecure write path.
- Update package/UI/release-note versions consistently, write user-facing release notes, create the release commit, and push `main` without rewriting history.
