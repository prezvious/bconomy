// Faction System UI Renderer & Event Handlers
import { getState, setState, saveState } from '../state.js';
import { iconHtml, formatNumberCommas, formatDisplayNumber, formatMoney, formatDurationMs } from '../utils.js';
import { doFactionCreate, doFactionDeposit, doFactionActivateBoost, doFactionStopBoost, doFactionCustomize } from '../api.js';
import { renderHeader } from './header.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { openDialog, closeDialog, showConfirmation } from './modal.js';

const ACTIONS_INFO = [
    { id: 'mine', name: 'Mining', icon: 'lucide:pickaxe', color: 'var(--action-mine, #d97706)' },
    { id: 'explore', name: 'Exploring', icon: 'lucide:compass', color: 'var(--action-explore, #0d9488)' },
    { id: 'hunt', name: 'Hunting', icon: 'lucide:crosshair', color: 'var(--action-hunt, #b91c1c)' },
    { id: 'fish', name: 'Fishing', icon: 'lucide:fish', color: 'var(--action-fish, #2563eb)' },
    { id: 'work', name: 'Work', icon: 'lucide:briefcase', color: 'var(--action-work, #7c3aed)' }
];

const FACTION_CREATION_COST = 1000000;
let activeFactionTab = 'overview';

// Local state for UI controls per action
const localCardState = {
    mine: { targetLevel: 4, mode: 'duration', selectedHours: 1 },
    explore: { targetLevel: 4, mode: 'duration', selectedHours: 1 },
    hunt: { targetLevel: 4, mode: 'duration', selectedHours: 1 },
    fish: { targetLevel: 4, mode: 'duration', selectedHours: 1 },
    work: { targetLevel: 4, mode: 'duration', selectedHours: 1 }
};

/**
 * Calculates hourly FP cost matching backend formula.
 */
export const getFPCostPerHour = (level) => {
    const lvl = Math.max(0, Math.min(36, Math.floor(Number(level) || 0)));
    if (lvl === 0) return 0;
    if (lvl <= 16) {
        return Math.floor(100000 * Math.pow(lvl, 2));
    }
    const excess = lvl - 16;
    const baseAt16 = 25600000;
    const expFactor = Math.pow(1.25, excess);
    const polyFactor = 10000000 * Math.pow(excess, 2);
    return Math.floor((baseAt16 * expFactor) + polyFactor);
};

export const getFPMultiplier = (level) => {
    const lvl = Math.max(0, Math.min(36, Math.floor(Number(level) || 0)));
    return 1.0 + (lvl * 0.25);
};

export const getTierBadge = (level) => {
    if (level === 0) return { label: 'Inactive', class: 'tier-inactive' };
    if (level <= 4) return { label: 'Tier 1 Standard', class: 'tier-standard' };
    if (level <= 12) return { label: 'Tier 2 Advanced', class: 'tier-advanced' };
    if (level <= 16) return { label: '5x Threshold', class: 'tier-threshold' };
    if (level <= 24) return { label: 'Elite (5x+)', class: 'tier-elite' };
    if (level <= 32) return { label: 'Grandmaster (7x+)', class: 'tier-grandmaster' };
    return { label: 'God-Tier Sink (10x)', class: 'tier-god' };
};

export const renderFaction = ({ resetTab = false } = {}) => {
    if (resetTab) activeFactionTab = 'overview';
    const playerState = getState();
    if (!playerState) return;

    const panel = document.getElementById('panel-faction');
    if (!panel) return;

    const walletCash = playerState.cash || 0;
    const faction = playerState.faction;
    const hasFaction = faction && faction.created;

    // ── Unaffiliated Player View ──
    if (!hasFaction) {
        const canAfford = walletCash >= FACTION_CREATION_COST;
        const shortage = Math.max(0, FACTION_CREATION_COST - walletCash);
        panel.innerHTML = `
            <div class="section-header">
                <div>
                    <h2 id="panel-faction-heading">Faction</h2>
                    <p class="section-desc">Create a faction to pool funds and operate shared action boosts.</p>
                </div>
            </div>

            <section class="faction-empty-state card" aria-labelledby="faction-empty-title">
                <div class="faction-empty-icon">${iconHtml('lucide:shield-plus')}</div>
                <div class="faction-empty-copy">
                    <span class="eyebrow">No Active Faction</span>
                    <h3 id="faction-empty-title">Build a shared economy</h3>
                    <p>Factions convert cash into Faction Points and apply configurable multipliers to Mining, Exploring, Hunting, Fishing, and Work.</p>
                </div>
                <div class="faction-benefit-grid">
                    <div>${iconHtml('lucide:coins')}<strong>1:1 Treasury</strong><span>$1 cash becomes 1 FP</span></div>
                    <div>${iconHtml('lucide:zap')}<strong>5 Boost Tracks</strong><span>Scale core actions up to 10×</span></div>
                    <div>${iconHtml('lucide:timer')}<strong>Flexible Timing</strong><span>Fixed duration or continuous drain</span></div>
                </div>
                <div class="summary-rail faction-founding-summary" aria-label="Faction founding requirements">
                    <div class="summary-metric"><span class="summary-label">Creation Fee</span><strong class="summary-value">${formatMoney(FACTION_CREATION_COST)}</strong></div>
                    <div class="summary-metric"><span class="summary-label">Your Cash</span><strong class="summary-value">${formatMoney(walletCash)}</strong></div>
                    <div class="summary-metric"><span class="summary-label">Status</span><strong class="summary-value ${canAfford ? 'text-success' : 'text-danger'}">${canAfford ? 'Ready' : `${formatMoney(shortage)} short`}</strong></div>
                </div>
                <button type="button" id="btn-open-create-faction" class="action-btn primary-btn">
                    ${iconHtml('lucide:plus')} Create Faction
                </button>
            </section>
        `;

        const btnOpen = panel.querySelector('#btn-open-create-faction');
        const createDialog = document.getElementById('create-faction-modal');
        const nameInput = document.getElementById('create-faction-name');
        const descInput = document.getElementById('create-faction-description');
        const nameError = document.getElementById('create-faction-name-error');
        const readiness = document.getElementById('create-faction-readiness');
        const btnSubmit = document.getElementById('btn-create-faction-submit');
        const closeCreateDialog = () => closeDialog(createDialog, { reason: 'cancel' });

        if (btnOpen && createDialog) {
            btnOpen.onclick = () => {
                if (nameInput) nameInput.value = '';
                if (descInput) descInput.value = '';
                if (nameError) nameError.classList.add('hidden');
                if (readiness) {
                    readiness.className = `transaction-notice ${canAfford ? 'success' : 'warning'}`;
                    readiness.textContent = canAfford
                        ? `${formatMoney(FACTION_CREATION_COST)} will be charged when you confirm.`
                        : `You need ${formatMoney(shortage)} more before you can create this faction.`;
                }
                if (btnSubmit) btnSubmit.disabled = !canAfford;
                openDialog(createDialog, { initialFocus: '#create-faction-name', closeOnBackdrop: false, returnFocus: btnOpen });
            };
        }

        const closeCreateButton = document.getElementById('btn-close-create-faction');
        const cancelCreateButton = document.getElementById('btn-create-faction-cancel');
        if (closeCreateButton) closeCreateButton.onclick = closeCreateDialog;
        if (cancelCreateButton) cancelCreateButton.onclick = closeCreateDialog;
        if (btnSubmit) {
            btnSubmit.onclick = async () => {
                const name = nameInput?.value.trim() || '';
                const description = descInput?.value.trim() || '';
                if (!name) {
                    if (nameError) {
                        nameError.textContent = 'Enter a faction name to continue.';
                        nameError.classList.remove('hidden');
                    }
                    nameInput?.focus();
                    return;
                }

                closeDialog(createDialog, { reason: 'review', restoreFocus: false });
                const confirmed = await showConfirmation(
                    'createFaction',
                    'Create This Faction?',
                    `Creating “${name}” costs ${formatMoney(FACTION_CREATION_COST)} and cannot currently be undone.`,
                    { allowIgnore: false, returnFocus: btnOpen }
                );
                if (!confirmed) {
                    btnOpen?.focus();
                    return;
                }

                try {
                    const res = await doFactionCreate(name, description, btnSubmit);
                    showToast(`Faction “${res.state.faction.name}” created`, 'success');
                    addLogEntry(`Founded faction “${res.state.faction.name}” for ${formatMoney(FACTION_CREATION_COST)}.`, 'system');
                    renderHeader();
                    renderFaction({ resetTab: true });
                } catch (error) {
                    showToast(error.message || 'Faction creation failed. Review your balance and try again.', 'error');
                    btnOpen?.focus();
                }
            };
        }
        return;
    }

    // ── Active Faction Member View ──
    const fpBalance = faction.points || 0;
    const now = Date.now();
    const activeBoosts = ACTIONS_INFO.filter(action => {
        const boost = faction.boosts?.[action.id];
        return boost?.level > 0 && (boost.mode === 'continuous' ? fpBalance > 0 : boost.activeUntil > now);
    });

    let html = `
        <div class="section-header">
            <div>
                <h2 id="panel-faction-heading">Faction</h2>
                <p class="section-desc">Review faction status and manage treasury-powered operations.</p>
            </div>
        </div>
        <div class="faction-header-banner card charter-card mb-6">
            <div class="faction-identity-row">
                <div class="faction-crest-badge">
                    ${iconHtml('lucide:flag', 'faction-crest-icon')}
                </div>
                <div class="faction-identity-info">
                    <div class="faction-title-line">
                        <h2 class="faction-name" id="display-faction-name">${escapeHtml(faction.name)}</h2>
                        <span class="charter-badge faction-status-badge">Active Guild</span>
                    </div>
                    <p class="faction-motto" id="display-faction-desc">${escapeHtml(faction.description)}</p>
                </div>
                <button type="button" class="action-btn secondary-btn" id="btn-open-edit-faction">
                    ${iconHtml('lucide:edit-3', 'btn-icon')} Edit Details
                </button>
            </div>
        </div>

        <div class="faction-tabs" role="tablist" aria-label="Faction sections">
            <button id="faction-tab-overview" class="faction-tab-btn ${activeFactionTab === 'overview' ? 'active' : ''}" type="button" role="tab" tabindex="${activeFactionTab === 'overview' ? '0' : '-1'}" aria-selected="${activeFactionTab === 'overview'}" aria-controls="faction-panel-overview">Overview</button>
            <button id="faction-tab-operations" class="faction-tab-btn ${activeFactionTab === 'operations' ? 'active' : ''}" type="button" role="tab" tabindex="${activeFactionTab === 'operations' ? '0' : '-1'}" aria-selected="${activeFactionTab === 'operations'}" aria-controls="faction-panel-operations">Operations</button>
        </div>

        <section id="faction-panel-overview" class="faction-tab-panel ${activeFactionTab === 'overview' ? '' : 'hidden'}" role="tabpanel" aria-labelledby="faction-tab-overview">
            <div class="summary-rail faction-summary-rail">
                <div class="summary-metric"><span class="summary-label">Faction Points</span><strong class="summary-value" title="${formatNumberCommas(fpBalance)}">${formatDisplayNumber(fpBalance)} FP</strong></div>
                <div class="summary-metric"><span class="summary-label">Lifetime Contribution</span><strong class="summary-value" title="${formatNumberCommas(faction.lifetimeContributed || 0)}">${formatMoney(faction.lifetimeContributed || 0)}</strong></div>
                <div class="summary-metric"><span class="summary-label">Active Boosts</span><strong class="summary-value">${activeBoosts.length} / ${ACTIONS_INFO.length}</strong></div>
            </div>
            <div class="faction-overview-card card">
                <div>
                    <span class="eyebrow">Current Operations</span>
                    <h3>${activeBoosts.length ? `${activeBoosts.length} boost${activeBoosts.length === 1 ? '' : 's'} running` : 'No boosts active'}</h3>
                    <p>${activeBoosts.length ? 'Active multipliers continue until their duration ends or treasury funds are exhausted.' : 'Open Operations to fund the treasury and configure action multipliers.'}</p>
                </div>
                <div class="active-boost-summary-list">
                    ${activeBoosts.map(action => {
                        const boost = faction.boosts[action.id];
                        return `<span class="active-boost-summary">${iconHtml(action.icon)} ${action.name} ${getFPMultiplier(boost.level).toFixed(2)}×</span>`;
                    }).join('')}
                </div>
            </div>
        </section>

        <section id="faction-panel-operations" class="faction-tab-panel ${activeFactionTab === 'operations' ? '' : 'hidden'}" role="tabpanel" aria-labelledby="faction-tab-operations">

        <!-- Treasury & Point Deposit Card -->
        <div class="faction-treasury-card card charter-card mb-6">
            <div class="treasury-stats-grid">
                <div class="treasury-stat-box">
                    <span class="treasury-stat-label">Available Faction Points (FP)</span>
                    <span class="treasury-stat-value text-accent" id="treasury-fp-value" title="${formatNumberCommas(fpBalance)}">${formatDisplayNumber(fpBalance)} FP</span>
                    <span class="treasury-stat-sub">1 FP = $1.00 Liquid Cash (1:1 Parity)</span>
                </div>
                <div class="treasury-stat-box">
                    <span class="treasury-stat-label">Lifetime Guild Contribution</span>
                    <span class="treasury-stat-value" id="treasury-lifetime-value">${formatMoney(faction.lifetimeContributed || 0)}</span>
                    <span class="treasury-stat-sub">Total cash converted to guild power</span>
                </div>
            </div>

            <div class="treasury-deposit-section mt-4">
                <h4 class="card-title-sm mb-2">
                    ${iconHtml('lucide:plus-circle', 'mr-1')} Deposit Cash to Treasury
                </h4>
                <div class="deposit-preset-row mb-3">
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="100000">+${formatMoney(100000)}</button>
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="1000000">+${formatMoney(1000000)}</button>
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="10000000">+${formatMoney(10000000)}</button>
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="100000000">+${formatMoney(100000000)}</button>
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="1000000000">+${formatMoney(1000000000)}</button>
                    <button type="button" class="preset-chip btn-deposit-preset" data-amount="max">All Cash (${formatMoney(walletCash)})</button>
                </div>
                <div class="deposit-input-row">
                    <div class="deposit-input-wrapper">
                        <input type="text" id="faction-deposit-input" name="faction-deposit" class="form-input" autocomplete="off" placeholder="Enter cash amount…">
                        <span id="faction-deposit-preview" class="deposit-preview-badge">0 FP</span>
                    </div>
                    <button type="button" id="btn-faction-deposit-submit" class="action-btn primary-btn">
                        ${iconHtml('lucide:arrow-down-to-dot', 'btn-icon')} Deposit
                    </button>
                </div>
            </div>
        </div>

        <!-- 5 Action Multipliers Matrix -->
        <div class="faction-boosters-header mb-3">
            <h3 class="section-title">
                ${iconHtml('lucide:zap', 'text-accent mr-2')} Faction Multipliers
            </h3>
            <p class="text-subtle">Scale yields and payouts across all 5 core actions. Costs scale progressively per hour.</p>
        </div>

        <div class="faction-boosters-grid" id="faction-boosters-grid">
    `;

    ACTIONS_INFO.forEach(act => {
        const boost = (faction.boosts && faction.boosts[act.id]) || { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', costPerHour: 0 };
        const isCurrentlyActive = (boost.level > 0) && (boost.mode === 'continuous' ? fpBalance > 0 : boost.activeUntil > now);
        const activeMult = isCurrentlyActive ? getFPMultiplier(boost.level) : 1.0;
        
        const local = localCardState[act.id] || { targetLevel: 4, mode: 'duration', selectedPreset: '1', selectedHours: 1 };
        if (!local.selectedPreset) {
            local.selectedPreset = local.selectedHours ? String(local.selectedHours) : '1';
        }
        const targetLvl = local.targetLevel;
        const targetMult = getFPMultiplier(targetLvl);
        const hourlyCost = getFPCostPerHour(targetLvl);
        const tier = getTierBadge(targetLvl);

        const effectiveHours = local.selectedPreset === 'max'
            ? (hourlyCost > 0 ? Math.max(1, Math.floor(fpBalance / hourlyCost)) : 24)
            : (parseInt(local.selectedPreset, 10) || 1);
        local.selectedHours = effectiveHours;

        const durationCost = Math.floor(effectiveHours * hourlyCost);
        const canAffordDuration = fpBalance >= durationCost;
        const canAffordContinuous = fpBalance >= hourlyCost;

        let remainMs = 0;
        if (isCurrentlyActive) {
            if (boost.mode === 'continuous') {
                const totalRemainHours = boost.costPerHour > 0 ? (fpBalance / boost.costPerHour) : 0;
                remainMs = Math.floor(totalRemainHours * 3600 * 1000);
            } else {
                remainMs = Math.max(0, boost.activeUntil - now);
            }
        }

        html += `
            <div class="faction-boost-card card charter-card ${isCurrentlyActive ? 'boost-active' : ''}" data-action="${act.id}" style="--action-accent: ${act.color}">
                <div class="boost-card-header">
                    <div class="boost-header-left">
                        <div class="boost-action-icon-wrap" style="color: ${act.color}">
                            ${iconHtml(act.icon, 'boost-action-icon')}
                        </div>
                        <div>
                            <h4 class="boost-action-title">${act.name}</h4>
                            <span class="boost-type-sub">${act.id === 'work' ? 'Cash Payout Boost' : 'Loot Multiplier'}</span>
                        </div>
                    </div>
                    <div class="boost-header-right">
                        <span class="current-multiplier-badge ${isCurrentlyActive ? 'active' : ''}">
                            ${activeMult.toFixed(2)}× Active
                        </span>
                    </div>
                </div>

                ${isCurrentlyActive ? `
                    <div class="active-status-bar mb-3">
                        <div class="active-status-info">
                            <span class="active-pulse-dot"></span>
                            <span class="active-level-tag">Lv.${boost.level} (${getFPMultiplier(boost.level).toFixed(2)}×)</span>
                            <span class="active-mode-tag">${boost.mode === 'continuous' ? 'Continuous Drain' : 'Fixed Duration'}</span>
                            <span class="active-timer-val" id="faction-timer-${act.id}">${formatDurationMs(remainMs)}</span>
                        </div>
                        <div class="active-rate-sub">
                            Rate: -${formatDisplayNumber(boost.costPerHour)} FP/hr
                        </div>
                    </div>
                ` : ''}

                <!-- Configuration & Level Slider -->
                <div class="boost-config-section">
                    <div class="slider-header-row">
                        <label class="form-label mb-0" for="slider-${act.id}">Target Multiplier:</label>
                        <div class="slider-badge-wrap">
                            <span class="multiplier-preview-val">${targetMult.toFixed(2)}×</span>
                            <span class="tier-pill ${tier.class}">${tier.label}</span>
                        </div>
                    </div>

                    <div class="slider-control-row mb-3">
                        <input type="range" class="faction-level-slider" id="slider-${act.id}" data-action="${act.id}" min="1" max="36" step="1" value="${targetLvl}">
                        <div class="slider-scale-ticks">
                            <span>1.25×</span>
                            <span>3.0×</span>
                            <span class="tick-5x">5.0×</span>
                            <span>7.5×</span>
                            <span class="tick-10x">10.0×</span>
                        </div>
                    </div>

                    <div class="cost-estimate-banner mb-3 ${targetLvl >= 16 ? 'cost-steep' : ''}">
                        <div class="cost-rate-row">
                            <span class="cost-rate-label">Hourly FP Rate:</span>
                            <span class="cost-rate-val">${formatDisplayNumber(hourlyCost)} FP/hr</span>
                        </div>
                        <span class="cost-cash-equiv">(${formatMoney(hourlyCost)}/hr cash value)</span>
                    </div>

                    <!-- Mode Selector (Only visible when boost is inactive) -->
                    ${!isCurrentlyActive ? `
                        <div class="mode-toggle-row mb-3">
                            <button type="button" class="mode-toggle-btn ${local.mode === 'duration' ? 'active' : ''}" data-action="${act.id}" data-mode="duration">
                                ${iconHtml('lucide:clock', 'mr-1')} Fixed Duration
                            </button>
                            <button type="button" class="mode-toggle-btn ${local.mode === 'continuous' ? 'active' : ''}" data-action="${act.id}" data-mode="continuous">
                                ${iconHtml('lucide:activity', 'mr-1')} Continuous Drain
                            </button>
                        </div>
                    ` : ''}

                    ${(isCurrentlyActive ? boost.mode === 'duration' : local.mode === 'duration') ? `
                        <div class="duration-selector-row mb-3">
                            <button type="button" class="duration-btn ${local.selectedPreset === '1' ? 'selected' : ''}" data-action="${act.id}" data-preset="1">${isCurrentlyActive ? '+1h' : '1h'}</button>
                            <button type="button" class="duration-btn ${local.selectedPreset === '2' ? 'selected' : ''}" data-action="${act.id}" data-preset="2">${isCurrentlyActive ? '+2h' : '2h'}</button>
                            <button type="button" class="duration-btn ${local.selectedPreset === '4' ? 'selected' : ''}" data-action="${act.id}" data-preset="4">${isCurrentlyActive ? '+4h' : '4h'}</button>
                            <button type="button" class="duration-btn ${local.selectedPreset === '8' ? 'selected' : ''}" data-action="${act.id}" data-preset="8">${isCurrentlyActive ? '+8h' : '8h'}</button>
                            <button type="button" class="duration-btn ${local.selectedPreset === '24' ? 'selected' : ''}" data-action="${act.id}" data-preset="24">${isCurrentlyActive ? '+24h' : '24h'}</button>
                            <button type="button" class="duration-btn ${local.selectedPreset === 'max' ? 'selected' : ''}" data-action="${act.id}" data-preset="max" title="Max affordable duration (${effectiveHours}h)">Max</button>
                        </div>
                        <div class="duration-cost-summary mb-3">
                            <span>Cost: <strong>${formatDisplayNumber(durationCost)} FP</strong> <span class="duration-hours">(${formatDisplayNumber(effectiveHours)}h)</span></span>
                            <span class="${canAffordDuration ? 'text-success' : 'text-danger'}">
                                ${canAffordDuration ? '✓ Sufficient FP' : '✗ Need More FP'}
                            </span>
                        </div>
                    ` : `
                        <div class="continuous-info-banner mb-3">
                            <span class="text-subtle">${isCurrentlyActive ? 'Draining live from treasury. Adjust level and save changes below.' : 'Auto-drains from treasury. Stops automatically if FP reaches 0.'}</span>
                            <span class="mt-1 ${canAffordContinuous ? 'text-success' : 'text-danger'}">
                                Current FP covers ~${hourlyCost > 0 ? `${formatDisplayNumber(Math.floor(fpBalance / hourlyCost))} hrs` : '0 hrs'} at ${targetMult.toFixed(2)}×
                            </span>
                        </div>
                    `}

                    <!-- Action Controls -->
                    <div class="boost-card-actions">
                        <button type="button" class="action-btn primary-btn btn-activate-boost" data-action="${act.id}" ${(!canAffordDuration && (isCurrentlyActive ? boost.mode === 'duration' : local.mode === 'duration')) || (!canAffordContinuous && (isCurrentlyActive ? boost.mode === 'continuous' : local.mode === 'continuous')) ? 'disabled' : ''}>
                            ${isCurrentlyActive ? (boost.mode === 'duration' ? `Extend (+${effectiveHours}h)` : `Save Level (${targetMult.toFixed(2)}×)`) : `Activate ${targetMult.toFixed(2)}× (${effectiveHours}h)`}
                        </button>
                        ${isCurrentlyActive ? `
                            <button type="button" class="action-btn danger-btn btn-stop-boost" data-action="${act.id}">
                                ${iconHtml('lucide:power-off', 'mr-1')} Stop
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div></section>`;
    panel.innerHTML = html;

    attachFactionEventListeners();
};

const attachFactionEventListeners = () => {
    const panel = document.getElementById('panel-faction');
    if (!panel) return;

    const overviewTab = panel.querySelector('#faction-tab-overview');
    const operationsTab = panel.querySelector('#faction-tab-operations');
    const switchFactionTab = tab => {
        activeFactionTab = tab;
        const isOverview = tab === 'overview';
        overviewTab?.classList.toggle('active', isOverview);
        operationsTab?.classList.toggle('active', !isOverview);
        overviewTab?.setAttribute('aria-selected', String(isOverview));
        operationsTab?.setAttribute('aria-selected', String(!isOverview));
        overviewTab?.setAttribute('tabindex', isOverview ? '0' : '-1');
        operationsTab?.setAttribute('tabindex', isOverview ? '-1' : '0');
        panel.querySelector('#faction-panel-overview')?.classList.toggle('hidden', !isOverview);
        panel.querySelector('#faction-panel-operations')?.classList.toggle('hidden', isOverview);
    };
    overviewTab?.addEventListener('click', () => switchFactionTab('overview'));
    operationsTab?.addEventListener('click', () => switchFactionTab('operations'));
    [overviewTab, operationsTab].filter(Boolean).forEach((tab, index, tabs) => {
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            tabs[targetIndex].focus();
            tabs[targetIndex].click();
        });
    });

    // 1. Edit Faction Details Modal
    const btnOpenEdit = panel.querySelector('#btn-open-edit-faction');
    const modal = document.getElementById('edit-faction-modal');
    const btnCloseModal = document.getElementById('btn-close-faction-modal');
    const btnCancelModal = document.getElementById('btn-faction-modal-cancel');
    const btnSaveModal = document.getElementById('btn-faction-modal-save');
    const nameInput = document.getElementById('faction-name-input');
    const descInput = document.getElementById('faction-desc-input');

    if (btnOpenEdit && modal) {
        btnOpenEdit.addEventListener('click', () => {
            const playerState = getState();
            const faction = (playerState && playerState.faction) || {};
            if (nameInput) nameInput.value = faction.name || '';
            if (descInput) descInput.value = faction.description || '';
            openDialog(modal, {
                initialFocus: '#faction-name-input',
                closeOnBackdrop: false,
                returnFocus: btnOpenEdit
            });
        });
    }

    const closeModal = () => {
        closeDialog(modal, { reason: 'cancel' });
    };

    if (btnCloseModal) btnCloseModal.onclick = closeModal;
    if (btnCancelModal) btnCancelModal.onclick = closeModal;

    if (btnSaveModal) {
        btnSaveModal.onclick = async (e) => {
            const name = nameInput ? nameInput.value.trim() : '';
            const desc = descInput ? descInput.value.trim() : '';
            if (!name) {
                showToast('Faction name cannot be empty', 'error');
                return;
            }
            try {
                await doFactionCustomize(name, desc, e.currentTarget);
                showToast('Faction details updated!', 'success');
                closeModal();
                renderFaction();
            } catch (err) {
                showToast(err.message || 'Failed to update details', 'error');
            }
        };
    }

    // 2. Deposit Cash Handlers
    const depositInput = panel.querySelector('#faction-deposit-input');
    const depositPreview = panel.querySelector('#faction-deposit-preview');
    const btnDepositSubmit = panel.querySelector('#btn-faction-deposit-submit');

    const updateDepositPreview = () => {
        if (!depositInput || !depositPreview) return;
        const playerState = getState();
        const cash = (playerState && playerState.cash) || 0;
        const raw = depositInput.value.trim().toLowerCase();
        let val = 0;
        if (raw === 'max' || raw === 'all') {
            val = cash;
        } else if (raw.endsWith('k')) {
            val = parseFloat(raw) * 1000;
        } else if (raw.endsWith('m')) {
            val = parseFloat(raw) * 1000000;
        } else if (raw.endsWith('b')) {
            val = parseFloat(raw) * 1000000000;
        } else {
            val = parseFloat(raw.replace(/,/g, ''));
        }
        val = Math.max(0, Math.floor(isNaN(val) ? 0 : val));
        depositPreview.textContent = `${formatDisplayNumber(val)} FP`;
        depositPreview.title = `${formatNumberCommas(val)} FP`;
    };

    if (depositInput) {
        depositInput.addEventListener('input', updateDepositPreview);
    }

    panel.querySelectorAll('.btn-deposit-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const playerState = getState();
            const cash = (playerState && playerState.cash) || 0;
            const amt = btn.dataset.amount;
            if (amt === 'max') {
                if (depositInput) depositInput.value = formatNumberCommas(cash);
            } else {
                if (depositInput) depositInput.value = formatNumberCommas(parseInt(amt, 10));
            }
            updateDepositPreview();
        });
    });

    if (btnDepositSubmit) {
        btnDepositSubmit.addEventListener('click', async (e) => {
            const raw = depositInput ? depositInput.value.trim().toLowerCase() : '';
            const playerState = getState();
            const cash = (playerState && playerState.cash) || 0;
            let val = 0;
            if (raw === 'max' || raw === 'all') {
                val = cash;
            } else if (raw.endsWith('k')) {
                val = parseFloat(raw) * 1000;
            } else if (raw.endsWith('m')) {
                val = parseFloat(raw) * 1000000;
            } else if (raw.endsWith('b')) {
                val = parseFloat(raw) * 1000000000;
            } else {
                val = parseFloat(raw.replace(/,/g, ''));
            }
            val = Math.max(0, Math.floor(isNaN(val) ? 0 : val));

            if (val <= 0) {
                showToast('Please enter a valid deposit amount', 'error');
                return;
            }

            try {
                const res = await doFactionDeposit(val, e.currentTarget);
                showToast(`Deposited ${formatMoney(val)} into Faction Treasury (+${formatDisplayNumber(val)} FP)!`, 'success');
                addLogEntry(`Deposited ${formatMoney(val)} into Faction Treasury. New Balance: ${formatDisplayNumber(res.state.faction.points)} FP.`, 'system');
                if (depositInput) depositInput.value = '';
                updateDepositPreview();
                renderHeader();
                renderFaction();
            } catch (err) {
                showToast(err.message || 'Deposit failed', 'error');
            }
        });
    }

    // 3. Multiplier Slider Changes
    panel.querySelectorAll('.faction-level-slider').forEach(slider => {
        slider.addEventListener('input', () => {
            const actId = slider.dataset.action;
            const lvl = parseInt(slider.value, 10);
            if (!localCardState[actId]) localCardState[actId] = { targetLevel: 4, mode: 'duration', selectedPreset: '1', selectedHours: 1 };
            localCardState[actId].targetLevel = lvl;
            const card = slider.closest('.faction-boost-card');
            const multiplier = getFPMultiplier(lvl);
            const hourlyCost = getFPCostPerHour(lvl);
            const tier = getTierBadge(lvl);
            const multiplierEl = card?.querySelector('.multiplier-preview-val');
            const tierEl = card?.querySelector('.tier-pill');
            const rateEl = card?.querySelector('.cost-rate-val');
            const cashRateEl = card?.querySelector('.cost-cash-equiv');
            if (multiplierEl) multiplierEl.textContent = `${multiplier.toFixed(2)}×`;
            if (tierEl) {
                tierEl.className = `tier-pill ${tier.class}`;
                tierEl.textContent = tier.label;
            }
            if (rateEl) rateEl.textContent = `${formatDisplayNumber(hourlyCost)} FP/hr`;
            if (cashRateEl) cashRateEl.textContent = `(${formatMoney(hourlyCost)}/hr cash value)`;
        });
        slider.addEventListener('change', () => {
            renderFaction();
        });
    });

    // 4. Mode Toggle Buttons
    panel.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const actId = btn.dataset.action;
            const mode = btn.dataset.mode;
            if (!localCardState[actId]) localCardState[actId] = { targetLevel: 4, mode: 'duration', selectedHours: 1 };
            localCardState[actId].mode = mode;
            renderFaction();
        });
    });

    // 5. Duration Preset Buttons
    panel.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const actId = btn.dataset.action;
            const preset = btn.dataset.preset;
            if (!localCardState[actId]) localCardState[actId] = { targetLevel: 4, mode: 'duration', selectedPreset: '1', selectedHours: 1 };
            localCardState[actId].selectedPreset = preset;
            renderFaction();
        });
    });

    // 6. Activate / Extend Boost Handlers
    panel.querySelectorAll('.btn-activate-boost').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const actId = btn.dataset.action;
            const playerState = getState();
            const faction = playerState && playerState.faction;
            const boost = faction && faction.boosts && faction.boosts[actId];
            const isCurrentlyActive = boost && boost.level > 0 && (boost.mode === 'continuous' ? (faction.points || 0) > 0 : boost.activeUntil > Date.now());

            const local = localCardState[actId] || { targetLevel: 4, mode: 'duration', selectedHours: 1 };
            const lvl = local.targetLevel;
            const mode = isCurrentlyActive ? boost.mode : local.mode;
            const hours = local.selectedHours || 1;

            try {
                const res = await doFactionActivateBoost(actId, lvl, hours, mode, e.currentTarget);
                const mult = getFPMultiplier(lvl).toFixed(2);
                if (isCurrentlyActive) {
                    showToast(mode === 'continuous' ? `Updated ${actId.toUpperCase()} to ${mult}× Continuous Level!` : `Extended ${actId.toUpperCase()} ${mult}× by ${hours}h!`, 'success');
                } else {
                    showToast(`Activated ${mult}× Faction Boost for ${actId.toUpperCase()}!`, 'success');
                }
                addLogEntry(`Activated/Updated ${mult}× Faction Multiplier for ${actId.toUpperCase()} (${mode === 'duration' ? `${hours}h duration` : 'continuous drain'}).`, 'system');
                renderHeader();
                renderFaction();
            } catch (err) {
                showToast(err.message || 'Failed to activate boost', 'error');
            }
        });
    });

    // 7. Stop Boost Handlers
    panel.querySelectorAll('.btn-stop-boost').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const actId = btn.dataset.action;
            try {
                await doFactionStopBoost(actId, e.currentTarget);
                showToast(`Stopped Faction Boost for ${actId.toUpperCase()}.`, 'info');
                addLogEntry(`Deactivated Faction Multiplier for ${actId.toUpperCase()}.`, 'system');
                renderHeader();
                renderFaction();
            } catch (err) {
                showToast(err.message || 'Failed to stop boost', 'error');
            }
        });
    });
};

const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
