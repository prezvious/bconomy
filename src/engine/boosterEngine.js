/**
 * @module boosterEngine
 * Engine for managing loot booster activation, inventory usage, and expiration tracking.
 * Compatible with ShopEngine and BOOSTER_REGISTRY.
 */
const { BOOSTER_TIERS, calculateBoosterMultiplier, displayItemName } = require('../utils/formulas');
const { BOOSTER_REGISTRY } = require('./shopTables');

const VALID_ACTIONS = ['mine', 'explore', 'hunt', 'fish'];
const VALID_TIERS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const VALID_BULK_MODES = ['allOwned', 'oneEach', 'custom'];

class BoosterEngine {
    /**
     * Ensures playerState has a fully populated boosters.activeUntil structure.
     * @param {Object} playerState 
     */
    static ensureBoosterState(playerState) {
        if (!playerState) return;
        
        playerState.inventory = playerState.inventory || {};

        if (!playerState.boosters || typeof playerState.boosters !== 'object') {
            playerState.boosters = {};
        }

        if (!playerState.boosters.activeUntil || typeof playerState.boosters.activeUntil !== 'object') {
            playerState.boosters.activeUntil = {};
        }

        VALID_ACTIONS.forEach(action => {
            if (!playerState.boosters.activeUntil[action] || typeof playerState.boosters.activeUntil[action] !== 'object') {
                playerState.boosters.activeUntil[action] = {};
            }
            VALID_TIERS.forEach(tier => {
                if (typeof playerState.boosters.activeUntil[action][tier] !== 'number' || isNaN(playerState.boosters.activeUntil[action][tier])) {
                    playerState.boosters.activeUntil[action][tier] = 0;
                }
            });
        });
    }

    /**
     * Finds matching booster entry in BOOSTER_REGISTRY by exact name, display name, or canonical string.
     * @param {string} name 
     * @returns {Object|null} { boosterName, config }
     */
    static findBoosterInRegistry(name) {
        if (!name) return null;
        if (BOOSTER_REGISTRY[name]) {
            return { boosterName: name, config: BOOSTER_REGISTRY[name] };
        }

        const normalizedInput = name.toLowerCase().replace(/[^a-z0-9]/g, '');

        for (const [bName, bConfig] of Object.entries(BOOSTER_REGISTRY)) {
            if (bName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput) {
                return { boosterName: bName, config: bConfig };
            }
            if (displayItemName(bName).toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput) {
                return { boosterName: bName, config: bConfig };
            }
        }

        return null;
    }

    /**
     * Parses an item name or string into actionType and tier.
     * e.g. "Prospector Kit", "Mining Booster T1", "MiningBoosterT1", "mine_t1", "Fish Booster T6"
     * @param {string} input 
     * @param {string} [fallbackAction]
     * @returns {Object|null} { actionType, tier, boosterName }
     */
    static parseBoosterItem(input, fallbackAction) {
        if (!input) return null;

        // Check registry first
        const registryMatch = this.findBoosterInRegistry(input);
        if (registryMatch) {
            return {
                actionType: registryMatch.config.action,
                tier: registryMatch.config.tier,
                boosterName: registryMatch.boosterName
            };
        }

        const normalized = input.toLowerCase().replace(/[^a-z0-9]/g, '');

        let tier = null;
        for (const t of VALID_TIERS) {
            if (normalized.endsWith(t.toLowerCase()) || normalized.includes(t.toLowerCase())) {
                tier = t;
                break;
            }
        }

        if (!tier) return null;

        let actionType = null;
        if (normalized.includes('mine') || normalized.includes('mining')) actionType = 'mine';
        else if (normalized.includes('explore') || normalized.includes('exploring')) actionType = 'explore';
        else if (normalized.includes('hunt') || normalized.includes('hunting')) actionType = 'hunt';
        else if (normalized.includes('fish') || normalized.includes('fishing')) actionType = 'fish';

        if (!actionType && fallbackAction && VALID_ACTIONS.includes(fallbackAction.toLowerCase())) {
            actionType = fallbackAction.toLowerCase();
        }

        if (actionType && tier) {
            // Find booster name in registry for this action & tier
            const regEntry = Object.entries(BOOSTER_REGISTRY).find(
                ([_, config]) => config.action === actionType && config.tier === tier
            );
            const boosterName = regEntry ? regEntry[0] : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Booster ${tier}`;
            return { actionType, tier, boosterName };
        }

        return null;
    }

    /**
     * Resolves an inventory key only when it is a canonical booster name or a
     * supported legacy action/tier booster key. This deliberately avoids
     * treating arbitrary action-related inventory items as boosters.
     */
    static parseBoosterInventoryItem(input) {
        const registryMatch = this.findBoosterInRegistry(input);
        if (registryMatch) {
            return {
                actionType: registryMatch.config.action,
                tier: registryMatch.config.tier,
                boosterName: registryMatch.boosterName
            };
        }

        const normalized = String(input || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!/^(mine|mining|explore|exploring|hunt|hunting|fish|fishing)(booster)?t[1-6]$/.test(normalized)) {
            return null;
        }
        return this.parseBoosterItem(input);
    }

    /**
     * Builds a non-mutating, validated plan for a bulk inventory activation.
     * The same planner is used for preview and execute so both paths share
     * quantity validation, expiry math, and response metadata.
     */
    static buildBulkActivationPlan(playerState, options, now = Date.now()) {
        if (!playerState || typeof playerState !== 'object' || Array.isArray(playerState)) {
            return { success: false, error: 'Missing or invalid playerState' };
        }
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            return { success: false, error: 'Missing or invalid bulk booster options' };
        }
        if (!Number.isSafeInteger(now) || now < 0) {
            return { success: false, error: 'Invalid activation timestamp' };
        }

        const mode = options.mode;
        if (!VALID_BULK_MODES.includes(mode)) {
            return { success: false, error: `Invalid bulk booster mode '${mode}'` };
        }

        const inventory = playerState.inventory && typeof playerState.inventory === 'object'
            ? playerState.inventory
            : {};
        const ownedEntries = [];

        for (const [itemName, rawOwned] of Object.entries(inventory)) {
            if (Array.isArray(playerState.lockedItems) && playerState.lockedItems.includes(itemName)) continue;
            const parsed = this.parseBoosterInventoryItem(itemName);
            if (!parsed) continue;

            const ownedQuantity = rawOwned;
            if (typeof ownedQuantity !== 'number' || !Number.isSafeInteger(ownedQuantity) || ownedQuantity < 0) {
                return { success: false, error: `Invalid owned quantity for booster '${itemName}'` };
            }
            if (ownedQuantity === 0) continue;

            ownedEntries.push({ itemName, ownedQuantity, ...parsed });
        }

        const ownedByName = new Map(ownedEntries.map(entry => [entry.itemName, entry]));
        const requestedQuantities = mode === 'custom' ? options.quantities : null;
        if (mode === 'custom' && (!requestedQuantities || typeof requestedQuantities !== 'object' || Array.isArray(requestedQuantities))) {
            return { success: false, error: 'Custom bulk activation requires a quantities object' };
        }

        if (mode === 'custom') {
            for (const [itemName, rawQuantity] of Object.entries(requestedQuantities)) {
                if (!ownedByName.has(itemName)) {
                    return { success: false, error: `Unknown or unowned booster '${itemName}'` };
                }
                const quantity = rawQuantity;
                if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 0) {
                    return { success: false, error: `Invalid activation quantity for booster '${itemName}'` };
                }
                if (quantity > ownedByName.get(itemName).ownedQuantity) {
                    return { success: false, error: `Cannot activate ${quantity} '${itemName}' boosters; only ${ownedByName.get(itemName).ownedQuantity} owned` };
                }
            }
        }

        const breakdown = [];
        const tierGroups = new Map();
        let totalUnits = 0;

        for (const entry of ownedEntries) {
            const quantity = mode === 'allOwned'
                ? entry.ownedQuantity
                : mode === 'oneEach'
                    ? 1
                    : (requestedQuantities[entry.itemName] || 0);
            if (quantity <= 0) continue;

            const tierInfo = BOOSTER_TIERS[entry.tier];
            const durationAddedMs = tierInfo.durationMs * quantity;
            if (!Number.isSafeInteger(durationAddedMs)) {
                return { success: false, error: `Activation duration is too large for booster '${entry.itemName}'` };
            }

            breakdown.push({
                itemName: entry.itemName,
                boosterName: entry.boosterName,
                actionType: entry.actionType,
                tier: entry.tier,
                ownedQuantity: entry.ownedQuantity,
                quantity,
                remainingQuantity: entry.ownedQuantity - quantity,
                durationPerUnitMs: tierInfo.durationMs,
                durationAddedMs
            });
            totalUnits += quantity;
            if (!Number.isSafeInteger(totalUnits)) {
                return { success: false, error: 'Selected booster quantity is too large' };
            }

            const groupKey = `${entry.actionType}:${entry.tier}`;
            const group = tierGroups.get(groupKey) || {
                actionType: entry.actionType,
                tier: entry.tier,
                quantity: 0,
                durationAddedMs: 0,
                itemNames: []
            };
            group.quantity += quantity;
            group.durationAddedMs += durationAddedMs;
            if (!Number.isSafeInteger(group.quantity) || !Number.isSafeInteger(group.durationAddedMs)) {
                return { success: false, error: `Activation duration is too large for ${entry.actionType} ${entry.tier}` };
            }
            group.itemNames.push(entry.itemName);
            tierGroups.set(groupKey, group);
        }

        if (breakdown.length === 0 || totalUnits === 0) {
            return { success: false, error: 'No boosters selected for activation' };
        }

        const currentActiveUntil = playerState.boosters && playerState.boosters.activeUntil && typeof playerState.boosters.activeUntil === 'object'
            ? playerState.boosters.activeUntil
            : {};
        const projectedActiveUntil = {};
        for (const action of VALID_ACTIONS) {
            projectedActiveUntil[action] = {};
            for (const tier of VALID_TIERS) {
                const rawExpiry = currentActiveUntil[action] && currentActiveUntil[action][tier];
                projectedActiveUntil[action][tier] = Number.isFinite(rawExpiry) && rawExpiry >= 0 ? rawExpiry : 0;
            }
        }

        const tierSummaries = [...tierGroups.values()]
            .sort((a, b) => VALID_ACTIONS.indexOf(a.actionType) - VALID_ACTIONS.indexOf(b.actionType)
                || VALID_TIERS.indexOf(a.tier) - VALID_TIERS.indexOf(b.tier))
            .map(group => {
                const previousExpiry = projectedActiveUntil[group.actionType][group.tier] || 0;
                const baseTime = Math.max(now, previousExpiry);
                const newExpiry = baseTime + group.durationAddedMs;
                if (!Number.isSafeInteger(newExpiry)) {
                    return { error: `Projected expiry is too large for ${group.actionType} ${group.tier}` };
                }
                projectedActiveUntil[group.actionType][group.tier] = newExpiry;
                return {
                    ...group,
                    itemNames: [...new Set(group.itemNames)],
                    previousExpiry,
                    newExpiry,
                    wasActive: previousExpiry > now
                };
            });

        const invalidSummary = tierSummaries.find(summary => summary.error);
        if (invalidSummary) return { success: false, error: invalidSummary.error };

        const affectedActions = [...new Set(tierSummaries.map(summary => summary.actionType))];
        const actionSummaries = affectedActions.map(actionType => {
            const info = calculateBoosterMultiplier(projectedActiveUntil[actionType], now);
            return {
                actionType,
                activeTiers: info.activeTiers,
                activeCount: info.activeCount,
                multiplier: info.multiplier
            };
        });

        return {
            success: true,
            action: 'activateBoosters',
            mode,
            activationTime: now,
            itemsAffectedCount: breakdown.length,
            totalUnits,
            breakdown,
            tierSummaries,
            actionSummaries
        };
    }

    /**
     * Executes a validated bulk activation atomically. State objects are
     * staged first and assigned only after the complete plan succeeds.
     */
    static activateBoostersBulk(playerState, options, now = Date.now()) {
        const plan = this.buildBulkActivationPlan(playerState, options, now);
        if (plan.error) return plan;

        const nextInventory = { ...(playerState.inventory || {}) };
        for (const item of plan.breakdown) {
            const remaining = item.ownedQuantity - item.quantity;
            if (remaining > 0) nextInventory[item.itemName] = remaining;
            else delete nextInventory[item.itemName];
        }

        const existingBoosters = playerState.boosters && typeof playerState.boosters === 'object'
            ? playerState.boosters
            : {};
        const currentActiveUntil = existingBoosters.activeUntil && typeof existingBoosters.activeUntil === 'object'
            ? existingBoosters.activeUntil
            : {};
        const nextActiveUntil = {};
        for (const action of VALID_ACTIONS) {
            nextActiveUntil[action] = {};
            for (const tier of VALID_TIERS) {
                const rawExpiry = currentActiveUntil[action] && currentActiveUntil[action][tier];
                nextActiveUntil[action][tier] = Number.isFinite(rawExpiry) && rawExpiry >= 0 ? rawExpiry : 0;
            }
        }
        for (const summary of plan.tierSummaries) {
            nextActiveUntil[summary.actionType][summary.tier] = summary.newExpiry;
        }

        playerState.inventory = nextInventory;
        playerState.boosters = { ...existingBoosters, activeUntil: nextActiveUntil };
        return plan;
    }

    /**
     * Activates a booster tier directly for an action (e.g. via dev/console command or direct UI trigger).
     * Extends expiration time if already active.
     */
    static activateBoosterDirect(playerState, actionType, tier, now = Date.now()) {
        this.ensureBoosterState(playerState);
        const action = (actionType || '').toLowerCase();
        const t = (tier || '').toUpperCase();

        if (!VALID_ACTIONS.includes(action)) {
            return { success: false, error: `Invalid action type '${actionType}'. Must be one of: ${VALID_ACTIONS.join(', ')}` };
        }
        if (!VALID_TIERS.includes(t)) {
            return { success: false, error: `Invalid booster tier '${tier}'. Must be one of: ${VALID_TIERS.join(', ')}` };
        }

        const tierInfo = BOOSTER_TIERS[t];
        const currentExp = playerState.boosters.activeUntil[action][t] || 0;
        const baseTime = Math.max(now, currentExp);
        const newExpiry = baseTime + tierInfo.durationMs;

        playerState.boosters.activeUntil[action][t] = newExpiry;

        const info = calculateBoosterMultiplier(playerState.boosters.activeUntil[action], now);
        const formattedAction = action.charAt(0).toUpperCase() + action.slice(1);

        const regEntry = Object.entries(BOOSTER_REGISTRY).find(
            ([_, config]) => config.action === action && config.tier === t
        );
        const boosterDisplayName = regEntry ? regEntry[0] : `${formattedAction} Booster ${t}`;

        return {
            success: true,
            actionType: action,
            tier: t,
            boosterName: boosterDisplayName,
            newExpiry,
            durationMs: tierInfo.durationMs,
            durationMinutes: tierInfo.durationMs / 60000,
            activeTiers: info.activeTiers,
            boosterMultiplier: info.multiplier,
            message: `Activated ${boosterDisplayName} (${t})! Multiplier for ${formattedAction}: ${info.multiplier}× (${info.activeTiers.join(', ')})`
        };
    }

    /**
     * Uses a booster item from player inventory.
     * Deducts 1 item count from inventory and extends active booster duration.
     */
    static useBooster(playerState, itemName, actionTypeOverride, now = Date.now()) {
        this.ensureBoosterState(playerState);

        const parsed = this.parseBoosterItem(itemName, actionTypeOverride);
        if (!parsed) {
            return { success: false, error: `Could not identify valid booster action and tier from item name '${itemName}'.` };
        }

        const { actionType, tier, boosterName } = parsed;

        // Search inventory for matching item key (raw key, registry name, display name, or normalized)
        let foundKey = null;
        for (const key of Object.keys(playerState.inventory)) {
            if (playerState.inventory[key] <= 0) continue;
            if (key === itemName || key === boosterName) {
                foundKey = key;
                break;
            }
            if (displayItemName(key).toLowerCase() === displayItemName(itemName).toLowerCase() ||
                displayItemName(key).toLowerCase() === displayItemName(boosterName).toLowerCase()) {
                foundKey = key;
                break;
            }
            const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const itemNorm = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const bNorm = boosterName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (keyNorm === itemNorm || keyNorm === bNorm) {
                foundKey = key;
                break;
            }
        }

        if (!foundKey || playerState.inventory[foundKey] <= 0) {
            return { success: false, error: `You do not have any '${itemName}' in your inventory.` };
        }

        if (Array.isArray(playerState.lockedItems) && (playerState.lockedItems.includes(foundKey) || playerState.lockedItems.includes(itemName) || playerState.lockedItems.includes(boosterName))) {
            return { success: false, error: `Booster '${itemName}' is locked and cannot be used. Unlock it first.` };
        }

        // Deduct 1 item
        playerState.inventory[foundKey] -= 1;
        if (playerState.inventory[foundKey] <= 0) {
            delete playerState.inventory[foundKey];
        }

        // Activate booster
        const actResult = this.activateBoosterDirect(playerState, actionType, tier, now);
        actResult.consumedItem = foundKey;
        actResult.remainingQuantity = playerState.inventory[foundKey] || 0;

        return actResult;
    }
}

module.exports = BoosterEngine;
