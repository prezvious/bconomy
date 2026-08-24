import { getState } from '../state.js';
import {
    getItemCategory,
    getItemIcon,
    formatDisplayNumber,
    formatNumberCommas,
    displayItemName,
    iconHtml
} from '../utils.js';
import { getStoredSettings, saveStoredSettings } from '../preferences.js';
import { openItemModal } from './itemModal.js';
import { getOwnedBoosterUnitCount, openBulkBoosterDialog } from './boosterBulk.js';
import { setupCollapsibleSearch } from './collapsibleSearch.js';
import { doSetInventoryFlags } from '../api.js';
import { showToast } from './toast.js';

let renderedItems = [];
let selectionMode = false;
let lastSelectionIndex = -1;
const selectedItems = new Set();

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const titleCase = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Other';

const getConsolidatedItems = inventory => {
    const consolidated = new Map();
    Object.entries(inventory || {}).forEach(([rawName, quantity]) => {
        const qty = Number(quantity);
        if (!Number.isFinite(qty) || qty <= 0) return;
        const displayName = displayItemName(rawName);
        const key = displayName.toLowerCase();
        const existing = consolidated.get(key) || {
            rawName,
            displayName,
            category: getItemCategory(rawName),
            quantity: 0
        };
        existing.quantity += qty;
        consolidated.set(key, existing);
    });
    return [...consolidated.values()];
};

const updateInventoryPreference = patch => {
    const settings = getStoredSettings();
    settings.inventory = { ...settings.inventory, ...patch };
    saveStoredSettings(settings, { emit: false });
    renderInventory();
};

const bindControl = (element, event, callback) => {
    if (!element || element.dataset.inventoryBound === 'true') return;
    element.dataset.inventoryBound = 'true';
    element.addEventListener(event, callback);
};

const setupInventoryControls = () => {
    const search = document.getElementById('inventory-search');
    const category = document.getElementById('inventory-category');
    const sort = document.getElementById('inventory-sort');
    const gridView = document.getElementById('inventory-view-grid');
    const compactView = document.getElementById('inventory-view-compact');
    const bulkBoosters = document.getElementById('btn-open-bulk-boosters');
    const grid = document.getElementById('inventory-grid');
    const selectModeButton = document.getElementById('btn-inventory-select-mode');

    bindControl(search, 'input', () => updateInventoryPreference({ search: search.value }));
    bindControl(category, 'change', () => updateInventoryPreference({ category: category.value }));
    bindControl(sort, 'change', () => updateInventoryPreference({ sort: sort.value }));
    bindControl(gridView, 'click', () => updateInventoryPreference({ view: 'grid' }));
    bindControl(compactView, 'click', () => updateInventoryPreference({ view: 'compact' }));
    bindControl(bulkBoosters, 'click', () => openBulkBoosterDialog({
        returnFocus: bulkBoosters,
        onComplete: () => {
            renderInventory();
            void import('./actions.js').then(({ renderActiveBoosts }) => renderActiveBoosts());
        }
    }));
    bindControl(selectModeButton, 'click', () => {
        selectionMode = !selectionMode;
        if (!selectionMode) selectedItems.clear();
        lastSelectionIndex = -1;
        renderInventory();
    });

    const handleCardClick = event => {
        const card = event.target.closest?.('.inventory-item');
        const rawName = card?.dataset.rawName;
        if (!rawName) return;
        const action = event.target.closest?.('[data-item-action]')?.dataset.itemAction;
        if (action === 'lock' || action === 'favorite') {
            event.stopPropagation();
            const state = getState();
            const list = action === 'lock' ? state.lockedItems : state.favoriteItems;
            const enabled = !(Array.isArray(list) && list.includes(rawName));
            void doSetInventoryFlags([rawName], { [action === 'lock' ? 'locked' : 'favorite']: enabled }, event.target.closest('button'))
                .then(() => renderInventory())
                .catch(error => showToast(error.message || 'Could not update item', 'error'));
            return;
        }
        if (selectionMode || event.target.matches?.('[data-item-select]')) {
            const index = renderedItems.findIndex(item => item.rawName === rawName);
            const settings = getStoredSettings().inventory;
            if (event.shiftKey && settings.shiftRangeEnabled && lastSelectionIndex >= 0 && index >= 0) {
                const [start, end] = [lastSelectionIndex, index].sort((a, b) => a - b);
                for (let cursor = start; cursor <= end; cursor += 1) selectedItems.add(renderedItems[cursor].rawName);
            } else if (selectedItems.has(rawName)) selectedItems.delete(rawName);
            else selectedItems.add(rawName);
            lastSelectionIndex = index;
            renderInventory();
            return;
        }
        openItemModal(rawName);
    };

    if (grid && grid.dataset.inventoryDelegated !== 'true') {
        grid.dataset.inventoryDelegated = 'true';
        grid.addEventListener('click', handleCardClick);
    }

    const pinnedGrid = document.getElementById('inventory-pinned-grid');
    if (pinnedGrid && pinnedGrid.dataset.inventoryDelegated !== 'true') {
        pinnedGrid.dataset.inventoryDelegated = 'true';
        pinnedGrid.addEventListener('click', handleCardClick);
    }

    [grid, pinnedGrid].filter(Boolean).forEach(itemGrid => {
        if (itemGrid.dataset.inventoryLassoBound === 'true') return;
        itemGrid.dataset.inventoryLassoBound = 'true';
        itemGrid.addEventListener('pointerenter', event => {
            if (!selectionMode || event.buttons !== 1 || !getStoredSettings().inventory.lassoEnabled) return;
            const card = event.target.closest?.('.inventory-item');
            if (card?.dataset.rawName) {
                selectedItems.add(card.dataset.rawName);
                card.classList.add('is-selected');
                card.querySelector('[data-item-select]')?.setAttribute('checked', '');
                updateBatchToolbar();
            }
        }, true);
    });

    document.querySelectorAll('[data-inventory-batch]').forEach(button => bindControl(button, 'click', async () => {
        const itemIds = [...selectedItems];
        const action = button.dataset.inventoryBatch;
        if (action === 'clear') {
            selectedItems.clear();
            renderInventory();
            return;
        }
        if (action === 'sell') {
            if (!itemIds.length) return;
            sessionStorage.setItem('bconomy_bulk_sell_selection', JSON.stringify(itemIds));
            const { activateSection } = await import('../navigation.js');
            activateSection('shop');
            const { openBulkActionsModal } = await import('./shop.js');
            window.setTimeout(() => openBulkActionsModal('sell', { selectedItems: itemIds }), 0);
            return;
        }
        if (!itemIds.length) return;
        const changes = action === 'lock' ? { locked: true }
            : action === 'unlock' ? { locked: false }
                : action === 'favorite' ? { favorite: true }
                    : { favorite: false };
        try {
            await doSetInventoryFlags(itemIds, changes, button);
            showToast(`Updated ${itemIds.length} item type${itemIds.length === 1 ? '' : 's'}.`, 'success');
            renderInventory();
        } catch (error) {
            showToast(error.message || 'Batch update failed', 'error');
        }
    }));
};

const sortItems = (items, sort) => items.sort((a, b) => {
    if (sort === 'quantity-desc') return b.quantity - a.quantity || a.displayName.localeCompare(b.displayName);
    if (sort === 'quantity-asc') return a.quantity - b.quantity || a.displayName.localeCompare(b.displayName);
    if (sort === 'category') return a.category.localeCompare(b.category) || a.displayName.localeCompare(b.displayName);
    return a.displayName.localeCompare(b.displayName);
});

const renderCardHtml = (item, isLocked, isFavorite) => {
    const displayName = escapeHtml(item.displayName);
    const category = escapeHtml(item.category);
    const displayQuantity = formatDisplayNumber(item.quantity);
    const exactQuantity = formatNumberCommas(item.quantity);
    const rawName = escapeHtml(item.rawName);

    const isSelected = selectedItems.has(item.rawName);
    return `
        <article class="inventory-item card ${isLocked ? 'item-is-locked' : ''} ${isFavorite ? 'item-is-favorite' : ''} ${isSelected ? 'is-selected' : ''}" data-raw-name="${rawName}"
            title="${displayName} · ${exactQuantity} owned${isLocked ? ' (Locked)' : ''}">
            ${selectionMode ? `<input class="inventory-select-check" type="checkbox" data-item-select aria-label="Select ${displayName}" ${isSelected ? 'checked' : ''}>` : ''}
            <button class="inventory-card-main" type="button" aria-label="View details for ${displayName}, ${exactQuantity} owned">
            <span class="item-card-top">
                <span class="item-cat-badge" data-cat="${category}">${escapeHtml(titleCase(item.category))}</span>
                <span class="item-card-badges">
                    ${isLocked ? `<span class="item-lock-badge" title="Locked (Cannot be sold or used)">${iconHtml('lucide:lock', 'item-lock-badge-icon')}</span>` : ''}
                    ${isFavorite ? `<span class="item-favorite-badge" title="Favorite">${iconHtml('lucide:star', 'item-lock-badge-icon')}</span>` : ''}
                    <span class="item-qty" title="${exactQuantity}">${displayQuantity}</span>
                </span>
            </span>
            <span class="item-icon-wrap" data-cat="${category}">${iconHtml(getItemIcon(item.rawName), 'item-icon')}</span>
            <span class="item-name">${displayName}</span>
            </button>
            <span class="inventory-inline-actions">
                <button type="button" data-item-action="favorite" aria-pressed="${isFavorite}" title="${isFavorite ? 'Remove favorite' : 'Add favorite'}">${iconHtml(isFavorite ? 'lucide:star-off' : 'lucide:star')}</button>
                <button type="button" data-item-action="lock" aria-pressed="${isLocked}" title="${isLocked ? 'Unlock item' : 'Lock item'}">${iconHtml(isLocked ? 'lucide:unlock' : 'lucide:lock')}</button>
            </span>
        </article>`;
};

const updateBatchToolbar = () => {
    const toolbar = document.getElementById('inventory-batch-toolbar');
    const count = document.getElementById('inventory-selected-count');
    const modeButton = document.getElementById('btn-inventory-select-mode');
    toolbar?.classList.toggle('hidden', !selectionMode);
    if (count) count.textContent = `${selectedItems.size} selected`;
    if (modeButton) {
        modeButton.setAttribute('aria-pressed', String(selectionMode));
        modeButton.classList.toggle('active', selectionMode);
        modeButton.lastChild.textContent = selectionMode ? ' Done' : ' Select Items';
    }
};

export const renderInventory = () => {
    const playerState = getState();
    const grid = document.getElementById('inventory-grid');
    const emptyState = document.getElementById('inventory-empty');
    const search = document.getElementById('inventory-search');
    const pinnedContainer = document.getElementById('inventory-pinned-container');
    const pinnedGrid = document.getElementById('inventory-pinned-grid');
    const pinnedCountEl = document.getElementById('inventory-pinned-count');
    const pinnedIconWrap = document.getElementById('pinned-section-icon-wrap');
    if (!playerState || !grid || !emptyState || !search) return;

    setupInventoryControls();
    updateBatchToolbar();
    const settings = getStoredSettings();
    const inventoryPrefs = settings.inventory;
    const items = getConsolidatedItems(playerState.inventory);
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const boosterUnits = getOwnedBoosterUnitCount(playerState);
    const categories = [...new Set(items.map(item => item.category))].sort();

    const categorySelect = document.getElementById('inventory-category');
    if (categorySelect) {
        const activeCategory = categories.includes(inventoryPrefs.category) ? inventoryPrefs.category : 'all';
        categorySelect.innerHTML = [
            '<option value="all">All categories</option>',
            ...categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(titleCase(category))}</option>`)
        ].join('');
        categorySelect.value = activeCategory;
        if (activeCategory !== inventoryPrefs.category) {
            inventoryPrefs.category = activeCategory;
            saveStoredSettings(settings, { emit: false });
        }
    }

    search.value = inventoryPrefs.search;
    setupCollapsibleSearch(search, {
        resetCollapsed: typeof document !== 'undefined' && document.activeElement !== search
    });
    const sortSelect = document.getElementById('inventory-sort');
    if (sortSelect) sortSelect.value = inventoryPrefs.sort;

    const isCompact = inventoryPrefs.view === 'compact';
    grid.classList.toggle('compact', isCompact);
    if (pinnedGrid) pinnedGrid.classList.toggle('compact', isCompact);

    const gridView = document.getElementById('inventory-view-grid');
    const compactView = document.getElementById('inventory-view-compact');
    gridView?.setAttribute('aria-pressed', String(!isCompact));
    compactView?.setAttribute('aria-pressed', String(isCompact));

    const typeCount = document.getElementById('inventory-type-count');
    const unitCount = document.getElementById('inventory-unit-count');
    const statsBadge = document.getElementById('inventory-stats-badge');
    if (typeCount) {
        typeCount.textContent = formatDisplayNumber(items.length);
        typeCount.title = formatNumberCommas(items.length);
    }
    if (unitCount) {
        unitCount.textContent = formatDisplayNumber(totalUnits);
        unitCount.title = formatNumberCommas(totalUnits);
    }
    if (statsBadge) statsBadge.textContent = `${formatDisplayNumber(items.length)} Types · ${formatDisplayNumber(totalUnits)} Units`;

    const boosterActionWrap = document.getElementById('inventory-booster-action-wrap');
    const boosterAction = document.getElementById('btn-open-bulk-boosters');
    const boosterActionLabel = document.getElementById('inventory-booster-action-label');
    const hideUnavailableAction = boosterUnits === 0 && inventoryPrefs.showUnavailableBoosterAction === false;
    boosterActionWrap?.classList.toggle('hidden', hideUnavailableAction);
    if (boosterAction) {
        boosterAction.disabled = boosterUnits === 0;
        boosterAction.title = boosterUnits > 0
            ? `Configure activation for ${formatNumberCommas(boosterUnits)} owned booster units`
            : 'No boosters owned';
    }
    if (boosterActionLabel) boosterActionLabel.textContent = 'Activate Boosters';

    const lockedList = Array.isArray(playerState.lockedItems) ? playerState.lockedItems : [];
    const pinnedList = Array.isArray(playerState.favoriteItems) ? playerState.favoriteItems : [];

    const searchTerm = inventoryPrefs.search.trim().toLowerCase();
    const filtered = items.filter(item => {
        const matchesSearch = !searchTerm || item.displayName.toLowerCase().includes(searchTerm) || item.rawName.toLowerCase().includes(searchTerm);
        const matchesCategory = inventoryPrefs.category === 'all' || item.category === inventoryPrefs.category;
        return matchesSearch && matchesCategory;
    });

    const isItemPinned = item => pinnedList.includes(item.rawName) || pinnedList.includes(item.displayName);
    const isItemLocked = item => lockedList.includes(item.rawName) || lockedList.includes(item.displayName);

    const pinnedItems = sortItems(filtered.filter(isItemPinned), inventoryPrefs.sort);
    const unpinnedItems = sortItems(filtered.filter(item => !isItemPinned(item)), inventoryPrefs.sort);
    renderedItems = [...pinnedItems, ...unpinnedItems];

    if (renderedItems.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
        if (pinnedContainer) {
            pinnedContainer.classList.add('hidden');
            if (pinnedGrid) pinnedGrid.innerHTML = '';
        }
        emptyState.classList.remove('hidden');
        const title = emptyState.querySelector('.empty-title') || emptyState.querySelector('h3');
        const message = emptyState.querySelector('.empty-desc') || emptyState.querySelector('p');
        if (items.length === 0) {
            if (title) title.textContent = 'Inventory Empty';
            if (message) message.textContent = 'Gather resources or harvest crops to fill your inventory.';
        } else {
            if (title) title.textContent = 'No Matching Items';
            if (message) message.textContent = 'Adjust your search or category filter to see more items.';
        }
        return;
    }

    emptyState.classList.add('hidden');

    // Render Pinned Section
    if (pinnedContainer && pinnedGrid) {
        if (pinnedItems.length > 0) {
            pinnedContainer.classList.remove('hidden');
            if (pinnedCountEl) pinnedCountEl.textContent = formatDisplayNumber(pinnedItems.length);
            if (pinnedIconWrap) pinnedIconWrap.innerHTML = iconHtml('lucide:star', 'pinned-section-svg');
            pinnedGrid.innerHTML = pinnedItems.map(item => renderCardHtml(item, isItemLocked(item), true)).join('');
        } else {
            pinnedContainer.classList.add('hidden');
            pinnedGrid.innerHTML = '';
        }
    }

    // Render Standard Unpinned Section
    if (unpinnedItems.length > 0) {
        grid.classList.remove('hidden');
        grid.innerHTML = unpinnedItems.map(item => renderCardHtml(item, isItemLocked(item), false)).join('');
    } else {
        grid.innerHTML = '';
        grid.classList.add('hidden');
    }
};
