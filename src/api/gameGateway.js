'use strict';

const ActionEngine = require('../engine/actionEngine');
const ToolEngine = require('../engine/toolEngine');
const CraftingEngine = require('../engine/craftingEngine');
const RankPrestigeEngine = require('../engine/rankPrestigeEngine');
const { PerkSimulatorEngine } = require('../engine/perkSimulatorEngine');
const InventoryEngine = require('../engine/inventoryEngine');
const { FarmEngine } = require('../engine/farmEngine');
const ShopEngine = require('../engine/shopEngine');
const BoosterEngine = require('../engine/boosterEngine');
const GamblingEngine = require('../engine/gamblingEngine');
const { getAllItems } = require('../data/itemRegistry');
const { normalizePlayerState, cleanupOwnedItemFlags, createDefaultState } = require('../state/playerState');

const requireDevAccess = executionContext => {
    if (executionContext?.allowDevCommands === true) return null;
    return {
        ok: false,
        code: executionContext?.devCommandErrorCode || 'DEV_COMMANDS_DISABLED',
        error: executionContext?.devCommandErrorMessage || 'Developer commands are disabled.'
    };
};

const setCash = (state, payload, now, executionContext) => {
    const denied = requireDevAccess(executionContext);
    if (denied) return denied;
    const val = payload?.cash !== undefined ? payload.cash : payload?.amount;
    state.cash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(val) || 0)));
    return { success: true, cash: state.cash };
};

const addCash = (state, payload, now, executionContext) => {
    const denied = requireDevAccess(executionContext);
    if (denied) return denied;
    const delta = Math.floor(Number(payload?.cash !== undefined ? payload.cash : payload?.amount) || 0);
    state.cash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, (state.cash || 0) + delta));
    return { success: true, cash: state.cash };
};

const DEPRECATED_COMMAND_TYPES = new Set(['player.setCash', 'player.addCash']);

const COMMAND_TYPES = Object.freeze({
    'player.reset': (state) => ({ replaceState: createDefaultState(), result: { success: true } }),
    'dev.setCash': setCash,
    'dev.addCash': addCash,
    'player.setCash': setCash,
    'player.addCash': addCash,
    'inventory.setFlags': (state, payload, now) => InventoryEngine.setFlags(state, payload.itemIds, payload.changes),
    'shop.setWishlist': (state, payload, now) => InventoryEngine.setWishlist(state, payload.itemIds, payload.wished, Number.isSafeInteger(payload.addedAt) ? payload.addedAt : now),
    'action.perform': (state, payload, now) => ActionEngine.performAction(state, payload.actionType, now, Math.random, payload.factionContext),
    'tool.upgrade': (state, payload) => ToolEngine.upgradeTool(state, payload.toolType),
    'tool.upgradeBulk': (state, payload) => ToolEngine.upgradeToolBulk(state, payload.toolType, payload.targetLevelOrCount, !!payload.isCount),
    'tool.socketInstall': (state, payload) => ToolEngine.installModule(state, payload.toolType, payload.socketIndex, payload.moduleId),
    'tool.socketUninstall': (state, payload) => ToolEngine.uninstallModule(state, payload.toolType, payload.socketIndex),
    'tool.moduleCraft': (state, payload) => ToolEngine.craftModule(state, payload.moduleId, payload.quantity),
    'crafting.execute': (state, payload) => CraftingEngine.execute(state, payload.recipeId, payload.craftCount, payload.mode),
    'crafting.craftIntermediate': (state, payload) => {
        const plan = CraftingEngine.previewIntermediate(state, payload.parentRecipeId, payload.parentCraftCount, payload.inputItemId);
        if (!plan.ok) return plan;
        if (!plan.craftRuns) return { error: 'The parent recipe no longer has an intermediate shortage' };
        if (!plan.canCraftImmediately) return { error: 'The intermediate recipe is missing one or more immediate inputs', preview: plan };
        return CraftingEngine.execute(state, plan.intermediateRecipeId, plan.craftRuns, 'direct');
    },
    'rank.up': state => RankPrestigeEngine.rankUp(state),
    'prestige.ascend': state => RankPrestigeEngine.ascend(state),
    'prestige.upgradePerk': (state, payload) => RankPrestigeEngine.upgradePerk(state, payload.perkName, payload.count),
    'prestige.targetedRankUp': (state, payload) => RankPrestigeEngine.targetedRankUp(state, payload.targetTier, payload.targetRankIndex, !!payload.isMaxAffordable),
    'prestige.applyAllocation': (state, payload) => RankPrestigeEngine.applyPerkAllocation(state, payload.targetLevels),
    'prestige.ascendAndApply': (state, payload) => RankPrestigeEngine.ascendAndApplyAllocation(state, payload.targetLevels),
    'farm.refresh': (state, payload, now) => FarmEngine.processFarmState(state, now),
    'farm.plant': (state, payload, now) => FarmEngine.plantCrop(state, payload.plotId, payload.cropName, now),
    'farm.plantAll': (state, payload, now) => FarmEngine.plantAllPlots(state, payload.cropName, now),
    'farm.uproot': (state, payload, now) => FarmEngine.uprootPlot(state, payload.plotId, now),
    'farm.uprootSame': (state, payload, now) => FarmEngine.uprootSameCrop(state, payload.cropName, now),
    'farm.upgrade': (state, payload, now) => FarmEngine.upgradePlot(state, payload.plotId, payload.mode, now),
    'farm.upgradeBulk': (state, payload, now) => FarmEngine.upgradePlotsBulk(state, payload.scope, payload.plotIds, payload.mode, now),
    'farm.waterAll': (state, payload, now) => FarmEngine.waterAllPlots(state, now),
    'farm.addPlot': (state, payload, now) => FarmEngine.addPlot(state, now),
    'farm.claim': (state, payload, now) => FarmEngine.claimCrops(state, payload.cropType, now),
    'farm.useMelon': (state, payload, now) => FarmEngine.useMelon(state, now),
    'shop.refresh': (state, payload, now) => ({ success: true, shop: ShopEngine.ensureShopState(state, now), boosters: state.boosters, sellRolls: ShopEngine.getSellRolls(state) }),
    'shop.restock': (state, payload, now) => ShopEngine.forceRestock(state, now),
    'shop.buy': (state, payload, now) => ShopEngine.buyItem(state, payload.itemName, payload.quantity, now),
    'shop.sell': (state, payload, now) => ShopEngine.sellItem(state, payload.itemName, payload.quantity, now),
    'shop.buyBooster': (state, payload, now) => ShopEngine.buyBooster(state, payload.boosterName, payload.quantity, now),
    'shop.bulkSell': (state, payload, now) => ShopEngine.executeBulkSell(state, payload.options, now),
    'shop.bulkBuy': (state, payload, now) => ShopEngine.executeBulkBuy(state, payload.options, now),
    'booster.bulkActivate': (state, payload, now) => BoosterEngine.activateBoostersBulk(state, payload.options, now),
    'booster.extendActive': (state, payload, now) => BoosterEngine.extendActiveBoosters(state, now),
    'booster.use': (state, payload, now) => BoosterEngine.useBooster(state, payload.itemName, payload.actionType, now),
    'booster.activate': (state, payload, now) => payload.boosterName
        ? BoosterEngine.useBooster(state, payload.boosterName, payload.actionType, now)
        : BoosterEngine.activateBoosterDirect(state, payload.actionType, payload.tier, now),
    'gambling.coinflip': (state, payload) => GamblingEngine.rollCoinflip(state, {
        wagerInput: payload.wagerInput,
        choice: payload.choice,
        mode: payload.mode,
        streakState: payload.streakState,
        isCashOut: payload.isCashOut
    }),
    'gambling.slots': (state, payload) => GamblingEngine.rollSlots(state, { wagerInput: payload.wagerInput, freeSpinState: payload.freeSpinState })
});

const stripStagedState = result => {
    if (!result || typeof result !== 'object') return result;
    const { stagedState, playerState, ...safe } = result;
    return safe;
};

const QUERY_TYPES = Object.freeze({
    'catalog.items': () => ({ items: getAllItems() }),
    'tool.previewUpgrade': (state, payload) => {
        const currentLevel = state.tools?.[payload.toolType] || 1;
        const targetLevel = payload.count ? currentLevel + Number.parseInt(payload.count, 10) : payload.targetLevel;
        return {
            toolType: payload.toolType,
            currentLevel,
            breakdown: ToolEngine.getRecipeBreakdown(payload.toolType, currentLevel, targetLevel, ToolEngine.getUnlockedInventory(state)),
            maxAffordable: ToolEngine.getMaxAffordableLevel(state, payload.toolType),
            socketSummary: ToolEngine.getToolSocketSummary(state, payload.toolType)
        };
    },
    'tool.maxAffordable': (state, payload) => ToolEngine.getMaxAffordableLevel(state, payload.toolType),
    'crafting.preview': (state, payload) => stripStagedState(CraftingEngine.preview(state, payload.recipeId, payload.craftCount, payload.mode)),
    'crafting.maxAffordable': (state, payload) => CraftingEngine.getMaxAffordableSummary(state, payload.recipeId, payload.mode),
    'crafting.whereUsed': (state, payload) => CraftingEngine.getWhereUsed(payload.itemId),
    'crafting.intermediate': (state, payload) => {
        const result = CraftingEngine.previewIntermediate(state, payload.parentRecipeId, payload.parentCraftCount, payload.inputItemId);
        return { ...result, preview: stripStagedState(result.preview) };
    },
    'progression.summary': state => RankPrestigeEngine.getProgressionSummary(state),
    'progression.target': (state, payload) => RankPrestigeEngine.previewTargetedRankUp(state, payload.targetTier, payload.targetRankIndex, !!payload.isMaxAffordable),
    'prestige.simulate': (state, payload) => PerkSimulatorEngine.simulate(state, payload.targetLevels, payload.budget, payload.weights),
    'prestige.optimize': (state, payload) => PerkSimulatorEngine.optimize(state, payload.budget, payload.weights),
    'farm.upgradePreview': (state, payload, now) => FarmEngine.previewPlotUpgrade(state, payload.plotId, payload.mode, now),
    'farm.bulkUpgradePreview': (state, payload) => FarmEngine.previewBulkPlotUpgrade(state, payload.scope, payload.plotIds, payload.mode),
    'shop.sellRolls': state => ShopEngine.getSellRolls(state),
    'shop.bulkSellPreview': (state, payload, now) => ShopEngine.previewBulkSell(state, payload.options, now),
    'shop.bulkBuyPreview': (state, payload, now) => ShopEngine.previewBulkBuy(state, payload.options, now),
    'booster.bulkPreview': (state, payload, now) => BoosterEngine.buildBulkActivationPlan(state, payload.options, now),
    'booster.extendActivePreview': (state, payload, now) => BoosterEngine.buildExtendActivePlan(state, now)
});

function isDomainFailure(result) {
    return !result || result.error || result.success === false || result.ok === false;
}

function executeCommand(playerState, type, payload = {}, now = Date.now(), executionContext = {}) {
    const handler = COMMAND_TYPES[type];
    if (!handler) return { ok: false, code: 'UNKNOWN_COMMAND', error: `Unknown game command '${type}'` };
    if (DEPRECATED_COMMAND_TYPES.has(type) && executionContext.allowDevCommands === true) {
        console.warn(JSON.stringify({
            event: 'deprecated_game_command',
            commandType: type,
            replacement: type.replace(/^player\./, 'dev.'),
            removal: 'next-release',
            actorId: executionContext.devCommandActorId || null,
            source: executionContext.devCommandSource || 'internal'
        }));
    }
    let state = normalizePlayerState(playerState);
    const rawResult = handler(state, payload || {}, now, executionContext);
    if (rawResult?.replaceState) state = normalizePlayerState(rawResult.replaceState);
    if (rawResult?.ok === true && rawResult.playerState) state = normalizePlayerState(rawResult.playerState);
    const result = rawResult?.ok === true && rawResult.result ? rawResult.result : rawResult?.result || rawResult;
    if (isDomainFailure(rawResult)) {
        return { ok: false, code: rawResult?.code || 'DOMAIN_REJECTED', error: rawResult?.error || 'Command rejected', details: stripStagedState(rawResult) };
    }
    cleanupOwnedItemFlags(state);
    return { ok: true, state, result: stripStagedState(result) };
}

function executeQuery(playerState, type, payload = {}, now = Date.now()) {
    const handler = QUERY_TYPES[type];
    if (!handler) return { ok: false, code: 'UNKNOWN_QUERY', error: `Unknown game query '${type}'` };
    const state = normalizePlayerState(playerState);
    const result = handler(state, payload || {}, now);
    if (isDomainFailure(result)) return { ok: false, code: result?.code || 'DOMAIN_REJECTED', error: result?.error || 'Query rejected', details: stripStagedState(result) };
    return { ok: true, result: stripStagedState(result) };
}

module.exports = { COMMAND_TYPES, QUERY_TYPES, executeCommand, executeQuery };
