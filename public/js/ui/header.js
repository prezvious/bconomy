// Header Renderer & Master Render Coordinator
import { getState, getRankData } from '../state.js';
import { formatMoney, formatNumberCommas } from '../utils.js';
import { renderActions } from './actions.js';
import { renderInventory } from './inventory.js';
import { renderTools } from './tools.js';
import { renderRank } from './rank.js';
import { renderPrestige } from './prestige.js';
import { renderFarm } from './farm.js';

export const renderHeader = () => {
    const playerState = getState();
    if (!playerState) return;

    const cashEl = document.getElementById('header-cash');
    if (cashEl) cashEl.textContent = formatMoney(playerState.cash);

    const rankData = getRankData();
    const rankInfo = rankData[playerState.rankIndex] || { name: 'Unknown' };
    const rankEl = document.getElementById('header-rank');
    if (rankEl) rankEl.textContent = `Rank ${playerState.rankIndex} - ${rankInfo.name}`;

    const prestigeEl = document.getElementById('header-prestige');
    if (prestigeEl) prestigeEl.textContent = formatNumberCommas(playerState.prestigePoints);
};

export const renderAll = () => {
    const playerState = getState();
    if (!playerState) return;
    renderHeader();
    renderActions();
    renderInventory();
    renderTools();
    renderRank();
    renderPrestige();
    renderFarm();
};
