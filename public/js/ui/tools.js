// Tools Workshop Renderer - Level 1-500 Expansion & Socket Modules
import { getState, getToolRecipes, setToolRecipe } from '../state.js';
import { TOOLS, ACTIONS, iconHtml, formatDisplayNumber, displayItemName, SOCKET_MODULE_DEFINITIONS } from '../utils.js';
import {
    apiCall,
    doUpgradeTool,
    doUpgradeToolBulk,
    doPreviewToolUpgrade,
    doInstallSocketModule,
    doUninstallSocketModule,
    doCraftSocketModule,
    doGetToolDefinitions,
    doGetToolMaxSummary
} from '../api.js';
import { getToolMultiplier, getToolCooldownReduction, getUnlockedSockets, renderActions } from './actions.js';
import { renderHeader } from './header.js';
import { renderInventory } from './inventory.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { showConfirmation, openDialog, closeDialog } from './modal.js';
import { getQuantityPresets, quantityPresetButtonsHtml } from './quantityPresets.js';
import { getStoredSettings, shouldConfirmQuantityOperation } from '../preferences.js';

const MAX_TOOL_LEVEL = 500;
let cachedDefinitions = null;
let activeSocketTool = null;

export const updateAllToolRecipes = async () => {
    const playerState = getState();
    if (!playerState || !playerState.tools) return;
    for (const type of TOOLS) {
        const level = playerState.tools[type] || 1;
        if (level < MAX_TOOL_LEVEL) {
            try {
                const recipe = await apiCall(`/api/data/tools/${type}/recipe/${level + 1}`, 'GET');
                setToolRecipe(type, recipe);
            } catch (e) {
                console.error(`Failed to load recipe for ${type} level ${level + 1}`);
            }
        }
    }
};

const getModuleDefinitions = async () => {
    if (cachedDefinitions && Object.keys(cachedDefinitions).length > 0) return cachedDefinitions;
    try {
        const res = await doGetToolDefinitions();
        if (res && res.socketModules) {
            cachedDefinitions = res.socketModules;
            return cachedDefinitions;
        }
    } catch (e) {
        console.warn('Failed to fetch tool definitions, using local fallback:', e);
    }
    return SOCKET_MODULE_DEFINITIONS;
};

export const openSocketsModal = async (toolType) => {
    activeSocketTool = toolType;
    const playerState = getState();
    if (!playerState) return;

    const moduleDefs = await getModuleDefinitions();
    const actionInfo = ACTIONS.find(a => a.id === toolType) || { name: toolType, icon: 'lucide:wrench' };
    const level = playerState.tools ? (playerState.tools[toolType] || 1) : 1;
    const unlockedCount = getUnlockedSockets(level);
    const sockets = (playerState.toolSockets && playerState.toolSockets[toolType]) || new Array(10).fill(null);
    const myModules = playerState.toolModules || {};

    let modalEl = document.getElementById('sockets-workshop-modal');
    if (!modalEl) {
        modalEl = document.createElement('dialog');
        modalEl.id = 'sockets-workshop-modal';
        modalEl.className = 'modal hidden';
        modalEl.dataset.appDialog = '';
        modalEl.setAttribute('aria-labelledby', 'sockets-modal-title');
        document.body.appendChild(modalEl);
    }

    let socketsListHtml = '';
    for (let i = 0; i < 10; i++) {
        const isUnlocked = i < unlockedCount;
        const unlockLevel = (i + 1) * 50;
        const moduleId = sockets[i];
        const modDef = moduleId ? (moduleDefs[moduleId] || SOCKET_MODULE_DEFINITIONS[moduleId]) : null;

        if (isUnlocked) {
            if (modDef) {
                socketsListHtml += `
                    <div class="socket-slot-card equipped" data-slot-index="${i}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="font-bold text-accent">${iconHtml('lucide:zap')} Slot ${i + 1} (Lv. ${unlockLevel})</span>
                            <span class="charter-badge font-mono">Tier ${modDef.tier}</span>
                        </div>
                        <div class="font-bold text-base mt-1">${modDef.name}</div>
                        <div class="text-xs text-subtle mt-1">${modDef.description}</div>
                        <div class="mt-2" style="display:flex; gap:8px;">
                            <button class="action-btn secondary-btn btn-sm btn-uninstall-mod" data-slot="${i}" type="button">
                                ${iconHtml('lucide:x')} Unequip Module
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // List available modules in inventory to equip
                const availableKeys = Object.keys(myModules).filter(mId => (myModules[mId] || 0) > 0 && (moduleDefs[mId] || SOCKET_MODULE_DEFINITIONS[mId]));
                const availableOpts = availableKeys.map(mId => {
                    const def = moduleDefs[mId] || SOCKET_MODULE_DEFINITIONS[mId];
                    return `<option value="${mId}">${def.name} (${myModules[mId]} owned)</option>`;
                }).join('');

                socketsListHtml += `
                    <div class="socket-slot-card" data-slot-index="${i}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="font-bold text-subtle">${iconHtml('lucide:circle-dot')} Slot ${i + 1} (Lv. ${unlockLevel})</span>
                            <span class="text-xs text-muted">Empty Socket</span>
                        </div>
                        ${availableOpts.length > 0 ? `
                            <div style="display:flex; gap:8px; margin-top:8px;">
                                <select class="form-select select-mod-equip" data-slot="${i}" style="flex:1;">
                                    ${availableOpts}
                                </select>
                                <button class="action-btn primary-btn btn-sm btn-install-mod" data-slot="${i}" type="button">
                                    ${iconHtml('lucide:plus')} Equip
                                </button>
                            </div>
                        ` : `
                            <div class="text-xs text-muted italic mt-1">No compatible modules in inventory. Craft below!</div>
                        `}
                    </div>
                `;
            }
        } else {
            socketsListHtml += `
                <div class="socket-slot-card locked">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="font-bold text-muted">${iconHtml('lucide:lock')} Slot ${i + 1}</span>
                        <span class="text-xs text-muted">🔒 Unlocks at Lv. ${unlockLevel}</span>
                    </div>
                    <div class="text-xs text-muted mt-1">Reach Level ${unlockLevel} on your ${actionInfo.name} tool to unlock this socket.</div>
                </div>
            `;
        }
    }

    // Craftable Modules List
    let craftListHtml = '';
    const allDefs = Object.keys(moduleDefs).length > 0 ? moduleDefs : SOCKET_MODULE_DEFINITIONS;
    for (const [mId, mod] of Object.entries(allDefs)) {
        const owned = myModules[mId] || 0;
        let canCraft = true;
        let maxCraft = Number.MAX_SAFE_INTEGER;
        let reqsHtml = '';

        for (const req of (mod.recipe || [])) {
            const locked = (playerState.lockedItems || []).includes(req.item);
            const have = locked ? 0 : (playerState.inventory && playerState.inventory[req.item]) || 0;
            const sufficient = have >= req.quantity;
            if (!sufficient) canCraft = false;
            maxCraft = Math.min(maxCraft, Math.floor(have / req.quantity));

            reqsHtml += `
                <div class="req-item ${sufficient ? 'sufficient' : 'insufficient'}">
                    <span>${displayItemName(req.item)}</span>
                    <span class="tabular-nums">${formatDisplayNumber(have)} / ${formatDisplayNumber(req.quantity)}${locked ? ' · Locked' : ''}</span>
                </div>
            `;
        }

        craftListHtml += `
            <div class="module-craft-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="font-bold">${mod.name}</span>
                    <span class="charter-badge font-mono">Tier ${mod.tier} · Owned: ${owned}</span>
                </div>
                <div class="text-xs text-subtle mt-1">${mod.description}</div>
                <div class="reqs-list mt-2">
                    ${reqsHtml}
                </div>
                <div class="quantity-preset-row mt-2">${quantityPresetButtonsHtml({ systemId: 'socket-module-crafting', subjectId: mId, maxValue: Math.max(0, maxCraft), activeValue: 1, targetId: `module-craft-qty-${mId}` })}</div>
                <input id="module-craft-qty-${mId}" name="module-craft-qty-${mId}" class="form-input module-craft-quantity" type="number" inputmode="numeric" autocomplete="off" min="1" max="${Math.max(1, maxCraft)}" step="1" value="1" aria-label="Quantity of ${mod.name} to craft" ${canCraft ? '' : 'disabled'}>
                <button class="action-btn secondary-btn btn-sm btn-craft-mod mt-2" data-module-id="${mId}" ${!canCraft ? 'disabled' : ''} type="button">
                    ${iconHtml('lucide:hammer')} Craft Module
                </button>
            </div>
        `;
    }

    modalEl.innerHTML = `
        <div class="modal-content card charter-modal modal-dialog modal-wide sockets-modal-content">
            <div class="modal-header">
                <div class="modal-header-title">
                    <iconify-icon icon="${actionInfo.icon}" class="modal-icon text-accent" aria-hidden="true"></iconify-icon>
                    <h3 id="sockets-modal-title">${actionInfo.name} Tool Modification Workshop</h3>
                </div>
                <button id="btn-close-sockets-modal" class="modal-close-btn" type="button" aria-label="Close modal">
                    <iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon>
                </button>
            </div>
            <div class="modal-body sockets-modal-body">
                <div class="mb-4 p-3 card" style="background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
                    <div class="text-sm">
                        Tool Level: <strong class="text-primary">Lv. ${level}</strong>
                    </div>
                    <div class="text-sm">
                        Modification Sockets Unlocked: <strong class="text-accent">${unlockedCount} / 10</strong>
                    </div>
                </div>
                <div class="socket-modal-grid">
                    <div>
                        <h4 class="card-title-sm mb-3">
                            ${iconHtml('lucide:sliders')} Active Tool Sockets (${unlockedCount}/10 Unlocked)
                        </h4>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${socketsListHtml}
                        </div>
                    </div>
                    <div>
                        <h4 class="card-title-sm mb-3">
                            ${iconHtml('lucide:sparkles')} Module Foundry (Crafting)
                        </h4>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${craftListHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const returnFocus = document.activeElement;
    openDialog(modalEl, {
        initialFocus: '#btn-close-sockets-modal',
        closeOnBackdrop: false,
        returnFocus
    });

    // Close handlers
    const closeBtn = modalEl.querySelector('#btn-close-sockets-modal');
    if (closeBtn) {
        closeBtn.onclick = () => closeDialog(modalEl, { reason: 'close' });
    }

    // Install Module handler
    modalEl.querySelectorAll('.btn-install-mod').forEach(btn => {
        btn.onclick = async (e) => {
            const triggerBtn = e.target.closest('button');
            const slot = parseInt(triggerBtn.dataset.slot, 10);
            const selectEl = modalEl.querySelector(`select.select-mod-equip[data-slot="${slot}"]`);
            if (!selectEl) return;
            const moduleId = selectEl.value;
            try {
                await doInstallSocketModule(toolType, slot, moduleId, triggerBtn);
                showToast(`Equipped module in Slot ${slot + 1}!`, 'success');
                renderTools();
                renderActions();
                openSocketsModal(toolType);
            } catch (err) {
                showToast(err.message || 'Failed to equip module', 'error');
            }
        };
    });

    // Uninstall Module handler
    modalEl.querySelectorAll('.btn-uninstall-mod').forEach(btn => {
        btn.onclick = async (e) => {
            const triggerBtn = e.target.closest('button');
            const slot = parseInt(triggerBtn.dataset.slot, 10);
            try {
                await doUninstallSocketModule(toolType, slot, triggerBtn);
                showToast(`Unequipped module from Slot ${slot + 1}!`, 'info');
                renderTools();
                renderActions();
                openSocketsModal(toolType);
            } catch (err) {
                showToast(err.message || 'Failed to unequip module', 'error');
            }
        };
    });

    // Craft Module handler
    modalEl.querySelectorAll('[data-quantity-target]').forEach(preset => {
        preset.onclick = () => {
            const input = modalEl.querySelector(`#${preset.dataset.quantityTarget}`);
            if (!input) return;
            const value = preset.dataset.quantityPreset === 'max' ? Number(input.max) : Number(preset.dataset.quantityPreset);
            if (Number.isSafeInteger(value) && value > 0) input.value = Math.min(value, Number(input.max));
        };
    });
    modalEl.querySelectorAll('.btn-craft-mod').forEach(btn => {
        btn.onclick = async (e) => {
            const triggerBtn = e.target.closest('button');
            const moduleId = triggerBtn.dataset.moduleId;
            const quantityInput = modalEl.querySelector(`#module-craft-qty-${moduleId}`);
            const quantity = Number(quantityInput?.value || 1);
            if (!Number.isSafeInteger(quantity) || quantity < 1) {
                showToast('Enter a positive whole-number module quantity.', 'error');
                return;
            }
            const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'socket-module-crafting', subjectId: moduleId, quantity });
            if (needsConfirmation) {
                const confirmed = await showConfirmation('bulkModuleCraft', 'Craft socket modules?', `Craft ${quantity} module${quantity === 1 ? '' : 's'} and consume all required materials?`, { bulkAction: true, allowIgnore: false });
                if (!confirmed) return;
            }
            try {
                await doCraftSocketModule(moduleId, quantity, triggerBtn);
                showToast(`Crafted ${formatDisplayNumber(quantity)} module${quantity === 1 ? '' : 's'} successfully!`, 'success');
                renderInventory();
                renderTools();
                openSocketsModal(toolType);
            } catch (err) {
                showToast(err.message || 'Failed to craft module', 'error');
            }
        };
    });
};

export const renderTools = () => {
    const playerState = getState();
    if (!playerState) return;

    const grid = document.getElementById('tools-grid');
    if (!grid) return;

    if (grid.dataset.delegated !== 'true') {
        grid.innerHTML = '';
        grid.dataset.delegated = 'true';

        grid.addEventListener('click', async (e) => {
            const btn = e.target.closest('button.action-btn');
            if (!btn || !btn.dataset.toolType) return;

            const type = btn.dataset.toolType;
            const action = btn.dataset.upgradeAction;

            if (action === 'manage-sockets') {
                openSocketsModal(type);
                return;
            }

            const playerState = getState();
            const level = playerState.tools ? (playerState.tools[type] || 1) : 1;
            const actionInfo = ACTIONS.find(a => a.id === type) || { name: type, icon: 'lucide:wrench' };

            let count = 1;
            let label = `Level ${level + 1}`;
            let isCount = false;
            let targetOrCount = level + 1;

            if (action?.startsWith('bulk-count-')) {
                count = Number(action.slice('bulk-count-'.length));
                targetOrCount = count;
                isCount = true;
                label = `+${count} Levels (to Lv. ${Math.min(MAX_TOOL_LEVEL, level + count)})`;
            } else if (action === 'bulk-max') {
                targetOrCount = 'max';
                isCount = false;
                label = 'Max Affordable Levels';
            }

            let maxSummary = null;
            if (action === 'bulk-max') {
                try {
                    maxSummary = await doGetToolMaxSummary(type);
                } catch (error) {
                    showToast(error.message || 'Could not calculate the affordable tool level.', 'error');
                    return;
                }
                if (!maxSummary.levelsGained) {
                    const blockers = (maxSummary.blockers || []).map(item => `${displayItemName(item.item)} ${formatDisplayNumber(item.unlockedOwned)}/${formatDisplayNumber(item.required)}${item.lockedOwned ? ' (locked)' : ''}`).join(', ');
                    showToast(blockers ? `No upgrade is affordable: ${blockers}` : 'No further tool upgrade is affordable.', 'error');
                    return;
                }
                label = `${maxSummary.levelsGained} level${maxSummary.levelsGained === 1 ? '' : 's'} to Lv. ${maxSummary.maxAffordableLevel}`;
            }

            const requestedQuantity = action === 'bulk-max' ? 'max' : count;
            const cumulativeMaterials = maxSummary
                ? Object.entries(maxSummary.cumulativeCost || {})
                    .map(([item, quantity]) => `${displayItemName(item)} ×${formatDisplayNumber(quantity)}`)
                    .join(', ')
                : '';
            const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'tool-upgrades', subjectId: type, quantity: requestedQuantity });
            const confirmAction = !needsConfirmation || await showConfirmation(
                'bulkToolUpgrade', 'Upgrade Tool?',
                `${action === 'bulk-max' ? `Exact result: ${label}.` : `Upgrade by ${label}.`}${cumulativeMaterials ? ` Total materials: ${cumulativeMaterials}.` : ' Required materials will be consumed.'}${maxSummary?.blockers?.length ? ` The next blocked level needs ${maxSummary.blockers.map(item => `${displayItemName(item.item)} ${formatDisplayNumber(item.unlockedOwned)}/${formatDisplayNumber(item.required)}${item.lockedOwned ? ' (locked)' : ''}`).join(', ')}.` : ''}`,
                { bulkAction: true, ignoreLabel: "Don't show this preview again" }
            );
            if (!confirmAction) return;

            try {
                if (action === 'single') {
                    await doUpgradeTool(type, btn);
                } else {
                    await doUpgradeToolBulk(type, targetOrCount, isCount, btn);
                }

                showToast(`Upgraded ${type} tool to level ${getState().tools[type]}!`, 'success');
                addLogEntry(`Upgraded ${type} tool to level ${getState().tools[type]}`, 'success');

                await updateAllToolRecipes();
                renderHeader();
                renderInventory();
                renderTools();
                renderActions();
            } catch (err) {
                showToast(err.message || `Failed to upgrade ${type} tool`, 'error');
            }
        });
    }

    const toolRecipes = getToolRecipes();

    TOOLS.forEach(type => {
        const level = playerState.tools ? (playerState.tools[type] || 1) : 1;
        const recipe = toolRecipes[type];
        const isMax = level >= MAX_TOOL_LEVEL;
        let canUpgrade = !isMax;

        const cooldownReduction = getToolCooldownReduction(level);
        const unlockedSocketsCount = getUnlockedSockets(level);
        const sockets = (playerState.toolSockets && playerState.toolSockets[type]) || new Array(10).fill(null);

        let pipsHtml = '';
        for (let i = 0; i < 10; i++) {
            const isUnlocked = i < unlockedSocketsCount;
            const isEquipped = !!sockets[i];
            const className = isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked');
            const icon = isEquipped ? 'lucide:zap' : (isUnlocked ? 'lucide:circle-dot' : 'lucide:lock');
            pipsHtml += `<div class="tool-socket-pip ${className}" title="Socket ${i + 1}: ${isEquipped ? 'Equipped' : (isUnlocked ? 'Unlocked' : 'Locked at Lv ' + ((i+1)*50))}">${iconHtml(icon)}</div>`;
        }

        let reqsHTML = '';
        if (isMax) {
            reqsHTML = `<div class="req-item sufficient"><span class="req-item-left">${iconHtml('lucide:check-circle', 'req-icon')} MAX LEVEL REACHED (Lv. 500)</span></div>`;
        } else if (recipe) {
            const reqs = Array.isArray(recipe) ? recipe : [];
            for (const req of reqs) {
                const owned = (playerState.inventory && playerState.inventory[req.item]) || 0;
                const sufficient = owned >= req.quantity;
                if (!sufficient) canUpgrade = false;

                const reqIcon = sufficient ? 'lucide:check-circle' : 'lucide:x-circle';
                const displayName = displayItemName(req.item);
                reqsHTML += `
                    <div class="req-item ${sufficient ? 'sufficient' : 'insufficient'}">
                        <span class="req-item-left">${iconHtml(reqIcon, 'req-icon')} ${displayName}</span>
                        <span class="tabular-nums">${formatDisplayNumber(owned)} / ${formatDisplayNumber(req.quantity)}</span>
                    </div>
                `;
            }
        } else {
            reqsHTML = '<div class="req-item">Loading recipe...</div>';
            canUpgrade = false;
        }

        const actionInfo = ACTIONS.find(a => a.id === type) || { name: type, icon: 'lucide:wrench' };
        const toolPresetConfig = getQuantityPresets('tool-upgrades', type, MAX_TOOL_LEVEL - level);
        const toolPresetButtons = toolPresetConfig.presets.map(preset => {
            const action = preset.max ? 'bulk-max' : `bulk-count-${preset.value}`;
            const label = preset.max ? 'Max Affordable' : `+${preset.label}`;
            const disabled = !preset.enabled || (preset.value === 1 && !canUpgrade);
            return `<button class="action-btn ${preset.max ? 'primary-btn' : 'secondary-btn'} tool-bulk-btn" data-tool-type="${type}" data-upgrade-action="${action}" ${disabled ? 'disabled' : ''} type="button">${label}</button>`;
        }).join('');

        let card = grid.querySelector(`[data-tool-type="${type}"]`);
        if (!card) {
            card = document.createElement('div');
            card.className = 'tool-card card';
            card.dataset.toolType = type;
            grid.appendChild(card);
        }

        card.innerHTML = `
            <div class="tool-header">
                <div class="tool-title-row">
                    <div class="tool-icon-well">${iconHtml(actionInfo.icon, 'tool-icon')}</div>
                    <div>
                        <div class="tool-title">${actionInfo.name} Tool</div>
                        ${cooldownReduction > 0 ? `
                            <span class="tool-overclock-tag">
                                ${iconHtml('lucide:zap')} -${cooldownReduction}s Cooldown
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="tool-multiplier">Lv.${level} (${getToolMultiplier(level)})</div>
            </div>

            <div class="progress-bar-bg">
                <div class="progress-bar-fill progress-accent" style="width: ${(level / MAX_TOOL_LEVEL) * 100}%"></div>
            </div>

            <div class="tool-sockets-container">
                <div class="tool-sockets-header">
                    <span>Modification Sockets (${unlockedSocketsCount}/10)</span>
                </div>
                <div class="tool-socket-pips">
                    ${pipsHtml}
                </div>
                <button class="tool-manage-sockets-btn action-btn mt-1" data-tool-type="${type}" data-upgrade-action="manage-sockets" type="button">
                    ${iconHtml('lucide:sliders')} Sockets & Modules
                </button>
            </div>

            <div class="reqs-list">
                ${reqsHTML}
            </div>

            <div class="flex flex-col gap-2">
                ${!isMax ? `<div class="tool-bulk-controls" aria-label="${actionInfo.name} tool upgrade quantities">${toolPresetButtons}</div>` : '<button class="action-btn secondary-btn btn-large" disabled>MAX LEVEL</button>'}
            </div>
        `;
    });
};
