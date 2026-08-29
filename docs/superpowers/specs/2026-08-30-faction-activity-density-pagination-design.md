# Faction Activity Density and Pagination Design

## Goal

Shorten the Faction Activity page while keeping faction events and treasury changes easy to compare. The page will replace the current unbounded rendering of up to 100 entries per section with local view-density controls and independent client-side pagination.

## Scope

This change applies only to the member-facing Activity tab in the Faction workspace. It does not change the player's global Interface Density setting, the faction snapshot API, database retention, activity ordering, or the existing limit of 100 recent activity entries and 100 recent treasury entries.

## Local view-density control

The Activity tab will expose a three-option segmented control above the two history sections:

- **Comfortable** shows 10 entries per section. Rows retain a spacious two-line presentation.
- **Compact** shows 5 entries per section. Rows retain the two-line information hierarchy with reduced spacing.
- **Super Compact** shows 5 entries per section. Rows use a dense, table-like presentation that keeps the primary event, metadata, and amount on one line when space allows.

This control is independent from the global Interface Density preference. Changing either setting must not change the other. The selected Activity density will be stored locally and restored on later visits. An absent or invalid stored value falls back to Comfortable.

## Layout and pagination

Faction Activity and Treasury Ledger remain side by side on wide screens and stack at the existing responsive breakpoint.

Each section owns an independent page index because the histories can have different lengths. A footer beneath each list contains:

- Previous button
- `Page X of Y` status
- Next button

The footer also exposes the visible range and total, such as `1–5 of 37`, so players can understand how much history is available. Previous and Next are disabled at their respective boundaries. Empty sections retain their existing empty-state copy and do not show misleading pagination controls.

Switching Activity density resets both sections to their first page. A refreshed faction snapshot clamps each page index to the last valid page so a shorter result cannot leave the interface on an empty page.

## Rendering and state

The Faction UI module will own:

- the selected Activity density;
- the current Faction Activity page;
- the current Treasury Ledger page;
- helpers for validating density, deriving page size, calculating page counts, clamping indexes, and slicing visible entries.

Rendering remains client-side over the arrays already returned in the faction snapshot. Pagination does not trigger a command or additional network request. The existing descending chronological order is preserved.

## Responsive behavior

On desktop, the two history cards remain in the current two-column grid. On screens below the existing faction breakpoint, they stack into one column.

Super Compact rows may wrap on narrow screens instead of forcing horizontal page scrolling. Treasury amounts remain visually aligned and must not overlap event labels or timestamps.

## Accessibility

- The density selector is an explicitly labelled group of buttons with a programmatic pressed or selected state.
- Previous and Next use native buttons and expose disabled boundaries.
- Page and range text is readable by assistive technology and updates with the rendered page.
- All controls remain keyboard operable and retain visible focus styling.
- Density changes do not move focus unexpectedly.
- No new animation is required; the existing reduced-motion behavior remains sufficient.

## Error and recovery behavior

Invalid locally stored density values fall back to Comfortable without blocking the Activity tab. Missing, empty, or malformed activity and ledger arrays render the existing empty-state text. Pagination helpers treat non-array data as an empty list and never produce page zero or an out-of-range slice.

## Verification

Automated coverage will verify:

- Comfortable renders 10 entries per section.
- Compact and Super Compact render 5 entries per section.
- Faction Activity and Treasury Ledger paginate independently.
- Boundary buttons disable correctly.
- Density changes reset both page indexes.
- Refreshed data clamps page indexes safely.
- The selected local density persists without changing global Interface Density.
- Empty histories render their empty state without pagination.
- Required labels and accessibility state are present.
- Existing faction and complete repository test suites continue to pass.

Manual responsive review will verify the two-column desktop layout, stacked small-screen layout, row wrapping, aligned treasury values, keyboard operation, and all three density presentations.

## Release impact

This is a backward-compatible interface enhancement. It adds no API or schema changes and requires no data migration. Under Semantic Versioning it qualifies for a minor version increment because it adds a new user-facing view control and pagination behavior.
