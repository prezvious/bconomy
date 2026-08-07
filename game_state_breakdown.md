# Bconomy Game Engine — Current State & Architecture Breakdown

A comprehensive explanation and technical breakdown of the current state of the **Bconomy** economy game engine codebase located at [`c:/Users/camar/Downloads/bconomy`](file:///c:/Users/camar/Downloads/bconomy).

---

## 1. System Overview & Technology Stack

The **Bconomy** application is an incremental, text-based economy game engine built with a decoupled architecture:

- **Backend**: Express.js server ([`server.js`](file:///c:/Users/camar/Downloads/bconomy/server.js)) serving REST API endpoints.
- **Engine Modules**:
  - [`actionEngine.js`](file:///c:/Users/camar/Downloads/bconomy/src/engine/actionEngine.js): Handles action execution (`mine`, `explore`, `hunt`, `fish`, `work`), yield calculations, formatting, and Amnesia triggers.
  - [`toolEngine.js`](file:///c:/Users/camar/Downloads/bconomy/src/engine/toolEngine.js): Handles tool upgrades (Levels 1–50) and material cost validation.
  - [`rankPrestigeEngine.js`](file:///c:/Users/camar/Downloads/bconomy/src/engine/rankPrestigeEngine.js): Manages rank progression (Ranks 1–107), Ascension mechanics, and Perk purchases.
  - [`dropTables.js`](file:///c:/Users/camar/Downloads/bconomy/src/engine/dropTables.js): Declarative registries for drop tables, rank price structures, perk metadata, and upgrade recipes.
  - [`formulas.js`](file:///c:/Users/camar/Downloads/bconomy/src/utils/formulas.js): Pure math functions governing non-linear scaling, pay calculations, and perk multipliers.
- **Frontend**: Bundled React/Vite application serving UI components from [`js/`](file:///c:/Users/camar/Downloads/bconomy/js) via [`index.html`](file:///c:/Users/camar/Downloads/bconomy/index.html).

---

## 2. Default Player State Schema

Every player session operates on a unified state structure initialized via [`DEFAULT_STATE`](file:///c:/Users/camar/Downloads/bconomy/server.js#L17-L26):

```json
{
  "cash": 0,
  "rankIndex": 0,
  "prestigeCount": 0,
  "prestigePoints": 0,
  "inventory": {},
  "tools": { "mine": 1, "explore": 1, "hunt": 1, "fish": 1 },
  "perks": {
    "investiture": 0,
    "cronyism": 0,
    "backchannel": 0,
    "partiality": 0,
    "serendipity": 0,
    "numismatist": 0,
    "amnesiac": 0
  },
  "cooldowns": { "mine": 0, "explore": 0, "hunt": 0, "fish": 0, "work": 0 }
}
```

### Key Data Fields

| Field | Type | Function |
| :--- | :--- | :--- |
| **`cash`** | `number` | Player's liquid money earned from work and trade. |
| **`rankIndex`** | `number` | Index in the `RANKS` array (0 = Peasant, 106 = God). |
| **`prestigeCount`** | `number` | Total number of times player has ascended (prestiged). |
| **`prestigePoints`** | `number` | Currency earned from ascension (+5 per ascension) used to buy perks. |
| **`inventory`** | `object` | Key-value store mapping item names to quantities. |
| **`tools`** | `object` | Active level (1 to 50) of `mine`, `explore`, `hunt`, and `fish` tools. |
| **`perks`** | `object` | Current levels of all 7 prestige perks. |
| **`cooldowns`** | `object` | Epoch timestamps (ms) marking when each action becomes available again. |

---

## 3. Game Mechanics & Mathematical Models

### A. Resource Gathering (`mine`, `explore`, `hunt`, `fish`)
- **Cooldown**: 300 seconds (5 minutes).
- **Base Roll Pool**:
  - `mine`: 1000
  - `explore`: 400
  - `hunt`: 300
  - `fish`: 200

#### Non-Linear Tool Yield Formula
The yield multiplier scales non-linearly with tool level $L \in [1, 50]$:
$$\text{Tool Multiplier}(L) = 1 + 11 \times \left(\frac{L - 1}{49}\right)^{1.25}$$

- Level 1: $1.00\times$
- Level 25: $\approx 5.15\times$
- Level 50: $12.00\times$

#### Drop Item Yield Logic
1. **Rare Check**: If an item's base drop chance is $\le 5.0\%$, the **Serendipity** multiplier applies ($\text{Serendipity Level} + 2$).
2. **Expected Quantity**:
$$\text{Expected} = \text{BaseRollPool} \times \left(\frac{\text{DropChance}}{100}\right) \times \text{ToolMultiplier} \times \text{RareMultiplier}$$
3. **Variance & Roll**:
   - If $\text{Expected} \ge 1$: $\text{Quantity} = \max(1, \text{round}(\text{Expected} \times \text{Variance}))$, where $\text{Variance} \in [0.96, 1.04]$ ($\pm 4\%$).
   - If $\text{Expected} < 1$: Probabilistic roll where $\text{Chance} = \text{Expected}$ to drop 1 item.

### B. Work Action
- **Cooldown**: 1800 seconds (30 minutes).
- **Base Pay Formula**:
$$\text{Work Pay} = (\text{Rank Base Price} \times 0.05) + 5000$$
- **Work Bonus**:
  - Base bonus chance is $30\%$.
  - Modified by **Partiality** perk: $\text{Chance} = \min(1.0, 0.30 + 0.15 \times \text{Partiality Level})$.
  - On bonus hit: Salary is multiplied by **3.00×**.

### C. Amnesia Perk Mechanics
- Triggers after any action execution.
- Chance: $\text{Amnesiac Level} \times 2\%$ (max 48% at Level 24).
- Effect: Bypasses action cooldown completely by resetting the target timestamp to 0.

---

## 4. Rank Progression & Ascension System

### A. Ranks Structure (107 Total Ranks)
The game features 107 ranks, starting from **Rank 1: Peasant** ($\$10,000$) to **Rank 107: God** ($\$200,000,000$).

#### Rank Up Cost with Cronyism
$$\text{Rank Up Cost} = \text{Base Price} \times (1 - 0.025 \times \min(25, \text{Cronyism Level}))$$
*(Up to 62.5% discount at Level 25).*

### B. Ascension System
- **Requirement**: Must reach **Rank 107 (God)**.
- **Base Price**: $\$200,000,000$.
- **Ascension Cost with Investiture**:
$$\text{Ascension Cost} = 200,000,000 \times (1 - 0.025 \times \min(25, \text{Investiture Level}))$$
*(Discounted down to $\$75,000,000$ at Level 25).*
- **Ascension Actions**:
  - `cash` is reset to `$0`.
  - `rankIndex` is reset to `0` (Peasant).
  - `prestigeCount` increases by `+1`.
  - `prestigePoints` increases by `+5`.

---

## 5. Prestige Perks Breakdown

| Perk Name | Max Level | Effect Description | Formula | Implementation Status |
| :--- | :---: | :--- | :--- | :---: |
| **Investiture** | 25 | Reduces Ascension Cost | $\text{Level} \times 2.5\%$ (max 62.5%) | Fully Functional |
| **Cronyism** | 25 | Lowers Rank-Up Cost | $\text{Level} \times 2.5\%$ (max 62.5%) | Fully Functional |
| **Backchannel** | 25 | Reduces Market Trading Fees | $\text{Level} \times 1.12\%$ | *Coming Soon* |
| **Partiality** | 15 | Increases Work Bonus Chance | $30\% + (\text{Level} \times 15\%)$ | Fully Functional |
| **Serendipity** | 29 | Boosts Rare Item Yield Multiplier | $\text{Multiplier} = \text{Level} + 2$ | Fully Functional |
| **Numismatist** | 20 | Increases Max Coinflip Bet Limit | $+\$5\text{B} / \text{Level}$ | *Coming Soon* |
| **Amnesiac** | 24 | Chance to Bypass Cooldown | $\text{Level} \times 2\%$ (max 48%) | Fully Functional |

---

## 6. Tool Upgrades & Material Progression

Tools (`mine`, `explore`, `hunt`, `fish`) upgrade up to **Level 50** by consuming specific items:

- **Tier 1 (Lv 1–5)**: Basic drops like Copper, Weeds, Mushrooms, Tattered Boots, Feathers, Big Logs.
- **Tier 2 (Lv 6–10)**: Refined/intermediate materials like Iron, Thick Rope, Strawberries, Discarded Butts.
- **Tier 3 (Lv 11–20)**: Precious materials like Silver, Gold, Light Suede, Kiwi, Mango.
- **Tier 4 (Lv 21–35)**: Rare ores & crafted parts like Cobalt, Platinum, Tough Rawhide, Thermite, Steel Beams, Diamonds.
- **Tier 5 (Lv 36–50)**: Mythic & radioactive components like Uranium, Diamond Tethers, Reinforced Hulls, Lucky Charms.

---

## 7. Drop Table Highlights

| Category | Total Items | Most Common Item | Rarest Item |
| :--- | :---: | :--- | :--- |
| **Fish** | 24 | Seaweed ($44.06\%$) | Giant Squid ($0.0011\%$), Treasure Chest ($0.0022\%$) |
| **Explore** | 26 | Rock ($20.22\%$) | Encrypted Drive ($0.0012\%$), Manuscript ($0.0020\%$) |
| **Hunt** | 25 | Rock / Feathers ($20.98\%$) | Heartwood Core ($0.0020\%$), Alpha Wolf Fang ($0.0030\%$) |
| **Mine** | 30 | Rock / Coal ($20.75\%$) | Fossilized Dragon Scale ($0.0010\%$), Uranium ($0.0021\%$) |

---

## 8. REST API Endpoints

- **`GET /api/state/default`**: Fetch baseline state object.
- **`POST /api/action`**: Perform `{ playerState, actionType }` (`mine`, `explore`, `hunt`, `fish`, `work`).
- **`POST /api/tool/upgrade`**: Perform `{ playerState, toolType }`.
- **`POST /api/rank/up`**: Perform `{ playerState }` rank escalation.
- **`POST /api/prestige/ascend`**: Perform `{ playerState }` ascension.
- **`POST /api/prestige/perk`**: Perform `{ playerState, perkName }` purchase.
- **`GET /api/data/ranks`**, **`GET /api/data/perks`**, **`GET /api/data/tools/:toolType/recipe/:level`**: Metadata lookup.

---

> [!NOTE]
> The markdown artifact is available in your workspace at [`game_current_state.md`](file:///c:/Users/camar/Downloads/bconomy/game_current_state.md).
