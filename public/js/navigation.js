// Navigation & Action Event Listeners
import { getState, saveState } from './state.js';
import { formatNumberCommas } from './utils.js';
import { apiCall, doAddPlot, doClaim, doUseMelon, doRankUp, doWaterAll } from './api.js';
import { renderAll, renderHeader } from './ui/header.js';
import { renderInventory } from './ui/inventory.js';
import { renderTools, updateAllToolRecipes } from './ui/tools.js';
import { renderRank } from './ui/rank.js';
import { renderPrestige } from './ui/prestige.js';
import { renderFarm, renderManageModal } from './ui/farm.js';
import { showToast } from './ui/toast.js';
import { addLogEntry } from './ui/log.js';
import { showConfirmation } from './ui/modal.js';

export const setupNavigation = () => {
    const tabs = document.querySelectorAll('.nav-btn');
    const panels = document.querySelectorAll('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById(`panel-${target}`);
            if (targetPanel) targetPanel.classList.add('active');

            if (target === 'inventory') renderInventory();
            if (target === 'tools') renderTools();
            if (target === 'farm') renderFarm();
            if (target === 'rank') renderRank();
            if (target === 'prestige') renderPrestige();
        });
    });

    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
        searchInput.addEventListener('input', renderInventory);
    }

    // Farm Action Listeners
    const btnGlobalWater = document.getElementById('btn-global-water');
    if (btnGlobalWater) {
        btnGlobalWater.addEventListener('click', async (e) => {
            try {
                const res = await doWaterAll(e.currentTarget);
                const count = res.result ? (res.result.wateredCount || 0) : 0;
                showToast(`Watered all farm plots (${count} watered)! Growth timer reduced by 30 mins.`, 'success');
                addLogEntry(`Watered all farm plots at once (${count} plot(s) affected).`, 'system');
                renderFarm();
            } catch (err) {
                showToast(err.message || 'Failed to water all farm plots', 'error');
            }
        });
    }

    const btnFarmManage = document.getElementById('btn-farm-manage');
    const manageModal = document.getElementById('manage-seeds-modal');
    const btnManageClose = document.getElementById('btn-manage-close');

    if (btnFarmManage && manageModal) {
        btnFarmManage.addEventListener('click', () => {
            renderManageModal();
            manageModal.classList.remove('hidden');
        });
    }

    if (btnManageClose && manageModal) {
        btnManageClose.addEventListener('click', () => {
            manageModal.classList.add('hidden');
        });
    }

    const btnAddPlot = document.getElementById('btn-add-plot');
    if (btnAddPlot) {
        btnAddPlot.addEventListener('click', async (e) => {
            try {
                await doAddPlot(e.currentTarget);
                showToast('Added a new farm plot!', 'success');
                addLogEntry('Added a new farm plot.', 'system');
                renderFarm();
            } catch (err) {
                showToast(err.message || 'Failed to add farm plot', 'error');
            }
        });
    }

    const btnClaimCrops = document.getElementById('btn-claim-crops');
    if (btnClaimCrops) {
        btnClaimCrops.addEventListener('click', async (e) => {
            try {
                const select = document.getElementById('claim-crop-select');
                const cropType = select ? select.value : 'all';
                const res = await doClaim(cropType, e.currentTarget);
                if (res.result && res.result.success) {
                    let msg = `Claimed ${formatNumberCommas(res.result.totalClaimedCount)} crops!`;
                    if (res.result.cashBonus > 0) msg += ` +$${formatNumberCommas(res.result.cashBonus)} Golden Pay!`;
                    if (res.result.caffeineTriggered) msg += ` Caffeine reduced action cooldowns by ${res.result.cooldownReductionMs / 1000}s!`;
                    showToast(msg, 'success');
                    addLogEntry(msg, 'rare');
                } else {
                    showToast((res.result && res.result.message) || 'No crops available to claim.', 'info');
                }
                renderAll();
            } catch (err) {
                showToast(err.message || 'Failed to claim crops', 'error');
            }
        });
    }

    const claimCropSelect = document.getElementById('claim-crop-select');
    if (claimCropSelect) {
        claimCropSelect.addEventListener('change', () => {
            const btn = document.getElementById('btn-claim-crops');
            if (btn) {
                btn.innerHTML = `<iconify-icon icon="lucide:download" aria-hidden="true"></iconify-icon> ${claimCropSelect.value === 'all' ? 'Claim All' : 'Claim Selected'}`;
            }
        });
    }

    const btnUseMelon = document.getElementById('btn-use-melon');
    if (btnUseMelon) {
        btnUseMelon.addEventListener('click', async (e) => {
            try {
                await doUseMelon(e.currentTarget);
                showToast('Used 1 Melon! Water cooldown reset!', 'success');
                addLogEntry('Used 1 Melon to reset global watering cooldown.', 'system');
                renderFarm();
            } catch (err) {
                showToast(err.message || 'Failed to use Melon', 'error');
            }
        });
    }

    const btnRankUp = document.getElementById('btn-rank-up');
    if (btnRankUp) {
        btnRankUp.addEventListener('click', async (e) => {
            try {
                const res = await doRankUp(e.currentTarget);
                const newRankName = res.result ? (res.result.newRankName || 'Unknown') : 'Unknown';
                showToast(`Ranked up to ${newRankName}!`, 'success');
                addLogEntry(`Ranked up to Rank ${res.result ? res.result.newRank : ''} - ${newRankName}`, 'rare');
                renderHeader();
                renderRank();
                renderPrestige();
            } catch (err) {
                showToast(err.message || 'Failed to rank up', 'error');
            }
        });
    }

    const btnAscend = document.getElementById('btn-ascend');
    if (btnAscend) {
        btnAscend.addEventListener('click', async (e) => {
            const confirmed = await showConfirmation(
                'ascend',
                'Ascend to a New Era?',
                'This will reset your cash to $0 and rank to Peasant. Your inventory, tools, perks, and Farm progress will be kept. You will gain 5 Prestige Points. Are you absolutely sure?'
            );
            if (!confirmed) return;

            try {
                const res = await apiCall('/api/prestige/ascend', 'POST', {}, e.currentTarget);
                showToast('Ascension successful!', 'success');
                addLogEntry('ASCENDED TO A HIGHER PLANE!', 'rare');
                await updateAllToolRecipes();
                renderAll();

                const prestigeTab = document.querySelector('[data-tab="prestige"]');
                if (prestigeTab) prestigeTab.click();
            } catch (err) {
                showToast(err.message || 'Ascension failed', 'error');
            }
        });
    }
};
