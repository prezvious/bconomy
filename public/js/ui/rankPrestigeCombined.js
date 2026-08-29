// Rank & Ascension Combined UI Renderer and Modal Manager
import { getState, getRankData, getPerkData, getProgressionRules } from '../state.js';
import { formatDisplayNumber, formatMoney } from '../utils.js';
import {
    apiCall, doUpgradePerk, doRankUp, doSimulatePerks, doOptimizePerks,
    doApplyPerkAllocation, doAscendAndApplyAllocation, doPreviewRankTarget
} from '../api.js';
import { renderHeader, renderAll } from './header.js';
import { showToast } from './toast.js';
import { showConfirmation, openDialog, closeDialog } from './modal.js';
import { addLogEntry } from './log.js';
import { getQuantityPresets } from './quantityPresets.js';
import { getStoredSettings, shouldConfirmQuantityOperation } from '../preferences.js';

export const renderRankPrestige = () => {
    const playerState = getState();
    if (!playerState) return;

    const rankData = getRankData();
    const maxRankIndex = rankData.length > 0 ? rankData.length - 1 : 106;
    const curRankIndex = Math.min(maxRankIndex, Math.max(0, Math.floor(Number(playerState.rankIndex) || 0)));
    const rankInfo = rankData[curRankIndex] || { name: 'Peasant', basePrice: 10000 };
    const curTier = Math.max(0, Math.floor(Number(playerState.prestigeCount) || 0));
    const curPoints = Math.max(0, Math.floor(Number(playerState.prestigePoints) || 0));

    // Overview Elements
    const curRankEl = document.getElementById('rp-current-rank-display');
    if (curRankEl) curRankEl.textContent = `Rank ${curRankIndex + 1} - ${rankInfo.name}`;

    const progressFill = document.getElementById('rp-rank-progress-fill');
    if (progressFill) progressFill.style.width = `${(curRankIndex / maxRankIndex) * 100}%`;

    const progressText = document.getElementById('rp-rank-progress-text');
    if (progressText) progressText.textContent = `${curRankIndex} / ${maxRankIndex}`;

    const tierEl = document.getElementById('rp-tier-display');
    if (tierEl) tierEl.textContent = `Tier ${curTier}`;

    const pointsEl = document.getElementById('rp-prestige-points-display');
    if (pointsEl) pointsEl.textContent = formatDisplayNumber(curPoints);

    // Progression Section: Single Rank Promotion
    const nextRankInfo = rankData[curRankIndex + 1];
    const btnPromote = document.getElementById('btn-rp-promote');
    const nextRankNameEl = document.getElementById('rp-next-rank-name');
    const nextRankCostEl = document.getElementById('rp-next-rank-cost');
    const nextRankDeficitEl = document.getElementById('rp-next-rank-deficit');

    if (nextRankInfo) {
        if (nextRankNameEl) nextRankNameEl.textContent = `Rank ${curRankIndex + 2} - ${nextRankInfo.name}`;
        
        const cronyismLevel = Math.min(25, (playerState.perks && playerState.perks.cronyism) || 0);
        const tier = playerState.prestigeCount || 0;
        const tierMult = tier + 1;
        let cost = Math.floor(nextRankInfo.basePrice * tierMult * (1 - 0.025 * cronyismLevel));

        if (nextRankCostEl) nextRankCostEl.textContent = formatMoney(cost);
        const deficit = Math.max(0, cost - (playerState.cash || 0));
        if (nextRankDeficitEl) {
            nextRankDeficitEl.textContent = deficit === 0 ? 'Affordable now' : `${formatMoney(deficit)} more cash needed`;
            nextRankDeficitEl.classList.toggle('is-ready', deficit === 0);
        }
        if (btnPromote) {
            btnPromote.disabled = playerState.cash < cost;
            if (playerState.cash >= cost) {
                btnPromote.classList.add('ready-highlight');
            } else {
                btnPromote.classList.remove('ready-highlight');
            }
        }
    } else {
        if (nextRankNameEl) nextRankNameEl.textContent = "MAX RANK REACHED";
        if (nextRankCostEl) nextRankCostEl.textContent = "N/A";
        if (nextRankDeficitEl) nextRankDeficitEl.textContent = 'No further ranks';
        if (btnPromote) {
            btnPromote.disabled = true;
            btnPromote.classList.remove('ready-highlight');
        }
    }

    // Progression Section: Single Prestige Ascension
    const btnAscend = document.getElementById('btn-rp-ascend');
    const msgAscend = document.getElementById('rp-ascend-status-msg');
    const ascendCostEl = document.getElementById('rp-ascend-cost');

    const investitureLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);
    const ascensionCost = curTier === 0 ? 0 : Math.floor(550000000 * (curTier + 2) * (1 - 0.025 * investitureLevel));

    if (ascendCostEl) {
        ascendCostEl.textContent = ascensionCost === 0 ? '$0 (Free)' : formatMoney(ascensionCost);
    }

    const isGod = curRankIndex >= 106;
    const playerCash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(playerState.cash) || 0)));
    const canAffordAscension = playerCash >= ascensionCost;

    if (isGod) {
        if (msgAscend) {
            msgAscend.textContent = canAffordAscension
                ? "You have reached peak standing (Rank 107 God) and are eligible for tier ascension."
                : `You have reached Rank 107 (God), but need ${formatMoney(ascensionCost)} cash to ascend.`;
        }
        if (btnAscend) {
            btnAscend.disabled = !canAffordAscension;
            if (canAffordAscension) {
                btnAscend.classList.add('ready-highlight');
            } else {
                btnAscend.classList.remove('ready-highlight');
            }
        }
    } else {
        if (msgAscend) msgAscend.textContent = "Reach Rank 107 (God) to ascend tier.";
        if (btnAscend) {
            btnAscend.disabled = true;
            btnAscend.classList.remove('ready-highlight');
        }
    }

    // Perks Grid
    renderPerksGrid();
    renderPerkSimulator();
};

const SIMULATOR_PERKS = ['cronyism', 'investiture', 'partiality', 'serendipity', 'amnesiac', 'water_byproducts', 'numismatist', 'jackpot_fever'];
let simulatorTargets = null;
let simulatorRequestId = 0;

const simulatorBudget = (state, settings, horizon, mode, value) => {
    const s = state || getState() || {};
    const current = Math.max(0, Math.floor(Number(s.prestigePoints) || 0));
    if (horizon === 'current') return current;
    if (horizon === 'next') return current + 5;
    if (mode === 'targetTier') return current + (Math.max(0, Math.floor(Number(value) || 0) - (s.prestigeCount || 0)) * 5);
    if (mode === 'custom') return Math.max(current, Math.floor(Number(value) || current));
    return current + (Math.max(0, Math.floor(Number(value) || settings?.futureAscensions || 5)) * 5);
};

const formatEffect = (perkId, value) => {
    if (perkId === 'cronyism' || perkId === 'investiture' || perkId === 'amnesiac') return `${(value * 100).toFixed(1)}%`;
    if (perkId === 'numismatist') return formatMoney(value);
    return `${Number(value).toFixed(2)}×`;
};

const updateSimulatorPreview = async () => {
    const root = document.getElementById('prestige-simulator');
    if (!root) return;
    const playerState = getState() || {};
    if (!simulatorTargets) {
        simulatorTargets = Object.fromEntries(SIMULATOR_PERKS.map(id => [id, Number(playerState.perks?.[id]) || 0]));
    }
    const settings = getStoredSettings()?.prestigeSimulator || {};
    const horizon = root.querySelector('#sim-horizon')?.value || settings.defaultHorizon || 'current';
    const futureMode = root.querySelector('#sim-future-mode')?.value || settings.futureBudgetMode || 'ascensions';
    const futureValue = root.querySelector('#sim-future-value')?.value;
    const budget = simulatorBudget(playerState, settings, horizon, futureMode, futureValue);
    const goalWeights = Object.fromEntries(['career', 'actions', 'farming', 'gambling'].map(goal => [goal, Number(root.querySelector(`[data-sim-goal="${goal}"]`)?.value) || 0]));
    const requestId = ++simulatorRequestId;
    const summary = root.querySelector('#sim-summary');
    if (summary) summary.innerHTML = '<span class="text-subtle">Calculating allocation…</span>';
    try {
        const result = await doSimulatePerks(simulatorTargets, budget, { goalWeights });
        if (requestId !== simulatorRequestId || !document.body.contains(root)) return;
        if (!result.success) throw new Error(result.error || 'Simulation failed');
        if (summary) summary.innerHTML = `<div class="sim-budget-strip"><strong>${result.spent} spent</strong><span>${result.remaining} remaining</span><span>${budget} point budget</span></div>
            <div class="sim-effects-grid">${SIMULATOR_PERKS.map(id => `<div><span>${getPerkData()[id]?.name || id}</span><strong>${formatEffect(id, result.effects[id].before)} → ${formatEffect(id, result.effects[id].after)}</strong></div>`).join('')}</div>`;
        root.querySelector('#sim-apply').disabled = result.spent < 1 || horizon === 'future' || (horizon === 'next' && !root.dataset.canAscend);
        root.querySelector('#sim-apply').textContent = horizon === 'next' ? 'Ascend & Apply Allocation' : 'Apply Allocation';
    } catch (error) {
        if (summary) summary.innerHTML = `<span class="text-danger">${error.message || 'Simulation failed'}</span>`;
        const apply = root.querySelector('#sim-apply');
        if (apply) apply.disabled = true;
    }
};

const renderPerkSimulator = () => {
    const root = document.getElementById('prestige-simulator');
    const state = getState() || {};
    if (!root) return;
    const perks = state.perks || {};
    if (!simulatorTargets) {
        simulatorTargets = Object.fromEntries(SIMULATOR_PERKS.map(id => [id, Number(perks[id]) || 0]));
    }
    const perkData = getPerkData() || {};
    const settings = getStoredSettings()?.prestigeSimulator || {
        defaultHorizon: 'current',
        futureBudgetMode: 'ascensions',
        futureAscensions: 5,
        goalWeights: { career: 25, actions: 25, farming: 25, gambling: 25 }
    };
    const stateRankIndex = Math.max(0, Math.floor(Number(state.rankIndex) || 0));
    const stateCash = Math.max(0, Math.floor(Number(state.cash) || 0));
    const stateTier = Math.max(0, Math.floor(Number(state.prestigeCount) || 0));
    const stateInvestiture = Math.min(25, Math.max(0, Math.floor(Number(perks.investiture) || 0)));
    const canAscend = stateRankIndex >= 106 && stateCash >= (stateTier === 0 ? 0 : Math.floor(550000000 * (stateTier + 2) * (1 - 0.025 * stateInvestiture)));
    root.dataset.canAscend = canAscend ? 'true' : '';
    root.innerHTML = `
        <div class="sim-controls card">
            <label class="form-group"><span class="form-label">Planning horizon</span><select id="sim-horizon" name="sim-horizon" class="form-select" autocomplete="off">
                <option value="current" ${settings.defaultHorizon === 'current' ? 'selected' : ''}>Current unspent points</option>
                <option value="next" ${settings.defaultHorizon === 'next' ? 'selected' : ''}>After next ascension (+5)</option>
                <option value="future" ${settings.defaultHorizon === 'future' ? 'selected' : ''}>Future hypothetical</option>
            </select></label>
            <label class="form-group"><span class="form-label">Future budget mode</span><select id="sim-future-mode" name="sim-future-mode" class="form-select" autocomplete="off">
                <option value="ascensions" ${settings.futureBudgetMode === 'ascensions' ? 'selected' : ''}>Number of ascensions</option>
                <option value="targetTier" ${settings.futureBudgetMode === 'targetTier' ? 'selected' : ''}>Target prestige tier</option>
                <option value="custom" ${settings.futureBudgetMode === 'custom' ? 'selected' : ''}>Custom point budget</option>
            </select></label>
            <label class="form-group"><span class="form-label">Future value</span><input id="sim-future-value" name="sim-future-value" class="form-input" type="number" inputmode="numeric" autocomplete="off" min="0" value="${settings.futureAscensions}"></label>
        </div>
        <fieldset class="sim-goals card"><legend>Optimizer priorities</legend>${['career', 'actions', 'farming', 'gambling'].map(goal => `<label><span>${goal.charAt(0).toUpperCase() + goal.slice(1)}</span><input type="range" name="sim-goal-${goal}" min="0" max="100" value="${settings.goalWeights[goal]}" data-sim-goal="${goal}"><output>${settings.goalWeights[goal]}</output></label>`).join('')}</fieldset>
        <div class="sim-perk-grid">${SIMULATOR_PERKS.map(id => {
            const current = Number(perks[id]) || 0;
            const max = perkData[id]?.maxLevel || current;
            const targetVal = simulatorTargets?.[id] ?? current;
            return `<label class="sim-perk-card"><span><strong>${perkData[id]?.name || id}</strong><small>Current ${current} · Max ${max}</small></span><input type="number" name="sim-perk-${id}" inputmode="numeric" autocomplete="off" min="${current}" max="${max}" value="${targetVal}" data-sim-perk="${id}"></label>`;
        }).join('')}</div>
        <div id="sim-summary" class="sim-summary card" role="status" aria-live="polite"></div>
        <div class="sim-actions"><button id="sim-optimize" class="action-btn secondary-btn" type="button"><iconify-icon icon="lucide:sparkles" aria-hidden="true"></iconify-icon> Recommend Allocation</button><button id="sim-reset" class="action-btn secondary-btn" type="button">Reset</button><button id="sim-apply" class="action-btn accent-btn" type="button">Apply Allocation</button></div>`;

    root.querySelectorAll('[data-sim-perk]').forEach(input => input.addEventListener('input', () => {
        simulatorTargets[input.dataset.simPerk] = Number(input.value);
        void updateSimulatorPreview();
    }));
    root.querySelectorAll('#sim-horizon, #sim-future-mode, #sim-future-value, [data-sim-goal]').forEach(input => input.addEventListener('input', event => {
        if (event.target.matches('[data-sim-goal]')) event.target.nextElementSibling.textContent = event.target.value;
        void updateSimulatorPreview();
    }));
    root.querySelector('#sim-reset')?.addEventListener('click', () => {
        simulatorTargets = Object.fromEntries(SIMULATOR_PERKS.map(id => [id, Number((getState() || {}).perks?.[id]) || 0]));
        renderPerkSimulator();
    });
    root.querySelector('#sim-optimize')?.addEventListener('click', async event => {
        const optimizeButton = event.currentTarget;
        const horizon = root.querySelector('#sim-horizon').value;
        const budget = simulatorBudget(getState(), settings, horizon, root.querySelector('#sim-future-mode').value, root.querySelector('#sim-future-value').value);
        const goalWeights = Object.fromEntries(['career', 'actions', 'farming', 'gambling'].map(goal => [goal, Number(root.querySelector(`[data-sim-goal="${goal}"]`).value)]));
        optimizeButton.disabled = true;
        try {
            const result = await doOptimizePerks(budget, { goalWeights });
            simulatorTargets = { ...result.targetLevels };
            renderPerkSimulator();
            showToast('Recommended allocation loaded. Review it before applying.', 'success');
        } catch (error) { showToast(error.message || 'Optimizer failed', 'error'); }
        finally { if (optimizeButton.isConnected) optimizeButton.disabled = false; }
    });
    root.querySelector('#sim-apply')?.addEventListener('click', async event => {
        const horizon = root.querySelector('#sim-horizon').value;
        const isAscension = horizon === 'next';
        const approved = await showConfirmation(
            'applyPerkPlan',
            isAscension ? 'Ascend and apply this allocation?' : 'Apply this perk allocation?',
            isAscension ? 'This atomically ascends, resets cash and rank, awards 5 points, and applies the reviewed perk plan.' : 'Prestige Points will be spent immediately. Perk levels cannot be reduced.',
            { allowIgnore: false, confirmLabel: isAscension ? 'Ascend & Apply' : 'Apply Allocation' }
        );
        if (!approved) return;
        try {
            await (isAscension ? doAscendAndApplyAllocation(simulatorTargets) : doApplyPerkAllocation(simulatorTargets));
            simulatorTargets = null;
            renderAll();
            showToast(isAscension ? 'Ascension and perk allocation complete.' : 'Perk allocation applied.', 'success');
        } catch (error) { showToast(error.message || 'Allocation failed', 'error'); }
    });
    void updateSimulatorPreview();
};

const renderPerksGrid = () => {
    const grid = document.getElementById('rp-perks-grid');
    if (!grid) return;

    if (grid.dataset.delegated !== 'true') {
        grid.innerHTML = '';
        grid.dataset.delegated = 'true';
        grid.addEventListener('click', async (e) => {
            const btn = e.target.closest('button.btn-perk-buy');
            if (!btn || !btn.dataset.perkId) return;

            const id = btn.dataset.perkId;
            const mode = btn.dataset.buyMode || '1';
            const perkData = getPerkData();
            const data = perkData[id];
            if (!data) return;

            const playerState = getState() || {};
            const level = (playerState.perks && playerState.perks[id]) || 0;
            const maxLevel = data.maxLevel || 0;
            const points = Math.max(0, Math.floor(Number(playerState.prestigePoints) || 0));
            const remaining = maxLevel - level;

            if (points < 1 || remaining < 1) return;

            let countToBuy = 1;
            if (mode === 'max') {
                countToBuy = Math.min(points, remaining);
            } else {
                countToBuy = Math.min(Number(mode) || 1, points, remaining);
            }

            if (countToBuy < 1) return;

            const targetLevel = level + countToBuy;
            const costStr = `${countToBuy} Prestige Point${countToBuy > 1 ? 's' : ''}`;

            const quantity = mode === 'max' ? 'max' : countToBuy;
            const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'perk-upgrades', subjectId: id, quantity });
            const confirmed = !needsConfirmation || await showConfirmation(
                'bulkPerkUpgrade', 'Upgrade Perk?',
                `Spend ${costStr} to upgrade ${data.name} to Level ${targetLevel}?`,
                { bulkAction: true, ignoreLabel: "Don't show this preview again" }
            );
            if (!confirmed) return;

            try {
                const res = await doUpgradePerk(id, mode, btn);
                const levelsAdded = res.result && res.result.levelsAdded ? res.result.levelsAdded : countToBuy;
                const newLevel = res.result && res.result.newLevel ? res.result.newLevel : targetLevel;
                const spent = res.result && res.result.cost ? res.result.cost : countToBuy;

                showToast(`Upgraded ${data.name}!`, 'success', null, { category: 'perks' });
                addLogEntry(`Upgraded perk ${data.name} (+${levelsAdded} level${levelsAdded > 1 ? 's' : ''}, now Lv. ${newLevel}) for ${spent} Prestige Point(s).`, 'bonus');
                renderRankPrestige();
                renderHeader();
            } catch (err) {
                showToast(err.message || `Failed to upgrade perk ${data.name}`, 'error');
            }
        });
    }

    const playerState = getState() || {};
    const perkData = getPerkData() || {};
    const points = Math.max(0, Math.floor(Number(playerState.prestigePoints) || 0));

    Object.entries(perkData).forEach(([id, data]) => {
        const level = (playerState.perks && playerState.perks[id]) || 0;
        const maxLevel = data.maxLevel || 0;
        const isMax = level >= maxLevel;
        const remaining = Math.max(0, maxLevel - level);
        const isComingSoon = ['backchannel'].includes(id);

        const affordableLevels = Math.min(points, remaining);
        const perkPresets = getQuantityPresets('perk-upgrades', id, affordableLevels);

        let card = grid.querySelector(`[data-perk-id="${id}"]`);

        let actionsHtml = '';
        if (isMax) {
            actionsHtml = `<button class="action-btn secondary-btn btn-large" disabled>MAXED</button>`;
        } else if (isComingSoon) {
            actionsHtml = `
                <button class="action-btn secondary-btn btn-large" disabled>Coming Soon</button>
                <div class="coming-soon-badge">(Coming Soon in Future Update)</div>
            `;
        } else {
            actionsHtml = `
                <div class="perk-btn-group">
                    ${perkPresets.presets.map((preset, index) => {
                        const cost = preset.max ? affordableLevels : Math.min(Number(preset.value) || 0, affordableLevels);
                        const disabled = !preset.enabled || affordableLevels < 1;
                        return `<button class="action-btn ${preset.max ? 'accent-btn' : index === 0 ? 'primary-btn' : 'secondary-btn'} btn-perk-buy" data-perk-id="${id}" data-buy-mode="${preset.value}" ${disabled ? 'disabled' : ''}>${preset.max ? 'Max' : `+${preset.label}`} <span class="btn-cost-tag">(${cost} Pt${cost === 1 ? '' : 's'})</span></button>`;
                    }).join('')}
                </div>
            `;
        }

        if (card) {
            card.className = `perk-card card ${points > 0 && !isMax ? 'affordable' : ''}`;
            const levelEl = card.querySelector('.perk-level');
            if (levelEl) levelEl.textContent = `Lv.${level}/${maxLevel}`;

            const actionContainer = card.querySelector('.perk-actions-container');
            if (actionContainer) {
                actionContainer.innerHTML = actionsHtml;
            }
        } else {
            card = document.createElement('div');
            card.className = `perk-card card ${points > 0 && !isMax ? 'affordable' : ''}`;
            card.dataset.perkId = id;

            const effectStr = data.formula ? `${data.formula}` : '';

            card.innerHTML = `
                <div class="perk-header">
                    <h4>${data.name}</h4>
                    <span class="perk-level">Lv.${level}/${maxLevel}</span>
                </div>
                <p class="perk-effect">${data.description}</p>
                <p class="perk-formula">${effectStr}</p>
                <div class="perk-actions-container mt-3">
                    ${actionsHtml}
                </div>
            `;
            grid.appendChild(card);
        }
    });
};

// Accordion Setup
export const setupAccordion = () => {
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (!header) return;

        header.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('active');
            accordionItems.forEach(i => {
                i.classList.remove('active');
                const btn = i.querySelector('.accordion-header');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });

            if (!isCurrentlyActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });
};

export const setupTargetedModal = () => {
    const modal = document.getElementById('targeted-rankup-modal');
    const btnOpen = document.getElementById('btn-open-targeted-modal');
    const btnClose = document.getElementById('btn-close-targeted-modal');
    const btnCancel = document.getElementById('btn-targeted-cancel');
    const btnConfirm = document.getElementById('btn-targeted-confirm');
    const modeInputs = [...document.querySelectorAll('input[name="targeted-rank-mode"]')];
    const customControls = document.getElementById('targeted-custom-controls');
    const tierInput = document.getElementById('targeted-tier-input');
    const tierError = document.getElementById('targeted-tier-error');
    const rankSelect = document.getElementById('targeted-rank-select');
    const promptTextEl = document.getElementById('targeted-prompt-text');
    const costBannerEl = document.getElementById('targeted-cost-banner');

    if (!modal) return;

    const populateRanks = () => {
        if (!rankSelect || rankSelect.children.length > 0) return;
        getRankData().forEach((rank, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Rank ${rank.index || index + 1} - ${rank.name}`;
            rankSelect.appendChild(option);
        });
    };

    const getSelection = () => {
        const state = getState() || {};
        const ranks = getRankData();
        const maximumRankIndex = Math.max(0, ranks.length - 1);
        const currentTier = Math.max(0, Math.floor(Number(state.prestigeCount) || 0));
        const currentRank = Math.min(maximumRankIndex, Math.max(0, Math.floor(Number(state.rankIndex) || 0)));
        const mode = modeInputs.find(input => input.checked)?.value || 'next';
        const maxAdvance = getProgressionRules().maxTargetedTierAdvance;
        const maximumTargetTier = Math.min(Number.MAX_SAFE_INTEGER, currentTier + maxAdvance);

        if (tierInput) tierInput.max = String(maximumTargetTier);
        customControls?.classList.toggle('hidden', mode !== 'custom');

        if (mode === 'max') {
            return { mode, isMax: true, currentTier, currentRank, targetTier: currentTier, targetRankIndex: currentRank };
        }
        if (mode === 'next') {
            const atGod = currentRank >= maximumRankIndex;
            return {
                mode,
                isMax: false,
                currentTier,
                currentRank,
                targetTier: atGod ? Math.min(Number.MAX_SAFE_INTEGER, currentTier + 1) : currentTier,
                targetRankIndex: atGod ? 0 : currentRank + 1
            };
        }

        const targetTier = Number(tierInput?.value);
        const targetRankIndex = Number(rankSelect?.value);
        if (!Number.isSafeInteger(targetTier) || targetTier < 0 || !Number.isSafeInteger(targetRankIndex) || targetRankIndex < 0 || targetRankIndex > maximumRankIndex) {
            return { error: 'Target tier and rank must be whole, non-negative numbers.', mode, maximumTargetTier };
        }
        if (targetTier > maximumTargetTier) {
            return {
                error: `Target tier may be at most ${maximumTargetTier} (${maxAdvance} tiers ahead).`,
                mode,
                maximumTargetTier
            };
        }
        return { mode, isMax: false, currentTier, currentRank, targetTier, targetRankIndex };
    };

    const disableConfirmation = (label, message) => {
        if (promptTextEl) promptTextEl.textContent = message;
        if (costBannerEl) costBannerEl.textContent = label;
        if (btnConfirm) {
            btnConfirm.textContent = label;
            btnConfirm.disabled = true;
        }
    };

    let previewRequestId = 0;
    let previewTimer = null;
    let latestPreview = null;
    let latestSelectionKey = '';

    const updateModalPreview = async () => {
        const selection = getSelection();
        const requestId = ++previewRequestId;
        latestPreview = null;

        if (selection.error) {
            if (tierError) {
                tierError.textContent = selection.error;
                tierError.classList.remove('hidden');
            }
            disableConfirmation('Invalid Target', selection.error);
            return;
        }
        if (tierError) {
            tierError.textContent = '';
            tierError.classList.add('hidden');
        }
        if (costBannerEl) costBannerEl.textContent = 'Calculating authoritative cost…';
        if (btnConfirm) {
            btnConfirm.disabled = true;
            btnConfirm.textContent = 'Confirm advancement · Calculating…';
        }

        let preview;
        try {
            preview = await doPreviewRankTarget(selection.targetTier, selection.targetRankIndex, selection.isMax);
        } catch (error) {
            if (requestId === previewRequestId) {
                disableConfirmation('Advancement Unavailable', error.message || 'Unable to calculate advancement.');
            }
            return;
        }
        if (requestId !== previewRequestId) return;

        const ranks = getRankData();
        const targetRank = ranks[preview.targetRankIndex] || { name: 'Unknown' };
        const selectedRank = ranks[selection.targetRankIndex] || { name: 'Unknown' };
        latestPreview = preview;
        latestSelectionKey = JSON.stringify([selection.mode, selection.targetTier, selection.targetRankIndex, selection.isMax]);

        if (preview.reason === 'READY') {
            if (promptTextEl) promptTextEl.textContent = `Advance to Tier ${preview.targetTier}, Rank ${preview.targetRankIndex + 1} (${targetRank.name})?`;
            if (costBannerEl) costBannerEl.textContent = `Total Advancement Cost: ${formatMoney(preview.totalCost)}`;
            if (btnConfirm) {
                btnConfirm.textContent = `Confirm (${formatMoney(preview.totalCost)})`;
                btnConfirm.disabled = false;
            }
            return;
        }

        if (preview.reason === 'INSUFFICIENT_CASH') {
            const targetText = selection.mode === 'max'
                ? `the next advancement from Tier ${selection.currentTier}, Rank ${selection.currentRank + 1}`
                : `Tier ${selection.targetTier}, Rank ${selection.targetRankIndex + 1} (${selectedRank.name})`;
            if (promptTextEl) promptTextEl.textContent = `You need ${formatMoney(preview.nextCost)} to reach ${targetText}, leaving a deficit of ${formatMoney(preview.deficit)}.`;
            if (costBannerEl) costBannerEl.textContent = `Deficit: ${formatMoney(preview.deficit)}`;
            if (btnConfirm) {
                btnConfirm.textContent = 'Insufficient Funds';
                btnConfirm.disabled = true;
            }
            return;
        }

        if (preview.reason === 'ALREADY_REACHED') {
            if (promptTextEl) promptTextEl.textContent = `You are already at or above Tier ${selection.targetTier}, Rank ${selection.targetRankIndex + 1} (${selectedRank.name}).`;
            if (costBannerEl) costBannerEl.textContent = 'No advancement required';
            if (btnConfirm) {
                btnConfirm.textContent = 'Already Reached';
                btnConfirm.disabled = true;
            }
            return;
        }

        disableConfirmation('Advancement Unavailable', 'The server returned an unknown advancement status.');
    };

    const scheduleInputPreview = () => {
        clearTimeout(previewTimer);
        previewRequestId += 1;
        previewTimer = setTimeout(() => void updateModalPreview(), 200);
    };

    let lastTriggerElement = btnOpen;
    const openTargetedModal = event => {
        lastTriggerElement = event?.currentTarget || btnOpen || document.getElementById('header-rank-tracker');
        populateRanks();
        const state = getState();
        if (state) {
            const currentTier = Math.max(0, Math.floor(Number(state.prestigeCount) || 0));
            const currentRank = Math.min(Math.max(0, getRankData().length - 1), Math.max(0, Math.floor(Number(state.rankIndex) || 0)));
            if (tierInput) tierInput.value = String(currentTier);
            if (rankSelect) rankSelect.value = String(currentRank);
        }
        void updateModalPreview();
        openDialog(modal, {
            initialFocus: 'input[name="targeted-rank-mode"]:checked',
            closeOnBackdrop: false,
            returnFocus: lastTriggerElement
        });
    };

    btnOpen?.addEventListener('click', openTargetedModal);
    document.getElementById('header-rank-tracker')?.addEventListener('click', openTargetedModal);
    const closeModal = () => closeDialog(modal, { reason: 'cancel' });
    btnClose?.addEventListener('click', closeModal);
    btnCancel?.addEventListener('click', closeModal);
    modeInputs.forEach(input => input.addEventListener('change', () => void updateModalPreview()));
    tierInput?.addEventListener('input', scheduleInputPreview);
    rankSelect?.addEventListener('change', () => void updateModalPreview());

    btnConfirm?.addEventListener('click', async () => {
        const selection = getSelection();
        const selectionKey = selection.error ? '' : JSON.stringify([selection.mode, selection.targetTier, selection.targetRankIndex, selection.isMax]);
        if (selection.error || latestPreview?.reason !== 'READY' || selectionKey !== latestSelectionKey) {
            await updateModalPreview();
            return;
        }

        let completed = false;
        try {
            btnConfirm.disabled = true;
            const response = await apiCall('/api/prestige/targeted-rank-up', 'POST', {
                targetTier: selection.targetTier,
                targetRankIndex: selection.targetRankIndex,
                isMaxAffordable: selection.isMax
            }, btnConfirm);
            if (!response.result?.success) throw new Error(response.result?.error || 'Targeted rank up failed');
            completed = true;
            showToast(`Targeted Rank Up Complete! Reached Tier ${response.result.newPrestigeCount} at ${response.result.newRankName}`, 'success');
            addLogEntry(`Targeted Rank Up executed: Spent ${formatMoney(response.result.totalCost)} to reach Tier ${response.result.newPrestigeCount} at Rank ${response.result.newRank} - ${response.result.newRankName}.`, 'rare');
            renderAll();
            renderRankPrestige();
            closeModal();
        } catch (error) {
            showToast(error.message || 'Targeted rank up failed', 'error');
        } finally {
            if (!completed) void updateModalPreview();
        }
    });
};
