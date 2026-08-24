# Crafting System

Bconomy v3.0.0 adds a server-authoritative crafting catalog and planner. The canonical data lives in `src/data/craftingMaterials.js`, `src/data/craftingBlueprints.js`, and `src/data/craftingCatalog.js`; `docs/crafting-catalog.md` is generated from those sources.

## Catalog

- 450 raw materials: 25 in each of 18 real-world domains.
- 216 new products: 12 per domain, split into 130 intermediates and 86 finished products.
- 10 existing derived components and 15 socket modules use the same recipe registry.
- New recipe forms are exactly 60 raw-only, 96 mixed raw/crafted, and 60 crafted-only.
- Every raw material is used, at least 225 are reused, every intermediate has a downstream consumer, and the dependency graph is acyclic.

## Acquisition

Mine supplies 200 material types, Explore 160, Hunt 50, and Fish 40. A successful supported action draws 8–15 distinct material types without replacement using rarity weights, then rolls the stack within that rarity's configured range. Existing tool, booster, faction, and multistrike yield multipliers scale the awarded stacks. Work does not award crafting materials.

New raw materials and craftables are deliberately absent from normal shop stock, sell prices, and transmutation. They remain general inventory resources available to crafting and future tool, farm, facility, and building upgrades.

## Planning and execution

Direct mode requires the requested recipe inputs to be owned. Recursive mode expands missing craftable inputs into their recipes until it reaches atomic raw stock. Owned intermediates are consumed before newly produced ones. Locked item types have zero available quantity and generate explicit locked shortages.

Preview never mutates player state. It reports the resolved craft count, ordered steps, direct costs, aggregate raw costs, owned and generated intermediate use, shortages, locked shortages, and surplus. Execute recalculates the plan against the submitted state and commits a cloned state only when the entire plan succeeds. `Max` uses bounded exponential probing followed by binary search.

## API

- `GET /api/crafting/catalog` returns versioned materials, craftables, recipes, bands, domains, and validation summary.
- `POST /api/crafting/preview` accepts `playerState`, `recipeId`, `craftCount`, and `mode`.
- `POST /api/crafting/execute` accepts the same payload and returns the updated `playerState` only on success.
- `POST /api/tool/module/craft` remains compatible and delegates to the shared engine.

`craftCount` must be a positive safe integer or the string `"max"`; `mode` must be `"direct"` or `"recursive"`.

## Client workspace

Standard uses a virtualized master list and an adjacent details pane. Compact renders expandable cards. Super Compact uses a virtualized one-line list and opens details in a dialog. On narrow layouts, Standard also uses the dialog. Recipe details scroll vertically only: long names, material quantities, specification cards, controls, and preview results wrap or reflow within the available pane or dialog width instead of creating horizontal scrolling. Search, all filters, sort order, and view persist in browser-local settings. The first Crafting visit after a full game load starts without a selection and shows one of 20 per-load workshop prompts; a player-selected recipe remains active only for the rest of that loaded session.

Four editable quantity buttons plus immutable Max resolve through global → system → subject inheritance. Supported systems are crafting, shop purchases, shop sales, booster activation, socket-module crafting, tool upgrades, and perk upgrades. Preview policy resolves through the same scopes.

## Verification

Run `npm test` for catalog, engine, API, action-drop, preference, UI-contract, and full regression coverage. Run `npm run docs:crafting` after any canonical catalog change and confirm that the generated documentation diff matches the intended data change.
