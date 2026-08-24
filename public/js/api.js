// API Client & Action Handlers
import { getState, setState, saveState, getRevision, setRevision } from './state.js';
import { getAccessToken, getAuthHeaders, refreshAuthSession, signOutUser } from './auth.js';
import { showToast } from './ui/toast.js';

/**
 * Generic API caller with auto playerState inclusion, state saving, error handling, and trigger element loading state support.
 */
let _postQueue = Promise.resolve();

const COMMAND_ENDPOINTS = Object.freeze({
    '/api/inventory/lock': { type: 'inventory.setFlags', payload: body => ({ itemIds: [body.itemName], changes: { locked: !!body.locked } }) },
    '/api/inventory/pin': { type: 'inventory.setFlags', payload: body => ({ itemIds: [body.itemName], changes: { favorite: !!body.pinned } }) },
    '/api/action': { type: 'action.perform' },
    '/api/tool/upgrade': { type: 'tool.upgrade' },
    '/api/tool/upgrade-bulk': { type: 'tool.upgradeBulk' },
    '/api/tool/socket/install': { type: 'tool.socketInstall' },
    '/api/tool/socket/uninstall': { type: 'tool.socketUninstall' },
    '/api/tool/module/craft': { type: 'tool.moduleCraft' },
    '/api/crafting/execute': { type: 'crafting.execute' },
    '/api/rank/up': { type: 'rank.up' },
    '/api/prestige/ascend': { type: 'prestige.ascend' },
    '/api/prestige/perk': { type: 'prestige.upgradePerk' },
    '/api/prestige/targeted-rank-up': { type: 'prestige.targetedRankUp' },
    '/api/farm/state': { type: 'farm.refresh' },
    '/api/farm/plant': { type: 'farm.plant' },
    '/api/farm/plant-all': { type: 'farm.plantAll' },
    '/api/farm/uproot': { type: 'farm.uproot' },
    '/api/farm/uproot-same-crop': { type: 'farm.uprootSame' },
    '/api/farm/upgrade': { type: 'farm.upgrade' },
    '/api/farm/upgrade-bulk': { type: 'farm.upgradeBulk' },
    '/api/farm/water-all': { type: 'farm.waterAll' },
    '/api/farm/add-plot': { type: 'farm.addPlot' },
    '/api/farm/claim': { type: 'farm.claim' },
    '/api/farm/use-melon': { type: 'farm.useMelon' },
    '/api/shop/state': { type: 'shop.refresh' },
    '/api/shop/restock': { type: 'shop.restock' },
    '/api/shop/force-restock': { type: 'shop.restock' },
    '/api/shop/buy': { type: 'shop.buy', payload: body => ({ ...body, itemName: body.itemName || body.item }) },
    '/api/shop/sell': { type: 'shop.sell', payload: body => ({ ...body, itemName: body.itemName || body.item }) },
    '/api/shop/booster/buy': { type: 'shop.buyBooster' },
    '/api/shop/bulk-sell/execute': { type: 'shop.bulkSell' },
    '/api/shop/bulk-buy/execute': { type: 'shop.bulkBuy' },
    '/api/booster/bulk/execute': { type: 'booster.bulkActivate' },
    '/api/booster/use': { type: 'booster.use' },
    '/api/booster/activate': { type: 'booster.activate' },
    '/api/gambling/coinflip': { type: 'gambling.coinflip' },
    '/api/gambling/slots': { type: 'gambling.slots' },
    '/api/faction/state': { type: 'faction.refresh' },
    '/api/faction/create': { type: 'faction.create' },
    '/api/faction/deposit': { type: 'faction.deposit' },
    '/api/faction/boost/activate': { type: 'faction.activateBoost' },
    '/api/faction/boost/stop': { type: 'faction.stopBoost' },
    '/api/faction/customize': { type: 'faction.customize' }
});

const QUERY_ENDPOINTS = Object.freeze({
    '/api/tool/preview-upgrade': { type: 'tool.previewUpgrade' },
    '/api/crafting/preview': { type: 'crafting.preview' },
    '/api/farm/upgrade-preview': { type: 'farm.upgradePreview' },
    '/api/farm/upgrade-bulk-preview': { type: 'farm.bulkUpgradePreview' },
    '/api/shop/bulk-sell/preview': { type: 'shop.bulkSellPreview' },
    '/api/shop/bulk-buy/preview': { type: 'shop.bulkBuyPreview' },
    '/api/booster/bulk/preview': { type: 'booster.bulkPreview' }
});

const commandId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
    else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const errorMessage = data => {
    const candidate = data?.error || data?.result?.error || data?.message;
    if (typeof candidate === 'string') return candidate;
    return candidate?.message || 'API Error';
};

const fetchWithSessionRefresh = async (url, options, retry = true) => {
    const response = await fetch(url, options);
    if (response.status !== 401 || !retry || !getAccessToken()) return response;
    if (!await refreshAuthSession()) {
        await signOutUser();
        showToast('Your session expired. Local guest progress is still available.', 'error');
        return response;
    }
    options.headers = { ...options.headers, ...getAuthHeaders() };
    return fetch(url, options);
};

const applyGameResponse = data => {
    if (data?.state) {
        setState(data.state);
        setRevision(data.revision);
        saveState();
    } else if (Number.isSafeInteger(data?.revision)) {
        setRevision(data.revision);
    }
    return data?.result && typeof data.result === 'object' ? { ...data.result, ...data } : data;
};

export const gameCommand = async (type, payload = {}, triggerElement = null) => {
    if (triggerElement) {
        triggerElement.classList.add('btn-loading');
        triggerElement.disabled = true;
    }
    try {
        const signed = !!getAccessToken();
        const body = {
            commandId: commandId(),
            expectedRevision: getRevision(),
            type,
            payload,
            ...(signed ? {} : { guestState: getState() })
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '1', ...getAuthHeaders() },
            body: JSON.stringify(body)
        };
        let response;
        try {
            response = await fetchWithSessionRefresh('/api/game/commands', requestOptions);
        } catch {
            response = await fetchWithSessionRefresh('/api/game/commands', requestOptions);
        }
        const data = await response.json();
        if (response.status === 409 && data.state) applyGameResponse(data);
        if (!response.ok || data.error) throw new Error(errorMessage(data));
        return applyGameResponse(data);
    } finally {
        if (triggerElement) {
            triggerElement.classList.remove('btn-loading');
            triggerElement.disabled = false;
        }
    }
};

export const gameQuery = async (type, payload = {}) => {
    const signed = !!getAccessToken();
    const response = await fetchWithSessionRefresh('/api/game/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '1', ...getAuthHeaders() },
        body: JSON.stringify({ type, payload, ...(signed ? {} : { guestState: getState() }) })
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(errorMessage(data));
    return applyGameResponse(data);
};

const _apiCallInternal = async (endpoint, method = 'GET', body = null, triggerElement = null) => {
    if (triggerElement) {
        triggerElement.classList.add('btn-loading');
        triggerElement.disabled = true;
    }

    try {
        const commandDefinition = method === 'POST' ? COMMAND_ENDPOINTS[endpoint] : null;
        const queryDefinition = method === 'POST' ? QUERY_ENDPOINTS[endpoint] : null;
        if (commandDefinition || queryDefinition) {
            const payload = (commandDefinition || queryDefinition).payload
                ? (commandDefinition || queryDefinition).payload(body || {})
                : (body || {});
            return commandDefinition
                ? await gameCommand(commandDefinition.type, payload)
                : await gameQuery(queryDefinition.type, payload);
        }

        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };

        let requestBody = body;
        if (method === 'POST') {
            requestBody = { playerState: getState(), ...(body || {}) };
        }

        if (requestBody) {
            options.body = JSON.stringify(requestBody);
        }

        const response = await fetch(endpoint, options);
        const contentType = (response.headers && typeof response.headers.get === 'function' ? response.headers.get('content-type') : 'application/json') || '';
        let data = {};

        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            const errorMsg = response.status === 404
                ? `Endpoint ${endpoint} not found (404). Please restart the backend server.`
                : `Server returned ${response.status}: ${response.statusText}`;
            throw new Error(errorMsg);
        }

        if (!response.ok || data.success === false || data.error || (data.result && data.result.error)) {
            const errorMsg = errorMessage(data);
            throw new Error(errorMsg);
        }

        const returnedState = data.state || data.playerState;
        if (returnedState) {
            setState(returnedState);
            saveState();
        }

        return data;
    } catch (error) {
        showToast(error.message || 'Something went wrong', 'error');
        console.error('API Error:', error);
        throw error;
    } finally {
        if (triggerElement) {
            triggerElement.classList.remove('btn-loading');
            triggerElement.disabled = false;
        }
    }
};

export const apiCall = async (endpoint, method = 'GET', body = null, triggerElement = null) => {
    if (method === 'POST') {
        let resolve, reject;
        const result = new Promise((res, rej) => { resolve = res; reject = rej; });
        _postQueue = _postQueue.then(
            () => _apiCallInternal(endpoint, method, body, triggerElement).then(resolve, reject),
            () => _apiCallInternal(endpoint, method, body, triggerElement).then(resolve, reject)
        );
        return result;
    }
    return _apiCallInternal(endpoint, method, body, triggerElement);
};

export const doAction = (actionType, el) => apiCall('/api/action', 'POST', { actionType }, el);
export const doRankUp = (el) => apiCall('/api/rank/up', 'POST', {}, el);
export const doAscend = (el) => apiCall('/api/prestige/ascend', 'POST', {}, el);
export const doUpgradePerk = (perkName, count = 1, el) => apiCall('/api/prestige/perk', 'POST', { perkName, count }, el);
export const doUpgradeTool = (toolType, el) => apiCall('/api/tool/upgrade', 'POST', { toolType }, el);
export const doUpgradeToolBulk = (toolType, targetLevelOrCount, isCount = false, el) => apiCall('/api/tool/upgrade-bulk', 'POST', { toolType, targetLevelOrCount, isCount }, el);
export const doPreviewToolUpgrade = (toolType, targetLevel, count) => apiCall('/api/tool/preview-upgrade', 'POST', { toolType, targetLevel, count });
export const doInstallSocketModule = (toolType, socketIndex, moduleId, el) => apiCall('/api/tool/socket/install', 'POST', { toolType, socketIndex, moduleId }, el);
export const doUninstallSocketModule = (toolType, socketIndex, el) => apiCall('/api/tool/socket/uninstall', 'POST', { toolType, socketIndex }, el);
export const doCraftSocketModule = (moduleId, quantity = 1, el) => apiCall('/api/tool/module/craft', 'POST', { moduleId, quantity }, el);
export const doGetToolDefinitions = () => apiCall('/api/tool/definitions', 'GET');
export const doGetCraftingCatalog = () => apiCall('/api/crafting/catalog', 'GET');
export const doPreviewCrafting = (recipeId, craftCount = 1, mode = 'direct') => apiCall('/api/crafting/preview', 'POST', { recipeId, craftCount, mode });
export const doExecuteCrafting = (recipeId, craftCount = 1, mode = 'direct') => apiCall('/api/crafting/execute', 'POST', { recipeId, craftCount, mode });
export const doPlant = (plotId, cropName, el) => apiCall('/api/farm/plant', 'POST', { plotId, cropName }, el);
export const doPlantAll = (cropName, el) => apiCall('/api/farm/plant-all', 'POST', { cropName }, el);
export const doUproot = (plotId, el) => apiCall('/api/farm/uproot', 'POST', { plotId }, el);
export const doUprootSameCrop = (cropName, el) => apiCall('/api/farm/uproot-same-crop', 'POST', { cropName }, el);
export const doPreviewPlotUpgrade = (plotId, mode = 'next') => apiCall('/api/farm/upgrade-preview', 'POST', { plotId, mode });
export const doUpgradePlot = (plotId, mode = 'next', el) => apiCall('/api/farm/upgrade', 'POST', { plotId, mode }, el);
export const doPreviewBulkPlotUpgrade = (scope, plotIds, mode = 'next', el) => apiCall('/api/farm/upgrade-bulk-preview', 'POST', { scope, plotIds, mode }, el);
export const doBulkUpgradePlots = (scope, plotIds, mode = 'next', el) => apiCall('/api/farm/upgrade-bulk', 'POST', { scope, plotIds, mode }, el);
export const doWaterAll = (el) => apiCall('/api/farm/water-all', 'POST', {}, el);
export const doAddPlot = (el) => apiCall('/api/farm/add-plot', 'POST', {}, el);
export const doClaim = (cropType, el) => apiCall('/api/farm/claim', 'POST', { cropType }, el);
export const doUseMelon = (el) => apiCall('/api/farm/use-melon', 'POST', {}, el);
export const doFarmState = () => apiCall('/api/farm/state', 'POST');

// Shop & Booster API Callers
export const doGetShopState = () => apiCall('/api/shop/state', 'POST');
export const doForceRestock = (el) => apiCall('/api/shop/restock', 'POST', {}, el);
export const doBuyShopItem = (itemName, quantity, el) => apiCall('/api/shop/buy', 'POST', { itemName, quantity }, el);
export const doSellShopItem = (itemName, quantity, el) => apiCall('/api/shop/sell', 'POST', { itemName, quantity }, el);
export const doBuyBooster = (boosterName, quantity, el) => apiCall('/api/shop/booster/buy', 'POST', { boosterName, quantity }, el);
export const doActivateBooster = (boosterName, el) => apiCall('/api/booster/activate', 'POST', { boosterName }, el);
export const doUseBooster = (itemName, actionType, el) => apiCall('/api/booster/use', 'POST', { itemName, actionType }, el);
export const doActivateBoosterDirect = (actionType, tier, el) => apiCall('/api/booster/activate', 'POST', { actionType, tier }, el);
export const doPreviewBulkBoosters = (options, el) => apiCall('/api/booster/bulk/preview', 'POST', { options }, el);
export const doExecuteBulkBoosters = (options, el) => apiCall('/api/booster/bulk/execute', 'POST', { options }, el);

// Bulk Actions API Callers
export const doPreviewBulkSell = (options, el) => apiCall('/api/shop/bulk-sell/preview', 'POST', { options }, el);
export const doExecuteBulkSell = (options, el) => apiCall('/api/shop/bulk-sell/execute', 'POST', { options }, el);
export const doPreviewBulkBuy = (options, el) => apiCall('/api/shop/bulk-buy/preview', 'POST', { options }, el);
export const doExecuteBulkBuy = (options, el) => apiCall('/api/shop/bulk-buy/execute', 'POST', { options }, el);

// Faction API Callers
export const doFactionState = () => apiCall('/api/faction/state', 'POST');
export const doFactionCreate = (name, description, el) => apiCall('/api/faction/create', 'POST', { name, description }, el);
export const doFactionDeposit = (amount, el) => apiCall('/api/faction/deposit', 'POST', { amount }, el);
export const doFactionActivateBoost = (actionType, level, durationHours, mode, el) => apiCall('/api/faction/boost/activate', 'POST', { actionType, level, durationHours, mode }, el);
export const doFactionStopBoost = (actionType, el) => apiCall('/api/faction/boost/stop', 'POST', { actionType }, el);
export const doFactionCustomize = (name, description, el) => apiCall('/api/faction/customize', 'POST', { name, description }, el);

// QOL domain callers
export const doSetInventoryFlags = (itemIds, changes, el) => gameCommand('inventory.setFlags', { itemIds, changes }, el);
export const doSetWishlist = (itemIds, wished, el) => gameCommand('shop.setWishlist', { itemIds, wished, addedAt: Date.now() }, el);
export const doGetItemCatalog = () => apiCall('/api/catalog/items', 'GET');
export const doPreviewExtendActiveBoosters = () => gameQuery('booster.extendActivePreview');
export const doExtendActiveBoosters = el => gameCommand('booster.extendActive', {}, el);
export const doGetCraftingMax = (recipeId, mode = 'direct') => gameQuery('crafting.maxAffordable', { recipeId, mode });
export const doGetWhereUsed = itemId => gameQuery('crafting.whereUsed', { itemId });
export const doPreviewIntermediate = (parentRecipeId, parentCraftCount, inputItemId) => gameQuery('crafting.intermediate', { parentRecipeId, parentCraftCount, inputItemId });
export const doCraftIntermediate = (parentRecipeId, parentCraftCount, inputItemId) => gameCommand('crafting.craftIntermediate', { parentRecipeId, parentCraftCount, inputItemId });
export const doGetProgressionSummary = () => gameQuery('progression.summary');
export const doPreviewRankTarget = (targetTier, targetRankIndex, isMaxAffordable = false) => gameQuery('progression.target', { targetTier, targetRankIndex, isMaxAffordable });
export const doSimulatePerks = (targetLevels, budget, weights) => gameQuery('prestige.simulate', { targetLevels, budget, weights });
export const doOptimizePerks = (budget, weights) => gameQuery('prestige.optimize', { budget, weights });
export const doApplyPerkAllocation = targetLevels => gameCommand('prestige.applyAllocation', { targetLevels });
export const doAscendAndApplyAllocation = targetLevels => gameCommand('prestige.ascendAndApply', { targetLevels });
export const doGetToolMaxSummary = toolType => gameQuery('tool.maxAffordable', { toolType });
export const doResetPlayer = () => gameCommand('player.reset');
