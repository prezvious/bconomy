# General Farm Management, Bulk Upgrades, and Plot Marking

Date: 2026-08-20

## Objective

Replace the farm's seed-specific management entry point with a general Manage Farm dialog while preserving Plant All. Add persistent plot marks and server-authoritative bulk plot upgrades for all plots, typed plot numbers and ranges, or the marked set.

## Approved behavior

- Manage Farm uses Plant Seeds and Upgrade Plots tabs and opens on Plant Seeds.
- Plot marks are card-level Iconify bookmark toggles saved as `farm.markedPlotIds`. They persist until explicitly cleared.
- The plot grid exposes Mark All, Invert, Clear, and a marked count.
- Specific selection accepts expressions such as `1, 3, 5-8`, validates against existing plot IDs, and displays the current available ranges.
- Bulk upgrades support one level per target or as far as possible. Empty and planted plots are eligible; Level 16 plots are reported as skipped.
- Allocation is balanced and deterministic: each pass prioritizes the lowest projected level and then plot number, while unaffordable recipes do not prevent other affordable targets from advancing.
- Every bulk action requires a non-mutating preview. Execution recomputes the plan, consumes aggregate materials atomically, preserves cash, settles active-plot catch-up, and leaves marks intact.

## Deferred uses

Plant Marked, confirmed Uproot Marked, criteria presets, marked-set summaries, and named field groups remain follow-up work. Per-plot watering remains excluded because hydration is intentionally global.
