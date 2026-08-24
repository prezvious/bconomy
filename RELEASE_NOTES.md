# Bconomy Release Notes

Personal game updates, changelogs, and version history.

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
