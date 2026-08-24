'use strict';

const { SELLABLE_ITEMS, BOOSTER_REGISTRY } = require('../engine/shopTables');
const {
    FISH_DROP_TABLE,
    EXPLORE_DROP_TABLE,
    HUNT_DROP_TABLE,
    MINE_DROP_TABLE,
    TOOL_UPGRADE_RECIPES,
    SOCKET_MODULE_DEFINITIONS
} = require('../engine/dropTables');
const { FARM_UPGRADE_MATERIALS } = require('../engine/farmPlotUpgrade');
const { CROP_DEFINITIONS } = require('../engine/farmEngine');
const {
    MATERIALS,
    CRAFTABLES,
    RECIPES,
    RECIPE_BY_OUTPUT_ID
} = require('./craftingCatalog');

const normalizeAlias = value => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const displayNameFromId = value => String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const registry = new Map();
const aliases = new Map();

function addItem(id, patch = {}) {
    const itemId = String(id || '').trim();
    if (!itemId) return;
    const existing = registry.get(itemId) || {
        id: itemId,
        displayName: displayNameFromId(itemId),
        category: 'other',
        storageScope: 'inventory',
        shopEligible: false,
        sellable: false,
        recipeId: null,
        aliases: []
    };
    const aliasValues = new Set([
        itemId,
        existing.displayName,
        patch.displayName,
        ...(existing.aliases || []),
        ...(patch.aliases || [])
    ].filter(Boolean).map(String));
    const next = {
        ...existing,
        ...patch,
        id: itemId,
        displayName: patch.displayName || existing.displayName || displayNameFromId(itemId),
        aliases: [...aliasValues]
    };
    registry.set(itemId, next);
    for (const alias of next.aliases) aliases.set(normalizeAlias(alias), itemId);
}

for (const table of [MINE_DROP_TABLE, EXPLORE_DROP_TABLE, HUNT_DROP_TABLE, FISH_DROP_TABLE]) {
    for (const drop of table || []) addItem(drop.item, { category: 'gathered' });
}

for (const [id, definition] of Object.entries(SELLABLE_ITEMS)) {
    addItem(id, {
        category: definition.category || 'commodity',
        shopEligible: Number(definition.appearanceChance) > 0,
        sellable: true,
        sellRange: Array.isArray(definition.sellRange) ? [...definition.sellRange] : null
    });
}

for (const [id, definition] of Object.entries(BOOSTER_REGISTRY)) {
    addItem(id, {
        category: 'booster',
        shopEligible: definition.inShop === true,
        sellable: false,
        booster: {
            action: definition.action,
            tier: definition.tier,
            durationMs: definition.durationMs,
            inShop: definition.inShop === true
        }
    });
}

for (const [id] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    addItem(id, { category: 'farm-upgrade-material', shopEligible: true, sellable: true });
}

for (const [id, crop] of Object.entries(CROP_DEFINITIONS)) {
    addItem(id, { displayName: crop.name || id, category: 'farm-crop', storageScopes: ['inventory', 'farm'] });
}

for (const material of MATERIALS) {
    addItem(material.id, {
        displayName: material.name || material.displayName || displayNameFromId(material.id),
        category: material.domain || 'crafting-material',
        craftingKind: 'material'
    });
}

for (const craftable of CRAFTABLES) {
    const recipe = RECIPE_BY_OUTPUT_ID[craftable.id];
    addItem(craftable.id, {
        displayName: craftable.name || craftable.displayName || displayNameFromId(craftable.id),
        category: craftable.domain || 'crafted',
        craftingKind: 'craftable',
        recipeId: recipe ? recipe.id : null
    });
}

for (const recipe of RECIPES) {
    addItem(recipe.output.itemId, { recipeId: recipe.id });
    for (const input of recipe.ingredients || []) addItem(input.itemId, { category: 'crafting-material' });
}

for (const recipes of Object.values(TOOL_UPGRADE_RECIPES || {})) {
    for (const requirements of Object.values(recipes || {})) {
        for (const requirement of requirements || []) addItem(requirement.item, { category: 'tool-material' });
    }
}

for (const [id, moduleDefinition] of Object.entries(SOCKET_MODULE_DEFINITIONS || {})) {
    addItem(id, {
        displayName: moduleDefinition.name || displayNameFromId(id),
        category: 'tool-module',
        storageScope: 'module'
    });
    for (const requirement of moduleDefinition.recipe || []) addItem(requirement.item, { category: 'tool-material' });
}

// Historical inventory aliases retained by the previous farm-state normalizer.
for (const [legacy, canonical] of Object.entries({
    Bones: 'OldBones',
    Steak: 'PrimeSteak',
    Urn: 'RitualUrn',
    Mushroom: 'RedMushroom'
})) {
    if (registry.has(canonical)) aliases.set(normalizeAlias(legacy), canonical);
}

const allItems = Object.freeze([...registry.values()]
    .map(item => Object.freeze({ ...item, aliases: Object.freeze([...(item.aliases || [])]) }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName)));

function normalizeItemId(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (registry.has(raw)) return raw;
    return aliases.get(normalizeAlias(raw)) || null;
}

function getItem(value) {
    const id = normalizeItemId(value);
    return id ? registry.get(id) || null : null;
}

function getAllItems() {
    return allItems;
}

module.exports = {
    normalizeAlias,
    normalizeItemId,
    getItem,
    getAllItems,
    isKnownItem: value => !!normalizeItemId(value)
};
