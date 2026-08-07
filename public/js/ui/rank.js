// Rank Panel Renderer
import { getState, getRankData } from '../state.js';
import { formatMoney } from '../utils.js';

export const renderRank = () => {
    const playerState = getState();
    if (!playerState) return;

    const rankData = getRankData();
    const rankInfo = rankData[playerState.rankIndex] || { name: 'Unknown', basePrice: 0 };
    const curRankEl = document.getElementById('current-rank-display');
    if (curRankEl) curRankEl.textContent = `Rank ${playerState.rankIndex} - ${rankInfo.name}`;

    const maxRankIndex = rankData.length > 0 ? rankData.length - 1 : 106;
    const progressFill = document.getElementById('rank-progress-fill');
    if (progressFill) progressFill.style.width = `${(playerState.rankIndex / maxRankIndex) * 100}%`;

    const progressText = document.getElementById('rank-progress-text');
    if (progressText) progressText.textContent = `${playerState.rankIndex} / ${maxRankIndex}`;

    const nextRankInfo = rankData[playerState.rankIndex + 1];
    const btn = document.getElementById('btn-rank-up');

    if (nextRankInfo) {
        const nextRankNameEl = document.getElementById('next-rank-name');
        if (nextRankNameEl) nextRankNameEl.textContent = `Rank ${playerState.rankIndex + 1} - ${nextRankInfo.name}`;

        const cronyismLevel = Math.min(25, (playerState.perks && playerState.perks.cronyism) || 0);
        let cost = Math.floor(nextRankInfo.basePrice * (1 - 0.025 * cronyismLevel));

        const nextRankCostEl = document.getElementById('next-rank-cost');
        if (nextRankCostEl) nextRankCostEl.textContent = formatMoney(cost);

        if (btn) {
            btn.disabled = playerState.cash < cost;
            if (playerState.cash >= cost) {
                btn.classList.add('ready-highlight');
            } else {
                btn.classList.remove('ready-highlight');
            }
        }
    } else {
        const nextRankNameEl = document.getElementById('next-rank-name');
        if (nextRankNameEl) nextRankNameEl.textContent = "MAX RANK REACHED";

        const nextRankCostEl = document.getElementById('next-rank-cost');
        if (nextRankCostEl) nextRankCostEl.textContent = "N/A";

        if (btn) {
            btn.disabled = true;
            btn.classList.remove('ready-highlight');
        }
    }
};
