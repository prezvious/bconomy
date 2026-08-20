# Farm Plot Leveling and Upgrade Materials Design

Date: 2026-08-20

## Objective

Add independent Levels 0–16 to farm plots. Every level reduces the plot's normal recurring crop duration by five percentage points, from no reduction at Level 0 to an 80% reduction at Level 16. Plot upgrades consume farm-upgrade materials only: they never consume cash and never invoke crafting.

The work also streamlines plot interaction into modal flows, removes the deferred compost system, adds realistic farm-upgrade materials to action loot and the rotating shop, and corrects watering so its 30-minute skip produces every harvest cycle covered by that time.

## State and architecture

Each plot persists an integer `level` in the inclusive range 0–16. New plots start at Level 0. Save normalization assigns Level 0 to legacy plots without a valid level, converts valid numeric levels to integers, and clamps them to the supported range. Level 0 is described as the baseline and is not rendered as `Level 0` on plot cards.

A focused `farmPlotUpgrade` module owns:

- level and reduction constants;
- material definitions and recipes;
- the target-value curve and recipe-balance validation;
- effective-duration calculation;
- recipe aggregation;
- one-level and max-affordable previews;
- inventory validation and atomic consumption planning.

`FarmEngine` remains the mutation authority for plots, recurring harvests, planting, upgrading, watering, and uprooting. Upgrade materials live in normal player inventory, not farm crop storage.

No generalized crafting abstraction is introduced. Crafting remains out of scope.

## Growth and catch-up rules

For plot level `L` and crop base duration `Dbase`:

```text
Deffective = Dbase × (1 - 0.05 × L)
```

The calculation uses millisecond precision. At Level 1, duration is 95% of base; at Level 16, duration is 20% of base. All normal recurring and offline harvest processing uses the plot's current effective duration.

When an occupied plot is upgraded:

1. Process cycles already due under the old level at the current timestamp.
2. Apply the newly purchased level or levels.
3. Recalculate the active cycle from its recorded `plantedAt` using the new effective duration.
4. Award every newly completed cycle immediately to Crop Storage & Logistics.
5. Carry remaining partial progress into the next reduced cycle.

This behavior applies whether one level or multiple levels are purchased.

## Watering correction

The global Water All action remains on a ten-minute cooldown and represents a fixed 30-minute time skip for every active plot. Individual plot watering is removed from the public interface and API.

For each active plot, watering:

1. settles cycles already due at the current time;
2. moves `nextHarvestAt` backward by 1,800,000 milliseconds;
3. calculates every cycle completed by that shift with the plot's effective duration;
4. awards every accelerated crop yield to farm storage;
5. preserves leftover cycle progress.

An eight-second effective cycle watered immediately after starting therefore completes 225 cycles. Every accelerated cycle receives the Water Abundance yield multiplier, its own crop-specific per-harvest effect roll, and its corresponding Weeds and Red Mushroom byproducts. Byproducts scale with the number of accelerated cycles.

## Materials and recipe balance

The formula below is a design-time effort target, not a market price, player currency, crafting value, or permanent property of a material:

```text
U(L) = 35,000 × max(1, L - 1)^2.5
```

Preserving the reference quantities makes fixed per-material values incompatible with the curve because Irrigation Tubing spans progression bands. Recipe balance is therefore validated with phase normalization:

- target Levels 1–4: 93 effort units per required item;
- target Levels 5–9: 6,200 effort units per required item;
- target Levels 10–16: 122,000 effort units per required item.

Every recipe stays within approximately 3.3% of `U(L)`. Effort is balancing metadata and is never spent or displayed as a currency.

### Levels 1–4

| Upgrade | Gravel | Fence Post | Irrigation Tubing | Target `U(L)` |
|---|---:|---:|---:|---:|
| Level 0 → 1 | 340 | 34 | 2 | 35,000 |
| Level 1 → 2 | 342 | 35 | 2 | 35,000 |
| Level 2 → 3 | 1,930 | 193 | 7 | 197,990 |
| Level 3 → 4 | 5,315 | 532 | 18 | 545,596 |

### Levels 5–9

| Upgrade | Paving Stone | Treated Board | Granular Fertilizer | Irrigation Tubing | Target `U(L)` |
|---|---:|---:|---:|---:|---:|
| Level 4 → 5 | 142 | 12 | 9 | 19 | 1,120,000 |
| Level 5 → 6 | 248 | 21 | 16 | 32 | 1,956,559 |
| Level 6 → 7 | 391 | 32 | 25 | 51 | 3,086,357 |
| Level 7 → 8 | 574 | 47 | 35 | 74 | 4,537,463 |
| Level 8 → 9 | 802 | 65 | 50 | 103 | 6,335,677 |

The supplied per-level fertilizer quantities total 135. The conflicting supplied total of 53 is treated as a reference typo.

### Levels 10–16

| Upgrade | Galvanized Frame | Solar Cell | Frost Blanket | Brass Valve | Outdoor Cable | Water Pump | Target `U(L)` |
|---|---:|---:|---:|---:|---:|---:|---:|
| Level 9 → 10 | 2 | 16 | 4 | 4 | 44 | 2 | 8,505,000 |
| Level 10 → 11 | 2 | 21 | 5 | 5 | 57 | 2 | 11,067,972 |
| Level 11 → 12 | 3 | 26 | 6 | 6 | 72 | 2 | 14,045,906 |
| Level 12 → 13 | 4 | 33 | 7 | 7 | 89 | 3 | 17,459,072 |
| Level 13 → 14 | 4 | 40 | 9 | 9 | 109 | 3 | 21,326,836 |
| Level 14 → 15 | 5 | 48 | 10 | 10 | 131 | 4 | 25,667,770 |
| Level 15 → 16 | 6 | 57 | 12 | 12 | 155 | 5 | 30,499,744 |

## Material descriptions

| Material | Description |
|---|---|
| Gravel | Washed stone aggregate used to improve drainage and provide firm footing around cultivated plots. |
| Fence Post | A pressure-treated timber post for supporting borders, trellises, and protective farm fencing. |
| Paving Stone | A durable stone slab that stabilizes paths and keeps foot traffic away from growing soil. |
| Treated Board | Weather-resistant lumber used for raised beds, plot edging, and structural repairs. |
| Granular Fertilizer | A dry nutrient blend worked into soil to support consistent, vigorous crop growth. |
| Irrigation Tubing | Flexible water line that distributes moisture evenly across a farm plot. |
| Galvanized Frame | A rust-resistant steel support for durable plot structures and greenhouse fittings. |
| Solar Cell | A compact photovoltaic unit used to power pumps, sensors, and field controls. |
| Frost Blanket | An insulating crop cover that protects plants and equipment from sudden temperature changes. |
| Brass Valve | A corrosion-resistant fitting used to control water pressure and irrigation flow. |
| Outdoor Cable | Weatherproof electrical cable rated for pumps and equipment exposed to the elements. |
| Water Pump | An agricultural pump that keeps upgraded irrigation moving at a reliable rate. |

All twelve items use a distinct `Farm Upgrade Material` inventory category and recognizable item icons.

## Action drops

Every successful Mine, Explore, Hunt, or Fish action independently rolls all farm materials. Work is excluded. Multiple farm materials may drop from one action. No material is gated by rank or prestige.

| Material | Base chance per action | Base stack |
|---|---:|---:|
| Gravel | 20% | 40–120 |
| Fence Post | 12% | 4–12 |
| Paving Stone | 8% | 10–30 |
| Treated Board | 4% | 2–5 |
| Granular Fertilizer | 4% | 1–4 |
| Irrigation Tubing | 3.5% | 2–6 |
| Galvanized Frame | 0.75% | 1 |
| Solar Cell | 1.5% | 1–2 |
| Frost Blanket | 0.5% | 1 |
| Brass Valve | 0.5% | 1 |
| Outdoor Cable | 1.25% | 2–8 |
| Water Pump | 0.2% | 1 |

Tool yield, loot boosters, faction effects, and multistrike scale the awarded stack. Lucky Drops and applicable rare-drop socket bonuses modify material chances at or below 5%, capped at 100%. Base percentages remain literal chances and are included in action result data.

## Shop configuration

The farm materials are ordinary buyable and sellable inventory items. Their buy and sell prices roll independently each ten-minute restock. Intentional overlap permits lucky market opportunities.

| Material | Sell range | Buy range | Listing chance | Stock when listed |
|---|---:|---:|---:|---:|
| Gravel | $250–$700 | $500–$1,200 | 90% | 250–1,200 |
| Fence Post | $2,000–$6,000 | $4,000–$10,000 | 75% | 25–120 |
| Paving Stone | $1,000–$3,500 | $2,500–$6,000 | 70% | 50–250 |
| Treated Board | $15,000–$45,000 | $30,000–$80,000 | 55% | 10–50 |
| Granular Fertilizer | $20,000–$60,000 | $40,000–$100,000 | 50% | 8–40 |
| Irrigation Tubing | $12,000–$40,000 | $25,000–$75,000 | 50% | 10–60 |
| Galvanized Frame | $1.5M–$4M | $3M–$7M | 15% | 1–4 |
| Solar Cell | $250,000–$800,000 | $600,000–$1.4M | 25% | 4–20 |
| Frost Blanket | $800,000–$2.4M | $1.8M–$4M | 12% | 1–5 |
| Brass Valve | $900,000–$2.8M | $2M–$5M | 12% | 1–5 |
| Outdoor Cable | $100,000–$350,000 | $250,000–$650,000 | 30% | 10–60 |
| Water Pump | $2.5M–$7M | $5M–$12M | 8% | 1–2 |

Normal shop items gain optional explicit `buyRange` support. The twelve farm materials use it. Existing items without `buyRange` continue using their current markup-derived behavior unchanged.

## Upgrade transactions

The server supports a preview and an execution operation for `next` and `max` modes. It never trusts preview data during execution.

One-level mode aggregates the next recipe only. Max mode displays aggregate requirements from the current level through Level 16, plus the highest sequential level affordable with current inventory.

`Upgrade to Max Level` consumes available materials sequentially and stops before the first unaffordable level. It does not require the complete Level 16 total and cannot skip an unaffordable intermediate recipe. The execution button is labeled `Upgrade as Far as Possible`.

Every upgrade is atomic:

- reject unknown plots, malformed levels, malformed inventory, and maxed plots;
- determine the contiguous affordable target;
- validate aggregate owned quantities before mutation;
- consume inventory once without permitting negative values;
- apply the level and harvest recalculation only after validation succeeds;
- leave state unchanged if the next level is unaffordable.

Upgrades never consume money.

## Plot interface

Plot cards are compact keyboard-accessible click targets. They retain crop status, progress, and timer information but contain no inline crop selector, Water, Compost, Remove, or Uproot buttons. Cards above baseline show `Level N` beside `Plot #N`; baseline cards show no level text.

Clicking a plot opens a management dialog.

An empty plot shows:

- `Empty`;
- a green `Plant Crops` action;
- a blue `Upgrade Plot` action.

An occupied plot shows:

- crop name and current progress;
- actual baseline yield with level-adjusted duration, such as `3× Blueberry every 4 seconds`;
- an orange-red `Uproot` action;
- a stronger red `Uproot Same Crop` action;
- a blue `Upgrade Plot` action.

Harvesting remains global through Crop Storage & Logistics. The modal contains no Harvest action.

`Plant Crops` replaces the plot dialog with a crop-selection dialog. Seeds remain unlimited. Plant success reopens the updated plot dialog; Cancel or Back returns to it. The existing global Manage Farm and Plant All behavior remain unchanged.

The upgrade dialog offers `Upgrade One Level` and `Upgrade to Max Level`. It displays owned/required material counts, highlights sufficiency, shows `Inventory allows: Level N` in max mode, and returns to the refreshed plot dialog after success. At Level 16 it displays `Maximum level reached` and no upgrade action. Baseline is labeled `Baseline plot · 0% reduction`, not `Level 0`.

Displayed durations retain millisecond precision internally, render with at most one decimal place, and omit `.0` for whole values.

## Uprooting

`Uproot` empties the selected plot. `Uproot Same Crop` empties every plot containing the same crop, including plots in the middle of a cycle. Both discard the current planted crop without refunds; seeds remain unlimited. Previously harvested crop storage is never changed.

Both actions confirm by default. Each confirmation has an independent suppression key with this checkbox label:

```text
I know what I’m uprooting—skip this warning next time.
```

Suppressing single-plot confirmation does not suppress bulk confirmation. The existing Reset Ignored Confirmations control restores both.

## Compost removal

Remove compost state, calculations, engine method, server endpoint, API helper, plot controls, tags, descriptions, documentation, and tests. Legacy `composted` properties are ignored and removed during farm normalization.

Pumpkin remains a normal crop with no special effect. Its description becomes:

> A broad orange field pumpkin with dense, earthy flesh—a dependable harvest valued for its steady, straightforward yield.

One source comment beside Pumpkin records that compost is intentionally deferred and Pumpkin currently has no special effect. Dead compost code is not retained.

## API surface

Add server-authoritative farm operations for:

- previewing a one-level or max plot upgrade;
- executing a one-level or max plot upgrade;
- uprooting one plot;
- uprooting all plots containing the selected plot's crop.

Remove the old farm remove, individual-water, and apply-compost endpoints and their client helpers. Keep global Water All, Add Plot, Plant, Plant All, Claim, and Melon behavior.

## Verification requirements

Automated coverage must prove:

- all 16 recipes and target-value tolerance;
- Level 0 defaults and save migration;
- every level's duration, including Level 16 at 20% of base;
- offline recurring harvests with level-adjusted cycles;
- mid-cycle one-level and multi-level catch-up harvests with leftover progress;
- a 30-minute water skip producing 225 cycles for an eight-second plot;
- per-cycle water yield bonuses, crop-effect rolls, and byproducts;
- one-level and max-affordable preview/execution, shortages, exact inventories, atomic consumption, no cash mutation, and max-level behavior;
- single and same-crop uprooting with unchanged storage;
- independent confirmation suppression;
- literal farm-material chances, multi-drop results, multiplier behavior, and absence of rank/prestige gates;
- independent farm-material buy/sell ranges plus unchanged legacy markup pricing;
- card labels, modal transitions, keyboard and focus behavior, responsive layout, and absence of Water, Compost, and Remove controls;
- updated item descriptions and documentation.

The full available test suite must pass after targeted tests, and the farm UI must be inspected at desktop and narrow responsive widths.
