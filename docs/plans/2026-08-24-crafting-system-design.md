# General Crafting and Materials Design

Date: 2026-08-24
Release: v3.0.0

## Objective

Add a server-authoritative general crafting system to Bconomy with exactly 450 new action-gathered raw materials and 216 new craftables across 18 realistic domains. Crafting is instant, deterministic, atomic, visible from launch, and supports both direct recipes and recursive crafting with prerequisites.

## Approved content model

- Each domain owns 25 raw materials and 12 craftables.
- The craftables comprise 130 intermediates and 86 finished products.
- Recipe forms total 60 raw-only, 96 crafted-plus-raw, and 60 crafted-only.
- Recipes have one to five distinct inputs, positive safe-integer quantities, one deterministic output, no byproducts, no alternatives, no cycles, and a maximum dependency depth of 12.
- The 10 existing derived tool components gain recipes. The 15 existing socket modules join the shared recipe catalog while remaining stored in `toolModules`; these 25 legacy outputs do not count toward the 216 new craftables.
- All content is physical, lawful, real-world hardware or material. Defense recipes remain abstract game-unit bills of material and provide no operational fabrication instructions.

## Acquisition and economy boundaries

- New materials come only from successful Mine, Explore, Hunt, and Fish actions: Mine 200, Explore 160, Hunt 50, Fish 40.
- A successful gathering action awards 8-15 distinct new material stacks, selected by rarity-weighted draws without replacement.
- Rarity totals are Common 135, Uncommon 112, Rare 90, Very Rare 63, Ultra Rare 36, and Exceptional 14. Base stack bands descend from 25-100 for Common to exactly 1 for Exceptional.
- Existing tool yield, booster, faction, luck, rare-drop, and multistrike behavior applies at the existing reward stages.
- New materials and craftables never appear in the shop and never participate in transmutation.

## Crafting engine

`CraftingEngine` owns validation, previewing, maximum-count calculation, and execution. Direct mode consumes only immediate inputs. Recursive mode consumes eligible owned intermediates first, recursively builds shortages, carries deterministic batch surplus, and never consumes locked item types. Preview is pure; execution recomputes the plan against the submitted state and commits only after the complete staged transaction succeeds.

Public routes:

- `GET /api/crafting/catalog`
- `POST /api/crafting/preview`
- `POST /api/crafting/execute`

Preview and execute accept `{ playerState, recipeId, craftCount, mode }`, where `craftCount` is a positive safe integer or `"max"`, and `mode` is `"direct"` or `"recursive"`. The existing socket-module crafting route becomes a compatibility adapter to the shared engine.

## Client experience

Crafting appears between Inventory and Shop in the existing vanilla single-page application. It has Standard, Compact, and Super Compact persisted views. Standard uses a virtualized master-detail layout and a narrow-screen details dialog; Compact uses dense expandable cards; Super Compact uses a virtualized table/list with a details dialog. Search, filters, sorting, dependency details, immediate and aggregate costs, shortages, surplus, and direct/recursive actions are available without a frontend copy of the crafting engine.

Four editable positive-integer quantity presets plus immutable Max inherit through global, system, and subject scopes. Defaults are 1, 10, 100, 1000, Max. The presets apply to Crafting, Shop Buy/Sell, Booster Activation, Socket Module Crafting, Tool Upgrades, and Perk Upgrades. Preview policy supports Every, Recursive only, Large only, and Never, with Recursive only and a threshold of 100 as defaults; global skip-all-previews overrides it.

## Verification and release

Automated validation covers all catalog totals, metadata, sources, rarities, effort bands, recipe forms, material use, reuse, cross-domain inputs, downstream intermediate use, graph acyclicity, and depth. Engine tests cover direct, recursive, maximum, locked-item, surplus, malformed-input, and atomic-failure behavior. Seeded gathering tests cover distinct draws, stack bands, sources, and multipliers. UI and preference tests cover all views, inheritance, confirmations, responsive behavior, accessibility, and pending-request protection.

The complete existing and new test suite, desktop smoke test, and 360 px smoke test must pass before the release commit and annotated `v3.0.0` tag are pushed to `origin/main`. `vercel.json` remains on Vercel schema version 2.
