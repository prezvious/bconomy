# Responsive Crafting Details

Date: 2026-08-24

## Objective

Keep recipe details readable at every supported viewport and pane width while allowing vertical scrolling only. No details content may create a left-to-right scrollbar in the Standard pane or responsive dialog.

## Approved behavior

- The Standard details pane and responsive details dialog use `overflow-y: auto` and suppress horizontal scrolling.
- The details card never exceeds the inline width of its containing pane, dialog, or expanded compact card.
- Long recipe names, categories, descriptions, material names, quantities, and preview result text wrap without being truncated.
- Specification cards, operation controls, and preview result groups automatically reduce their column count when the containing width narrows.
- Bill-of-material and result rows retain side-by-side name and quantity presentation where space permits, then wrap naturally when it does not.
- Status badges and action controls remain fully visible and operable at narrow widths.

## Verification

- Static UI contracts assert vertical-only pane and dialog overflow plus responsive containment and wrapping rules.
- Browser checks cover desktop Standard view and narrow dialog view, including long catalog entries and preview content.
- At each tested width, the details card and its scroll container must satisfy `scrollWidth === clientWidth` while vertical overflow remains available.
