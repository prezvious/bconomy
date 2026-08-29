# Bconomy Website & Game Engine — Comprehensive Technical Documentation

## 1. Executive Summary & System Architecture

**Bconomy** is a persistent text-based economy and incremental game engine built on a **Node.js / Express** backend architecture paired with a static, single-page HTML/CSS/JavaScript client that uses native ES modules. No React or Vite build step is required.

The architecture isolates pure game logic into modular engine modules located in `/src/engine` and pure mathematical utility functions in `/src/utils/formulas.js`. The Express server (`server.js`) acts as the state orchestration layer and REST API gateway, managing client requests, performing deterministic state mutations, enforcing anti-exploit validations, and returning serialized state payloads with pre-formatted UI output strings. Solo progress remains private player state. Factions are the one multiplayer surface and are stored as server-authoritative shared PostgreSQL records.

### High-Level System Architecture Diagram

```
                               ┌────────────────────────────────────────┐
                               │         Client Application             │
                               │ (HTML/CSS/ES Modules in /public)      │
                               └──────────────────┬─────────────────────┘
                                                  │ HTTP REST API (JSON)
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │           Express Server               │
                               │             (server.js)                │
                               └──────────────────┬─────────────────────┘
                                                  │
   ┌───────────────────┬───────────────────┬──────┴────────────┬───────────────────┬───────────────────┐
   ▼                   ▼                   ▼                   ▼                   ▼                   ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌───────────────┐ ┌───────────────┐
│ ActionEngine  │ │  ToolEngine   │ │ RankPrestige  │ │   FarmEngine    │ │  ShopEngine   │ │ BoosterEngine │
│ (Gathering &  │ │(Upgrade Tool  │ │    Engine     │ │ (Crops, Plots,  │ │(Restock, Buy, │ │(Activation &  │
│  Work Pay)    │ │ Verification) │ │(Rank/Prestige)│ │  Catch-up, Perk)│ │ Sell, Markup) │ │ Multipliers)  │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────────┬────────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │                  │                  │                 │
        └─────────────────┴─────────────────┴─────────┬────────┴──────────────────┴─────────────────┘
                                                      ▼
                                       ┌──────────────────────────────┐
                                       │    formulas.js & dropTables  │
                                       │ (Economy Models & Schemas)   │
                                       └──────────────────────────────┘
```

---

## 2. Directory & File Inventory

Below is the complete file-by-file breakdown of the project workspace:

### Backend Engine & Logic Layer (`/src`)
*   **[server.js](file:///c:/Users/camar/Downloads/bconomy/server.js)**: Main application entry point and Express server listening on port 3000. Provides static asset serving from `/public` and handles all REST API endpoints for default state creation, resource actions, tool upgrades, career rank advancement, prestige ascensions, perk level upgrades, farming plot actions, system shop purchases/sales, and loot booster activations.
*   **[src/utils/formulas.js](file:///c:/Users/camar/Downloads/bconomy/src/utils/formulas.js)**: Pure mathematical function library housing standard economy equations: non-linear tool yield multipliers, work base pay, multi-stack work bonus odds, cronyism/investiture rank discounts, serendipity rare drop multipliers, amnesia cooldown reset chances, booster multiplicative stacking calculations, and PascalCase text formatting.
*   **[src/engine/actionEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/actionEngine.js)**: Core handler for resource gathering actions (`mine`, `explore`, `hunt`, `fish`) and the `work` action. Computes loot drops using roll pools, applies tool yield, serendipity, and multiplicative booster multipliers, rolls uniform drop variance ($\pm 4\%$), evaluates Amnesiac perk triggers, updates state cooldowns, and formats output text blocks for display.
*   **`src/engine/factionMultiplayerRules.js`**: Shared definitions for Faction Ranks, fixed permissions, membership modes, capacity, generated request-message shuffle bags, deterministic Leader succession, and membership-mode transitions.
*   **`src/db/factions.js`**: Trusted server wrapper for faction snapshots, public directory queries, player search, message generation, transactional commands, legacy migration, and guest cleanup.
*   **`src/data/factionJoinMessages.js`**: Curated pool of 48 complete, cheerful join-request messages. A per-player shuffle bag prevents repetition until the pool has been exhausted.
*   **[src/engine/boosterEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/boosterEngine.js)**: Dedicated engine for managing action-specific loot boosters across 4 action types and 6 tiers. Implements canonical and legacy inventory-name resolution, handles direct console/UI activations, plans and executes atomic bulk activation, enforces same-tier duration extensions vs. cross-tier multiplicative stacking ($2^k$), and handles inventory item consumption.
*   **[src/engine/dropTables.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/dropTables.js)**: Master data tables module containing:
    *   Resource drop chance tables (`MINE_DROP_TABLE`, `EXPLORE_DROP_TABLE`, `HUNT_DROP_TABLE`, `FISH_DROP_TABLE`).
    *   107 Career Rank objects with base prices (`RANKS`).
    *   Prestige Perk metadata and max level caps (`PERK_DEFINITIONS`).
    *   Tool Upgrade recipe definitions for Levels 1–50 (`TOOL_UPGRADE_RECIPES`) and procedural generator for Levels 51–500 (`generateProceduralRecipe`).
    *   Modification socket module definitions across 5 families and 3 tiers (`SOCKET_MODULE_DEFINITIONS`).
    *   Base action cooldown durations (`ACTION_COOLDOWNS`).
*   **[src/engine/farmEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/farmEngine.js)**: Agricultural engine managing Level 0–16 plot lifecycles, planting, uprooting, global watering, level-adjusted offline catch-up, free plot expansion, Crop Storage & Logistics, and crop effects.
*   **[src/engine/farmPlotUpgrade.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/farmPlotUpgrade.js)**: Canonical plot recipes, realistic farm-material metadata, market ranges, loot chances, level normalization, affordability previews, and sequential upgrade planning.
*   **[src/engine/rankPrestigeEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/rankPrestigeEngine.js)**: Manages career progression rank-ups, checks eligibility for Rank 107 (God) ascension, handles prestige state resets, awards prestige points (+5 per ascension), and processes perk upgrades.
*   **[src/engine/shopEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/shopEngine.js)**: Implements the 10-minute time-gated system shop. Manages Bernoulli appearance rolls ($p_i$), uniform stock rolls, dynamic sell price rolls, value-band markup buy price rolls, buy/sell transactions for 68 normal items, and T1–T4 loot booster transactions.
*   **[src/engine/shopTables.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/shopTables.js)**: Data registry for the system shop system, housing the 10-minute restock timer (`SHOP_RESTOCK_SECONDS = 600`), 7 price markup bands (`BUY_MARKUP_BANDS`), canonical sellable item balance configurations (`SELLABLE_ITEMS`), and the 24 loot booster registry (`BOOSTER_REGISTRY`).
*   **[src/engine/toolEngine.js](file:///c:/Users/camar/Downloads/bconomy/src/engine/toolEngine.js)**: Manages tool upgrade verification, material requirement checks against player inventory, recipe lookup logic, atomic bulk upgrading, and modification socket management for tool levels 1–500.

### Frontend Application Layer
*   **`public/index.html`**: Semantic single-page shell, navigation, panels, and nine native `<dialog>` elements controlled through one shared dialog manager.
*   **`public/style.css`**: Light/dark design tokens, shared control sizing, three interface-density modes, responsive layout rules down to 360px, and the Inventory, Shop, Faction, Settings, and modal component styles.
*   **`public/app.js`**: Browser entry point that loads state and metadata, initializes navigation/dialog behavior, applies local display preferences, and starts the cooldown loop.
*   **`public/js/preferences.js`**: Version-tolerant local preference normalization for number display, interface density, inventory controls, and notification behavior. These preferences are intentionally separate from player state.
*   **`public/js/ui/`**: Focused renderers for actions, farm, inventory and item details, tools, rank/prestige, shop and bulk trades, faction operations, gambling, notifications, dialogs, and settings.
*   **`public/js/api.js`**: Client-side REST API wrapper and shared loading/error handling.

### Automated Test Suite (`/tests`)
*   **[tests/test_all_engines.js](file:///c:/Users/camar/Downloads/bconomy/tests/test_all_engines.js)**: Master test runner script executing integration tests across all engine modules.
*   **[tests/test_boosterEngine.js](file:///c:/Users/camar/Downloads/bconomy/tests/test_boosterEngine.js)**: Unit tests for booster activation, multiplicative stacking ($2^k$), and duration extensions.
*   **`tests/test_error_indicator.mjs`**: Tests verifying the console error-status indicator and filter behavior.
*   **[tests/test_farmEngine.js](file:///c:/Users/camar/Downloads/bconomy/tests/test_farmEngine.js)**: Unit tests for plot growth, watering, offline catch-up, and crop special abilities.
*   **[tests/test_inventory_consolidation.js](file:///c:/Users/camar/Downloads/bconomy/tests/test_inventory_consolidation.js)**: Unit tests verifying dynamic inventory key normalization and alias merging (e.g., `Bones` $\rightarrow$ `OldBones`).
*   **[tests/test_shopEngine.js](file:///c:/Users/camar/Downloads/bconomy/tests/test_shopEngine.js)**: Tests for 10-minute restocks, appearance chance gating, stock generation, buy/sell transactions, and price markup bands.
*   **`tests/test_toast.mjs`** and **`tests/test_toast_coalescing.mjs`**: UI notification, filtering, and coalescing tests.
*   **`tests/test_preferences_and_number_formatting.mjs`**: Preference migration/default and number-format boundary coverage.
*   **`tests/test_dialog_manager.mjs`**: Native-dialog lifecycle, Escape, backdrop policy, focus restoration, and permanent-confirmation coverage.
*   **`tests/test_ui_surfaces.mjs`** and **`tests/test_static_ui_contract.mjs`**: Rendering and static accessibility/responsive-contract coverage for the redesigned pages.
*   **`tests/test_multiplayer_faction_rules.js`** and **`tests/test_multiplayer_faction_contract.mjs`**: Permission, membership-mode, message-pool, schema, API, guest-lifecycle, authoritative-effect, UI, and handbook coverage for multiplayer factions.

### Configuration & Project Metadata
*   **[package.json](file:///c:/Users/camar/Downloads/bconomy/package.json)**: Node.js project manifest defining dependencies (`express`, `cors`), main script (`server.js`), and test scripts.
*   **[package-lock.json](file:///c:/Users/camar/Downloads/bconomy/package-lock.json)**: Dependency lockfile.
*   **[.gitignore](file:///c:/Users/camar/Downloads/bconomy/.gitignore)**: Git exclusion rules.
*   **[LICENSE](file:///c:/Users/camar/Downloads/bconomy/LICENSE)**: License file.

### In-Game Documentation & Guides
*   **[README.md](file:///c:/Users/camar/Downloads/bconomy/README.md)**: High-level repository introduction and setup guide.
*   **[bconomy_shop_system_documentation.md](file:///c:/Users/camar/Downloads/bconomy/bconomy_shop_system_documentation.md)**: Full balance specification for the System Shop and Loot Boosters.
*   **[game_current_state.md](file:///c:/Users/camar/Downloads/bconomy/game_current_state.md)**: State architecture and core mathematical breakdown document.
*   **[game_state_breakdown.md](file:///c:/Users/camar/Downloads/bconomy/game_state_breakdown.md)**: Technical guide detailing state fields and engine contracts.
*   **[in_game_items.md](file:///c:/Users/camar/Downloads/bconomy/in_game_items.md)** & **[in_game_items_descriptions.md](file:///c:/Users/camar/Downloads/bconomy/in_game_items_descriptions.md)**: Item catalog and narrative lore descriptions.
*   **[tool_upgrade_materials_guide.md](file:///c:/Users/camar/Downloads/bconomy/tool_upgrade_materials_guide.md)**: Complete guide covering tool upgrade recipes for Levels 1–50 across all four tools.
*   **Perk text files**: `action-values.txt`, `amnesiac.txt`, `anointment-and-nepotism.txt`, `backchannel.txt`, `numismatist.txt`, `partiality.txt`, `prestige-perks.txt`, `serendipity.txt`.

---

## 3. Player State Schema & Critical Variables

Player-state schema version 2 (`DEFAULT_STATE`) defines private solo data. It never stores faction membership, treasury, ranks, requests, invitations, access codes, or boosts; those records are shared PostgreSQL data keyed to the player's server identity.

```json
{
  "schemaVersion": 2,
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
  },
  "farm": {
    "waterAvailableAt": 0,
    "storage": {
      "Blueberry": 0,
      "Golden Wheat": 0,
      "Melon": 0,
      "Coffee": 0,
      "Pumpkin": 0
    },
    "plots": [
      { "id": 1, "level": 0, "crop": null, "plantedAt": 0, "nextHarvestAt": 0 }
    ]
  },
  "shop": {
    "lastRestockAt": 0,
    "nextRestockAt": 0,
    "sellPrices": {},
    "buyListings": {},
    "boosterListings": {}
  },
  "boosters": {
    "activeUntil": {
      "mine": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
      "explore": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
      "fish": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 },
      "hunt": { "T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0, "T6": 0 }
    }
  }
}
```

### Key State Variable Dictionary

| Variable Path | Datatype | Range / Constraint | Functional Purpose |
| :--- | :--- | :--- | :--- |
| `cash` | `number` | $\ge 0$ | Primary liquid currency accumulated via `work`, item sales, or wheat harvests; spent on rank-ups and shop items. |
| `rankIndex` | `number` | $0 \dots 106$ | Career rank identifier (0 = Peasant, 106 = God [Rank 107]). |
| `prestigeCount` | `number` | $\ge 0$ | Cumulative total of ascensions completed. |
| `prestigePoints` | `number` | $\ge 0$ | Currency awarded upon ascension (+5 per ascension) used to purchase perk upgrades. |
| `inventory` | `object` | Key-value store | Maps item names to integer quantities ($\ge 1$). Sanitized via dynamic key canonicalization. |
| `tools[action]` | `number` | $1 \dots 500$ | Level of the specified tool (`mine`, `explore`, `hunt`, `fish`), governing resource yield multiplier and socket progression. |
| `perks[perkName]` | `number` | $0 \dots \text{maxLevel}$ | Level of each purchased prestige perk. |
| `cooldowns[action]`| `number` | Epoch timestamp (ms) | Expiration timestamp when action availability unlocks. |
| `farm.waterAvailableAt` | `number` | Epoch timestamp (ms) | Global watering cooldown timestamp (10 minutes). |
| `farm.storage` | `object` | Crop count map | Unclaimed crop harvest counts residing in Farm Storage. |
| `farm.plots` | `array` | Objects | Array of farm plot state objects containing `id`, integer `level` (0–16), `crop`, `plantedAt`, and `nextHarvestAt`. Missing or invalid levels migrate to Level 0. |
| `shop.nextRestockAt` | `number` | Epoch timestamp (ms) | Target timestamp for the next automatic system shop restock. |
| `boosters.activeUntil[action][tier]` | `number` | Epoch timestamp (ms) | Expiration timestamp for active loot boosters mapped per action and tier (`T1`–`T6`). |

---

## 4. Comprehensive Game Formulas & Mathematical Models

### A. Non-Linear Tool Yield Multiplier Formula
Tool multipliers scale non-linearly from Level 1 ($1.00\times$) to Level 50 ($12.00\times$):

$$\text{YieldMultiplier}(L) = 1 + 11 \times \left(\frac{L - 1}{49}\right)^{1.25}$$

*Milestone values:*
*   Level 1: $1.00\times$
*   Level 10: $2.32\times$
*   Level 25: $5.51\times$
*   Level 40: $9.27\times$
*   Level 50: $12.00\times$

### B. Gathering Drop Expected Yield & Variance Formula
For each item entry in an action drop table:

1.  **Serendipity Rare Multiplier**:
    $$\text{RareMult} = \begin{cases} \text{SerendipityLevel} + 1 & \text{if drop chance } \le 5.0\% \text{ and } \text{SerendipityLevel} > 0 \\ 1.0 & \text{otherwise} \end{cases}$$

2.  **Loot Booster Multiplier**:
    $$\text{BoosterMult} = 2^k \quad \text{where } k = \text{count of active unexpired booster tiers for that action}$$

3.  **Expected Yield**:
    $$\text{Expected} = \text{BaseRollPool} \times \left(\frac{\text{DropChance}}{100}\right) \times \text{YieldMultiplier} \times \text{RareMult} \times \text{BoosterMult}$$
    *(Base roll pools: `mine` = 1000, `explore` = 400, `hunt` = 300, `fish` = 200).*

4.  **Quantity Determination**:
    *   If $\text{Expected} \ge 1$: $\text{Quantity} = \max(1, \text{round}(\text{Expected} \times \text{Variance}))$, where $\text{Variance} \sim U(0.96, 1.04)$ ($\pm 4\%$ variance).
    *   If $\text{Expected} < 1$: Bernoulli roll with success probability equal to $\text{Expected}$ to drop 1 unit.

### C. Career Work Base Pay & Multi-Bonus Payout Formula
*   **Action Cooldown**: 1,800 seconds (30 minutes).
*   **Work Base Pay**:
    $$\text{BasePay} = \left(\text{TargetRankBasePrice} \times 0.05\right) + 5000$$

*   **Multi-Bonus Payout (Partiality Perk)**:
    $$\text{TotalChance} = 0.30 + \left(0.15 \times \text{PartialityLevel}\right)$$
    *   Guaranteed bonus stacks: $\lfloor\text{TotalChance}\rfloor$
    *   Probabilistic extra stack chance: $\text{TotalChance} - \lfloor\text{TotalChance}\rfloor$
    *   **Pay Multiplier**: $\text{PayMultiplier} = 3^{\text{bonusCount}}$
    *   **Total Pay**: $\text{TotalPay} = \text{BasePay} \times 3^{\text{bonusCount}}$

### D. Career Rank Escalation Costs & Discounts
Career progression features 107 ranks ($10\text{k} to $250\text{M} base prices).

*   **Career Rank Up Cost**:
    $$\text{RankCost}(r, t, N) = \lfloor \text{BasePrice}_r \times (t + 1) \times \left(1 - 0.025 \times \min(25, \text{CronyismLevel})\right) \rfloor$$
    *(Scales linearly with prestige tier $t+1$; maximum 62.5% discount at Cronyism Level 25).*

*   **Prestige Ascension Fee & Investiture Discount**:
    $$\text{BaseAscensionCost}(t) = \begin{cases} 0 & \text{if } t = 0 \\ 550,000,000 \times (t + 2) & \text{if } t \ge 1 \end{cases}$$
    $$\text{AscensionCost}(t, A) = \lfloor \text{BaseAscensionCost}(t) \times \left(1 - 0.025 \times \min(25, \text{InvestitureLevel})\right) \rfloor$$
    *(Tier 0 ascension to Tier 1 is Free; Tier 1+ ascension fee scales linearly and is discounted up to 62.5% at Investiture Level 25).*

### E. Amnesiac Cooldown Reset Formula
Triggered automatically after completing any action (`mine`, `explore`, `hunt`, `fish`, `work`):

$$P(\text{Reset}) = \text{AmnesiacLevel} \times 0.02 \quad (\text{Max } 48\% \text{ chance at Level 24})$$

Effect: Instantly sets action cooldown timestamp to 0.

### F. System Shop Mathematical Models
*   **Restock Timer**: $R = 600 \text{ seconds} = 10 \text{ minutes}$ (144 restocks/day).
*   **Appearance Model**:
    $$A_i \sim \text{Bernoulli}(p_i)$$
    Expected waiting time between appearances: $E[T_i] = \frac{10}{p_i} \text{ minutes}$.
*   **Stock Generation**: Uniform integer distribution $Q_i \sim U(q_{\min, i}, q_{\max, i})$.
*   **Sell Price Roll**: Uniform integer distribution $S_i \sim U(s_{\min, i}, s_{\max, i})$.
*   **Legacy Buy Price Markup Bands**: Markup multiplier $M \sim U(m_{\min}, m_{\max})$ applied to maximum sell price ($s_{\max, i}$):
    $$\text{BuyPrice}_i = \text{round}\left(s_{\max, i} \times M\right)$$
*   **Farm Upgrade Material Buy Prices**: An independent inclusive integer roll from each material's explicit `buyRange`. This intentionally permits overlap with its independently rolled `sellRange` as part of the market-luck mechanic.

#### Value-Band Markup Multipliers (`BUY_MARKUP_BANDS`)

| Max Sell Price ($s_{\max}$) Range | Min Markup ($m_{\min}$) | Max Markup ($m_{\max}$) | Effective Buy Markup Range |
| :--- | :---: | :---: | :---: |
| $\$0 \dots \$10,000$ | $3.0\times$ | $5.0\times$ | $3\times - 5\times$ |
| $\$10,001 \dots \$200,000$ | $4.0\times$ | $6.0\times$ | $4\times - 6\times$ |
| $\$200,001 \dots \$1,000,000$ | $5.0\times$ | $7.0\times$ | $5\times - 7\times$ |
| $\$1,000,001 \dots \$10,000,000$ | $6.0\times$ | $8.0\times$ | $6\times - 8\times$ |
| $\$10,000,001 \dots \$100,000,000$ | $7.0\times$ | $10.0\times$ | $7\times - 10\times$ |
| $\$100,000,001 \dots \$1,000,000,000$ | $8.0\times$ | $12.0\times$ | $8\times - 12\times$ |
| $> \$1,000,000,000$ | $10.0\times$ | $15.0\times$ | $10\times - 15\times$ |

---

## 5. Prestige Perks & Crop Mechanics Reference

### Prestige Perks Table

| Perk Identifier | Display Name | Max Level | Effect Description | Formula |
| :--- | :--- | :---: | :--- | :--- |
| `cronyism` | Rank Subsidy | 25 | Lowers the price of ranking up | Level $\times 2.5\%$ discount (max 62.5%) |
| `investiture` | Final Rank Discount | 25 | Reduces price of prestige ascension (Tiers 1+) | Level $\times 2.5\%$ discount (max 62.5%) |
| `partiality` | Overtime Bonus | 15 | Increases work bonus odds and stacks | Base $30\% + \text{Level} \times 15\%$, multiplier $3^n$ |
| `serendipity` | Lucky Drops | 29 | Boosts rare drop quantities ($\le 5\%$) | Multiplier $= \text{Level} + 1$ |
| `amnesiac` | Cooldown Reset | 24 | Chance to bypass action cooldown | Level $\times 2\%$ chance (max 48%) |
| `water_byproducts` | Water Abundance | 10 | Boosts crop yields and water byproducts on watered plots | $+15\%$ crop yield & $+15\%$ byproducts per level (max $+150\%$) |
| `backchannel` | Market Fee Reduction | 25 | Reduces trade fee (*Coming Soon*) | Level $\times 1.12\%$ fee reduction |
| `numismatist` | Bet Limit Boost | 20 | Increases the maximum gambling bet limit | Base $\$1\text{B} + \text{Level} \times \$5\text{B}$ increase |

### Agricultural Crop Definitions & Special Effects

| Crop Name | Grow Time | Base Yield | Special Effect Description | Implementation Mechanics |
| :--- | :---: | :---: | :--- | :--- |
| **Blueberry** | 20s | 3 | **Berry Burst**: 2% chance to double harvest yield. | Roll per harvest cycle: if $rng() < 0.02$, yield $\times 2$. |
| **Golden Wheat** | 70s | 5 | **Golden Pay**: Claiming grants $+\$10,000$ cash per wheat. | Upon claim, player cash increases by $\text{Count} \times \$10,000$. |
| **Melon** | 15m | 5 | **Hydration**: Consuming 1 Melon resets global water cooldown. | Endpoint `/api/farm/use-melon` consumes 1 Melon and resets `waterAvailableAt = 0`. |
| **Coffee** | 5m | 2 | **Caffeine**: Claiming reduces all action cooldowns. | Upon claim, reduces all action cooldowns by $\min(\text{ActiveCoffeePlots}, 120)$ seconds. |
| **Pumpkin** | 30m | 1 | Normal crop; no special farm bonus currently. | Uses the standard repeating crop cycle and plot-level grow-time reduction. |

### Farm Plot Levels and Material Upgrades

Every plot begins at **Level 0** with no grow-time reduction. Target Levels 1–16 each add five percentage points of reduction:

\[
D_{effective}=D_{base}\times(1-0.05\times L)
\]

Level 1 is 5% faster and Level 16 is 80% faster. Level 0 is displayed as a baseline plot rather than as a numbered level on plot cards. Upgrades require materials only and never spend cash. An active crop is first settled at its old duration; after the level changes, its current cycle is recalculated from `plantedAt`, all newly completed cycles are stored immediately, and the partial-cycle remainder is preserved.

`Upgrade One Level` consumes the next recipe. `Upgrade to Max Level` shows cumulative Level current+1 through Level 16 requirements, reports `Inventory allows: Level N`, and consumes only the affordable sequential prefix. It stops before the first unaffordable level and cannot skip a recipe.

| Target Level | Required Materials |
| ---: | :--- |
| 1 | 340 Gravel; 34 Fence Post; 2 Irrigation Tubing |
| 2 | 342 Gravel; 35 Fence Post; 2 Irrigation Tubing |
| 3 | 1,930 Gravel; 193 Fence Post; 7 Irrigation Tubing |
| 4 | 5,315 Gravel; 532 Fence Post; 18 Irrigation Tubing |
| 5 | 142 Paving Stone; 12 Treated Board; 9 Granular Fertilizer; 19 Irrigation Tubing |
| 6 | 248 Paving Stone; 21 Treated Board; 16 Granular Fertilizer; 32 Irrigation Tubing |
| 7 | 391 Paving Stone; 32 Treated Board; 25 Granular Fertilizer; 51 Irrigation Tubing |
| 8 | 574 Paving Stone; 47 Treated Board; 35 Granular Fertilizer; 74 Irrigation Tubing |
| 9 | 802 Paving Stone; 65 Treated Board; 50 Granular Fertilizer; 103 Irrigation Tubing |
| 10 | 2 Galvanized Frame; 16 Solar Cell; 4 Frost Blanket; 4 Brass Valve; 44 Outdoor Cable; 2 Water Pump |
| 11 | 2 Galvanized Frame; 21 Solar Cell; 5 Frost Blanket; 5 Brass Valve; 57 Outdoor Cable; 2 Water Pump |
| 12 | 3 Galvanized Frame; 26 Solar Cell; 6 Frost Blanket; 6 Brass Valve; 72 Outdoor Cable; 2 Water Pump |
| 13 | 4 Galvanized Frame; 33 Solar Cell; 7 Frost Blanket; 7 Brass Valve; 89 Outdoor Cable; 3 Water Pump |
| 14 | 4 Galvanized Frame; 40 Solar Cell; 9 Frost Blanket; 9 Brass Valve; 109 Outdoor Cable; 3 Water Pump |
| 15 | 5 Galvanized Frame; 48 Solar Cell; 10 Frost Blanket; 10 Brass Valve; 131 Outdoor Cable; 4 Water Pump |
| 16 | 6 Galvanized Frame; 57 Solar Cell; 12 Frost Blanket; 12 Brass Valve; 155 Outdoor Cable; 5 Water Pump |

The design-time balancing check is `U(L) = 35,000 × max(1, L−1)^2.5`. It is not a currency cost or item price. Phase effort conversion values keep each recipe within 3.4% of the target.

Global watering is the only watering action. It advances every active plot by exactly 1,800 seconds, runs the normal catch-up calculation at that plot's adjusted cycle duration, and immediately stores every accelerated harvest. For an 8-second cycle, watering completes 225 cycles. Berry Burst, Water Abundance crop yield, Weeds, and Red Mushroom byproducts apply independently to every accelerated cycle.

---

## 6. Server REST API Endpoint Reference

The backend Express server (`server.js`) exposes the following HTTP endpoints:

### State & System Endpoints
*   `GET /api/state/default`: Returns a freshly initialized `DEFAULT_STATE` object with normalized shop and farm states.
*   `GET /api/data/ranks`: Returns array of all 107 career ranks.
*   `GET /api/data/perks`: Returns `PERK_DEFINITIONS` metadata.
*   `GET /api/data/boosters`: Returns booster tier durations and `BOOSTER_REGISTRY`.
*   `GET /api/data/farm/crops`: Returns `CROP_DEFINITIONS`.
*   `GET /api/data/farm/materials`: Returns farm upgrade material descriptions, drop chances and stacks, shop appearance and stock, icons, and independent buy/sell ranges.
*   `GET /api/data/tools/:toolType/recipe/:level`: Returns material requirements for a tool upgrade.

### Action & Progression Endpoints
*   `POST /api/action`: Executes `mine`, `explore`, `hunt`, `fish`, or `work`. Body: `{ playerState, actionType }`. Returns updated state and result with pre-formatted UI text.
*   `POST /api/tool/upgrade`: Upgrades tool level. Body: `{ playerState, toolType }`.
*   `POST /api/rank/up`: Advances career rank. Body: `{ playerState }`.
*   `POST /api/prestige/ascend`: Ascends player to next prestige level (requires Rank 107 God). Body: `{ playerState }`.
*   `POST /api/prestige/perk`: Upgrades a prestige perk. Body: `{ playerState, perkName }`.

### Farm System Endpoints
*   `POST /api/farm/state`: Processes offline crop growth catch-up.
*   `POST /api/farm/plant`: Plants a crop on a plot. Body: `{ playerState, plotId, cropName }`.
*   `POST /api/farm/plant-all`: Plants crop on all empty plots. Body: `{ playerState, cropName }`.
*   `POST /api/farm/uproot`: Discards the planted crop on one plot without a refund. Body: `{ playerState, plotId }`.
*   `POST /api/farm/uproot-same-crop`: Discards every planted instance of a crop, including ready plots, without changing stored harvests. Body: `{ playerState, cropName }`.
*   `POST /api/farm/upgrade-preview`: Returns next-level or cumulative-to-Level-16 material requirements and the maximum affordable sequential level. Body: `{ playerState, plotId, mode: "next" | "max" }`.
*   `POST /api/farm/upgrade`: Atomically consumes materials and upgrades one level or as far as possible. Body: `{ playerState, plotId, mode: "next" | "max" }`.
*   `POST /api/farm/water-all`: Advances every active plot by 30 minutes and immediately stores every completed level-adjusted cycle. Body: `{ playerState }`.
*   `POST /api/farm/add-plot`: Adds a new plot to farm. Body: `{ playerState }`.
*   `POST /api/farm/claim`: Claims stored crops into inventory. Body: `{ playerState, cropType }`.
*   `POST /api/farm/use-melon`: Consumes 1 Melon to reset watering cooldown. Body: `{ playerState }`.

### Shop & Booster Endpoints
*   `POST /api/shop/state`: Fetches current shop state and triggers restock if 10 minutes elapsed.
*   `POST /api/shop/buy`: Buys item from shop. Body: `{ playerState, itemName, quantity }`.
*   `POST /api/shop/sell`: Sells item to shop. Body: `{ playerState, itemName, quantity }`.
*   `POST /api/shop/booster/buy`: Buys T1–T4 booster from shop. Body: `{ playerState, boosterName, quantity }`.
*   `POST /api/booster/use`: Consumes booster from inventory to activate. Body: `{ playerState, itemName, actionType }`.
*   `POST /api/booster/activate`: Direct console/UI booster activation. Body: `{ playerState, actionType, tier }`.
*   `POST /api/booster/bulk/preview`: Validates and plans an Inventory bulk activation without mutating the submitted state. Body: `{ playerState, options: { mode: "allOwned" | "oneEach" | "custom", quantities?: Record<string, number> } }`.
*   `POST /api/booster/bulk/execute`: Atomically consumes the selected boosters and applies all duration changes with one activation timestamp. The request body uses the same `options` shape as preview and the response includes updated `state` and the itemized `result`.

Bulk booster results report `itemsAffectedCount`, `totalUnits`, an inventory-key `breakdown`, aggregated `tierSummaries` with previous and projected expiries, and per-action `actionSummaries` with active tiers and resulting multipliers. `allOwned` consumes every usable T1–T6 booster unit, `oneEach` consumes one unit from each distinct owned booster inventory entry, and `custom` applies bounded quantities supplied by the client. Multiple inventory entries resolving to the same action and tier contribute duration to one tier; an already-active tier extends from its current expiry and does not create another multiplier tier. Unknown custom keys, unsafe or non-integer quantities, over-owned quantities, and empty selections fail before any state is committed.

### Faction System Endpoints
*   `POST /api/factions/queries`: Returns a viewer-filtered snapshot, public directory, invitation-player search, or the next generated join-request message.
*   `POST /api/factions/commands`: Executes one idempotent shared mutation using `type`, UUID `commandId`, current `expectedRevision`, and operation-specific `payload`.
*   `GET /api/data/faction-multipliers`: Returns the complete 36-level multiplier metadata and hourly FP cost table.
*   `POST /api/faction/*`: Retired singular local-faction endpoints return `410 Gone`.

The faction command registry covers creation, deposits, invitations, public requests, one-time codes, rank changes, removal, Leader transfer, leave, disband, customization, membership mode, notification reads, and boost activation or stopping. All faction endpoints require a verified registered or anonymous bearer identity. The detailed request and response contract is in `docs/GAME_API_V1.md`.

---

## 7. Multiplayer Faction Architecture and Cost Curves

Factions are shared across at most 20 members, including exactly one Leader. A player can belong to one faction. The rank order is Private, Corporal, Sergeant, Lieutenant, and Leader; these ranks are separate from Bconomy's solo progression ranks.

| Faction Rank | Fixed permissions |
| :--- | :--- |
| Private | View permitted faction data, deposit Cash as FP, receive active boosts, and leave. |
| Corporal | Private permissions plus send invitations and revoke their own invitations. |
| Sergeant | Corporal permissions plus review public join requests, remove lower-ranked members, and manage boosts. |
| Lieutenant | Sergeant permissions plus promote or demote members strictly below Lieutenant, edit details, and generate or reset a one-time access code. |
| Leader | Full control, including appointing Lieutenants, changing membership mode, transferring ownership, and disbanding. |

Membership is invite-only, code-only, or public with join requests. Codes are single-use and have no time expiry; plaintext is displayed only when generated and only its hash is stored. Every public request starts with one of 48 cheerful messages drawn from a per-player shuffle bag, and the player may edit or regenerate it before sending. There is no faction membership cooldown.

Guests receive anonymous Supabase identities automatically and can use every permitted faction feature. Account registration upgrades the same identity. Anonymous identities inactive for 365 days are deleted. If the deleted guest was Leader, succession chooses the highest Faction Rank, then earliest join time, then Player ID; a faction with no remaining members is deleted.

### Mathematical Specifications
*   **Parity**: $1.00\text{ Cash} = 1\text{ FP}$.
*   **Levels**: Level 0 ($1.00\times$ baseline) to Level 36 ($10.00\times$ maximum) with step size $+0.25\times$.
*   **Hourly Cost Function**:
    $$\text{CostPerHour}(L) = \begin{cases} 
    0 & \text{if } L = 0 \\
    \lfloor 100,000 \times L^2 \rfloor & \text{if } 1 \le L \le 16 \quad (\le 5.00\times) \\
    \lfloor 25,600,000 \times 1.25^{L - 16} + 10,000,000 \times (L - 16)^2 \rfloor & \text{if } L > 16 \quad (> 5.00\times)
    \end{cases}$$

### Benchmark Cost Table
| Level | Multiplier | Hourly Cost ($1\text{ FP} = \$1$) | Tier Category |
| :---: | :---: | :---: | :--- |
| **0** | $1.00\times$ | 0 FP | Inactive |
| **1** | $1.25\times$ | 100,000 FP | Standard |
| **4** | $2.00\times$ | 1,600,000 FP | Standard |
| **8** | $3.00\times$ | 6,400,000 FP | Intermediate |
| **16** | $5.00\times$ | 25,600,000 FP | 5x Threshold |
| **20** | $6.00\times$ | 222,490,000 FP | Elite |
| **24** | $7.00\times$ | 792,576,000 FP | Master |
| **32** | $9.00\times$ | 3,469,488,000 FP | Legendary |
| **36** | $10.00\times$ | 6,220,445,000 FP | God-Tier Sink |

---

## 8. Crafting System Architecture (v3.0.0)

The crafting subsystem is a data-driven dependency planner spanning 450 new raw materials and 216 new craftables across 18 practical domains. The authoritative catalog is defined in `src/data/craftingMaterials.js`, `src/data/craftingBlueprints.js`, and `src/data/craftingCatalog.js`; a generated human-readable reference is maintained in `docs/crafting-catalog.md`.

### Catalog composition and acquisition

| Catalog property | Contract |
| :--- | :--- |
| New raw materials | 450: 25 in each of 18 domains |
| New craftables | 216: 12 in each domain |
| Craftable roles | 130 intermediates and 86 finished products |
| New recipe forms | 60 raw-only, 96 mixed, and 60 crafted-only |
| Material sources | 200 Mine, 160 Explore, 50 Hunt, and 40 Fish |
| Successful action award | 8–15 distinct stacks, weighted without replacement |
| Integrated recipes | 10 legacy derived components and 15 socket modules |

Material drops use the existing shared inventory and action multipliers. New catalog entries are intentionally excluded from shop stock and transmutation. This preserves gathering as their acquisition path while letting the same material IDs support crafting, tool improvements, farm facilities, buildings, and later systems.

### Planning and transaction model

`src/engine/craftingEngine.js` exposes one planner to both preview and execution:

1. **Direct mode** verifies and consumes only the selected recipe's immediate ingredients.
2. **Recursive mode** reserves owned crafted inputs first, recursively creates only missing intermediates, detects cycles, aggregates atomic raw costs, and reports surplus intermediate output caused by batch sizes.
3. **Maximum mode** uses bounded binary search over the same planner, so the displayed maximum and executable maximum cannot drift apart.
4. **Atomic execution** plans against a cloned inventory, rejects any shortage without mutation, and commits the clone only after the entire plan succeeds.
5. **Locked-item protection** removes locked quantities from availability at every dependency level and prevents their consumption.

The server provides `GET /api/data/crafting-catalog`, `POST /api/crafting/preview`, and `POST /api/crafting/execute`. Preview is non-mutating; successful execution returns the updated player state, the full dependency plan, costs, steps, surplus, and output.

### Client and preferences

The Crafting panel supports Standard master/detail, Compact expandable-card, and Super Compact virtualized-row views. Search, domain, classification, effort, recipe-form, craftability, and sort controls persist locally. On narrow layouts the detail workflow moves into a native accessible dialog.

Quantity controls share a single preference resolver with the precedence `subject override → system override → global default`. Default buttons are `1`, `10`, `100`, `1000`, and `Max`; values, maximum visibility, preview policy, and large-operation threshold can be configured in Settings. The resolver is used by crafting, shop purchases, shop sales, booster activation, socket-module crafting, tool upgrades, and perk upgrades.

---

## 9. Verification & Operational Status

All core game engine logic, state persistence models, mathematical calculations, and API contracts have been thoroughly verified against the test suite (`node tests/run_all_tests.js`):
*   `test_all_engines.js`: **PASSING**
*   `test_boosterEngine.js`: **PASSING**
*   `test_error_indicator.mjs`: **PASSING**
*   `test_factionEngine.js`: **PASSING**
*   `test_multiplayer_faction_rules.js`: **PASSING**
*   `test_multiplayer_faction_contract.mjs`: **PASSING**
*   `test_farmEngine.js`: **PASSING**
*   `test_gambling_api.js`: **PASSING**
*   `test_gamblingEngine.js`: **PASSING**
*   `test_inventory_consolidation.js`: **PASSING**
*   `test_item_descriptions.js`: **PASSING**
*   `test_shopEngine.js`: **PASSING**
*   `test_targeted_rankup.js`: **PASSING**
*   `test_toast.mjs`: **PASSING**
*   `test_utils_item_categories.mjs`: **PASSING**
*   `test_waterByproducts.js`: **PASSING**
