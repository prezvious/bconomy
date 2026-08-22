import { getState } from '../state.js';
import {
    displayItemName,
    formatDisplayNumber,
    formatNumberCommas,
    getBoosterConfig
} from '../utils.js';
import { doPreviewBulkBoosters, doExecuteBulkBoosters } from '../api.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import {
    openDialog,
    closeDialog,
    replaceDialog,
    setConfirmationIgnored,
    shouldSkipBulkPreview
} from './modal.js';

const PREVIEW_KEY = 'bulkBoosterActivation';
const ACTION_ORDER = ['mine', 'explore', 'hunt', 'fish'];
const TIER_ORDER = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

let currentMode = 'allOwned';
let lastOptions = null;
let lastPreview = null;
let completionCallback = null;

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDuration = ms => {
    const totalMinutes = Math.max(0, Math.round(Number(ms || 0) / 60_000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
};

const formatExpiry = timestamp => timestamp > 0
    ? new Date(timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Inactive';

export const getOwnedBoosterEntries = (state = getState()) => {
    const inventory = state && state.inventory && typeof state.inventory === 'object' ? state.inventory : {};
    return Object.entries(inventory)
        .map(([itemName, rawQuantity]) => {
            const config = getBoosterConfig(itemName);
            const quantity = rawQuantity;
            if (!config || typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity <= 0) return null;
            return { itemName, quantity, ...config };
        })
        .filter(Boolean)
        .sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action)
            || TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
            || displayItemName(a.itemName).localeCompare(displayItemName(b.itemName)));
};

export const getOwnedBoosterUnitCount = (state = getState()) => getOwnedBoosterEntries(state)
    .reduce((sum, entry) => sum + entry.quantity, 0);

const getSelectedQuantity = input => {
    const quantity = Number(input.value);
    const owned = Number(input.max);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > owned) return null;
    return quantity;
};

const updateSelectionSummary = () => {
    let totalUnits = 0;
    let itemTypes = 0;
    document.querySelectorAll('.bulk-booster-qty').forEach(input => {
        const quantity = getSelectedQuantity(input);
        if (quantity !== null && quantity > 0) {
            totalUnits += quantity;
            itemTypes += 1;
        }
        const duration = Number(input.dataset.durationMs || 0) * Math.max(0, quantity || 0);
        const row = input.closest?.('tr');
        const durationEl = row?.querySelector?.('.bulk-booster-duration-add');
        if (durationEl) durationEl.textContent = `+${formatDuration(duration)}`;
    });

    const summary = document.getElementById('bulk-booster-selection-summary');
    if (summary) summary.textContent = `${formatDisplayNumber(itemTypes)} types · ${formatDisplayNumber(totalUnits)} units selected`;

    const actionButton = document.getElementById('btn-bulk-booster-preview');
    if (actionButton) actionButton.disabled = totalUnits === 0;
};

const applyMode = (mode, previousMode = currentMode) => {
    currentMode = mode;
    document.querySelectorAll('.bulk-booster-mode').forEach(button => {
        const active = button.dataset.mode === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.bulk-booster-qty').forEach(input => {
        const owned = Number(input.max);
        if (mode === 'allOwned') input.value = owned;
        else if (mode === 'oneEach') input.value = Math.min(1, owned);
        else if (previousMode === 'custom') input.value = Math.min(owned, Math.max(0, Number(input.value) || 0));
        input.disabled = mode !== 'custom';
    });
    updateSelectionSummary();
};

const updatePrimaryAction = () => {
    const button = document.getElementById('btn-bulk-booster-preview');
    if (!button) return;
    button.innerHTML = shouldSkipBulkPreview(PREVIEW_KEY)
        ? '<iconify-icon icon="lucide:zap" aria-hidden="true"></iconify-icon> Activate Selected Boosters'
        : '<iconify-icon icon="lucide:calculator" aria-hidden="true"></iconify-icon> Preview Activation';
};

const renderConfig = entries => {
    const body = document.getElementById('bulk-booster-modal-body');
    if (!body) return;
    const state = getState();
    const now = Date.now();

    body.innerHTML = `
        <div class="bulk-presets-bar" role="group" aria-label="Booster activation quantity preset">
            <span class="bulk-presets-label">Quantity preset:</span>
            <button type="button" class="preset-chip bulk-booster-mode active" data-mode="allOwned" aria-pressed="true">All Owned</button>
            <button type="button" class="preset-chip bulk-booster-mode" data-mode="oneEach" aria-pressed="false">One Each</button>
            <button type="button" class="preset-chip bulk-booster-mode" data-mode="custom" aria-pressed="false">Custom</button>
            <span id="bulk-booster-selection-summary" class="bulk-selection-summary" aria-live="polite"></span>
        </div>
        <p class="bulk-helper-text">Duplicate action tiers extend their current duration. Multipliers increase only when another tier becomes active.</p>
        <div class="bulk-table-wrapper bulk-booster-table-wrapper">
            <table class="bulk-table bulk-booster-table">
                <thead>
                    <tr>
                        <th>Booster</th>
                        <th>Action / Tier</th>
                        <th>Owned</th>
                        <th>Activate</th>
                        <th>Current</th>
                        <th>Duration Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(entry => {
                        const expiry = Number(state?.boosters?.activeUntil?.[entry.action]?.[entry.tier] || 0);
                        const activeText = expiry > now ? formatDuration(expiry - now) : 'Inactive';
                        return `
                            <tr class="bulk-item-row">
                                <td><b>${escapeHtml(displayItemName(entry.itemName))}</b></td>
                                <td><span class="charter-badge badge-purple">${escapeHtml(entry.action.toUpperCase())} ${escapeHtml(entry.tier)}</span></td>
                                <td title="${formatNumberCommas(entry.quantity)} owned">${formatDisplayNumber(entry.quantity)}</td>
                                <td>
                                    <input type="number" class="qty-input bulk-booster-qty" data-item="${escapeHtml(entry.itemName)}" data-duration-ms="${entry.durationMs}" aria-label="Quantity of ${escapeHtml(displayItemName(entry.itemName))} to activate" inputmode="numeric" min="0" max="${entry.quantity}" value="${entry.quantity}" disabled>
                                </td>
                                <td>${activeText}</td>
                                <td class="bulk-booster-duration-add">+${formatDuration(entry.durationMs * entry.quantity)}</td>
                            </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;

    body.querySelectorAll?.('.bulk-booster-mode').forEach(button => {
        button.addEventListener('click', () => applyMode(button.dataset.mode, currentMode));
    });
    body.querySelectorAll?.('.bulk-booster-qty').forEach(input => {
        input.addEventListener('input', updateSelectionSummary);
        input.addEventListener('change', () => {
            const owned = Number(input.max);
            const parsed = Number(input.value);
            input.value = Number.isFinite(parsed) ? Math.min(owned, Math.max(0, Math.floor(parsed))) : 0;
            updateSelectionSummary();
        });
    });

    currentMode = 'allOwned';
    applyMode('allOwned');
    updatePrimaryAction();
};

const collectOptions = () => {
    if (currentMode !== 'custom') return { mode: currentMode };
    const quantities = {};
    for (const input of document.querySelectorAll('.bulk-booster-qty')) {
        const quantity = getSelectedQuantity(input);
        if (quantity === null) {
            showToast(`Enter a whole quantity from 0 to ${input.max}`, 'error');
            input.focus?.();
            return null;
        }
        quantities[input.dataset.item] = quantity;
    }
    if (!Object.values(quantities).some(quantity => quantity > 0)) {
        showToast('Select at least one booster to activate', 'error');
        return null;
    }
    return { mode: 'custom', quantities };
};

const closeConfig = ({ restoreFocus = true } = {}) => {
    closeDialog('bulk-booster-modal', { reason: 'cancel', restoreFocus });
    lastOptions = null;
    lastPreview = null;
};

const closePreview = ({ restoreFocus = true } = {}) => {
    closeDialog('bulk-booster-preview-modal', { reason: 'cancel', restoreFocus });
    lastOptions = null;
    lastPreview = null;
};

const finishExecution = result => {
    const actionText = result.actionSummaries
        .map(summary => `${summary.actionType.toUpperCase()} ${summary.multiplier}×`)
        .join(' · ');
    showToast(`Activated ${formatDisplayNumber(result.totalUnits)} booster units across ${formatDisplayNumber(result.itemsAffectedCount)} types!`, 'success');
    addLogEntry(`Activated ${formatDisplayNumber(result.totalUnits)} booster units across ${formatDisplayNumber(result.itemsAffectedCount)} types. ${actionText}`, 'rare');
    if (typeof completionCallback === 'function') completionCallback(result);
};

const executeSelection = async (options, triggerButton, { fromPreview = false } = {}) => {
    const res = await doExecuteBulkBoosters(options, triggerButton);
    if (!res?.result) return;
    if (fromPreview) closePreview({ restoreFocus: false });
    else closeConfig({ restoreFocus: false });
    finishExecution(res.result);
};

const renderPreview = preview => {
    const body = document.getElementById('bulk-booster-preview-body');
    const modal = document.getElementById('bulk-booster-preview-modal');
    if (!body || !modal) return;

    body.innerHTML = `
        <div class="bulk-preview-summary-grid">
            <div class="preview-stat-card"><div class="stat-title">Booster Types</div><div class="stat-num">${formatDisplayNumber(preview.itemsAffectedCount)}</div></div>
            <div class="preview-stat-card"><div class="stat-title">Total Units</div><div class="stat-num">${formatDisplayNumber(preview.totalUnits)}</div></div>
            <div class="preview-stat-card"><div class="stat-title">Affected Tiers</div><div class="stat-num">${formatDisplayNumber(preview.tierSummaries.length)}</div></div>
        </div>
        <div class="booster-action-summary" aria-label="Resulting action multipliers">
            ${preview.actionSummaries.map(summary => `
                <div class="booster-action-summary-item">
                    <span>${escapeHtml(summary.actionType.toUpperCase())}</span>
                    <strong>${formatDisplayNumber(summary.multiplier)}×</strong>
                    <small>${escapeHtml(summary.activeTiers.join(', '))}</small>
                </div>`).join('')}
        </div>
        <h4 class="bulk-breakdown-title">Inventory Consumption</h4>
        <div class="bulk-table-wrapper bulk-preview-table">
            <table class="bulk-table">
                <thead><tr><th>Booster</th><th>Quantity</th><th>Target</th><th>Duration Added</th><th>Remaining</th></tr></thead>
                <tbody>
                    ${preview.breakdown.map(item => `
                        <tr>
                            <td><b>${escapeHtml(displayItemName(item.itemName))}</b></td>
                            <td>${formatDisplayNumber(item.quantity)}</td>
                            <td>${escapeHtml(item.actionType.toUpperCase())} ${escapeHtml(item.tier)}</td>
                            <td>+${formatDuration(item.durationAddedMs)}</td>
                            <td>${formatDisplayNumber(item.remainingQuantity)}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>
        <h4 class="bulk-breakdown-title">Projected Tier Expiries</h4>
        <div class="bulk-table-wrapper bulk-preview-table booster-tier-preview-table">
            <table class="bulk-table">
                <thead><tr><th>Action / Tier</th><th>Before</th><th>Added</th><th>After</th></tr></thead>
                <tbody>
                    ${preview.tierSummaries.map(summary => `
                        <tr>
                            <td><b>${escapeHtml(summary.actionType.toUpperCase())} ${escapeHtml(summary.tier)}</b></td>
                            <td>${summary.wasActive ? formatExpiry(summary.previousExpiry) : 'Inactive'}</td>
                            <td>+${formatDuration(summary.durationAddedMs)}</td>
                            <td>${formatExpiry(summary.newExpiry)}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;

    const ignore = document.getElementById('bulk-booster-preview-dont-show-again');
    if (ignore) ignore.checked = false;
    replaceDialog('bulk-booster-modal', modal, {
        initialFocus: '#btn-bulk-booster-confirm',
        closeOnBackdrop: false,
        onClose: reason => {
            if (reason !== 'confirm') {
                lastOptions = null;
                lastPreview = null;
            }
        }
    });
};

const handlePrimaryAction = async triggerButton => {
    const options = collectOptions();
    if (!options) return;
    lastOptions = options;

    try {
        if (shouldSkipBulkPreview(PREVIEW_KEY)) {
            await executeSelection(options, triggerButton);
            return;
        }
        const res = await doPreviewBulkBoosters(options, triggerButton);
        if (res?.result) {
            lastPreview = res.result;
            renderPreview(res.result);
        }
    } catch (error) {
        showToast(error.message || 'Booster activation preview failed', 'error');
    }
};

const setupDialogActions = () => {
    const closeConfigButton = document.getElementById('btn-close-bulk-booster-modal');
    const cancelConfigButton = document.getElementById('btn-bulk-booster-cancel');
    const primaryButton = document.getElementById('btn-bulk-booster-preview');
    const closePreviewButton = document.getElementById('btn-close-bulk-booster-preview');
    const backPreviewButton = document.getElementById('btn-bulk-booster-preview-back');
    const confirmButton = document.getElementById('btn-bulk-booster-confirm');

    if (closeConfigButton) closeConfigButton.onclick = () => closeConfig();
    if (cancelConfigButton) cancelConfigButton.onclick = () => closeConfig();
    if (primaryButton) primaryButton.onclick = event => handlePrimaryAction(event.currentTarget);
    if (closePreviewButton) closePreviewButton.onclick = () => closePreview();
    if (backPreviewButton) backPreviewButton.onclick = () => closePreview();
    if (confirmButton) confirmButton.onclick = async event => {
        if (!lastOptions || !lastPreview) return;
        if (document.getElementById('bulk-booster-preview-dont-show-again')?.checked) {
            setConfirmationIgnored(PREVIEW_KEY, true);
        }
        try {
            await executeSelection(lastOptions, event.currentTarget, { fromPreview: true });
        } catch (error) {
            showToast(error.message || 'Bulk booster activation failed', 'error');
        }
    };
};

export const openBulkBoosterDialog = ({ returnFocus, onComplete } = {}) => {
    const entries = getOwnedBoosterEntries();
    if (entries.length === 0) {
        showToast('No usable boosters are available in inventory', 'info');
        return false;
    }

    completionCallback = onComplete || null;
    lastOptions = null;
    lastPreview = null;
    renderConfig(entries);
    setupDialogActions();
    openDialog('bulk-booster-modal', {
        initialFocus: '.bulk-booster-mode[data-mode="allOwned"]',
        closeOnBackdrop: false,
        returnFocus,
        onClose: reason => {
            if (reason !== 'replaced') {
                lastOptions = null;
                lastPreview = null;
            }
        }
    });
    return true;
};
