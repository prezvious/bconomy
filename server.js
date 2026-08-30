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
    lookupProfileByUserId,
    touchPlayerActivity,
    signUpUserAdmin,
    signInUserServer,
    refreshSessionServer,
    verifyAccessToken,
    commitPlayerCommand,
    getPlayerCommandReceipt,
    replacePlayerState,
    getSupabaseConfig,
    createGuestSessionServer,
    upgradeGuestUserAdmin
} = require('./src/db/supabase');
const {
    getFactionSnapshot,
    listPublicFactions,
    searchFactionPlayers,
    getNextJoinMessage,
    executeFactionCommand,
    getFactionEffect,
    migrateLegacyFaction,
    cleanupInactiveGuest,
    cleanupInactiveGuests
} = require('./src/db/factions');
const { executeCommand, executeQuery } = require('./src/api/gameGateway');
const {
    DEV_COMMAND_TYPES,
    isExplicitlyEnabled: areDevCommandsEnabled,
    isLocalDevelopmentRequest,
    authorizeDevCommand,
    warnDeprecatedDevToggle
} = require('./src/api/devCommandAccess');
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
warnDeprecatedDevToggle();
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
    schemaVersion: 2,
    cash: 0,
    rankIndex: 0,
    prestigeCount: 0,
    prestigePoints: 0,
    inventory: {},
    tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
    perks: { investiture: 0, cronyism: 0, backchannel: 0, partiality: 0, serendipity: 0, numismatist: 0, amnesiac: 0, water_byproducts: 0, jackpot_fever: 0 },
    cooldowns: { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 },
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
let lastGuestCleanupAt = 0;
const GUEST_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

const isExpiredGuestProfile = (profile, now = Date.now()) => {
    if (profile?.account_kind !== 'guest') return false;
    const lastActiveAt = new Date(profile.last_active_at || 0).getTime();
    return Number.isFinite(lastActiveAt) && lastActiveAt <= now - GUEST_RETENTION_MS;
};

const maybeCleanupInactiveGuests = async () => {
    const now = Date.now();
    if (now - lastGuestCleanupAt < 24 * 60 * 60 * 1000) return;
    lastGuestCleanupAt = now;
    const result = await cleanupInactiveGuests(new Date(now));
    if (!['ok', 'unavailable'].includes(result?.status)) {
        console.error('Inactive guest cleanup failed:', result);
    }
};

const factionStatusCode = result => {
    if (result?.status === 'conflict') return 409;
    if (result?.status === 'unavailable' || result?.code === 'PERSISTENCE_ERROR') return 503;
    if (result?.code === 'INVALID_AUTH' || result?.code === 'GUEST_EXPIRED') return 401;
    if (result?.status === 'error' || result?.status === 'missing_player') return 422;
    return 200;
};

const resolveFactionActor = async req => {
    const token = getBearerToken(req);
    if (!token) return { error: { code: 'FACTION_IDENTITY_REQUIRED', message: 'A registered or guest player identity is required for multiplayer factions.' }, status: 401 };
    const user = await verifyAccessToken(token);
    if (!user) return { error: { code: 'INVALID_AUTH', message: 'Your player session expired. Reload Bconomy to continue as a guest or sign in again.' }, status: 401 };
    await maybeCleanupInactiveGuests();
    const initialLookup = await lookupProfileByUserId(user.id);
    if (initialLookup.status === 'unavailable') return { error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' }, status: 503 };
    if (initialLookup.status === 'missing') return { error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' }, status: 404 };
    let profile = initialLookup.profile;

    if (profile.account_kind === 'guest') {
        if (isExpiredGuestProfile(profile)) {
            await cleanupInactiveGuest(user.id);
            return { error: { code: 'GUEST_EXPIRED', message: 'This guest identity was deleted after 365 days without activity.' }, status: 401 };
        }
        if (!profile.guest_migrated_at) {
            return { error: { code: 'GUEST_MIGRATION_REQUIRED', message: 'Finish the one-time guest migration before using multiplayer factions.' }, status: 409, user, profile };
        }
    } else {
        const migration = await migrateLegacyFaction({
            userId: user.id,
            state: profile.state,
            expectedRevision: profile.state_revision,
            guestImport: false
        });
        if (migration.status === 'applied') {
            const migratedLookup = await lookupProfileByUserId(user.id);
            if (migratedLookup.status === 'unavailable') return { error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' }, status: 503 };
            if (migratedLookup.status === 'missing') return { error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' }, status: 404 };
            profile = migratedLookup.profile;
        }
        if (!['applied', 'duplicate'].includes(migration.status)) {
            return { error: { code: migration.code || 'MIGRATION_FAILED', message: migration.message || 'Existing faction data could not be migrated safely.' }, status: factionStatusCode(migration) };
        }
    }
    await touchPlayerActivity(user.id);
    return { user, profile };
};

const requireGameApiVersion = (req, res) => {
    const version = req.get('x-bconomy-api-version');
    if (version !== '1') {
        res.status(426).json({ error: { code: 'INCOMPATIBLE_CLIENT', message: 'Reload Bconomy to use the current game API.' } });
        return false;
    }
    return true;
};

const resolveGameContext = async req => {
    const token = getBearerToken(req);
    if (token) {
        const user = await verifyAccessToken(token);
        if (!user) return { errorStatus: 401, error: { code: 'INVALID_AUTH', message: 'Your session expired. Sign in again.' } };
        const lookup = await lookupProfileByUserId(user.id);
        if (lookup.status === 'unavailable') return { errorStatus: 503, error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable. Try again.' } };
        if (lookup.status === 'missing') return { errorStatus: 404, error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } };
        const profile = lookup.profile;
        if (isExpiredGuestProfile(profile)) {
            await cleanupInactiveGuest(user.id);
            return { errorStatus: 401, error: { code: 'GUEST_EXPIRED', message: 'This guest identity was deleted after 365 days without activity.' } };
        }
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

const phaseDurationMs = startedAt => Number((Number(process.hrtime.bigint() - startedAt) / 1e6).toFixed(2));

const measureAsyncPhase = async (timings, phase, operation) => {
    const startedAt = process.hrtime.bigint();
    try {
        return await operation();
    } finally {
        timings[phase] = phaseDurationMs(startedAt);
    }
};

const measureSyncPhase = (timings, phase, operation) => {
    const startedAt = process.hrtime.bigint();
    try {
        return operation();
    } finally {
        timings[phase] = phaseDurationMs(startedAt);
    }
};

const attachServerTiming = (res, timings, startedAt) => {
    const sendJson = res.json.bind(res);
    res.json = body => {
        if (!res.headersSent) {
            const metrics = { ...timings, totalMs: Date.now() - startedAt };
            const header = Object.entries(metrics)
                .filter(([name, duration]) => name.endsWith('Ms') && Number.isFinite(duration) && duration >= 0)
                .map(([name, duration]) => `${name.slice(0, -2)};dur=${Number(duration).toFixed(2)}`)
                .join(', ');
            if (header) res.set('Server-Timing', header);
        }
        return sendJson(body);
    };
};

const logGameRequest = ({ kind, type, commandId, revision, status, startedAt, timings = {} }) => {
    console.info(JSON.stringify({
        event: `game_${kind}`,
        type,
        commandId: commandId || null,
        revision,
        status,
        durationMs: Date.now() - startedAt,
        ...timings
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
        const context = await resolveGameContext(req);
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
    const timings = {};
    attachServerTiming(res, timings, startedAt);
    if (!requireGameApiVersion(req, res)) return;
    const { commandId, expectedRevision, type, payload = {} } = req.body || {};
    if (!isUuid(commandId) || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || typeof type !== 'string' || !type) {
        return res.status(400).json({ error: { code: 'INVALID_COMMAND', message: 'Command ID, non-negative revision, and type are required.' } });
    }
    const isDevCommand = DEV_COMMAND_TYPES.has(type);
    if (isDevCommand && !areDevCommandsEnabled()) {
        return res.status(403).json({ error: { code: 'DEV_COMMANDS_DISABLED', message: 'Developer commands are disabled.' } });
    }
    try {
        const context = await measureAsyncPhase(timings, 'contextMs', () => resolveGameContext(req));
        if (context.error) return res.status(context.errorStatus).json({ error: context.error });
        if (context.mode === 'signed' && req.body.guestState !== undefined) {
            return res.status(400).json({ error: { code: 'SIGNED_STATE_FORBIDDEN', message: 'Signed commands cannot supply client-owned state.' } });
        }
        let executionContext = {};
        if (isDevCommand) {
            const access = authorizeDevCommand({ req, userId: context.user?.id });
            if (!access.allowed) {
                logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: access.code, startedAt, timings });
                return res.status(403).json({ error: { code: access.code, message: access.message } });
            }
            executionContext = {
                allowDevCommands: true,
                devCommandSource: access.source,
                devCommandActorId: context.user?.id || null
            };
        }
        if (context.mode === 'signed' && expectedRevision !== context.revision) {
            const receipt = await measureAsyncPhase(timings, 'replayMs', () => getPlayerCommandReceipt({
                userId: context.user.id,
                commandId
            }));
            if (receipt) {
                logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: 'duplicate', startedAt, timings });
                return res.json({ state: context.state, revision: context.revision, result: receipt.result || {}, duplicate: true });
            }
            logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: 'conflict', startedAt, timings });
            return res.status(409).json({
                error: { code: 'STATE_CONFLICT', message: 'Progress changed in another session. Review the latest state and try again.' },
                state: context.state,
                revision: context.revision
            });
        }
        let authoritativePayload = payload;
        if (type === 'action.perform' && context.mode === 'signed') {
            const factionEffect = await measureAsyncPhase(timings, 'factionMs', () => getFactionEffect(context.user.id, payload.actionType, new Date()));
            if (factionEffect.status !== 'ok') {
                return res.status(factionStatusCode(factionEffect)).json({
                    error: {
                        code: factionEffect.code || 'FACTION_EFFECT_UNAVAILABLE',
                        message: factionEffect.message || 'The shared faction boost could not be verified safely.'
                    },
                    state: context.state,
                    revision: context.revision
                });
            }
            authoritativePayload = { ...payload, factionContext: factionEffect };
        } else if (type === 'action.perform') {
            authoritativePayload = { ...payload, factionContext: null };
        }
        const outcome = measureSyncPhase(timings, 'engineMs', () => executeCommand(context.state, type, authoritativePayload, Date.now(), executionContext));
        if (!outcome.ok) {
            logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: outcome.code, startedAt, timings });
            return res.status(422).json({ error: { code: outcome.code, message: outcome.error, details: outcome.details }, state: context.state, revision: context.revision });
        }

        if (context.mode === 'signed') {
            const commit = await measureAsyncPhase(timings, 'commitMs', () => commitPlayerCommand({
                userId: context.user.id,
                expectedRevision,
                commandId,
                state: outcome.state,
                result: outcome.result
            }));
            if (commit.status === 'conflict') {
                const latestLookup = await lookupProfileByUserId(context.user.id);
                if (latestLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Latest progress could not be loaded safely. Try again.' } });
                if (latestLookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } });
                const latest = latestLookup.profile;
                return res.status(409).json({
                    error: { code: 'STATE_CONFLICT', message: 'Progress changed in another session. Review the latest state and try again.' },
                    state: normalizePlayerState(latest?.state || context.state),
                    revision: Math.max(0, Math.floor(Number(latest?.state_revision) || 0))
                });
            }
            if (commit.status === 'duplicate') {
                const latestLookup = await lookupProfileByUserId(context.user.id);
                if (latestLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Committed progress could not be loaded safely. Try again.' } });
                if (latestLookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } });
                const latest = latestLookup.profile;
                const revision = Math.max(0, Math.floor(Number(latest?.state_revision ?? commit.revision) || 0));
                logGameRequest({ kind: 'command', type, commandId, revision, status: 'duplicate', startedAt, timings });
                return res.json({ state: normalizePlayerState(latest?.state || outcome.state), revision, result: commit.result || outcome.result, duplicate: true });
            }
            if (commit.status !== 'applied') {
                logGameRequest({ kind: 'command', type, commandId, revision: context.revision, status: commit.status, startedAt, timings });
                return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Progress could not be safely saved. Try again.' } });
            }
            const revision = Math.max(0, Math.floor(Number(commit.revision) || expectedRevision + 1));
            logGameRequest({ kind: 'command', type, commandId, revision, status: 'applied', startedAt, timings });
            return res.json({ state: outcome.state, revision, result: outcome.result, duplicate: false });
        }

        const revision = expectedRevision + 1;
        logGameRequest({ kind: 'command', type, commandId, revision, status: 'applied_guest', startedAt, timings });
        res.json({ state: outcome.state, revision, result: outcome.result, duplicate: false });
    } catch (error) {
        console.error('Game command failed:', error);
        logGameRequest({ kind: 'command', type, commandId, revision: null, status: 'internal_error', startedAt, timings });
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The game command could not be completed.' } });
    }
});

app.post('/api/factions/queries', async (req, res) => {
    if (!requireGameApiVersion(req, res)) return;
    const { type, payload = {} } = req.body || {};
    if (typeof type !== 'string' || !type) {
        return res.status(400).json({ error: { code: 'INVALID_FACTION_QUERY', message: 'Faction query type is required.' } });
    }
    try {
        const actor = await resolveFactionActor(req);
        if (actor.error) return res.status(actor.status).json({ error: actor.error });
        let result;
        if (type === 'faction.snapshot') result = await getFactionSnapshot(actor.user.id);
        else if (type === 'faction.directory') result = await listPublicFactions(actor.user.id, payload);
        else if (type === 'faction.playerSearch') result = await searchFactionPlayers(actor.user.id, payload);
        else if (type === 'faction.joinMessage') result = await getNextJoinMessage(actor.user.id);
        else return res.status(404).json({ error: { code: 'UNKNOWN_FACTION_QUERY', message: `Unknown faction query '${type}'.` } });

        const status = factionStatusCode(result);
        if (status !== 200) return res.status(status).json({ error: { code: result.code || 'FACTION_QUERY_FAILED', message: result.message || 'Faction data could not be loaded.' } });
        return res.json({ result });
    } catch (error) {
        console.error('Faction query failed:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The faction query could not be completed.' } });
    }
});

app.post('/api/factions/commands', async (req, res) => {
    if (!requireGameApiVersion(req, res)) return;
    const { commandId, expectedRevision, expectedFactionRevision = null, type, payload = {} } = req.body || {};
    if (!isUuid(commandId) || !Number.isSafeInteger(expectedRevision) || expectedRevision < 0
        || (expectedFactionRevision !== null && (!Number.isSafeInteger(expectedFactionRevision) || expectedFactionRevision < 0))
        || typeof type !== 'string' || !type) {
        return res.status(400).json({ error: { code: 'INVALID_FACTION_COMMAND', message: 'Command ID, non-negative player revision, and faction command type are required.' } });
    }
    try {
        const actor = await resolveFactionActor(req);
        if (actor.error) return res.status(actor.status).json({ error: actor.error });
        const outcome = await executeFactionCommand({
            userId: actor.user.id,
            commandId,
            expectedPlayerRevision: expectedRevision,
            expectedFactionRevision,
            type,
            payload
        });
        const status = factionStatusCode(outcome);
        if (status !== 200) {
            const latestSnapshot = outcome.code === 'FACTION_CONFLICT'
                ? await getFactionSnapshot(actor.user.id)
                : undefined;
            return res.status(status).json({
                error: { code: outcome.code || 'FACTION_COMMAND_REJECTED', message: outcome.message || 'The faction command was rejected.' },
                state: outcome.playerState ? normalizePlayerState(outcome.playerState) : undefined,
                revision: outcome.playerRevision,
                snapshot: latestSnapshot?.status === 'ok' ? latestSnapshot : undefined
            });
        }
        return res.json({
            result: outcome.result || {},
            snapshot: outcome.snapshot || null,
            state: outcome.playerState ? normalizePlayerState(outcome.playerState) : undefined,
            revision: Number.isSafeInteger(Number(outcome.playerRevision)) ? Number(outcome.playerRevision) : expectedRevision,
            duplicate: outcome.status === 'duplicate'
        });
    } catch (error) {
        console.error('Faction command failed:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The faction command could not be completed.' } });
    }
});

app.get('/api/player/profile', async (req, res) => {
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: { code: 'INVALID_AUTH', message: 'Invalid or expired session.' } });
    await maybeCleanupInactiveGuests();
    const lookup = await lookupProfileByUserId(user.id);
    if (lookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' } });
    if (lookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found.' } });
    let profile = lookup.profile;
    if (isExpiredGuestProfile(profile)) {
        await cleanupInactiveGuest(user.id);
        return res.status(401).json({ error: 'This guest identity was deleted after 365 days without activity.' });
    }
    await touchPlayerActivity(user.id);
    profile.last_active_at = new Date().toISOString();
    if (profile.account_kind !== 'guest') {
        const migration = await migrateLegacyFaction({
            userId: user.id,
            state: profile.state,
            expectedRevision: profile.state_revision,
            guestImport: false
        });
        if (!['applied', 'duplicate'].includes(migration.status)) {
            return res.status(factionStatusCode(migration)).json({ error: migration.message || 'Existing faction data could not be migrated safely.' });
        }
        const migratedLookup = await lookupProfileByUserId(user.id);
        if (migratedLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Migrated progress could not be loaded safely.' } });
        if (migratedLookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } });
        profile = migratedLookup.profile;
    }
    profile.state = normalizePlayerState(profile.state);
    res.json(profile);
});

app.post('/api/player/guest-migrate', async (req, res) => {
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: { code: 'INVALID_AUTH', message: 'The guest session is invalid or expired.' } });
    const lookup = await lookupProfileByUserId(user.id);
    if (lookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' } });
    if (lookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } });
    const profile = lookup.profile;
    if (profile.account_kind !== 'guest') {
        return res.status(422).json({ error: { code: 'GUEST_REQUIRED', message: 'Only an anonymous guest identity can use guest migration.' } });
    }
    if (isExpiredGuestProfile(profile)) {
        await cleanupInactiveGuest(user.id);
        return res.status(401).json({ error: { code: 'GUEST_EXPIRED', message: 'This guest identity was deleted after 365 days without activity.' } });
    }
    const expectedRevision = Number(req.body?.expectedRevision);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || !isObjectState(req.body?.deviceState)) {
        return res.status(400).json({ error: { code: 'INVALID_MIGRATION', message: 'A device save and non-negative revision are required.' } });
    }
    const importedState = normalizePlayerState(req.body.deviceState);
    if (req.body.deviceState.faction && typeof req.body.deviceState.faction === 'object') {
        const legacyHolder = { faction: JSON.parse(JSON.stringify(req.body.deviceState.faction)) };
        FactionEngine.ensureFactionState(legacyHolder);
        if (legacyHolder.faction) importedState.faction = legacyHolder.faction;
    }
    const outcome = await migrateLegacyFaction({
        userId: user.id,
        state: importedState,
        expectedRevision,
        guestImport: true
    });
    const status = factionStatusCode(outcome);
    if (status !== 200) return res.status(status).json({ error: { code: outcome.code || 'GUEST_MIGRATION_FAILED', message: outcome.message || 'Guest progress could not be migrated safely.' } });
    const updatedLookup = await lookupProfileByUserId(user.id);
    if (updatedLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'The migrated guest profile could not be loaded safely.' } });
    if (updatedLookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'The migrated guest profile could not be loaded.' } });
    const updatedProfile = updatedLookup.profile;
    updatedProfile.state = normalizePlayerState(updatedProfile.state);
    res.json({ profile: updatedProfile, snapshot: outcome.snapshot, duplicate: outcome.status === 'duplicate' });
});

app.post('/api/player/import', async (req, res) => {
    const user = await verifyAccessToken(getBearerToken(req));
    if (!user) return res.status(401).json({ error: { code: 'INVALID_AUTH', message: 'Invalid or expired session.' } });
    const importingLookup = await lookupProfileByUserId(user.id);
    if (importingLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' } });
    if (importingLookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found.' } });
    const importingProfile = importingLookup.profile;
    if (isExpiredGuestProfile(importingProfile)) {
        await cleanupInactiveGuest(user.id);
        return res.status(401).json({ error: 'This guest identity was deleted after 365 days without activity.' });
    }
    if (importingProfile.account_kind === 'guest') {
        return res.status(422).json({ error: 'Guest device progress can be imported only through the one-time guest migration.' });
    }
    const expectedRevision = Number(req.body?.expectedRevision);
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || !isObjectState(req.body?.deviceState)) {
        return res.status(400).json({ error: 'A device save and expected revision are required' });
    }
    const state = normalizePlayerState(req.body.deviceState);
    const outcome = await replacePlayerState({ userId: user.id, expectedRevision, state });
    if (outcome.status === 'conflict') {
        const latestLookup = await lookupProfileByUserId(user.id);
        if (latestLookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Latest cloud progress could not be loaded.' } });
        return res.status(409).json({ error: 'Cloud progress changed before import', profile: latestLookup.profile || null });
    }
    if (outcome.status !== 'applied') return res.status(503).json({ error: 'Device progress could not be imported safely' });
    await touchPlayerActivity(user.id);
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
    const normalizedState = normalizePlayerState(playerState);
    FarmEngine.ensureFarmState(normalizedState);
    const result = ActionEngine.performAction(normalizedState, actionType, Date.now(), Math.random, null);
    if (result && result.error) {
        return res.status(400).json({ error: result.error, state: normalizedState, result });
    }
    res.json({ state: normalizedState, result });
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
        return res.status(400).json({
            error: { code: result.code || 'DOMAIN_REJECTED', message: result.error, details: result },
            state: playerState,
            result
        });
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

app.get('/api/data/progression-rules', (req, res) => {
    const { MAX_TARGETED_TIER_ADVANCE } = require('./src/utils/formulas');
    res.json({ maxTargetedTierAdvance: MAX_TARGETED_TIER_ADVANCE });
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

app.all('/api/faction/*', (req, res) => {
    res.status(410).json({ error: 'Local faction endpoints were removed. Reload Bconomy to use multiplayer factions.' });
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
        supabaseAnonKey: anonKey || null,
        devMode: areDevCommandsEnabled() && isLocalDevelopmentRequest(req)
    });
});

app.post('/api/auth/guest', async (req, res) => {
    if (!isSupabaseConfigured()) {
        return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Guest multiplayer identity is unavailable until Supabase is configured.' } });
    }
    try {
        const initialState = createDefaultState();
        FarmEngine.ensureFarmState(initialState);
        ShopEngine.ensureShopState(initialState);
        const result = await createGuestSessionServer(initialState);
        result.profile.state = normalizePlayerState(result.profile.state);
        res.json(result);
    } catch (error) {
        console.error('Guest identity creation failed:', error);
        res.status(503).json({ error: { code: 'GUEST_CREATION_FAILED', message: error.message || 'Guest identity could not be created.' } });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const accessToken = getBearerToken(req);
        const currentUser = accessToken ? await verifyAccessToken(accessToken) : null;
        if (accessToken && !currentUser) {
            return res.status(401).json({ error: 'The guest session expired. Refresh it before creating an account.' });
        }
        const currentLookup = currentUser ? await lookupProfileByUserId(currentUser.id) : null;
        if (currentLookup?.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' } });
        if (currentLookup?.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' } });
        const currentProfile = currentLookup?.profile || null;
        let result;
        if (currentUser && currentProfile?.account_kind === 'guest') {
            if (isExpiredGuestProfile(currentProfile)) {
                await cleanupInactiveGuest(currentUser.id);
                return res.status(401).json({ error: 'This guest identity was deleted after 365 days without activity.' });
            }
            result = await upgradeGuestUserAdmin({ userId: currentUser.id, username, email, password });
        } else if (!currentUser) {
            const initialState = createDefaultState();
            FarmEngine.ensureFarmState(initialState);
            ShopEngine.ensureShopState(initialState);
            result = await signUpUserAdmin({
                username,
                email,
                password,
                defaultState: initialState
            });
        } else {
            return res.status(409).json({ error: 'This player identity is already registered.' });
        }
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
    if (!user) return res.status(401).json({ error: { code: 'INVALID_AUTH', message: 'Invalid or expired session.' } });
    if (!userId || user.id !== userId) return res.status(403).json({ error: 'Profile ownership mismatch' });
    const lookup = await lookupProfileByUserId(userId);
    if (lookup.status === 'unavailable') return res.status(503).json({ error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Player persistence is temporarily unavailable.' } });
    if (lookup.status === 'missing') return res.status(404).json({ error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found.' } });
    const profile = lookup.profile;
    if (isExpiredGuestProfile(profile)) {
        await cleanupInactiveGuest(user.id);
        return res.status(401).json({ error: 'This guest identity was deleted after 365 days without activity.' });
    }
    await touchPlayerActivity(user.id);
    profile.last_active_at = new Date().toISOString();
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
