// Inventory Panel Renderer
import { getState } from '../state.js';
import { getItemCategory, getItemIcon, formatNumberCommas, displayItemName, iconHtml } from '../utils.js';

export const renderInventory = () => {
    const playerState = getState();
    if (!playerState) return;

    const grid = document.getElementById('inventory-grid');
    const emptyState = document.getElementById('inventory-empty');
    const searchInput = document.getElementById('inventory-search');
    if (!grid || !emptyState || !searchInput) return;

    // Consolidate inventory items by display name so duplicates are merged
    const consolidated = {};
    Object.entries(playerState.inventory || {}).forEach(([name, qty]) => {
        if (!qty || qty <= 0) return;
        const displayName = displayItemName(name);
        if (!consolidated[displayName]) {
            consolidated[displayName] = { rawName: name, displayName, qty: 0 };
        }
        consolidated[displayName].qty += qty;
    });

    const items = Object.values(consolidated);
    const searchTerm = (searchInput.value || '').toLowerCase().trim();

    const filteredItems = items.filter(item =>
        item.displayName.toLowerCase().includes(searchTerm) || item.rawName.toLowerCase().includes(searchTerm)
    );

    filteredItems.sort((a, b) => a.displayName.localeCompare(b.displayName));

    grid.innerHTML = '';

    if (filteredItems.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        const emptyMsg = emptyState.querySelector('p');
        if (emptyMsg) {
            if (items.length > 0) {
                emptyMsg.textContent = "No items match your search.";
            } else {
                emptyMsg.textContent = "Your inventory is empty.";
            }
        }
    } else {
        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        filteredItems.forEach(({ rawName, displayName, qty }) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item card';

            const category = getItemCategory(rawName);
            const icon = getItemIcon(rawName);

            itemEl.innerHTML = `
                <div class="item-icon-wrap" data-cat="${category}">${iconHtml(icon, 'item-icon')}</div>
                <div class="item-qty">${formatNumberCommas(qty)}×</div>
                <div class="item-name" title="${displayName}">${displayName}</div>
            `;
            grid.appendChild(itemEl);
        });
    }
};
