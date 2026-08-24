import assert from 'node:assert/strict';

import {
    CONTROL_DEFINITIONS,
    COMMAND_DEFINITIONS,
    bindingToAriaShortcut,
    bindingFromKeyboardEvent,
    commandNameError,
    formatBinding,
    getCommandNameOwner,
    getCommandNames,
    getDefaultControls,
    isReservedBinding,
    normalizeBinding,
    normalizeControls,
    resolveCommand
} from '../public/js/controlRegistry.js';
import {
    HELP_CATEGORY_ORDER,
    HELP_TOPICS,
    getHelpSearchText,
    getHelpTopic,
    getHelpTopicById
} from '../public/js/helpTopics.js';
import { getDefaultSettings, normalizeSettings } from '../public/js/preferences.js';

console.log('--- Running Controls, Commands & Help Tests ---');

const defaults = getDefaultControls();
assert.equal(CONTROL_DEFINITIONS.length, 18, 'The approved control set contains 18 remappable actions');
assert.equal(COMMAND_DEFINITIONS.length, 10, 'Every existing Console command is customizable');
assert.deepEqual(
    CONTROL_DEFINITIONS.filter(entry => entry.id.startsWith('nav.')).map(entry => defaults.hotkeys[entry.id]),
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
);
assert.deepEqual(
    CONTROL_DEFINITIONS.filter(entry => entry.id.startsWith('action.')).map(entry => defaults.hotkeys[entry.id]),
    ['m', 'e', 'h', 'f', 'w']
);
assert.equal(defaults.hotkeys['global.help'], 'Shift+/');
assert.equal(defaults.hotkeys['global.console'], '/');
assert.equal(defaults.hotkeys['global.theme'], 't');
assert.equal(new Set(Object.values(defaults.hotkeys)).size, CONTROL_DEFINITIONS.length, 'Default hotkeys are unique');
console.log('✓ Default navigation, action, Help, Console, and theme bindings are complete and unique');

assert.equal(normalizeBinding('control+SHIFT+K'), 'Ctrl+Shift+k');
assert.equal(bindingFromKeyboardEvent({ key: '?', shiftKey: true }), 'Shift+/');
assert.equal(bindingFromKeyboardEvent({ key: 'M', shiftKey: true }), 'Shift+m');
assert.equal(formatBinding('Shift+/'), '?');
assert.equal(formatBinding('ctrl+shift+k'), 'Ctrl+Shift+K');
assert.equal(formatBinding(''), 'Unbound');
assert.equal(bindingToAriaShortcut('Ctrl+Shift+k'), 'Control+Shift+k');
assert.equal(bindingToAriaShortcut('Shift+/'), 'Shift+?');
assert.equal(isReservedBinding('Ctrl+L'), true);
assert.equal(isReservedBinding('F5'), true);
assert.equal(isReservedBinding('Meta+Q'), true);
assert.equal(commandNameError('valid-name_2'), '');
assert.ok(commandNameError('2invalid'));

const normalized = normalizeControls({
    hotkeys: {
        'nav.actions': 'Ctrl+L',
        'nav.farm': 'z',
        'nav.inventory': 'z',
        'action.mine': ''
    },
    commands: {
        mine: { primary: 'dig', aliases: ['ore', 'ore', '2bad', 'math', 'one', 'two', 'three', 'four', 'five', 'six'] },
        explore: { primary: 'dig', aliases: ['roam'] },
        calc: { primary: 'sum', aliases: ['plus'] }
    }
});
assert.equal(normalized.hotkeys['nav.actions'], '', 'Reserved browser shortcuts are rejected');
assert.equal(normalized.hotkeys['nav.farm'], 'z');
assert.equal(normalized.hotkeys['nav.inventory'], '', 'Duplicate shortcuts are left unbound');
assert.equal(normalized.hotkeys['action.mine'], '', 'Explicitly unbound shortcuts stay unbound');
assert.equal(normalized.commands.mine.primary, 'dig');
assert.deepEqual(normalized.commands.mine.aliases, ['ore', 'one', 'two', 'three', 'four']);
assert.equal(normalized.commands.explore.primary, 'explore', 'Conflicting custom primary names restore the command default');
assert.deepEqual(normalized.commands.explore.aliases, ['roam']);
assert.equal(normalized.commands.calc.primary, 'sum');
assert.equal(resolveCommand('dig', normalized)?.definition.id, 'mine');
assert.equal(resolveCommand('mine', normalized)?.definition.id, 'mine', 'Canonical recovery names always work');
assert.equal(resolveCommand('math', normalized)?.definition.id, 'calc', 'Built-in recovery aliases always work');
assert.equal(resolveCommand('plus', normalized)?.definition.id, 'calc');
assert.equal(getCommandNameOwner('ore', normalized), 'mine');
assert.ok(getCommandNames(COMMAND_DEFINITIONS.find(entry => entry.id === 'calc'), normalized).includes('calc'));
console.log('✓ Remapping rejects conflicts and reserved chords while commands preserve recovery names');

const normalizedSettings = normalizeSettings({
    controls: normalized,
    utilityRail: { open: false }
});
assert.equal(normalizedSettings.utilityRail.open, false);
assert.equal(normalizedSettings.controls.commands.mine.primary, 'dig');
assert.equal(getDefaultSettings().utilityRail.open, true);
console.log('✓ Controls and Help/Console rail state persist as browser-local preferences');

const requiredSections = ['actions', 'farm', 'inventory', 'crafting', 'shop', 'tools', 'rank-prestige', 'gambling', 'faction', 'settings', 'console', 'help'];
for (const section of requiredSections) {
    assert.ok(getHelpTopic(section, 'overview'), `Help includes a contextual overview for ${section}`);
}
for (const action of ['mine', 'explore', 'hunt', 'fish', 'work']) {
    assert.equal(getHelpTopic('actions', action).id, `actions.${action}`);
}
assert.ok(HELP_TOPICS.length >= 45, 'The full handbook contains detailed feature coverage');
assert.equal(new Set(HELP_TOPICS.map(entry => entry.id)).size, HELP_TOPICS.length, 'Help topic IDs are unique');
assert.deepEqual([...new Set(HELP_TOPICS.map(entry => entry.category))], HELP_CATEGORY_ORDER);
assert.equal(getHelpTopicById('settings.controls')?.section, 'settings');
assert.equal(getHelpTopic('missing', 'missing').id, 'getting-started.overview', 'Unknown context has a safe fallback');
assert.ok(HELP_TOPICS.filter(entry => getHelpSearchText(entry).includes('craft')).length >= 3, 'Help search text spans related topics');

const playerFacingHelp = HELP_TOPICS.map(entry => [entry.title, entry.summary, ...entry.steps, ...entry.notes].join(' ')).join(' ').toLowerCase();
for (const forbidden of ['drop table', 'drop rate', 'internal formula', 'exact odds']) {
    assert.ok(!playerFacingHelp.includes(forbidden), `Help does not expose ${forbidden}`);
}
console.log('✓ Contextual and full-handbook Help coverage is searchable, unique, and spoiler-safe');

console.log('--- Controls, Commands & Help Tests Passed! ---');
