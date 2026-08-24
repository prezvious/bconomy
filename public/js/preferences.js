// Centralized, browser-local UI preferences.
// Game state remains independent so display choices never affect economy data.
import { getDefaultControls, normalizeControls } from './controlRegistry.js';

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
const VALID_CRAFTING_VIEWS = new Set(['standard', 'compact', 'super-compact']);
const VALID_CRAFTING_SORTS = new Set(['name', 'domain', 'effort', 'owned', 'craftable', 'missing']);
const VALID_PREVIEW_MODES = new Set(['every', 'recursive-only', 'large-only', 'never']);
export const QUANTITY_PRESET_SYSTEMS = Object.freeze([
    'crafting', 'shop-buy', 'shop-sell', 'booster-activation',
    'socket-module-crafting', 'tool-upgrades', 'perk-upgrades'
]);
const VALID_QUANTITY_SYSTEMS = new Set(QUANTITY_PRESET_SYSTEMS);

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
    quantityPresets: Object.freeze({
        version: 1,
        global: Object.freeze({
            values: Object.freeze([1, 10, 100, 1000]),
            previewMode: 'recursive-only',
            largeThreshold: 100
        }),
        systems: Object.freeze({}),
        subjects: Object.freeze({})
    }),
    inventory: Object.freeze({
        view: 'grid',
        search: '',
        category: 'all',
        sort: 'name-asc',
        showUnavailableBoosterAction: true
    }),
    crafting: Object.freeze({
        view: 'standard',
        search: '',
        domain: 'all',
        effort: 'all',
        classification: 'all',
        recipeForm: 'all',
        availability: 'all',
        sort: 'name'
    }),
    controls: Object.freeze(getDefaultControls()),
    utilityRail: Object.freeze({ open: true })
});

const cloneDefaults = () => ({
    ...DEFAULT_SETTINGS,
    categories: { ...DEFAULT_SETTINGS.categories },
    bulkActions: { ...DEFAULT_SETTINGS.bulkActions },
    quantityPresets: {
        version: DEFAULT_SETTINGS.quantityPresets.version,
        global: { ...DEFAULT_SETTINGS.quantityPresets.global, values: [...DEFAULT_SETTINGS.quantityPresets.global.values] },
        systems: {},
        subjects: {}
    },
    inventory: { ...DEFAULT_SETTINGS.inventory },
    crafting: { ...DEFAULT_SETTINGS.crafting },
    controls: normalizeControls(DEFAULT_SETTINGS.controls),
    utilityRail: { ...DEFAULT_SETTINGS.utilityRail }
});

export const getDefaultSettings = cloneDefaults;

const normalizeBoolean = (value, fallback) => typeof value === 'boolean' ? value : fallback;

const normalizePresetValues = (candidate, fallback) => {
    if (!Array.isArray(candidate) || candidate.length !== 4) return [...fallback];
    return candidate.map(value => {
        const numeric = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(numeric) ? numeric : null;
    });
};

const normalizePresetScope = (candidate, fallback = {}) => {
    const value = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
    const result = {};
    if (Object.hasOwn(value, 'values')) result.values = normalizePresetValues(value.values, fallback.values || [1, 10, 100, 1000]);
    if (VALID_PREVIEW_MODES.has(value.previewMode)) result.previewMode = value.previewMode;
    const threshold = Number(value.largeThreshold);
    if (Number.isSafeInteger(threshold) && threshold > 0) result.largeThreshold = threshold;
    return result;
};

const normalizeQuantityPresets = candidate => {
    const defaults = cloneDefaults().quantityPresets;
    const value = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {};
    const globalCandidate = normalizePresetScope(value.global, defaults.global);
    const global = {
        values: globalCandidate.values || [...defaults.global.values],
        previewMode: globalCandidate.previewMode || defaults.global.previewMode,
        largeThreshold: globalCandidate.largeThreshold || defaults.global.largeThreshold
    };
    const systems = {};
    const candidateSystems = value.systems && typeof value.systems === 'object' ? value.systems : {};
    for (const systemId of QUANTITY_PRESET_SYSTEMS) {
        if (candidateSystems[systemId]) systems[systemId] = normalizePresetScope(candidateSystems[systemId], global);
    }
    const subjects = {};
    const candidateSubjects = value.subjects && typeof value.subjects === 'object' ? value.subjects : {};
    for (const systemId of QUANTITY_PRESET_SYSTEMS) {
        const systemSubjects = candidateSubjects[systemId];
        if (!systemSubjects || typeof systemSubjects !== 'object' || Array.isArray(systemSubjects)) continue;
        subjects[systemId] = {};
        for (const [subjectId, scope] of Object.entries(systemSubjects).slice(0, 1000)) {
            if (!subjectId || subjectId.length > 200) continue;
            subjects[systemId][subjectId] = normalizePresetScope(scope, { ...global, ...(systems[systemId] || {}) });
        }
    }
    return { version: 1, global, systems, subjects };
};

export const resolveQuantityPreferences = (settings, systemId, subjectId = '') => {
    const normalized = normalizeSettings(settings);
    const quantityPresets = normalized.quantityPresets;
    const system = VALID_QUANTITY_SYSTEMS.has(systemId) ? (quantityPresets.systems[systemId] || {}) : {};
    const subject = subjectId && VALID_QUANTITY_SYSTEMS.has(systemId)
        ? (quantityPresets.subjects[systemId] && quantityPresets.subjects[systemId][subjectId] || {})
        : {};
    const resolved = { ...quantityPresets.global, ...system, ...subject };
    const values = Array.isArray(resolved.values) ? resolved.values.slice(0, 4) : [1, 10, 100, 1000];
    while (values.length < 4) values.push(null);
    const counts = new Map();
    for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
    return {
        values,
        presets: [
            ...values.map(value => ({
                value,
                label: Number.isFinite(value) ? String(value) : 'Invalid',
                valid: Number.isSafeInteger(value) && value > 0 && counts.get(value) === 1,
                max: false
            })),
            { value: 'max', label: 'Max', valid: true, max: true }
        ],
        previewMode: VALID_PREVIEW_MODES.has(resolved.previewMode) ? resolved.previewMode : 'recursive-only',
        largeThreshold: Number.isSafeInteger(resolved.largeThreshold) && resolved.largeThreshold > 0 ? resolved.largeThreshold : 100
    };
};

export const shouldConfirmQuantityOperation = ({ settings, systemId, subjectId = '', quantity, recursive = false }) => {
    const normalized = normalizeSettings(settings);
    if (normalized.bulkActions.skipAllPreviews === true) return false;
    const resolved = resolveQuantityPreferences(normalized, systemId, subjectId);
    if (resolved.previewMode === 'never') return false;
    if (resolved.previewMode === 'every') return true;
    if (resolved.previewMode === 'recursive-only') return recursive === true;
    return quantity === 'max' || (Number.isSafeInteger(quantity) && quantity >= resolved.largeThreshold);
};

export const normalizeSettings = (candidate = {}) => {
    const defaults = cloneDefaults();
    const value = candidate && typeof candidate === 'object' ? candidate : {};
    const categories = value.categories && typeof value.categories === 'object' ? value.categories : {};
    const bulkActions = value.bulkActions && typeof value.bulkActions === 'object' ? value.bulkActions : {};
    const inventory = value.inventory && typeof value.inventory === 'object' ? value.inventory : {};
    const crafting = value.crafting && typeof value.crafting === 'object' ? value.crafting : {};
    const utilityRail = value.utilityRail && typeof value.utilityRail === 'object' ? value.utilityRail : {};
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
        quantityPresets: normalizeQuantityPresets(value.quantityPresets),
        inventory: {
            view: VALID_INVENTORY_VIEWS.has(inventory.view) ? inventory.view : defaults.inventory.view,
            search: typeof inventory.search === 'string' ? inventory.search.slice(0, 120) : defaults.inventory.search,
            category: typeof inventory.category === 'string' && inventory.category.length <= 60 ? inventory.category : defaults.inventory.category,
            sort: VALID_INVENTORY_SORTS.has(inventory.sort) ? inventory.sort : defaults.inventory.sort,
            showUnavailableBoosterAction: normalizeBoolean(
                inventory.showUnavailableBoosterAction,
                defaults.inventory.showUnavailableBoosterAction
            )
        },
        crafting: {
            view: VALID_CRAFTING_VIEWS.has(crafting.view) ? crafting.view : defaults.crafting.view,
            search: typeof crafting.search === 'string' ? crafting.search.slice(0, 160) : defaults.crafting.search,
            domain: typeof crafting.domain === 'string' && crafting.domain.length <= 80 ? crafting.domain : defaults.crafting.domain,
            effort: typeof crafting.effort === 'string' && crafting.effort.length <= 40 ? crafting.effort : defaults.crafting.effort,
            classification: typeof crafting.classification === 'string' && crafting.classification.length <= 40 ? crafting.classification : defaults.crafting.classification,
            recipeForm: typeof crafting.recipeForm === 'string' && crafting.recipeForm.length <= 40 ? crafting.recipeForm : defaults.crafting.recipeForm,
            availability: typeof crafting.availability === 'string' && crafting.availability.length <= 40 ? crafting.availability : defaults.crafting.availability,
            sort: VALID_CRAFTING_SORTS.has(crafting.sort) ? crafting.sort : defaults.crafting.sort
        },
        controls: normalizeControls(value.controls),
        utilityRail: {
            open: normalizeBoolean(utilityRail.open, defaults.utilityRail.open)
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
        inventory: { ...defaults.inventory },
        crafting: { ...defaults.crafting }
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
