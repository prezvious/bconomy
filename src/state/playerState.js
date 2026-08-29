'use strict';

const { RANKS, PERK_DEFINITIONS } = require('../engine/dropTables');
const { normalizeItemId, getItem } = require('../data/itemRegistry');

const PLAYER_STATE_SCHEMA_VERSION = 2;
const MAX_SAFE_QUANTITY = Number.MAX_SAFE_INTEGER;

const DEFAULT_STATE = Object.freeze({
    schemaVersion: PLAYER_STATE_SCHEMA_VERSION,
    cash: 0,
    rankIndex: 0,
    prestigeCount: 0,
    prestigePoints: 0,
    inventory: Object.freeze({}),
    tools: Object.freeze({ mine: 1, explore: 1, hunt: 1, fish: 1 }),
    perks: Object.freeze({
        investiture: 0,
        cronyism: 0,
        backchannel: 0,
        partiality: 0,
        serendipity: 0,
        numismatist: 0,
        amnesiac: 0,
        water_byproducts: 0,
        jackpot_fever: 0
    }),
    cooldowns: Object.freeze({ mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 }),
    farm: Object.freeze({
        waterAvailableAt: 0,
        markedPlotIds: Object.freeze([]),
        storage: Object.freeze({ Blueberry: 0, 'Golden Wheat': 0, Melon: 0, Coffee: 0, Pumpkin: 0 }),
        plots: Object.freeze([{ id: 1, level: 0, crop: null, plantedAt: 0, nextHarvestAt: 0 }])
    }),
    shop: Object.freeze({
        lastRestockAt: 0,
        nextRestockAt: 0,
        sellPrices: Object.freeze({}),
        buyListings: Object.freeze({}),
        boosterListings: Object.freeze({})
    }),
    boosters: Object.freeze({
        activeUntil: Object.freeze({
            mine: Object.freeze({ T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }),
            explore: Object.freeze({ T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }),
            fish: Object.freeze({ T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }),
            hunt: Object.freeze({ T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 })
        })
    }),
    lockedItems: Object.freeze([]),
    favoriteItems: Object.freeze([]),
    shopWishlist: Object.freeze({}),
    workShift: Object.freeze({
        currentStreak: 0,
        lastWorkAt: 0,
        streakExpireAt: 0,
        streakEligibleAt: 0
    })
});

const clone = value => JSON.parse(JSON.stringify(value));
const safeInteger = (value, fallback = 0, min = 0, max = MAX_SAFE_QUANTITY) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(numeric)));
};

function createDefaultState() {
    return clone(DEFAULT_STATE);
}

function normalizeInventory(candidate) {
    const inventory = {};
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return inventory;
    for (const [rawId, rawQuantity] of Object.entries(candidate)) {
        const id = normalizeItemId(rawId);
        const quantity = safeInteger(rawQuantity);
        if (!id || quantity <= 0) continue;
        inventory[id] = Math.min(MAX_SAFE_QUANTITY, (inventory[id] || 0) + quantity);
    }
    return inventory;
}

function normalizeOwnedFlagList(candidate, inventory) {
    const result = [];
    const seen = new Set();
    for (const rawId of Array.isArray(candidate) ? candidate : []) {
        const id = normalizeItemId(rawId);
        const definition = id ? getItem(id) : null;
        if (!id || seen.has(id) || !inventory[id] || definition?.storageScope !== 'inventory') continue;
        seen.add(id);
        result.push(id);
    }
    return result;
}

function normalizeWishlist(candidate) {
    const result = {};
    if (Array.isArray(candidate)) {
        for (const rawId of candidate) {
            const id = normalizeItemId(rawId);
            if (id) result[id] = { addedAt: 0 };
        }
        return result;
    }
    if (!candidate || typeof candidate !== 'object') return result;
    for (const [rawId, metadata] of Object.entries(candidate)) {
        const id = normalizeItemId(rawId);
        if (!id) continue;
        result[id] = { addedAt: safeInteger(metadata?.addedAt, 0) };
    }
    return result;
}

function normalizePlayerState(candidate = {}) {
    const input = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? clone(candidate) : {};
    const state = { ...createDefaultState(), ...input };
    state.schemaVersion = PLAYER_STATE_SCHEMA_VERSION;
    state.cash = safeInteger(input.cash);
    state.rankIndex = safeInteger(input.rankIndex, 0, 0, Math.max(0, RANKS.length - 1));
    state.prestigeCount = safeInteger(input.prestigeCount);
    state.prestigePoints = safeInteger(input.prestigePoints);
    state.inventory = normalizeInventory(input.inventory);

    state.tools = { ...createDefaultState().tools };
    for (const toolType of Object.keys(state.tools)) state.tools[toolType] = safeInteger(input.tools?.[toolType], 1, 1, 500);

    state.perks = { ...createDefaultState().perks };
    for (const [perkId, definition] of Object.entries(PERK_DEFINITIONS)) {
        state.perks[perkId] = safeInteger(input.perks?.[perkId], 0, 0, definition.maxLevel || 0);
    }

    state.cooldowns = { ...createDefaultState().cooldowns };
    for (const action of Object.keys(state.cooldowns)) state.cooldowns[action] = safeInteger(input.cooldowns?.[action]);

    const legacyFavorites = [
        ...(Array.isArray(input.favoriteItems) ? input.favoriteItems : []),
        ...(Array.isArray(input.pinnedItems) ? input.pinnedItems : [])
    ];
    state.lockedItems = normalizeOwnedFlagList(input.lockedItems, state.inventory);
    state.favoriteItems = normalizeOwnedFlagList(legacyFavorites, state.inventory);
    state.shopWishlist = normalizeWishlist(input.shopWishlist);
    delete state.faction;
    delete state.pinnedItems;
    return state;
}

function cleanupOwnedItemFlags(playerState) {
    if (!playerState || typeof playerState !== 'object') return playerState;
    playerState.inventory = normalizeInventory(playerState.inventory);
    playerState.lockedItems = normalizeOwnedFlagList(playerState.lockedItems, playerState.inventory);
    playerState.favoriteItems = normalizeOwnedFlagList(playerState.favoriteItems, playerState.inventory);
    playerState.shopWishlist = normalizeWishlist(playerState.shopWishlist);
    playerState.schemaVersion = PLAYER_STATE_SCHEMA_VERSION;
    delete playerState.faction;
    delete playerState.pinnedItems;
    return playerState;
}

module.exports = {
    PLAYER_STATE_SCHEMA_VERSION,
    DEFAULT_STATE,
    createDefaultState,
    normalizePlayerState,
    cleanupOwnedItemFlags,
    safeInteger
};
