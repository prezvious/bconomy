// Farm Panel Renderer
import { getState } from '../state.js';
import { formatNumberCommas } from '../utils.js';
import { doPlant, doPlantAll, doWater, doWaterAll, doCompost, doRemove } from '../api.js';
import { showToast } from './toast.js';
import { showConfirmation } from './modal.js';

export const renderFarm = () => {
    const playerState = getState();
    if (!playerState || !playerState.farm) return;
    const farm = playerState.farm;
    const now = Date.now();

    // Global Water Status & Melon
    const waterDisplay = document.getElementById('water-timer-display');
    const btnGlobalWater = document.getElementById('btn-global-water');
    const btnMelon = document.getElementById('btn-use-melon');
    if (waterDisplay) {
        if (farm.waterAvailableAt > now) {
            const remainingSecs = Math.ceil((farm.waterAvailableAt - now) / 1000);
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
        btnGlobalWater.disabled = (farm.waterAvailableAt > now);
    }
    if (btnMelon) {
        const melonCount = (playerState.inventory && playerState.inventory['Melon']) || 0;
        btnMelon.disabled = (farm.waterAvailableAt <= now) || (melonCount < 1);
        btnMelon.innerHTML = `<iconify-icon icon="lucide:sparkles" aria-hidden="true"></iconify-icon> Use Melon (${melonCount} left)`;
    }

    // Farm Storage
    const storageGrid = document.getElementById('farm-storage-grid');
    if (storageGrid) {
        const crops = ['Blueberry', 'Golden Wheat', 'Melon', 'Coffee', 'Pumpkin'];
        const activeOrStoredCrops = crops.filter(crop => {
            const count = (farm.storage && farm.storage[crop]) || 0;
            const isGrowing = Array.isArray(farm.plots) && farm.plots.some(p => p.crop === crop);
            return count > 0 || isGrowing;
        });

        if (activeOrStoredCrops.length === 0) {
            storageGrid.innerHTML = `
                <div class="empty-storage-msg">
                    No crops currently growing or stored in Farm Storage.
                </div>
            `;
        } else {
            storageGrid.innerHTML = activeOrStoredCrops.map(crop => {
                const count = (farm.storage && farm.storage[crop]) || 0;
                return `
                    <div class="storage-item-card">
                        <span class="storage-item-name">${crop}</span>
                        <span class="storage-item-count ${count > 0 ? 'has-count' : ''}">${formatNumberCommas(count)}</span>
                    </div>
                `;
            }).join('');
        }
    }

    // Dynamic Claim Dropdown
    const claimSelect = document.getElementById('claim-crop-select');
    if (claimSelect) {
        const currentSelected = claimSelect.value;
        const allCrops = ['Blueberry', 'Golden Wheat', 'Melon', 'Coffee', 'Pumpkin'];
        const availableToClaim = allCrops.filter(crop => (farm.storage && farm.storage[crop] > 0));

        let optionsHtml = `<option value="all">Claim All Crops</option>`;
        availableToClaim.forEach(crop => {
            optionsHtml += `<option value="${crop}">${crop}</option>`;
        });
        claimSelect.innerHTML = optionsHtml;

        if (availableToClaim.includes(currentSelected)) {
            claimSelect.value = currentSelected;
        } else {
            claimSelect.value = 'all';
        }

        const btnClaim = document.getElementById('btn-claim-crops');
        if (btnClaim) {
            btnClaim.innerHTML = `<iconify-icon icon="lucide:download" aria-hidden="true"></iconify-icon> ${claimSelect.value === 'all' ? 'Claim All' : 'Claim Selected'}`;
        }
    }

    // Plots Grid
    const plotsGrid = document.getElementById('farm-plots-grid');
    if (plotsGrid) {
        plotsGrid.innerHTML = farm.plots.map(plot => {
            if (!plot.crop) {
                return `
                    <div class="plot-card empty-plot">
                        <div class="plot-header">
                            <span class="plot-id">Plot #${plot.id}</span>
                            <span class="plot-status empty">Empty</span>
                        </div>
                        <div class="plot-body">
                            <select id="plant-select-${plot.id}" class="crop-select mb-2" aria-label="Select crop to plant on plot ${plot.id}">
                                <option value="Blueberry">Blueberry (20s)</option>
                                <option value="Golden Wheat">Golden Wheat (70s)</option>
                                <option value="Melon">Melon (15m)</option>
                                <option value="Coffee">Coffee (5m)</option>
                                <option value="Pumpkin">Pumpkin (30m)</option>
                            </select>
                            <button class="action-btn primary-btn btn-sm btn-plant" data-plot-id="${plot.id}">
                                <iconify-icon icon="lucide:sprout" aria-hidden="true"></iconify-icon> Plant Crop
                            </button>
                        </div>
                    </div>
                `;
            }

            const cropName = plot.crop;
            const growTimes = { 'Blueberry': 20000, 'Golden Wheat': 70000, 'Melon': 900000, 'Coffee': 300000, 'Pumpkin': 1800000 };
            const duration = growTimes[cropName] || 20000;
            const remain = Math.max(0, plot.nextHarvestAt - now);
            const elapsed = duration - remain;
            const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));

            let timerText = 'Ready!';
            if (remain > 0) {
                const secs = Math.ceil(remain / 1000);
                if (secs > 60) {
                    timerText = `${Math.floor(secs / 60)}m ${secs % 60}s`;
                } else {
                    timerText = `${secs}s`;
                }
            }

            const isWaterable = (farm.waterAvailableAt <= now) && (remain > 0);
            const pumpkinCount = (playerState.inventory && playerState.inventory['Pumpkin']) || 0;
            const canCompost = !plot.composted && (pumpkinCount > 0);

            return `
                <div class="plot-card active-plot">
                    <div class="plot-header">
                        <span class="plot-id">Plot #${plot.id}</span>
                        <span class="plot-crop-name">${cropName}</span>
                    </div>
                    <div class="plot-body">
                        ${plot.composted ? '<span class="compost-tag"><iconify-icon icon="lucide:sparkle" aria-hidden="true"></iconify-icon> Composted (+70% yield)</span>' : ''}
                        <div class="growth-progress-bar">
                            <div class="growth-progress-fill" id="progress-fill-plot-${plot.id}" style="width: ${pct}%"></div>
                        </div>
                        <div class="plot-timer-row">
                            <span class="timer-label">Harvest:</span>
                            <span class="timer-value" id="timer-value-plot-${plot.id}" role="status">${timerText}</span>
                        </div>
                        <div class="plot-actions-row">
                            <button class="action-btn secondary-btn btn-sm btn-water" data-plot-id="${plot.id}" ${!isWaterable ? 'disabled' : ''}>
                                <iconify-icon icon="lucide:droplets" aria-hidden="true"></iconify-icon> Water
                            </button>
                            <button class="action-btn secondary-btn btn-sm btn-compost" data-plot-id="${plot.id}" ${!canCompost ? 'disabled' : ''}>
                                <iconify-icon icon="lucide:wheat" aria-hidden="true"></iconify-icon> Compost
                            </button>
                            <button class="action-btn danger-btn btn-sm btn-remove" data-plot-id="${plot.id}">
                                <iconify-icon icon="lucide:trash-2" aria-hidden="true"></iconify-icon> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach plot action button click handlers
        plotsGrid.querySelectorAll('.btn-plant').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const plotId = parseInt(e.currentTarget.dataset.plotId, 10);
                const select = document.getElementById(`plant-select-${plotId}`);
                const cropName = select ? select.value : 'Blueberry';
                try {
                    await doPlant(plotId, cropName, e.currentTarget);
                    showToast(`Planted ${cropName} on Plot #${plotId}!`, 'success');
                    renderFarm();
                } catch (err) {
                    showToast(err.message || `Failed to plant on Plot #${plotId}`, 'error');
                }
            });
        });

        plotsGrid.querySelectorAll('.btn-water').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const plotId = parseInt(e.currentTarget.dataset.plotId, 10);
                try {
                    await doWater(plotId, e.currentTarget);
                    showToast(`Watered Plot #${plotId}! Remaining growth time reduced.`, 'success');
                    renderFarm();
                } catch (err) {
                    showToast(err.message || `Failed to water Plot #${plotId}`, 'error');
                }
            });
        });

        plotsGrid.querySelectorAll('.btn-compost').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const plotId = parseInt(e.currentTarget.dataset.plotId, 10);
                try {
                    await doCompost(plotId, e.currentTarget);
                    showToast(`Applied Compost to Plot #${plotId}!`, 'success');
                    renderFarm();
                } catch (err) {
                    showToast(err.message || `Failed to compost Plot #${plotId}`, 'error');
                }
            });
        });

        plotsGrid.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const plotId = parseInt(e.currentTarget.dataset.plotId, 10);
                const confirmed = await showConfirmation(
                    'removeCrop',
                    'Remove Crop?',
                    `Are you sure you want to remove the plant from Plot #${plotId}? You will not receive any harvest.`
                );
                if (!confirmed) return;

                try {
                    await doRemove(plotId, e.currentTarget);
                    showToast(`Removed plant from Plot #${plotId}.`, 'info');
                    renderFarm();
                } catch (err) {
                    showToast(err.message || `Failed to remove plant from Plot #${plotId}`, 'error');
                }
            });
        });
    }
};

export const renderManageModal = () => {
    const seedsList = document.getElementById('seeds-list');
    if (!seedsList) return;

    const crops = [
        { name: 'Blueberry', growTime: '20s', yieldInfo: 'Base Yield: 3', desc: 'Berry Burst: 2% chance to double yield per harvest.' },
        { name: 'Golden Wheat', growTime: '70s', yieldInfo: 'Base Yield: 5', desc: 'Golden Pay: Claiming grants +$10,000 cash per wheat item.' },
        { name: 'Melon', growTime: '15m', yieldInfo: 'Base Yield: 5', desc: 'Hydration: Consuming 1 Melon resets global water cooldown.' },
        { name: 'Coffee', growTime: '5m', yieldInfo: 'Base Yield: 2', desc: 'Caffeine: Claiming Coffee reduces all action cooldowns.' },
        { name: 'Pumpkin', growTime: '30m', yieldInfo: 'Base Yield: 1', desc: 'Compost: Apply 1 Pumpkin to boost plot yield by +70%.' }
    ];

    const playerState = getState();
    const farm = playerState ? playerState.farm : null;
    const emptyPlots = farm && Array.isArray(farm.plots) ? farm.plots.filter(p => !p.crop) : [];
    const emptyCount = emptyPlots.length;

    seedsList.innerHTML = crops.map(c => `
        <div class="seed-card card">
            <div class="seed-info">
                <div class="seed-title-row">
                    <span class="seed-name">${c.name}</span>
                    <span class="seed-badge-free">FREE ($0)</span>
                </div>
                <div class="seed-meta">Grow Time: ${c.growTime} • ${c.yieldInfo}</div>
                <div class="seed-details">${c.desc}</div>
            </div>
            <div class="seed-actions">
                <button class="action-btn primary-btn btn-sm btn-plant-all-seed" data-crop="${c.name}" ${emptyCount === 0 ? 'disabled' : ''}>
                    <iconify-icon icon="lucide:sprout" aria-hidden="true"></iconify-icon> Plant All (${emptyCount} empty)
                </button>
            </div>
        </div>
    `).join('');

    seedsList.querySelectorAll('.btn-plant-all-seed').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cropName = e.currentTarget.dataset.crop;
            try {
                const res = await doPlantAll(cropName, e.currentTarget);
                const count = res.result ? (res.result.plantedCount || 0) : 0;
                showToast(`Planted ${cropName} on ${count} plot(s) for free!`, 'success');
                renderFarm();
                renderManageModal();
            } catch (err) {
                showToast(err.message || `Failed to plant ${cropName}`, 'error');
            }
        });
    });
};
