import assert from 'assert';
import fs from 'fs';

console.log('--- Running Quality-of-Life UI Contract Tests ---');

const html = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../public/style.css', import.meta.url), 'utf8');
const inventory = fs.readFileSync(new URL('../public/js/ui/inventory.js', import.meta.url), 'utf8');
const shop = fs.readFileSync(new URL('../public/js/ui/shop.js', import.meta.url), 'utf8');
const crafting = fs.readFileSync(new URL('../public/js/ui/crafting.js', import.meta.url), 'utf8');
const rank = fs.readFileSync(new URL('../public/js/ui/rankPrestigeCombined.js', import.meta.url), 'utf8');
const settings = fs.readFileSync(new URL('../public/js/ui/settings.js', import.meta.url), 'utf8');

for (const id of ['header-rank-deficit', 'inventory-batch-toolbar', 'prestige-simulator', 'btn-item-modal-wishlist', 'item-modal-where-used']) {
    assert(html.includes(`id="${id}"`), `Missing ${id}`);
}
assert(html.includes('name="targeted-rank-mode"') && html.includes('value="next"') && html.includes('value="max"') && html.includes('value="custom"'));
assert(inventory.includes('data-item-action="favorite"') && html.includes('data-inventory-batch="sell"'));
assert(shop.includes('wishlist-highlight') && shop.includes('sell-roll-track') && shop.includes('btn-extend-active-boosters'));
assert(crafting.includes('data-crafting-max') && crafting.includes('data-craft-intermediate') && crafting.includes('data-craft-navigate'));
assert(rank.includes('doOptimizePerks') && rank.includes('doAscendAndApplyAllocation'));
assert(settings.includes('setting-sell-roll-display') && settings.includes('setting-wishlist-alert-mode') && settings.includes('setting-inventory-lasso'));
assert(css.includes('.inventory-item.is-selected') && css.includes('.sell-roll-badge') && css.includes('.prestige-simulator'));
assert(css.includes('@media (max-width: 760px)'), 'QOL surfaces require narrow responsive rules');
console.log('✓ Tracker, simulator, selection, wishlist, sell-roll, booster, and crafting surfaces are wired and responsive');
console.log('--- Quality-of-Life UI Contract Tests Passed ---');
