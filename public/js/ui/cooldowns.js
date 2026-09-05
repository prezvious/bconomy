// Cooldown & Real-Time UI Loop
import { getState } from '../state.js';
import { ACTIONS, formatDurationMs, formatTimestampDate } from '../utils.js';
import { getStoredSettings } from '../preferences.js';
import { doFarmState } from '../api.js';
import { renderFarm } from './farm.js';
import { renderActiveBoosts } from './actions.js';

let isSyncingFarm = false;
let lastFarmSyncTime = 0;
let nextFarmSyncAttemptAt = 0;
let farmSyncRetryDelayMs = 5000;
const FARM_SYNC_RETRY_MAX_MS = 60000;
let hoverListenersAttached = false;

export const initTimerHoverListeners = () => {
    if (hoverListenersAttached || typeof document === 'undefined') return;
    hoverListenersAttached = true;

    document.addEventListener('mouseover', (e) => {
        const timerEl = e.target.closest('.boost-timer, .active-timer-val, .timer-hoverable');
        if (!timerEl) return;
        const expireAt = parseInt(timerEl.dataset.expire, 10);
        if (!expireAt || isNaN(expireAt) || expireAt <= 0) return;

        timerEl.dataset.hovered = 'true';
        timerEl.classList.add('timer-hover-active');
        const settings = getStoredSettings();
        const hoverMode = settings.timerHoverMode || 'swap';

        if (hoverMode === 'swap' || hoverMode === 'both') {
            timerEl.textContent = formatTimestampDate(expireAt, settings);
        }
        if (hoverMode === 'tooltip' || hoverMode === 'both') {
            timerEl.setAttribute('title', `Expires: ${formatTimestampDate(expireAt, settings)}`);
        }
    });

    document.addEventListener('mouseout', (e) => {
        const timerEl = e.target.closest('.boost-timer, .active-timer-val, .timer-hoverable');
        if (!timerEl) return;
        const related = e.relatedTarget;
        if (timerEl.contains(related)) return;

        delete timerEl.dataset.hovered;
        timerEl.classList.remove('timer-hover-active');
        const expireAt = parseInt(timerEl.dataset.expire, 10);
        if (!expireAt || isNaN(expireAt) || expireAt <= 0) return;

        const settings = getStoredSettings();
        const remain = Math.max(0, expireAt - Date.now());
        timerEl.textContent = formatDurationMs(remain, settings);
    });
};

export const cooldownLoop = () => {
    initTimerHoverListeners();
    const playerState = getState();
    if (!playerState) {
        requestAnimationFrame(cooldownLoop);
        return;
    }

    const now = Date.now();

    // Action cooldowns
    ACTIONS.forEach(act => {
        const cdEnd = (playerState.cooldowns && playerState.cooldowns[act.id]) || 0;
        const remain = cdEnd - now;

        const bar = document.getElementById(`cd-bar-${act.id}`);
        const text = document.getElementById(`cd-text-${act.id}`);
        const btn = document.getElementById(`btn-act-${act.id}`);

        if (!bar || !text || !btn) return;

        let maxCd = 300000;
        if (act.id === 'work') maxCd = 1800000;

        if (remain > 0) {
            const pct = Math.max(0, Math.min(100, (remain / maxCd) * 100));
            bar.style.width = `${pct}%`;
            bar.classList.add('cooldown');

            const secs = Math.ceil(remain / 1000);
            if (secs > 60) {
                const mins = Math.floor(secs / 60);
                const s = secs % 60;
                text.textContent = `${mins}m ${s}s`;
            } else {
                text.textContent = `${secs}s`;
            }

            btn.disabled = true;
            btn.classList.remove('ready-highlight');
        } else {
            bar.style.width = '0%';
            bar.classList.remove('cooldown');
            text.textContent = 'Ready!';
            btn.disabled = false;
            if (!btn.classList.contains('ready-highlight')) {
                btn.classList.add('ready-highlight');
            }
        }

        if (act.id === 'work') {
            const shift = playerState.workShift || { currentStreak: 0, lastWorkAt: 0, streakExpireAt: 0, streakEligibleAt: 0 };
            const streak = shift.currentStreak || 0;
            const expireAt = shift.streakExpireAt || 0;
            const streakTimerEl = document.getElementById('work-streak-timer');

            if (streakTimerEl) {
                if (streak > 0 && expireAt > 0) {
                    const streakRemain = expireAt - now;
                    if (streakRemain > 0) {
                        streakTimerEl.classList.remove('hidden', 'streak-expired');
                        const sSecs = Math.ceil(streakRemain / 1000);
                        const sMins = Math.floor(sSecs / 60);
                        const sRemSec = sSecs % 60;
                        streakTimerEl.textContent = `Streak expires in ${sMins}m ${sRemSec}s`;
                        streakTimerEl.title = `Streak window open until ${formatTimestampDate(expireAt, getStoredSettings())}`;
                    } else {
                        streakTimerEl.classList.remove('hidden');
                        streakTimerEl.classList.add('streak-expired');
                        streakTimerEl.textContent = 'Streak Expired';
                        streakTimerEl.title = 'Window expired; next shift will start at 1';
                    }
                } else {
                    streakTimerEl.classList.add('hidden');
                }
            }
        }
    });

    // Real-time Active Boosts Updates
    const activeBoostRows = document.querySelectorAll('#active-boosts-container .boost-row[data-expire]');
    let anyBoostExpired = false;

    activeBoostRows.forEach(row => {
        const expireAt = parseInt(row.dataset.expire, 10);
        const durationMs = parseInt(row.dataset.duration, 10) || (15 * 60 * 1000);
        const remain = Math.max(0, expireAt - now);

        const timerEl = row.querySelector('.boost-timer');
        if (timerEl) {
            timerEl.dataset.expire = expireAt;
            const isHovered = timerEl.dataset.hovered === 'true';
            const settings = getStoredSettings();
            const hoverMode = settings.timerHoverMode || 'swap';

            if (hoverMode === 'tooltip' || hoverMode === 'both' || !timerEl.getAttribute('title')) {
                timerEl.setAttribute('title', `Expires: ${formatTimestampDate(expireAt, settings)}`);
            }

            if (isHovered && (hoverMode === 'swap' || hoverMode === 'both')) {
                timerEl.textContent = formatTimestampDate(expireAt, settings);
            } else {
                timerEl.textContent = formatDurationMs(remain, settings);
            }
        }

        const barFillEl = row.querySelector('.boost-duration-bar-fill');
        if (barFillEl) {
            const pct = Math.min(100, Math.max(0, (remain / durationMs) * 100));
            barFillEl.style.width = `${pct}%`;
        }

        if (remain <= 0) {
            anyBoostExpired = true;
        }
    });

    if (anyBoostExpired) {
        renderActiveBoosts();
    }

    // Real-time Farm Updates
    if (playerState.farm) {
        const farm = playerState.farm;

        // 1. Water Cooldown Display
        const waterDisplay = document.getElementById('water-timer-display');
        const btnGlobalWater = document.getElementById('btn-global-water');
        if (waterDisplay) {
            const waterAvail = farm.waterAvailableAt || 0;
            if (waterAvail > now) {
                const remainingSecs = Math.ceil((waterAvail - now) / 1000);
                const mins = Math.floor(remainingSecs / 60);
                const secs = remainingSecs % 60;
                waterDisplay.textContent = `Status: ${mins}m ${secs}s`;
                waterDisplay.className = 'water-timer-display cooldown';
            } else {
                waterDisplay.textContent = 'Status: Ready to Water';
                waterDisplay.className = 'water-timer-display ready';
            }
        }
        if (btnGlobalWater) {
            btnGlobalWater.disabled = ((farm.waterAvailableAt || 0) > now);
        }

        // 2. Real-time Plot Growth Progress & Harvest Timers
        const growTimes = { 'Blueberry': 20000, 'Golden Wheat': 70000, 'Melon': 900000, 'Coffee': 300000, 'Pumpkin': 1800000 };
        let needsSync = false;

        if (Array.isArray(farm.plots)) {
            farm.plots.forEach(plot => {
                if (!plot.crop) return;

                const level = Math.min(16, Math.max(0, Math.floor(Number(plot.level) || 0)));
                const duration = Math.max(1, Math.round((growTimes[plot.crop] || 20000) * (1 - (level * 0.05))));
                const remain = Math.max(0, plot.nextHarvestAt - now);
                const elapsed = duration - remain;
                const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));

                const fillEl = document.getElementById(`progress-fill-plot-${plot.id}`);
                if (fillEl) fillEl.style.width = `${pct}%`;

                const timerEl = document.getElementById(`timer-value-plot-${plot.id}`);
                if (timerEl) {
                    if (remain > 0) {
                        const secs = Math.ceil(remain / 1000);
                        if (secs > 60) {
                            timerEl.textContent = `${Math.floor(secs / 60)}m ${secs % 60}s`;
                        } else {
                            timerEl.textContent = `${secs}s`;
                        }
                    } else {
                        timerEl.textContent = 'Ready!';
                    }
                }

                // If plot finished growing (now >= nextHarvestAt), mark for backend harvest sync
                if (now >= plot.nextHarvestAt) {
                    needsSync = true;
                }
            });
        }

        // 3. Trigger server harvest processing & UI re-render when crops finish growing
        if (needsSync && !isSyncingFarm && now >= nextFarmSyncAttemptAt && (now - lastFarmSyncTime > 1500)) {
            isSyncingFarm = true;
            lastFarmSyncTime = now;
            doFarmState().then(() => {
                nextFarmSyncAttemptAt = 0;
                farmSyncRetryDelayMs = 5000;
                renderFarm();
            }).catch(err => {
                nextFarmSyncAttemptAt = Date.now() + farmSyncRetryDelayMs;
                farmSyncRetryDelayMs = Math.min(FARM_SYNC_RETRY_MAX_MS, farmSyncRetryDelayMs * 2);
                console.error("Auto farm sync error:", err);
            }).finally(() => {
                isSyncingFarm = false;
            });
        } else if (!needsSync) {
            nextFarmSyncAttemptAt = 0;
            farmSyncRetryDelayMs = 5000;
        }
    }

    requestAnimationFrame(cooldownLoop);
};
