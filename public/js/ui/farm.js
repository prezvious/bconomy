// Farm panel, plot management, planting, upgrade, and uproot dialogs.
import { getState, saveState } from '../state.js';
import { formatDisplayNumber } from '../utils.js';
import {
    doPlant,
    doPlantAll,
    doUproot,
    doUprootSameCrop,
    doPreviewPlotUpgrade,
    doUpgradePlot,
    doPreviewBulkPlotUpgrade,
    doBulkUpgradePlots
} from '../api.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { showConfirmation, openDialog, closeDialog, replaceDialog } from './modal.js';
import { formatPlotIdRanges, parsePlotSelection } from './farmSelection.js';

const MAX_PLOT_LEVEL = 16;
const CROP_DATA = {
    Blueberry: { growTimeMs: 20000, baseYield: 3, description: 'Berry Burst: 2% chance to double yield per harvest.' },
    'Golden Wheat': { growTimeMs: 70000, baseYield: 5, description: 'Golden Pay: Claiming grants +$10,000 cash per wheat item.' },
    Melon: { growTimeMs: 900000, baseYield: 5, description: 'Hydration: Consuming 1 Melon resets global water cooldown.' },
    Coffee: { growTimeMs: 300000, baseYield: 2, description: 'Caffeine: Claiming Coffee reduces all action cooldowns.' },
    Pumpkin: {
        growTimeMs: 1800000,
        baseYield: 1,
        description: 'A broad orange field pumpkin with dense, earthy flesh—a dependable harvest valued for its steady, straightforward yield.'
    }
};

let manageActiveTab = 'plant';
let bulkTargetMode = 'all';
let bulkUpgradeMode = 'next';
let specificPlotExpression = '';
let lastBulkOptions = null;
let lastBulkPreview = null;

const getExistingPlotIds = () => (getState()?.farm?.plots || [])
    .map(plot => plot.id)
    .filter(id => Number.isSafeInteger(id) && id > 0)
    .sort((a, b) => a - b);

const getMarkedPlotIds = () => {
    const available = new Set(getExistingPlotIds());
    return [...new Set((getState()?.farm?.markedPlotIds || [])
        .filter(id => Number.isSafeInteger(id) && available.has(id)))]
        .sort((a, b) => a - b);
};

const setMarkedPlotIds = (plotIds, returnFocusPlotId = null) => {
    const state = getState();
    if (!state?.farm) return;
    const available = new Set(getExistingPlotIds());
    state.farm.markedPlotIds = [...new Set((plotIds || [])
        .filter(id => Number.isSafeInteger(id) && available.has(id)))]
        .sort((a, b) => a - b);
    saveState(state);
    renderFarm();
    if (document.getElementById('farm-manage-modal')?.open) renderManageModal();
    if (returnFocusPlotId !== null) {
        requestAnimationFrame(() => document.querySelector(`[data-plot-mark="${returnFocusPlotId}"]`)?.focus());
    }
};

const getPlot = plotId => {
    const farm = getState()?.farm;
    return farm?.plots?.find(plot => plot.id === Number(plotId)) || null;
};

const getEffectiveDuration = plot => {
    const crop = CROP_DATA[plot?.crop];
    const level = Math.min(MAX_PLOT_LEVEL, Math.max(0, Math.floor(Number(plot?.level) || 0)));
    return crop ? Math.max(1, Math.round(crop.growTimeMs * (1 - (level * 0.05)))) : 0;
};

const formatSeconds = milliseconds => {
    const seconds = milliseconds / 1000;
    if (seconds < 60) {
        const rounded = Math.round(seconds * 10) / 10;
        return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} second${rounded === 1 ? '' : 's'}`;
    }
    if (seconds < 3600) {
        const minutes = Math.round((seconds / 60) * 10) / 10;
        return `${Number.isInteger(minutes) ? minutes.toFixed(0) : minutes.toFixed(1)} minute${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.round((seconds / 3600) * 10) / 10;
    return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)} hour${hours === 1 ? '' : 's'}`;
};

const formatTimer = milliseconds => {
    if (milliseconds <= 0) return 'Ready!';
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds > 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
};

const getProgress = (plot, now) => {
    const duration = getEffectiveDuration(plot);
    if (!duration) return 0;
    return Math.min(100, Math.max(0, ((now - plot.plantedAt) / duration) * 100));
};

const levelLabel = plot => Number(plot.level) > 0
    ? `<span class="plot-level">Level ${plot.level}</span>`
    : '';

const renderPlotCard = (plot, now, markedPlotIds) => {
    const level = Math.min(MAX_PLOT_LEVEL, Math.max(0, Math.floor(Number(plot.level) || 0)));
    const marked = markedPlotIds.has(plot.id);
    const markButton = `
        <button class="plot-mark-toggle" type="button" data-plot-mark="${plot.id}" aria-pressed="${marked}"
            aria-label="${marked ? 'Unmark' : 'Mark'} Plot ${plot.id}" title="${marked ? 'Unmark' : 'Mark'} Plot #${plot.id}">
            <iconify-icon icon="${marked ? 'lucide:bookmark-check' : 'lucide:bookmark'}" aria-hidden="true"></iconify-icon>
            <span>${marked ? 'Marked' : 'Mark'}</span>
        </button>`;
    if (!plot.crop) {
        return `
            <article class="plot-card empty-plot ${marked ? 'is-marked' : ''}" data-plot-id="${plot.id}">
                <button class="plot-card-main" data-plot-manage="${plot.id}" type="button"
                    aria-label="Manage empty Plot ${plot.id}${level ? `, Level ${level}` : ''}">
                    <span class="plot-header">
                        <span class="plot-id">Plot #${plot.id} ${levelLabel(plot)}</span>
                        <span class="plot-status empty">Empty</span>
                    </span>
                    <span class="plot-card-hint"><iconify-icon icon="lucide:mouse-pointer-click" aria-hidden="true"></iconify-icon> Manage Plot</span>
                </button>
                ${markButton}
            </article>`;
    }

    const remain = Math.max(0, plot.nextHarvestAt - now);
    const progress = getProgress(plot, now);
    return `
        <article class="plot-card active-plot ${marked ? 'is-marked' : ''}" data-plot-id="${plot.id}">
            <button class="plot-card-main" data-plot-manage="${plot.id}" type="button"
                aria-label="Manage Plot ${plot.id}, ${plot.crop}${level ? `, Level ${level}` : ''}">
                <span class="plot-header">
                    <span class="plot-id">Plot #${plot.id} ${levelLabel(plot)}</span>
                    <span class="plot-crop-name">${plot.crop}</span>
                </span>
                <span class="growth-progress-bar" aria-hidden="true">
                    <span id="progress-fill-plot-${plot.id}" class="growth-progress-fill" style="width: ${progress}%"></span>
                </span>
                <span class="plot-timer-row">
                    <span class="timer-label">Next harvest</span>
                    <span id="timer-value-plot-${plot.id}" class="timer-value" role="status">${formatTimer(remain)}</span>
                </span>
            </button>
            ${markButton}
        </article>`;
};

const renderPlotDialog = plotId => {
    const plot = getPlot(plotId);
    const dialog = document.getElementById('plot-management-modal');
    const title = document.getElementById('plot-management-title');
    const body = document.getElementById('plot-management-body');
    const actions = document.getElementById('plot-management-actions');
    if (!plot || !dialog || !title || !body || !actions) return null;

    dialog.dataset.plotId = String(plot.id);
    const level = Number(plot.level) || 0;
    title.textContent = `Plot #${plot.id}${level > 0 ? ` · Level ${level}` : ''}`;
    if (plot.crop) {
        const crop = CROP_DATA[plot.crop];
        const duration = getEffectiveDuration(plot);
        const progress = getProgress(plot, Date.now());
        body.innerHTML = `
            <div class="plot-dialog-status">
                <div>
                    <span class="plot-dialog-crop">${plot.crop}</span>
                    <span class="plot-dialog-level">${level > 0 ? `-${level * 5}% grow time` : 'Baseline plot · 0% reduction'}</span>
                </div>
                <strong>${crop.baseYield}× ${plot.crop} every ${formatSeconds(duration)}</strong>
            </div>
            <div class="growth-progress-bar" aria-hidden="true">
                <div class="growth-progress-fill" style="width: ${progress}%"></div>
            </div>
            <p class="plot-dialog-note">Harvesting is handled globally through Crop Storage & Logistics.</p>`;
        actions.innerHTML = `
            <button class="action-btn uproot-btn" type="button" data-plot-action="uproot">
                <iconify-icon icon="lucide:scissors" aria-hidden="true"></iconify-icon> Uproot
            </button>
            <button class="action-btn uproot-all-btn" type="button" data-plot-action="uproot-same">
                <iconify-icon icon="lucide:shovel" aria-hidden="true"></iconify-icon> Uproot Same Crop
            </button>
            <button class="action-btn upgrade-plot-btn" type="button" data-plot-action="upgrade" ${level >= MAX_PLOT_LEVEL ? 'disabled' : ''}>
                <iconify-icon icon="lucide:arrow-up-circle" aria-hidden="true"></iconify-icon>
                ${level >= MAX_PLOT_LEVEL ? 'Maximum level reached' : 'Upgrade Plot'}
            </button>`;
    } else {
        body.innerHTML = `
            <div class="plot-dialog-status empty">
                <div>
                    <span class="plot-dialog-crop">Empty</span>
                    <span class="plot-dialog-level">${level > 0 ? `Level ${level} · -${level * 5}% grow time` : 'Baseline plot · 0% reduction'}</span>
                </div>
                <p>Choose a crop to begin growing, or improve this plot first.</p>
            </div>`;
        actions.innerHTML = `
            <button class="action-btn plant-crops-btn" type="button" data-plot-action="plant">
                <iconify-icon icon="lucide:sprout" aria-hidden="true"></iconify-icon> Plant Crops
            </button>
            <button class="action-btn upgrade-plot-btn" type="button" data-plot-action="upgrade" ${level >= MAX_PLOT_LEVEL ? 'disabled' : ''}>
                <iconify-icon icon="lucide:arrow-up-circle" aria-hidden="true"></iconify-icon>
                ${level >= MAX_PLOT_LEVEL ? 'Maximum level reached' : 'Upgrade Plot'}
            </button>`;
    }
    return dialog;
};

const openPlotDialog = (plotId, returnFocus) => {
    const dialog = renderPlotDialog(plotId);
    if (!dialog) return;
    openDialog(dialog, {
        initialFocus: '[data-plot-action]',
        closeOnBackdrop: false,
        returnFocus
    });
};

const renderPlantDialog = plotId => {
    const plot = getPlot(plotId);
    const dialog = document.getElementById('plant-crop-modal');
    const body = document.getElementById('plant-crop-body');
    if (!plot || !dialog || !body) return null;
    dialog.dataset.plotId = String(plot.id);
    document.getElementById('plant-crop-title').textContent = `Plant Plot #${plot.id}`;
    body.innerHTML = Object.entries(CROP_DATA).map(([name, crop], index) => {
        const duration = Math.max(1, Math.round(crop.growTimeMs * (1 - ((Number(plot.level) || 0) * 0.05))));
        return `
            <label class="crop-choice-card">
                <input type="radio" name="plot-crop-choice" value="${name}" ${index === 0 ? 'checked' : ''}>
                <span class="crop-choice-copy">
                    <strong>${name}</strong>
                    <span>${crop.baseYield}× every ${formatSeconds(duration)}</span>
                    <small>${crop.description}</small>
                </span>
            </label>`;
    }).join('');
    return dialog;
};

const openPlantDialog = plotId => {
    const from = document.getElementById('plot-management-modal');
    const dialog = renderPlantDialog(plotId);
    if (dialog) replaceDialog(from, dialog, { initialFocus: 'input[name="plot-crop-choice"]', closeOnBackdrop: false });
};

const renderUpgradePreview = (plotId, mode, result) => {
    const dialog = document.getElementById('plot-upgrade-modal');
    const title = document.getElementById('plot-upgrade-title');
    const body = document.getElementById('plot-upgrade-body');
    const execute = document.getElementById('btn-execute-plot-upgrade');
    if (!dialog || !title || !body || !execute) return;

    dialog.dataset.plotId = String(plotId);
    dialog.dataset.mode = mode;
    const preview = result.preview;
    title.textContent = `Upgrade Plot #${plotId}`;
    dialog.querySelectorAll('[data-upgrade-mode]').forEach(button => {
        button.classList.toggle('active', button.dataset.upgradeMode === mode);
        button.setAttribute('aria-pressed', String(button.dataset.upgradeMode === mode));
    });

    if (preview.maximumLevelReached) {
        body.innerHTML = '<div class="upgrade-max-state"><iconify-icon icon="lucide:badge-check" aria-hidden="true"></iconify-icon><strong>Maximum level reached</strong><span>This plot already has the full 80% grow-time reduction.</span></div>';
        execute.disabled = true;
        execute.textContent = 'Maximum level reached';
        return;
    }

    const requirementRows = Object.entries(preview.requirements).map(([item, required]) => {
        const owned = Number(preview.inventory?.[item] || 0);
        const enough = owned >= required;
        return `
            <li class="upgrade-material ${enough ? 'enough' : 'short'}">
                <span><iconify-icon icon="lucide:package" aria-hidden="true"></iconify-icon> ${item}</span>
                <strong>${formatDisplayNumber(owned)} / ${formatDisplayNumber(required)}</strong>
            </li>`;
    }).join('');

    const targetText = mode === 'max'
        ? `Levels ${preview.currentLevel + 1}–16 total requirements`
        : `Level ${preview.currentLevel} → ${preview.targetLevel}`;
    const affordableText = mode === 'max'
        ? `<p class="upgrade-affordable-level">Inventory allows: <strong>Level ${preview.maxAffordableLevel}</strong></p>`
        : '';
    body.innerHTML = `
        <div class="upgrade-summary">
            <strong>${targetText}</strong>
            <span>No money required · materials only</span>
        </div>
        ${affordableText}
        <ul class="upgrade-material-list">${requirementRows}</ul>`;
    execute.disabled = !preview.canUpgrade;
    execute.innerHTML = mode === 'max'
        ? '<iconify-icon icon="lucide:chevrons-up" aria-hidden="true"></iconify-icon> Upgrade as Far as Possible'
        : `<iconify-icon icon="lucide:arrow-up" aria-hidden="true"></iconify-icon> Upgrade to Level ${preview.targetLevel}`;
};

const loadUpgradeDialog = async (plotId, mode = 'next', replaceFrom = null) => {
    const dialog = document.getElementById('plot-upgrade-modal');
    const body = document.getElementById('plot-upgrade-body');
    if (!dialog || !body) return;
    dialog.dataset.plotId = String(plotId);
    dialog.dataset.mode = mode;
    body.innerHTML = '<p class="modal-loading">Calculating material requirements…</p>';
    if (replaceFrom) replaceDialog(replaceFrom, dialog, { closeOnBackdrop: false });
    try {
        const response = await doPreviewPlotUpgrade(plotId, mode);
        renderUpgradePreview(plotId, mode, response.result);
        renderFarm();
    } catch (error) {
        body.innerHTML = `<p class="upgrade-error">${error.message || 'Unable to load upgrade requirements.'}</p>`;
    }
};

const setupPlotDialogs = () => {
    const plotDialog = document.getElementById('plot-management-modal');
    const plantDialog = document.getElementById('plant-crop-modal');
    const upgradeDialog = document.getElementById('plot-upgrade-modal');
    if (!plotDialog || plotDialog.dataset.farmConfigured === 'true') return;
    plotDialog.dataset.farmConfigured = 'true';

    plotDialog.addEventListener('click', async event => {
        const button = event.target.closest('[data-plot-action]');
        if (!button) return;
        const plotId = Number(plotDialog.dataset.plotId);
        const plot = getPlot(plotId);
        if (!plot) return;

        if (button.dataset.plotAction === 'plant') {
            openPlantDialog(plotId);
            return;
        }
        if (button.dataset.plotAction === 'upgrade') {
            await loadUpgradeDialog(plotId, 'next', plotDialog);
            return;
        }

        const isBulk = button.dataset.plotAction === 'uproot-same';
        const confirmed = await showConfirmation(
            isBulk ? 'uprootSameCrop' : 'uprootPlot',
            isBulk ? `Uproot every ${plot.crop}?` : `Uproot ${plot.crop}?`,
            isBulk
                ? `This discards ${plot.crop} from every plot, including crops ready to harvest. Stored crops are not affected.`
                : `This discards the planted ${plot.crop} on Plot #${plotId} without a refund.`,
            {
                ignoreLabel: 'I know what I’m uprooting—skip this warning next time.',
                returnFocus: button
            }
        );
        if (!confirmed) {
            openPlotDialog(plotId);
            return;
        }

        try {
            if (isBulk) {
                const response = await doUprootSameCrop(plot.crop, button);
                showToast(`Uprooted ${response.result.uprootedCount} ${plot.crop} plot(s).`, 'info');
            } else {
                await doUproot(plotId, button);
                showToast(`Uprooted ${plot.crop} from Plot #${plotId}.`, 'info');
            }
            renderFarm();
            openPlotDialog(plotId);
        } catch (error) {
            openPlotDialog(plotId);
        }
    });

    plantDialog?.addEventListener('click', async event => {
        const plotId = Number(plantDialog.dataset.plotId);
        if (event.target.closest('[data-plant-back]')) {
            const target = renderPlotDialog(plotId);
            if (target) replaceDialog(plantDialog, target, { initialFocus: '[data-plot-action]', closeOnBackdrop: false });
            return;
        }
        const plantButton = event.target.closest('[data-plant-submit]');
        if (!plantButton) return;
        const selected = plantDialog.querySelector('input[name="plot-crop-choice"]:checked');
        if (!selected) return;
        try {
            await doPlant(plotId, selected.value, plantButton);
            showToast(`Planted ${selected.value} on Plot #${plotId}!`, 'success');
            renderFarm();
            const target = renderPlotDialog(plotId);
            if (target) replaceDialog(plantDialog, target, { initialFocus: '[data-plot-action]', closeOnBackdrop: false });
        } catch (error) {
            // apiCall already provides the detailed error toast.
        }
    });

    upgradeDialog?.addEventListener('click', async event => {
        const plotId = Number(upgradeDialog.dataset.plotId);
        const modeButton = event.target.closest('[data-upgrade-mode]');
        if (modeButton) {
            await loadUpgradeDialog(plotId, modeButton.dataset.upgradeMode);
            return;
        }
        if (event.target.closest('[data-upgrade-back]')) {
            const target = renderPlotDialog(plotId);
            if (target) replaceDialog(upgradeDialog, target, { initialFocus: '[data-plot-action]', closeOnBackdrop: false });
            return;
        }
        const execute = event.target.closest('#btn-execute-plot-upgrade');
        if (!execute) return;
        try {
            const response = await doUpgradePlot(plotId, upgradeDialog.dataset.mode || 'next', execute);
            const result = response.result;
            let message = `Plot #${plotId} reached Level ${result.level}.`;
            if (result.catchUpCycles > 0) message += ` ${result.catchUpCycles} catch-up harvest cycle(s) stored.`;
            showToast(message, 'success');
            renderFarm();
            const target = renderPlotDialog(plotId);
            if (target) replaceDialog(upgradeDialog, target, { initialFocus: '[data-plot-action]', closeOnBackdrop: false });
        } catch (error) {
            await loadUpgradeDialog(plotId, upgradeDialog.dataset.mode || 'next');
        }
    });
};

const renderPlotSelectionToolbar = () => {
    const existing = getExistingPlotIds();
    const marked = getMarkedPlotIds();
    const count = document.getElementById('marked-plots-count');
    const markAll = document.getElementById('btn-mark-all-plots');
    const invert = document.getElementById('btn-invert-plot-marks');
    const clear = document.getElementById('btn-clear-plot-marks');
    if (count) {
        count.textContent = `${marked.length} Marked`;
        count.title = marked.length ? `Marked Plots: ${formatPlotIdRanges(marked)}` : 'No plots marked';
    }
    if (markAll) markAll.disabled = existing.length === 0 || marked.length === existing.length;
    if (invert) invert.disabled = existing.length === 0;
    if (clear) clear.disabled = marked.length === 0;

    const toolbar = document.querySelector('.plot-selection-toolbar');
    if (!toolbar || toolbar.dataset.configured === 'true') return;
    toolbar.dataset.configured = 'true';
    markAll?.addEventListener('click', () => setMarkedPlotIds(getExistingPlotIds()));
    invert?.addEventListener('click', () => {
        const current = new Set(getMarkedPlotIds());
        setMarkedPlotIds(getExistingPlotIds().filter(plotId => !current.has(plotId)));
    });
    clear?.addEventListener('click', () => setMarkedPlotIds([]));
};

export const renderFarm = () => {
    const playerState = getState();
    if (!playerState?.farm) return;
    const farm = playerState.farm;
    const now = Date.now();
    const ledgerMain = document.querySelector('.ledger-main');
    const scrollPos = ledgerMain ? ledgerMain.scrollTop : 0;

    const waterDisplay = document.getElementById('water-timer-display');
    const btnGlobalWater = document.getElementById('btn-global-water');
    const btnMelon = document.getElementById('btn-use-melon');
    if (waterDisplay) {
        if (farm.waterAvailableAt > now) {
            waterDisplay.textContent = `Status: ${formatTimer(farm.waterAvailableAt - now)}`;
            waterDisplay.className = 'water-timer-display cooldown';
        } else {
            waterDisplay.textContent = 'Status: Ready to Water';
            waterDisplay.className = 'water-timer-display ready';
        }
    }
    if (btnGlobalWater) btnGlobalWater.disabled = farm.waterAvailableAt > now;
    if (btnMelon) {
        const melonCount = (playerState.inventory?.Melon || 0) + (farm.storage?.Melon || 0);
        btnMelon.disabled = farm.waterAvailableAt <= now || melonCount < 1;
        btnMelon.innerHTML = `<iconify-icon icon="lucide:sparkles" aria-hidden="true"></iconify-icon> Use Melon (${melonCount} left)`;
    }

    const crops = Object.keys(CROP_DATA);
    const storageGrid = document.getElementById('farm-storage-grid');
    if (storageGrid) {
        const visible = crops.filter(crop => (farm.storage?.[crop] || 0) > 0 || farm.plots?.some(plot => plot.crop === crop));
        storageGrid.innerHTML = visible.length
            ? visible.map(crop => {
                const count = farm.storage?.[crop] || 0;
                return `<div class="storage-item-card"><span class="storage-item-name">${crop}</span><span class="storage-item-count ${count > 0 ? 'has-count' : ''}">${formatDisplayNumber(count)}</span></div>`;
            }).join('')
            : '<div class="empty-storage-msg">No crops currently growing or stored in Farm Storage.</div>';
    }

    const claimSelect = document.getElementById('claim-crop-select');
    if (claimSelect) {
        const currentSelected = claimSelect.value;
        const available = crops.filter(crop => (farm.storage?.[crop] || 0) > 0);
        claimSelect.innerHTML = '<option value="all">Claim All Crops</option>'
            + available.map(crop => `<option value="${crop}">${crop}</option>`).join('');
        claimSelect.value = available.includes(currentSelected) ? currentSelected : 'all';
    }

    const plotsGrid = document.getElementById('farm-plots-grid');
    if (plotsGrid) {
        const markedPlotIds = new Set(getMarkedPlotIds());
        plotsGrid.innerHTML = farm.plots.map(plot => renderPlotCard(plot, now, markedPlotIds)).join('');
        if (plotsGrid.dataset.delegated !== 'true') {
            const activateCard = event => {
                const markButton = event.target.closest('[data-plot-mark]');
                if (markButton) {
                    const plotId = Number(markButton.dataset.plotMark);
                    const marked = new Set(getMarkedPlotIds());
                    if (marked.has(plotId)) marked.delete(plotId);
                    else marked.add(plotId);
                    setMarkedPlotIds([...marked], plotId);
                    return;
                }
                const manageButton = event.target.closest('[data-plot-manage]');
                if (!manageButton) return;
                openPlotDialog(Number(manageButton.dataset.plotManage), manageButton);
            };
            plotsGrid.addEventListener('click', activateCard);
            plotsGrid.dataset.delegated = 'true';
        }
    }

    renderPlotSelectionToolbar();

    setupPlotDialogs();
    const openPlotModal = document.getElementById('plot-management-modal');
    if (openPlotModal?.open && openPlotModal.dataset.plotId) renderPlotDialog(Number(openPlotModal.dataset.plotId));
    if (ledgerMain) ledgerMain.scrollTop = scrollPos;
};

const renderSeedsList = () => {
    const seedsList = document.getElementById('seeds-list');
    if (!seedsList) return;
    const emptyCount = getState()?.farm?.plots?.filter(plot => !plot.crop).length || 0;
    seedsList.innerHTML = Object.entries(CROP_DATA).map(([name, crop]) => `
        <div class="seed-card card">
            <div class="seed-info">
                <div class="seed-title-row"><span class="seed-name">${name}</span><span class="seed-badge-free">FREE ($0)</span></div>
                <div class="seed-meta">Grow Time: ${formatSeconds(crop.growTimeMs)} • Base Yield: ${crop.baseYield}</div>
                <div class="seed-details">${crop.description}</div>
            </div>
            <div class="seed-actions">
                <button class="action-btn primary-btn btn-sm btn-plant-all-seed" data-crop="${name}" ${emptyCount === 0 ? 'disabled' : ''}>
                    <iconify-icon icon="lucide:sprout" aria-hidden="true"></iconify-icon> Plant All (${emptyCount} empty)
                </button>
            </div>
        </div>`).join('');

    seedsList.querySelectorAll('.btn-plant-all-seed').forEach(button => {
        button.addEventListener('click', async event => {
            const cropName = event.currentTarget.dataset.crop;
            try {
                const response = await doPlantAll(cropName, event.currentTarget);
                showToast(`Planted ${cropName} on ${response.result?.plantedCount || 0} plot(s) for free!`, 'success');
                renderFarm();
                renderManageModal();
            } catch (error) {
                // apiCall already provides the detailed error toast.
            }
        });
    });
};

const setManageTab = tab => {
    manageActiveTab = tab === 'upgrade' ? 'upgrade' : 'plant';
    document.querySelectorAll('[data-farm-manage-tab]').forEach(button => {
        const active = button.dataset.farmManageTab === manageActiveTab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
    });
    document.getElementById('farm-manage-plant-panel')?.classList.toggle('hidden', manageActiveTab !== 'plant');
    document.getElementById('farm-manage-upgrade-panel')?.classList.toggle('hidden', manageActiveTab !== 'upgrade');
    document.getElementById('btn-preview-bulk-plot-upgrade')?.classList.toggle('hidden', manageActiveTab !== 'upgrade');
};

const validateSpecificPlotSelection = ({ focus = false } = {}) => {
    const input = document.getElementById('farm-specific-plots-input');
    const error = document.getElementById('farm-specific-plots-error');
    if (!input) return { valid: false, error: 'Specific plot input is unavailable.' };
    specificPlotExpression = input.value;
    const parsed = parsePlotSelection(specificPlotExpression, getExistingPlotIds());
    if (error) error.textContent = parsed.valid ? '' : parsed.error;
    input.setAttribute('aria-invalid', String(!parsed.valid));
    if (!parsed.valid && focus) input.focus();
    return parsed;
};

const renderBulkConfiguration = () => {
    const available = getExistingPlotIds();
    const marked = getMarkedPlotIds();
    const specificField = document.getElementById('farm-specific-plots-field');
    const markedSummary = document.getElementById('farm-marked-plots-summary');
    const availableText = document.getElementById('farm-available-plots');
    const targetSummary = document.getElementById('farm-bulk-target-summary');
    const input = document.getElementById('farm-specific-plots-input');

    document.querySelectorAll('[data-bulk-target]').forEach(button => {
        const active = button.dataset.bulkTarget === bulkTargetMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-bulk-upgrade-mode]').forEach(button => {
        const active = button.dataset.bulkUpgradeMode === bulkUpgradeMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });

    specificField?.classList.toggle('hidden', bulkTargetMode !== 'specific');
    markedSummary?.classList.toggle('hidden', bulkTargetMode !== 'marked');
    if (input && input.value !== specificPlotExpression) input.value = specificPlotExpression;
    if (availableText) {
        availableText.textContent = `Available Plot Numbers: ${formatPlotIdRanges(available) || 'None'} (${available.length} total)`;
    }
    if (markedSummary) {
        markedSummary.innerHTML = marked.length
            ? `<iconify-icon icon="lucide:bookmark-check" aria-hidden="true"></iconify-icon><span><strong>${marked.length} marked</strong> · Plots ${formatPlotIdRanges(marked)}</span>`
            : '<iconify-icon icon="lucide:bookmark" aria-hidden="true"></iconify-icon><span>No plots are marked. Mark plots from the farm grid first.</span>';
    }

    if (targetSummary) {
        if (bulkTargetMode === 'all') targetSummary.textContent = `${available.length} Plots`;
        else if (bulkTargetMode === 'marked') targetSummary.textContent = `${marked.length} Marked`;
        else {
            const parsed = parsePlotSelection(specificPlotExpression, available);
            targetSummary.textContent = parsed.valid ? `${parsed.plotIds.length} Selected` : 'Custom Selection';
        }
    }
    if (bulkTargetMode !== 'specific') {
        const error = document.getElementById('farm-specific-plots-error');
        if (error) error.textContent = '';
        input?.removeAttribute('aria-invalid');
    }
};

const collectBulkOptions = () => {
    if (bulkTargetMode === 'all') {
        return { scope: 'all', plotIds: undefined, mode: bulkUpgradeMode };
    }
    if (bulkTargetMode === 'marked') {
        const plotIds = getMarkedPlotIds();
        if (plotIds.length === 0) {
            const summary = document.getElementById('farm-marked-plots-summary');
            summary?.classList.add('has-error');
            document.querySelector('[data-bulk-target="marked"]')?.focus();
            return null;
        }
        document.getElementById('farm-marked-plots-summary')?.classList.remove('has-error');
        return { scope: 'selected', plotIds, mode: bulkUpgradeMode };
    }

    const parsed = validateSpecificPlotSelection({ focus: true });
    if (!parsed.valid) return null;
    return { scope: 'selected', plotIds: parsed.plotIds, mode: bulkUpgradeMode };
};

const renderBulkUpgradePreview = preview => {
    const body = document.getElementById('farm-bulk-upgrade-preview-body');
    const confirm = document.getElementById('btn-confirm-bulk-plot-upgrade');
    if (!body || !confirm) return;

    const transitionGroups = new Map();
    for (const result of preview.plotResults.filter(result => result.levelsGained > 0)) {
        const key = `${result.previousLevel}-${result.targetLevel}`;
        if (!transitionGroups.has(key)) {
            transitionGroups.set(key, {
                previousLevel: result.previousLevel,
                targetLevel: result.targetLevel,
                plotIds: []
            });
        }
        transitionGroups.get(key).plotIds.push(result.plotId);
    }
    const maxed = preview.skippedPlots.filter(entry => entry.reason === 'maximum-level').map(entry => entry.plotId);
    const insufficient = preview.skippedPlots.filter(entry => entry.reason === 'insufficient-materials').map(entry => entry.plotId);
    const materialEntries = Object.entries(preview.materialTotals || {});

    const resultGroups = [...transitionGroups.values()].map(group => `
        <li class="farm-bulk-result-row">
            <span>Level ${group.previousLevel} → ${group.targetLevel}</span>
            <strong>Plots ${formatPlotIdRanges(group.plotIds)}</strong>
        </li>`).join('');
    const skippedGroups = [
        maxed.length ? `<li class="farm-bulk-result-row muted"><span>Already Level 16</span><strong>Plots ${formatPlotIdRanges(maxed)}</strong></li>` : '',
        insufficient.length ? `<li class="farm-bulk-result-row muted"><span>Insufficient Materials</span><strong>Plots ${formatPlotIdRanges(insufficient)}</strong></li>` : ''
    ].join('');

    body.innerHTML = `
        <div class="farm-bulk-preview-summary-grid">
            <div class="preview-stat-card"><span>Plots Upgraded</span><strong>${formatDisplayNumber(preview.upgradedPlotCount)}</strong></div>
            <div class="preview-stat-card"><span>Total Levels</span><strong>${formatDisplayNumber(preview.totalLevelsGained)}</strong></div>
            <div class="preview-stat-card"><span>Skipped / Maxed</span><strong>${formatDisplayNumber(preview.skippedPlots.length)}</strong></div>
        </div>
        <p class="farm-bulk-allocation-note"><iconify-icon icon="lucide:scale" aria-hidden="true"></iconify-icon> Lowest projected level first, then plot number. Unaffordable plots do not block other valid upgrades.</p>
        <section class="farm-bulk-preview-section" aria-labelledby="farm-bulk-results-heading">
            <h4 id="farm-bulk-results-heading">Projected Plot Levels</h4>
            ${resultGroups || skippedGroups ? `<ul class="farm-bulk-result-list">${resultGroups}${skippedGroups}</ul>` : '<p class="farm-bulk-empty-preview">No selected plot can be upgraded with the current materials.</p>'}
        </section>
        <section class="farm-bulk-preview-section" aria-labelledby="farm-bulk-materials-heading">
            <h4 id="farm-bulk-materials-heading">Material Consumption</h4>
            ${materialEntries.length ? `
                <div class="farm-bulk-material-table-wrap">
                    <table class="farm-bulk-material-table">
                        <thead><tr><th>Material</th><th>Owned</th><th>Required</th><th>Remaining</th></tr></thead>
                        <tbody>${materialEntries.map(([item, totals]) => `
                            <tr><td>${item}</td><td>${formatDisplayNumber(totals.owned)}</td><td>${formatDisplayNumber(totals.required)}</td><td>${formatDisplayNumber(totals.remaining)}</td></tr>`).join('')}</tbody>
                    </table>
                </div>`
                : '<p class="farm-bulk-empty-preview">No materials will be consumed.</p>'}
        </section>`;

    confirm.disabled = !preview.canUpgrade;
    confirm.innerHTML = preview.canUpgrade
        ? `<iconify-icon icon="lucide:chevrons-up" aria-hidden="true"></iconify-icon> Upgrade ${preview.upgradedPlotCount} Plot${preview.upgradedPlotCount === 1 ? '' : 's'}`
        : 'No Affordable Upgrades';
};

const setupFarmManageDialogs = () => {
    const manageDialog = document.getElementById('farm-manage-modal');
    const previewDialog = document.getElementById('farm-bulk-upgrade-preview-modal');
    if (!manageDialog || manageDialog.dataset.farmConfigured === 'true') return;
    manageDialog.dataset.farmConfigured = 'true';

    manageDialog.addEventListener('click', async event => {
        const tab = event.target.closest('[data-farm-manage-tab]');
        if (tab) {
            setManageTab(tab.dataset.farmManageTab);
            renderBulkConfiguration();
            return;
        }
        const target = event.target.closest('[data-bulk-target]');
        if (target) {
            bulkTargetMode = target.dataset.bulkTarget;
            renderBulkConfiguration();
            if (bulkTargetMode === 'specific') document.getElementById('farm-specific-plots-input')?.focus();
            return;
        }
        const mode = event.target.closest('[data-bulk-upgrade-mode]');
        if (mode) {
            bulkUpgradeMode = mode.dataset.bulkUpgradeMode;
            renderBulkConfiguration();
            return;
        }
        const previewButton = event.target.closest('#btn-preview-bulk-plot-upgrade');
        if (!previewButton) return;
        const options = collectBulkOptions();
        if (!options) return;
        lastBulkOptions = options;
        const previewBody = document.getElementById('farm-bulk-upgrade-preview-body');
        if (previewBody) previewBody.innerHTML = '<p class="modal-loading">Calculating balanced plot upgrades…</p>';
        try {
            const response = await doPreviewBulkPlotUpgrade(options.scope, options.plotIds, options.mode, previewButton);
            lastBulkPreview = response.result;
            renderBulkUpgradePreview(lastBulkPreview);
            replaceDialog(manageDialog, previewDialog, {
                initialFocus: '#btn-confirm-bulk-plot-upgrade:not([disabled]), #btn-back-bulk-plot-upgrade',
                closeOnBackdrop: false
            });
        } catch (error) {
            // apiCall already displays the server validation error.
        }
    });

    manageDialog.addEventListener('keydown', event => {
        const tab = event.target.closest('[data-farm-manage-tab]');
        if (!tab || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const nextTab = tab.dataset.farmManageTab === 'plant' ? 'upgrade' : 'plant';
        setManageTab(nextTab);
        document.querySelector(`[data-farm-manage-tab="${nextTab}"]`)?.focus();
    });

    document.getElementById('farm-specific-plots-input')?.addEventListener('input', event => {
        specificPlotExpression = event.currentTarget.value;
        validateSpecificPlotSelection();
        renderBulkConfiguration();
    });

    previewDialog?.addEventListener('click', async event => {
        if (event.target.closest('#btn-back-bulk-plot-upgrade')) {
            manageActiveTab = 'upgrade';
            renderManageModal();
            replaceDialog(previewDialog, manageDialog, {
                initialFocus: '#btn-preview-bulk-plot-upgrade',
                closeOnBackdrop: false
            });
            return;
        }
        const confirm = event.target.closest('#btn-confirm-bulk-plot-upgrade');
        if (!confirm || !lastBulkOptions || !lastBulkPreview?.canUpgrade) return;
        try {
            const response = await doBulkUpgradePlots(
                lastBulkOptions.scope,
                lastBulkOptions.plotIds,
                lastBulkOptions.mode,
                confirm
            );
            const result = response.result;
            closeDialog(previewDialog, { reason: 'confirm', restoreFocus: false });
            const message = `Upgraded ${result.upgradedPlotCount} plot(s) by ${formatDisplayNumber(result.totalLevelsGained)} total level(s).`;
            showToast(message, 'success');
            addLogEntry(`${message} Consumed ${Object.keys(result.consumedMaterials).length} material type(s).`, 'system');
            lastBulkOptions = null;
            lastBulkPreview = null;
            renderFarm();
        } catch (error) {
            try {
                const refreshed = await doPreviewBulkPlotUpgrade(
                    lastBulkOptions.scope,
                    lastBulkOptions.plotIds,
                    lastBulkOptions.mode
                );
                lastBulkPreview = refreshed.result;
                renderBulkUpgradePreview(lastBulkPreview);
            } catch (refreshError) {
                // The API layer reports both execution and refresh failures.
            }
        }
    });
};

/** Renders the general farm manager while preserving Plant All behavior. */
export const renderManageModal = ({ resetTab = false } = {}) => {
    if (resetTab) manageActiveTab = 'plant';
    renderSeedsList();
    setupFarmManageDialogs();
    setManageTab(manageActiveTab);
    renderBulkConfiguration();
};
