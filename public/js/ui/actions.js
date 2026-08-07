// Actions Panel Renderer
import { getState } from '../state.js';
import { ACTIONS, iconHtml } from '../utils.js';
import { doAction } from '../api.js';
import { renderHeader } from './header.js';
import { renderInventory } from './inventory.js';
import { addLogEntry } from './log.js';
import { showToast } from './toast.js';

export const getToolMultiplier = (level) => {
    return (1 + 11 * Math.pow((level - 1) / 49, 1.25)).toFixed(2) + 'x';
};

export const renderActions = () => {
    const playerState = getState();
    if (!playerState) return;

    const grid = document.getElementById('actions-grid');
    if (!grid) return;
    grid.innerHTML = '';

    ACTIONS.forEach(act => {
        const card = document.createElement('div');
        card.className = 'action-card card';
        card.dataset.action = act.id;

        const toolLevel = act.id !== 'work' ? (playerState.tools ? playerState.tools[act.id] : 1) : null;
        const levelBadge = toolLevel ? `<span class="action-level">Lv.${toolLevel} (${getToolMultiplier(toolLevel)})</span>` : '';

        card.innerHTML = `
            <div class="action-header">
                <div class="action-title">
                    <div class="action-icon-well">${iconHtml(act.icon, 'action-icon')}</div>
                    ${act.name}
                </div>
                ${levelBadge}
            </div>
            <div class="action-cooldown-info">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" id="cd-bar-${act.id}" style="width: 0%; background-color: var(--action-${act.id})"></div>
                </div>
                <div class="cooldown-text" id="cd-text-${act.id}" role="status">Ready!</div>
            </div>
            <button class="action-btn btn-action btn-large" id="btn-act-${act.id}" style="background-color: var(--action-${act.id})">Dispatch ${act.name}</button>
            <pre class="action-result" id="res-${act.id}"></pre>
        `;

        grid.appendChild(card);

        document.getElementById(`btn-act-${act.id}`).addEventListener('click', async (e) => {
            await handleAction(act.id, e.currentTarget);
        });
    });
};

const handleAction = async (type, btnEl) => {
    try {
        const res = await doAction(type, btnEl);
        const formattedText = res.result ? (res.result.formattedText || '') : '';

        const resElem = document.getElementById(`res-${type}`);
        if (resElem) {
            resElem.textContent = formattedText;
        }

        if (res.result) {
            addLogEntry(formattedText, res.result.amnesiacTriggered ? 'rare' : (res.result.bonusTriggered ? 'bonus' : 'success'));
        }

        renderHeader();
        renderInventory();
    } catch (e) {
        addLogEntry(`[${type.toUpperCase()}] Failed: ${e.message}`, "error");
        showToast(`[${type.toUpperCase()}] Action failed: ${e.message}`, 'error');
    }
};
