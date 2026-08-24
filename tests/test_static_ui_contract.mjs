import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
const inventoryJs = await readFile(new URL('../public/js/ui/inventory.js', import.meta.url), 'utf8');
const shopJs = await readFile(new URL('../public/js/ui/shop.js', import.meta.url), 'utf8');
const settingsJs = await readFile(new URL('../public/js/ui/settings.js', import.meta.url), 'utf8');
const collapsibleSearchJs = await readFile(new URL('../public/js/ui/collapsibleSearch.js', import.meta.url), 'utf8');

console.log('--- Running Static UI Contract Tests ---');

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert.deepEqual(duplicateIds, [], `HTML IDs must be unique: ${duplicateIds.join(', ')}`);

const dialogOpenCount = (html.match(/<dialog\b/g) || []).length;
const dialogCloseCount = (html.match(/<\/dialog>/g) || []).length;
assert.equal(dialogOpenCount, dialogCloseCount, 'Every dialog opening tag must be closed');
assert.equal(dialogOpenCount, 19, 'All nineteen app dialogs use the shared native pattern');

for (const match of html.matchAll(/<dialog\b([^>]*)>/g)) {
    const attributes = match[1];
    assert.match(attributes, /\bdata-app-dialog\b/, 'Every dialog must opt into the shared controller');
    const labelMatch = attributes.match(/aria-labelledby="([^"]+)"/);
    assert(labelMatch && ids.includes(labelMatch[1]), 'Every dialog must reference a real accessible title');
}

for (const requiredId of [
    'inventory-search',
    'inventory-category',
    'inventory-sort',
    'inventory-view-grid',
    'inventory-view-compact',
    'bulk-actions-modal',
    'bulk-preview-modal',
    'bulk-booster-modal',
    'bulk-booster-preview-modal',
    'plot-management-modal',
    'plant-crop-modal',
    'plot-upgrade-modal',
    'farm-manage-modal',
    'farm-bulk-upgrade-preview-modal',
    'btn-open-bulk-boosters',
    'create-faction-modal',
    'auth-modal',
    'account-profile-modal',
    'release-notes-modal',
    'btn-release-notes',
    'btn-release-expand-all',
    'btn-release-collapse-all'
]) {
    assert(ids.includes(requiredId), `Required redesigned control #${requiredId} is present`);
}

assert(!/transition:\s*all\b/i.test(css), 'CSS must not animate every property');
assert(css.includes('[data-density="dense"]') && css.includes('[data-density="comfortable"]'), 'Density tokens cover dense and comfortable modes');
assert(css.includes('.toolbar-search.is-collapsed') && css.includes('.toolbar-search.is-expanded'), 'Collapsible toolbar search states are styled');
assert(css.includes('.page-toolbar.search-collapsed') && css.includes('.page-toolbar.search-expanded'), 'Toolbar grid responds to search state');
assert(css.includes('/* Mobile Tab Bar */'), 'Mobile navigation uses a dedicated tab bar treatment');
assert(css.includes('env(safe-area-inset-bottom)'), 'Mobile navigation respects device safe areas');
assert(css.includes('overscroll-behavior-x: contain'), 'Mobile navigation contains horizontal overscroll');
assert(css.includes('touch-action: manipulation'), 'Mobile navigation buttons are touch-optimized');
assert(css.includes('.guild-sidebar .sidebar-footer'), 'Mobile navigation hides desktop sidebar chrome');
assert(css.includes('@media (max-width: 380px)'), 'The UI includes a narrow 360px-safe breakpoint');
assert(css.includes('@media (prefers-reduced-motion: reduce)'), 'Reduced-motion preferences are respected');
assert(/\.item-card-top\s*\{[^}]*flex-wrap:\s*wrap/s.test(css), 'Inventory card metadata wraps as whole units when space is constrained');
assert(/\.item-qty\s*\{[^}]*white-space:\s*nowrap/s.test(css), 'Inventory quantities never split across lines');
assert(!/\.inventory-grid\.compact\s+\.item-cat-badge\s*\{[^}]*max-width:\s*76px/s.test(css), 'Compact inventory badges are not truncated by the obsolete fixed width');
assert(settingsJs.includes('setting-collapse-search-on-blur'), 'Settings exposes the active-search blur preference');
assert(inventoryJs.includes("from './collapsibleSearch.js'"), 'Inventory wires shared collapsible search behavior');
assert(shopJs.includes("from './collapsibleSearch.js'"), 'Shop wires shared collapsible search behavior');
assert(collapsibleSearchJs.includes('collapseSearchOnBlur'), 'Collapsible search helper reads the blur-collapse preference');

const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
let braceDepth = 0;
for (const character of cssWithoutComments) {
    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    assert(braceDepth >= 0, 'CSS cannot close a block before it opens');
}
assert.equal(braceDepth, 0, 'CSS block braces must be balanced');

console.log('✓ Dialog structure, unique IDs, redesigned controls, density, responsiveness, and CSS balance verified');
console.log('--- Static UI Contract Tests Passed ---');
