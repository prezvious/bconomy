/**
 * @module server
 * Main application server.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
    isSupabaseConfigured,
    findEmailByUsername,
    getProfileByUserId,
    signUpUserAdmin,
    signInUserServer,
    syncPlayerState,
    formatPlayerId
} = require('./src/db/supabase');
const ActionEngine = require('./src/engine/actionEngine');
const ToolEngine = require('./src/engine/toolEngine');
const CraftingEngine = require('./src/engine/craftingEngine');
const {
    CATALOG_VERSION,
    DOMAIN_ORDER,
    DOMAIN_NAMES,
    EFFORT_BANDS,
    RARITY_STACKS,
    MATERIALS,
    CRAFTABLES,
    RECIPES,
    recipeForm,
    VALIDATION_SUMMARY
} = require('./src/data/craftingCatalog');
const RankPrestigeEngine = require('./src/engine/rankPrestigeEngine');
const { FarmEngine, CROP_DEFINITIONS } = require('./src/engine/farmEngine');
const { FARM_UPGRADE_MATERIALS } = require('./src/engine/farmPlotUpgrade');
const ShopEngine = require('./src/engine/shopEngine');
const { RANKS, PERK_DEFINITIONS, TOOL_UPGRADE_RECIPES } = require('./src/engine/dropTables');
const GamblingEngine = require('./src/engine/gamblingEngine');
const { FactionEngine, getMultiplierTable } = require('./src/engine/factionEngine');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const DEFAULT_STATE = {
    cash: 0,
    rankIndex: 0,
    prestigeCount: 0,
    prestigePoints: 0,
    inventory: {},
    tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
    perks: { investiture: 0, cronyism: 0, backchannel: 0, partiality: 0, serendipity: 0, numismatist: 0, amnesiac: 0, water_byproducts: 0, jackpot_fever: 0 },
    cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 },
    faction: null,
    farm: {
        waterAvailableAt: 0,
        markedPlotIds: [],
        storage: {
            Blueberry: 0,
            'Golden Wheat': 0,
            Melon: 0,
            Coffee: 0,
            Pumpkin: 0
        },
        plots: [
            { id: 1, level: 0, crop: null, plantedAt: 0, nextHarvestAt: 0 }
        ]
    },
    shop: {
        lastRestockAt: 0,
        nextRestockAt: 0,
        sellPrices: {},
        buyListings: {},
        boosterListings: {}
    },
    boosters: {
        activeUntil: {
            mine: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            explore: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            fish: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
            hunt: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }
        }
    },
    lockedItems: [],
    pinnedItems: [],
    workShift: {
        currentStreak: 0,
        lastWorkAt: 0,
        streakExpireAt: 0,
        streakEligibleAt: 0
    }
};

// State endpoints
app.get('/api/state/default', (req, res) => {
    const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    FarmEngine.ensureFarmState(initialState);
    ShopEngine.ensureShopState(initialState);
    FactionEngine.ensureFactionState(initialState);
    res.json(initialState);
});

const isObjectState = (state) => state && typeof state === 'object' && !Array.isArray(state);

// Inventory Lock & Pin endpoints
app.post('/api/inventory/lock', (req, res) => {
    const { playerState, itemName, locked } = req.body;
    if (!isObjectState(playerState) || !itemName) {
        return res.status(400).json({ error: 'Missing or invalid playerState or itemName' });
    }
    playerState.lockedItems = Array.isArray(playerState.lockedItems) ? playerState.lockedItems : [];
    const index = playerState.lockedItems.indexOf(itemName);
    if (locked && index === -1) {
        playerState.lockedItems.push(itemName);
    } else if (!locked && index !== -1) {
        playerState.lockedItems.splice(index, 1);
    }
    res.json({ state: playerState, itemName, locked: !!locked, lockedItems: playerState.lockedItems });
});

app.post('/api/inventory/pin', (req, res) => {
    const { playerState, itemName, pinned } = req.body;
    if (!isObjectState(playerState) || !itemName) {
        return res.status(400).json({ error: 'Missing or invalid playerState or itemName' });
    }
    playerState.pinnedItems = Array.isArray(playerState.pinnedItems) ? playerState.pinnedItems : [];
    const index = playerState.pinnedItems.indexOf(itemName);
    if (pinned && index === -1) {
        playerState.pinnedItems.push(itemName);
    } else if (!pinned && index !== -1) {
        playerState.pinnedItems.splice(index, 1);
    }
    res.json({ state: playerState, itemName, pinned: !!pinned, pinnedItems: playerState.pinnedItems });
});

// Action endpoints
app.post('/api/action', (req, res) => {
    const { playerState, actionType } = req.body;
    if (!isObjectState(playerState) || !actionType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or actionType' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ActionEngine.performAction(playerState, actionType);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Tool endpoints
app.post('/api/tool/upgrade', (req, res) => {
    const { playerState, toolType } = req.body;
    if (!isObjectState(playerState) || !toolType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or toolType' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ToolEngine.upgradeTool(playerState, toolType);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/tool/upgrade-bulk', (req, res) => {
    const { playerState, toolType, targetLevelOrCount, isCount } = req.body;
    if (!isObjectState(playerState) || !toolType || targetLevelOrCount === undefined) {
        return res.status(400).json({ error: 'Missing or invalid playerState, toolType, or targetLevelOrCount' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ToolEngine.upgradeToolBulk(playerState, toolType, targetLevelOrCount, !!isCount);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/tool/preview-upgrade', (req, res) => {
    const { playerState, toolType, targetLevel, count } = req.body;
    if (!isObjectState(playerState) || !toolType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or toolType' });
    }
    FarmEngine.ensureFarmState(playerState);
    const curLevel = (playerState.tools && playerState.tools[toolType]) || 1;
    let target = targetLevel;
    if (count) {
        target = curLevel + parseInt(count, 10);
    }
    const breakdown = ToolEngine.getRecipeBreakdown(toolType, curLevel, target, playerState.inventory);
    const maxAffordable = ToolEngine.getMaxAffordableLevel(playerState, toolType);
    const socketSummary = ToolEngine.getToolSocketSummary(playerState, toolType);

    res.json({
        state: playerState,
        toolType,
        currentLevel: curLevel,
        breakdown,
        maxAffordable,
        socketSummary
    });
});

app.post('/api/tool/socket/install', (req, res) => {
    const { playerState, toolType, socketIndex, moduleId } = req.body;
    if (!isObjectState(playerState) || !toolType || socketIndex === undefined || !moduleId) {
        return res.status(400).json({ error: 'Missing or invalid parameters for socket installation' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ToolEngine.installModule(playerState, toolType, socketIndex, moduleId);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/tool/socket/uninstall', (req, res) => {
    const { playerState, toolType, socketIndex } = req.body;
    if (!isObjectState(playerState) || !toolType || socketIndex === undefined) {
        return res.status(400).json({ error: 'Missing or invalid parameters for socket uninstallation' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ToolEngine.uninstallModule(playerState, toolType, socketIndex);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/tool/module/craft', (req, res) => {
    const { playerState, moduleId, quantity } = req.body;
    if (!isObjectState(playerState) || !moduleId) {
        return res.status(400).json({ error: 'Missing or invalid playerState or moduleId' });
    }
    const craftQuantity = quantity === undefined ? 1 : quantity;
    const execution = CraftingEngine.execute(playerState, `recipe_${moduleId}`, craftQuantity, 'direct');
    if (!execution.ok) {
        return res.status(execution.code === 'UNKNOWN_RECIPE' ? 404 : 400).json({
            error: execution.error,
            code: execution.code,
            state: playerState,
            result: execution.preview || execution
        });
    }
    const moduleDefinition = CRAFTABLES.find(item => item.id === moduleId);
    const currentModuleCount = execution.playerState.toolModules && execution.playerState.toolModules[moduleId] || 0;
    res.json({
        state: execution.playerState,
        result: {
            success: true,
            moduleId,
            moduleName: moduleDefinition ? moduleDefinition.name : moduleId,
            quantityCrafted: execution.result.output.quantity,
            currentModuleCount,
            crafting: execution.result
        }
    });
});

app.get('/api/crafting/catalog', (req, res) => {
    res.json({
        catalogVersion: CATALOG_VERSION,
        domains: DOMAIN_ORDER.map(id => ({ id, name: DOMAIN_NAMES[id] })),
        materials: MATERIALS,
        craftables: CRAFTABLES,
        recipes: RECIPES.map(recipe => ({ ...recipe, form: recipeForm(recipe) })),
        rarityBands: RARITY_STACKS,
        effortBands: EFFORT_BANDS,
        validation: VALIDATION_SUMMARY
    });
});

app.post('/api/crafting/preview', (req, res) => {
    const { playerState, recipeId, craftCount, mode } = req.body;
    const result = CraftingEngine.preview(playerState, recipeId, craftCount, mode);
    if (!result.ok) {
        return res.status(result.code === 'UNKNOWN_RECIPE' ? 404 : 400).json(result);
    }
    const { stagedState, ...preview } = result;
    res.json(preview);
});

app.post('/api/crafting/execute', (req, res) => {
    const { playerState, recipeId, craftCount, mode } = req.body;
    const execution = CraftingEngine.execute(playerState, recipeId, craftCount, mode);
    if (!execution.ok) {
        return res.status(execution.code === 'UNKNOWN_RECIPE' ? 404 : 400).json(execution);
    }
    res.json(execution);
});

app.get('/api/tool/definitions', (req, res) => {
    const { SOCKET_MODULE_DEFINITIONS } = require('./src/engine/dropTables');
    res.json({
        maxToolLevel: 500,
        socketModules: SOCKET_MODULE_DEFINITIONS
    });
});

// Rank endpoints
app.post('/api/rank/up', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.rankUp(playerState);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Prestige endpoints
app.post('/api/prestige/ascend', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.ascend(playerState);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/prestige/perk', (req, res) => {
    const { playerState, perkName, count } = req.body;
    if (!isObjectState(playerState) || !perkName) {
        return res.status(400).json({ error: 'Missing or invalid playerState or perkName' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.upgradePerk(playerState, perkName, count);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/prestige/targeted-rank-up', (req, res) => {
    const { playerState, targetTier, targetRankIndex, isMaxAffordable } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = RankPrestigeEngine.targetedRankUp(playerState, targetTier, targetRankIndex, isMaxAffordable);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Farm Endpoints
app.post('/api/farm/state', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.processFarmState(playerState);
    res.json({ state: playerState });
});

app.post('/api/farm/plant', (req, res) => {
    const { playerState, plotId, cropName } = req.body;
    if (!isObjectState(playerState) || !plotId || !cropName) {
        return res.status(400).json({ error: 'Missing or invalid playerState, plotId, or cropName' });
    }
    const result = FarmEngine.plantCrop(playerState, parseInt(plotId, 10), cropName);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/plant-all', (req, res) => {
    const { playerState, cropName } = req.body;
    if (!isObjectState(playerState) || !cropName) {
        return res.status(400).json({ error: 'Missing or invalid playerState or cropName' });
    }
    const result = FarmEngine.plantAllPlots(playerState, cropName);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/uproot', (req, res) => {
    const { playerState, plotId } = req.body;
    if (!isObjectState(playerState) || !plotId) {
        return res.status(400).json({ error: 'Missing or invalid playerState or plotId' });
    }
    const result = FarmEngine.uprootPlot(playerState, parseInt(plotId, 10));
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/uproot-same-crop', (req, res) => {
    const { playerState, cropName } = req.body;
    if (!isObjectState(playerState) || !cropName) {
        return res.status(400).json({ error: 'Missing or invalid playerState or cropName' });
    }
    const result = FarmEngine.uprootSameCrop(playerState, cropName);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/upgrade-preview', (req, res) => {
    const { playerState, plotId, mode } = req.body;
    if (!isObjectState(playerState) || !plotId) {
        return res.status(400).json({ error: 'Missing or invalid playerState or plotId' });
    }
    const result = FarmEngine.previewPlotUpgrade(playerState, parseInt(plotId, 10), mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/upgrade', (req, res) => {
    const { playerState, plotId, mode } = req.body;
    if (!isObjectState(playerState) || !plotId) {
        return res.status(400).json({ error: 'Missing or invalid playerState or plotId' });
    }
    const result = FarmEngine.upgradePlot(playerState, parseInt(plotId, 10), mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/upgrade-bulk-preview', (req, res) => {
    const { playerState, scope, plotIds, mode } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.previewBulkPlotUpgrade(playerState, scope, plotIds, mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, result });
    }
    res.json({ result });
});

app.post('/api/farm/upgrade-bulk', (req, res) => {
    const { playerState, scope, plotIds, mode } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.upgradePlotsBulk(playerState, scope, plotIds, mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/water-all', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.waterAllPlots(playerState);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/add-plot', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.addPlot(playerState);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/claim', (req, res) => {
    const { playerState, cropType } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.claimCrops(playerState, cropType || 'all');
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/farm/use-melon', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FarmEngine.useMelon(playerState);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Shop & Booster Endpoints
app.get('/api/shop/state', (req, res) => {
    const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    FarmEngine.ensureFarmState(initialState);
    ShopEngine.ensureShopState(initialState);
    res.json({ state: initialState, shop: initialState.shop, boosters: initialState.boosters });
});

app.post('/api/shop/state', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    ShopEngine.ensureShopState(playerState);
    res.json({ state: playerState, shop: playerState.shop, boosters: playerState.boosters });
});

app.get('/api/shop/restock', (req, res) => {
    const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    FarmEngine.ensureFarmState(initialState);
    const result = ShopEngine.forceRestock(initialState);
    res.json({ state: initialState, result, shop: initialState.shop });
});

app.post('/api/shop/restock', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.forceRestock(playerState);
    res.json({ state: playerState, result, shop: playerState.shop });
});

app.post('/api/shop/force-restock', (req, res) => {
    const { playerState } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.forceRestock(playerState);
    res.json({ state: playerState, result, shop: playerState.shop });
});

app.post('/api/shop/buy', (req, res) => {
    const { playerState, itemName, quantity } = req.body;
    if (!playerState || !itemName) {
        return res.status(400).json({ error: 'Missing playerState or itemName' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.buyItem(playerState, itemName, quantity);
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

app.post('/api/shop/sell', (req, res) => {
    const { playerState, itemName, quantity } = req.body;
    if (!playerState || !itemName) {
        return res.status(400).json({ error: 'Missing playerState or itemName' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.sellItem(playerState, itemName, quantity);
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

app.post('/api/shop/booster/buy', (req, res) => {
    const { playerState, boosterName, quantity } = req.body;
    if (!playerState || !boosterName) {
        return res.status(400).json({ error: 'Missing playerState or boosterName' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.buyBooster(playerState, boosterName, quantity || 1);
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

app.post('/api/shop/bulk-sell/preview', (req, res) => {
    const { playerState, options } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.previewBulkSell(playerState, options || {});
    res.json({ state: playerState, result });
});

app.post('/api/shop/bulk-sell/execute', (req, res) => {
    const { playerState, options } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.executeBulkSell(playerState, options || {});
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

app.post('/api/shop/bulk-buy/preview', (req, res) => {
    const { playerState, options } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.previewBulkBuy(playerState, options || {});
    res.json({ state: playerState, result });
});

app.post('/api/shop/bulk-buy/execute', (req, res) => {
    const { playerState, options } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = ShopEngine.executeBulkBuy(playerState, options || {});
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

const BoosterEngine = require('./src/engine/boosterEngine');

// Booster Endpoints
app.post('/api/booster/bulk/preview', (req, res) => {
    const { playerState, options } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }

    const result = BoosterEngine.buildBulkActivationPlan(playerState, options);
    if (result.error) {
        return res.status(400).json({ error: result.error, result });
    }
    res.json({ result });
});

app.post('/api/booster/bulk/execute', (req, res) => {
    const { playerState, options } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }

    const result = BoosterEngine.activateBoostersBulk(playerState, options);
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/booster/use', (req, res) => {
    const { playerState, itemName, actionType } = req.body;
    if (!playerState || !itemName) {
        return res.status(400).json({ error: 'Missing playerState or itemName' });
    }
    FarmEngine.ensureFarmState(playerState);
    BoosterEngine.ensureBoosterState(playerState);
    const result = BoosterEngine.useBooster(playerState, itemName, actionType);
    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

app.post('/api/booster/activate', (req, res) => {
    const { playerState, boosterName, actionType, tier } = req.body;
    if (!playerState) {
        return res.status(400).json({ error: 'Missing playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    BoosterEngine.ensureBoosterState(playerState);

    let result;
    if (actionType && tier) {
        result = BoosterEngine.activateBoosterDirect(playerState, actionType, tier);
    } else if (boosterName) {
        result = BoosterEngine.useBooster(playerState, boosterName, actionType);
        if (result.error) {
            const shopRes = ShopEngine.activateBooster(playerState, boosterName);
            if (!shopRes.error) result = shopRes;
        }
    } else {
        return res.status(400).json({ error: 'Missing boosterName or (actionType and tier)' });
    }

    if (result.error) {
        return res.status(400).json({ error: result.error, state: playerState });
    }
    res.json({ state: playerState, result });
});

// Data endpoints
app.get('/api/data/ranks', (req, res) => {
    res.json(RANKS);
});

app.get('/api/data/perks', (req, res) => {
    res.json(PERK_DEFINITIONS);
});

app.get('/api/data/boosters', (req, res) => {
    const { BOOSTER_TIERS } = require('./src/utils/formulas');
    const { BOOSTER_REGISTRY } = require('./src/engine/shopTables');
    res.json({ tiers: BOOSTER_TIERS, registry: BOOSTER_REGISTRY });
});

app.get('/api/data/item-descriptions', (req, res) => {
    const { ITEM_DESCRIPTIONS } = require('./src/data/itemDescriptions');
    const craftingDescriptions = Object.fromEntries(
        [...MATERIALS, ...CRAFTABLES].flatMap(item => [[item.id, item.description], [item.name, item.description]])
    );
    res.json({ ...ITEM_DESCRIPTIONS, ...craftingDescriptions });
});

app.get('/api/data/farm/crops', (req, res) => {
    res.json(CROP_DEFINITIONS);
});

app.get('/api/data/farm/materials', (req, res) => {
    res.json(FARM_UPGRADE_MATERIALS);
});

app.get('/api/data/tools/:toolType/recipe/:level', (req, res) => {
    const { toolType, level } = req.params;
    const reqs = ToolEngine.getUpgradeRequirements(toolType, parseInt(level, 10));
    if (!reqs) {
        return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(reqs);
});

// Gambling Endpoints
app.post('/api/gambling/coinflip', (req, res) => {
    const { playerState, wagerInput, choice, mode, streakState, isCashOut } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = GamblingEngine.rollCoinflip(playerState, { wagerInput, choice, mode, streakState, isCashOut });
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.get('/api/gambling/limits/:numismatistLevel?', (req, res) => {
    const level = parseInt(req.params.numismatistLevel || 0, 10);
    const maxBetLimit = GamblingEngine.getMaxBetLimit(level);
    res.json({ numismatistLevel: level, maxBetLimit });
});

app.post('/api/gambling/slots', (req, res) => {
    const { playerState, wagerInput, freeSpinState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = GamblingEngine.rollSlots(playerState, { wagerInput, freeSpinState });
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Faction Endpoints
app.post('/api/faction/create', (req, res) => {
    const { playerState, name, description } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FactionEngine.createFaction(playerState, name, description);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/state', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FactionEngine.ensureFactionState(playerState);
    res.json({ state: playerState });
});

app.post('/api/faction/deposit', (req, res) => {
    const { playerState, amount } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FactionEngine.depositCash(playerState, amount);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/boost/activate', (req, res) => {
    const { playerState, actionType, level, durationHours, mode } = req.body;
    if (!isObjectState(playerState) || !actionType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or actionType' });
    }
    const result = FactionEngine.activateBoost(playerState, actionType, level, durationHours, mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/boost/stop', (req, res) => {
    const { playerState, actionType } = req.body;
    if (!isObjectState(playerState) || !actionType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or actionType' });
    }
    const result = FactionEngine.stopBoost(playerState, actionType);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});


app.get('/api/data/tools/:toolType/recipe/:level', (req, res) => {
    const { toolType, level } = req.params;
    const reqs = ToolEngine.getUpgradeRequirements(toolType, parseInt(level, 10));
    if (!reqs) {
        return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(reqs);
});

// Gambling Endpoints
app.post('/api/gambling/coinflip', (req, res) => {
    const { playerState, wagerInput, choice, mode, streakState, isCashOut } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = GamblingEngine.rollCoinflip(playerState, { wagerInput, choice, mode, streakState, isCashOut });
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.get('/api/gambling/limits/:numismatistLevel?', (req, res) => {
    const level = parseInt(req.params.numismatistLevel || 0, 10);
    const maxBetLimit = GamblingEngine.getMaxBetLimit(level);
    res.json({ numismatistLevel: level, maxBetLimit });
});

app.post('/api/gambling/slots', (req, res) => {
    const { playerState, wagerInput, freeSpinState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FarmEngine.ensureFarmState(playerState);
    const result = GamblingEngine.rollSlots(playerState, { wagerInput, freeSpinState });
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

// Faction Endpoints
app.post('/api/faction/create', (req, res) => {
    const { playerState, name, description } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FactionEngine.createFaction(playerState, name, description);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/state', (req, res) => {
    const { playerState } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    FactionEngine.ensureFactionState(playerState);
    res.json({ state: playerState });
});

app.post('/api/faction/deposit', (req, res) => {
    const { playerState, amount } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FactionEngine.depositCash(playerState, amount);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/boost/activate', (req, res) => {
    const { playerState, actionType, level, durationHours, mode } = req.body;
    if (!isObjectState(playerState) || !actionType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or actionType' });
    }
    const result = FactionEngine.activateBoost(playerState, actionType, level, durationHours, mode);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/boost/stop', (req, res) => {
    const { playerState, actionType } = req.body;
    if (!isObjectState(playerState) || !actionType) {
        return res.status(400).json({ error: 'Missing or invalid playerState or actionType' });
    }
    const result = FactionEngine.stopBoost(playerState, actionType);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.post('/api/faction/customize', (req, res) => {
    const { playerState, name, description } = req.body;
    if (!isObjectState(playerState)) {
        return res.status(400).json({ error: 'Missing or invalid playerState' });
    }
    const result = FactionEngine.updateCustomization(playerState, name, description);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: playerState, result });
    }
    res.json({ state: playerState, result });
});

app.get('/api/data/faction-multipliers', (req, res) => {
    res.json(getMultiplierTable());
});

// Supabase Auth & Profile Endpoints
app.get('/api/config/auth', (req, res) => {
    res.json({
        enabled: isSupabaseConfigured(),
        supabaseUrl: process.env.SUPABASE_URL || 'https://mlaivuzdwevmzuhxjraw.supabase.co',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWl2dXpkd2V2bXp1aHhqcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTQ5NDUsImV4cCI6MjEwMjk5MDk0NX0.2FvGex8DNjpzUY7Yeh4DFd7RCBeV3PFlUQ0I8r71nfc'
    });
});

app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const initialState = JSON.parse(JSON.stringify(DEFAULT_STATE));
        FarmEngine.ensureFarmState(initialState);
        ShopEngine.ensureShopState(initialState);
        FactionEngine.ensureFactionState(initialState);

        const result = await signUpUserAdmin({
            username,
            email,
            password,
            defaultState: initialState
        });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Failed to sign up.' });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required.' });
    }

    try {
        const result = await signInUserServer({ usernameOrEmail, password });
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Invalid username or password.' });
    }
});

app.post('/api/player/find-email', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    const email = await findEmailByUsername(username);
    if (!email) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ email });
});

app.get('/api/player/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    const profile = await getProfileByUserId(userId);
    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
});

app.post('/api/player/sync', async (req, res) => {
    const { userId, playerState } = req.body;
    if (!userId || !playerState) {
        return res.status(400).json({ error: 'Missing userId or playerState' });
    }
    const success = await syncPlayerState(userId, playerState);
    res.json({ success });
});

const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Bconomy server listening on port ${PORT}`);
    });
}

module.exports = app;
