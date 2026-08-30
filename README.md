# Bconomy

A persistent text-based economy and incremental game engine built with Node.js, Express, and a responsive single-page web client.

---

## Overview

**Bconomy** is a modular web-based economy game where players participate in various activities to gather resources, earn currency, progress through career ranks, unlock prestige perks, and manage a farm. The project pairs a lightweight Node.js/Express backend with a static web client front-end.

---

## Features

- **Resource Gathering** — Mine, explore, hunt, and fish to collect items and materials.
- **Tool Progression** — Upgrade gathering tools to improve efficiency, inspect exact recipe blockers, and jump to the maximum affordable level.
- **Career Ranks** — Track the live next-rank deficit and preview next, maximum affordable, or custom advancement targets.
- **Prestige System** — Simulate and optimize staged perk allocations before spending current points or atomically ascending and applying a plan.
- **Farming** — Plant crops on expandable plots, mark reusable plot selections, bulk-upgrade all, typed, or marked plots through Level 16, accelerate every active plot with global watering, and manage harvests through Crop Storage & Logistics.
- **Inventory & Item Details** — Lock or favorite any owned type, batch-select with checkboxes, Shift ranges, or lasso movement, and hand selected items to bulk selling.
- **Realistic Crafting** — Gather 450 general-purpose raw materials, build 216 products through direct or recursive atomic recipes, inspect reverse dependencies, craft exact maximums, and fill direct intermediates in place.
- **System Shop** — Wishlist restock targets, read configurable sell-roll indicators, preview atomic bulk trades, and extend every active booster from one review.
- **Multiplayer Factions** — Join up to 20 players through invitations, one-time codes, or public requests; delegate fixed Faction Ranks; share a treasury and action boosts; and transfer faction ownership safely.
- **Gambling** — Play coinflip and slots modes with server-validated wagers.
- **Display Preferences** — Choose number formatting and interface density, then configure shared quantity presets globally, per system, or for an individual item.
- **Keyboard Controls** — Use or remap 18 shortcuts for navigation, core actions, contextual Help, Console entry, and theme switching.
- **Contextual Help & Commands** — Follow section-aware Help, search the full 59-topic handbook, and personalize every existing Console slash command with aliases and autocomplete.
- **Versioned Game API** — Typed, server-authoritative queries and idempotent commands with normalized state, authenticated revisions, and conflict-safe persistence.

---

## Tech Stack

| Layer       | Technology             |
| :---------- | :--------------------- |
| **Runtime** | Node.js                |
| **Server**  | Express                |
| **Client**  | HTML, CSS, JavaScript  |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v7 or later

### Installation

```bash
git clone https://github.com/prezvious/bconomy.git
cd bconomy
npm install
```

### Running

```bash
npm start
```

The server starts at `http://localhost:3000`.

Developer cash commands are disabled by default. For direct local testing, set `BCONOMY_DEV_COMMANDS=true`; remote use additionally requires the authenticated UUID in `BCONOMY_DEV_USER_IDS`. See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete authorization matrix. `dev.setCash` and `dev.addCash` are canonical; the older `player.*` names are deprecated compatibility aliases for one release.

### Testing

```bash
npm test
```

The test runner discovers CommonJS and ES-module suites in `tests/`, including engine, API, UI rendering, dialog, preference, responsive-contract, and regression coverage.

### Client preferences

Display, notification, control, command, utility-rail, and bulk-action preferences are stored locally under `bconomy_user_settings`; they do not mutate the player economy state. The Number Prefix setting defaults to **No prefix**, which displays complete comma-separated values. **Value names** renders `thousand` through `quintillion` with two decimal places while exact values remain available in editable fields and contextual tooltips.

Quantity-enabled systems resolve four editable values plus an immutable **Max** action through global → system → item inheritance. The default values are 1, 10, 100, and 1000. Preview policy can be set to every operation, recursive only, large quantities only, or never; the global `bulkActions.skipAllPreviews` option remains the final override. `inventory.showUnavailableBoosterAction` controls whether the disabled Inventory booster action remains visible when no usable boosters are owned.

Quality-of-life preferences also control inventory lasso and Shift-range selection, restock-wishlist alert frequency, sell-roll thresholds/colors/display, and prestige-simulator defaults. These interface preferences remain local; lock, favorite, and wishlist membership live in the normalized player save.

All application pop-ups use the shared native `<dialog>` controller. Transactional dialogs require an explicit action or cancellation, while passive item details may close from the backdrop. Escape and focus restoration are handled consistently.

### Controls, commands, and Help

The default navigation shortcuts are `1` through `0` in sidebar order. Mine, Explore, Hunt, Fish, and Work use `M`, `E`, `H`, `F`, and `W`; contextual Help uses `?`, Console command entry uses `/`, and theme switching uses `T`. Every shortcut can be rebound to a unique key or chord, cleared, swapped on conflict, or reset from **Settings → Controls & Commands**. Global shortcuts pause while typing or while a dialog is open.

Every existing Console command can have a custom primary name and up to five aliases. Canonical names always continue to work. Type `/` to browse autocomplete suggestions; Enter or Tab completes a selection, and a following Enter executes it. `/help` opens the full handbook.

The bottom-right utility dock places **Help** before **Console**. Help follows the active section and supported subfeature. **Browse all topics** opens a searchable, categorized handbook while preserving the previous rail, scroll, and focus state when returning to the game.

### Farm management

The Farm **Manage** dialog keeps free Plant All controls on its default **Plant Seeds** tab and provides mandatory-preview bulk upgrades on **Upgrade Plots**. Bulk targets can include every plot, a typed expression such as `1, 3, 5-8`, or the persistent marked set. Marks are stored with player farm state until cleared. Material allocation repeatedly favors the lowest projected plot level and then the lowest plot number, while unaffordable targets do not block other affordable upgrades.

### Crafting

Successful Mine, Explore, Hunt, and Fish actions award 8–15 distinct material stacks selected without replacement from that action's source pool. New crafting stock is excluded from shop listings and transmutation. The Crafting workspace provides Standard, Compact, and Super Compact views with persisted filters and sorting.

Direct mode consumes only owned recipe inputs. Recursive mode plans and produces missing craftable prerequisites from atomic raw stock, consumes owned intermediates before newly produced ones, and commits the entire plan only when every dependency is available. Locked item types are never consumed. See `docs/crafting-system.md` for the operational guide and `docs/crafting-catalog.md` for the complete generated catalog.

### Player state and API

When Supabase is configured, Bconomy creates an anonymous guest identity automatically. Guest and registered commands carry a verified bearer token, expected state revision, and unique command ID; Supabase commits them atomically and replays duplicate receipts without applying effects twice. A one-time migration imports the existing device save and any legacy local faction. Creating an account upgrades the same guest identity, so its Player ID, solo progress, and faction membership remain intact.

Faction data is deliberately absent from player-state schema version 2. It is stored in shared, server-authoritative tables so every member sees one roster, treasury, boost state, and activity history. Guest identities and their memberships are deleted after 365 days without activity; if an inactive guest was the Leader, ownership passes to the highest-ranked remaining member, with earlier join time breaking a tie. See [docs/GAME_API_V1.md](docs/GAME_API_V1.md) for solo transport, [docs/GAME_API_V2.md](docs/GAME_API_V2.md) for faction transport, [docs/FACTIONS.md](docs/FACTIONS.md) for faction rules, and [DEPLOYMENT.md](DEPLOYMENT.md) for schema and credential requirements.

---

## Project Structure

```
bconomy/
├── server.js            # Express application entry point
├── src/
│   ├── engine/          # Core game logic modules
│   ├── api/             # Typed game command/query gateway
│   ├── data/            # Canonical item registry
│   ├── state/           # Player-state schema normalization
│   └── utils/           # Shared utility functions
├── public/              # Static web client
│   ├── index.html
│   ├── style.css
│   └── js/              # Client-side scripts
├── tests/               # Automated test suite
└── package.json
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
