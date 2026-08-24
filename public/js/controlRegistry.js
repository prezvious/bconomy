// Stable metadata and normalization helpers for keyboard controls and Console commands.
// This module is intentionally DOM-free so settings and tests can share one source of truth.

export const CONTROLS_VERSION = 1;

export const CONTROL_DEFINITIONS = Object.freeze([
    { id: 'nav.actions', category: 'Navigation', label: 'Open Actions', defaultBinding: '1', selector: '.nav-btn[data-tab="actions"]' },
    { id: 'nav.farm', category: 'Navigation', label: 'Open Farm', defaultBinding: '2', selector: '.nav-btn[data-tab="farm"]' },
    { id: 'nav.inventory', category: 'Navigation', label: 'Open Inventory', defaultBinding: '3', selector: '.nav-btn[data-tab="inventory"]' },
    { id: 'nav.crafting', category: 'Navigation', label: 'Open Crafting', defaultBinding: '4', selector: '.nav-btn[data-tab="crafting"]' },
    { id: 'nav.shop', category: 'Navigation', label: 'Open Shop', defaultBinding: '5', selector: '.nav-btn[data-tab="shop"]' },
    { id: 'nav.tools', category: 'Navigation', label: 'Open Tools', defaultBinding: '6', selector: '.nav-btn[data-tab="tools"]' },
    { id: 'nav.rank-prestige', category: 'Navigation', label: 'Open Rank & Ascension', defaultBinding: '7', selector: '.nav-btn[data-tab="rank-prestige"]' },
    { id: 'nav.gambling', category: 'Navigation', label: 'Open Gambling', defaultBinding: '8', selector: '.nav-btn[data-tab="gambling"]' },
    { id: 'nav.faction', category: 'Navigation', label: 'Open Faction', defaultBinding: '9', selector: '.nav-btn[data-tab="faction"]' },
    { id: 'nav.settings', category: 'Navigation', label: 'Open Settings', defaultBinding: '0', selector: '.nav-btn[data-tab="settings"]' },
    { id: 'action.mine', category: 'Actions', label: 'Mine', defaultBinding: 'm', selector: '#btn-act-mine' },
    { id: 'action.explore', category: 'Actions', label: 'Explore', defaultBinding: 'e', selector: '#btn-act-explore' },
    { id: 'action.hunt', category: 'Actions', label: 'Hunt', defaultBinding: 'h', selector: '#btn-act-hunt' },
    { id: 'action.fish', category: 'Actions', label: 'Fish', defaultBinding: 'f', selector: '#btn-act-fish' },
    { id: 'action.work', category: 'Actions', label: 'Work', defaultBinding: 'w', selector: '#btn-act-work' },
    { id: 'global.help', category: 'Global', label: 'Open contextual Help', defaultBinding: 'Shift+/', selector: '#btn-help-utility' },
    { id: 'global.console', category: 'Global', label: 'Open Console command entry', defaultBinding: '/', selector: '#btn-console-utility' },
    { id: 'global.theme', category: 'Global', label: 'Toggle theme', defaultBinding: 't', selector: '#theme-toggle' }
]);

export const COMMAND_DEFINITIONS = Object.freeze([
    { id: 'mine', defaultName: 'mine', defaultAliases: [], usage: '', description: 'Run the Mine action.' },
    { id: 'explore', defaultName: 'explore', defaultAliases: [], usage: '', description: 'Run the Explore action.' },
    { id: 'hunt', defaultName: 'hunt', defaultAliases: [], usage: '', description: 'Run the Hunt action.' },
    { id: 'fish', defaultName: 'fish', defaultAliases: [], usage: '', description: 'Run the Fish action.' },
    { id: 'work', defaultName: 'work', defaultAliases: [], usage: '', description: 'Run the Work action.' },
    { id: 'calc', defaultName: 'calc', defaultAliases: ['math', 'c'], usage: '<expression>', description: 'Evaluate a mathematical expression.' },
    { id: 'boost', defaultName: 'boost', defaultAliases: [], usage: '<action|all> <tier|all>', description: 'Activate owned loot boosters.' },
    { id: 'use', defaultName: 'use', defaultAliases: [], usage: '<item>', description: 'Use an owned booster item.' },
    { id: 'clear', defaultName: 'clear', defaultAliases: [], usage: '', description: 'Clear the Console feed.' },
    { id: 'help', defaultName: 'help', defaultAliases: [], usage: '', description: 'Open the complete Help handbook.' }
]);

const MODIFIER_ORDER = Object.freeze(['Ctrl', 'Alt', 'Shift', 'Meta']);
const DISALLOWED_BASE_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta', 'Tab', 'Enter', 'Escape']);
const RESERVED_BINDINGS = new Set([
    'F1', 'F5', 'F6', 'F11', 'F12',
    'Alt+ArrowLeft', 'Alt+ArrowRight',
    'Ctrl+l', 'Ctrl+r', 'Ctrl+w', 'Ctrl+t', 'Ctrl+n', 'Ctrl+p', 'Ctrl+s', 'Ctrl+f', 'Ctrl+u',
    'Ctrl+d', 'Ctrl+h', 'Ctrl+j', 'Ctrl+o', 'Ctrl+k', 'Ctrl+-', 'Ctrl+=', 'Ctrl+0',
    'Ctrl+Shift+t', 'Ctrl+Shift+n', 'Ctrl+Shift+Delete',
    'Meta+l', 'Meta+r', 'Meta+w', 'Meta+t', 'Meta+n', 'Meta+p', 'Meta+s', 'Meta+f',
    'Meta+d', 'Meta+h', 'Meta+j', 'Meta+o', 'Meta+k', 'Meta+-', 'Meta+=', 'Meta+0',
    'Meta+Shift+t', 'Meta+Shift+n', 'Meta+q', 'Meta+[', 'Meta+]'
]);
const COMMAND_NAME_PATTERN = /^[a-z][a-z0-9_-]{0,23}$/;

const normalizeBaseKey = key => {
    if (typeof key !== 'string' || !key) return '';
    if (key === ' ') return 'Space';
    if (key === '?') return '/';
    if (key.length === 1 && /[A-Z]/.test(key)) return key.toLowerCase();
    return key;
};

export const normalizeBinding = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    const parts = value.split('+').map(part => part.trim()).filter(Boolean);
    if (!parts.length) return '';
    const base = normalizeBaseKey(parts.pop());
    if (!base || DISALLOWED_BASE_KEYS.has(base)) return '';
    const modifiers = new Set(parts.map(part => {
        const lower = part.toLowerCase();
        if (lower === 'ctrl' || lower === 'control') return 'Ctrl';
        if (lower === 'alt') return 'Alt';
        if (lower === 'shift') return 'Shift';
        if (lower === 'meta' || lower === 'cmd' || lower === 'command') return 'Meta';
        return '';
    }).filter(Boolean));
    return [...MODIFIER_ORDER.filter(modifier => modifiers.has(modifier)), base].join('+');
};

export const bindingFromKeyboardEvent = event => {
    if (!event) return '';
    const base = normalizeBaseKey(event.key);
    if (!base || DISALLOWED_BASE_KEYS.has(base)) return '';
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey || event.key === '?') modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    return normalizeBinding([...modifiers, base].join('+'));
};

export const formatBinding = value => {
    const normalized = normalizeBinding(value);
    if (!normalized) return 'Unbound';
    if (normalized === 'Shift+/') return '?';
    const parts = normalized.split('+');
    const base = parts.pop();
    const displayBase = base.length === 1 ? base.toUpperCase() : base;
    return [...parts, displayBase].join('+');
};

export const bindingToAriaShortcut = value => {
    const normalized = normalizeBinding(value);
    if (!normalized) return '';
    if (normalized === 'Shift+/') return 'Shift+?';
    return normalized.split('+').map(part => part === 'Ctrl' ? 'Control' : part).join('+');
};

export const isReservedBinding = value => RESERVED_BINDINGS.has(normalizeBinding(value));

export const commandNameError = value => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return 'Enter a command name.';
    if (!COMMAND_NAME_PATTERN.test(normalized)) return 'Use 1–24 letters, numbers, hyphens, or underscores, beginning with a letter.';
    return '';
};

export const normalizeCommandName = value => String(value || '').trim().toLowerCase();

export const getDefaultControls = () => ({
    version: CONTROLS_VERSION,
    hotkeys: Object.fromEntries(CONTROL_DEFINITIONS.map(definition => [definition.id, definition.defaultBinding])),
    commands: Object.fromEntries(COMMAND_DEFINITIONS.map(definition => [definition.id, {
        primary: definition.defaultName,
        aliases: []
    }]))
});

export const normalizeControls = candidate => {
    const defaults = getDefaultControls();
    const value = candidate && typeof candidate === 'object' ? candidate : {};
    const candidateHotkeys = value.hotkeys && typeof value.hotkeys === 'object' ? value.hotkeys : {};
    const hotkeys = {};
    const usedBindings = new Set();

    for (const definition of CONTROL_DEFINITIONS) {
        const hasCandidate = Object.hasOwn(candidateHotkeys, definition.id);
        const requested = hasCandidate && candidateHotkeys[definition.id] === ''
            ? ''
            : normalizeBinding(hasCandidate ? candidateHotkeys[definition.id] : definition.defaultBinding);
        let binding = requested;
        if (binding && (usedBindings.has(binding) || isReservedBinding(binding))) binding = '';
        if (!hasCandidate && !binding) binding = normalizeBinding(definition.defaultBinding);
        if (binding) usedBindings.add(binding);
        hotkeys[definition.id] = binding;
    }

    const commands = {};
    const candidateCommands = value.commands && typeof value.commands === 'object' ? value.commands : {};
    const canonicalOwners = new Map();
    for (const definition of COMMAND_DEFINITIONS) {
        [definition.defaultName, ...definition.defaultAliases].forEach(name => canonicalOwners.set(name, definition.id));
    }
    const claimedCustomNames = new Map();

    for (const definition of COMMAND_DEFINITIONS) {
        const requested = candidateCommands[definition.id] && typeof candidateCommands[definition.id] === 'object'
            ? candidateCommands[definition.id]
            : {};
        let primary = normalizeCommandName(requested.primary || definition.defaultName);
        const primaryOwner = canonicalOwners.get(primary) || claimedCustomNames.get(primary);
        if (commandNameError(primary) || (primaryOwner && primaryOwner !== definition.id)) primary = definition.defaultName;
        claimedCustomNames.set(primary, definition.id);

        const aliases = [];
        const requestedAliases = Array.isArray(requested.aliases) ? requested.aliases : [];
        for (const rawAlias of requestedAliases) {
            if (aliases.length >= 5) break;
            const alias = normalizeCommandName(rawAlias);
            const owner = canonicalOwners.get(alias) || claimedCustomNames.get(alias);
            if (commandNameError(alias) || owner || alias === primary || aliases.includes(alias)) continue;
            aliases.push(alias);
            claimedCustomNames.set(alias, definition.id);
        }
        commands[definition.id] = { primary, aliases };
    }

    return { version: CONTROLS_VERSION, hotkeys, commands };
};

export const getCommandNames = (definition, controls) => {
    const custom = controls?.commands?.[definition.id] || {};
    return [...new Set([
        normalizeCommandName(custom.primary || definition.defaultName),
        ...(Array.isArray(custom.aliases) ? custom.aliases.map(normalizeCommandName) : []),
        definition.defaultName,
        ...definition.defaultAliases
    ].filter(Boolean))];
};

export const resolveCommand = (token, controls) => {
    const normalized = normalizeCommandName(token);
    if (!normalized) return null;
    for (const definition of COMMAND_DEFINITIONS) {
        const names = getCommandNames(definition, controls);
        if (names.includes(normalized)) {
            return {
                definition,
                primary: controls?.commands?.[definition.id]?.primary || definition.defaultName,
                matchedName: normalized,
                names
            };
        }
    }
    return null;
};

export const getCommandNameOwner = (name, controls) => {
    const normalized = normalizeCommandName(name);
    if (!normalized) return null;
    for (const definition of COMMAND_DEFINITIONS) {
        if (getCommandNames(definition, controls).includes(normalized)) return definition.id;
    }
    return null;
};
