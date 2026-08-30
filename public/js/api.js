// API Client & Action Handlers
import { getState, setState, saveState, getRevision, setRevision } from './state.js';
import {
    getAccessToken,
    getAuthHeaders,
    getAuthProfile,
    getAuthRecoveryState,
    refreshAuthSession,
    isGuestProfile,
    isIdentityErrorCode,
    recoverGuestIdentity,
    requireSignInForRecovery
} from './auth.js';
import { showToast } from './ui/toast.js';

/**
 * Generic API caller with auto playerState inclusion, state saving, error handling, and trigger element loading state support.
 */
let _postQueue = Promise.resolve();

const COMMAND_ENDPOINTS = Object.freeze({
    '/api/player/set-cash': { type: 'dev.setCash' },
    '/api/player/add-cash': { type: 'dev.addCash' },
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
    '/api/gambling/slots': { type: 'gambling.slots' }
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

const apiError = (data, fallback = 'API Error') => {
    const error = new Error(errorMessage(data) || fallback);
    error.code = data?.error?.code || data?.result?.code || 'API_ERROR';
    error.details = data?.error?.details;
    error.snapshot = data?.snapshot || null;
    return error;
};

const factionIdentityId = () => String(getAuthProfile()?.id || '');
const requireFactionIdentity = expectedIdentityId => {
    if (expectedIdentityId === factionIdentityId()) return;
    const error = new Error('Your player session changed. Review this faction action again.');
    error.code = 'FACTION_IDENTITY_CHANGED';
    throw error;
};

const requestJsonWithRecovery = async buildRequest => {
    const recoveryState = getAuthRecoveryState();
    if (recoveryState !== 'ready') {
        const error = new Error(recoveryState === 'requires-sign-in'
            ? 'Sign in to your account to continue.'
            : 'Guest progress recovery must finish before commands can continue.');
        error.code = 'SIGN_IN_REQUIRED';
        throw error;
    }

    let refreshAttempts = 0;
    let identityRecoveryAttempts = 0;
    let networkRetries = 0;
    while (true) {
        const request = buildRequest();
        let response;
        try {
            response = await fetch(request.url, request.options);
        } catch (error) {
            if (networkRetries >= 1) throw error;
            networkRetries += 1;
            continue;
        }

        let data = {};
        try { data = await response.json(); } catch { /* The HTTP status will produce the error. */ }
        const responseCode = data?.error?.code;

        if (response.status === 401 && getAccessToken() && refreshAttempts < 1) {
            refreshAttempts += 1;
            if (await refreshAuthSession()) continue;
        }

        const identityFailure = response.status === 401 || isIdentityErrorCode(responseCode);
        if (identityFailure && identityRecoveryAttempts < 1) {
            identityRecoveryAttempts += 1;
            const profile = getAuthProfile();
            if (isGuestProfile(profile)) {
                const replacement = await recoverGuestIdentity(getState());
                setState(replacement.state);
                setRevision(replacement.state_revision);
                saveState();
                continue;
            }
            requireSignInForRecovery(data?.error?.message || 'Your account session expired. Sign in to continue.');
            const error = new Error('Sign in to your account to continue.');
            error.code = 'SIGN_IN_REQUIRED';
            throw error;
        }

        return { response, data };
    }
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
        const stableCommandId = commandId();
        const { response, data } = await requestJsonWithRecovery(() => {
            const signed = !!getAccessToken();
            return {
                url: '/api/game/commands',
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '1', ...getAuthHeaders() },
                    body: JSON.stringify({
                        commandId: stableCommandId,
                        expectedRevision: getRevision(),
                        type,
                        payload,
                        ...(signed ? {} : { guestState: getState() })
                    })
                }
            };
        });
        if (response.status === 409 && data.state) applyGameResponse(data);
        if (!response.ok || data.error) throw apiError(data);
        return applyGameResponse(data);
    } finally {
        if (triggerElement) {
            triggerElement.classList.remove('btn-loading');
            triggerElement.disabled = false;
        }
    }
};

export const gameQuery = async (type, payload = {}) => {
    const { response, data } = await requestJsonWithRecovery(() => {
        const signed = !!getAccessToken();
        return {
            url: '/api/game/queries',
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '1', ...getAuthHeaders() },
                body: JSON.stringify({ type, payload, ...(signed ? {} : { guestState: getState() }) })
            }
        };
    });
    if (!response.ok || data.error) throw apiError(data);
    return applyGameResponse(data);
};

export const factionQuery = async (type, payload = {}) => {
    const identityId = factionIdentityId();
    const { response, data } = await requestJsonWithRecovery(() => {
        requireFactionIdentity(identityId);
        return {
            url: '/api/factions/queries',
            options: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '2', ...getAuthHeaders() },
                body: JSON.stringify({ type, payload, knownRevision: getRevision() })
            }
        };
    });
    requireFactionIdentity(identityId);
    if (!response.ok || data.error) throw apiError(data);
    const observedRevision = Number(data.revision);
    if (Number.isSafeInteger(observedRevision)
        && observedRevision > getRevision()
        && data.state
        && typeof data.state === 'object'
        && !Array.isArray(data.state)) {
        setState(data.state);
        setRevision(observedRevision);
        saveState();
    }
    return data.result;
};

export const factionCommand = async (type, payload = {}, triggerElement = null, expected = { factionId: null }) => {
    if (triggerElement) {
        triggerElement.classList.add('btn-loading');
        triggerElement.disabled = true;
    }
    try {
        const identityId = factionIdentityId();
        const stableCommandId = commandId();
        const { response, data } = await requestJsonWithRecovery(() => {
            requireFactionIdentity(identityId);
            return {
                url: '/api/factions/commands',
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '2', ...getAuthHeaders() },
                    body: JSON.stringify({
                        commandId: stableCommandId,
                        expectedRevision: getRevision(),
                        expected,
                        type,
                        payload
                    })
                }
            };
        });
        requireFactionIdentity(identityId);
        if (response.status === 409 && data.state) applyGameResponse(data);
        if (!response.ok || data.error) {
            if (response.status === 409 && data.snapshot && globalThis.window?.dispatchEvent && typeof CustomEvent === 'function') {
                window.dispatchEvent(new CustomEvent('bconomy-faction-stale', {
                    detail: { snapshot: data.snapshot, error: data.error || null }
                }));
            }
            throw apiError(data);
        }
        if (data.state) applyGameResponse(data);
        return { ...(data.result || {}), snapshot: data.snapshot || null, duplicate: !!data.duplicate };
    } finally {
        if (triggerElement) {
            triggerElement.classList.remove('btn-loading');
            triggerElement.disabled = false;
        }
    }
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

// Multiplayer Faction API Callers
export const doFactionState = () => factionQuery('faction.snapshot');
export const doFactionDirectory = (search = '', limit = 24, offset = 0) => factionQuery('faction.directory', { search, limit, offset });
export const doFactionPlayerSearch = (search, limit = 10) => factionQuery('faction.playerSearch', { search, limit });
export const doFactionJoinMessage = () => factionQuery('faction.joinMessage');
export const doFactionCreate = (name, description, membershipMode, el, expected) => factionCommand('faction.create', { name, description, membershipMode }, el, expected);
export const doFactionDeposit = (amount, el, expected) => factionCommand('faction.deposit', { amount }, el, expected);
export const doFactionActivateBoost = (actionType, level, durationHours, mode, el, expected) => factionCommand('faction.boost.activate', { actionType, level, durationHours, mode }, el, expected);
export const doFactionStopBoost = (actionType, el, expected) => factionCommand('faction.boost.stop', { actionType }, el, expected);
export const doFactionCustomize = (name, description, el, expected) => factionCommand('faction.customize', { name, description }, el, expected);
export const doFactionSetMembershipMode = (membershipMode, el, expected) => factionCommand('faction.membership_mode.set', { membershipMode }, el, expected);
export const doFactionSendInvitation = (playerId, el, expected) => factionCommand('faction.invitation.send', { playerId }, el, expected);
export const doFactionRespondInvitation = (invitationId, decision, el, expected) => factionCommand('faction.invitation.respond', { invitationId, decision }, el, expected);
export const doFactionRevokeInvitation = (invitationId, el, expected) => factionCommand('faction.invitation.revoke', { invitationId }, el, expected);
export const doFactionSendJoinRequest = (factionNumber, message, el, expected) => factionCommand('faction.request.send', { factionNumber, message }, el, expected);
export const doFactionReviewJoinRequest = (requestId, decision, el, expected) => factionCommand('faction.request.review', { requestId, decision }, el, expected);
export const doFactionWithdrawJoinRequest = (requestId, el, expected) => factionCommand('faction.request.withdraw', { requestId }, el, expected);
export const doFactionGenerateCode = (el, expected) => factionCommand('faction.code.generate', {}, el, expected);
export const doFactionRedeemCode = (code, el, expected) => factionCommand('faction.code.redeem', { code }, el, expected);
export const doFactionSetMemberRank = (playerId, factionRank, el, expected) => factionCommand('faction.member.rank', { playerId, factionRank }, el, expected);
export const doFactionRemoveMember = (playerId, el, expected) => factionCommand('faction.member.remove', { playerId }, el, expected);
export const doFactionTransferLeadership = (playerId, el, expected) => factionCommand('faction.leadership.transfer', { playerId }, el, expected);
export const doFactionLeave = (el, expected) => factionCommand('faction.leave', {}, el, expected);
export const doFactionDisband = (confirmationName, el, expected) => factionCommand('faction.disband', { confirmationName }, el, expected);
export const doFactionReadNotification = (notificationId = 'all', el, expected) => factionCommand('faction.notification.read', { notificationId }, el, expected);

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
export const doSetCash = (cash, el) => gameCommand('dev.setCash', { cash }, el);
export const doAddCash = (cash, el) => gameCommand('dev.addCash', { cash }, el);
