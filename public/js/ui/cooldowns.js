// Cooldown & Real-Time UI Loop
import { getState } from '../state.js';
import { ACTIONS } from '../utils.js';
import { doFarmState } from '../api.js';
import { renderFarm } from './farm.js';

let isSyncingFarm = false;
let lastFarmSyncTime = 0;

export const cooldownLoop = () => {
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
    });

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

                const duration = growTimes[plot.crop] || 20000;
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
        if (needsSync && !isSyncingFarm && (now - lastFarmSyncTime > 1500)) {
            isSyncingFarm = true;
            lastFarmSyncTime = now;
            doFarmState().then(() => {
                renderFarm();
            }).catch(err => {
                console.error("Auto farm sync error:", err);
            }).finally(() => {
                isSyncingFarm = false;
            });
        }
    }

    requestAnimationFrame(cooldownLoop);
};
