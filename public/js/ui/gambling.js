/**
 * @module ui/gambling
 * Renders and manages the inline Gambling page (Coinflip & Slots games)
 */
import { getState, saveState } from '../state.js';
import { apiCall } from '../api.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { renderHeader } from './header.js';
import { formatDisplayNumber, formatMoney } from '../utils.js';

let activeGame = 'coinflip'; // 'coinflip' | 'slots'

// Coinflip state
let activeMode = 'standard'; // 'standard' | 'streak'
let activeChoice = 'heads'; // 'heads' | 'tails'
let activeStreakState = null; // { currentPool: 0, streakCount: 0 }
let lastCoinflipResult = null;
let isCoinflipCollapsed = false;

// Slots state
let lastSlotsResult = null;
let activeFreeSpinState = null; // { remainingSpins: 0, initialWager: 0 }
let isSlotsCollapsed = false;

const STREAK_STORAGE_KEY = 'bconomy_streak_state';
const FREESPIN_STORAGE_KEY = 'bconomy_freespin_state';

function saveGamblingState() {
    try {
        if (activeStreakState) {
            localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(activeStreakState));
        } else {
            localStorage.removeItem(STREAK_STORAGE_KEY);
        }
        if (activeFreeSpinState) {
            localStorage.setItem(FREESPIN_STORAGE_KEY, JSON.stringify(activeFreeSpinState));
        } else {
            localStorage.removeItem(FREESPIN_STORAGE_KEY);
        }
    } catch (e) { /* ignore storage errors */ }
}

function loadGamblingState() {
    try {
        const streakStr = localStorage.getItem(STREAK_STORAGE_KEY);
        if (streakStr) activeStreakState = JSON.parse(streakStr);
        const freeStr = localStorage.getItem(FREESPIN_STORAGE_KEY);
        if (freeStr) activeFreeSpinState = JSON.parse(freeStr);
    } catch (e) { /* ignore parse errors */ }
}

// Base limit constants
const BASE_BET_LIMIT = 1000000000;
const BET_LIMIT_PER_NUMISMATIST = 5000000000;

function getMaxBetLimit(numismatistLevel = 0) {
    const level = Math.max(0, Math.floor(Number(numismatistLevel) || 0));
    return BASE_BET_LIMIT + level * BET_LIMIT_PER_NUMISMATIST;
}

let stateLoaded = false;
export function renderGambling() {
    if (!stateLoaded) {
        loadGamblingState();
        stateLoaded = true;
    }
    const panel = document.getElementById('panel-gambling');
    if (!panel) return;

    const state = getState();
    const numismatistLevel = state.perks?.numismatist || 0;
    const jackpotFeverLevel = state.perks?.jackpot_fever || 0;
    const maxBetLimit = getMaxBetLimit(numismatistLevel);

    const gameSwitcherHtml = `
        <div class="section-header gambling-header">
            <div>
                <h2>Gambling Hub</h2>
                <p class="section-desc">High-stakes wagering (${formatMoney(maxBetLimit)} max bet). High Roller Perk level ${formatDisplayNumber(jackpotFeverLevel)} (+${formatDisplayNumber(jackpotFeverLevel * 5)}% Slot Win Boost).</p>
            </div>
            <div class="primary-game-switcher">
                <button class="game-tab-btn ${activeGame === 'coinflip' ? 'active' : ''}" data-game="coinflip" type="button">
                    <iconify-icon icon="lucide:coins"></iconify-icon> Coinflip
                </button>
                <button class="game-tab-btn ${activeGame === 'slots' ? 'active' : ''}" data-game="slots" type="button">
                    <iconify-icon icon="lucide:dices"></iconify-icon> Slots
                </button>
            </div>
        </div>
    `;

    if (activeGame === 'coinflip') {
        panel.innerHTML = `
            <div class="gambling-page-container">
                ${gameSwitcherHtml}
                ${renderCoinflipContent(state, maxBetLimit)}
            </div>
        `;
    } else {
        panel.innerHTML = `
            <div class="gambling-page-container">
                ${gameSwitcherHtml}
                ${renderSlotsContent(state, maxBetLimit)}
            </div>
        `;
    }

    attachGamblingListeners();
}

function renderCoinflipContent(state, maxBetLimit) {
    let resultBannerHtml = '';
    if (lastCoinflipResult) {
        if (lastCoinflipResult.isWin) {
            const headlineText = lastCoinflipResult.mode === 'streak'
                ? `Streak Pool: ${formatDisplayNumber(lastCoinflipResult.currentPool || 0)} BC!`
                : `Won ${formatDisplayNumber(lastCoinflipResult.payout || 0)} BC!`;

            const outcomeText = lastCoinflipResult.isCritical
                ? `Golden Critical Flip! You flipped <strong>${lastCoinflipResult.outcome?.toUpperCase()}</strong>!`
                : `You flipped <strong>${lastCoinflipResult.outcome?.toUpperCase()}</strong>!`;

            resultBannerHtml = `
                <div class="coinflip-result-card win-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="lucide:party-popper" class="result-party-icon"></iconify-icon>
                            <h3 class="result-title">${headlineText}</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-coinflip-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <div class="result-main-info">
                            <p class="result-outcome-line">${outcomeText}</p>
                            <span class="result-sub-detail">Multiplier: ${lastCoinflipResult.multiplier}x | Choice: ${lastCoinflipResult.choice?.toUpperCase()}</span>
                        </div>
                        <div class="result-right-graphic">
                            <iconify-icon icon="lucide:clover" class="clover-icon" aria-hidden="true"></iconify-icon>
                        </div>
                    </div>
                </div>
            `;
        } else if (lastCoinflipResult.action === 'cash_out') {
            resultBannerHtml = `
                <div class="coinflip-result-card cashout-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="lucide:coins" class="result-party-icon"></iconify-icon>
                            <h3 class="result-title">Cashed Out ${formatDisplayNumber(lastCoinflipResult.payout || 0)} BC!</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-coinflip-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <p class="result-outcome-line">Streak Winnings collected to cash. Final Streak: <strong>${lastCoinflipResult.streakCount}x</strong></p>
                    </div>
                </div>
            `;
        } else {
            resultBannerHtml = `
                <div class="coinflip-result-card loss-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="lucide:circle-x" class="result-loss-icon"></iconify-icon>
                            <h3 class="result-title">Lost ${formatDisplayNumber(lastCoinflipResult.wager || 0)} BC</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-coinflip-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <p class="result-outcome-line">You flipped <strong>${lastCoinflipResult.outcome?.toUpperCase()}</strong> (Pick was ${lastCoinflipResult.choice?.toUpperCase()})</p>
                    </div>
                </div>
            `;
        }
    }

    const streakControlHtml = (activeMode === 'streak' && activeStreakState && activeStreakState.currentPool > 0) ? `
        <div class="streak-active-bar">
            <div class="streak-info">
                <span class="streak-badge">Active Streak: ${activeStreakState.streakCount}x</span>
                <span class="streak-pool">Current Pool: ${formatDisplayNumber(activeStreakState.currentPool)} BC</span>
            </div>
            <div class="streak-actions">
                <button id="btn-streak-cashout" class="gambling-btn cashout-btn" type="button">
                    <iconify-icon icon="lucide:coins"></iconify-icon> Cash Out Winnings
                </button>
                <button id="btn-streak-double" class="gambling-btn double-down-btn" type="button">
                    <iconify-icon icon="lucide:flame"></iconify-icon> Double Down!
                </button>
            </div>
        </div>
    ` : '';

    return `
        <div class="sub-mode-header">
            <div class="mode-switcher-group">
                <button class="mode-btn ${activeMode === 'standard' ? 'active' : ''}" data-mode="standard" type="button">Standard Flip</button>
                <button class="mode-btn ${activeMode === 'streak' ? 'active' : ''}" data-mode="streak" type="button">Streak Double-Down</button>
            </div>
        </div>

        ${resultBannerHtml}

        <div class="coinflip-box ${isCoinflipCollapsed ? 'collapsed' : ''}">
            <div class="coinflip-box-header">
                <div class="coinflip-title-row" id="coinflip-title-toggle" role="button" aria-expanded="${!isCoinflipCollapsed}">
                    <iconify-icon icon="lucide:coins" class="coinflip-header-icon"></iconify-icon>
                    <h3 class="coinflip-box-title">Flip a Coin</h3>
                    <iconify-icon icon="lucide:chevron-down" class="dropdown-chevron ${isCoinflipCollapsed ? 'rotated' : ''}"></iconify-icon>
                </div>
                <div class="side-picker">
                    <button class="side-btn ${activeChoice === 'heads' ? 'selected' : ''}" data-side="heads" type="button">Heads</button>
                    <button class="side-btn ${activeChoice === 'tails' ? 'selected' : ''}" data-side="tails" type="button">Tails</button>
                </div>
            </div>

            ${streakControlHtml}

            <div class="coinflip-input-section" id="coinflip-input-section" style="${isCoinflipCollapsed ? 'display: none;' : ''}">
                <div class="input-action-row">
                    <div class="input-wrapper">
                        <input 
                            id="coinflip-wager-input" 
                            class="wager-input" 
                            type="text" 
                            placeholder="Enter amount (15, 50%, 2k*2, max, 100k-owned...)" 
                            value="${lastCoinflipResult?.mode === 'streak' && activeStreakState?.currentPool ? activeStreakState.currentPool : ''}" 
                        />
                    </div>
                    <button id="btn-execute-flip" class="flip-execute-btn" type="button">
                        <iconify-icon icon="lucide:coins" class="flip-btn-icon"></iconify-icon>
                        <span>${activeMode === 'streak' && activeStreakState?.currentPool > 0 ? 'Double Down' : 'Flip'}</span>
                    </button>
                </div>

                <div class="quick-pct-buttons">
                    <button class="pct-btn" data-pct="5" type="button">5%</button>
                    <button class="pct-btn" data-pct="25" type="button">25%</button>
                    <button class="pct-btn" data-pct="45" type="button">45%</button>
                    <button class="pct-btn" data-pct="100" type="button">100%</button>
                </div>
            </div>
        </div>
    `;
}

function renderSlotsContent(state, maxBetLimit) {
    let resultBannerHtml = '';
    if (lastSlotsResult) {
        if (lastSlotsResult.isScatterTrigger) {
            resultBannerHtml = `
                <div class="coinflip-result-card win-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="lucide:zap" class="result-party-icon"></iconify-icon>
                            <h3 class="result-title">OVERCHARGE CATALYST TRIPLE MATCH!</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-slots-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <p class="result-outcome-line">Triggered <strong>5 FREE SPINS</strong>! Spin payouts doubled during free spins!</p>
                    </div>
                </div>
            `;
        } else if (lastSlotsResult.isWin) {
            const headlineText = lastSlotsResult.isJackpot
                ? `GRAND JACKPOT! Won ${formatDisplayNumber(lastSlotsResult.payout || 0)} BC!`
                : `Won ${formatDisplayNumber(lastSlotsResult.payout || 0)} BC!`;

            resultBannerHtml = `
                <div class="coinflip-result-card win-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="${lastSlotsResult.isJackpot ? 'lucide:crown' : 'lucide:sparkles'}" class="result-party-icon"></iconify-icon>
                            <h3 class="result-title">${headlineText}</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-slots-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <div class="result-main-info">
                            <p class="result-outcome-line">${lastSlotsResult.message}</p>
                            <span class="result-sub-detail">Multiplier: ${lastSlotsResult.multiplier}x ${lastSlotsResult.itemDrop ? `| Bonus Drop: +1 ${lastSlotsResult.itemDrop}` : ''}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultBannerHtml = `
                <div class="coinflip-result-card loss-banner">
                    <div class="result-card-header">
                        <div class="result-title-group">
                            <iconify-icon icon="lucide:circle-x" class="result-loss-icon"></iconify-icon>
                            <h3 class="result-title">No Match</h3>
                        </div>
                        <button class="close-res-btn" id="btn-close-slots-res" type="button" aria-label="Dismiss">✕</button>
                    </div>
                    <div class="result-card-body">
                        <p class="result-outcome-line">Better luck on the next spin!</p>
                    </div>
                </div>
            `;
        }
    }

    const freeSpinBarHtml = (activeFreeSpinState && activeFreeSpinState.remainingSpins > 0) ? `
        <div class="free-spins-active-bar">
            <div class="free-spin-info">
                <iconify-icon icon="lucide:zap" class="zap-icon"></iconify-icon>
                <span class="free-spin-badge">FREE SPINS ACTIVE: ${activeFreeSpinState.remainingSpins} LEFT</span>
                <span class="free-spin-sub">Payouts doubled (2.0x bonus)</span>
            </div>
        </div>
    ` : '';

    const currentReels = lastSlotsResult?.reels || [
        { icon: 'lucide:wheat', name: 'Golden Harvest' },
        { icon: 'lucide:gem', name: 'Astral Gem' },
        { icon: 'lucide:crown', name: 'Sovereignty Crown' }
    ];

    const isFreeSpinActive = activeFreeSpinState && activeFreeSpinState.remainingSpins > 0;

    return `
        ${resultBannerHtml}

        <div class="coinflip-box ${isSlotsCollapsed ? 'collapsed' : ''}">
            <div class="coinflip-box-header">
                <div class="coinflip-title-row" id="slots-title-toggle" role="button" aria-expanded="${!isSlotsCollapsed}">
                    <iconify-icon icon="lucide:dices" class="coinflip-header-icon"></iconify-icon>
                    <h3 class="coinflip-box-title">Bconomy Reels</h3>
                    <iconify-icon icon="lucide:chevron-down" class="dropdown-chevron ${isSlotsCollapsed ? 'rotated' : ''}"></iconify-icon>
                </div>
            </div>

            ${freeSpinBarHtml}

            <div class="slots-reel-container">
                <div class="slots-reel-grid">
                    <div class="reel-symbol-cell">
                        <iconify-icon icon="${currentReels[0].icon}" class="reel-symbol-icon"></iconify-icon>
                        <span class="reel-symbol-name">${currentReels[0].name}</span>
                    </div>
                    <div class="reel-symbol-cell">
                        <iconify-icon icon="${currentReels[1].icon}" class="reel-symbol-icon"></iconify-icon>
                        <span class="reel-symbol-name">${currentReels[1].name}</span>
                    </div>
                    <div class="reel-symbol-cell">
                        <iconify-icon icon="${currentReels[2].icon}" class="reel-symbol-icon"></iconify-icon>
                        <span class="reel-symbol-name">${currentReels[2].name}</span>
                    </div>
                </div>
            </div>

            <div class="coinflip-input-section" id="slots-input-section" style="${isSlotsCollapsed ? 'display: none;' : ''}">
                <div class="input-action-row">
                    <div class="input-wrapper">
                        <input 
                            id="slots-wager-input" 
                            class="wager-input" 
                            type="text" 
                            placeholder="${isFreeSpinActive ? 'Free Spin active ($0 cost)' : 'Enter amount (15, 50%, 2k*2, max...)'}" 
                            value="${isFreeSpinActive ? 'FREE SPIN' : ''}" 
                            ${isFreeSpinActive ? 'disabled' : ''}
                        />
                    </div>
                    <button id="btn-execute-slots-spin" class="flip-execute-btn slots-spin-btn" type="button">
                        <iconify-icon icon="${isFreeSpinActive ? 'lucide:zap' : 'lucide:dices'}" class="flip-btn-icon"></iconify-icon>
                        <span>${isFreeSpinActive ? `Free Spin (${activeFreeSpinState.remainingSpins})` : 'Spin Reels'}</span>
                    </button>
                </div>

                <div class="quick-pct-buttons">
                    <button class="pct-btn slots-pct" data-pct="5" type="button">5%</button>
                    <button class="pct-btn slots-pct" data-pct="25" type="button">25%</button>
                    <button class="pct-btn slots-pct" data-pct="45" type="button">45%</button>
                    <button class="pct-btn slots-pct" data-pct="100" type="button">100%</button>
                </div>
            </div>
        </div>
    `;
}

function attachGamblingListeners() {
    // Primary Game Switcher Tabs
    document.querySelectorAll('.game-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeGame = e.currentTarget.dataset.game;
            renderGambling();
        });
    });

    if (activeGame === 'coinflip') {
        attachCoinflipListeners();
    } else {
        attachSlotsListeners();
    }
}

function attachCoinflipListeners() {
    // Coinflip Accordion Toggle
    const titleRow = document.getElementById('coinflip-title-toggle');
    if (titleRow) {
        titleRow.addEventListener('click', () => {
            isCoinflipCollapsed = !isCoinflipCollapsed;
            renderGambling();
        });
    }

    // Mode Switcher Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeMode = e.currentTarget.dataset.mode;
            activeStreakState = null;
            lastCoinflipResult = null;
            saveGamblingState();
            renderGambling();
        });
    });

    // Side Picker Buttons (Heads / Tails)
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeChoice = e.currentTarget.dataset.side;
            document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // Dismiss Result Banner
    const closeBtn = document.getElementById('btn-close-coinflip-res');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lastCoinflipResult = null;
            renderGambling();
        });
    }

    // Quick Bet Percentage Buttons
    document.querySelectorAll('.pct-btn:not(.slots-pct)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pct = parseInt(e.currentTarget.dataset.pct, 10);
            const inputEl = document.getElementById('coinflip-wager-input');
            if (inputEl) {
                inputEl.value = `${pct}%`;
            }
        });
    });

    // Execute Coinflip Button
    const flipBtn = document.getElementById('btn-execute-flip');
    if (flipBtn) {
        flipBtn.addEventListener('click', () => handleCoinflipExecution());
    }

    // Streak Cashout Button
    const cashOutBtn = document.getElementById('btn-streak-cashout');
    if (cashOutBtn) {
        cashOutBtn.addEventListener('click', () => handleStreakCashOut());
    }

    // Streak Double Down Button
    const streakDoubleBtn = document.getElementById('btn-streak-double');
    if (streakDoubleBtn) {
        streakDoubleBtn.addEventListener('click', () => handleCoinflipExecution());
    }
}

function attachSlotsListeners() {
    // Slots Accordion Toggle
    const titleRow = document.getElementById('slots-title-toggle');
    if (titleRow) {
        titleRow.addEventListener('click', () => {
            isSlotsCollapsed = !isSlotsCollapsed;
            renderGambling();
        });
    }

    // Dismiss Result Banner
    const closeBtn = document.getElementById('btn-close-slots-res');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            lastSlotsResult = null;
            renderGambling();
        });
    }

    // Quick Bet Percentage Buttons
    document.querySelectorAll('.slots-pct').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pct = parseInt(e.currentTarget.dataset.pct, 10);
            const inputEl = document.getElementById('slots-wager-input');
            if (inputEl) {
                inputEl.value = `${pct}%`;
            }
        });
    });

    // Execute Slots Spin Button
    const spinBtn = document.getElementById('btn-execute-slots-spin');
    if (spinBtn) {
        spinBtn.addEventListener('click', () => handleSlotsSpinExecution());
    }
}

async function handleCoinflipExecution() {
    const inputEl = document.getElementById('coinflip-wager-input');
    const wagerInput = inputEl ? inputEl.value : '';

    const isStreakActive = activeMode === 'streak' && activeStreakState && activeStreakState.currentPool > 0;
    if (!isStreakActive && (!wagerInput || !String(wagerInput).trim())) {
        showToast('Please enter a bet amount (e.g. 50%, 10m, max).', 'warning');
        return;
    }

    const flipBtn = document.getElementById('btn-execute-flip');
    if (flipBtn) flipBtn.classList.add('btn-loading');

    try {
        const state = getState();
        const res = await apiCall('/api/gambling/coinflip', 'POST', {
            playerState: state,
            wagerInput,
            choice: activeChoice,
            mode: activeMode,
            streakState: activeStreakState
        });

        if (res && res.state) {
            saveState(res.state);
            renderHeader();
        }

        if (res.result) {
            lastCoinflipResult = res.result;
            if (res.result.isWin && activeMode === 'streak') {
                activeStreakState = {
                    currentPool: res.result.currentPool,
                    streakCount: res.result.streakCount
                };
            } else if (!res.result.isWin && activeMode === 'streak') {
                activeStreakState = null;
            }
            saveGamblingState();

            if (res.result.isWin) {
                showToast(res.result.message, 'success');
                addLogEntry(res.result.message, 'system');
            } else {
                showToast(res.result.message, 'warning');
                addLogEntry(res.result.message, 'system');
            }
        }
    } catch (err) {
        showToast(err.message || 'Failed to flip coin.', 'error');
    } finally {
        if (flipBtn) flipBtn.classList.remove('btn-loading');
        renderGambling();
    }
}

async function handleStreakCashOut() {
    if (!activeStreakState || activeStreakState.currentPool <= 0) return;

    try {
        const state = getState();
        const res = await apiCall('/api/gambling/coinflip', 'POST', {
            playerState: state,
            mode: 'streak',
            isCashOut: true,
            streakState: activeStreakState
        });

        if (res && res.state) {
            saveState(res.state);
            renderHeader();
        }

        if (res.result) {
            lastCoinflipResult = res.result;
            activeStreakState = null;
            saveGamblingState();
            showToast(res.result.message, 'success');
            addLogEntry(res.result.message, 'system');
        }
    } catch (err) {
        showToast(err.message || 'Failed to cash out streak.', 'error');
    } finally {
        renderGambling();
    }
}

async function handleSlotsSpinExecution() {
    const inputEl = document.getElementById('slots-wager-input');
    const wagerInput = inputEl ? inputEl.value : '';

    const isFreeSpinActive = activeFreeSpinState && activeFreeSpinState.remainingSpins > 0;
    if (!isFreeSpinActive && (!wagerInput || !String(wagerInput).trim())) {
        showToast('Please enter a bet amount (e.g. 50%, 10m, max).', 'warning');
        return;
    }

    const spinBtn = document.getElementById('btn-execute-slots-spin');
    if (spinBtn) spinBtn.classList.add('btn-loading');

    try {
        const state = getState();
        const res = await apiCall('/api/gambling/slots', 'POST', {
            playerState: state,
            wagerInput,
            freeSpinState: activeFreeSpinState
        });

        if (res && res.state) {
            saveState(res.state);
            renderHeader();
        }

        if (res.result) {
            lastSlotsResult = res.result;
            activeFreeSpinState = res.result.freeSpinState || null;
            saveGamblingState();

            if (res.result.isWin) {
                showToast(res.result.message, 'success');
                addLogEntry(res.result.message, 'system');
            } else {
                showToast(res.result.message, 'warning');
                addLogEntry(res.result.message, 'system');
            }
        }
    } catch (err) {
        showToast(err.message || 'Failed to spin reels.', 'error');
    } finally {
        if (spinBtn) spinBtn.classList.remove('btn-loading');
        renderGambling();
    }
}
