// Centralized, browser-local UI preferences.
// Game state remains independent so display choices never affect economy data.

export const SETTINGS_STORAGE_KEY = 'bconomy_user_settings';
export const SETTINGS_CHANGE_EVENT = 'bconomy:settings-change';

const VALID_NOTIFICATION_DENSITIES = new Set(['verbose', 'standard', 'minimal', 'muted']);
const VALID_NUMBER_DISPLAYS = new Set(['full', 'named']);
const VALID_INTERFACE_DENSITIES = new Set(['balanced', 'dense', 'comfortable']);
const VALID_INVENTORY_VIEWS = new Set(['grid', 'compact']);
const VALID_INVENTORY_SORTS = new Set(['name-asc', 'quantity-desc', 'quantity-asc', 'category']);
const VALID_TIMER_DATE_FORMATS = new Set([
    'dd/mm/yyyy',
    'dd-mm-yyyy',
    'dd.mm.yyyy',
    'yyyy-mm-dd',
    'yyyy/mm/dd',
    'mm/dd/yyyy',
    'd-mmm-yyyy',
    'mmm-d-yyyy',
    'full-date'
]);
const VALID_TIMER_TIME_FORMATS = new Set(['24h', '24h-short', '12h', '12h-short', 'none']);
const VALID_TIMER_TIMEZONES = new Set(['local', 'utc']);
const VALID_DURATION_FORMATS = new Set(['adaptive', 'adaptive-2', 'full', 'days-hours', 'hours']);
const VALID_TIMER_HOVER_MODES = new Set(['swap', 'tooltip', 'both']);

const DEFAULT_SETTINGS = Object.freeze({
    density: 'verbose',
    coalescing: true,
    maxVisible: 4,
    mirrorToLog: true,
    categories: Object.freeze({
        perks: true,
        tools: true,
        actions: true,
        farm: true,
        shop: true,
        alerts: true
    }),
    numberDisplay: 'full',
    interfaceDensity: 'balanced',
    collapseSearchOnBlur: false,
    timerDateFormat: 'dd/mm/yyyy',
    timerTimeFormat: '24h',
    timerTimezone: 'local',
    durationFormat: 'adaptive',
    timerHoverMode: 'swap',
    bulkActions: Object.freeze({
        skipAllPreviews: false
    }),
    inventory: Object.freeze({
        view: 'grid',
        search: '',
        category: 'all',
        sort: 'name-asc',
        showUnavailableBoosterAction: true
    })
});

const cloneDefaults = () => ({
    ...DEFAULT_SETTINGS,
    categories: { ...DEFAULT_SETTINGS.categories },
    bulkActions: { ...DEFAULT_SETTINGS.bulkActions },
    inventory: { ...DEFAULT_SETTINGS.inventory }
});

export const getDefaultSettings = cloneDefaults;

const normalizeBoolean = (value, fallback) => typeof value === 'boolean' ? value : fallback;

export const normalizeSettings = (candidate = {}) => {
    const defaults = cloneDefaults();
    const value = candidate && typeof candidate === 'object' ? candidate : {};
    const categories = value.categories && typeof value.categories === 'object' ? value.categories : {};
    const bulkActions = value.bulkActions && typeof value.bulkActions === 'object' ? value.bulkActions : {};
    const inventory = value.inventory && typeof value.inventory === 'object' ? value.inventory : {};
    const maxVisible = Number.parseInt(value.maxVisible, 10);

    return {
        ...value,
        density: VALID_NOTIFICATION_DENSITIES.has(value.density) ? value.density : defaults.density,
        coalescing: normalizeBoolean(value.coalescing, defaults.coalescing),
        maxVisible: [2, 3, 4, 5, 8].includes(maxVisible) ? maxVisible : defaults.maxVisible,
        mirrorToLog: normalizeBoolean(value.mirrorToLog, defaults.mirrorToLog),
        categories: Object.fromEntries(Object.entries(defaults.categories).map(([key, fallback]) => [
            key,
            normalizeBoolean(categories[key], fallback)
        ])),
        numberDisplay: VALID_NUMBER_DISPLAYS.has(value.numberDisplay) ? value.numberDisplay : defaults.numberDisplay,
        interfaceDensity: VALID_INTERFACE_DENSITIES.has(value.interfaceDensity) ? value.interfaceDensity : defaults.interfaceDensity,
        collapseSearchOnBlur: normalizeBoolean(value.collapseSearchOnBlur, defaults.collapseSearchOnBlur),
        timerDateFormat: VALID_TIMER_DATE_FORMATS.has(value.timerDateFormat) ? value.timerDateFormat : defaults.timerDateFormat,
        timerTimeFormat: VALID_TIMER_TIME_FORMATS.has(value.timerTimeFormat) ? value.timerTimeFormat : defaults.timerTimeFormat,
        timerTimezone: VALID_TIMER_TIMEZONES.has(value.timerTimezone) ? value.timerTimezone : defaults.timerTimezone,
        durationFormat: VALID_DURATION_FORMATS.has(value.durationFormat) ? value.durationFormat : defaults.durationFormat,
        timerHoverMode: VALID_TIMER_HOVER_MODES.has(value.timerHoverMode) ? value.timerHoverMode : defaults.timerHoverMode,
        bulkActions: {
            skipAllPreviews: normalizeBoolean(bulkActions.skipAllPreviews, defaults.bulkActions.skipAllPreviews)
        },
        inventory: {
            view: VALID_INVENTORY_VIEWS.has(inventory.view) ? inventory.view : defaults.inventory.view,
            search: typeof inventory.search === 'string' ? inventory.search.slice(0, 120) : defaults.inventory.search,
            category: typeof inventory.category === 'string' && inventory.category.length <= 60 ? inventory.category : defaults.inventory.category,
            sort: VALID_INVENTORY_SORTS.has(inventory.sort) ? inventory.sort : defaults.inventory.sort,
            showUnavailableBoosterAction: normalizeBoolean(
                inventory.showUnavailableBoosterAction,
                defaults.inventory.showUnavailableBoosterAction
            )
        }
    };
};

let cachedSettings = null;

export const getStoredSettings = ({ refresh = false } = {}) => {
    if (!refresh && cachedSettings) return normalizeSettings(cachedSettings);

    try {
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(SETTINGS_STORAGE_KEY) : null;
        cachedSettings = normalizeSettings(stored ? JSON.parse(stored) : {});
    } catch (error) {
        console.warn('Ignoring invalid stored user settings and restoring defaults.');
        cachedSettings = cloneDefaults();
    }
    return normalizeSettings(cachedSettings);
};

export const applyInterfaceSettings = (settings = getStoredSettings()) => {
    if (typeof document === 'undefined' || !document.documentElement) return;
    document.documentElement.dataset.density = settings.interfaceDensity;
};

const emitSettingsChange = (previous, current, changedKeys) => {
    if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') return;
    document.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, {
        detail: { previous, current, changedKeys }
    }));
};

export const saveStoredSettings = (settings, { emit = true } = {}) => {
    const previous = getStoredSettings();
    const normalized = normalizeSettings(settings);
    cachedSettings = normalized;

    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
        }
    } catch (error) {
        console.warn('Failed to save user settings to localStorage:', error);
    }

    applyInterfaceSettings(normalized);
    if (emit) {
        const changedKeys = Object.keys(normalized).filter(key => JSON.stringify(previous[key]) !== JSON.stringify(normalized[key]));
        emitSettingsChange(previous, normalized, changedKeys);
    }
    return normalizeSettings(normalized);
};

export const updateStoredSettings = (patch) => {
    const current = getStoredSettings();
    const nextPatch = typeof patch === 'function' ? patch(normalizeSettings(current)) : patch;
    return saveStoredSettings({ ...current, ...(nextPatch || {}) });
};

export const resetDisplaySettings = () => {
    const current = getStoredSettings();
    const defaults = cloneDefaults();
    return saveStoredSettings({
        ...current,
        numberDisplay: defaults.numberDisplay,
        interfaceDensity: defaults.interfaceDensity,
        collapseSearchOnBlur: defaults.collapseSearchOnBlur,
        timerDateFormat: defaults.timerDateFormat,
        timerTimeFormat: defaults.timerTimeFormat,
        timerTimezone: defaults.timerTimezone,
        durationFormat: defaults.durationFormat,
        timerHoverMode: defaults.timerHoverMode,
        inventory: { ...defaults.inventory }
    });
};

export const invalidateSettingsCache = () => {
    cachedSettings = null;
};

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', event => {
        if (event.key !== SETTINGS_STORAGE_KEY) return;
        const previous = getStoredSettings();
        invalidateSettingsCache();
        const current = getStoredSettings({ refresh: true });
        applyInterfaceSettings(current);
        const changedKeys = Object.keys(current).filter(key => JSON.stringify(previous[key]) !== JSON.stringify(current[key]));
        emitSettingsChange(previous, current, changedKeys);
    });
}
