/**
 * @module ui/shop
 * Render module for the Bconomy System Shop & Loot Booster UI.
 */
import { getState } from '../state.js';
import { formatNumberCommas, formatDisplayNumber, formatMoney, displayItemName, getItemCategory, getItemIcon, iconHtml, isBoosterItem } from '../utils.js';
import {
    doGetShopState, doForceRestock, doBuyShopItem, doSellShopItem, doBuyBooster, doActivateBooster,
    doPreviewBulkSell, doExecuteBulkSell, doPreviewBulkBuy, doExecuteBulkBuy,
    doGetItemCatalog, doSetWishlist, doPreviewExtendActiveBoosters, doExtendActiveBoosters
} from '../api.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { renderAll } from './header.js';
import { openDialog, closeDialog, replaceDialog, setConfirmationIgnored, shouldSkipBulkPreview, showConfirmation } from './modal.js';
import { setupCollapsibleSearch } from './collapsibleSearch.js';
import { quantityPresetButtonsHtml } from './quantityPresets.js';
import { getStoredSettings, shouldConfirmQuantityOperation } from '../preferences.js';

let currentSubTab = 'buy'; // 'buy' or 'sell'
const defaultShopViewState = () => ({
    buySearch: '',
    sellSearch: '',
    buyCategory: 'all',
    sellCategory: 'all',
    availability: 'available',
    buySort: 'availability',
    sellSort: 'availability',
    bulkBuyStrategy: 'lowestPrice'
});
let shopViewState = defaultShopViewState();
let bulkModalMode = 'sell'; // 'sell' or 'buy'
let lastBulkOptions = null;
let lastBulkPreviewPayload = null;
let restockTimerInterval = null;
let boosterTimerInterval = null;
let itemCatalog = null;
const persistentShopBindings = new WeakMap();

const bindPersistentShopEvent = (element, eventName, handler) => {
    if (!element) return;
    const boundEvents = persistentShopBindings.get(element) || new Set();
    if (boundEvents.has(eventName)) return;
    boundEvents.add(eventName);
    persistentShopBindings.set(element, boundEvents);
    element.addEventListener(eventName, handler);
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getQuantityInputId = (mode, itemName) => `${mode}-qty-${encodeURIComponent(String(itemName)).replace(/%/g, '_')}`;

export const renderShop = async ({ resetControls = false } = {}) => {
    const shopContainer = document.getElementById('panel-shop');
    if (!shopContainer) return;
    if (resetControls) {
        currentSubTab = 'buy';
        shopViewState = defaultShopViewState();
    }

    // Fetch latest state from server (triggers time-gated restock if deadline passed)
    let state = getState();
    let sellRolls = {};
    try {
        const res = await doGetShopState();
        if (res && res.state) {
            state = res.state;
            sellRolls = res.sellRolls || {};
        }
    } catch (err) {
        console.error('Failed to sync shop state:', err);
    }

    const shop = state.shop || {};
    const buyListings = shop.buyListings || {};
    const sellPrices = shop.sellPrices || {};
    const boosterListings = shop.boosterListings || {};
    const inventory = state.inventory || {};
    const boosters = state.boosters || {};
    const wishlist = state.shopWishlist || {};
    notifyWishlistAvailability(state, buyListings, boosterListings);
    const buyCategories = [...new Set(Object.keys(buyListings).map(getItemCategory))].sort();
    const sellableNames = Object.keys(inventory).filter(name => Number(inventory[name]) > 0 && Number(sellPrices[name]) > 0 && !isBoosterItem(name));
    const sellCategories = [...new Set(sellableNames.map(getItemCategory))].sort();
    const categoryOptions = categories => ['<option value="all">All categories</option>', ...categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))}</option>`)].join('');

    // ── Restock Timer Logic ──
    const now = Date.now();
    const nextRestockAt = shop.nextRestockAt || (now + 600000);
    const remainingMs = Math.max(0, nextRestockAt - now);

    let html = `
        <div class="shop-wrapper">
            <div class="section-header">
                <div>
                    <h2 id="panel-shop-heading">System Shop & Market</h2>
                    <p class="section-desc">Buy rotating stock, sell gathered inventory, and manage loot boosters.</p>
                </div>
            </div>

            <div class="summary-rail shop-summary-rail" aria-label="Market summary">
                <div class="summary-metric"><span class="summary-label">Available Cash</span><strong class="summary-value" title="${formatNumberCommas(state.cash || 0)}">${formatMoney(state.cash || 0)}</strong></div>
                <div class="summary-metric"><span class="summary-label">Next Restock</span><strong class="summary-value" id="shop-restock-timer">${formatCountdown(remainingMs)}</strong></div>
                <div class="summary-metric"><span class="summary-label">Buy Listings</span><strong class="summary-value">${formatDisplayNumber(Object.keys(buyListings).length + Object.keys(boosterListings).length)}</strong></div>
                <div class="summary-action shop-summary-actions"><button id="btn-manage-shop-wishlist" class="action-btn secondary-btn" type="button"><iconify-icon icon="lucide:bookmark" aria-hidden="true"></iconify-icon> Wishlist (${Object.keys(wishlist).length})</button><button id="btn-force-restock-shop" class="action-btn secondary-btn" type="button" title="Restock shop items and boosters immediately"><iconify-icon icon="lucide:refresh-cw" aria-hidden="true"></iconify-icon> Restock Now</button></div>
            </div>

            <!-- Trade mode selector and utility action -->
            <div class="shop-tabs shop-command-tabs">
                <div class="shop-tab-group" role="tablist" aria-label="Shop trade mode">
                    <button id="shop-tab-buy" class="shop-tab-btn ${currentSubTab === 'buy' ? 'active' : ''}" type="button" role="tab" aria-selected="${currentSubTab === 'buy'}" aria-controls="shop-subpanel-buy">
                        <iconify-icon icon="lucide:shopping-bag" aria-hidden="true"></iconify-icon> Buy Shop
                    </button>
                    <button id="shop-tab-sell" class="shop-tab-btn ${currentSubTab === 'sell' ? 'active' : ''}" type="button" role="tab" aria-selected="${currentSubTab === 'sell'}" aria-controls="shop-subpanel-sell">
                        <iconify-icon icon="lucide:arrow-up-right" aria-hidden="true"></iconify-icon> Sell Market
                    </button>
                </div>
                <div class="bulk-actions-wrapper">
                    <button id="btn-open-bulk-actions" class="action-btn primary-btn btn-bulk-launch" type="button" title="Configure and execute bulk buy or sell actions">
                        <iconify-icon icon="lucide:layers" aria-hidden="true"></iconify-icon> Bulk Actions
                    </button>
                </div>
            </div>

            <!-- Buy Panel -->
            <div id="shop-subpanel-buy" class="shop-subpanel ${currentSubTab === 'buy' ? '' : 'hidden'}" role="tabpanel" aria-labelledby="shop-tab-buy">
                <!-- Active Boosters HUD Section -->
                ${renderActiveBoostersHUD(boosters, now)}

                <!-- Loot Booster Shop Section -->
                <div class="section-divider mb-4">
                    <h3><iconify-icon icon="lucide:zap" aria-hidden="true"></iconify-icon> Loot Boosters Shop (T1–T4)</h3>
                    <p class="section-subtext">Action-specific boosters provide 2× loot yield. Boosters cannot be sold back to the shop.</p>
                </div>
                <div class="booster-shop-grid mb-8">
                    ${renderBoosterListings(boosterListings, wishlist)}
                </div>

                <!-- Normal Items Buy Shop -->
                <div class="section-divider mb-4">
                    <h3><iconify-icon icon="lucide:boxes" aria-hidden="true"></iconify-icon> Items Stock Catalog</h3>
                    <p class="section-subtext">Purchasing stock does not trigger crop-claim bonuses or item action effects.</p>
                </div>
                <div class="page-toolbar shop-catalog-toolbar mb-4" data-toolbar-mode="buy" aria-label="Buy catalog controls">
                    <label class="toolbar-search" for="buy-search-input"><span class="sr-only">Search buy listings</span><iconify-icon icon="lucide:search" aria-hidden="true"></iconify-icon><input type="search" id="buy-search-input" name="buy-search" autocomplete="off" class="search-input" placeholder="Search buy listings…" value="${escapeHtml(shopViewState.buySearch)}"></label>
                    <label class="toolbar-field" for="buy-category-filter"><span>Category</span><select id="buy-category-filter" class="form-select" name="buy-category" autocomplete="off">${categoryOptions(buyCategories)}</select></label>
                    <label class="toolbar-field" for="buy-availability-filter"><span>Availability</span><select id="buy-availability-filter" class="form-select" name="buy-availability" autocomplete="off"><option value="available">Available first</option><option value="all">Show all</option><option value="unavailable">Unavailable only</option><option value="wishlist">Wishlist only</option></select></label>
                    <label class="toolbar-field" for="buy-sort"><span>Sort</span><select id="buy-sort" class="form-select" name="buy-sort" autocomplete="off"><option value="availability">Availability</option><option value="name">Name A–Z</option><option value="price">Price: Low to High</option><option value="amount">Stock: High to Low</option><option value="category">Category</option></select></label>
                </div>
                <div class="shop-items-grid" id="buy-items-grid">
                    ${renderBuyItemsGrid(buyListings, wishlist)}
                </div>
            </div>

            <!-- Sell Panel -->
            <div id="shop-subpanel-sell" class="shop-subpanel ${currentSubTab === 'sell' ? '' : 'hidden'}" role="tabpanel" aria-labelledby="shop-tab-sell">
                <div class="section-divider mb-4">
                    <h3><iconify-icon icon="lucide:coins" aria-hidden="true"></iconify-icon> Sell Inventory Items</h3>
                    <p class="section-subtext">Current market sell prices are fixed per restock cycle. Boosters cannot be sold.</p>
                </div>
                <div class="page-toolbar shop-catalog-toolbar mb-4" data-toolbar-mode="sell" aria-label="Sell catalog controls">
                    <label class="toolbar-search" for="sell-search-input"><span class="sr-only">Search sell listings</span><iconify-icon icon="lucide:search" aria-hidden="true"></iconify-icon><input type="search" id="sell-search-input" name="sell-search" autocomplete="off" class="search-input" placeholder="Search sellable inventory…" value="${escapeHtml(shopViewState.sellSearch)}"></label>
                    <label class="toolbar-field" for="sell-category-filter"><span>Category</span><select id="sell-category-filter" class="form-select" name="sell-category" autocomplete="off">${categoryOptions(sellCategories)}</select></label>
                    <label class="toolbar-field" for="sell-sort"><span>Sort</span><select id="sell-sort" class="form-select" name="sell-sort" autocomplete="off"><option value="availability">Owned Quantity</option><option value="name">Name A–Z</option><option value="price">Payout: Low to High</option><option value="amount">Owned: High to Low</option><option value="category">Category</option></select></label>
                </div>
                <div class="shop-items-grid" id="sell-items-grid">
                    ${renderSellItemsGrid(inventory, sellPrices, sellRolls)}
                </div>
            </div>
        </div>
    `;

    const ledgerMain = shopContainer.closest('.ledger-main');
    const mainScrollTop = ledgerMain ? ledgerMain.scrollTop : 0;
    shopContainer.innerHTML = html;

    // Attach Event Listeners
    setupShopEventListeners();
    startRestockCountdownTimer(nextRestockAt);
    startBoosterCountdownTimers();

    // Restore scroll position after transaction-driven re-render.
    if (ledgerMain) ledgerMain.scrollTop = mainScrollTop;
};

const formatCountdown = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const startRestockCountdownTimer = (nextRestockAt) => {
    if (restockTimerInterval) clearInterval(restockTimerInterval);

    restockTimerInterval = setInterval(() => {
        const timerEl = document.getElementById('shop-restock-timer');
        const remaining = Math.max(0, nextRestockAt - Date.now());
        if (timerEl) {
            timerEl.textContent = formatCountdown(remaining);
        }
        if (remaining <= 0) {
            clearInterval(restockTimerInterval);
            renderShop();
        }
    }, 1000);
};

const startBoosterCountdownTimers = () => {
    if (boosterTimerInterval) clearInterval(boosterTimerInterval);

    boosterTimerInterval = setInterval(() => {
        const timerEls = document.querySelectorAll('.tag-timer[data-expire]');
        if (timerEls.length === 0) {
            clearInterval(boosterTimerInterval);
            return;
        }

        const now = Date.now();
        let anyExpired = false;

        timerEls.forEach(el => {
            const expireAt = parseInt(el.dataset.expire, 10);
            const remaining = Math.max(0, expireAt - now);
            el.textContent = formatCountdown(remaining);

            if (remaining <= 0) {
                anyExpired = true;
                const tag = el.closest('.booster-tag');
                if (tag) {
                    tag.style.opacity = '0.4';
                    tag.style.transition = 'opacity 0.5s ease';
                }
            }
        });

        if (anyExpired) {
            setTimeout(() => {
                clearInterval(boosterTimerInterval);
                renderShop();
            }, 2000);
        }
    }, 1000);
};

const availableWishlistItems = (wishlist, buyListings, boosterListings) => Object.keys(wishlist || {}).filter(itemName => {
    const item = buyListings[itemName];
    const booster = boosterListings[itemName];
    return Boolean((item?.available && item.stock > 0) || (booster?.available && (booster.stock === null || booster.stock === Infinity || booster.stock > 0)));
});

const notifyWishlistAvailability = (state, buyListings, boosterListings) => {
    const wishlist = state.shopWishlist || {};
    const available = availableWishlistItems(wishlist, buyListings, boosterListings);
    const settings = getStoredSettings().shopQol;
    let notice = [];
    try {
        const prior = new Set(JSON.parse(localStorage.getItem('bconomy_wishlist_available') || '[]'));
        const alertedMemberships = JSON.parse(localStorage.getItem('bconomy_wishlist_membership_alerts') || '{}');
        const restockKey = String(state.shop?.nextRestockAt || 0);
        if (settings.wishlistAlertMode === 'everyRestock') {
            if (localStorage.getItem('bconomy_wishlist_restock_alert') !== restockKey) notice = available;
            localStorage.setItem('bconomy_wishlist_restock_alert', restockKey);
        } else if (settings.wishlistAlertMode === 'oncePerMembership') {
            notice = available.filter(id => alertedMemberships[id] !== wishlist[id]?.addedAt);
            for (const id of notice) alertedMemberships[id] = wishlist[id]?.addedAt;
            localStorage.setItem('bconomy_wishlist_membership_alerts', JSON.stringify(alertedMemberships));
        } else {
            notice = available.filter(id => !prior.has(id));
        }
        localStorage.setItem('bconomy_wishlist_available', JSON.stringify(available));
    } catch (_) { /* Storage may be unavailable; highlighting still works. */ }
    if (notice.length) showToast(`${notice.length} wishlist item${notice.length === 1 ? '' : 's'} available: ${notice.slice(0, 3).map(displayItemName).join(', ')}${notice.length > 3 ? '…' : ''}`, 'success');
};

const sellRollMarkup = roll => {
    const preferences = getStoredSettings().shopQol.sellRoll;
    if (!roll || roll.fixed || preferences.display === 'off') return roll?.fixed ? '<span class="sell-roll-fixed">Fixed price</span>' : '';
    const percentage = Math.round(roll.percentage);
    const band = percentage >= preferences.greatThreshold ? 'great' : percentage >= preferences.mediumThreshold ? 'medium' : 'terrible';
    const color = preferences.colors[band];
    const badge = `<span class="sell-roll-badge" style="--sell-roll-color:${color}" title="${percentage}% through the current ${formatMoney(roll.min)}–${formatMoney(roll.max)} sell range">${percentage}% · ${band}</span>`;
    const bar = `<span class="sell-roll-track" role="progressbar" aria-label="Sell price roll" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentage}" aria-valuetext="${percentage}% through the price range · ${band} deal" title="${percentage}% · ${band} deal"><span style="width:${percentage}%;--sell-roll-color:${color}"></span></span>`;
    if (preferences.display === 'badge') return badge;
    if (preferences.display === 'bar') return bar;
    return `<span class="sell-roll-indicator">${badge}${bar}</span>`;
};

const openWishlistManager = async () => {
    if (!itemCatalog) {
        const response = await doGetItemCatalog();
        itemCatalog = response.items || [];
    }
    let dialog = document.getElementById('shop-wishlist-dialog');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'shop-wishlist-dialog';
        dialog.className = 'modal hidden';
        dialog.dataset.appDialog = '';
        document.body.appendChild(dialog);
    }
    const renderManager = (query = '') => {
        const wished = getState().shopWishlist || {};
        const candidates = itemCatalog.filter(item => item.shopEligible || item.sellable || item.category === 'booster')
            .filter(item => !query || item.displayName.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase()));
        dialog.innerHTML = `<div class="modal-content card charter-modal modal-dialog modal-wide"><div class="modal-header"><div class="modal-header-title"><iconify-icon icon="lucide:bookmark" class="modal-icon" aria-hidden="true"></iconify-icon><h3>Shop Restock Wishlist</h3></div><button class="modal-close-btn" type="button" data-wishlist-close aria-label="Close wishlist"><iconify-icon icon="lucide:x" aria-hidden="true"></iconify-icon></button></div>
            <div class="modal-body"><label class="toolbar-search wishlist-search"><iconify-icon icon="lucide:search" aria-hidden="true"></iconify-icon><span class="sr-only">Search shop wishlist</span><input id="wishlist-search" name="wishlist-search" class="search-input" type="search" autocomplete="off" placeholder="Search shop items…" value="${escapeHtml(query)}"></label><p class="text-subtle text-sm">Wishlisted listings are highlighted after every restock. Alerts follow your Settings preference.</p><div class="wishlist-manager-grid">${candidates.map(item => `<button class="wishlist-manager-item ${wished[item.id] ? 'is-wished' : ''}" type="button" data-wishlist-item="${escapeHtml(item.id)}" aria-pressed="${Boolean(wished[item.id])}">${iconHtml(getItemIcon(item.id))}<span>${escapeHtml(item.displayName)}</span>${iconHtml(wished[item.id] ? 'lucide:bookmark-check' : 'lucide:bookmark-plus')}</button>`).join('')}</div></div></div>`;
        dialog.querySelector('[data-wishlist-close]')?.addEventListener('click', () => closeDialog(dialog, { reason: 'close' }));
        dialog.querySelector('#wishlist-search')?.addEventListener('input', event => renderManager(event.target.value));
        dialog.querySelectorAll('[data-wishlist-item]').forEach(button => button.addEventListener('click', async () => {
            const wishedNow = Boolean(getState().shopWishlist?.[button.dataset.wishlistItem]);
            try {
                await doSetWishlist([button.dataset.wishlistItem], !wishedNow, button);
                renderManager(dialog.querySelector('#wishlist-search')?.value || '');
                await renderShop();
            } catch (error) { showToast(error.message || 'Could not update wishlist', 'error'); }
        }));
    };
    renderManager();
    openDialog(dialog, { initialFocus: '#wishlist-search', closeOnBackdrop: true });
};

const renderActiveBoostersHUD = (boosters, now) => {
    const activeList = [];
    const activeUntil = (boosters && boosters.activeUntil) || {};

    const actionIcons = { mine: 'pickaxe', explore: 'compass', fish: 'fish', hunt: 'target' };

    for (const [action, tiers] of Object.entries(activeUntil)) {
        for (const [tier, expireTime] of Object.entries(tiers)) {
            if (typeof expireTime === 'number' && expireTime > now) {
                const remaining = expireTime - now;
                activeList.push({
                    action,
                    tier,
                    expireTime,
                    remaining
                });
            }
        }
    }

    if (activeList.length === 0) {
        return `
            <div class="active-boosters-hud card charter-card mb-6">
                <div class="hud-header">
                    <iconify-icon icon="lucide:flame" class="hud-icon" aria-hidden="true"></iconify-icon>
                    <span>Active Loot Boosters</span>
                </div>
                <p class="hud-empty">No active boosters. Purchase T1–T4 boosters from the shop below and activate them from your inventory.</p>
            </div>
        `;
    }

    return `
        <div class="active-boosters-hud card charter-card mb-6">
            <div class="hud-header">
                <iconify-icon icon="lucide:flame" class="hud-icon active-flame" aria-hidden="true"></iconify-icon>
                <span>Active Loot Boosters</span>
                <button id="btn-extend-active-boosters" class="action-btn primary-btn btn-sm" type="button"><iconify-icon icon="lucide:timer-reset" aria-hidden="true"></iconify-icon> Extend All Active Boosters</button>
            </div>
            <div class="active-boosters-tags">
                ${activeList.map(b => `
                    <div class="booster-tag action-${b.action}" data-booster-expire="${b.expireTime}">
                        <iconify-icon icon="lucide:${actionIcons[b.action] || 'zap'}" aria-hidden="true"></iconify-icon>
                        <span class="tag-name">${b.action.toUpperCase()} ${b.tier}</span>
                        <span class="tag-multiplier">2× Yield</span>
                        <span class="tag-timer" data-expire="${b.expireTime}">${formatCountdown(b.remaining)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

// ── Bulk Actions Modal & Rendering Logic ──

// Shared market-card renderer keeps booster, buy, and sell listings aligned.
const renderBoosterListings = (boosterListings, wishlist = {}) => {
    const keys = Object.keys(boosterListings);
    if (keys.length === 0) {
        return `<div class="empty-state-card card charter-card"><iconify-icon icon="lucide:zap-off" class="empty-icon" aria-hidden="true"></iconify-icon><h4>No Booster Listings</h4><p>A fresh selection will appear at the next restock.</p></div>`;
    }

    return keys.map((boosterName) => {
        const listing = boosterListings[boosterName];
        if (!listing) return '';

        const actionIcons = { mine: 'pickaxe', explore: 'compass', fish: 'fish', hunt: 'target' };
        const actionIcon = actionIcons[listing.action] || 'zap';
        const durationMins = Math.round((Number(listing.durationMs) || 0) / 60000);
        const isUnlimited = listing.stock === Infinity || listing.stock === null || listing.stock === 'Unlimited' || ['T1', 'T2', 'T3'].includes(listing.tier);
        const isOutOfStock = !isUnlimited && (!listing.available || listing.stock <= 0);
        const stockText = isUnlimited ? 'Unlimited' : formatDisplayNumber(listing.stock);
        const displayName = escapeHtml(displayItemName(boosterName));
        const actionName = escapeHtml(String(listing.action || 'loot').toUpperCase());

        return `
            <article class="market-card booster-card card ${isOutOfStock ? 'out-of-stock' : ''} ${wishlist[boosterName] ? 'wishlist-highlight' : ''}" data-name="${escapeHtml(boosterName.toLowerCase())}" data-wishlist="${Boolean(wishlist[boosterName])}">
                <div class="market-card-header">
                    <div class="market-item-identity">
                        <span class="market-item-icon item-icon-wrap" data-cat="booster">${iconHtml(`lucide:${actionIcon}`, 'item-icon')}</span>
                        <div class="market-item-copy">
                            <h4 class="item-title">${displayName}</h4>
                            <span class="market-item-meta">${durationMins}m duration · 2× loot yield</span>
                        </div>
                    </div>
                    <div class="market-badge-stack">${wishlist[boosterName] ? '<span class="badge wishlist-badge"><iconify-icon icon="lucide:bookmark-check" aria-hidden="true"></iconify-icon> Wishlist</span>' : ''}<span class="badge tier-badge">${escapeHtml(listing.tier)}</span><span class="badge action-badge">${actionName}</span></div>
                </div>
                <dl class="market-card-metrics">
                    <div><dt>Unit price</dt><dd>${formatMoney(listing.buyPrice)}</dd></div>
                    <div><dt>Stock</dt><dd class="${isOutOfStock ? 'text-danger' : 'text-success'}">${isOutOfStock ? 'No stock' : stockText}</dd></div>
                </dl>
                <div class="market-card-action"><button class="action-btn ${isOutOfStock ? 'secondary-btn' : 'primary-btn'} btn-full btn-buy-booster" data-booster="${escapeHtml(boosterName)}" ${isOutOfStock ? 'disabled' : ''} type="button">${isOutOfStock ? 'Out of Stock' : 'Buy Booster'}</button></div>
            </article>`;
    }).join('');
};

const renderBuyItemsGrid = (buyListings, wishlist = {}) => {
    const items = Object.keys(buyListings);
    if (items.length === 0) {
        return `<div class="empty-state-card card charter-card"><iconify-icon icon="lucide:package-open" class="empty-icon" aria-hidden="true"></iconify-icon><h4>No Items in Stock</h4><p>Check back after the next restock for a new catalog.</p></div>`;
    }

    return items.map((itemName) => {
        const listing = buyListings[itemName];
        if (!listing) return '';

        const isOutOfStock = !listing.available || listing.stock <= 0;
        const inputId = getQuantityInputId('buy', itemName);
        const displayName = escapeHtml(displayItemName(itemName));
        const category = getItemCategory(itemName);
        const categoryLabel = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));

        return `
            <article class="market-card shop-item-card card ${isOutOfStock ? 'out-of-stock' : ''} ${wishlist[itemName] ? 'wishlist-highlight' : ''}" data-name="${escapeHtml(itemName.toLowerCase())}" data-category="${escapeHtml(category)}" data-available="${String(!isOutOfStock)}" data-wishlist="${Boolean(wishlist[itemName])}" data-price="${Number(listing.buyPrice) || 0}" data-amount="${Number(listing.stock) || 0}">
                <div class="market-card-header">
                    <div class="market-item-identity">
                        <span class="market-item-icon item-icon-wrap" data-cat="${escapeHtml(category)}">${iconHtml(getItemIcon(itemName), 'item-icon')}</span>
                        <div class="market-item-copy">
                            <h4 class="item-title">${displayName}</h4>
                            <span class="market-item-meta">${categoryLabel}</span>
                        </div>
                    </div>
                    <div class="market-badge-stack">${wishlist[itemName] ? '<span class="badge wishlist-badge"><iconify-icon icon="lucide:bookmark-check" aria-hidden="true"></iconify-icon> Wishlist</span>' : ''}<span class="stock-badge ${isOutOfStock ? 'badge-red' : 'badge-green'}">${isOutOfStock ? 'No stock' : `${formatDisplayNumber(listing.stock)} in stock`}</span></div>
                </div>
                <dl class="market-card-metrics">
                    <div><dt>Unit price</dt><dd>${formatMoney(listing.buyPrice)}</dd></div>
                    <div><dt>Availability</dt><dd>${isOutOfStock ? 'Unavailable' : 'Ready to buy'}</dd></div>
                </dl>
                <div class="market-card-action">
                    ${isOutOfStock ? '<button class="action-btn secondary-btn btn-full" disabled type="button">Out of Stock</button>' : `
                    <div class="qty-input-group">
                        <input type="number" class="qty-input buy-qty-input" id="${inputId}" name="${inputId}" aria-label="Quantity of ${displayName} to buy" inputmode="numeric" min="1" max="${listing.stock}" value="1">
                        ${quantityPresetButtonsHtml({ systemId: 'shop-buy', subjectId: itemName, maxValue: listing.stock, activeValue: 1, targetId: inputId })}
                    </div>
                    <button class="action-btn primary-btn btn-buy-item" data-item="${escapeHtml(itemName)}" type="button">Buy Item</button>`}
                </div>
            </article>`;
    }).join('');
};

const renderSellItemsGrid = (inventory, sellPrices, sellRolls = {}) => {
    const ownedItems = Object.entries(inventory).filter(([itemName, quantity]) => quantity > 0 && !isBoosterItem(itemName) && Number.isFinite(Number(sellPrices[itemName])) && Number(sellPrices[itemName]) > 0);
    if (ownedItems.length === 0) {
        return `<div class="empty-state-card card charter-card"><iconify-icon icon="lucide:package-open" class="empty-icon" aria-hidden="true"></iconify-icon><h4>No Sellable Items</h4><p>Gather materials or harvest crops to create a sellable inventory.</p></div>`;
    }

    return ownedItems.map(([itemName, ownedQty]) => {
        const unitSellPrice = sellPrices[itemName];
        const inputId = getQuantityInputId('sell', itemName);
        const displayName = escapeHtml(displayItemName(itemName));
        const category = getItemCategory(itemName);
        const categoryLabel = escapeHtml(category.charAt(0).toUpperCase() + category.slice(1));

        return `
            <article class="market-card shop-item-card sell-card card" data-name="${escapeHtml(itemName.toLowerCase())}" data-category="${escapeHtml(category)}" data-available="true" data-price="${Number(unitSellPrice) || 0}" data-amount="${Number(ownedQty) || 0}">
                <div class="market-card-header">
                    <div class="market-item-identity">
                        <span class="market-item-icon item-icon-wrap" data-cat="${escapeHtml(category)}">${iconHtml(getItemIcon(itemName), 'item-icon')}</span>
                        <div class="market-item-copy">
                            <h4 class="item-title">${displayName}</h4>
                            <span class="market-item-meta">${categoryLabel}</span>
                        </div>
                    </div>
                    <span class="stock-badge badge-blue">${formatDisplayNumber(ownedQty)} owned</span>
                </div>
                <dl class="market-card-metrics">
                    <div><dt>Unit payout</dt><dd class="text-success">+${formatMoney(unitSellPrice)}</dd></div>
                    <div><dt>Available</dt><dd>${formatDisplayNumber(ownedQty)} units</dd></div>
                </dl>
                ${sellRollMarkup(sellRolls[itemName])}
                <div class="market-card-action">
                    <div class="qty-input-group">
                        <input type="number" class="qty-input sell-qty-input" id="${inputId}" name="${inputId}" aria-label="Quantity of ${displayName} to sell" inputmode="numeric" min="1" max="${ownedQty}" value="1">
                        ${quantityPresetButtonsHtml({ systemId: 'shop-sell', subjectId: itemName, maxValue: ownedQty, activeValue: 1, targetId: inputId })}
                    </div>
                    <button class="action-btn success-btn btn-sell-item" data-item="${escapeHtml(itemName)}" type="button">Sell Item</button>
                </div>
            </article>`;
    }).join('');
};

export const openBulkActionsModal = (initialMode = 'sell', { selectedItems = null } = {}) => {
    bulkModalMode = initialMode;
    if (Array.isArray(selectedItems)) sessionStorage.setItem('bconomy_bulk_sell_selection', JSON.stringify(selectedItems));
    const modal = document.getElementById('bulk-actions-modal');
    if (!modal) return;

    renderBulkModalContent();
    openDialog(modal, {
        initialFocus: `#bulk-mode-${bulkModalMode}`,
        closeOnBackdrop: false,
        onClose: reason => {
            if (reason !== 'replaced') {
                lastBulkOptions = null;
                lastBulkPreviewPayload = null;
            }
        }
    });
};

const closeBulkActionsModal = ({ restoreFocus = true } = {}) => {
    const modal = document.getElementById('bulk-actions-modal');
    closeDialog(modal, { reason: 'cancel', restoreFocus });
    lastBulkOptions = null;
    lastBulkPreviewPayload = null;
};

const getBulkPreviewKey = mode => mode === 'sell' ? 'bulkShopSell' : 'bulkShopBuy';

const updateBulkPrimaryAction = () => {
    const button = document.getElementById('btn-bulk-preview');
    if (!button) return;
    button.innerHTML = shouldSkipBulkPreview(getBulkPreviewKey(bulkModalMode))
        ? '<iconify-icon icon="lucide:check-circle" aria-hidden="true"></iconify-icon> Execute Bulk Action'
        : '<iconify-icon icon="lucide:calculator" aria-hidden="true"></iconify-icon> Preview Bulk Action';
};

const renderBulkModalContent = () => {
    const body = document.getElementById('bulk-modal-body');
    const tabSell = document.getElementById('bulk-mode-sell');
    const tabBuy = document.getElementById('bulk-mode-buy');
    if (!body) return;

    if (tabSell && tabBuy) {
        tabSell.classList.toggle('active', bulkModalMode === 'sell');
        tabBuy.classList.toggle('active', bulkModalMode === 'buy');
        tabSell.setAttribute('aria-selected', String(bulkModalMode === 'sell'));
        tabBuy.setAttribute('aria-selected', String(bulkModalMode === 'buy'));
        tabSell.setAttribute('tabindex', bulkModalMode === 'sell' ? '0' : '-1');
        tabBuy.setAttribute('tabindex', bulkModalMode === 'buy' ? '0' : '-1');
    }

    const state = getState();
    const inventory = state.inventory || {};
    const shop = state.shop || {};
    const sellPrices = shop.sellPrices || {};
    const buyListings = shop.buyListings || {};
    const boosterListings = shop.boosterListings || {};

    if (bulkModalMode === 'sell') {
        const ownedItems = Object.entries(inventory).filter(([k, v]) => v > 0 && !isBoosterItem(k) && sellPrices[k] !== undefined);
        let requestedSelection = null;
        try {
            const stored = JSON.parse(sessionStorage.getItem('bconomy_bulk_sell_selection') || 'null');
            if (Array.isArray(stored)) requestedSelection = new Set(stored);
        } catch (_) { /* Ignore malformed one-time UI state. */ }
        sessionStorage.removeItem('bconomy_bulk_sell_selection');
        const initiallyChecked = name => requestedSelection ? requestedSelection.has(name) : true;
        
        body.innerHTML = `
            <div class="bulk-presets-bar mb-3">
                <span class="bulk-presets-label">Smart Presets:</span>
                <button type="button" class="preset-chip active" id="preset-sell-all">
                    <iconify-icon icon="lucide:check-square" aria-hidden="true"></iconify-icon> All Items
                </button>
                <button type="button" class="preset-chip" id="preset-sell-keep1">
                    <iconify-icon icon="lucide:shield" aria-hidden="true"></iconify-icon> Keep 1 of Each
                </button>
                <button type="button" class="preset-chip" id="preset-sell-deselect">
                    <iconify-icon icon="lucide:square" aria-hidden="true"></iconify-icon> Deselect All
                </button>
            </div>

            <div class="bulk-strategy-bar mb-3">
                <span class="bulk-strategy-label">Select inventory items to liquidate:</span>
                <div class="bulk-selection-actions">
                    <button id="bulk-sell-select-all" class="action-btn secondary-btn" type="button">
                        <iconify-icon icon="lucide:check-square" aria-hidden="true"></iconify-icon> Select All
                    </button>
                    <button id="bulk-sell-deselect-all" class="action-btn secondary-btn" type="button">
                        <iconify-icon icon="lucide:square" aria-hidden="true"></iconify-icon> Deselect All
                    </button>
                </div>
            </div>

            <div class="bulk-table-wrapper">
                <table class="bulk-table">
                    <thead>
                        <tr>
                            <th class="bulk-select-cell"><input type="checkbox" id="bulk-sell-master-check" aria-label="Select all sellable items" ${ownedItems.length > 0 && ownedItems.every(([name]) => initiallyChecked(name)) ? 'checked' : ''} /></th>
                            <th>Item Name</th>
                            <th>Owned Qty</th>
                            <th>Reserve Qty</th>
                            <th>Unit Payout</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ownedItems.length === 0 ? `<tr><td colspan="5" class="bulk-empty-cell">No sellable items in inventory</td></tr>` : 
                            ownedItems.map(([name, qty]) => `
                            <tr class="bulk-item-row">
                                <td class="bulk-select-cell"><input type="checkbox" class="bulk-sell-item-check" data-item="${escapeHtml(name)}" aria-label="Select ${escapeHtml(displayItemName(name))} to sell" ${initiallyChecked(name) ? 'checked' : ''} /></td>
                                <td><b>${escapeHtml(displayItemName(name))}</b></td>
                                <td>${formatDisplayNumber(qty)}</td>
                                <td>
                                    <input type="number" class="qty-input bulk-sell-reserve-input" data-item="${escapeHtml(name)}" aria-label="Reserve quantity of ${escapeHtml(displayItemName(name))}" inputmode="numeric" min="0" max="${qty}" value="0" />
                                </td>
                                <td class="text-success">+${formatMoney(sellPrices[name])}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        if (requestedSelection) document.getElementById('preset-sell-all')?.classList.remove('active');

        const setActiveSellChip = (activeId) => {
            document.querySelectorAll('#bulk-modal-body .preset-chip').forEach(chip => {
                chip.classList.toggle('active', chip.id === activeId);
            });
        };

        const syncSellMasterCheck = () => {
            const checks = document.querySelectorAll('.bulk-sell-item-check');
            const master = document.getElementById('bulk-sell-master-check');
            if (master && checks.length > 0) {
                const allChecked = Array.from(checks).every(c => c.checked);
                const someChecked = Array.from(checks).some(c => c.checked);
                master.checked = allChecked;
                master.indeterminate = !allChecked && someChecked;
            }
        };

        // Preset event handlers
        document.getElementById('preset-sell-all')?.addEventListener('click', () => {
            setActiveSellChip('preset-sell-all');
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = true);
            document.querySelectorAll('.bulk-sell-reserve-input').forEach(inp => inp.value = 0);
            syncSellMasterCheck();
        });
        document.getElementById('preset-sell-keep1')?.addEventListener('click', () => {
            setActiveSellChip('preset-sell-keep1');
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = true);
            document.querySelectorAll('.bulk-sell-reserve-input').forEach(inp => inp.value = 1);
            syncSellMasterCheck();
        });
        document.getElementById('preset-sell-deselect')?.addEventListener('click', () => {
            setActiveSellChip('preset-sell-deselect');
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = false);
            syncSellMasterCheck();
        });
        document.getElementById('bulk-sell-select-all')?.addEventListener('click', () => {
            setActiveSellChip('preset-sell-all');
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = true);
            syncSellMasterCheck();
        });
        document.getElementById('bulk-sell-deselect-all')?.addEventListener('click', () => {
            setActiveSellChip('preset-sell-deselect');
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = false);
            syncSellMasterCheck();
        });
        document.getElementById('bulk-sell-master-check')?.addEventListener('change', (e) => {
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => cb.checked = e.target.checked);
            setActiveSellChip(e.target.checked ? 'preset-sell-all' : 'preset-sell-deselect');
        });
        document.querySelectorAll('.bulk-sell-item-check').forEach(cb => {
            cb.addEventListener('change', () => {
                syncSellMasterCheck();
            });
        });

    } else {
        // Bulk Buy View (Items & Boosters)
        const activeItems = Object.entries(buyListings)
            .filter(([k, v]) => v && v.available && v.stock > 0)
            .map(([name, listing]) => ({ name, listing, isBooster: false, tier: null }));

        const activeBoosters = Object.entries(boosterListings)
            .filter(([k, v]) => v && v.available && (v.stock === Infinity || v.stock === null || v.stock > 0))
            .map(([name, listing]) => ({ name, listing, isBooster: true, tier: listing.tier || 'T1' }));

        const allListings = [...activeItems, ...activeBoosters];

            const currentStrategy = shopViewState.bulkBuyStrategy || 'lowestPrice';
            body.innerHTML = `
            <div class="bulk-presets-bar mb-3">
                <span class="bulk-presets-label">Quick Presets:</span>
                <button type="button" class="preset-chip active" id="preset-buy-all">
                    <iconify-icon icon="lucide:check-square" aria-hidden="true"></iconify-icon> All Listings
                </button>
                <button type="button" class="preset-chip" id="preset-buy-items">
                    <iconify-icon icon="lucide:boxes" aria-hidden="true"></iconify-icon> Items Only
                </button>
                <button type="button" class="preset-chip" id="preset-buy-boosters">
                    <iconify-icon icon="lucide:zap" aria-hidden="true"></iconify-icon> Boosters Only
                </button>
                <button type="button" class="preset-chip" id="preset-buy-deselect">
                    <iconify-icon icon="lucide:square" aria-hidden="true"></iconify-icon> Deselect All
                </button>
            </div>

            <div class="bulk-strategy-bar mb-3">
                <div class="bulk-strategy-controls">
                    <label class="bulk-strategy-label" for="bulk-buy-strategy-select">Priority Strategy:</label>
                    <select id="bulk-buy-strategy-select" class="bulk-strategy-select" aria-label="Bulk-buy priority strategy">
                        <option value="lowestPrice" ${currentStrategy === 'lowestPrice' ? 'selected' : ''}>Lowest Price First (Maximize Units)</option>
                        <option value="highestPrice" ${currentStrategy === 'highestPrice' ? 'selected' : ''}>Highest Price First (High Value)</option>
                        <option value="rarestFirst" ${currentStrategy === 'rarestFirst' ? 'selected' : ''}>Rarest / Highest Tier First</option>
                        <option value="shopOrder" ${currentStrategy === 'shopOrder' ? 'selected' : ''}>Listed Shop Order</option>
                        <option value="equalDistribution" ${currentStrategy === 'equalDistribution' ? 'selected' : ''}>Equal Distribution</option>
                    </select>
                </div>
                <div class="bulk-selection-actions">
                    <button id="bulk-buy-select-all" class="action-btn secondary-btn" type="button">
                        <iconify-icon icon="lucide:check-square" aria-hidden="true"></iconify-icon> Select All
                    </button>
                    <button id="bulk-buy-deselect-all" class="action-btn secondary-btn" type="button">
                        <iconify-icon icon="lucide:square" aria-hidden="true"></iconify-icon> Deselect All
                    </button>
                </div>
            </div>

            <div class="bulk-table-wrapper">
                <table class="bulk-table">
                    <thead>
                        <tr>
                            <th class="bulk-select-cell"><input type="checkbox" id="bulk-buy-master-check" aria-label="Select all shop listings" checked /></th>
                            <th>Item Name</th>
                            <th>Type</th>
                            <th>Available Stock</th>
                            <th>Min Qty Limit</th>
                            <th>Max Qty Limit</th>
                            <th>Unit Buy Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allListings.length === 0 ? `<tr><td colspan="7" class="bulk-empty-cell">No active listings in shop</td></tr>` : 
                            allListings.map(({ name, listing, isBooster, tier }) => {
                                const isInf = listing.stock === Infinity || listing.stock === null;
                                const stockDisplay = isInf ? '∞ Unlimited' : formatDisplayNumber(listing.stock);
                                const maxVal = isInf ? '' : listing.stock;
                                const maxPlaceholder = isInf ? '∞' : listing.stock;
                                const badgeHtml = isBooster 
                                    ? `<span class="charter-badge badge-purple">Booster ${escapeHtml(tier)}</span>` 
                                    : `<span class="charter-badge badge-blue">Item</span>`;

                                return `
                                    <tr class="bulk-item-row" data-is-booster="${isBooster}">
                                        <td class="bulk-select-cell"><input type="checkbox" class="bulk-buy-item-check" data-item="${escapeHtml(name)}" data-booster="${isBooster}" aria-label="Select ${escapeHtml(displayItemName(name))} to buy" checked /></td>
                                        <td><b>${escapeHtml(displayItemName(name))}</b></td>
                                        <td>${badgeHtml}</td>
                                        <td>${stockDisplay}</td>
                                        <td>
                                            <input type="number" class="qty-input bulk-buy-min-input" data-item="${escapeHtml(name)}" aria-label="Minimum quantity of ${escapeHtml(displayItemName(name))}" inputmode="numeric" min="0" ${isInf ? '' : `max="${listing.stock}"`} value="0" />
                                        </td>
                                        <td>
                                            <input type="number" class="qty-input bulk-buy-max-input" data-item="${escapeHtml(name)}" aria-label="Maximum quantity of ${escapeHtml(displayItemName(name))}" inputmode="numeric" min="0" ${isInf ? '' : `max="${listing.stock}"`} value="${maxVal}" placeholder="${maxPlaceholder}" />
                                        </td>
                                        <td>${formatMoney(listing.buyPrice)}</td>
                                    </tr>
                                `;
                            }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const setActiveBuyChip = (activeId) => {
            document.querySelectorAll('#bulk-modal-body .preset-chip').forEach(chip => {
                chip.classList.toggle('active', chip.id === activeId);
            });
        };

        const syncBuyMasterCheck = () => {
            const checks = document.querySelectorAll('.bulk-buy-item-check');
            const master = document.getElementById('bulk-buy-master-check');
            if (master && checks.length > 0) {
                const allChecked = Array.from(checks).every(c => c.checked);
                const someChecked = Array.from(checks).some(c => c.checked);
                master.checked = allChecked;
                master.indeterminate = !allChecked && someChecked;
            }
        };

        document.getElementById('preset-buy-all')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-all');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => cb.checked = true);
            syncBuyMasterCheck();
        });
        document.getElementById('preset-buy-items')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-items');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => {
                cb.checked = cb.dataset.booster !== 'true';
            });
            syncBuyMasterCheck();
        });
        document.getElementById('preset-buy-boosters')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-boosters');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => {
                cb.checked = cb.dataset.booster === 'true';
            });
            syncBuyMasterCheck();
        });
        document.getElementById('preset-buy-deselect')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-deselect');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => cb.checked = false);
            syncBuyMasterCheck();
        });
        document.getElementById('bulk-buy-select-all')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-all');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => cb.checked = true);
            syncBuyMasterCheck();
        });
        document.getElementById('bulk-buy-deselect-all')?.addEventListener('click', () => {
            setActiveBuyChip('preset-buy-deselect');
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => cb.checked = false);
            syncBuyMasterCheck();
        });
        document.getElementById('bulk-buy-master-check')?.addEventListener('change', (e) => {
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => cb.checked = e.target.checked);
            setActiveBuyChip(e.target.checked ? 'preset-buy-all' : 'preset-buy-deselect');
        });
        document.getElementById('bulk-buy-strategy-select')?.addEventListener('change', (e) => {
            shopViewState.bulkBuyStrategy = e.target.value;
        });
        document.querySelectorAll('.bulk-buy-item-check').forEach(cb => {
            cb.addEventListener('change', () => {
                syncBuyMasterCheck();
            });
        });
    }

    updateBulkPrimaryAction();
};

const executeBulkTrade = async (mode, options, triggerBtn, { fromPreview = false } = {}) => {
    const isSell = mode === 'sell';
    const res = isSell
        ? await doExecuteBulkSell(options, triggerBtn)
        : await doExecuteBulkBuy(options, triggerBtn);
    if (!res || !res.result) return;

    if (isSell) {
        showToast(`Successfully bulk sold ${formatDisplayNumber(res.result.itemsAffectedCount)} item types for +${formatMoney(res.result.totalReceived)}!`, 'success');
        addLogEntry(`Bulk sold ${formatDisplayNumber(res.result.itemsAffectedCount)} item types for +${formatMoney(res.result.totalReceived)}.`, 'rare');
    } else {
        showToast(`Successfully bulk bought ${formatDisplayNumber(res.result.itemsAffectedCount)} item types for ${formatMoney(res.result.totalCost)}!`, 'success');
        addLogEntry(`Bulk bought ${formatDisplayNumber(res.result.itemsAffectedCount)} item types for ${formatMoney(res.result.totalCost)}.`, 'system');
    }

    if (fromPreview) closeBulkPreviewModal({ restoreFocus: false });
    else closeBulkActionsModal({ restoreFocus: false });
    renderAll();
};

const handleBulkPreview = async (triggerBtn) => {
    try {
        if (bulkModalMode === 'sell') {
            const selectedItems = {};
            let hasAnySelected = false;
            document.querySelectorAll('.bulk-sell-item-check').forEach(cb => {
                if (cb.checked) {
                    const itemName = cb.dataset.item;
                    const reserveInput = Array.from(document.querySelectorAll('.bulk-sell-reserve-input'))
                        .find(input => input.dataset.item === itemName);
                    const reserveQty = Math.max(0, parseInt(reserveInput?.value, 10) || 0);
                    selectedItems[itemName] = { selected: true, reserveQty };
                    hasAnySelected = true;
                }
            });

            if (!hasAnySelected) {
                showToast('Please select at least one item to sell', 'error');
                return;
            }

            const options = { selectedItems };
            lastBulkOptions = options;

            if (shouldSkipBulkPreview(getBulkPreviewKey('sell'))) {
                await executeBulkTrade('sell', options, triggerBtn);
                return;
            }

            const res = await doPreviewBulkSell(options, triggerBtn);
            if (res && res.result) {
                showPreviewModal(res.result);
            }
        } else {
            const priorityStrategy = document.getElementById('bulk-buy-strategy-select')?.value || 'lowestPrice';
            const selectedItems = {};
            let hasAnySelected = false;
            document.querySelectorAll('.bulk-buy-item-check').forEach(cb => {
                if (cb.checked) {
                    const itemName = cb.dataset.item;
                    const minInput = Array.from(document.querySelectorAll('.bulk-buy-min-input'))
                        .find(input => input.dataset.item === itemName);
                    const maxInput = Array.from(document.querySelectorAll('.bulk-buy-max-input'))
                        .find(input => input.dataset.item === itemName);
                    const minQty = Math.max(0, parseInt(minInput?.value, 10) || 0);
                    const maxVal = maxInput?.value?.trim();
                    const maxQty = (maxVal === '' || maxVal === undefined || maxVal === 'Infinity') ? Infinity : Math.max(0, parseInt(maxVal, 10) || 0);
                    selectedItems[itemName] = { selected: true, minQty, maxQty };
                    hasAnySelected = true;
                }
            });

            if (!hasAnySelected) {
                showToast('Please select at least one listing to buy', 'error');
                return;
            }

            const options = { priorityStrategy, selectedItems };
            lastBulkOptions = options;

            if (shouldSkipBulkPreview(getBulkPreviewKey('buy'))) {
                await executeBulkTrade('buy', options, triggerBtn);
                return;
            }

            const res = await doPreviewBulkBuy(options, triggerBtn);
            if (res && res.result) {
                showPreviewModal(res.result);
            }
        }
    } catch (err) {
        showToast(err.message || 'Bulk preview failed', 'error');
    }
};

const showPreviewModal = (previewResult) => {
    lastBulkPreviewPayload = previewResult;
    const previewModal = document.getElementById('bulk-preview-modal');
    const body = document.getElementById('bulk-preview-body');
    if (!previewModal || !body) return;

    const isSell = previewResult.action === 'sell';
    const totalAmount = isSell ? previewResult.totalPayout : previewResult.totalCost;
    const amountLabel = isSell ? 'Total Projected Payout' : 'Total Projected Cost';
    body.innerHTML = `
        <div class="bulk-preview-summary-grid mb-3">
            <div class="preview-stat-card">
                <div class="stat-title">Items Affected</div>
                <div class="stat-num">${formatDisplayNumber(previewResult.itemsAffectedCount)} items</div>
            </div>
            <div class="preview-stat-card">
                <div class="stat-title">Total Units</div>
                <div class="stat-num">${formatDisplayNumber(previewResult.totalUnits)} units</div>
            </div>
            <div class="preview-stat-card">
                <div class="stat-title">${amountLabel}</div>
                <div class="stat-num ${isSell ? 'text-success' : ''}">${isSell ? '+' : ''}${formatMoney(totalAmount)}</div>
            </div>
            <div class="preview-stat-card">
                <div class="stat-title">Cash After</div>
                <div class="stat-num">${formatMoney(previewResult.projectedCash)}</div>
            </div>
        </div>

        <h4 class="bulk-breakdown-title">Itemized Breakdown</h4>
        <div class="bulk-table-wrapper bulk-preview-table">
            <table class="bulk-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${previewResult.breakdown.length === 0 ? `<tr><td colspan="4" class="bulk-empty-cell">No items match criteria</td></tr>` : 
                        previewResult.breakdown.map(item => `
                        <tr>
                            <td><b>${escapeHtml(displayItemName(item.itemName))}</b></td>
                            <td>${formatDisplayNumber(item.quantity)}</td>
                            <td>${formatMoney(item.unitPrice)}</td>
                            <td class="${isSell ? 'text-success' : ''}">${isSell ? '+' : ''}${formatMoney(item.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <label class="modal-checkbox-label bulk-preview-ignore-option">
            <input type="checkbox" id="bulk-preview-dont-show-again">
            <span>Don't show this preview again</span>
        </label>
    `;

    replaceDialog('bulk-actions-modal', previewModal, {
        initialFocus: '#btn-preview-confirm',
        closeOnBackdrop: false,
        onClose: () => {
            lastBulkOptions = null;
            lastBulkPreviewPayload = null;
        }
    });
};

const closeBulkPreviewModal = ({ restoreFocus = true } = {}) => {
    const previewModal = document.getElementById('bulk-preview-modal');
    closeDialog(previewModal, { reason: 'cancel', restoreFocus });
    lastBulkOptions = null;
    lastBulkPreviewPayload = null;
};

const handleConfirmExecute = async (triggerBtn) => {
    if (!lastBulkOptions || !lastBulkPreviewPayload) return;

    try {
        const mode = lastBulkPreviewPayload.action === 'sell' ? 'sell' : 'buy';
        if (document.getElementById('bulk-preview-dont-show-again')?.checked) {
            setConfirmationIgnored(getBulkPreviewKey(mode), true);
        }
        await executeBulkTrade(mode, lastBulkOptions, triggerBtn, { fromPreview: true });
    } catch (err) {
        showToast(err.message || 'Bulk execution failed', 'error');
    }
};

const applyShopCatalogControls = mode => {
    const isBuy = mode === 'buy';
    const grid = document.getElementById(isBuy ? 'buy-items-grid' : 'sell-items-grid');
    if (!grid) return;

    const searchInput = document.getElementById(`${mode}-search-input`);
    const categorySelect = document.getElementById(`${mode}-category-filter`);
    const availabilitySelect = isBuy ? document.getElementById('buy-availability-filter') : null;
    const sortSelect = document.getElementById(`${mode}-sort`);
    const searchKey = isBuy ? 'buySearch' : 'sellSearch';
    const categoryKey = isBuy ? 'buyCategory' : 'sellCategory';
    const sortKey = isBuy ? 'buySort' : 'sellSort';

    if (searchInput) searchInput.value = shopViewState[searchKey];
    if (categorySelect) {
        categorySelect.value = shopViewState[categoryKey];
        if (categorySelect.value !== shopViewState[categoryKey]) {
            shopViewState[categoryKey] = 'all';
            categorySelect.value = 'all';
        }
    }
    if (availabilitySelect) availabilitySelect.value = shopViewState.availability;
    if (sortSelect) sortSelect.value = shopViewState[sortKey];

    const query = shopViewState[searchKey].trim().toLowerCase();
    const category = shopViewState[categoryKey];
    const availability = shopViewState.availability;
    const sort = shopViewState[sortKey];
    const cards = [...grid.querySelectorAll('.shop-item-card')];

    cards.sort((a, b) => {
        const availableDelta = Number(b.dataset.available === 'true') - Number(a.dataset.available === 'true');
        if (sort === 'availability' && availableDelta) return availableDelta;
        if (sort === 'price') return Number(a.dataset.price) - Number(b.dataset.price) || a.dataset.name.localeCompare(b.dataset.name);
        if (sort === 'amount' || (!isBuy && sort === 'availability')) return Number(b.dataset.amount) - Number(a.dataset.amount) || a.dataset.name.localeCompare(b.dataset.name);
        if (sort === 'category') return a.dataset.category.localeCompare(b.dataset.category) || a.dataset.name.localeCompare(b.dataset.name);
        return a.dataset.name.localeCompare(b.dataset.name);
    });
    cards.forEach(card => grid.appendChild(card));

    let visibleCount = 0;
    cards.forEach(card => {
        const matchesQuery = !query || card.dataset.name.includes(query);
        const matchesCategory = category === 'all' || card.dataset.category === category;
        const matchesAvailability = !isBuy || availability === 'all'
            || (availability === 'available' ? card.dataset.available === 'true'
                : availability === 'wishlist' ? card.dataset.wishlist === 'true'
                    : card.dataset.available !== 'true');
        const visible = matchesQuery && matchesCategory && matchesAvailability;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
    });

    let empty = grid.parentElement?.querySelector?.(`.shop-filter-empty[data-mode="${mode}"]`);
    if (!empty && typeof document.createElement === 'function' && grid.parentElement) {
        empty = document.createElement('div');
        empty.className = 'empty-state-card shop-filter-empty hidden';
        empty.dataset.mode = mode;
        empty.innerHTML = '<h4>No Matching Listings</h4><p>Adjust your search or filters to see more items.</p>';
        grid.insertAdjacentElement('afterend', empty);
    }
    empty?.classList.toggle('hidden', visibleCount > 0 || cards.length === 0);
};

const setupShopEventListeners = () => {
    // Sub-tab switching
    const tabBuy = document.getElementById('shop-tab-buy');
    const tabSell = document.getElementById('shop-tab-sell');
    const panelBuy = document.getElementById('shop-subpanel-buy');
    const panelSell = document.getElementById('shop-subpanel-sell');

    if (tabBuy && tabSell) {
        const selectTradeMode = mode => {
            const isBuy = mode === 'buy';
            currentSubTab = mode;
            tabBuy.classList.toggle('active', isBuy);
            tabSell.classList.toggle('active', !isBuy);
            tabBuy.setAttribute('aria-selected', String(isBuy));
            tabSell.setAttribute('aria-selected', String(!isBuy));
            tabBuy.setAttribute('tabindex', isBuy ? '0' : '-1');
            tabSell.setAttribute('tabindex', isBuy ? '-1' : '0');
            panelBuy.classList.toggle('hidden', !isBuy);
            panelSell.classList.toggle('hidden', isBuy);
        };
        tabBuy.addEventListener('click', () => selectTradeMode('buy'));
        tabSell.addEventListener('click', () => selectTradeMode('sell'));
        [tabBuy, tabSell].forEach((tab, index, tabs) => {
            tab.addEventListener('keydown', event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                tabs[targetIndex].focus();
                tabs[targetIndex].click();
            });
        });
        selectTradeMode(currentSubTab);
    }

    // Open Bulk Actions Modal button
    const btnOpenBulk = document.getElementById('btn-open-bulk-actions');
    if (btnOpenBulk) {
        btnOpenBulk.addEventListener('click', () => {
            openBulkActionsModal(currentSubTab === 'sell' ? 'sell' : 'buy');
        });
    }

    // Bulk Modal mode tabs
    const bulkSellTab = document.getElementById('bulk-mode-sell');
    const bulkBuyTab = document.getElementById('bulk-mode-buy');
    const selectBulkMode = mode => {
        bulkModalMode = mode;
        renderBulkModalContent();
    };
    bindPersistentShopEvent(bulkSellTab, 'click', () => selectBulkMode('sell'));
    bindPersistentShopEvent(bulkBuyTab, 'click', () => selectBulkMode('buy'));
    [bulkSellTab, bulkBuyTab].filter(Boolean).forEach((tab, index, tabs) => {
        bindPersistentShopEvent(tab, 'keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const targetIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            tabs[targetIndex].focus();
            tabs[targetIndex].click();
        });
    });

    bindPersistentShopEvent(document.getElementById('btn-close-bulk-modal'), 'click', closeBulkActionsModal);
    bindPersistentShopEvent(document.getElementById('btn-bulk-cancel'), 'click', closeBulkActionsModal);

    bindPersistentShopEvent(document.getElementById('btn-close-preview-modal'), 'click', closeBulkPreviewModal);

    // Preview button
    bindPersistentShopEvent(document.getElementById('btn-bulk-preview'), 'click', (e) => {
        handleBulkPreview(e.currentTarget);
    });

    // Closing Preview discards the full bulk flow by design.
    bindPersistentShopEvent(document.getElementById('btn-preview-back'), 'click', () => {
        closeBulkPreviewModal();
    });

    // Preview confirm execute button
    bindPersistentShopEvent(document.getElementById('btn-preview-confirm'), 'click', (e) => {
        handleConfirmExecute(e.currentTarget);
    });

    document.getElementById('btn-manage-shop-wishlist')?.addEventListener('click', () => {
        void openWishlistManager().catch(error => showToast(error.message || 'Wishlist unavailable', 'error'));
    });

    document.getElementById('btn-extend-active-boosters')?.addEventListener('click', async event => {
        const button = event.currentTarget;
        try {
            const plan = await doPreviewExtendActiveBoosters();
            if (!plan.totalUnits) {
                showToast('No unlocked owned boosters match the currently active slots.', 'error');
                return;
            }
            const breakdown = (plan.breakdown || []).map(item => `${formatDisplayNumber(item.quantity)}× ${displayItemName(item.itemName)}`).join(', ');
            const skipped = (plan.skipped || []).length ? ` ${plan.skipped.length} active slot${plan.skipped.length === 1 ? '' : 's'} will be skipped because stock is missing or locked.` : '';
            const approved = await showConfirmation('extendAllBoosters', 'Extend every active booster?', `Consume all matching unlocked boosters (${breakdown}) and append their durations from each slot's current expiry.${skipped}`, { allowIgnore: false, confirmLabel: 'Extend All Boosters' });
            if (!approved) return;
            const result = await doExtendActiveBoosters(button);
            showToast(`Extended ${result.activeSlots || plan.activeSlots} active booster slot${(result.activeSlots || plan.activeSlots) === 1 ? '' : 's'} with ${result.totalUnits || plan.totalUnits} booster${(result.totalUnits || plan.totalUnits) === 1 ? '' : 's'}.`, 'success');
            renderAll();
        } catch (error) { showToast(error.message || 'Could not extend active boosters', 'error'); }
    });

    // Force Restock button
    const btnRestock = document.getElementById('btn-force-restock-shop');
    if (btnRestock) {
        btnRestock.addEventListener('click', async (e) => {
            try {
                const res = await doForceRestock(e.currentTarget);
                if (res && res.result) {
                    showToast('Shop successfully restocked!', 'success');
                    addLogEntry('Manually restocked system shop listings and boosters.', 'system');
                    renderAll();
                }
            } catch (err) {
                showToast(err.message || 'Failed to restock shop', 'error');
            }
        });
    }

    const bindCatalogControls = mode => {
        const isBuy = mode === 'buy';
        const searchKey = isBuy ? 'buySearch' : 'sellSearch';
        const categoryKey = isBuy ? 'buyCategory' : 'sellCategory';
        const sortKey = isBuy ? 'buySort' : 'sellSort';
        const search = document.getElementById(`${mode}-search-input`);
        const category = document.getElementById(`${mode}-category-filter`);
        const sort = document.getElementById(`${mode}-sort`);
        setupCollapsibleSearch(search, { resetCollapsed: true });
        search?.addEventListener('input', () => {
            shopViewState[searchKey] = search.value;
            applyShopCatalogControls(mode);
        });
        category?.addEventListener('change', () => {
            shopViewState[categoryKey] = category.value;
            applyShopCatalogControls(mode);
        });
        sort?.addEventListener('change', () => {
            shopViewState[sortKey] = sort.value;
            applyShopCatalogControls(mode);
        });
        if (isBuy) {
            document.getElementById('buy-availability-filter')?.addEventListener('change', event => {
                shopViewState.availability = event.currentTarget.value;
                applyShopCatalogControls('buy');
            });
        }
        applyShopCatalogControls(mode);
    };
    bindCatalogControls('buy');
    bindCatalogControls('sell');

    // Preset buttons
    document.querySelectorAll('.btn-qty-preset, .quantity-preset-btn[data-quantity-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target || btn.dataset.quantityTarget;
            const input = document.getElementById(targetId);
            const rawPreset = btn.dataset.preset ?? btn.dataset.quantityPreset;
            const presetVal = rawPreset === 'max' ? parseInt(input?.max, 10) : parseInt(rawPreset, 10);
            if (input && !isNaN(presetVal)) {
                const max = parseInt(input.max, 10);
                input.value = Math.min(presetVal, isNaN(max) ? presetVal : max);
            }
        });
    });

    // Buy Item buttons
    document.querySelectorAll('.btn-buy-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemName = btn.dataset.item;
            const input = document.getElementById(getQuantityInputId('buy', itemName));
            const qty = input ? parseInt(input.value, 10) : 1;

            try {
                const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'shop-buy', subjectId: itemName, quantity: qty });
                if (needsConfirmation) {
                    const listing = getState().shop?.buyListings?.[itemName];
                    const confirmed = await showConfirmation('shopBuyQuantity', 'Confirm purchase', `Buy ${formatDisplayNumber(qty)}× ${displayItemName(itemName)} for ${formatMoney((listing?.buyPrice || 0) * qty)}?`, { allowIgnore: false });
                    if (!confirmed) return;
                }
                const res = await doBuyShopItem(itemName, qty, e.currentTarget);
                if (res && res.result) {
                    showToast(`Purchased ${formatDisplayNumber(res.result.quantity)}× ${displayItemName(itemName)} for ${formatMoney(res.result.totalCost)}!`, 'success');
                    addLogEntry(`Bought ${formatDisplayNumber(res.result.quantity)}× ${displayItemName(itemName)} for ${formatMoney(res.result.totalCost)}.`, 'system');
                    renderAll();
                }
            } catch (err) {
                showToast(err.message || 'Failed to purchase item', 'error');
            }
        });
    });

    // Sell Item buttons
    document.querySelectorAll('.btn-sell-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemName = btn.dataset.item;
            const input = document.getElementById(getQuantityInputId('sell', itemName));
            const qty = input ? parseInt(input.value, 10) : 1;

            try {
                const needsConfirmation = shouldConfirmQuantityOperation({ settings: getStoredSettings(), systemId: 'shop-sell', subjectId: itemName, quantity: qty });
                if (needsConfirmation) {
                    const price = getState().shop?.sellPrices?.[itemName] || 0;
                    const confirmed = await showConfirmation('shopSellQuantity', 'Confirm sale', `Sell ${formatDisplayNumber(qty)}× ${displayItemName(itemName)} for ${formatMoney(price * qty)}?`, { allowIgnore: false });
                    if (!confirmed) return;
                }
                const res = await doSellShopItem(itemName, qty, e.currentTarget);
                if (res && res.result) {
                    showToast(`Sold ${formatDisplayNumber(res.result.quantity)}× ${displayItemName(itemName)} for +${formatMoney(res.result.totalReceived)}!`, 'success');
                    addLogEntry(`Sold ${formatDisplayNumber(res.result.quantity)}× ${displayItemName(itemName)} for +${formatMoney(res.result.totalReceived)}.`, 'rare');
                    renderAll();
                }
            } catch (err) {
                showToast(err.message || 'Failed to sell item', 'error');
            }
        });
    });

    // Buy Booster buttons
    document.querySelectorAll('.btn-buy-booster').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const boosterName = btn.dataset.booster;

            try {
                const res = await doBuyBooster(boosterName, 1, e.currentTarget);
                if (res && res.result) {
                    showToast(`Purchased booster “${boosterName}” for ${formatMoney(res.result.totalCost)}!`, 'success');
                    addLogEntry(`Purchased booster ${boosterName} for ${formatMoney(res.result.totalCost)}.`, 'rare');
                    renderAll();
                }
            } catch (err) {
                showToast(err.message || 'Failed to buy booster', 'error');
            }
        });
    });
};
