// Rank & Ascension Combined UI Renderer and Modal Manager
import { getState, getRankData, getPerkData } from '../state.js';
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
    const curRankIndex = playerState.rankIndex || 0;
    const rankInfo = rankData[curRankIndex] || { name: 'Unknown', basePrice: 0 };
    const maxRankIndex = rankData.length > 0 ? rankData.length - 1 : 106;

    // Overview Elements
    const curRankEl = document.getElementById('rp-current-rank-display');
    if (curRankEl) curRankEl.textContent = `Rank ${curRankIndex + 1} - ${rankInfo.name}`;

    const progressFill = document.getElementById('rp-rank-progress-fill');
    if (progressFill) progressFill.style.width = `${(curRankIndex / maxRankIndex) * 100}%`;

    const progressText = document.getElementById('rp-rank-progress-text');
    if (progressText) progressText.textContent = `${curRankIndex} / ${maxRankIndex}`;

    const tierEl = document.getElementById('rp-tier-display');
    if (tierEl) tierEl.textContent = `Tier ${playerState.prestigeCount || 0}`;

    const pointsEl = document.getElementById('rp-prestige-points-display');
    if (pointsEl) pointsEl.textContent = formatDisplayNumber(playerState.prestigePoints || 0);

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

    const curTier = playerState.prestigeCount || 0;
    const investitureLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);
    const ascensionCost = curTier === 0 ? 0 : Math.floor(550000000 * (curTier + 2) * (1 - 0.025 * investitureLevel));

    if (ascendCostEl) {
        ascendCostEl.textContent = ascensionCost === 0 ? '$0 (Free)' : formatMoney(ascensionCost);
    }

    const isGod = curRankIndex >= 106;
    const canAffordAscension = playerState.cash >= ascensionCost;

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
    const current = Math.max(0, Math.floor(Number(state.prestigePoints) || 0));
    if (horizon === 'current') return current;
    if (horizon === 'next') return current + 5;
    if (mode === 'targetTier') return current + (Math.max(0, Math.floor(value) - (state.prestigeCount || 0)) * 5);
    if (mode === 'custom') return Math.max(current, Math.floor(Number(value) || current));
    return current + (Math.max(0, Math.floor(Number(value) || settings.futureAscensions || 5)) * 5);
};

const formatEffect = (perkId, value) => {
    if (perkId === 'cronyism' || perkId === 'investiture' || perkId === 'amnesiac') return `${(value * 100).toFixed(1)}%`;
    if (perkId === 'numismatist') return formatMoney(value);
    return `${Number(value).toFixed(2)}×`;
};

const updateSimulatorPreview = async () => {
    const root = document.getElementById('prestige-simulator');
    if (!root || !simulatorTargets) return;
    const settings = getStoredSettings().prestigeSimulator;
    const horizon = root.querySelector('#sim-horizon')?.value || settings.defaultHorizon;
    const futureMode = root.querySelector('#sim-future-mode')?.value || settings.futureBudgetMode;
    const futureValue = root.querySelector('#sim-future-value')?.value;
    const budget = simulatorBudget(getState(), settings, horizon, futureMode, futureValue);
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
    const state = getState();
    if (!root || !state) return;
    const perkData = getPerkData();
    const settings = getStoredSettings().prestigeSimulator;
    if (!simulatorTargets) simulatorTargets = Object.fromEntries(SIMULATOR_PERKS.map(id => [id, Number(state.perks?.[id]) || 0]));
    for (const id of SIMULATOR_PERKS) simulatorTargets[id] = Math.max(Number(state.perks?.[id]) || 0, Math.min(perkData[id]?.maxLevel || 0, simulatorTargets[id] || 0));
    const canAscend = (state.rankIndex || 0) >= 106 && (state.cash || 0) >= (state.prestigeCount === 0 ? 0 : Math.floor(550000000 * ((state.prestigeCount || 0) + 2) * (1 - 0.025 * Math.min(25, state.perks?.investiture || 0))));
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
            const current = Number(state.perks?.[id]) || 0;
            const max = perkData[id]?.maxLevel || current;
            return `<label class="sim-perk-card"><span><strong>${perkData[id]?.name || id}</strong><small>Current ${current} · Max ${max}</small></span><input type="number" name="sim-perk-${id}" inputmode="numeric" autocomplete="off" min="${current}" max="${max}" value="${simulatorTargets[id]}" data-sim-perk="${id}"></label>`;
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
        simulatorTargets = Object.fromEntries(SIMULATOR_PERKS.map(id => [id, Number(getState().perks?.[id]) || 0]));
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

            const playerState = getState();
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

    const playerState = getState();
    const perkData = getPerkData();
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

// Client-side targeted rank up calculation preview
const calculateTargetedCostPreview = (playerState, targetTier, targetRankIndex, isMaxAffordable) => {
    const rankData = getRankData();
    const cronyismLevel = Math.min(25, (playerState.perks && playerState.perks.cronyism) || 0);
    const investitureLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);

    let curTier = Math.max(0, Math.floor(Number(playerState.prestigeCount) || 0));
    let curRank = Math.min(106, Math.max(0, Math.floor(Number(playerState.rankIndex) || 0)));
    let availableCash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(playerState.cash) || 0)));

    const getRankCost = (rankBasePrice, tier = 0) => {
        const cronyism = Math.min(25, cronyismLevel);
        const tierMult = tier + 1;
        return Math.floor(rankBasePrice * tierMult * (1 - 0.025 * cronyism));
    };

    const getAscendCost = (tier = 0) => {
        if (tier === 0) return 0;
        const investiture = Math.min(25, investitureLevel);
        return Math.floor(550000000 * (tier + 2) * (1 - 0.025 * investiture));
    };

    const getSliceCost = (fromRankExcl, toRankIncl, tier) => {
        let cost = 0;
        for (let r = fromRankExcl + 1; r <= toRankIncl; r++) {
            const rInfo = rankData[r];
            if (!rInfo) break;
            cost += getRankCost(rInfo.basePrice, tier);
        }
        return cost;
    };

    const getTierCost = (tier) => {
        return getSliceCost(0, 106, tier) + getAscendCost(tier);
    };

    const fullTier1Cost = getTierCost(1);
    const fullTier2Cost = getTierCost(2);
    const tierSlope = fullTier2Cost - fullTier1Cost;

    if (isMaxAffordable) {
        let remainingCash = availableCash;
        let totalCost = 0;

        // Step 1: Finish current tier if not at God
        if (curRank < 106) {
            const costToFinishRanks = getSliceCost(curRank, 106, curTier);
            if (remainingCash < costToFinishRanks) {
                for (let r = curRank + 1; r <= 106; r++) {
                    const rInfo = rankData[r];
                    if (!rInfo) break;
                    const c = getRankCost(rInfo.basePrice, curTier);
                    if (remainingCash >= c) {
                        remainingCash -= c;
                        totalCost += c;
                        curRank = r;
                    } else {
                        break;
                    }
                }
                return {
                    totalCost,
                    targetTier: curTier,
                    targetRankIndex: curRank,
                    affordable: true
                };
            }

            const ascendCost = getAscendCost(curTier);
            if (remainingCash < costToFinishRanks + ascendCost) {
                remainingCash -= costToFinishRanks;
                totalCost += costToFinishRanks;
                curRank = 106;
                return {
                    totalCost,
                    targetTier: curTier,
                    targetRankIndex: curRank,
                    affordable: true
                };
            }

            remainingCash -= (costToFinishRanks + ascendCost);
            totalCost += (costToFinishRanks + ascendCost);
            curTier += 1;
            curRank = 0;
        } else {
            const ascendCost = getAscendCost(curTier);
            if (remainingCash >= ascendCost) {
                remainingCash -= ascendCost;
                totalCost += ascendCost;
                curTier += 1;
                curRank = 0;
            } else {
                return {
                    totalCost: 0,
                    targetTier: curTier,
                    targetRankIndex: curRank,
                    affordable: true
                };
            }
        }

        // Step 2: Leap whole tiers
        if (curTier === 0 && remainingCash > 0) {
            const costTier0 = getTierCost(0);
            if (remainingCash >= costTier0) {
                remainingCash -= costTier0;
                totalCost += costTier0;
                curTier = 1;
            }
        }

        if (remainingCash > 0 && curTier >= 1 && tierSlope > 0) {
            const costCurTier = getTierCost(curTier);
            const a = tierSlope / 2;
            const b = costCurTier - a;
            const c = -remainingCash;
            const discriminant = b * b - 4 * a * c;
            let estN = 0;
            if (discriminant >= 0) {
                estN = Math.max(0, Math.floor((-b + Math.sqrt(discriminant)) / (2 * a)));
            }

            const computeExactNTiersCost = (n) => {
                let sum = 0;
                for (let t = 0; t < n; t++) {
                    sum += getTierCost(curTier + t);
                }
                return sum;
            };

            let exactCostEst = computeExactNTiersCost(estN);
            while (estN > 0 && exactCostEst > remainingCash) {
                estN--;
                exactCostEst -= getTierCost(curTier + estN);
            }
            while (true) {
                const nextCost = getTierCost(curTier + estN);
                if (exactCostEst + nextCost <= remainingCash) {
                    exactCostEst += nextCost;
                    estN++;
                } else {
                    break;
                }
            }

            remainingCash -= exactCostEst;
            totalCost += exactCostEst;
            curTier += estN;
        }

        // Step 3: Buy remaining individual ranks in final tier
        for (let r = 1; r <= 106; r++) {
            const rInfo = rankData[r];
            if (!rInfo) break;
            const c = getRankCost(rInfo.basePrice, curTier);
            if (remainingCash >= c) {
                remainingCash -= c;
                totalCost += c;
                curRank = r;
            } else {
                break;
            }
        }

        if (curRank === 106) {
            const ascendCost = getAscendCost(curTier);
            if (remainingCash >= ascendCost) {
                remainingCash -= ascendCost;
                totalCost += ascendCost;
                curTier += 1;
                curRank = 0;
            }
        }

        return {
            totalCost,
            targetTier: curTier,
            targetRankIndex: curRank,
            affordable: true
        };
    }

    // Custom Target
    const reqTier = Math.max(0, parseInt(targetTier, 10) || 0);
    const reqRankIndex = Math.min(106, Math.max(0, parseInt(targetRankIndex, 10) || 0));

    if (reqTier < curTier || (reqTier === curTier && reqRankIndex <= curRank)) {
        return {
            totalCost: 0,
            targetTier: curTier,
            targetRankIndex: curRank,
            affordable: true
        };
    }

    let totalCost = 0;
    if (reqTier === curTier) {
        totalCost = getSliceCost(curRank, reqRankIndex, curTier);
    } else {
        // 1. Finish current tier ranks AND ascend to curTier + 1
        totalCost += getSliceCost(curRank, 106, curTier);
        totalCost += getAscendCost(curTier);

        // 2. Middle full tiers
        for (let t = curTier + 1; t < reqTier; t++) {
            totalCost += getTierCost(t);
        }

        // 3. Final tier ranks
        totalCost += getSliceCost(0, reqRankIndex, reqTier);
    }

    return {
        totalCost,
        targetTier: reqTier,
        targetRankIndex: reqRankIndex,
        affordable: availableCash >= totalCost
    };
};

// Targeted Rank Up Modal Manager
export const setupTargetedModal = () => {
    const modal = document.getElementById('targeted-rankup-modal');
    const btnOpen = document.getElementById('btn-open-targeted-modal');
    const btnClose = document.getElementById('btn-close-targeted-modal');
    const btnCancel = document.getElementById('btn-targeted-cancel');
    const btnConfirm = document.getElementById('btn-targeted-confirm');

    const modeInputs = [...document.querySelectorAll('input[name="targeted-rank-mode"]')];
    const customControls = document.getElementById('targeted-custom-controls');
    const tierInput = document.getElementById('targeted-tier-input');
    const rankSelect = document.getElementById('targeted-rank-select');

    const promptTextEl = document.getElementById('targeted-prompt-text');
    const costBannerEl = document.getElementById('targeted-cost-banner');

    if (!modal) return;

    // Populate Rank Dropdown once
    const populateRanks = () => {
        if (rankSelect && rankSelect.children.length === 0) {
            const ranks = getRankData();
            ranks.forEach((r, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = `Rank ${r.index || (idx + 1)} - ${r.name}`;
                rankSelect.appendChild(opt);
            });
        }
    };

    let previewRequestId = 0;
    const updateModalPreview = async () => {
        const playerState = getState();
        if (!playerState) return;

        const rankData = getRankData();
        const mode = modeInputs.find(input => input.checked)?.value || 'next';
        const isMax = mode === 'max';

        customControls?.classList.toggle('hidden', mode !== 'custom');

        const reqTier = mode === 'custom' ? (parseInt(tierInput.value, 10) || (playerState.prestigeCount || 0)) : (playerState.prestigeCount || 0);
        const reqRankIndex = mode === 'next' ? Math.min(rankData.length - 1, (playerState.rankIndex || 0) + 1)
            : mode === 'custom' ? (parseInt(rankSelect.value, 10) || 0) : (playerState.rankIndex || 0);

        const requestId = ++previewRequestId;
        if (costBannerEl) costBannerEl.textContent = 'Calculating authoritative cost…';
        if (btnConfirm) btnConfirm.disabled = true;
        let calc;
        try {
            calc = await doPreviewRankTarget(reqTier, reqRankIndex, isMax);
        } catch (error) {
            if (requestId === previewRequestId && costBannerEl) costBannerEl.textContent = error.message || 'Unable to calculate advancement';
            return;
        }
        if (requestId !== previewRequestId) return;
        const targetRankObj = rankData[calc.targetRankIndex] || { name: 'Unknown' };

        if (promptTextEl) {
            promptTextEl.textContent = `Would you like to advance to Tier ${calc.targetTier} at Rank ${calc.targetRankIndex + 1} (${targetRankObj.name})?`;
        }

        if (costBannerEl) {
            costBannerEl.textContent = `Total Advancement Cost: ${formatMoney(calc.totalCost)}`;
        }

        if (btnConfirm) {
            btnConfirm.textContent = `Confirm (${formatMoney(calc.totalCost)})`;
            btnConfirm.disabled = !calc.affordable || (calc.totalCost === 0 && calc.targetTier === (playerState.prestigeCount || 0) && calc.targetRankIndex === (playerState.rankIndex || 0));
        }
    };

    const openTargetedModal = () => {
            populateRanks();
            const playerState = getState();
            if (playerState) {
                if (tierInput) tierInput.value = playerState.prestigeCount || 0;
                if (rankSelect) rankSelect.value = playerState.rankIndex || 0;
            }
            void updateModalPreview();
            openDialog(modal, {
                initialFocus: 'input[name="targeted-rank-mode"]:checked',
                closeOnBackdrop: false,
                returnFocus: btnOpen
            });
    };
    if (btnOpen) btnOpen.addEventListener('click', openTargetedModal);
    document.getElementById('header-rank-tracker')?.addEventListener('click', openTargetedModal);

    const closeModal = () => {
        closeDialog(modal, { reason: 'cancel' });
    };

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    modeInputs.forEach(input => input.addEventListener('change', () => void updateModalPreview()));
    if (tierInput) tierInput.addEventListener('input', () => void updateModalPreview());
    if (rankSelect) rankSelect.addEventListener('change', () => void updateModalPreview());

    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            const playerState = getState();
            const mode = modeInputs.find(input => input.checked)?.value || 'next';
            const isMax = mode === 'max';
            const reqTier = mode === 'custom' ? (parseInt(tierInput.value, 10) || 0) : (playerState.prestigeCount || 0);
            const reqRankIndex = mode === 'next' ? Math.min(getRankData().length - 1, (playerState.rankIndex || 0) + 1)
                : mode === 'custom' ? (parseInt(rankSelect.value, 10) || 0) : (playerState.rankIndex || 0);

            try {
                btnConfirm.disabled = true;
                const res = await apiCall('/api/prestige/targeted-rank-up', 'POST', {
                    targetTier: reqTier,
                    targetRankIndex: reqRankIndex,
                    isMaxAffordable: isMax
                }, btnConfirm);

                if (res.result && res.result.success) {
                    showToast(`Targeted Rank Up Complete! Reached Tier ${res.result.newPrestigeCount} at ${res.result.newRankName}`, 'success');
                    addLogEntry(`Targeted Rank Up executed: Spent ${formatMoney(res.result.totalCost)} to reach Tier ${res.result.newPrestigeCount} at Rank ${res.result.newRank} - ${res.result.newRankName}.`, 'rare');
                    renderAll();
                    renderRankPrestige();
                    closeModal();
                } else {
                    showToast((res.result && res.result.error) || 'Targeted rank up failed', 'error');
                }
            } catch (err) {
                showToast(err.message || 'Targeted rank up failed', 'error');
            } finally {
                btnConfirm.disabled = false;
            }
        });
    }
};
