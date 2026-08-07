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
- **Farming** — Plant, water, compost, and harvest crops across expandable farming plots.
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

- **Node.js** v16 or later
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
