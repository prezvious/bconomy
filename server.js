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
    getProfileByUserId,
    signUpUserAdmin,
    signInUserServer,
    refreshSessionServer,
    verifyAccessToken,
    commitPlayerCommand,
    getPlayerCommandReceipt,
    replacePlayerState,
    getSupabaseConfig
} = require('./src/db/supabase');
const { executeCommand, executeQuery } = require('./src/api/gameGateway');
const { normalizePlayerState, createDefaultState } = require('./src/state/playerState');
const { getAllItems } = require('./src/data/itemRegistry');
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: require('./package.json').version, supabaseConfigured: isSupabaseConfigured() });
});

const DEFAULT_STATE = {
    schemaVersion: 1,
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
    favoriteItems: [],
    shopWishlist: {},
    workShift: {
        currentStreak: 0,
        lastWorkAt: 0,
        streakExpireAt: 0,
        streakEligibleAt: 0
    }
};

// State endpoints
app.get('/api/state/default', (req, res) => {
    const initialState = createDefaultState();
    FarmEngine.ensureFarmState(initialState);
    ShopEngine.ensureShopState(initialState);
    FactionEngine.ensureFactionState(initialState);
    res.json(normalizePlayerState(initialState));
});

const isObjectState = (state) => state && typeof state === 'object' && !Array.isArray(state);

const getBearerToken = req => {
    const header = req.get('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : '';
};

const isUuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

const requireGameApiVersion = (req, res) => {
    const version = req.get('x-bconomy-api-version');
    if (version !== '1') {
        res.status(426).json({ error: { code: 'INCOMPATIBLE_CLIENT', message: 'Reload Bconomy to use the current game API.' } });
        return false;
    }
    return true;
};

const resolveGameContext = async (req, { query = false } = {}) => {
    const token = getBearerToken(req);
    if (token) {
        const user = await verifyAccessToken(token);
        if (!user) return { errorStatus: 401, error: { code: 'INVALID_AUTH', message: 'Your session expired. Sign in again.' } };
        const profile = await getProfileByUserId(user.id);
        if (!profile) return { errorStatus: 404, error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } };
        return {
            mode: 'signed',
            user,
            profile,
            state: normalizePlayerState(profile.state && Object.keys(profile.state).length ? profile.state : createDefaultState()),
            revision: Math.max(0, Math.floor(Number(profile.state_revision) || 0))
        };
    }
    const guestState = req.body?.guestState ?? req.body?.playerState;
    if (!isObjectState(guestState)) {
        return { errorStatus: 400, error: { code: 'GUEST_STATE_REQUIRED', message: 'Guest requests require a valid local state envelope.' } };
    }
    return {
        mode: 'guest',
        state: normalizePlayerState(guestState),
        revision: Math.max(0, Math.floor(Number(req.body?.expectedRevision) || 0))
    };
};

const logGameRequest = ({ kind, type, commandId, revision, status, startedAt }) => {
    console.info(JSON.stringify({
        event: `game_${kind}`,
        type,
        commandId: commandId || null,
        revision,
        status,
        durationMs: Date.now() - startedAt
    }));
};

app.get('/api/catalog/items', (req, res) => {
    res.json({ version: 1, items: getAllItems() });
});

app.post('/api/game/queries', async (req, res) => {
    const startedAt = Date.now();
    if (!requireGameApiVersion(req, res)) return;
    const { type, payload = {} } = req.body || {};
    if (typeof type !== 'string' || !type) {
        return res.status(400).json({ error: { code: 'INVALID_QUERY', message: 'Query type is required.' } });
    }
    try {
        const context = await resolveGameContext(req, { query: true });
        if (context.error) return res.status(context.errorStatus).json({ error: context.error });
        const outcome = executeQuery(context.state, type, payload, Date.now());
        if (!outcome.ok) {
            logGameRequest({ kind: 'query', type, revision: context.revision, status: outcome.code, startedAt });
            return res.status(422).json({ error: { code: outcome.code, message: outcome.error, details: outcome.details } });
        }
        logGameRequest({ kind: 'query', type, revision: context.revision, status: 'ok', startedAt });
        res.json({ revision: context.revision, result: outcome.result });
    } catch (error) {
        console.error('Game query failed:', error);
        logGameRequest({ kind: 'query', type, revision: null, status: 'internal_error', startedAt });
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The game query could not be completed.' } });
    }
});

app.post('/api/game/commands', async (req, res) => {
    const startedAt = Date.now();
    if (!requireGameApiVersion(req, res)) return;
    const { commandId, expectedRevision, type, payload = {} } = req.body || {};
    if (!isUuid(commandId) || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || typeof type !== 'string' || !type) {
        return res.status(400).json({ error: { code: 'INVALID_COMMAND', message: 'Command ID, non-negative revision, and type are required.' } });
    }
    try {
        const context = await resolveGameContext(req);
        if (context.error) return res.status(context.errorStatus).json({ error: context.error });
        if (context.mode === 'signed' && req.body.guestState !== undefined) {
            return res.status(400).json({ error: { code: 'SIGNED_STATE_FORBIDDEN', message: 'Signed commands cannot supply client-owned state.' } });
        }
        if (context.mode === 'signed') {
            const receipt = await getPlayerCommandReceipt({ userId: context.user.id, commandId });
            if (receipt) {
                const revision = context.revision;
                logGameRequest({ kind: 'command', type, commandId, revision, status: 'duplicate', startedAt });
                return res.json({ state: context.state, revision, result: receipt.result || {}, duplicate: true });
            }
        }
        if (expectedRevision !== context.revision) {
            logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: 'conflict', startedAt });
            return res.status(409).json({
                error: { code: 'STATE_CONFLICT', message: 'Progress changed in another session. Review the latest state and try again.' },
                state: context.state,
                revision: context.revision
            });
        }
        const outcome = executeCommand(context.state, type, payload, Date.now());
        if (!outcome.ok) {
            logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: outcome.code, startedAt });
            return res.status(422).json({ error: { code: outcome.code, message: outcome.error, details: outcome.details }, state: context.state, revision: context.revision });
        }

        if (context.mode === 'signed') {
            const commit = await commitPlayerCommand({
                userId: context.user.id,
                expectedRevision,
                commandId,
                state: outcome.state,
                result: outcome.result
            });
            if (commit.status === 'conflict') {
                const latest = await getProfileByUserId(context.user.id);
                return res.status(409).json({
                    error: { code: 'STATE_CONFLICT', message: 'Progress changed in another session. Review the latest state and try again.' },
                    state: normalizePlayerState(latest?.state || context.state),
                    revision: Math.max(0, Math.floor(Number(latest?.state_revision) || 0))
                });
            }
            if (commit.status === 'duplicate') {
                const latest = await getProfileByUserId(context.user.id);
                const revision = Math.max(0, Math.floor(Number(latest?.state_revision ?? commit.revision) || 0));
                logGameRequest({ kind: 'command', type, commandId, revision, status: 'duplicate', startedAt });
                return res.json({ state: normalizePlayerState(latest?.state || outcome.state), revision, result: commit.result || outcome.result, duplicate: true });
            }
            if (commit.status !== 'applied') {
                logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: commit.status, startedAt });
                return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Progress could not be safely saved. Try again.' } });
            }
            const revision = Math.max(0, Math.floor(Number(commit.revision) || expectedRevision + 1));
            logGameRequest({ kind: 'command', type, commandId, revision, status: 'applied', startedAt });
            return res.json({ state: outcome.state, revision, result: outcome.result, duplicate: false });
        }

        const revision = expectedRevision + 1;
        logGameRequest({ kind: 'command', type, commandId, revision, status: 'applied_guest', startedAt });
        res.json({ state: outcome.state, revision, result: outcome.result, duplicate: false });
    } catch (error) {
        console.error('Game command failed:', error);
        logGameRequest({ kind: 'command', type, commandId, revision: null, status: 'internal_error', startedAt });
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The game command could not be completed.' } });
    }
});

app.get('/api/player/profile', async (req, res) => {
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    const profile = await getProfileByUserId(user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.state = normalizePlayerState(profile.state);
    res.json(profile);
});

app.post('/api/player/import', async (req, res) => {
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    const expectedRevision = Number(req.body?.expectedRevision);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || !isObjectState(req.body?.deviceState)) {
        return res.status(400).json({ error: 'A device save and expected revision are required' });
    }
    const state = normalizePlayerState(req.body.deviceState);
    const outcome = await replacePlayerState({ userId: user.id, expectedRevision, state });
    if (outcome.status === 'conflict') {
        const latest = await getProfileByUserId(user.id);
        return res.status(409).json({ error: 'Cloud progress changed before import', profile: latest });
    }
    if (outcome.status !== 'applied') return res.status(503).json({ error: 'Device progress could not be imported safely' });
    outcome.profile.state = normalizePlayerState(outcome.profile.state);
    res.json(outcome.profile);
});

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
    const { url, anonKey } = getSupabaseConfig();
    res.json({
        enabled: isSupabaseConfigured(),
        supabaseUrl: url || null,
        supabaseAnonKey: anonKey || null
    });
});

app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const initialState = createDefaultState();
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

app.post('/api/auth/refresh', async (req, res) => {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') return res.status(400).json({ error: 'Refresh token is required.' });
    try {
        const session = await refreshSessionServer(refreshToken);
        res.json({ session });
    } catch (error) {
        res.status(401).json({ error: 'Session could not be refreshed.' });
    }
});

app.post('/api/player/find-email', async (req, res) => {
    res.status(410).json({ error: 'Email lookup has been removed. Sign in with your username or email.' });
});

app.get('/api/player/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: 'Invalid or expired session' });
    if (!userId || user.id !== userId) return res.status(403).json({ error: 'Profile ownership mismatch' });
    const profile = await getProfileByUserId(userId);
    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    profile.state = normalizePlayerState(profile.state);
    res.json(profile);
});

app.post('/api/player/sync', async (req, res) => {
    res.status(410).json({ success: false, error: 'Full-state sync was removed. Progress is saved per command.' });
});

const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Bconomy server listening on port ${PORT}`);
    });
}

module.exports = app;
