import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, ui, preferences, settings, shop, tools, perks, boosters] = await Promise.all([
    readFile(new URL('../public/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/style.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/crafting.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/preferences.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/settings.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/shop.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/tools.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/rankPrestigeCombined.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/boosterBulk.js', import.meta.url), 'utf8')
]);

console.log('--- Running Crafting UI Contract Tests ---');

for (const fragment of [
    'data-tab="crafting"', 'id="panel-crafting"', 'id="crafting-search"',
    'id="crafting-domain"', 'id="crafting-effort"', 'id="crafting-classification"',
    'id="crafting-form"', 'id="crafting-availability"', 'id="crafting-sort"',
    'data-crafting-view="standard"', 'data-crafting-view="compact"',
    'data-crafting-view="super-compact"', 'id="crafting-details-dialog"'
]) assert.ok(html.includes(fragment), `Missing crafting surface contract: ${fragment}`);

assert.ok(ui.includes('renderVirtualWindow'));
assert.ok(ui.includes("selectedMode === 'recursive'"));
assert.ok(ui.includes('doPreviewCrafting'));
assert.ok(ui.includes('doExecuteCrafting'));
assert.ok(ui.includes('shouldConfirmQuantityOperation'));
assert.ok(ui.includes('lockedItems'));
assert.ok(ui.includes('operationPending'));
const promptPool = ui.match(/const CRAFTING_SELECTION_PROMPTS = Object\.freeze\(\[([\s\S]*?)\n\]\);/);
assert.ok(promptPool, 'Crafting defines a frozen selection-prompt pool');
assert.equal((promptPool[1].match(/Object\.freeze\(\{ title:/g) || []).length, 20, 'Crafting provides exactly twenty complete landing prompts');
assert.ok(ui.includes('const sessionSelectionPrompt = CRAFTING_SELECTION_PROMPTS[Math.floor(Math.random() * CRAFTING_SELECTION_PROMPTS.length)]'));
assert.ok(ui.includes('if (!item) return selectionPromptHtml();'));
assert.ok(!ui.includes("settings.selectedRecipeId || craftables[0]?.recipeId"), 'Crafting never restores or auto-selects a recipe');
assert.ok(!ui.includes('|| items[0]'), 'Filtered results never implicitly become the active recipe');
assert.ok(!preferences.includes('selectedRecipeId'), 'Recipe selection is session-only rather than persisted');
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.crafting-detail-pane/);
assert.match(css, /\.crafting-list-row\.super-compact/);
assert.match(css, /\.crafting-selection-narrow\s*\{\s*display:\s*none/);
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.crafting-selection-narrow\s*\{[^}]*display:\s*block/s);
assert.match(css, /\.crafting-detail-pane\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s, 'Desktop crafting details scroll vertically without horizontal overflow');
assert.match(css, /\.crafting-dialog-body\s*\{[^}]*overflow-x:\s*hidden;[^}]*overflow-y:\s*auto;/s, 'Responsive crafting dialog scrolls vertically without horizontal overflow');
assert.match(css, /\.crafting-details-card\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%;/s, 'Crafting details card is constrained to its responsive container');
assert.match(css, /\.crafting-operation-controls\s*\{[^}]*repeat\(auto-fit,\s*minmax\(min\(240px,\s*100%\),\s*1fr\)\)/s, 'Crafting controls reflow when their pane narrows');
assert.match(css, /\.crafting-cost-line,[\s\S]*?\.crafting-result-group li\s*\{[^}]*flex-wrap:\s*wrap;/s, 'Long bill-of-material and result rows wrap instead of widening the card');

assert.ok(preferences.includes("'crafting', 'shop-buy', 'shop-sell', 'booster-activation'"));
for (const scope of ['global', 'system', 'subject']) assert.ok(settings.includes(`data-save-quantity-scope="${scope}"`));
assert.ok(shop.includes("systemId: 'shop-buy'"));
assert.ok(shop.includes("systemId: 'shop-sell'"));
assert.ok(tools.includes("systemId: 'socket-module-crafting'"));
assert.ok(tools.includes("systemId: 'tool-upgrades'"));
assert.ok(perks.includes("systemId: 'perk-upgrades'"));
assert.ok(boosters.includes("systemId: 'booster-activation'"));

console.log('✓ Three crafting views, vertical-only responsive details, authoritative actions, and shared preset integrations verified');
