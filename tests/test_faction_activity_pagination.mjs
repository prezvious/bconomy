import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
    FACTION_ACTIVITY_DENSITIES,
    FACTION_ACTIVITY_DENSITY_STORAGE_KEY,
    getFactionActivityDensity,
    normalizeFactionActivityDensity,
    paginateFactionHistory,
    readFactionActivityDensity,
    writeFactionActivityDensity
} from '../public/js/ui/factionActivityPaging.js';

console.log('--- Running Faction Activity Pagination Tests ---');

assert.deepEqual(Object.keys(FACTION_ACTIVITY_DENSITIES), ['comfortable', 'compact', 'super-compact']);
assert.equal(getFactionActivityDensity('comfortable').pageSize, 10);
assert.equal(getFactionActivityDensity('compact').pageSize, 5);
assert.equal(getFactionActivityDensity('super-compact').pageSize, 5);
assert.equal(normalizeFactionActivityDensity('unknown'), 'comfortable');
console.log('✓ Activity-local density modes use the approved page sizes');

const entries = Array.from({ length: 23 }, (_, index) => ({ id: index + 1 }));
const comfortableFirst = paginateFactionHistory(entries, 0, 'comfortable');
assert.deepEqual(comfortableFirst.items.map(item => item.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
assert.deepEqual(
    { page: comfortableFirst.page, pageCount: comfortableFirst.pageCount, start: comfortableFirst.start, end: comfortableFirst.end, total: comfortableFirst.total },
    { page: 0, pageCount: 3, start: 1, end: 10, total: 23 }
);

const compactLast = paginateFactionHistory(entries, 99, 'compact');
assert.deepEqual(compactLast.items.map(item => item.id), [21, 22, 23]);
assert.deepEqual(
    { page: compactLast.page, pageCount: compactLast.pageCount, start: compactLast.start, end: compactLast.end },
    { page: 4, pageCount: 5, start: 21, end: 23 }
);

const superCompactSecond = paginateFactionHistory(entries, 1, 'super-compact');
assert.deepEqual(superCompactSecond.items.map(item => item.id), [6, 7, 8, 9, 10]);
assert.equal(paginateFactionHistory(entries, -4, 'compact').page, 0);
assert.deepEqual(paginateFactionHistory(null, 4, 'comfortable'), {
    items: [], page: 0, pageCount: 1, pageSize: 10, total: 0, start: 0, end: 0
});
console.log('✓ History slicing, visible ranges, and page clamping are deterministic');

const memory = new Map([['bconomy_user_settings', '{"interfaceDensity":"dense"}']]);
const storage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value)
};
assert.equal(readFactionActivityDensity(storage), 'comfortable');
assert.equal(writeFactionActivityDensity('super-compact', storage), 'super-compact');
assert.equal(readFactionActivityDensity(storage), 'super-compact');
assert.equal(memory.get('bconomy_user_settings'), '{"interfaceDensity":"dense"}');
assert.equal(memory.get(FACTION_ACTIVITY_DENSITY_STORAGE_KEY), 'super-compact');
assert.equal(writeFactionActivityDensity('invalid', storage), 'comfortable');
console.log('✓ Local Activity density persists without changing global Interface Density');

const [factionUi, css] = await Promise.all([
    readFile(new URL('../public/js/ui/faction.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/style.css', import.meta.url), 'utf8')
]);

assert.deepEqual(
    Object.values(FACTION_ACTIVITY_DENSITIES).map(config => config.label),
    ['Comfortable', 'Compact', 'Super Compact']
);
assert(factionUi.includes('aria-pressed='), 'Density buttons expose their pressed state');
assert(factionUi.includes("renderHistoryPagination('activity'"));
assert(factionUi.includes("renderHistoryPagination('ledger'"));
assert(factionUi.includes('data-page-direction='), 'Pagination supports focus restoration after repaint');
assert(css.includes('.faction-activity-grid.is-super-compact'));
assert(css.includes('.faction-history-page-btn:focus-visible'));
assert(css.includes('font-variant-numeric: tabular-nums'));
console.log('✓ Activity UI exposes independent, accessible pagination and all density treatments');

console.log('--- Faction Activity Pagination Tests Passed ---');
