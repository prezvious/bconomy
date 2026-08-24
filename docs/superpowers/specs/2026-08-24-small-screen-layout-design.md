# Small-Screen Layout Repair

Date: 2026-08-24

## Objective

Make the application accurate and fully operable on narrow phone viewports without horizontal page overflow, content overlap, clipped controls, or oversized navigation destinations. Desktop and tablet layouts remain unchanged.

## Approaches considered

1. **Fixed mobile navigation with a More sheet — selected.** Keep the four highest-priority destinations directly available and place the remaining destinations in an accessible bottom sheet. This provides standard-size touch targets without horizontal scrolling or a two-row bar that consumes excessive screen height.
2. **Ten icon-only destinations in one row.** This preserves direct access but produces touch targets below the 44px usability floor and removes the visible labels users rely on.
3. **Horizontally scrolling fixed-width destinations.** This preserves every label and touch-target size, but hides destinations off-screen and repeats the navigation behavior the user rejected.

## Approved behavior

### Mobile navigation

- At widths up to 640px, the bottom navigation is a fixed five-column grid with no horizontal scrolling.
- Actions, Farm, Inventory, and Crafting remain direct destinations. The fifth destination is More.
- More opens a modal bottom sheet containing Shop, Tools, Rank & Ascension, Gambling, Faction, and Settings.
- Selecting a destination from the sheet activates its existing panel, closes the sheet, and places the active indication on More while that secondary destination remains selected.
- The sheet supports keyboard focus, Escape closing, backdrop closing, focus restoration, and accessible names through the existing dialog controller.
- Every bottom-navigation and sheet destination has a minimum 44px touch target. Long labels wrap or truncate inside their own bounds and never change the width of another destination.
- Above 640px, the existing sidebar and all ten direct destinations remain unchanged.

### Gathering actions

- At widths up to 640px, every gathering strip uses a bounded two-column grid: identity and status occupy the flexible column, while the action button occupies a fixed control column and spans both rows.
- Cooldown progress, Ready state, and Work streak expiry information render below the action identity rather than competing for one horizontal line.
- Fixed desktop minimum widths are removed inside the mobile grid. Text and progress regions may shrink or wrap, but the action button remains fully visible.
- At very narrow widths, typography and gaps tighten modestly without dropping below readable text or 44px touch controls.

### Farm controls and general containment

- Crop claim controls remain side by side while both controls fit. At very narrow widths, they switch to a single-column layout with full-width controls.
- Farm card headings and selection controls wrap within the card rather than increasing its inline size.
- Relevant flex and grid children receive `min-width: 0` so long status text cannot enlarge the page.
- The main application surface must satisfy `scrollWidth === clientWidth` at supported narrow viewport widths.

## State and data flow

- The More sheet is presentation-only and does not add persistent state.
- Existing `activateSection()` remains the single route for panel activation and rendering.
- Mobile sheet destinations delegate to `activateSection()`, then close the dialog.
- `activateSection()` synchronizes the direct navigation state and the More button state according to whether the current destination is primary or secondary.

## Error handling

- If the More dialog or a requested panel is unavailable, navigation returns without changing the current panel.
- Repeated setup calls must not add duplicate event listeners.
- Closing the sheet without selecting a destination preserves the current panel and active state.

## Verification

- Static contract checks cover the fixed five-column mobile navigation, the secondary destination sheet, bounded action-card grid areas, narrow farm control stacking, and removal of mobile horizontal scrolling.
- Browser checks cover 320px, 360px, 390px, and 640px CSS viewport widths for Actions and Farm.
- At each checked width, no action button, Work streak label, farm control, or navigation destination may extend beyond its containing card or viewport.
- Desktop checks confirm the original sidebar and action-strip layout are unchanged above 640px.

