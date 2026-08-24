import { getState } from '../state.js';
import {
    displayItemName,
    getItemCategory,
    getItemIcon,
    iconHtml,
    formatMoney,
    formatDisplayNumber,
    formatNumberCommas,
    isBoosterItem,
    getBoosterConfig
} from '../utils.js';
import { evaluateMathExpression, attachMathInputPreview } from '../utils/calculator.js';
import { apiCall, doActivateBooster, doUseMelon, doGetWhereUsed, doSetWishlist } from '../api.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { renderHeader, renderAll } from './header.js';
import { renderInventory } from './inventory.js';
import { openDialog, closeDialog, showConfirmation } from './modal.js';
import { quantityPresetButtonsHtml } from './quantityPresets.js';
import { getStoredSettings, shouldConfirmQuantityOperation } from '../preferences.js';

let cachedDescriptions = null;
let cachedFarmMaterials = null;
let itemRequestId = 0;

const fetchDescriptions = async () => {
    if (cachedDescriptions) return cachedDescriptions;
    try {
        const res = await fetch('/api/data/item-descriptions');
        if (res.ok) {
            cachedDescriptions = await res.json();
            return cachedDescriptions;
        }
    } catch (e) {
        console.warn('Failed to fetch item descriptions from server:', e);
    }
    return {};
};

const fetchFarmMaterials = async () => {
    if (cachedFarmMaterials) return cachedFarmMaterials;
    try {
        const response = await fetch('/api/data/farm/materials');
        if (response.ok) {
            cachedFarmMaterials = await response.json();
            return cachedFarmMaterials;
        }
    } catch (error) {
        console.warn('Failed to fetch farm material metadata from server:', error);
    }
    return {};
};

const getDurationLabel = (tier, durationMs) => {
    switch (tier) {
        case 'T1': return 'Active for 15 minutes';
        case 'T2': return 'Active for 30 minutes';
        case 'T3': return 'Active for 1 hour';
        case 'T4': return 'Active for 2 hours';
        case 'T5': return 'Active for 4 hours';
        case 'T6': return 'Active for 8 hours';
        default:
            if (!durationMs) return 'N/A';
            const mins = Math.floor(durationMs / 60000);
            if (mins >= 60) {
                const hrs = Math.floor(mins / 60);
                return `Active for ${hrs} hour${hrs > 1 ? 's' : ''}`;
            }
            return `Active for ${mins} minute${mins > 1 ? 's' : ''}`;
    }
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const openItemModal = async (rawName) => {
    const requestId = ++itemRequestId;
    const playerState = getState();
    if (!playerState) return;

    const modal = document.getElementById('item-details-modal');
    if (!modal) return;

    const displayName = displayItemName(rawName);
    const category = getItemCategory(rawName);
    const icon = getItemIcon(rawName);
    const qty = (playerState.inventory && (playerState.inventory[rawName] || playerState.inventory[displayName])) || 0;

    // Set Header
    const titleEl = document.getElementById('item-modal-title');
    const catEl = document.getElementById('item-modal-category');
    const iconWrapEl = document.getElementById('item-modal-icon-wrap');

    if (titleEl) titleEl.textContent = displayName;
    if (catEl) catEl.textContent = capitalize(category);
    if (iconWrapEl) {
        iconWrapEl.dataset.cat = category;
        iconWrapEl.innerHTML = iconHtml(icon, 'modal-item-icon');
    }

    const descEl = document.getElementById('item-modal-description');
    if (descEl) descEl.textContent = 'Loading item details…';
    const ownedEl = document.getElementById('item-modal-owned');
    const baseWorthEl = document.getElementById('item-modal-base-worth');
    const durationRow = document.getElementById('item-modal-duration-row');
    const effectRow = document.getElementById('item-modal-effect-row');
    const lootChanceRow = document.getElementById('item-modal-loot-chance-row');
    const dropStackRow = document.getElementById('item-modal-drop-stack-row');
    const marketRangeRow = document.getElementById('item-modal-market-range-row');
    const useSection = document.getElementById('item-modal-use-section');
    const sellSection = document.getElementById('item-modal-sell-section');
    const btnUse = document.getElementById('btn-item-modal-use');
    const btnConfirmSell = document.getElementById('btn-item-modal-sell');
    if (ownedEl) {
        ownedEl.textContent = `${formatDisplayNumber(qty)} owned`;
        ownedEl.title = `${formatNumberCommas(qty)} owned`;
    }
    if (baseWorthEl) baseWorthEl.textContent = 'Loading…';
    durationRow?.classList.add('hidden');
    effectRow?.classList.add('hidden');
    lootChanceRow?.classList.add('hidden');
    dropStackRow?.classList.add('hidden');
    marketRangeRow?.classList.add('hidden');
    useSection?.classList.add('hidden');
    sellSection?.classList.add('hidden');
    btnUse?.classList.add('hidden');
    btnConfirmSell?.classList.add('hidden');
    if (btnUse) btnUse.onclick = null;
    if (btnConfirmSell) btnConfirmSell.onclick = null;

    // Lock, favorite, and wishlist elements
    const btnLock = document.getElementById('btn-item-modal-lock');
    const lockIconEl = document.getElementById('item-modal-lock-icon');
    const lockLabelEl = document.getElementById('item-modal-lock-label');
    const btnPin = document.getElementById('btn-item-modal-pin');
    const pinIconEl = document.getElementById('item-modal-pin-icon');
    const pinLabelEl = document.getElementById('item-modal-pin-label');
    const btnWishlist = document.getElementById('btn-item-modal-wishlist');
    const wishlistIconEl = document.getElementById('item-modal-wishlist-icon');
    const wishlistLabelEl = document.getElementById('item-modal-wishlist-label');
    const whereUsedEl = document.getElementById('item-modal-where-used');

    const updateFlagUi = (locked, favorite, wished) => {
        if (btnLock) {
            btnLock.classList.toggle('btn-locked-active', locked);
            btnLock.setAttribute('aria-pressed', locked ? 'true' : 'false');
        }
        if (lockIconEl) {
            lockIconEl.innerHTML = iconHtml(locked ? 'lucide:lock' : 'lucide:unlock');
        }
        if (lockLabelEl) {
            lockLabelEl.textContent = locked ? 'Unlock Item' : 'Lock Item';
        }

        if (btnPin) {
            btnPin.classList.toggle('btn-pinned-active', favorite);
            btnPin.setAttribute('aria-pressed', favorite ? 'true' : 'false');
        }
        if (pinIconEl) {
            pinIconEl.innerHTML = iconHtml(favorite ? 'lucide:star-off' : 'lucide:star');
        }
        if (pinLabelEl) {
            pinLabelEl.textContent = favorite ? 'Remove Favorite' : 'Favorite';
        }
        if (btnWishlist) {
            btnWishlist.classList.toggle('btn-pinned-active', wished);
            btnWishlist.setAttribute('aria-pressed', wished ? 'true' : 'false');
        }
        if (wishlistIconEl) wishlistIconEl.innerHTML = iconHtml(wished ? 'lucide:bookmark-minus' : 'lucide:bookmark-plus');
        if (wishlistLabelEl) {
            wishlistLabelEl.textContent = wished ? 'Remove Wishlist' : 'Add to Wishlist';
        }

        // Disable use and sell buttons if item is locked
        if (btnUse) {
            btnUse.disabled = locked;
            btnUse.title = locked ? 'Item is locked. Unlock it to use.' : '';
        }
        if (btnConfirmSell) {
            btnConfirmSell.disabled = locked;
            btnConfirmSell.title = locked ? 'Item is locked. Unlock it to sell.' : '';
        }
    };

    const initialLocked = Array.isArray(playerState.lockedItems) && (playerState.lockedItems.includes(rawName) || playerState.lockedItems.includes(displayName));
    const initialFavorite = Array.isArray(playerState.favoriteItems) && (playerState.favoriteItems.includes(rawName) || playerState.favoriteItems.includes(displayName));
    const initialWished = Boolean(playerState.shopWishlist?.[rawName] || playerState.shopWishlist?.[displayName]);
    updateFlagUi(initialLocked, initialFavorite, initialWished);

    if (btnLock) {
        btnLock.onclick = async () => {
            const curState = getState();
            const currentlyLocked = Array.isArray(curState.lockedItems) && (curState.lockedItems.includes(rawName) || curState.lockedItems.includes(displayName));
            const nextLock = !currentlyLocked;
            try {
                btnLock.disabled = true;
                const res = await apiCall('/api/inventory/lock', 'POST', {
                    itemName: rawName,
                    locked: nextLock
                }, btnLock);
                const isNowLocked = res && res.locked !== undefined ? res.locked : nextLock;
                showToast(isNowLocked ? `Locked ${displayName}` : `Unlocked ${displayName}`, 'info');
                const current = getState();
                const favorite = Array.isArray(current.favoriteItems) && current.favoriteItems.includes(rawName);
                updateFlagUi(isNowLocked, favorite, Boolean(current.shopWishlist?.[rawName]));
                renderInventory();
            } catch (err) {
                showToast(err.message || 'Failed to update lock status', 'error');
            } finally {
                btnLock.disabled = false;
            }
        };
    }

    if (btnPin) {
        btnPin.onclick = async () => {
            const curState = getState();
            const currentlyFavorite = Array.isArray(curState.favoriteItems) && (curState.favoriteItems.includes(rawName) || curState.favoriteItems.includes(displayName));
            const nextFavorite = !currentlyFavorite;
            try {
                btnPin.disabled = true;
                const res = await apiCall('/api/inventory/pin', 'POST', {
                    itemName: rawName,
                    pinned: nextFavorite
                }, btnPin);
                const isNowFavorite = nextFavorite;
                showToast(isNowFavorite ? `Favorited ${displayName}` : `Removed ${displayName} from favorites`, 'info');
                const curLocked = Array.isArray(getState().lockedItems) && (getState().lockedItems.includes(rawName) || getState().lockedItems.includes(displayName));
                updateFlagUi(curLocked, isNowFavorite, Boolean(getState().shopWishlist?.[rawName]));
                renderInventory();
            } catch (err) {
                showToast(err.message || 'Failed to update pin status', 'error');
            } finally {
                btnPin.disabled = false;
            }
        };
    }

    if (btnWishlist) {
        btnWishlist.onclick = async () => {
            const wished = Boolean(getState().shopWishlist?.[rawName]);
            try {
                await doSetWishlist([rawName], !wished, btnWishlist);
                const current = getState();
                updateFlagUi(
                    Array.isArray(current.lockedItems) && current.lockedItems.includes(rawName),
                    Array.isArray(current.favoriteItems) && current.favoriteItems.includes(rawName),
                    !wished
                );
                showToast(!wished ? `Added ${displayName} to the restock wishlist` : `Removed ${displayName} from the wishlist`, 'success');
            } catch (error) {
                showToast(error.message || 'Could not update wishlist', 'error');
            }
        };
    }

    openDialog(modal, {
        initialFocus: '#btn-close-item-modal',
        closeOnBackdrop: true
    });

    const [descriptions, farmMaterials, whereUsed] = await Promise.all([
        fetchDescriptions(),
        fetchFarmMaterials(),
        doGetWhereUsed(rawName).catch(() => null)
    ]);
    if (requestId !== itemRequestId || !modal.open) return;
    const descText = descriptions[rawName] || descriptions[displayName] || 'An item gathered or crafted within Bconomy.';
    if (descEl) descEl.textContent = descText;
    if (whereUsedEl) {
        const direct = whereUsed?.direct || whereUsed?.recipes || [];
        const paths = whereUsed?.paths || [];
        whereUsedEl.innerHTML = direct.length
            ? `<div class="where-used-direct">${direct.map(recipe => `<button type="button" class="where-used-chip" data-where-used-recipe="${recipe.recipeId || recipe.id}">${recipe.outputName || displayItemName(recipe.outputItemId || recipe.id)}</button>`).join('')}</div>${paths.length ? `<details><summary>${paths.length} downstream path${paths.length === 1 ? '' : 's'}</summary><ul>${paths.slice(0, 20).map(path => `<li>${path.map(node => node.outputName || displayItemName(node.outputItemId)).join(' → ')}</li>`).join('')}</ul></details>` : ''}`
            : '<p class="text-subtle text-sm">No crafting recipes consume this item.</p>';
        whereUsedEl.querySelectorAll('[data-where-used-recipe]').forEach(button => button.addEventListener('click', async () => {
            closeItemModal();
            const { activateSection } = await import('../navigation.js');
            activateSection('crafting');
            const { openCraftingRecipe } = await import('./crafting.js');
            openCraftingRecipe(button.dataset.whereUsedRecipe);
        }));
    }

    // Set Collapsible Details values
    const boosterConfig = getBoosterConfig(rawName) || getBoosterConfig(displayName);
    const farmMaterial = farmMaterials[rawName] || farmMaterials[displayName] || null;

    const durationEl = document.getElementById('item-modal-duration');
    const effectEl = document.getElementById('item-modal-effect');
    const lootChanceEl = document.getElementById('item-modal-loot-chance');
    const dropStackEl = document.getElementById('item-modal-drop-stack');
    const marketRangeEl = document.getElementById('item-modal-market-range');

    const isBooster = isBoosterItem(rawName) || isBoosterItem(displayName) || !!boosterConfig;

    if (isBooster && boosterConfig) {
        const actionCapitalized = capitalize(boosterConfig.action || 'Gathering');
        const durLabelShort = boosterConfig.tier === 'T1' ? '15m' :
                              boosterConfig.tier === 'T2' ? '30m' :
                              boosterConfig.tier === 'T3' ? '1h' :
                              boosterConfig.tier === 'T4' ? '2h' :
                              boosterConfig.tier === 'T5' ? '4h' : '8h';

        if (durationRow) durationRow.classList.remove('hidden');
        if (durationEl) durationEl.textContent = getDurationLabel(boosterConfig.tier, boosterConfig.durationMs);

        if (effectRow) effectRow.classList.remove('hidden');
        if (effectEl) effectEl.textContent = `2× ${actionCapitalized} (${durLabelShort}) when used`;

        if (baseWorthEl) {
            const minBuy = boosterConfig.buyRange ? boosterConfig.buyRange[0] : 0;
            baseWorthEl.textContent = minBuy > 0 ? formatMoney(minBuy) : 'Priceless (Not in Shop)';
        }
    } else {
        if (durationRow) durationRow.classList.add('hidden');
        if (effectRow) effectRow.classList.add('hidden');

        // Estimate sellable base worth
        const sellPrices = playerState.shop ? playerState.shop.sellPrices : {};
        const currentSellPrice = sellPrices[rawName] || sellPrices[displayName] || 0;
        if (baseWorthEl) {
            baseWorthEl.textContent = currentSellPrice > 0 ? formatMoney(currentSellPrice) : 'N/A';
        }

        if (farmMaterial) {
            lootChanceRow?.classList.remove('hidden');
            dropStackRow?.classList.remove('hidden');
            marketRangeRow?.classList.remove('hidden');
            if (lootChanceEl) lootChanceEl.textContent = `${farmMaterial.dropChance}% per successful gathering action`;
            if (dropStackEl) {
                const [minimum, maximum] = farmMaterial.dropStack;
                dropStackEl.textContent = minimum === maximum
                    ? `${formatDisplayNumber(minimum)} per drop before multipliers`
                    : `${formatDisplayNumber(minimum)}–${formatDisplayNumber(maximum)} per drop before multipliers`;
            }
            if (marketRangeEl) {
                marketRangeEl.textContent = `Sell ${formatMoney(farmMaterial.sellRange[0])}–${formatMoney(farmMaterial.sellRange[1])} · Buy ${formatMoney(farmMaterial.buyRange[0])}–${formatMoney(farmMaterial.buyRange[1])}`;
            }
        }
    }

    // Action Section 1: Use Item
    const isMelon = rawName.toLowerCase() === 'melon';
    const isUsable = isBooster || isMelon;

    if (isUsable) {
        if (useSection) useSection.classList.remove('hidden');
        if (btnUse) {
            btnUse.classList.remove('hidden');
            if (isMelon) {
                btnUse.textContent = 'Use Melon (Reset Water Cooldown)';
            } else if (isBooster) {
                const actName = capitalize((boosterConfig && boosterConfig.action) || '');
                btnUse.textContent = `Activate Booster ${actName ? `(2× ${actName})` : ''}`;
            }
        }
    } else {
        if (useSection) useSection.classList.add('hidden');
        if (btnUse) {
            btnUse.classList.add('hidden');
            btnUse.onclick = null;
        }
    }

    // Action Section 2: Sell Item
    const sellQtyInput = document.getElementById('item-modal-sell-qty');
    const sellPayoutEl = document.getElementById('item-modal-sell-payout');

    const sellPrices = playerState.shop ? playerState.shop.sellPrices : {};
    const unitSellPrice = sellPrices[rawName] || sellPrices[displayName] || 0;
    const isSellable = unitSellPrice > 0 && !isBooster;

    if (isSellable) {
        if (sellSection) sellSection.classList.remove('hidden');
        if (btnConfirmSell) btnConfirmSell.classList.remove('hidden');
        const previewEl = document.getElementById('item-modal-sell-qty-preview');
        if (sellQtyInput) {
            sellQtyInput.value = 1;
        }
        const sellPresets = document.getElementById('item-modal-sell-presets');
        if (sellPresets) sellPresets.innerHTML = quantityPresetButtonsHtml({ systemId: 'shop-sell', subjectId: rawName, maxValue: qty, activeValue: 1, targetId: 'item-modal-sell-qty' });

        const getParsedQty = () => {
            const rawVal = sellQtyInput ? sellQtyInput.value.trim() : '1';
            const evalRes = evaluateMathExpression(rawVal, { max: qty, owned: qty });
            let parsed = 1;
            if (evalRes.success && typeof evalRes.value === 'number' && !isNaN(evalRes.value)) {
                parsed = Math.floor(evalRes.value);
            } else {
                parsed = parseInt(rawVal, 10) || 1;
            }
            return Math.min(qty, Math.max(1, parsed));
        };

        const updatePayout = () => {
            const requestedQty = getParsedQty();
            const payout = requestedQty * unitSellPrice;
            if (sellPayoutEl) sellPayoutEl.textContent = formatMoney(payout);
        };

        if (sellQtyInput) {
            attachMathInputPreview(sellQtyInput, previewEl, () => ({ max: qty, owned: qty }));
            sellQtyInput.oninput = () => {
                updatePayout();
            };
        }

        updatePayout();

        // Preset Chips
        const presetChips = sellSection.querySelectorAll('[data-quantity-preset]');
        presetChips.forEach(chip => {
            chip.onclick = () => {
                const type = chip.dataset.quantityPreset;
                if (type === 'max') {
                    sellQtyInput.value = qty;
                } else {
                    const targetNum = parseInt(type, 10) || 1;
                    sellQtyInput.value = Math.min(qty, targetNum);
                }
                updatePayout();
            };
        });

        if (btnConfirmSell) {
            btnConfirmSell.onclick = async () => {
                const requestedQty = getParsedQty();
                try {
                    const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'shop-sell', subjectId: rawName, quantity: requestedQty });
                    if (needsConfirmation) {
                        const confirmed = await showConfirmation('itemSellQuantity', 'Confirm sale', `Sell ${formatDisplayNumber(requestedQty)}× ${displayName} for ${formatMoney(requestedQty * unitSellPrice)}?`, { allowIgnore: false });
                        if (!confirmed) return;
                    }
                    btnConfirmSell.disabled = true;
                    const res = await apiCall('/api/shop/sell', 'POST', {
                        itemName: rawName,
                        quantity: requestedQty
                    }, btnConfirmSell);

                    if (res && res.result && res.result.success) {
                        showToast(`Sold ${formatDisplayNumber(requestedQty)}× ${displayName} for ${formatMoney(res.result.totalReceived)}!`, 'success');
                        addLogEntry(`Sold ${formatDisplayNumber(requestedQty)}× ${displayName} for ${formatMoney(res.result.totalReceived)}.`, 'system');
                        renderHeader();
                        renderInventory();
                        closeItemModal();
                    } else {
                        showToast((res && res.result && res.result.error) || 'Failed to sell item', 'error');
                    }
                } catch (err) {
                    showToast(err.message || 'Failed to sell item', 'error');
                } finally {
                    btnConfirmSell.disabled = false;
                }
            };
        }
    } else {
        if (sellSection) sellSection.classList.add('hidden');
        if (btnConfirmSell) {
            btnConfirmSell.classList.add('hidden');
            btnConfirmSell.onclick = null;
        }
    }

    // Use Button Click Handler
    if (btnUse && isUsable) {
        btnUse.onclick = async () => {
            try {
                btnUse.disabled = true;
                if (isMelon) {
                    await doUseMelon(btnUse);
                    showToast('Used 1 Melon! Water cooldown reset!', 'success');
                    addLogEntry('Used 1 Melon to reset global watering cooldown.', 'system');
                } else if (isBooster) {
                    const res = await doActivateBooster(rawName, btnUse);
                    if (res && res.result) {
                        showToast(`Activated ${displayName}!`, 'success');
                        addLogEntry(`Activated ${displayName}!`, 'rare');
                    }
                }
                renderAll();
                renderInventory();
                closeItemModal();
            } catch (err) {
                showToast(err.message || 'Failed to use item', 'error');
            } finally {
                btnUse.disabled = false;
            }
        };
    }

};

export const closeItemModal = () => {
    itemRequestId += 1;
    const modal = document.getElementById('item-details-modal');
    closeDialog(modal, { reason: 'close' });
};

export const setupItemModalListeners = () => {
    const modal = document.getElementById('item-details-modal');
    const btnClose = document.getElementById('btn-close-item-modal');
    const btnFooterClose = document.getElementById('btn-item-modal-close-footer');
    if (!modal) return;

    if (btnClose) btnClose.addEventListener('click', closeItemModal);
    if (btnFooterClose) btnFooterClose.addEventListener('click', closeItemModal);
};
