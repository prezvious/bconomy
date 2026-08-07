// Constants & Utilities

export const ACTIONS = [
    { id: 'mine', name: 'Mine', icon: 'lucide:pickaxe' },
    { id: 'explore', name: 'Explore', icon: 'lucide:compass' },
    { id: 'hunt', name: 'Hunt', icon: 'lucide:crosshair' },
    { id: 'fish', name: 'Fish', icon: 'lucide:fish' },
    { id: 'work', name: 'Work', icon: 'lucide:briefcase' }
];

export const TOOLS = ['mine', 'explore', 'hunt', 'fish'];
export const THEME_KEY = 'bconomy_theme';

export const iconHtml = (name, className = '') =>
    `<iconify-icon icon="${name}" class="${className}" aria-hidden="true"></iconify-icon>`;

export const getItemCategory = (itemName) => {
    const n = itemName.toLowerCase();
    if (/fish|salmon|tuna|bass|trout|shrimp|crab|lobster|eel/.test(n)) return 'fish';
    if (/meat|hide|bone|fur|feather|horn|tusk|leather/.test(n)) return 'meat';
    if (/ore|coal|iron|gold|silver|copper|gem|diamond|ruby|emerald|stone|rock|crystal/.test(n)) return 'ore';
    if (/wood|log|plank|leaf|herb|flower|mushroom|berry|fruit|seed/.test(n)) return 'wood';
    if (/coin|cash|gold bar|bar/.test(n)) return 'coin';
    return 'default';
};

export const getItemIcon = (itemName) => {
    const cat = getItemCategory(itemName);
    switch (cat) {
        case 'fish': return 'lucide:fish';
        case 'meat': return 'lucide:beef';
        case 'ore': return 'lucide:gem';
        case 'wood': return 'lucide:leaf';
        case 'coin': return 'lucide:coins';
        default: return 'lucide:package';
    }
};

export const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
};

export const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
};

export const formatNumberCommas = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
};

/**
 * Re-inserts spaces into PascalCase item names for human-readable UI display.
 * e.g. 'DiscardedButt' -> 'Discarded Butt'
 */
export const displayItemName = (name) => {
    if (!name) return '';
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
};
