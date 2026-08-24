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
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.crafting-detail-pane/);
assert.match(css, /\.crafting-list-row\.super-compact/);

assert.ok(preferences.includes("'crafting', 'shop-buy', 'shop-sell', 'booster-activation'"));
for (const scope of ['global', 'system', 'subject']) assert.ok(settings.includes(`data-save-quantity-scope="${scope}"`));
assert.ok(shop.includes("systemId: 'shop-buy'"));
assert.ok(shop.includes("systemId: 'shop-sell'"));
assert.ok(tools.includes("systemId: 'socket-module-crafting'"));
assert.ok(tools.includes("systemId: 'tool-upgrades'"));
assert.ok(perks.includes("systemId: 'perk-upgrades'"));
assert.ok(boosters.includes("systemId: 'booster-activation'"));

console.log('✓ Three crafting views, responsive details, authoritative actions, and shared preset integrations verified');
