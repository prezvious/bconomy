// Prestige Panel Renderer
import { getState, getPerkData } from '../state.js';
import { formatNumberCommas, formatMoney } from '../utils.js';
import { doUpgradePerk } from '../api.js';
import { renderHeader } from './header.js';
import { showToast } from './toast.js';
import { showConfirmation } from './modal.js';

export const renderPrestige = () => {
    const playerState = getState();
    if (!playerState) return;

    const countEl = document.getElementById('prestige-count-display');
    if (countEl) countEl.textContent = formatNumberCommas(playerState.prestigeCount);

    const pointsEl = document.getElementById('prestige-points-display');
    if (pointsEl) pointsEl.textContent = formatNumberCommas(playerState.prestigePoints);

    const btnAscend = document.getElementById('btn-ascend');
    const msgAscend = document.getElementById('ascend-status-msg');
    const costContainer = document.getElementById('ascend-cost-container');

    if (playerState.rankIndex >= 106) {
        if (msgAscend) msgAscend.textContent = "You have reached peak standing and are ready to ascend.";

        const invLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);
        let cost = Math.floor(250000000 * (1 - 0.025 * invLevel));

        if (costContainer) costContainer.classList.remove('hidden');
        const costEl = document.getElementById('ascend-cost');
        if (costEl) costEl.textContent = formatMoney(cost);

        if (btnAscend) {
            btnAscend.disabled = playerState.cash < cost;
            if (playerState.cash >= cost) {
                btnAscend.classList.add('ready-highlight');
            } else {
                btnAscend.classList.remove('ready-highlight');
            }
        }
    } else {
        if (msgAscend) msgAscend.textContent = "Reach Rank 107 (God) to ascend";
        if (costContainer) costContainer.classList.add('hidden');
        if (btnAscend) {
            btnAscend.disabled = true;
            btnAscend.classList.remove('ready-highlight');
        }
    }

    const grid = document.getElementById('perks-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const perkData = getPerkData();

    Object.entries(perkData).forEach(([id, data]) => {
        const level = (playerState.perks && playerState.perks[id]) || 0;
        const maxLevel = data.maxLevel || 0;
        const isMax = level >= maxLevel;
        const canAfford = playerState.prestigePoints > 0 && !isMax;

        const isComingSoon = ['backchannel', 'numismatist'].includes(id);

        const card = document.createElement('div');
        card.className = `perk-card card ${canAfford ? 'affordable' : ''}`;

        const effectStr = data.formula ? `${data.formula}` : '';

        if (isComingSoon) {
            card.innerHTML = `
                <div class="perk-header">
                    <h4>${data.name}</h4>
                    <span class="perk-level">Lv.${level}/${maxLevel}</span>
                </div>
                <p class="perk-effect">${data.description}</p>
                <p class="perk-formula">${effectStr}</p>
                <button class="action-btn ${canAfford ? 'primary-btn' : 'secondary-btn'} btn-large" id="btn-perk-${id}" ${!canAfford ? 'disabled' : ''}>
                    ${isMax ? 'MAXED' : 'Upgrade (1 Point)'}
                </button>
                <div class="coming-soon-badge">(Coming Soon)</div>
            `;
        } else {
            card.innerHTML = `
                <div class="perk-header">
                    <h4>${data.name}</h4>
                    <span class="perk-level">Lv.${level}/${maxLevel}</span>
                </div>
                <p class="perk-effect">${data.description}</p>
                <p class="perk-formula">${effectStr}</p>
                <button class="action-btn ${canAfford ? 'primary-btn' : 'secondary-btn'} btn-large" id="btn-perk-${id}" ${!canAfford ? 'disabled' : ''}>
                    ${isMax ? 'MAXED' : 'Upgrade (1 Point)'}
                </button>
            `;
        }

        grid.appendChild(card);

        if (canAfford) {
            const perkBtn = document.getElementById(`btn-perk-${id}`);
            if (perkBtn) {
                perkBtn.addEventListener('click', async (e) => {
                    const confirmed = await showConfirmation(
                        'perkUpgrade',
                        'Upgrade Perk?',
                        `Spend 1 Prestige Point to upgrade ${data.name} to Level ${level + 1}?`
                    );
                    if (!confirmed) return;

                    try {
                        await doUpgradePerk(id, e.currentTarget);
                        showToast(`Upgraded ${data.name}!`, 'success');
                        renderPrestige();
                        renderHeader();
                    } catch (err) {
                        showToast(err.message || `Failed to upgrade perk ${data.name}`, 'error');
                    }
                });
            }
        }
    });
};
