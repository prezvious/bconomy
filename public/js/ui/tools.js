// Tools Workshop Renderer
import { getState, getToolRecipes, setToolRecipe } from '../state.js';
import { TOOLS, ACTIONS, iconHtml, formatNumberCommas, displayItemName } from '../utils.js';
import { apiCall, doUpgradeTool } from '../api.js';
import { getToolMultiplier, renderActions } from './actions.js';
import { renderHeader } from './header.js';
import { renderInventory } from './inventory.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { showConfirmation } from './modal.js';

export const updateAllToolRecipes = async () => {
    const playerState = getState();
    if (!playerState || !playerState.tools) return;
    for (const type of TOOLS) {
        const level = playerState.tools[type] || 1;
        if (level < 50) {
            try {
                const recipe = await apiCall(`/api/data/tools/${type}/recipe/${level + 1}`, 'GET');
                setToolRecipe(type, recipe);
            } catch (e) {
                console.error(`Failed to load recipe for ${type} level ${level + 1}`);
            }
        }
    }
};

export const renderTools = () => {
    const playerState = getState();
    if (!playerState) return;

    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const toolRecipes = getToolRecipes();

    TOOLS.forEach(type => {
        const level = playerState.tools ? (playerState.tools[type] || 1) : 1;
        const recipe = toolRecipes[type];
        const isMax = level >= 50;

        const card = document.createElement('div');
        card.className = 'tool-card card';

        let reqsHTML = '';
        let canUpgrade = !isMax;

        if (isMax) {
            reqsHTML = `<div class="req-item sufficient"><span class="req-item-left">${iconHtml('lucide:check-circle', 'req-icon')} MAX LEVEL REACHED</span></div>`;
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
                        <span class="tabular-nums">${formatNumberCommas(owned)} / ${formatNumberCommas(req.quantity)}</span>
                    </div>
                `;
            }
        } else {
            reqsHTML = '<div class="req-item">Loading recipe...</div>';
            canUpgrade = false;
        }

        const actionInfo = ACTIONS.find(a => a.id === type) || { name: type, icon: 'lucide:wrench' };

        card.innerHTML = `
            <div class="tool-header">
                <div class="tool-title-row">
                    <div class="tool-icon-well">${iconHtml(actionInfo.icon, 'tool-icon')}</div>
                    <div class="tool-title">${actionInfo.name} Tool</div>
                </div>
                <div class="tool-multiplier">Lv.${level} (${getToolMultiplier(level)})</div>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill progress-accent" style="width: ${(level / 50) * 100}%"></div>
            </div>
            <div class="reqs-list">
                ${reqsHTML}
            </div>
            <button class="action-btn secondary-btn btn-large" id="btn-upg-${type}" ${!canUpgrade ? 'disabled' : ''}>
                Upgrade Tool
            </button>
        `;

        grid.appendChild(card);

        if (canUpgrade) {
            const upgBtn = document.getElementById(`btn-upg-${type}`);
            if (upgBtn) {
                upgBtn.addEventListener('click', async (e) => {
                    const confirmAction = await showConfirmation(
                        'toolUpgrade',
                        'Upgrade Tool?',
                        `Are you sure you want to upgrade your ${actionInfo.name} tool to Level ${level + 1}? Required materials will be consumed.`
                    );
                    if (!confirmAction) return;

                    try {
                        await doUpgradeTool(type, e.currentTarget);
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
        }
    });
};
