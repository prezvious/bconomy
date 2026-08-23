import { getState } from '../state.js';
import { ACTIONS, BOOSTER_TIERS, BOOSTER_NAME_MAP, iconHtml, formatDurationMs, formatTimestampDate } from '../utils.js';
import { doAction } from '../api.js';
import { renderHeader } from './header.js';
import { renderInventory } from './inventory.js';
import { addLogEntry } from './log.js';
import { showToast } from './toast.js';

let expandedGroups = new Set(['mine', 'explore', 'hunt', 'fish']); // default expanded
let isMenuOpen = false;
let currentOutsideClickHandler = null;

export const getToolMultiplier = (level) => {
    if (!level || level <= 1) return '1.00x';
    if (level <= 50) {
        return (1 + 11 * Math.pow((level - 1) / 49, 1.25)).toFixed(2) + 'x';
    }
    return (12 + 0.90 * Math.pow(level - 50, 1.35)).toFixed(2) + 'x';
};

export const getToolCooldownReduction = (level) => {
    if (level < 300) return 0;
    return Math.min(60, 5 + Math.floor((level - 300) / 16) * 5);
};

export const getUnlockedSockets = (level) => {
    return Math.min(10, Math.floor(level / 50));
};

export const renderActions = () => {
    const playerState = getState();
    if (!playerState) return;

    const panelActions = document.getElementById('panel-actions');
    if (!panelActions) return;

    const grid = document.getElementById('actions-grid');
    if (!grid) return;
    grid.innerHTML = '';

    ACTIONS.forEach(act => {
        const strip = document.createElement('div');
        const isWork = act.id === 'work';
        strip.className = `action-strip card ${isWork ? 'action-strip--work' : ''}`;
        strip.dataset.action = act.id;

        if (isWork) {
            const shift = playerState.workShift || { currentStreak: 0, lastWorkAt: 0, streakExpireAt: 0 };
            const streak = shift.currentStreak || 0;
            const bonusPercent = streak * 1;
            strip.innerHTML = `
                <div class="strip-identity">
                    <div class="strip-icon-well">${iconHtml(act.icon, 'strip-icon')}</div>
                    <div class="strip-name-wrap">
                        <span class="strip-name">${act.name}</span>
                        <div class="work-streak-badge ${streak > 0 ? 'streak-active' : ''}" id="work-streak-badge" title="Work Shift Streak: Maintain shifts within 45m after cooldown for +1% pay per shift (up to +20%)">
                            ${iconHtml('lucide:flame', 'streak-flame-icon')}
                            <span class="streak-count-text">${streak}/20 (+${bonusPercent}% Pay)</span>
                        </div>
                    </div>
                </div>
                <div class="strip-cooldown">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="cd-bar-${act.id}" style="width: 0%; background-color: var(--action-${act.id})"></div>
                    </div>
                    <div class="cooldown-meta">
                        <span class="cooldown-text" id="cd-text-${act.id}" role="status">Ready!</span>
                        <span class="work-streak-timer ${streak > 0 ? '' : 'hidden'}" id="work-streak-timer"></span>
                    </div>
                </div>
                <button class="action-btn strip-dispatch-btn" id="btn-act-${act.id}" style="background-color: var(--action-${act.id})">${act.name}</button>
            `;
        } else {
            strip.innerHTML = `
                <div class="strip-identity">
                    <div class="strip-icon-well">${iconHtml(act.icon, 'strip-icon')}</div>
                    <span class="strip-name">${act.name}</span>
                </div>
                <div class="strip-cooldown">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="cd-bar-${act.id}" style="width: 0%; background-color: var(--action-${act.id})"></div>
                    </div>
                    <span class="cooldown-text" id="cd-text-${act.id}" role="status">Ready!</span>
                </div>
                <button class="action-btn strip-dispatch-btn" id="btn-act-${act.id}" style="background-color: var(--action-${act.id})">${act.name}</button>
            `;
        }

        grid.appendChild(strip);

        const btn = strip.querySelector(`#btn-act-${act.id}`);
        if (btn) {
            btn.addEventListener('click', async (e) => {
                await handleAction(act.id, e.currentTarget);
            });
        }
    });

    renderActiveBoosts();
};

const handleAction = async (type, btnEl) => {
    try {
        const res = await doAction(type, btnEl);
        const formattedText = res.result ? (res.result.formattedText || '') : '';

        if (res.result) {
            addLogEntry(formattedText, res.result.amnesiacTriggered ? 'rare' : (res.result.bonusTriggered ? 'bonus' : 'success'));
        }

        renderHeader();
        renderInventory();
        renderActions();
    } catch (e) {
        addLogEntry(`[${type.toUpperCase()}] Failed: ${e.message}`, "error");
        showToast(`[${type.toUpperCase()}] Action failed: ${e.message}`, 'error');
    }
};

export const renderActiveBoosts = () => {
    const playerState = getState();
    if (!playerState) return;

    const parentContainer = document.getElementById('panel-actions');
    if (!parentContainer) return;

    let container = document.getElementById('active-boosts-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'active-boosts-container';
        container.className = 'active-boosts-section mb-6';
        parentContainer.appendChild(container);
    }

    const now = Date.now();
    const activeUntil = (playerState.boosters && playerState.boosters.activeUntil) || {};

    const activeByAction = {};
    let totalActiveCount = 0;

    const actionIcons = { mine: 'lucide:pickaxe', explore: 'lucide:compass', fish: 'lucide:fish', hunt: 'lucide:crosshair' };
    const actionNames = { mine: 'Mine', explore: 'Explore', fish: 'Fish', hunt: 'Hunt' };

    ['mine', 'explore', 'hunt', 'fish'].forEach(actId => {
        const tiersObj = activeUntil[actId] || {};
        const activeTiers = [];

        Object.entries(tiersObj).forEach(([tier, expireTime]) => {
            if (typeof expireTime === 'number' && expireTime > now) {
                const tierMeta = BOOSTER_TIERS[tier] || { durationMs: 15 * 60 * 1000 };
                const nameMap = BOOSTER_NAME_MAP[actId] || {};
                const boosterName = nameMap[tier] || `${actionNames[actId]} Booster ${tier}`;
                activeTiers.push({
                    tier,
                    expireTime,
                    durationMs: tierMeta.durationMs,
                    boosterName,
                    remain: expireTime - now
                });
            }
        });

        if (activeTiers.length > 0) {
            activeTiers.sort((a, b) => a.tier.localeCompare(b.tier));
            activeByAction[actId] = activeTiers;
            totalActiveCount += activeTiers.length;
        }
    });

    if (totalActiveCount === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const currentView = localStorage.getItem('bconomy_boosts_view') || 'tree';

    let html = `
        <div class="boosts-header card charter-card">
            <div class="boosts-header-title">
                ${iconHtml('lucide:zap', 'boosts-zap-icon')}
                <h3>Active Boosts</h3>
            </div>
            <div class="boosts-menu-wrapper">
                <button class="boosts-menu-btn" id="btn-boosts-menu" type="button" aria-label="Active Boosts Menu" title="View Options">
                    ${iconHtml('lucide:menu', 'menu-icon')}
                </button>
                <div class="boosts-dropdown ${isMenuOpen ? 'show' : ''}" id="boosts-dropdown">
                    <button type="button" class="dropdown-item ${currentView === 'tree' ? 'active' : ''}" id="btn-view-tree">
                        <span class="dropdown-check">${currentView === 'tree' ? iconHtml('lucide:check') : ''}</span>
                        <span>Tree</span>
                    </button>
                    <button type="button" class="dropdown-item ${currentView === 'list' ? 'active' : ''}" id="btn-view-list">
                        <span class="dropdown-check">${currentView === 'list' ? iconHtml('lucide:check') : ''}</span>
                        <span>List</span>
                    </button>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-item" id="btn-boosts-expand">
                        ${iconHtml('lucide:chevrons-down', 'dropdown-icon')}
                        <span>Expand all</span>
                    </button>
                    <button type="button" class="dropdown-item" id="btn-boosts-collapse">
                        ${iconHtml('lucide:chevrons-up', 'dropdown-icon')}
                        <span>Collapse all</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    html += `<div class="boosts-content boosts-view-${currentView}">`;

    if (currentView === 'tree') {
        Object.entries(activeByAction).forEach(([actId, items]) => {
            const isExpanded = expandedGroups.has(actId);
            const multiplier = Math.pow(2, items.length);
            const actName = actionNames[actId] || actId;

            html += `
                <div class="boosts-group card" data-group="${actId}">
                    <button type="button" class="boosts-group-header" data-toggle-group="${actId}">
                        <div class="group-header-info">
                            ${iconHtml(actionIcons[actId], 'group-action-icon')}
                            <span class="group-action-name">${actName}</span>
                            <span class="group-multiplier-badge">${multiplier}×</span>
                        </div>
                        <span class="group-chevron ${isExpanded ? 'open' : ''}">
                            ${iconHtml('lucide:chevron-down')}
                        </span>
                    </button>
                    <div class="boosts-group-body ${isExpanded ? 'open' : ''}">
                        ${items.map(b => {
                            const pct = Math.min(100, Math.max(0, (b.remain / b.durationMs) * 100));
                            const expireDate = formatTimestampDate(b.expireTime);
                            return `
                                <div class="boost-row" data-expire="${b.expireTime}" data-duration="${b.durationMs}">
                                    <div class="boost-row-main">
                                        <span class="boost-mult">2×</span>
                                        <span class="boost-name">${b.boosterName}</span>
                                        <span class="boost-tier">${b.tier}</span>
                                        <span class="boost-timer timer-hoverable" data-expire="${b.expireTime}" title="Expires: ${expireDate}">${formatDurationMs(b.remain)}</span>
                                    </div>
                                    <div class="boost-duration-bar-bg">
                                        <div class="boost-duration-bar-fill" style="width: ${pct}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
    } else {
        Object.entries(activeByAction).forEach(([actId, items]) => {
            const actName = actionNames[actId] || actId;
            html += `
                <div class="boosts-list-group card">
                    <div class="list-group-header">
                        ${iconHtml(actionIcons[actId], 'group-action-icon')}
                        <span class="group-action-name">${actName}</span>
                    </div>
                    <div class="list-group-items">
                        ${items.map(b => {
                            const pct = Math.min(100, Math.max(0, (b.remain / b.durationMs) * 100));
                            const expireDate = formatTimestampDate(b.expireTime);
                            return `
                                <div class="boost-row" data-expire="${b.expireTime}" data-duration="${b.durationMs}">
                                    <div class="boost-row-main">
                                        <span class="boost-mult">2×</span>
                                        <span class="boost-name">${b.boosterName}</span>
                                        <span class="boost-tier">${b.tier}</span>
                                        <span class="boost-timer timer-hoverable" data-expire="${b.expireTime}" title="Expires: ${expireDate}">${formatDurationMs(b.remain)}</span>
                                    </div>
                                    <div class="boost-duration-bar-bg">
                                        <div class="boost-duration-bar-fill" style="width: ${pct}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
    }

    html += `</div>`;
    container.innerHTML = html;

    const btnMenu = container.querySelector('#btn-boosts-menu');
    if (btnMenu) {
        btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            renderActiveBoosts();
        });
    }

    if (currentOutsideClickHandler) {
        document.removeEventListener('click', currentOutsideClickHandler);
        currentOutsideClickHandler = null;
    }

    if (isMenuOpen) {
        currentOutsideClickHandler = (e) => {
            if (isMenuOpen && container && !container.contains(e.target)) {
                isMenuOpen = false;
                if (currentOutsideClickHandler) {
                    document.removeEventListener('click', currentOutsideClickHandler);
                    currentOutsideClickHandler = null;
                }
                renderActiveBoosts();
            }
        };
        setTimeout(() => {
            if (isMenuOpen && currentOutsideClickHandler) {
                document.addEventListener('click', currentOutsideClickHandler);
            }
        }, 0);
    }

    const btnTree = container.querySelector('#btn-view-tree');
    if (btnTree) {
        btnTree.addEventListener('click', () => {
            localStorage.setItem('bconomy_boosts_view', 'tree');
            isMenuOpen = false;
            renderActiveBoosts();
        });
    }

    const btnList = container.querySelector('#btn-view-list');
    if (btnList) {
        btnList.addEventListener('click', () => {
            localStorage.setItem('bconomy_boosts_view', 'list');
            isMenuOpen = false;
            renderActiveBoosts();
        });
    }

    const btnExpand = container.querySelector('#btn-boosts-expand');
    if (btnExpand) {
        btnExpand.addEventListener('click', () => {
            expandedGroups = new Set(['mine', 'explore', 'hunt', 'fish']);
            isMenuOpen = false;
            renderActiveBoosts();
        });
    }

    const btnCollapse = container.querySelector('#btn-boosts-collapse');
    if (btnCollapse) {
        btnCollapse.addEventListener('click', () => {
            expandedGroups.clear();
            isMenuOpen = false;
            renderActiveBoosts();
        });
    }

    container.querySelectorAll('[data-toggle-group]').forEach(btn => {
        btn.addEventListener('click', () => {
            const grp = btn.dataset.toggleGroup;
            if (expandedGroups.has(grp)) {
                expandedGroups.delete(grp);
            } else {
                expandedGroups.add(grp);
            }
            renderActiveBoosts();
        });
    });
};
