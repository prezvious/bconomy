# Bconomy Game Engine — Current State & Architecture Breakdown

## 1. Overview & System Architecture

**Bconomy** is a persistent text-based economy and incremental game engine built on a **Node.js / Express** server architecture with a modular backend logic engine (`/src/engine`) and client bundle (`/js` & `index.html`).

```
                              ┌────────────────────────────────────────┐
                              │         Client Application             │
                              │ (React / Vite Frontend via index.html) │
                              └──────────────────┬─────────────────────┘
                                                 │ HTTP / REST API
                                                 ▼
                              ┌────────────────────────────────────────┐
                              │           Express Server               │
                              │             (server.js)                │
                              └──────────────────┬─────────────────────┘
                                                 │
            ┌──────────────────────┬─────────────┴────────────┬──────────────────────┐
            ▼                      ▼                          ▼                      ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐ ┌──────────────────┐
│    ActionEngine      │ │    ToolEngine    │ │ RankPrestigeEngine   │ │    dropTables    │
│  (Resource Actions,  │ │ (Tool Upgrades & │ │ (Rank Escalation,    │ │ (Drop Tables,    │
│   Work Pay, Amnesia) │ │ Recipe Verification)│ Ascension & Perks)   │ │ Ranks & Recipes) │
└───────────┬──────────┘ └─────────┬────────┘ └───────────┬──────────┘ └─────────┬────────┘
            │                      │                      │                      │
            └──────────────────────┴──────────┬───────────┴──────────────────────┘
                                              ▼
                                 ┌─────────────────────────┐
                                 │     formulas.js         │
                                 │ (Mathematical Models &  │
                                 │   Economy Formulas)     │
                                 └─────────────────────────┘
```

---

## 2. Player State Schema

The central player state (`DEFAULT_STATE`) object defines the data structure tracked per player:

```json
{
  "cash": 0,
  "rankIndex": 0,
  "prestigeCount": 0,
  "prestigePoints": 0,
  "inventory": {},
  "tools": {
    "mine": 1,
    "explore": 1,
    "hunt": 1,
    "fish": 1
  },
  "perks": {
    "investiture": 0,
    "cronyism": 0,
    "backchannel": 0,
    "partiality": 0,
    "serendipity": 0,
    "numismatist": 0,
    "amnesiac": 0
  },
  "cooldowns": {
    "mine": 0,
    "explore": 0,
    "hunt": 0,
    "fish": 0,
    "work": 0
  }
}
```

### Property Details
| Property | Type | Description |
| :--- | :--- | :--- |
| `cash` | `number` | Main liquid currency accumulated through `work` and economic activities. |
| `rankIndex` | `number` | Zero-indexed rank progression identifier (0 = Peasant, 106 = God). |
| `prestigeCount` | `number` | Total count of completed ascensions. |
| `prestigePoints` | `number` | Currency awarded upon ascension (+5 per prestige) to purchase prestige perks. |
| `inventory` | `object` | Key-value store mapping item names to integer quantities. |
| `tools` | `object` | Levels (1–50) of active player tools (`mine`, `explore`, `hunt`, `fish`). |
| `perks` | `object` | Levels of purchased prestige perks. |
| `cooldowns` | `object` | Timestamps (in epoch milliseconds) when action availability unlocks. |

---

## 3. Core Mechanics & Mathematical Models

### A. Resource Actions (`mine`, `explore`, `hunt`, `fish`)
- **Cooldown**: 300 seconds (5 minutes).
- **Base Roll Pool**:
  - `mine`: 1000
  - `explore`: 400
  - `hunt`: 300
  - `fish`: 200

#### Tool Yield Multiplier Formula
Tool multipliers scale non-linearly from Level 1 (1.00×) to Level 50 (12.00×):
$$\text{Multiplier}(L) = 1 + 11 \times \left(\frac{L - 1}{49}\right)^{1.25}$$

#### Drop Quantity Calculation
For each item in the action's drop table:
1. **Rare Check**: If drop chance $\le 5.0\%$, Rare Multiplier = $\text{Serendipity Level} + 1$ (if level > 0), else 1.0.
2. **Expected Yield**:
$$\text{Expected} = \text{BaseRollPool} \times \left(\frac{\text{DropChance}}{100}\right) \times \text{ToolMultiplier} \times \text{RareMultiplier}$$
3. **Outcome Determination**:
   - If $\text{Expected} \ge 1$: Yield quantity = $\max(1, \text{round}(\text{Expected} \times \text{Variance}))$, where Variance $\in [0.96, 1.04]$.
   - If $\text{Expected} < 1$: Probabilistic chance equal to $\text{Expected}$ to drop exactly 1 item.

### B. Work Action & Multi-Bonus Payouts
- **Cooldown**: 1800 seconds (30 minutes).
- **Base Pay Formula**:
$$\text{Work Base Pay} = (\text{Rank Base Price} \times 0.05) + 5000$$
- **Work Multi-Bonus Payouts**:
  - Total bonus probability: $\text{TotalChance} = 0.30 + (0.15 \times \text{Partiality Level})$.
  - Guaranteed bonus stacks: $\lfloor\text{TotalChance}\rfloor$.
  - Probabilistic bonus stack: $\text{TotalChance} - \lfloor\text{TotalChance}\rfloor$.
  - Total Multiplier: $3^{\text{bonusCount}}$. For instance, 2 bonus stacks grant $9\times$ salary multiplier ($3^2$), and 3 stacks grant $27\times$ salary ($3^3$).

### C. Amnesia (Cooldown Reset)
- Triggered automatically after performing any action.
- Probability: $\text{Amnesiac Level} \times 2\%$ (max 48% at Level 24).
- Effect: Bypasses the cooldown immediately ($\text{cooldownEnd} = 0$).

---

## 4. Rank Escalation & Ascension System

### A. Ranks (107 Total Ranks)
Progression starts at **Rank 1 (Peasant)** with a base price of $\$10,000$ and caps at **Rank 107 (God)** with a base price of $\$200,000,000$.

#### Discounted Rank Up Cost
For Ranks 1 to 106 (Cronyism):
$$\text{Rank Cost} = \text{Base Price} \times (1 - 0.025 \times \min(25, \text{Cronyism Level}))$$

For Rank 107 (God) (Investiture & Cronyism):
$$\text{Rank Cost} = \text{Base Price} \times (1 - 0.025 \times \text{Cronyism Level}) \times (1 - 0.025 \times \text{Investiture Level})$$
*(Investiture reduces the Rank 107 God price down from $\$200\text{M}$ to $\$75\text{M}$ at Level 25).*

### B. Ascension
- **Requirement**: Must reach **Rank 107 (God)**.
- **Ascension Fee**: $\$0$ cash (Ascending is free once Rank 107 God is purchased).
- **Ascension Rewards & Reset**:
  - `cash` resets to `$0`.
  - `rankIndex` resets to `0` (Peasant).
  - `prestigeCount` increments by `+1`.
  - `prestigePoints` awarded `+5`.

---

## 5. Prestige Perks Breakdown

| Perk Name | Max Level | Effect | Math Formula | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Investiture** | 25 | Discounts Rank 107 (God) Price | $\text{Discount} = \text{Level} \times 2.5\%$ (max 62.5%) | Active |
| **Cronyism** | 25 | Discounts Rank Up Costs | $\text{Discount} = \text{Level} \times 2.5\%$ (max 62.5%) | Active |
| **Backchannel** | 25 | Reduces Market Trade Fee | $\text{Fee Reduction} = \text{Level} \times 1.12\%$ | *Coming Soon* |
| **Partiality** | 15 | Multi-Bonus Chance & Multipliers | $\text{Chance} = 30\% + (\text{Level} \times 15\%)$, stacks $3^n$ | Active |
| **Serendipity** | 29 | Rare Item Yield Multiplier | $\text{Multiplier} = \text{Level} + 1$ (for drops $\le 5\%$) | Active |
| **Numismatist** | 20 | Raises Max Coinflip Bet Limit | $\text{Limit} = +5,000,000,000 / \text{Level}$ | *Coming Soon* |
| **Amnesiac** | 24 | Cooldown Instant Reset Chance | $\text{Chance} = \text{Level} \times 2\%$ | Active |

---

## 6. Tool Upgrades & Materials Guide

Tools scale from **Level 1 to 50**. Upgrades consume specific materials from player inventory.

### Sample Upgrade Requirements Overview
- **Levels 1–5**: Basic resources (e.g. Copper, Weeds, Berries, Log, Tattered Boot).
- **Levels 6–10**: Intermediate materials (Iron, Thick Rope, Strawberry, Discarded Butt).
- **Levels 11–20**: Advanced materials & precious metals (Silver, Gold, Kiwi, Mango, Light Suede).
- **Levels 21–35**: Rare ores & refined components (Cobalt, Platinum, Tough Rawhide, Diamond, Thermite).
- **Levels 36–50**: Legendary artifacts & radioactive elements (Uranium, Diamond Tether, Reinforced Hull, Lucky Charms).

---

## 7. Drop Table Summary

| Action | Total Items | Top Common Item (Chance) | Ultra-Rare Tier Item (Chance) |
| :--- | :---: | :--- | :--- |
| **Fish** | 24 | Seaweed (44.0585%) | Giant Squid (0.0011%), Treasure Chest (0.0022%) |
| **Explore** | 26 | Rock (20.2186%) | Encrypted Drive (0.0012%), Manuscript (0.0020%) |
| **Hunt** | 25 | Rock / Feathers (20.9775%) | Heartwood Core (0.0020%), Alpha Wolf Fang (0.0030%) |
| **Mine** | 30 | Rock / Coal (20.7485%) | Fossilized Dragon Scale (0.0010%), Uranium (0.0021%) |

---

## 8. Server REST API Specification

### State Endpoints
- `GET /api/state/default`: Returns the default initial player state JSON object.

### Action Endpoints
- `POST /api/action`: Executes `mine`, `explore`, `hunt`, `fish`, or `work`. Updates player state and returns output formatting.

### Tool & Upgrades Endpoints
- `POST /api/tool/upgrade`: Verifies recipe requirements and deducts materials to upgrade tool level.
- `GET /api/data/tools/:toolType/recipe/:level`: Returns recipe array for a specific tool level.

### Rank & Prestige Endpoints
- `POST /api/rank/up`: Performs rank-up if player has sufficient cash.
- `POST /api/prestige/ascend`: Resets state and awards prestige points if rank is God.
- `POST /api/prestige/perk`: Spends 1 prestige point to level up a chosen perk.

### Data Endpoints
- `GET /api/data/ranks`: Returns complete list of 107 ranks with base prices.
- `GET /api/data/perks`: Returns complete perk definitions dictionary.
