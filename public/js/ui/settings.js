// Settings UI & Notification Filter Manager
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { clearIgnoredConfirmations } from './modal.js';
import { iconHtml, formatDisplayNumber, formatMoney } from '../utils.js';
import {
    SETTINGS_STORAGE_KEY,
    getDefaultSettings,
    getStoredSettings,
    saveStoredSettings,
    resetDisplaySettings
} from '../preferences.js';
import { getAuthProfile, getAuthSession, signOutUser } from '../auth.js';
import { openAuthModal } from './authModal.js';
import { syncStateToCloud } from '../state.js';

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

export const renderSettings = () => {
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

            <div class="card settings-card settings-card-display">
                <div class="card-header-styled">
                    <div class="flex items-center gap-2">
                        <iconify-icon icon="lucide:monitor-cog" class="text-accent" aria-hidden="true"></iconify-icon>
                        <h3 class="card-title-sm">Display</h3>
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
                        <span class="settings-display-preview-label">Preview</span>
                        <strong title="$1,250,000">${formatMoney(1250000)}</strong>
                        <span>${formatDisplayNumber(987654321)} units</span>
                    </div>

                    <div class="settings-display-reset">
                        <button id="btn-reset-display-settings" class="action-btn secondary-btn" type="button">
                            ${iconHtml('lucide:rotate-ccw')} Reset Display Settings
                        </button>
                    </div>
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

    document.getElementById('btn-reset-display-settings')?.addEventListener('click', () => {
        resetDisplaySettings();
        renderSettings();
        showToast('Display settings reset to defaults', 'info');
    });

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
