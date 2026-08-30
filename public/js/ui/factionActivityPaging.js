export const FACTION_ACTIVITY_DENSITY_STORAGE_KEY = 'bconomy_faction_activity_density';

export const FACTION_ACTIVITY_DENSITIES = Object.freeze({
    comfortable: Object.freeze({ label: 'Comfortable', pageSize: 10 }),
    compact: Object.freeze({ label: 'Compact', pageSize: 5 }),
    'super-compact': Object.freeze({ label: 'Super Compact', pageSize: 5 })
});

export const normalizeFactionActivityDensity = value => (
    Object.hasOwn(FACTION_ACTIVITY_DENSITIES, value) ? value : 'comfortable'
);

export const getFactionActivityDensity = value => (
    FACTION_ACTIVITY_DENSITIES[normalizeFactionActivityDensity(value)]
);

export const readFactionActivityDensity = (storage = globalThis.localStorage) => {
    try {
        return normalizeFactionActivityDensity(storage?.getItem(FACTION_ACTIVITY_DENSITY_STORAGE_KEY));
    } catch {
        return 'comfortable';
    }
};

export const writeFactionActivityDensity = (value, storage = globalThis.localStorage) => {
    const normalized = normalizeFactionActivityDensity(value);
    try {
        storage?.setItem(FACTION_ACTIVITY_DENSITY_STORAGE_KEY, normalized);
    } catch {
        // A blocked or full storage area should not prevent changing this view.
    }
    return normalized;
};

export const paginateFactionHistory = (entries, requestedPage, density) => {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const pageSize = getFactionActivityDensity(density).pageSize;
    const total = safeEntries.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const numericPage = Math.floor(Number(requestedPage) || 0);
    const page = Math.min(Math.max(0, numericPage), pageCount - 1);
    const startIndex = page * pageSize;

    return {
        items: safeEntries.slice(startIndex, startIndex + pageSize),
        page,
        pageCount,
        pageSize,
        total,
        start: total ? startIndex + 1 : 0,
        end: Math.min(startIndex + pageSize, total)
    };
};
