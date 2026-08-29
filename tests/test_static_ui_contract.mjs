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
assert.equal(dialogOpenCount, 23, 'All twenty-three app dialogs use the shared native pattern');

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
    'faction-join-request-modal',
    'auth-modal',
    'account-profile-modal',
    'release-notes-modal',
    'btn-release-notes',
    'btn-release-expand-all',
    'btn-release-collapse-all',
    'help-handbook-dialog',
    'btn-help-utility',
    'btn-console-utility',
    'utility-rail',
    'btn-mobile-more',
    'mobile-more-dialog'
]) {
    assert(ids.includes(requiredId), `Required redesigned control #${requiredId} is present`);
}

assert(!/transition:\s*all\b/i.test(css), 'CSS must not animate every property');
assert(css.includes('[data-density="dense"]') && css.includes('[data-density="comfortable"]'), 'Density tokens cover dense and comfortable modes');
assert(css.includes('.toolbar-search.is-collapsed') && css.includes('.toolbar-search.is-expanded'), 'Collapsible toolbar search states are styled');
assert(css.includes('.page-toolbar.search-collapsed') && css.includes('.page-toolbar.search-expanded'), 'Toolbar grid responds to search state');
assert(css.includes('/* Mobile Tab Bar */'), 'Mobile navigation uses a dedicated tab bar treatment');
assert(css.includes('env(safe-area-inset-bottom)'), 'Mobile navigation respects device safe areas');
assert(/\.nav-links\s*\{[^}]*flex:\s*1 1 auto[^}]*min-height:\s*0[^}]*overflow-y:\s*auto[^}]*overscroll-behavior-y:\s*contain/s.test(css), 'Desktop sidebar navigation owns a bounded vertical scroll region');
assert(/\.logo-container\s*\{[^}]*flex:\s*0 0 auto/s.test(css), 'Desktop sidebar logo remains outside the scroll region');
assert(/\.sidebar-footer\s*\{[^}]*flex:\s*0 0 auto/s.test(css), 'Desktop sidebar footer remains outside the scroll region');
assert(/@media \(max-width: 640px\)[\s\S]*\.nav-links\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*overflow:\s*hidden/s.test(css), 'Mobile navigation uses five fixed, non-scrolling destinations');
assert(/\.nav-btn\.nav-secondary\s*\{[^}]*display:\s*none/s.test(css), 'Secondary mobile destinations move into the More sheet');
assert.equal((html.match(/class="nav-btn nav-primary/g) || []).length, 4, 'Four primary destinations remain directly available on phones');
assert.equal((html.match(/data-mobile-tab=/g) || []).length, 6, 'The More sheet exposes all six secondary destinations');
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
