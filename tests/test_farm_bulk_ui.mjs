import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/style.css', import.meta.url), 'utf8');
const farmUi = await readFile(new URL('../public/js/ui/farm.js', import.meta.url), 'utf8');
const navigation = await readFile(new URL('../public/js/navigation.js', import.meta.url), 'utf8');
const api = await readFile(new URL('../public/js/api.js', import.meta.url), 'utf8');

console.log('--- Running General Farm Management UI Contract Tests ---');

assert.match(html, /id="btn-farm-manage"[\s\S]*?>[\s\S]*?Manage\s*<\/button>/);
assert(!html.includes('Manage Seeds'));
assert(html.indexOf('data-farm-manage-tab="plant"') < html.indexOf('data-farm-manage-tab="upgrade"'));
assert.match(html, /id="farm-manage-tab-plant"[^>]*aria-selected="true"[^>]*data-farm-manage-tab="plant"/);
assert(html.includes('All Plots') && html.includes('Specific Plots') && html.includes('Marked Plots'));
assert(html.includes('One Level') && html.includes('As Far As Possible'));
assert(html.includes('farm-specific-plots-input') && html.includes('inputmode="numeric"'));
assert(html.includes('marked-plots-count') && html.includes('btn-mark-all-plots') && html.includes('btn-invert-plot-marks') && html.includes('btn-clear-plot-marks'));

assert(farmUi.includes('lucide:bookmark-check') && farmUi.includes('lucide:bookmark'));
assert(farmUi.includes('<article class="plot-card'));
assert(farmUi.includes('data-plot-manage') && farmUi.includes('data-plot-mark'));
assert(farmUi.includes("saveState(state)"), 'Plot marks are persisted immediately');
assert(farmUi.includes('doPreviewBulkPlotUpgrade') && farmUi.includes('doBulkUpgradePlots'));
assert(!farmUi.includes('shouldSkipBulkPreview'), 'Farm bulk upgrades always require preview');
assert(navigation.includes("getElementById('farm-manage-modal')"));
assert(api.includes('/api/farm/upgrade-bulk-preview') && api.includes('/api/farm/upgrade-bulk'));

assert(css.includes('.plot-card.is-marked'));
assert(css.includes('.plot-mark-toggle:focus-visible'));
assert(css.includes('.farm-manage-tabs') && css.includes('.farm-bulk-choice-grid'));
assert(css.includes('.farm-bulk-preview-summary-grid'));
assert(css.includes('overscroll-behavior: contain'));

console.log('✓ General Manage tabs, persistent marks, accessible sibling controls, mandatory preview, and responsive styles verified');
