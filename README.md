# Bconomy

A persistent text-based economy and incremental game engine built with Node.js, Express, and a responsive single-page web client.

---

## Overview

**Bconomy** is a modular web-based economy game where players participate in various activities to gather resources, earn currency, progress through career ranks, unlock prestige perks, and manage a farm. The project pairs a lightweight Node.js/Express backend with a static web client front-end.

---

## Features

- **Resource Gathering** — Mine, explore, hunt, and fish to collect items and materials.
- **Tool Progression** — Upgrade gathering tools to improve efficiency and unlock better results.
- **Career Ranks** — Advance through economic ranks with scaling requirements.
- **Prestige System** — Reset progression to earn prestige points and unlock permanent perks.
- **Farming** — Plant crops on expandable plots, mark reusable plot selections, bulk-upgrade all, typed, or marked plots through Level 16, accelerate every active plot with global watering, and manage harvests through Crop Storage & Logistics.
- **Inventory & Item Details** — Search, filter, sort, switch between regular and compact item-card grids, and activate owned boosters in one atomic bulk action.
- **System Shop** — Buy rotating stock, sell inventory, activate boosters, and preview atomic bulk trades.
- **Factions** — Create a faction, fund its treasury, and configure duration or continuous action multipliers.
- **Gambling** — Play coinflip and slots modes with server-validated wagers.
- **Display Preferences** — Choose no number prefix (the default) or named values, plus dense, balanced, or comfortable interface sizing.
- **REST API** — Modular API layer enabling front-end interactions and state synchronization.

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

### Testing

```bash
npm test
```

The test runner discovers CommonJS and ES-module suites in `tests/`, including engine, API, UI rendering, dialog, preference, responsive-contract, and regression coverage.

### Client preferences

Display, notification, and bulk-action preferences are stored locally under `bconomy_user_settings`; they do not mutate the player economy state. The Number Prefix setting defaults to **No prefix**, which displays complete comma-separated values. **Value names** renders `thousand` through `quintillion` with two decimal places while exact values remain available in editable fields and contextual tooltips.

Bulk Buy, Bulk Sell, bulk Tool upgrades, bulk Perk upgrades, and Bulk Booster Activation show an itemized preview by default. The global `bulkActions.skipAllPreviews` preference or an action-specific “Don’t show this preview again” choice can suppress those previews without hiding required configuration dialogs. Resetting ignored confirmations clears action-specific suppressions. `inventory.showUnavailableBoosterAction` controls whether the disabled Inventory booster action remains visible when no usable boosters are owned.

All application pop-ups use the shared native `<dialog>` controller. Transactional dialogs require an explicit action or cancellation, while passive item details may close from the backdrop. Escape and focus restoration are handled consistently.

### Farm management

The Farm **Manage** dialog keeps free Plant All controls on its default **Plant Seeds** tab and provides mandatory-preview bulk upgrades on **Upgrade Plots**. Bulk targets can include every plot, a typed expression such as `1, 3, 5-8`, or the persistent marked set. Marks are stored with player farm state until cleared. Material allocation repeatedly favors the lowest projected plot level and then the lowest plot number, while unaffordable targets do not block other affordable upgrades.

---

## Project Structure

```
bconomy/
├── server.js            # Express application entry point
├── src/
│   ├── engine/          # Core game logic modules
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
