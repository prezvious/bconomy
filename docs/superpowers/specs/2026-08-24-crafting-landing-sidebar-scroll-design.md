# Crafting Landing State and Sidebar Scrolling

Date: 2026-08-24

## Objective

Prevent Crafting from implying that the player selected the first catalog recipe, and keep the growing desktop navigation usable at short viewport heights.

## Crafting landing behavior

- The first Crafting visit after each full game load starts with no selected recipe.
- A pool of exactly 20 concise headline-and-description pairs provides actionable selection guidance.
- One pair is chosen once when the Crafting module loads. It remains stable for that loaded session and changes only after a full reload.
- The prompt appears in the Standard details pane and as a compact invitation wherever a details pane is unavailable.
- Searching, filtering, sorting, changing density, and repeated renders never select a recipe implicitly.
- After the player selects a recipe, that selection remains while navigating within the same loaded session.
- A full reload clears the selection. A previously stored recipe ID is not restored.

## Sidebar behavior

- The Bconomy logo remains fixed at the top of the desktop sidebar.
- The release/version button remains fixed at the bottom.
- Only the navigation list scrolls vertically when its contents exceed the available height.
- The scroll region uses contained overscroll and a subtle scrollbar based on existing semantic colors.
- The compact desktop sidebar retains vertical scrolling.
- The mobile layout retains its existing horizontal tab-bar scrolling and safe-area handling.

## Accessibility and verification

- Empty-state copy uses a heading and plain action-oriented description; decorative icons remain hidden from assistive technology.
- Existing keyboard focus behavior brings focused navigation buttons into the scrollable viewport through native scrolling.
- Contract tests verify the 20-prompt pool, removal of automatic-selection fallbacks and persistent recipe restoration, and the desktop/mobile overflow rules.
- Browser checks cover desktop, a short desktop viewport, compact-sidebar width, and mobile width, followed by the complete automated test suite.
