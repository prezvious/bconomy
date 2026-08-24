// Navigation & Action Event Listeners
import { getState, saveState } from './state.js';
import { formatDisplayNumber, formatMoney } from './utils.js';
import { apiCall, doAddPlot, doClaim, doUseMelon, doRankUp, doWaterAll } from './api.js';
import { renderAll, renderHeader } from './ui/header.js';
import { renderInventory } from './ui/inventory.js';
import { renderCrafting } from './ui/crafting.js';
import { renderTools, updateAllToolRecipes } from './ui/tools.js';
import { renderRankPrestige, setupAccordion, setupTargetedModal } from './ui/rankPrestigeCombined.js';
import { renderFarm, renderManageModal } from './ui/farm.js';
import { renderShop } from './ui/shop.js';
import { renderGambling } from './ui/gambling.js';
import { renderFaction } from './ui/faction.js';
import { renderSettings } from './ui/settings.js';
import { showToast } from './ui/toast.js';
import { addLogEntry } from './ui/log.js';
import { showConfirmation, openDialog, closeDialog } from './ui/modal.js';

const MOBILE_PRIMARY_SECTIONS = new Set(['actions', 'farm', 'inventory', 'crafting']);

const syncMobileNavigation = (target, directTab) => {
    const moreButton = document.getElementById('btn-mobile-more');
    if (!moreButton) return;

    const isSecondary = Boolean(target) && !MOBILE_PRIMARY_SECTIONS.has(target);
    const currentLabel = directTab?.getAttribute('aria-label') || directTab?.textContent?.trim() || target;

    moreButton.classList.toggle('active', isSecondary);
    moreButton.setAttribute('aria-label', isSecondary ? `More sections, current section: ${currentLabel}` : 'More sections');
    if (isSecondary) moreButton.setAttribute('aria-current', 'page');
    else moreButton.removeAttribute('aria-current');

    document.querySelectorAll('[data-mobile-tab]').forEach(item => {
        const active = item.dataset.mobileTab === target;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    });
};

export const activateSection = (target, { focus = false } = {}) => {
    const tabs = document.querySelectorAll('.nav-btn');
    const panels = document.querySelectorAll('.panel');
    const tab = document.querySelector(`.nav-btn[data-tab="${target}"]`);
    const targetPanel = document.getElementById(`panel-${target}`);
    if (!tab || !targetPanel) return false;

    tabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
    });
    syncMobileNavigation(target, tab);
    panels.forEach(panel => panel.classList.toggle('active', panel === targetPanel));
    document.title = `Bconomy — ${tab.getAttribute('aria-label') || tab.textContent.trim()}`;
    if (focus) tab.focus?.({ preventScroll: true });

    if (target === 'inventory') renderInventory();
    if (target === 'crafting') renderCrafting();
    if (target === 'shop') renderShop({ resetControls: true });
    if (target === 'tools') renderTools();
    if (target === 'farm') renderFarm();
    if (target === 'gambling') renderGambling();
    if (target === 'faction') renderFaction({ resetTab: true });
    if (target === 'rank-prestige' || target === 'rank' || target === 'prestige') renderRankPrestige();
    if (target === 'settings') renderSettings();

    if (typeof CustomEvent !== 'undefined') {
        document.dispatchEvent(new CustomEvent('bconomy:help-context-change', {
            detail: { section: target, subfeature: 'overview' }
        }));
    }
    return true;
};

export const setupNavigation = () => {
    setupAccordion();
    setupTargetedModal();

    const tabs = document.querySelectorAll('.nav-btn[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            activateSection(tab.dataset.tab);
        });
    });

    const mobileMoreButton = document.getElementById('btn-mobile-more');
    const mobileMoreDialog = document.getElementById('mobile-more-dialog');
    if (mobileMoreButton && mobileMoreDialog && mobileMoreButton.dataset.navigationBound !== 'true') {
        mobileMoreButton.dataset.navigationBound = 'true';
        mobileMoreButton.addEventListener('click', () => {
            mobileMoreButton.setAttribute('aria-expanded', 'true');
            openDialog(mobileMoreDialog, {
                initialFocus: '.mobile-more-destination.active, .mobile-more-destination',
                closeOnBackdrop: true,
                returnFocus: mobileMoreButton,
                onClose: () => mobileMoreButton.setAttribute('aria-expanded', 'false')
            });
        });

        mobileMoreDialog.addEventListener('click', event => {
            const destination = event.target.closest?.('[data-mobile-tab]');
            if (!destination || !mobileMoreDialog.contains(destination)) return;
            if (activateSection(destination.dataset.mobileTab)) {
                closeDialog(mobileMoreDialog, { reason: 'navigate' });
            }
        });
    }

    const activeTab = document.querySelector('.nav-btn[data-tab].active');
    syncMobileNavigation(activeTab?.dataset.tab, activeTab);

    // Farm Action Listeners
    const btnGlobalWater = document.getElementById('btn-global-water');
    if (btnGlobalWater) {
        btnGlobalWater.addEventListener('click', async (e) => {
            try {
                const res = await doWaterAll(e.currentTarget);
                const count = res.result ? (res.result.wateredCount || 0) : 0;
                const cycles = res.result ? (res.result.acceleratedCycles || 0) : 0;
                const harvested = res.result ? (res.result.totalHarvested || 0) : 0;
                const byp = res.result && res.result.byproducts;
                let msg = `Watered ${count} plot(s): ${formatDisplayNumber(cycles)} accelerated cycle(s), ${formatDisplayNumber(harvested)} crops stored.`;
                if (byp && (byp.Weeds > 0 || byp.RedMushroom > 0)) {
                    msg += ` (+${byp.Weeds} Weeds, +${byp.RedMushroom} Red Mushrooms)`;
                }
                showToast(msg, 'success');
                addLogEntry(`Watered all farm plots at once: ${cycles} accelerated cycle(s), ${harvested} crops stored. Byproducts: ${byp ? `${byp.Weeds} Weeds, ${byp.RedMushroom} Red Mushrooms` : 'None'}.`, 'system');
                renderFarm();
            } catch (err) {
                showToast(err.message || 'Failed to water all farm plots', 'error');
            }
        });
    }

    const btnFarmManage = document.getElementById('btn-farm-manage');
    const manageModal = document.getElementById('farm-manage-modal');
    const btnManageClose = document.getElementById('btn-manage-close');
    const btnCloseFarmManage = document.getElementById('btn-close-farm-manage');

    if (btnFarmManage && manageModal) {
        btnFarmManage.addEventListener('click', () => {
            renderManageModal({ resetTab: true });
            openDialog(manageModal, {
                initialFocus: '#farm-manage-tab-plant',
                closeOnBackdrop: false,
                returnFocus: btnFarmManage
            });
        });
    }

    const closeManageModal = () => {
        closeDialog(manageModal, { reason: 'close' });
    };

    if (btnManageClose) btnManageClose.addEventListener('click', closeManageModal);
    if (btnCloseFarmManage) btnCloseFarmManage.addEventListener('click', closeManageModal);

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
                if (res.result && res.result.totalClaimedCount > 0) {
                    let msg = `Claimed ${formatDisplayNumber(res.result.totalClaimedCount)} crops!`;
                    if (res.result.cashBonus > 0) msg += ` +${formatMoney(res.result.cashBonus)} Golden Pay!`;
                    if (res.result.caffeineTriggered) msg += ` Caffeine reduced action cooldowns by ${res.result.cooldownReductionMs / 1000}s!`;
                    showToast(msg, 'success');
                    addLogEntry(msg, 'rare');
                } else {
                    showToast('No stored crops available to claim.', 'info');
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

    const btnPromote = document.getElementById('btn-rp-promote');
    if (btnPromote) {
        btnPromote.addEventListener('click', async (e) => {
            try {
                const res = await doRankUp(e.currentTarget);
                const newRankName = res.result ? (res.result.newRankName || 'Unknown') : 'Unknown';
                showToast(`Ranked up to ${newRankName}!`, 'success');
                addLogEntry(`Ranked up to Rank ${res.result ? res.result.newRank : ''} - ${newRankName}`, 'rare');
                renderHeader();
                renderRankPrestige();
            } catch (err) {
                showToast(err.message || 'Failed to rank up', 'error');
            }
        });
    }

    const btnAscend = document.getElementById('btn-rp-ascend');
    if (btnAscend) {
        btnAscend.addEventListener('click', async (e) => {
            const playerState = getState();
            const tier = (playerState && playerState.prestigeCount) || 0;
            const investitureLevel = Math.min(25, (playerState && playerState.perks && playerState.perks.investiture) || 0);
            const cost = tier === 0 ? 0 : Math.floor(550000000 * (tier + 2) * (1 - 0.025 * investitureLevel));
            const costMsg = cost === 0 ? 'Ascending to Tier 1 is Free!' : `Ascending to Tier ${tier + 1} will cost ${formatMoney(cost)}.`;

            const confirmed = await showConfirmation(
                'ascend',
                'Ascend Tier?',
                `${costMsg} It will increase your Tier standing and award 5 Prestige Points. Your inventory, tools, perks, and farm progress will be preserved. Are you ready to ascend?`
            );
            if (!confirmed) return;

            try {
                const res = await apiCall('/api/prestige/ascend', 'POST', {}, e.currentTarget);
                const spent = res.result && res.result.cost ? res.result.cost : cost;
                showToast('Prestige Ascension successful!', 'success');
                addLogEntry(`ASCENDED TO PRESTIGE TIER ${res.result?.newPrestigeCount || (tier + 1)}!${spent > 0 ? ` (Paid ${formatMoney(spent)})` : ''}`, 'rare');
                await updateAllToolRecipes();
                renderAll();
                renderRankPrestige();
            } catch (err) {
                showToast(err.message || 'Ascension failed', 'error');
            }
        });
    }

};
