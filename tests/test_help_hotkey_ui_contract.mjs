import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [html, css, appJs, controlsJs, logJs, settingsJs, utilityRailJs] = await Promise.all([
    read('../public/index.html'),
    read('../public/style.css'),
    read('../public/app.js'),
    read('../public/js/controls.js'),
    read('../public/js/ui/log.js'),
    read('../public/js/ui/settings.js'),
    read('../public/js/ui/utilityRail.js')
]);

console.log('--- Running Help, Hotkey & Command UI Contract Tests ---');

const helpButtonIndex = html.indexOf('id="btn-help-utility"');
const consoleButtonIndex = html.indexOf('id="btn-console-utility"');
assert.ok(helpButtonIndex >= 0 && consoleButtonIndex > helpButtonIndex, 'Help appears immediately before Console in the utility dock');
assert.match(html, /class="utility-dock"[\s\S]*id="btn-help-utility"[\s\S]*id="btn-console-utility"/);
assert.match(html, /id="help-handbook-dialog"[^>]*data-app-dialog[^>]*aria-labelledby="help-handbook-title"/);
assert.match(html, /id="help-handbook-search"[^>]*type="search"/);
assert.match(html, /id="console-command-suggestions"[^>]*role="listbox"/);
assert.match(html, /id="console-cmd-input"[^>]*aria-autocomplete="list"[^>]*aria-controls="console-command-suggestions"/);
assert.ok(html.includes('<title>Bconomy — Actions</title>'));
assert.ok(!html.includes('btn-console-toggle'), 'The old header Console toggle is removed');
console.log('✓ Help precedes Console and both contextual and full-handbook surfaces are present');

assert.ok(css.includes('.utility-dock'));
assert.ok(css.includes('.help-handbook-search'));
assert.ok(css.includes('.help-topic-accordion'));
assert.ok(css.includes('.settings-card-controls'));
assert.ok(css.includes('env(safe-area-inset-bottom)'), 'The responsive dock respects mobile safe areas');
assert.ok(css.includes('overscroll-behavior: contain'), 'Scrollable Help surfaces contain overscroll');
assert.match(css, /@media \(max-width: 960px\)[\s\S]*\.activity-ledger-rail/);
assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.utility-dock/);
console.log('✓ Desktop rail, responsive drawer, handbook, and settings controls are styled');

assert.ok(appJs.includes('setupUtilityRail()'));
assert.ok(appJs.includes('setupHotkeys()'));
assert.ok(controlsJs.includes('event.repeat'));
assert.ok(controlsJs.includes('event.isComposing'));
assert.ok(controlsJs.includes('isEditableTarget(event.target)'));
assert.ok(controlsJs.includes('hasOpenDialog()'));
assert.ok(controlsJs.includes("setAttribute('aria-keyshortcuts'"));
assert.ok(controlsJs.includes('SETTINGS_CHANGE_EVENT'));
console.log('✓ Global shortcuts suppress typing, repeats, composition, and dialogs and expose accessible annotations');

assert.ok(logJs.includes("commandId === 'help'"));
assert.ok(logJs.includes('openFullHelp({ returnFocus: cmdInput })'));
assert.ok(logJs.includes("e.key === 'Tab' || e.key === 'Enter'"));
assert.ok(logJs.includes('completeSuggestion(selectedSuggestionIndex)'));
assert.ok(logJs.includes('resolveCommand(slashMatch[1]'));
assert.ok(settingsJs.includes('Controls & Commands'));
assert.ok(settingsJs.includes('data-capture-control'));
assert.ok(settingsJs.includes('data-command-primary'));
assert.ok(settingsJs.includes('data-command-alias-input'));
assert.ok(settingsJs.includes("if (event.key !== 'Enter') return;"), 'Primary command names can be committed from the keyboard');
assert.ok(settingsJs.includes("['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)"), 'Modifier keydown events keep chord capture active');
assert.ok(settingsJs.includes("removeEventListener('keydown', capture"), 'Hotkey capture removes its global listener after completion');
console.log('✓ Autocomplete completes before execution and settings expose hotkey and command customization');

assert.ok(utilityRailJs.includes("railMode = 'console'"), 'The rail starts in Console mode');
assert.ok(utilityRailJs.includes('getHelpTopic(currentContext.section, currentContext.subfeature)'));
assert.ok(utilityRailJs.includes('renderHandbook'));
assert.ok(utilityRailJs.includes("if (event.key === 'Escape' && search.value)"));
assert.ok(utilityRailJs.includes('return null;'), 'Unrelated clicks preserve the active subfeature topic');
console.log('✓ Help follows active context, supports browsing/search, and restores the prior game surface');

console.log('--- Help, Hotkey & Command UI Contract Tests Passed! ---');
