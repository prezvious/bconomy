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

let renderedItems = [];

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

    if (grid && grid.dataset.inventoryDelegated !== 'true') {
        grid.dataset.inventoryDelegated = 'true';
        grid.addEventListener('click', event => {
            const card = event.target.closest?.('.inventory-item');
            const index = Number.parseInt(card?.dataset.index, 10);
            if (Number.isInteger(index) && renderedItems[index]) {
                openItemModal(renderedItems[index].rawName);
            }
        });
    }
};

const sortItems = (items, sort) => items.sort((a, b) => {
    if (sort === 'quantity-desc') return b.quantity - a.quantity || a.displayName.localeCompare(b.displayName);
    if (sort === 'quantity-asc') return a.quantity - b.quantity || a.displayName.localeCompare(b.displayName);
    if (sort === 'category') return a.category.localeCompare(b.category) || a.displayName.localeCompare(b.displayName);
    return a.displayName.localeCompare(b.displayName);
});

export const renderInventory = () => {
    const playerState = getState();
    const grid = document.getElementById('inventory-grid');
    const emptyState = document.getElementById('inventory-empty');
    const search = document.getElementById('inventory-search');
    if (!playerState || !grid || !emptyState || !search) return;

    setupInventoryControls();
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
    if (boosterActionLabel) boosterActionLabel.textContent = `Activate Boosters (${formatDisplayNumber(boosterUnits)})`;

    const searchTerm = inventoryPrefs.search.trim().toLowerCase();
    const filtered = items.filter(item => {
        const matchesSearch = !searchTerm || item.displayName.toLowerCase().includes(searchTerm) || item.rawName.toLowerCase().includes(searchTerm);
        const matchesCategory = inventoryPrefs.category === 'all' || item.category === inventoryPrefs.category;
        return matchesSearch && matchesCategory;
    });
    renderedItems = sortItems(filtered, inventoryPrefs.sort);

    if (renderedItems.length === 0) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
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
    grid.classList.remove('hidden');
    grid.innerHTML = renderedItems.map((item, index) => {
        const displayName = escapeHtml(item.displayName);
        const category = escapeHtml(item.category);
        const displayQuantity = formatDisplayNumber(item.quantity);
        const exactQuantity = formatNumberCommas(item.quantity);
        return `
            <button class="inventory-item card" type="button" data-index="${index}"
                aria-label="View details for ${displayName}, ${exactQuantity} owned" title="${displayName} · ${exactQuantity} owned">
                <span class="item-card-top">
                    <span class="item-cat-badge" data-cat="${category}">${escapeHtml(titleCase(item.category))}</span>
                    <span class="item-qty" title="${exactQuantity}">${displayQuantity}</span>
                </span>
                <span class="item-icon-wrap" data-cat="${category}">${iconHtml(getItemIcon(item.rawName), 'item-icon')}</span>
                <span class="item-name">${displayName}</span>
            </button>`;
    }).join('');
};
