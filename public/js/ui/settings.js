// Settings UI & Notification Filter Manager
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { clearIgnoredConfirmations, showConfirmation } from './modal.js';
import { iconHtml, formatDisplayNumber, formatMoney, formatDurationMs, formatTimestampDate } from '../utils.js';
import {
    SETTINGS_STORAGE_KEY,
    getDefaultSettings,
    getStoredSettings,
    saveStoredSettings,
    resetDisplaySettings,
    QUANTITY_PRESET_SYSTEMS
} from '../preferences.js';
import { getAuthProfile, getAuthSession, signOutUser } from '../auth.js';
import { openAuthModal } from './authModal.js';
import { syncStateToCloud } from '../state.js';
import {
    CONTROL_DEFINITIONS,
    COMMAND_DEFINITIONS,
    bindingFromKeyboardEvent,
    commandNameError,
    formatBinding,
    getCommandNameOwner,
    isReservedBinding,
    normalizeCommandName
} from '../controlRegistry.js';

export { SETTINGS_STORAGE_KEY, getDefaultSettings, getStoredSettings, saveStoredSettings };

export const NOTIFICATION_CATEGORIES = [
    { id: 'perks', label: 'Perk Upgrades', icon: 'lucide:star', desc: 'Ascension and perk point investments' },
    { id: 'tools', label: 'Tools Workshop', icon: 'lucide:wrench', desc: 'Tool level upgrades and socket installations' },
    { id: 'actions', label: 'Gathering & Loot', icon: 'lucide:pickaxe', desc: 'Mine, explore, hunt, fish, and work payouts' },
    { id: 'farm', label: 'Farm Operations', icon: 'lucide:sprout', desc: 'Planting, global watering, composting, and crop claims' },
    { id: 'shop', label: 'Market & Shop', icon: 'lucide:store', desc: 'Item purchases, bulk sales, and booster activations' },
    { id: 'alerts', label: 'System Alerts & Errors', icon: 'lucide:alert-circle', desc: 'Validation notices, cooldown alerts, and error warnings' }
];

export const NOTIFICATION_DENSITIES = [
    { id: 'verbose', label: 'Verbose (All)', desc: 'Display all floating toasts immediately on screen' },
    { id: 'standard', label: 'Standard', desc: 'Display standard progress and routine milestones' },
    { id: 'minimal', label: 'Minimal', desc: 'Only display critical alerts, errors, and major milestones' },
    { id: 'muted', label: 'Muted', desc: 'Silence all on-screen toasts (directs output straight to Action Ledger)' }
];

const QUANTITY_SYSTEM_LABELS = Object.freeze({
    crafting: 'Crafting',
    'shop-buy': 'Shop purchases',
    'shop-sell': 'Shop sales',
    'booster-activation': 'Booster activation',
    'socket-module-crafting': 'Socket-module crafting',
    'tool-upgrades': 'Tool upgrades',
    'perk-upgrades': 'Perk upgrades'
});

let selectedQuantitySystem = 'crafting';
let selectedQuantitySubject = '';
let cancelActiveHotkeyCapture = null;

const escapeAttribute = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const presetFieldsHtml = (prefix, scope, inherited, disabled = false) => {
    const effective = { ...inherited, ...(scope || {}) };
    const values = Array.isArray(effective.values) ? effective.values : [1, 10, 100, 1000];
    return `
        <div class="quantity-settings-values" role="group" aria-label="${prefix} quantity values">
            ${[0, 1, 2, 3].map(index => `<label><span>Preset ${index + 1}</span><input class="form-input" id="${prefix}-preset-${index}" name="${prefix}-preset-${index}" type="number" inputmode="numeric" autocomplete="off" min="1" step="1" value="${Number.isFinite(values[index]) ? values[index] : ''}" ${disabled ? 'disabled' : ''}></label>`).join('')}
        </div>
        <div class="quantity-settings-policy">
            <label class="form-group"><span class="form-label">Preview policy</span><select id="${prefix}-preview-mode" name="${prefix}-preview-mode" class="form-select" ${disabled ? 'disabled' : ''}>
                <option value="every" ${effective.previewMode === 'every' ? 'selected' : ''}>Every operation</option>
                <option value="recursive-only" ${effective.previewMode === 'recursive-only' ? 'selected' : ''}>Recursive only</option>
                <option value="large-only" ${effective.previewMode === 'large-only' ? 'selected' : ''}>Large quantities only</option>
                <option value="never" ${effective.previewMode === 'never' ? 'selected' : ''}>Never</option>
            </select></label>
            <label class="form-group"><span class="form-label">Large threshold</span><input id="${prefix}-large-threshold" name="${prefix}-large-threshold" class="form-input" type="number" inputmode="numeric" autocomplete="off" min="1" step="1" value="${effective.largeThreshold}" ${disabled ? 'disabled' : ''}></label>
        </div>
    `;
};

const controlsSettingsCardHtml = settings => {
    const controlGroups = ['Navigation', 'Actions', 'Global'].map(category => `
        <section class="controls-settings-group" aria-labelledby="controls-group-${category.toLowerCase()}">
            <h4 id="controls-group-${category.toLowerCase()}">${category}</h4>
            <div class="controls-settings-rows">
                ${CONTROL_DEFINITIONS.filter(definition => definition.category === category).map(definition => {
                    const binding = settings.controls.hotkeys[definition.id] || '';
                    const isDefault = binding === definition.defaultBinding;
                    return `
                        <div class="control-setting-row" data-controls-search="${escapeAttribute(`${definition.label} ${category} ${formatBinding(binding)}`.toLowerCase())}">
                            <div class="control-setting-copy">
                                <strong>${escapeAttribute(definition.label)}</strong>
                                <span>${isDefault ? 'Default binding' : binding ? 'Custom binding' : 'No hotkey assigned'}</span>
                            </div>
                            <button class="hotkey-capture-btn" type="button" data-capture-control="${definition.id}" aria-label="Change hotkey for ${escapeAttribute(definition.label)}">
                                <kbd>${escapeAttribute(formatBinding(binding))}</kbd>
                            </button>
                            <div class="control-setting-actions">
                                <button class="icon-btn-sm" type="button" data-clear-control="${definition.id}" title="Clear ${escapeAttribute(definition.label)} hotkey" aria-label="Clear ${escapeAttribute(definition.label)} hotkey"><iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon></button>
                                <button class="icon-btn-sm" type="button" data-reset-control="${definition.id}" title="Reset ${escapeAttribute(definition.label)} hotkey" aria-label="Reset ${escapeAttribute(definition.label)} hotkey"><iconify-icon icon="lucide:rotate-ccw" aria-hidden="true"></iconify-icon></button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
    `).join('');

    const commandRows = COMMAND_DEFINITIONS.map(definition => {
        const custom = settings.controls.commands[definition.id];
        const canonical = [definition.defaultName, ...definition.defaultAliases];
        return `
            <div class="command-setting-row" data-controls-search="${escapeAttribute(`${definition.defaultName} ${custom.primary} ${custom.aliases.join(' ')} ${definition.description}`.toLowerCase())}">
                <div class="command-setting-header">
                    <div>
                        <strong>/${escapeAttribute(custom.primary)}</strong>
                        <span>${escapeAttribute(definition.description)}</span>
                    </div>
                    <button class="icon-btn-sm" type="button" data-reset-command="${definition.id}" title="Reset /${escapeAttribute(definition.defaultName)}" aria-label="Reset ${escapeAttribute(definition.defaultName)} command"><iconify-icon icon="lucide:rotate-ccw" aria-hidden="true"></iconify-icon></button>
                </div>
                <label class="command-name-field"><span>Primary name</span><span class="command-input-wrap"><b>/</b><input class="form-input command-primary-input" type="text" value="${escapeAttribute(custom.primary)}" maxlength="24" spellcheck="false" autocomplete="off" data-command-primary="${definition.id}"></span></label>
                <div class="command-alias-section">
                    <span class="command-field-label">Always available</span>
                    <div class="command-alias-list canonical">${canonical.map(name => `<span class="command-alias-chip locked" title="Canonical recovery name">/${escapeAttribute(name)} <iconify-icon icon="lucide:lock" aria-hidden="true"></iconify-icon></span>`).join('')}</div>
                </div>
                <div class="command-alias-section">
                    <span class="command-field-label">Custom aliases (${custom.aliases.length}/5)</span>
                    <div class="command-alias-list">${custom.aliases.length ? custom.aliases.map(alias => `<span class="command-alias-chip">/${escapeAttribute(alias)}<button type="button" data-remove-command-alias="${definition.id}" data-alias="${escapeAttribute(alias)}" aria-label="Remove /${escapeAttribute(alias)} alias"><iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon></button></span>`).join('') : '<span class="command-alias-empty">No custom aliases</span>'}</div>
                    <div class="command-alias-add"><span class="command-input-wrap"><b>/</b><input class="form-input" type="text" maxlength="24" spellcheck="false" autocomplete="off" placeholder="Add alias" data-command-alias-input="${definition.id}"></span><button class="action-btn secondary-btn btn-sm" type="button" data-add-command-alias="${definition.id}" ${custom.aliases.length >= 5 ? 'disabled' : ''}>Add</button></div>
                </div>
                <code class="command-usage">/${escapeAttribute(custom.primary)}${definition.usage ? ` ${escapeAttribute(definition.usage)}` : ''}</code>
            </div>
        `;
    }).join('');

    return `
        <div class="card settings-card settings-card-controls" data-help-subfeature="controls">
            <div class="card-header-styled controls-card-header">
                <div class="flex items-center gap-2">
                    <iconify-icon icon="lucide:keyboard" class="text-accent" aria-hidden="true"></iconify-icon>
                    <div><h3 class="card-title-sm">Controls & Commands</h3><p>Remap shortcuts and personalize Console command names in this browser.</p></div>
                </div>
            </div>
            <div class="settings-card-body">
                <label class="controls-settings-search" for="controls-settings-search"><iconify-icon icon="lucide:search" aria-hidden="true"></iconify-icon><span class="sr-only">Search controls and commands</span><input id="controls-settings-search" type="search" autocomplete="off" placeholder="Search controls or commands…"></label>
                <div class="controls-settings-section-heading"><div><h4>Hotkeys</h4><p>Shortcuts pause while typing and while dialogs are open.</p></div><button id="btn-reset-all-hotkeys" class="action-btn secondary-btn btn-sm" type="button"><iconify-icon icon="lucide:rotate-ccw" aria-hidden="true"></iconify-icon> Reset hotkeys</button></div>
                <div id="hotkey-settings-groups">${controlGroups}</div>
                <div class="divider-line my-4"></div>
                <div class="controls-settings-section-heading"><div><h4>Slash commands</h4><p>Canonical recovery names always work and do not count toward the five custom aliases.</p></div><button id="btn-reset-all-commands" class="action-btn secondary-btn btn-sm" type="button"><iconify-icon icon="lucide:rotate-ccw" aria-hidden="true"></iconify-icon> Reset commands</button></div>
                <div id="command-settings-rows" class="command-settings-rows">${commandRows}</div>
                <p id="controls-settings-empty" class="controls-settings-empty hidden">No controls or commands match that search.</p>
            </div>
        </div>
    `;
};

export const renderSettings = () => {
    cancelActiveHotkeyCapture?.();
    cancelActiveHotkeyCapture = null;
    const container = document.getElementById('panel-settings');
    if (!container) return;

    const settings = getStoredSettings();

    const densityOptionsHtml = NOTIFICATION_DENSITIES.map(d => `
        <label class="settings-option-card ${settings.density === d.id ? 'active' : ''}">
            <input type="radio" name="notif-density" value="${d.id}" ${settings.density === d.id ? 'checked' : ''} class="settings-radio">
            <div class="settings-option-info">
                <span class="settings-option-title">${d.label}</span>
                <span class="settings-option-desc text-subtle">${d.desc}</span>
            </div>
        </label>
    `).join('');

    const categoryTogglesHtml = NOTIFICATION_CATEGORIES.map(c => {
        const isEnabled = settings.categories[c.id] !== false;
        return `
            <div class="settings-toggle-row">
                <div class="settings-toggle-label">
                    <div class="settings-cat-icon-well">${iconHtml(c.icon)}</div>
                    <div>
                        <div class="font-bold text-sm">${c.label}</div>
                        <div class="text-xs text-subtle">${c.desc}</div>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" class="cat-filter-checkbox" data-category="${c.id}" ${isEnabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
    }).join('');

    const profile = getAuthProfile();
    const session = getAuthSession();
    const quantitySettings = settings.quantityPresets;
    const globalQuantity = quantitySettings.global;
    const systemQuantity = quantitySettings.systems[selectedQuantitySystem] || null;
    const systemEffective = { ...globalQuantity, ...(systemQuantity || {}) };
    const subjectQuantity = selectedQuantitySubject
        ? quantitySettings.subjects[selectedQuantitySystem]?.[selectedQuantitySubject] || null
        : null;

    container.innerHTML = `
        <div class="section-header">
            <div>
                <h2 id="panel-settings-heading">Settings</h2>
                <p class="section-subtitle">Control account synchronization, number formatting, interface density, and notifications.</p>
            </div>
        </div>

        <div class="settings-grid">
            <div class="card settings-card settings-card-account">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:shield-check" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Guild Master Account & Cloud Vault</h3>
                    </div>
                    <span class="charter-badge">${profile ? 'Cloud Synced' : 'Guest / Local'}</span>
                </div>
                <div class="settings-card-body">
                    ${profile ? `
                        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div>
                                <div class="font-bold text-base flex items-center gap-2">
                                    <span>${profile.username}</span>
                                    <span class="player-id-tag">Player ${profile.formatted_player_id || '#' + profile.player_id}</span>
                                </div>
                                <div class="text-xs text-subtle mt-1">${profile.email || 'No email attached'}</div>
                            </div>
                            <button id="btn-settings-sync-cloud" class="action-btn secondary-btn btn-sm" type="button">
                                <iconify-icon icon="lucide:cloud-upload"></iconify-icon> Sync Now
                            </button>
                        </div>
                        <button id="btn-settings-signout" class="action-btn secondary-btn btn-sm text-danger" type="button">
                            <iconify-icon icon="lucide:log-out"></iconify-icon> Sign Out
                        </button>
                    ` : `
                        <p class="text-sm text-subtle mb-3">You are playing as a Guest. Enlist or sign in with your Guild Master credentials to back up your economy progress and access your vault across any device.</p>
                        <div class="flex gap-2">
                            <button id="btn-settings-signin" class="action-btn primary-btn btn-sm" type="button">
                                <iconify-icon icon="lucide:log-in"></iconify-icon> Sign In
                            </button>
                            <button id="btn-settings-signup" class="action-btn secondary-btn btn-sm" type="button">
                                <iconify-icon icon="lucide:user-plus"></iconify-icon> Enlist Novice
                            </button>
                        </div>
                    `}
                </div>
            </div>

            ${controlsSettingsCardHtml(settings)}

            <div class="card settings-card settings-card-display" data-help-subfeature="display">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:monitor-cog" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Display & Timers</h3>
                    </div>
                    <span class="charter-badge">Local Preference</span>
                </div>
                <div class="settings-card-body settings-display-grid">
                    <div class="form-group">
                        <label for="setting-number-display" class="form-label">Number Prefix</label>
                        <select id="setting-number-display" name="number-display" class="form-select" autocomplete="off">
                            <option value="full" ${settings.numberDisplay === 'full' ? 'selected' : ''}>No prefix (full values)</option>
                            <option value="named" ${settings.numberDisplay === 'named' ? 'selected' : ''}>Value names</option>
                        </select>
                        <span class="field-help">No prefix is the default. Full: ${formatDisplayNumber(1250000, { numberDisplay: 'full' })} · Named: ${formatDisplayNumber(1250000, { numberDisplay: 'named' })}</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-interface-density" class="form-label">Interface Density</label>
                        <select id="setting-interface-density" name="interface-density" class="form-select" autocomplete="off">
                            <option value="dense" ${settings.interfaceDensity === 'dense' ? 'selected' : ''}>Dense</option>
                            <option value="balanced" ${settings.interfaceDensity === 'balanced' ? 'selected' : ''}>Balanced (Default)</option>
                            <option value="comfortable" ${settings.interfaceDensity === 'comfortable' ? 'selected' : ''}>Comfortable</option>
                        </select>
                        <span class="field-help">Changes shared controls, cards, navigation, and dialogs immediately.</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-duration-format" class="form-label">Duration Breakdown Style</label>
                        <select id="setting-duration-format" name="duration-format" class="form-select" autocomplete="off">
                            <option value="adaptive" ${settings.durationFormat === 'adaptive' ? 'selected' : ''}>Smart Adaptive (Top 3 units · 371y 7mo 1w)</option>
                            <option value="adaptive-2" ${settings.durationFormat === 'adaptive-2' ? 'selected' : ''}>Compact Adaptive (Top 2 units · 371y 7mo)</option>
                            <option value="full" ${settings.durationFormat === 'full' ? 'selected' : ''}>Full Breakdown (All units · 371y 7mo 1w 2d 1h 25m 55s)</option>
                            <option value="days-hours" ${settings.durationFormat === 'days-hours' ? 'selected' : ''}>Days & Hours (e.g. 135500d 9h 24m 55s)</option>
                            <option value="hours" ${settings.durationFormat === 'hours' ? 'selected' : ''}>Raw Hours Only (e.g. 3255217h 24m 55s)</option>
                        </select>
                        <span class="field-help">Automatically converts long durations into years, months, weeks, days, and hours.</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-timer-date-format" class="form-label">Timer Expiration Date Format</label>
                        <select id="setting-timer-date-format" name="timer-date-format" class="form-select" autocomplete="off">
                            <option value="dd/mm/yyyy" ${settings.timerDateFormat === 'dd/mm/yyyy' ? 'selected' : ''}>DD/MM/YYYY (e.g. 23/08/2026)</option>
                            <option value="dd-mm-yyyy" ${settings.timerDateFormat === 'dd-mm-yyyy' ? 'selected' : ''}>DD-MM-YYYY (e.g. 23-08-2026)</option>
                            <option value="dd.mm.yyyy" ${settings.timerDateFormat === 'dd.mm.yyyy' ? 'selected' : ''}>DD.MM.YYYY (e.g. 23.08.2026)</option>
                            <option value="yyyy-mm-dd" ${settings.timerDateFormat === 'yyyy-mm-dd' ? 'selected' : ''}>YYYY-MM-DD (ISO: 2026-08-23)</option>
                            <option value="yyyy/mm/dd" ${settings.timerDateFormat === 'yyyy/mm/dd' ? 'selected' : ''}>YYYY/MM/DD (e.g. 2026/08/23)</option>
                            <option value="mm/dd/yyyy" ${settings.timerDateFormat === 'mm/dd/yyyy' ? 'selected' : ''}>MM/DD/YYYY (US: 08/23/2026)</option>
                            <option value="d-mmm-yyyy" ${settings.timerDateFormat === 'd-mmm-yyyy' ? 'selected' : ''}>D MMM YYYY (e.g. 23 Aug 2026)</option>
                            <option value="mmm-d-yyyy" ${settings.timerDateFormat === 'mmm-d-yyyy' ? 'selected' : ''}>MMM D, YYYY (e.g. Aug 23, 2026)</option>
                            <option value="full-date" ${settings.timerDateFormat === 'full-date' ? 'selected' : ''}>Day, D Month YYYY (e.g. Sun, 23 August 2026)</option>
                        </select>
                        <span class="field-help">Date format shown when hovering over active booster and faction timers.</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-timer-time-format" class="form-label">Timer Expiration Time Display</label>
                        <select id="setting-timer-time-format" name="timer-time-format" class="form-select" autocomplete="off">
                            <option value="24h" ${settings.timerTimeFormat === '24h' ? 'selected' : ''}>24-Hour with Seconds (15:30:45)</option>
                            <option value="24h-short" ${settings.timerTimeFormat === '24h-short' ? 'selected' : ''}>24-Hour Short (15:30)</option>
                            <option value="12h" ${settings.timerTimeFormat === '12h' ? 'selected' : ''}>12-Hour with Seconds (03:30:45 PM)</option>
                            <option value="12h-short" ${settings.timerTimeFormat === '12h-short' ? 'selected' : ''}>12-Hour Short (03:30 PM)</option>
                            <option value="none" ${settings.timerTimeFormat === 'none' ? 'selected' : ''}>Date Only (No Time)</option>
                        </select>
                        <span class="field-help">Include timestamp time alongside the date upon hover.</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-timer-timezone" class="form-label">Timer Timezone</label>
                        <select id="setting-timer-timezone" name="timer-timezone" class="form-select" autocomplete="off">
                            <option value="local" ${settings.timerTimezone === 'local' ? 'selected' : ''}>Local Timezone (Device)</option>
                            <option value="utc" ${settings.timerTimezone === 'utc' ? 'selected' : ''}>UTC (Coordinated Universal Time)</option>
                        </select>
                        <span class="field-help">Display timestamps in your local device timezone or standard UTC.</span>
                    </div>

                    <div class="form-group">
                        <label for="setting-timer-hover-mode" class="form-label">Timer Hover Action</label>
                        <select id="setting-timer-hover-mode" name="timer-hover-mode" class="form-select" autocomplete="off">
                            <option value="swap" ${settings.timerHoverMode === 'swap' ? 'selected' : ''}>Swap Text in-place on Hover</option>
                            <option value="both" ${settings.timerHoverMode === 'both' ? 'selected' : ''}>Swap Text & Tooltip on Hover</option>
                            <option value="tooltip" ${settings.timerHoverMode === 'tooltip' ? 'selected' : ''}>Tooltip only</option>
                        </select>
                        <span class="field-help">Hover over any active timer to inspect its calculated expiration date.</span>
                    </div>

                    <div class="settings-toggle-row">
                        <div class="settings-toggle-label">
                            <div>
                                <div class="font-bold text-sm">Collapse active search on blur</div>
                                <div class="text-xs text-subtle">Hide expanded search fields after focus leaves, even when a query is active.</div>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="setting-collapse-search-on-blur" ${settings.collapseSearchOnBlur ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="settings-display-preview" aria-live="polite">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span class="settings-display-preview-label">Live Display Preview</span>
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:8px;">
                            <strong title="$1,250,000">${formatMoney(1250000)}</strong>
                            <span>${formatDisplayNumber(987654321)} units</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; padding-top:6px; border-top:1px solid var(--border-subtle, rgba(255,255,255,0.08));">
                            <span class="text-xs text-subtle">Sample Timer (Hover me!):</span>
                            <span class="boost-timer preview-timer-pill timer-hoverable" data-expire="${Date.now() + 3255217 * 3600 * 1000}" title="Expires: ${formatTimestampDate(Date.now() + 3255217 * 3600 * 1000, settings)}">${formatDurationMs(3255217 * 3600 * 1000, settings)}</span>
                        </div>
                    </div>

                    <div class="settings-display-reset">
                        <button id="btn-reset-display-settings" class="action-btn secondary-btn" type="button">
                            ${iconHtml('lucide:rotate-ccw')} Reset Display Settings
                        </button>
                    </div>
                </div>
            </div>

            <div class="card settings-card settings-card-quantity" data-help-subfeature="quantities">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:list-filter" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Shared Quantity Presets</h3>
                    </div>
                    <span class="charter-badge">Global → System → Item</span>
                </div>
                <div class="settings-card-body quantity-settings-body">
                    <p class="text-xs text-subtle">Set four reusable quantities plus the permanent Max action. A system or individual item inherits every value it does not override.</p>

                    <section class="quantity-settings-scope" aria-labelledby="quantity-global-heading">
                        <div class="quantity-settings-scope-header"><div><h4 id="quantity-global-heading">Global defaults</h4><p>Used by every supported quantity control unless a narrower scope overrides it.</p></div></div>
                        ${presetFieldsHtml('quantity-global', globalQuantity, globalQuantity)}
                        <button class="action-btn secondary-btn btn-sm" type="button" data-save-quantity-scope="global">Save global defaults</button>
                    </section>

                    <section class="quantity-settings-scope" aria-labelledby="quantity-system-heading">
                        <div class="quantity-settings-scope-header">
                            <div><h4 id="quantity-system-heading">System override</h4><p>Choose one workflow and optionally replace its inherited settings.</p></div>
                            <label class="toggle-switch" title="Enable system override"><span class="sr-only">Enable system quantity override</span><input id="quantity-system-override" name="quantity-system-override" type="checkbox" ${systemQuantity ? 'checked' : ''}><span class="toggle-slider"></span></label>
                        </div>
                        <label class="form-group"><span class="form-label">System</span><select id="quantity-system-select" name="quantity-system-select" class="form-select">${QUANTITY_PRESET_SYSTEMS.map(id => `<option value="${id}" ${id === selectedQuantitySystem ? 'selected' : ''}>${QUANTITY_SYSTEM_LABELS[id]}</option>`).join('')}</select></label>
                        ${presetFieldsHtml('quantity-system', systemQuantity, globalQuantity, !systemQuantity)}
                        <button class="action-btn secondary-btn btn-sm" type="button" data-save-quantity-scope="system" ${systemQuantity ? '' : 'disabled'}>Save system override</button>
                    </section>

                    <section class="quantity-settings-scope" aria-labelledby="quantity-subject-heading">
                        <div class="quantity-settings-scope-header">
                            <div><h4 id="quantity-subject-heading">Item override</h4><p>Use a recipe, item, tool, module, or perk ID for a precise final override.</p></div>
                            ${selectedQuantitySubject ? `<label class="toggle-switch" title="Enable item override"><span class="sr-only">Enable item quantity override</span><input id="quantity-subject-override" name="quantity-subject-override" type="checkbox" ${subjectQuantity ? 'checked' : ''}><span class="toggle-slider"></span></label>` : ''}
                        </div>
                        <div class="quantity-subject-loader"><label class="form-group"><span class="form-label">Subject ID</span><input id="quantity-subject-id" name="quantity-subject-id" class="form-input" type="text" autocomplete="off" spellcheck="false" maxlength="200" value="${escapeAttribute(selectedQuantitySubject)}" placeholder="WholeGrainFlourBlend…"></label><button id="btn-load-quantity-subject" class="action-btn secondary-btn btn-sm" type="button">Load item</button></div>
                        ${selectedQuantitySubject ? `${presetFieldsHtml('quantity-subject', subjectQuantity, systemEffective, !subjectQuantity)}<button class="action-btn secondary-btn btn-sm" type="button" data-save-quantity-scope="subject" ${subjectQuantity ? '' : 'disabled'}>Save item override</button>` : '<p class="text-xs text-subtle">Enter an ID and load it to inspect or configure its inherited values.</p>'}
                    </section>
                </div>
            </div>

            <!-- Card 1: Notification Density -->
            <div class="card settings-card">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:bell" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Notification Density</h3>
                    </div>
                    <span class="charter-badge font-mono">${settings.density.toUpperCase()}</span>
                </div>
                <div class="settings-card-body">
                    <p class="text-xs text-subtle mb-3">Control the frequency and visibility threshold of floating on-screen notifications.</p>
                    <div class="settings-options-group">
                        ${densityOptionsHtml}
                    </div>
                </div>
            </div>

            <!-- Card 2: Toast Engine & Adaptive Coalescing -->
            <div class="card settings-card">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:layers" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Adaptive Toast Engine</h3>
                    </div>
                </div>
                <div class="settings-card-body">
                    <div class="settings-toggle-row mb-4">
                        <div class="settings-toggle-label">
                            <div>
                                <div class="font-bold text-sm">Adaptive Notification Coalescing</div>
                                <div class="text-xs text-subtle">Merges repeated clicks into a single card with adaptive multipliers (1x, 2x, 3x...) and pulse feedback.</div>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="setting-coalescing-toggle" ${settings.coalescing ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="settings-toggle-row mb-4">
                        <div class="settings-toggle-label">
                            <div>
                                <div class="font-bold text-sm">Direct to Activity Ledger</div>
                                <div class="text-xs text-subtle">Always logs all events to the Console feed, even when floating screen toasts are filtered or muted.</div>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="setting-mirror-log-toggle" ${settings.mirrorToLog ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="setting-max-toasts" class="form-label font-bold text-sm">Max Concurrent On-Screen Toasts:</label>
                        <div class="flex items-center gap-3">
                            <select id="setting-max-toasts" class="form-input" style="max-width: 140px;">
                                <option value="2" ${settings.maxVisible === 2 ? 'selected' : ''}>2 Toasts</option>
                                <option value="3" ${settings.maxVisible === 3 ? 'selected' : ''}>3 Toasts</option>
                                <option value="4" ${settings.maxVisible === 4 ? 'selected' : ''}>4 Toasts (Default)</option>
                                <option value="5" ${settings.maxVisible === 5 ? 'selected' : ''}>5 Toasts</option>
                                <option value="8" ${settings.maxVisible === 8 ? 'selected' : ''}>8 Toasts</option>
                            </select>
                            <span class="text-xs text-subtle">Evicts oldest toasts automatically when exceeded.</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card 3: Notification Categories -->
            <div class="card settings-card">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:sliders-horizontal" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Category Filter Toggles</h3>
                    </div>
                </div>
                <div class="settings-card-body">
                    <p class="text-xs text-subtle mb-3">Choose which game activities display floating toasts.</p>
                    <div class="settings-toggles-list">
                        ${categoryTogglesHtml}
                    </div>
                </div>
            </div>

            <!-- Card 4: Interactive Test & Confirmation Controls -->
            <div class="card settings-card">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:sparkles" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Live Preview & Dialogs</h3>
                    </div>
                </div>
                <div class="settings-card-body">
                    <div class="mb-4">
                        <div class="font-bold text-sm mb-1">Live Notification Demo</div>
                        <div class="text-xs text-subtle mb-3">Click rapidly to test adaptive coalescing, monospace pill badges, and pulse animations.</div>
                        <div class="flex flex-wrap gap-2">
                            <button id="btn-test-adaptive-toast" class="action-btn primary-btn btn-sm" type="button">
                                ${iconHtml('lucide:zap')} Test Adaptive Toast (+1)
                            </button>
                            <button id="btn-test-alert-toast" class="action-btn secondary-btn btn-sm" type="button">
                                ${iconHtml('lucide:alert-triangle')} Test Alert Toast
                            </button>
                        </div>
                    </div>

                    <div class="divider-line my-4"></div>

                    <div>
                        <div class="font-bold text-sm mb-1">Confirmation Dialogs</div>
                        <div class="text-xs text-subtle mb-3">Choose whether multi-item spending actions show a review step before execution.</div>
                        <div class="settings-toggle-row mb-3">
                            <div class="settings-toggle-label">
                                <div>
                                    <div class="font-bold text-sm">Skip all bulk previews</div>
                                    <div class="text-xs text-subtle">Keep required quantity and target controls, but execute without a second preview.</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-skip-all-bulk-previews" ${settings.bulkActions.skipAllPreviews ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="settings-toggle-row mb-3">
                            <div class="settings-toggle-label">
                                <div>
                                    <div class="font-bold text-sm">Show unavailable booster action</div>
                                    <div class="text-xs text-subtle">Keep Activate Boosters visible and disabled when no boosters are owned.</div>
                                </div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="setting-show-unavailable-booster-action" ${settings.inventory.showUnavailableBoosterAction ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>

                        <div class="text-xs text-subtle mb-3">Restore previews and confirmation prompts suppressed with “Don't show again”.</div>
                        <button id="btn-reset-all-confirmations" class="action-btn secondary-btn btn-sm text-danger" type="button">
                            ${iconHtml('lucide:rotate-ccw')} Reset Ignored Confirmations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupSettingsEvents(container);
};

export const setupSettingsEvents = (container) => {
    if (!container) return;

    const saveHotkey = async (controlId, binding, { reset = false } = {}) => {
        const definition = CONTROL_DEFINITIONS.find(entry => entry.id === controlId);
        if (!definition) return;
        const settings = getStoredSettings();
        const nextBinding = reset ? definition.defaultBinding : binding;
        const priorBinding = settings.controls.hotkeys[controlId] || '';
        const conflict = CONTROL_DEFINITIONS.find(entry => entry.id !== controlId && settings.controls.hotkeys[entry.id] === nextBinding);
        if (conflict && nextBinding) {
            const confirmed = await showConfirmation(
                'swapHotkey',
                'Swap hotkeys?',
                `${formatBinding(nextBinding)} is assigned to ${conflict.label}. Swap the two bindings?`,
                { allowIgnore: false }
            );
            if (!confirmed) {
                renderSettings();
                return;
            }
            settings.controls.hotkeys[conflict.id] = priorBinding;
        }
        settings.controls.hotkeys[controlId] = nextBinding;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`${definition.label} set to ${formatBinding(nextBinding)}.`, 'success');
    };

    const controlsSearch = document.getElementById('controls-settings-search');
    controlsSearch?.addEventListener('input', () => {
        const query = controlsSearch.value.trim().toLowerCase();
        let visibleCount = 0;
        container.querySelectorAll('[data-controls-search]').forEach(row => {
            const visible = !query || row.dataset.controlsSearch.includes(query);
            row.classList.toggle('hidden', !visible);
            if (visible) visibleCount += 1;
        });
        container.querySelectorAll('.controls-settings-group').forEach(group => {
            group.classList.toggle('hidden', !group.querySelector('[data-controls-search]:not(.hidden)'));
        });
        document.getElementById('controls-settings-empty')?.classList.toggle('hidden', visibleCount !== 0);
    });

    container.querySelectorAll('[data-capture-control]').forEach(button => button.addEventListener('click', () => {
        cancelActiveHotkeyCapture?.();
        const controlId = button.dataset.captureControl;
        button.classList.add('capturing');
        button.innerHTML = '<span>Press a key…</span>';
        const capture = async event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return;
            cancelActiveHotkeyCapture?.();
            cancelActiveHotkeyCapture = null;
            if (event.key === 'Escape') {
                renderSettings();
                return;
            }
            const binding = bindingFromKeyboardEvent(event);
            if (!binding) {
                showToast('Use one non-modifier key, with optional Ctrl, Alt, Shift, or Meta.', 'error');
                renderSettings();
                return;
            }
            if (isReservedBinding(binding)) {
                showToast(`${formatBinding(binding)} is reserved by the browser and cannot be assigned.`, 'error');
                renderSettings();
                return;
            }
            await saveHotkey(controlId, binding);
        };
        const captureTimer = setTimeout(() => document.addEventListener('keydown', capture, { capture: true }), 0);
        cancelActiveHotkeyCapture = () => {
            clearTimeout(captureTimer);
            document.removeEventListener('keydown', capture, { capture: true });
        };
    }));

    container.querySelectorAll('[data-clear-control]').forEach(button => button.addEventListener('click', async () => {
        await saveHotkey(button.dataset.clearControl, '');
    }));
    container.querySelectorAll('[data-reset-control]').forEach(button => button.addEventListener('click', async () => {
        await saveHotkey(button.dataset.resetControl, '', { reset: true });
    }));

    document.getElementById('btn-reset-all-hotkeys')?.addEventListener('click', async () => {
        const confirmed = await showConfirmation('resetHotkeys', 'Reset all hotkeys?', 'Restore every navigation, action, and global shortcut to its default binding?', { allowIgnore: false });
        if (!confirmed) return;
        const settings = getStoredSettings();
        settings.controls.hotkeys = { ...getDefaultSettings().controls.hotkeys };
        saveStoredSettings(settings);
        renderSettings();
        showToast('All hotkeys reset to defaults.', 'info');
    });

    const saveCommandPrimary = (commandId, rawName) => {
        const name = normalizeCommandName(rawName);
        const error = commandNameError(name);
        if (error) {
            showToast(error, 'error');
            renderSettings();
            return;
        }
        const settings = getStoredSettings();
        const owner = getCommandNameOwner(name, settings.controls);
        if (owner && owner !== commandId) {
            showToast(`/${name} already belongs to another command.`, 'error');
            renderSettings();
            return;
        }
        settings.controls.commands[commandId].primary = name;
        settings.controls.commands[commandId].aliases = settings.controls.commands[commandId].aliases.filter(alias => alias !== name);
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Primary command changed to /${name}.`, 'success');
    };

    container.querySelectorAll('[data-command-primary]').forEach(input => {
        const commit = () => saveCommandPrimary(input.dataset.commandPrimary, input.value);
        input.addEventListener('change', commit);
        input.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            commit();
        });
    });

    const addCommandAlias = commandId => {
        const input = container.querySelector(`[data-command-alias-input="${commandId}"]`);
        const alias = normalizeCommandName(input?.value);
        const error = commandNameError(alias);
        if (error) {
            showToast(error, 'error');
            return;
        }
        const settings = getStoredSettings();
        const command = settings.controls.commands[commandId];
        if (command.aliases.length >= 5) {
            showToast('Each command supports up to five custom aliases.', 'error');
            return;
        }
        const owner = getCommandNameOwner(alias, settings.controls);
        if (owner) {
            showToast(owner === commandId ? `/${alias} already works for this command.` : `/${alias} already belongs to another command.`, 'error');
            return;
        }
        command.aliases.push(alias);
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Added /${alias} alias.`, 'success');
    };

    container.querySelectorAll('[data-add-command-alias]').forEach(button => button.addEventListener('click', () => addCommandAlias(button.dataset.addCommandAlias)));
    container.querySelectorAll('[data-command-alias-input]').forEach(input => input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        addCommandAlias(input.dataset.commandAliasInput);
    }));
    container.querySelectorAll('[data-remove-command-alias]').forEach(button => button.addEventListener('click', () => {
        const settings = getStoredSettings();
        const command = settings.controls.commands[button.dataset.removeCommandAlias];
        command.aliases = command.aliases.filter(alias => alias !== button.dataset.alias);
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Removed /${button.dataset.alias} alias.`, 'info');
    }));
    container.querySelectorAll('[data-reset-command]').forEach(button => button.addEventListener('click', () => {
        const definition = COMMAND_DEFINITIONS.find(entry => entry.id === button.dataset.resetCommand);
        if (!definition) return;
        const settings = getStoredSettings();
        settings.controls.commands[definition.id] = { primary: definition.defaultName, aliases: [] };
        saveStoredSettings(settings);
        renderSettings();
        showToast(`/${definition.defaultName} reset to defaults.`, 'info');
    }));

    document.getElementById('btn-reset-all-commands')?.addEventListener('click', async () => {
        const confirmed = await showConfirmation('resetCommands', 'Reset all slash commands?', 'Restore every primary command name and remove all custom aliases?', { allowIgnore: false });
        if (!confirmed) return;
        const settings = getStoredSettings();
        settings.controls.commands = Object.fromEntries(
            Object.entries(getDefaultSettings().controls.commands)
                .map(([id, command]) => [id, { primary: command.primary, aliases: [...command.aliases] }])
        );
        saveStoredSettings(settings);
        renderSettings();
        showToast('All slash commands reset to defaults.', 'info');
    });

    // Account & Auth buttons
    document.getElementById('btn-settings-signin')?.addEventListener('click', () => {
        openAuthModal('signin');
    });

    document.getElementById('btn-settings-signup')?.addEventListener('click', () => {
        openAuthModal('signup');
    });

    document.getElementById('btn-settings-signout')?.addEventListener('click', async () => {
        await signOutUser();
        renderSettings();
        showToast('Signed out of Bconomy.', 'info');
    });

    document.getElementById('btn-settings-sync-cloud')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-settings-sync-cloud');
        if (btn) btn.classList.add('btn-loading');
        const success = await syncStateToCloud();
        if (btn) btn.classList.remove('btn-loading');
        if (success) {
            showToast('Progress successfully synced to Supabase!', 'success');
        } else {
            showToast('Could not sync to cloud.', 'error');
        }
    });

    const numberDisplay = document.getElementById('setting-number-display');
    numberDisplay?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.numberDisplay = numberDisplay.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Number prefix set to ${numberDisplay.value === 'named' ? 'Value names' : 'None'}`, 'info');
    });

    const interfaceDensity = document.getElementById('setting-interface-density');
    interfaceDensity?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.interfaceDensity = interfaceDensity.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Interface density set to ${interfaceDensity.value}`, 'info');
    });

    const collapseSearchOnBlur = document.getElementById('setting-collapse-search-on-blur');
    collapseSearchOnBlur?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.collapseSearchOnBlur = collapseSearchOnBlur.checked;
        saveStoredSettings(settings);
        showToast(`Active search collapse ${collapseSearchOnBlur.checked ? 'enabled' : 'disabled'}`, 'info');
    });

    const durationFormat = document.getElementById('setting-duration-format');
    durationFormat?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.durationFormat = durationFormat.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Duration breakdown set to ${durationFormat.value}`, 'info');
    });

    const timerDateFormat = document.getElementById('setting-timer-date-format');
    timerDateFormat?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.timerDateFormat = timerDateFormat.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Timer date format set to ${timerDateFormat.value.toUpperCase()}`, 'info');
    });

    const timerTimeFormat = document.getElementById('setting-timer-time-format');
    timerTimeFormat?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.timerTimeFormat = timerTimeFormat.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Timer time display set to ${timerTimeFormat.value}`, 'info');
    });

    const timerTimezone = document.getElementById('setting-timer-timezone');
    timerTimezone?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.timerTimezone = timerTimezone.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Timer timezone set to ${timerTimezone.value.toUpperCase()}`, 'info');
    });

    const timerHoverMode = document.getElementById('setting-timer-hover-mode');
    timerHoverMode?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.timerHoverMode = timerHoverMode.value;
        saveStoredSettings(settings);
        renderSettings();
        showToast(`Timer hover action set to ${timerHoverMode.value}`, 'info');
    });

    document.getElementById('btn-reset-display-settings')?.addEventListener('click', () => {
        resetDisplaySettings();
        renderSettings();
        showToast('Display settings reset to defaults', 'info');
    });

    const readPresetScope = prefix => {
        const values = [0, 1, 2, 3].map(index => Number(document.getElementById(`${prefix}-preset-${index}`)?.value));
        const threshold = Number(document.getElementById(`${prefix}-large-threshold`)?.value);
        if (!values.every(value => Number.isSafeInteger(value) && value > 0)) {
            showToast('Every quantity preset must be a positive whole number.', 'error');
            return null;
        }
        if (new Set(values).size !== values.length) {
            showToast('Quantity presets must be distinct within a scope.', 'error');
            return null;
        }
        if (!Number.isSafeInteger(threshold) || threshold < 1) {
            showToast('The large-operation threshold must be a positive whole number.', 'error');
            return null;
        }
        return {
            values,
            previewMode: document.getElementById(`${prefix}-preview-mode`)?.value || 'recursive-only',
            largeThreshold: threshold
        };
    };

    document.getElementById('quantity-system-select')?.addEventListener('change', event => {
        selectedQuantitySystem = event.currentTarget.value;
        selectedQuantitySubject = '';
        renderSettings();
    });

    document.getElementById('btn-load-quantity-subject')?.addEventListener('click', () => {
        const value = document.getElementById('quantity-subject-id')?.value.trim() || '';
        if (!value) {
            showToast('Enter an item or operation ID to load.', 'error');
            return;
        }
        selectedQuantitySubject = value.slice(0, 200);
        renderSettings();
    });

    document.getElementById('quantity-system-override')?.addEventListener('change', event => {
        const current = getStoredSettings();
        if (event.currentTarget.checked) {
            current.quantityPresets.systems[selectedQuantitySystem] = { ...current.quantityPresets.global, values: [...current.quantityPresets.global.values] };
        } else {
            delete current.quantityPresets.systems[selectedQuantitySystem];
            delete current.quantityPresets.subjects[selectedQuantitySystem];
        }
        saveStoredSettings(current);
        renderSettings();
    });

    document.getElementById('quantity-subject-override')?.addEventListener('change', event => {
        if (!selectedQuantitySubject) return;
        const current = getStoredSettings();
        current.quantityPresets.subjects[selectedQuantitySystem] ||= {};
        if (event.currentTarget.checked) {
            const inherited = { ...current.quantityPresets.global, ...(current.quantityPresets.systems[selectedQuantitySystem] || {}) };
            current.quantityPresets.subjects[selectedQuantitySystem][selectedQuantitySubject] = { ...inherited, values: [...inherited.values] };
        } else {
            delete current.quantityPresets.subjects[selectedQuantitySystem][selectedQuantitySubject];
            if (!Object.keys(current.quantityPresets.subjects[selectedQuantitySystem]).length) delete current.quantityPresets.subjects[selectedQuantitySystem];
        }
        saveStoredSettings(current);
        renderSettings();
    });

    container.querySelectorAll('[data-save-quantity-scope]').forEach(button => button.addEventListener('click', () => {
        const scopeName = button.dataset.saveQuantityScope;
        const prefix = `quantity-${scopeName}`;
        const scope = readPresetScope(prefix);
        if (!scope) return;
        const current = getStoredSettings();
        if (scopeName === 'global') current.quantityPresets.global = scope;
        if (scopeName === 'system') current.quantityPresets.systems[selectedQuantitySystem] = scope;
        if (scopeName === 'subject' && selectedQuantitySubject) {
            current.quantityPresets.subjects[selectedQuantitySystem] ||= {};
            current.quantityPresets.subjects[selectedQuantitySystem][selectedQuantitySubject] = scope;
        }
        saveStoredSettings(current);
        renderSettings();
        showToast(`${scopeName === 'subject' ? 'Item' : scopeName[0].toUpperCase() + scopeName.slice(1)} quantity presets saved.`, 'success');
    }));

    const skipBulkPreviews = document.getElementById('setting-skip-all-bulk-previews');
    skipBulkPreviews?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.bulkActions.skipAllPreviews = skipBulkPreviews.checked;
        saveStoredSettings(settings);
        showToast(`Bulk previews ${skipBulkPreviews.checked ? 'disabled' : 'enabled'}`, 'info');
    });

    const showUnavailableBoosterAction = document.getElementById('setting-show-unavailable-booster-action');
    showUnavailableBoosterAction?.addEventListener('change', () => {
        const settings = getStoredSettings();
        settings.inventory.showUnavailableBoosterAction = showUnavailableBoosterAction.checked;
        saveStoredSettings(settings);
        showToast(`Unavailable booster action ${showUnavailableBoosterAction.checked ? 'shown' : 'hidden'}`, 'info');
    });

    // Density selector
    const densityRadios = container.querySelectorAll('input[name="notif-density"]');
    densityRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const settings = getStoredSettings();
            settings.density = radio.value;
            saveStoredSettings(settings);
            renderSettings();
            showToast(`Notification density set to ${radio.value.toUpperCase()}`, 'info');
        });
    });

    // Coalescing toggle
    const coalescingToggle = document.getElementById('setting-coalescing-toggle');
    if (coalescingToggle) {
        coalescingToggle.addEventListener('change', () => {
            const settings = getStoredSettings();
            settings.coalescing = coalescingToggle.checked;
            saveStoredSettings(settings);
            showToast(`Adaptive Coalescing ${settings.coalescing ? 'Enabled' : 'Disabled'}`, 'info');
        });
    }

    // Mirror to log toggle
    const mirrorLogToggle = document.getElementById('setting-mirror-log-toggle');
    if (mirrorLogToggle) {
        mirrorLogToggle.addEventListener('change', () => {
            const settings = getStoredSettings();
            settings.mirrorToLog = mirrorLogToggle.checked;
            saveStoredSettings(settings);
            showToast(`Activity Ledger Mirroring ${settings.mirrorToLog ? 'Enabled' : 'Disabled'}`, 'info');
        });
    }

    // Max toasts selector
    const maxToastsSelect = document.getElementById('setting-max-toasts');
    if (maxToastsSelect) {
        maxToastsSelect.addEventListener('change', () => {
            const settings = getStoredSettings();
            settings.maxVisible = parseInt(maxToastsSelect.value, 10) || 4;
            saveStoredSettings(settings);
            showToast(`Max visible toasts set to ${settings.maxVisible}`, 'info');
        });
    }

    // Category checkboxes
    const catCheckboxes = container.querySelectorAll('.cat-filter-checkbox');
    catCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const catId = cb.dataset.category;
            const settings = getStoredSettings();
            settings.categories[catId] = cb.checked;
            saveStoredSettings(settings);
            showToast(`Category [${catId.toUpperCase()}] ${cb.checked ? 'Enabled' : 'Muted'}`, 'info');
        });
    });

    // Test adaptive toast button
    const btnTestAdaptive = document.getElementById('btn-test-adaptive-toast');
    if (btnTestAdaptive) {
        btnTestAdaptive.addEventListener('click', () => {
            showToast('Upgraded Lucky Drops!', 'success', 3000, { category: 'perks' });
        });
    }

    // Test alert toast button
    const btnTestAlert = document.getElementById('btn-test-alert-toast');
    if (btnTestAlert) {
        btnTestAlert.addEventListener('click', () => {
            showToast('System operational warning check.', 'warning', 4000, { category: 'alerts' });
        });
    }

    // Reset confirmations button
    const btnResetConf = document.getElementById('btn-reset-all-confirmations');
    if (btnResetConf) {
        btnResetConf.addEventListener('click', () => {
            clearIgnoredConfirmations();
            showToast('All confirmation dialogs restored!', 'info');
            addLogEntry('Reset all ignored confirmation dialogs in settings.', 'system');
        });
    }
};
