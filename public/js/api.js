// API Client & Action Handlers
import { getState, setState, saveState } from './state.js';
import { showToast } from './ui/toast.js';

/**
 * Generic API caller with auto playerState inclusion, state saving, error handling, and trigger element loading state support.
 */
let _postQueue = Promise.resolve();

const _apiCallInternal = async (endpoint, method = 'GET', body = null, triggerElement = null) => {
    if (triggerElement) {
        triggerElement.classList.add('btn-loading');
        triggerElement.disabled = true;
    }

    try {
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
            const errorMsg = data.error || (data.result && data.result.error) || data.message || 'API Error';
            throw new Error(errorMsg);
        }

        if (data.state) {
            setState(data.state);
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
