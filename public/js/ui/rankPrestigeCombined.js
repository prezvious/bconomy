// Rank & Ascension Combined UI Renderer and Modal Manager
import { getState, getRankData, getPerkData } from '../state.js';
import { formatDisplayNumber, formatMoney } from '../utils.js';
import { apiCall, doUpgradePerk, doRankUp } from '../api.js';
import { renderHeader, renderAll } from './header.js';
import { showToast } from './toast.js';
import { showConfirmation, openDialog, closeDialog } from './modal.js';
import { addLogEntry } from './log.js';

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

    if (nextRankInfo) {
        if (nextRankNameEl) nextRankNameEl.textContent = `Rank ${curRankIndex + 2} - ${nextRankInfo.name}`;
        
        const cronyismLevel = Math.min(25, (playerState.perks && playerState.perks.cronyism) || 0);
        const investitureLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);
        const isGodRank = (curRankIndex + 1 === 106 || nextRankInfo.name === 'God');
        const tier = playerState.prestigeCount || 0;
        const tierMult = 1 + (Math.max(0, Math.floor(Number(tier) || 0)) * 0.05);
        let cost = nextRankInfo.basePrice * tierMult * (1 - 0.025 * cronyismLevel);
        if (isGodRank) {
            cost = cost * (1 - 0.025 * investitureLevel);
        }
        cost = Math.floor(cost);

        if (nextRankCostEl) nextRankCostEl.textContent = formatMoney(cost);
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
        if (btnPromote) {
            btnPromote.disabled = true;
            btnPromote.classList.remove('ready-highlight');
        }
    }

    // Progression Section: Single Prestige Ascension
    const btnAscend = document.getElementById('btn-rp-ascend');
    const msgAscend = document.getElementById('rp-ascend-status-msg');

    if (curRankIndex >= 106) {
        if (msgAscend) msgAscend.textContent = "You have reached peak standing (Rank 107 God) and are eligible for tier ascension.";
        if (btnAscend) {
            btnAscend.disabled = false;
            btnAscend.classList.add('ready-highlight');
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
            } else if (mode === '5') {
                countToBuy = Math.min(5, points, remaining);
            } else {
                countToBuy = 1;
            }

            if (countToBuy < 1) return;

            const targetLevel = level + countToBuy;
            const costStr = `${countToBuy} Prestige Point${countToBuy > 1 ? 's' : ''}`;

            const isBulkUpgrade = mode === '5' || mode === 'max';
            const confirmed = await showConfirmation(
                isBulkUpgrade ? 'bulkPerkUpgrade' : 'perkUpgrade',
                'Upgrade Perk?',
                `Spend ${costStr} to upgrade ${data.name} to Level ${targetLevel}?`,
                isBulkUpgrade ? {
                    bulkAction: true,
                    ignoreLabel: "Don't show this preview again"
                } : {}
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

        const canAfford1 = points >= 1 && !isMax;
        const cost5 = Math.min(5, remaining);
        const canAfford5 = points >= 1 && remaining > 1 && !isMax;
        const costMax = Math.min(points > 0 ? points : remaining, remaining);
        const canAffordMax = points >= 1 && remaining > 1 && !isMax;

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
                    <button class="action-btn primary-btn btn-perk-buy" data-perk-id="${id}" data-buy-mode="1" ${!canAfford1 ? 'disabled' : ''}>
                        +1 <span class="btn-cost-tag">(1 Pt)</span>
                    </button>
                    <button class="action-btn secondary-btn btn-perk-buy" data-perk-id="${id}" data-buy-mode="5" ${!canAfford5 ? 'disabled' : ''}>
                        +5 <span class="btn-cost-tag">(${cost5} Pts)</span>
                    </button>
                    <button class="action-btn accent-btn btn-perk-buy" data-perk-id="${id}" data-buy-mode="max" ${!canAffordMax ? 'disabled' : ''}>
                        Max <span class="btn-cost-tag">(${costMax} Pts)</span>
                    </button>
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
    const cronyismLevel = (playerState.perks && playerState.perks.cronyism) || 0;
    const investitureLevel = (playerState.perks && playerState.perks.investiture) || 0;

    let curTier = playerState.prestigeCount || 0;
    let curRank = playerState.rankIndex || 0;
    let availableCash = playerState.cash || 0;
    let totalCost = 0;

    const getCost = (rankBasePrice, isGodRank, tier = 0) => {
        const cronyism = Math.min(25, cronyismLevel);
        const tierMult = 1 + (Math.max(0, Math.floor(Number(tier) || 0)) * 0.05);
        let c = rankBasePrice * tierMult * (1 - 0.025 * cronyism);
        if (isGodRank) {
            const investiture = Math.min(25, investitureLevel);
            c = c * (1 - 0.025 * investiture);
        }
        return Math.floor(c);
    };

    if (isMaxAffordable) {
        let remainingCash = availableCash;
        while (true) {
            if (curRank === 106) {
                curRank = 0;
                curTier += 1;
                continue;
            }

            const nextIndex = curRank + 1;
            const nextRank = rankData[nextIndex];
            if (!nextRank) break;

            const isGodRank = (nextIndex === 106 || nextRank.name === 'God');
            const stepCost = getCost(nextRank.basePrice, isGodRank, curTier);

            if (remainingCash >= stepCost) {
                remainingCash -= stepCost;
                totalCost += stepCost;
                curRank = nextIndex;
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

    // Custom Target
    let remainingCash = availableCash;
    const reqTier = Math.max(curTier, parseInt(targetTier, 10) || 0);
    const reqRankIndex = Math.min(106, Math.max(0, parseInt(targetRankIndex, 10) || 0));

    if (reqTier < curTier || (reqTier === curTier && reqRankIndex <= curRank)) {
        return {
            totalCost: 0,
            targetTier: curTier,
            targetRankIndex: curRank,
            affordable: true
        };
    }

    while (curTier < reqTier || (curTier === reqTier && curRank < reqRankIndex)) {
        if (curRank === 106) {
            curRank = 0;
            curTier += 1;
            if (curTier === reqTier && reqRankIndex === 0) break;
            continue;
        }

        const nextIndex = curRank + 1;
        const nextRank = rankData[nextIndex];
        if (!nextRank) break;

        const isGodRank = (nextIndex === 106 || nextRank.name === 'God');
        const stepCost = getCost(nextRank.basePrice, isGodRank, curTier);

        totalCost += stepCost;
        remainingCash -= stepCost;
        curRank = nextIndex;
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

    const maxAffordableCheckbox = document.getElementById('targeted-max-checkbox');
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
                opt.textContent = `Rank ${idx} - ${r.name}`;
                rankSelect.appendChild(opt);
            });
        }
    };

    let currentCalculatedTarget = null;

    const updateModalPreview = () => {
        const playerState = getState();
        if (!playerState) return;

        const rankData = getRankData();
        const isMax = Boolean(maxAffordableCheckbox?.checked);

        if (isMax) {
            if (customControls) customControls.classList.add('hidden');
        } else {
            if (customControls) customControls.classList.remove('hidden');
        }

        const reqTier = isMax ? (playerState.prestigeCount || 0) : parseInt(tierInput.value, 10) || (playerState.prestigeCount || 0);
        const reqRankIndex = isMax ? (playerState.rankIndex || 0) : parseInt(rankSelect.value, 10) || 0;

        const calc = calculateTargetedCostPreview(playerState, reqTier, reqRankIndex, isMax);
        currentCalculatedTarget = calc;

        const targetRankObj = rankData[calc.targetRankIndex] || { name: 'Unknown' };

        if (promptTextEl) {
            promptTextEl.textContent = `Would you like to advance to Tier ${calc.targetTier} at Rank ${targetRankObj.name}?`;
        }

        if (costBannerEl) {
            costBannerEl.textContent = `Total Advancement Cost: ${formatMoney(calc.totalCost)}`;
        }

        if (btnConfirm) {
            btnConfirm.textContent = `Confirm (${formatMoney(calc.totalCost)})`;
            btnConfirm.disabled = !calc.affordable || (calc.totalCost === 0 && calc.targetTier === (playerState.prestigeCount || 0) && calc.targetRankIndex === (playerState.rankIndex || 0));
        }
    };

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            populateRanks();
            const playerState = getState();
            if (playerState) {
                if (tierInput) tierInput.value = playerState.prestigeCount || 0;
                if (rankSelect) rankSelect.value = playerState.rankIndex || 0;
            }
            updateModalPreview();
            openDialog(modal, {
                initialFocus: '#targeted-max-checkbox',
                closeOnBackdrop: false,
                returnFocus: btnOpen
            });
        });
    }

    const closeModal = () => {
        closeDialog(modal, { reason: 'cancel' });
    };

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    if (maxAffordableCheckbox) maxAffordableCheckbox.addEventListener('change', updateModalPreview);
    if (tierInput) tierInput.addEventListener('input', updateModalPreview);
    if (rankSelect) rankSelect.addEventListener('change', updateModalPreview);

    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            const isMax = Boolean(maxAffordableCheckbox?.checked);
            const reqTier = parseInt(tierInput.value, 10) || 0;
            const reqRankIndex = parseInt(rankSelect.value, 10) || 0;

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
