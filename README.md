<<<<<<< HEAD
# bconomy
Not available.
=======
# Bconomy Economy Game Engine

A persistent text-based economy and incremental game engine built with Node.js, Express, and a responsive single-page web client interface.

---

## 🌟 Overview

**Bconomy** is a modular web-based economy game where players participate in various economic activities to gather resources, earn currency, advance through career ranks, unlock powerful prestige perks, and manage agricultural plots.

The project features a lightweight Node.js/Express backend service powering game logic, state management, and real-time activity interactions, paired with a web client.

---

## ✨ Key Features

- ⛏️ **Resource Gathering & Activities**: Mine, explore, hunt, and fish to collect valuable resources and items.
- 🛠️ **Tool Progression System**: Craft and upgrade tools to enhance activity results and efficiency.
- 📈 **Career Ranks & Escalation**: Progress through economic ranks with scaling costs and prestige potential.
- ✨ **Prestige & Perks System**: Reset rank progression to earn prestige points and unlock permanent account-wide perks.
- 🌾 **Farming Operations**: Plant, water, fertilize, and harvest multiple crop types across expandable farming plots.
- 🌐 **Modular REST API**: Complete API coverage allowing state synchronization and modular front-end integrations.

---

## 🏗️ Architecture Overview

The system is structured into cleanly separated modules:

```
┌────────────────────────────────────────────────────────┐
│               Web Frontend Client                      │
│        (HTML, Static Assets, Component UI)             │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST API
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Express Server                       │
│                     (server.js)                        │
└──────────────────────────┬─────────────────────────────┘
                           │ Game Logic Execution
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Core Game Engine                     │
│  - Action Engine    (Gathering & Work logic)           │
│  - Tool Engine      (Crafting & Upgrade logic)         │
│  - Rank & Prestige  (Progression & Ascension logic)    │
│  - Farm Engine      (Crop lifecycle & Plot logic)      │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16.x or later recommended)
- **npm** (v7.x or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/prezvious/bconomy.git
   cd bconomy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Development / Production Server

Start the Node.js server:

```bash
npm start
```

Or for development mode:

```bash
npm run dev
```

By default, the server runs at `http://localhost:3000`.

---

## 🧪 Running Tests

Execute the automated system verification test suite:

```bash
npm test
```

---

## 📡 API Overview

The Express server exposes RESTful endpoints for game state operations:

| Category | Endpoint | Description |
| :--- | :--- | :--- |
| **State** | `GET /api/state/default` | Fetches the initial player state template |
| **Actions** | `POST /api/action` | Performs resource gathering or work actions |
| **Tools** | `POST /api/tool/upgrade` | Upgrades a specified gathering tool level |
| **Rank** | `POST /api/rank/up` | Advances player to the next career rank |
| **Prestige**| `POST /api/prestige/ascend` | Resets rank for prestige points |
| **Prestige**| `POST /api/prestige/perk` | Purchases or upgrades prestige perks |
| **Farm** | `POST /api/farm/plant` | Plants a crop on a specified plot |
| **Farm** | `POST /api/farm/plant-all` | Plants crops on all available plots |
| **Farm** | `POST /api/farm/water` | Waters a specific farming plot |
| **Farm** | `POST /api/farm/water-all` | Waters all unwatered plots |
| **Farm** | `POST /api/farm/claim` | Claims harvested crops |
| **Farm** | `POST /api/farm/add-plot` | Expands farm plot capacity |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
>>>>>>> 071e5ae (Initial commit: Set up repository with gitignore and high-level README)
