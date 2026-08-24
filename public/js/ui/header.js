// Header Renderer & Master Render Coordinator
import { getState, getRankData } from '../state.js';
import { formatMoney, formatDisplayNumber } from '../utils.js';
import { renderActions } from './actions.js';
import { renderInventory } from './inventory.js';
import { renderTools } from './tools.js';
import { renderRankPrestige } from './rankPrestigeCombined.js';
import { renderFarm } from './farm.js';
import { updateAccountHeaderUI } from './authModal.js';

export const renderHeader = () => {
    const playerState = getState();
    if (!playerState) return;

    updateAccountHeaderUI();

    const cashEl = document.getElementById('header-cash');
    if (cashEl) cashEl.textContent = formatMoney(playerState.cash);

    const rankData = getRankData();
    const rankInfo = rankData[playerState.rankIndex] || { name: 'Unknown' };
    const rankEl = document.getElementById('header-rank');
    if (rankEl) rankEl.textContent = `Rank ${playerState.rankIndex + 1} - ${rankInfo.name}`;
    const deficitEl = document.getElementById('header-rank-deficit');
    const nextRank = rankData[playerState.rankIndex + 1];
    if (deficitEl) {
        if (!nextRank) {
            deficitEl.textContent = 'Maximum rank reached';
            deficitEl.classList.add('is-ready');
        } else {
            const cronyism = Math.min(25, Number(playerState.perks?.cronyism) || 0);
            const cost = Math.floor(nextRank.basePrice * ((playerState.prestigeCount || 0) + 1) * (1 - (0.025 * cronyism)));
            const deficit = Math.max(0, cost - (playerState.cash || 0));
            deficitEl.textContent = deficit === 0 ? `Ready · ${formatMoney(cost)}` : `${formatMoney(deficit)} short`;
            deficitEl.classList.toggle('is-ready', deficit === 0);
        }
    }

    const prestigeEl = document.getElementById('header-prestige');
    if (prestigeEl) prestigeEl.textContent = formatDisplayNumber(playerState.prestigePoints);
};

export const renderAll = () => {
    const playerState = getState();
    if (!playerState) return;
    renderHeader();
    // Only render the currently active/visible panel to avoid wasteful DOM work
    const activePanel = document.querySelector('.panel.active');
    if (!activePanel) return;
    const tab = activePanel.id.replace('panel-', '');
    switch (tab) {
        case 'actions': renderActions(); break;
        case 'inventory': renderInventory(); break;
        case 'crafting': import('./crafting.js').then(m => m.renderCrafting()); break;
        case 'tools': renderTools(); break;
        case 'farm': renderFarm(); break;
        case 'rank-prestige':
        case 'rank':
        case 'prestige': renderRankPrestige(); break;
        // Lazy import to avoid circular dependency (shop.js/faction.js import renderAll from this module)
        case 'shop': import('./shop.js').then(m => m.renderShop()); break;
        case 'faction': import('./faction.js').then(m => m.renderFaction()); break;
        case 'gambling': import('./gambling.js').then(m => m.renderGambling()); break;
    }
};
