import { getStoredSettings, saveStoredSettings, SETTINGS_STORAGE_KEY } from '../preferences.js';
import { CONTROL_DEFINITIONS, COMMAND_DEFINITIONS, formatBinding, getCommandNames } from '../controlRegistry.js';
import { HELP_TOPICS, HELP_CATEGORY_ORDER, getHelpSearchText, getHelpTopic, getHelpTopicById } from '../helpTopics.js';
import { openDialog, closeDialog } from './modal.js';

let initialized = false;
let railOpen = true;
let railMode = 'console';
let currentContext = { section: 'actions', subfeature: 'overview' };
let handbookReturnState = null;

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const hasExplicitRailPreference = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
        return typeof stored?.utilityRail?.open === 'boolean';
    } catch (error) {
        return false;
    }
};

const isDrawerLayout = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 960px)').matches;

const persistRailOpen = () => {
    const settings = getStoredSettings();
    settings.utilityRail.open = railOpen;
    saveStoredSettings(settings);
};

const dynamicReferenceHtml = topicId => {
    const settings = getStoredSettings();
    if (topicId === 'settings.controls') {
        const groups = ['Navigation', 'Actions', 'Global'].map(category => {
            const rows = CONTROL_DEFINITIONS.filter(definition => definition.category === category).map(definition => `
                <li><span>${escapeHtml(definition.label)}</span><kbd>${escapeHtml(formatBinding(settings.controls.hotkeys[definition.id]))}</kbd></li>
            `).join('');
            return `<div class="help-reference-group"><h4>${category}</h4><ul>${rows}</ul></div>`;
        }).join('');
        return `<section class="help-dynamic-reference"><h4>Current hotkeys</h4>${groups}</section>`;
    }
    if (topicId === 'console.commands') {
        const rows = COMMAND_DEFINITIONS.map(definition => {
            const primary = settings.controls.commands[definition.id]?.primary || definition.defaultName;
            const aliases = getCommandNames(definition, settings.controls).filter(name => name !== primary);
            return `<li><div><code>/${escapeHtml(primary)}${definition.usage ? ` ${escapeHtml(definition.usage)}` : ''}</code><span>${escapeHtml(definition.description)}</span></div>${aliases.length ? `<small>Also: ${aliases.map(name => `/${escapeHtml(name)}`).join(', ')}</small>` : ''}</li>`;
        }).join('');
        return `<section class="help-dynamic-reference command-reference"><h4>Current commands</h4><ul>${rows}</ul></section>`;
    }
    return '';
};

const relatedHtml = topic => {
    if (!topic.related?.length) return '';
    const buttons = topic.related.map(id => {
        const related = getHelpTopicById(id);
        return related ? `<button type="button" class="help-related-link" data-help-topic="${escapeHtml(id)}">${escapeHtml(related.title)}</button>` : '';
    }).join('');
    return buttons ? `<section class="help-related"><h4>Related topics</h4><div>${buttons}</div></section>` : '';
};

const topicBodyHtml = (topic, { compact = false } = {}) => `
    <p class="help-topic-summary">${escapeHtml(topic.summary)}</p>
    ${topic.steps.length ? `<section class="help-topic-section"><h4>What to do</h4><ol>${topic.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>` : ''}
    ${topic.notes.length ? `<section class="help-topic-section help-topic-notes"><h4>Good to know</h4><ul>${topic.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></section>` : ''}
    ${dynamicReferenceHtml(topic.id)}
    ${compact ? relatedHtml(topic) : ''}
`;

const renderContextHelp = () => {
    const container = document.getElementById('help-context-content');
    const heading = document.getElementById('help-rail-heading');
    if (!container) return;
    const topic = getHelpTopic(currentContext.section, currentContext.subfeature);
    if (heading) heading.textContent = topic.title;
    container.innerHTML = `
        <span class="help-context-category">${escapeHtml(topic.category)}</span>
        ${topicBodyHtml(topic, { compact: true })}
        <button id="btn-browse-all-help" class="action-btn primary-btn help-browse-all" type="button">
            <iconify-icon icon="lucide:book-open-text" aria-hidden="true"></iconify-icon> Browse all topics
        </button>
    `;
    document.getElementById('btn-browse-all-help')?.addEventListener('click', event => openFullHelp({ returnFocus: event.currentTarget }));
    container.querySelectorAll('[data-help-topic]').forEach(button => button.addEventListener('click', event => {
        openFullHelp({ topicId: event.currentTarget.dataset.helpTopic, returnFocus: event.currentTarget });
    }));
};

const applyRailState = ({ persist = false } = {}) => {
    const app = document.querySelector('.app-container');
    const rail = document.getElementById('utility-rail');
    const consoleView = document.getElementById('console-rail-view');
    const helpView = document.getElementById('help-rail-view');
    const helpButton = document.getElementById('btn-help-utility');
    const consoleButton = document.getElementById('btn-console-utility');
    const backdrop = document.getElementById('utility-rail-backdrop');
    if (!app || !rail) return;

    app.classList.toggle('utility-rail-closed', !railOpen);
    rail.classList.toggle('drawer-open', railOpen);
    rail.dataset.mode = railMode;
    rail.setAttribute('aria-label', railMode === 'help' ? 'Contextual Help' : 'Console');
    consoleView?.classList.toggle('hidden', railMode !== 'console');
    helpView?.classList.toggle('hidden', railMode !== 'help');
    helpButton?.classList.toggle('active', railOpen && railMode === 'help');
    consoleButton?.classList.toggle('active', railOpen && railMode === 'console');
    helpButton?.setAttribute('aria-pressed', String(railOpen && railMode === 'help'));
    consoleButton?.setAttribute('aria-pressed', String(railOpen && railMode === 'console'));
    backdrop?.classList.toggle('hidden', !(railOpen && isDrawerLayout()));
    if (railMode === 'help') renderContextHelp();
    if (persist) persistRailOpen();
};

const selectRailMode = (mode, { toggleActive = false, persist = true } = {}) => {
    if (toggleActive && railOpen && railMode === mode) {
        railOpen = false;
    } else {
        railMode = mode;
        railOpen = true;
    }
    applyRailState({ persist });
};

export const openContextHelp = () => selectRailMode('help', { toggleActive: false });

export const openConsoleCommand = ({ seedSlash = false } = {}) => {
    selectRailMode('console', { toggleActive: false });
    const input = document.getElementById('console-cmd-input');
    if (!input) return;
    if (seedSlash && !input.value) {
        input.value = '/';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        input.setSelectionRange?.(input.value.length, input.value.length);
    });
};

export const closeUtilityRail = ({ persist = true } = {}) => {
    railOpen = false;
    applyRailState({ persist });
};

export const setHelpContext = (section, subfeature = 'overview') => {
    currentContext = { section: section || 'actions', subfeature: subfeature || 'overview' };
    if (railOpen && railMode === 'help') renderContextHelp();
};

const highlight = (value, query) => {
    const safe = escapeHtml(value);
    if (!query) return safe;
    const terms = query.trim().split(/\s+/).filter(Boolean).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!terms.length) return safe;
    return safe.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
};

const renderHandbook = ({ query = '', topicId = '' } = {}) => {
    const content = document.getElementById('help-handbook-content');
    const status = document.getElementById('help-search-status');
    if (!content) return;
    const normalizedQuery = query.trim().toLowerCase();
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const matches = HELP_TOPICS.filter(entry => terms.every(term => getHelpSearchText(entry).includes(term)));
    const visible = normalizedQuery ? matches : HELP_TOPICS;
    if (status) status.textContent = normalizedQuery
        ? `${visible.length} topic${visible.length === 1 ? '' : 's'} found`
        : `${HELP_TOPICS.length} topics across ${HELP_CATEGORY_ORDER.length} sections`;

    content.innerHTML = HELP_CATEGORY_ORDER.map(category => {
        const topics = visible.filter(entry => entry.category === category);
        if (!topics.length) return '';
        const categoryOpen = Boolean(normalizedQuery || topics.some(entry => entry.id === topicId) || category === 'Getting started');
        return `
            <details class="help-category-accordion" ${categoryOpen ? 'open' : ''}>
                <summary><span>${escapeHtml(category)}</span><span class="help-category-count">${topics.length}</span></summary>
                <div class="help-category-topics">
                    ${topics.map(entry => `
                        <details class="help-topic-accordion" data-topic-id="${escapeHtml(entry.id)}" ${entry.id === topicId || normalizedQuery ? 'open' : ''}>
                            <summary>
                                <span>${highlight(entry.title, normalizedQuery)}</span>
                                <small>${highlight(entry.summary, normalizedQuery)}</small>
                            </summary>
                            <div class="help-topic-accordion-body">
                                ${topicBodyHtml(entry)}
                                ${relatedHtml(entry)}
                            </div>
                        </details>
                    `).join('')}
                </div>
            </details>
        `;
    }).join('') || `
        <div class="help-empty-state">
            <iconify-icon icon="lucide:search-x" aria-hidden="true"></iconify-icon>
            <h3>No Help topics found</h3>
            <p>Try a shorter term such as “farm”, “boost”, “sell”, or “command”.</p>
        </div>
    `;

    content.querySelectorAll('[data-help-topic]').forEach(button => button.addEventListener('click', event => {
        const nextId = event.currentTarget.dataset.helpTopic;
        const search = document.getElementById('help-handbook-search');
        if (search) search.value = '';
        renderHandbook({ topicId: nextId });
        const escapedId = globalThis.CSS?.escape ? CSS.escape(nextId) : nextId.replace(/["\\]/g, '\\$&');
        requestAnimationFrame(() => content.querySelector(`[data-topic-id="${escapedId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }));
};

export const openFullHelp = ({ topicId = '', returnFocus } = {}) => {
    const dialog = document.getElementById('help-handbook-dialog');
    const main = document.querySelector('.ledger-main');
    if (!dialog) return;
    handbookReturnState = {
        railMode,
        railOpen,
        scrollTop: main?.scrollTop || 0,
        returnFocus: returnFocus || document.activeElement,
        pageTitle: document.title
    };
    document.title = 'Bconomy — Help';
    const search = document.getElementById('help-handbook-search');
    if (search) search.value = '';
    renderHandbook({ topicId: topicId || getHelpTopic(currentContext.section, currentContext.subfeature).id });
    openDialog(dialog, {
        initialFocus: '#help-handbook-search',
        closeOnBackdrop: false,
        returnFocus: handbookReturnState.returnFocus,
        onClose: () => {
            if (!handbookReturnState) return;
            railMode = handbookReturnState.railMode;
            railOpen = handbookReturnState.railOpen;
            applyRailState();
            if (main) main.scrollTop = handbookReturnState.scrollTop;
            document.title = handbookReturnState.pageTitle;
            handbookReturnState = null;
        }
    });
};

const inferHelpContextFromTarget = target => {
    if (!target?.closest) return null;
    const actionButton = target.closest('[id^="btn-act-"]');
    if (actionButton) return { section: 'actions', subfeature: actionButton.id.replace('btn-act-', '') };

    const mappings = [
        ['#btn-global-water, #btn-use-melon', 'farm', 'watering'],
        ['#btn-claim-crops, #claim-crop-select', 'farm', 'storage'],
        ['#btn-mark-all-plots, #btn-invert-plot-marks, #btn-clear-plot-marks, [data-plot-mark]', 'farm', 'marking'],
        ['#btn-farm-manage, [data-farm-manage-tab="plant"], [data-plot-action="plant"], [data-plant-submit]', 'farm', 'planting'],
        ['[data-farm-manage-tab="upgrade"], [data-plot-action="upgrade"], [data-bulk-upgrade-mode], #btn-preview-bulk-plot-upgrade', 'farm', 'upgrades'],
        ['.inventory-item, #item-details-modal', 'inventory', 'details'],
        ['#btn-open-bulk-boosters, #bulk-booster-modal, #bulk-booster-preview-modal', 'inventory', 'boosters'],
        ['[data-craft-select], #crafting-details-dialog', 'crafting', 'details'],
        ['[data-crafting-mode], input[name="crafting-mode"]', 'crafting', 'modes'],
        ['[data-crafting-preview], [data-crafting-execute]', 'crafting', 'operation'],
        ['#shop-tab-buy, .btn-buy-item', 'shop', 'buy'],
        ['#shop-tab-sell, .btn-sell-item', 'shop', 'sell'],
        ['#btn-open-bulk-actions, #bulk-actions-modal, #bulk-preview-modal', 'shop', 'bulk'],
        ['.btn-buy-booster', 'shop', 'boosters'],
        ['[data-upgrade-action="manage-sockets"], #sockets-workshop-modal', 'tools', 'sockets'],
        ['[data-upgrade-action]', 'tools', 'upgrades'],
        ['#btn-rp-promote, #btn-open-targeted-modal, #targeted-rankup-modal', 'rank-prestige', 'promotion'],
        ['#btn-rp-ascend', 'rank-prestige', 'ascension'],
        ['[data-perk-id], .btn-perk-buy', 'rank-prestige', 'perks'],
        ['[class*="coinflip"], [id*="coinflip"]', 'gambling', 'coinflip'],
        ['[class*="slots"], [id*="slots"]', 'gambling', 'slots'],
        ['#btn-faction-deposit-submit, #faction-deposit', 'faction', 'treasury'],
        ['#faction-tab-operations, .faction-boost-card, .btn-activate-boost, .btn-stop-boost', 'faction', 'operations'],
        ['#btn-open-create-faction, #btn-open-edit-faction, #create-faction-modal, #edit-faction-modal', 'faction', 'overview'],
        ['[data-help-subfeature="display"]', 'settings', 'display'],
        ['[data-help-subfeature="quantities"]', 'settings', 'quantities'],
        ['[data-help-subfeature="notifications"]', 'settings', 'notifications'],
        ['[data-help-subfeature="controls"]', 'settings', 'controls'],
        ['#console-cmd-input, #console-command-suggestions', 'console', 'commands'],
        ['.btn-copy-calc', 'console', 'calculator']
    ];
    for (const [selector, section, subfeature] of mappings) {
        if (target.closest(selector)) return { section, subfeature };
    }
    return null;
};

export const setupUtilityRail = () => {
    if (initialized || typeof document === 'undefined') return;
    initialized = true;
    railOpen = hasExplicitRailPreference() ? getStoredSettings().utilityRail.open : !isDrawerLayout();
    railMode = 'console';

    document.getElementById('btn-help-utility')?.addEventListener('click', () => selectRailMode('help', { toggleActive: true }));
    document.getElementById('btn-console-utility')?.addEventListener('click', () => selectRailMode('console', { toggleActive: true }));
    document.getElementById('utility-rail-backdrop')?.addEventListener('click', () => closeUtilityRail());
    document.getElementById('btn-help-back')?.addEventListener('click', () => closeDialog('help-handbook-dialog', { reason: 'back' }));

    const search = document.getElementById('help-handbook-search');
    search?.addEventListener('input', () => renderHandbook({ query: search.value }));
    search?.addEventListener('keydown', event => {
        if (event.key === 'Escape' && search.value) {
            event.preventDefault();
            event.stopPropagation();
            search.value = '';
            renderHandbook();
        }
    });

    document.addEventListener('bconomy:help-context-change', event => {
        setHelpContext(event.detail?.section, event.detail?.subfeature);
    });
    document.addEventListener('click', event => {
        const next = inferHelpContextFromTarget(event.target);
        if (next) setHelpContext(next.section, next.subfeature);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && railOpen && isDrawerLayout() && !document.querySelector('dialog[open]')) closeUtilityRail();
    });
    window.addEventListener('resize', () => applyRailState());
    applyRailState();
};
