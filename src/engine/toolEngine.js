/**
 * @module toolEngine
 * Manages tool upgrade verification, procedural Level 1-500 recipe resolution,
 * bulk upgrading, modification sockets, and module crafting.
 */
const {
    TOOL_UPGRADE_RECIPES,
    SOCKET_MODULE_DEFINITIONS,
    generateProceduralRecipe
} = require('./dropTables');
const {
    getToolYieldMultiplier,
    getToolCooldownReduction,
    getUnlockedSocketCount,
    displayItemName
} = require('../utils/formulas');

const MAX_TOOL_LEVEL = 500;
const VALID_TOOL_TYPES = ['mine', 'explore', 'hunt', 'fish'];

class ToolEngine {
    /**
     * Ensures playerState has initialized tool socket and module inventory structures.
     * @param {Object} playerState
     */
    static ensureSocketState(playerState) {
        if (!playerState) return;
        playerState.tools = playerState.tools || { mine: 1, explore: 1, hunt: 1, fish: 1 };
        playerState.inventory = playerState.inventory || {};
        playerState.toolSockets = playerState.toolSockets || {};
        playerState.toolModules = playerState.toolModules || {};

        for (const tool of VALID_TOOL_TYPES) {
            if (!Array.isArray(playerState.toolSockets[tool])) {
                playerState.toolSockets[tool] = new Array(10).fill(null);
            } else {
                // Ensure exactly 10 slots
                while (playerState.toolSockets[tool].length < 10) {
                    playerState.toolSockets[tool].push(null);
                }
                if (playerState.toolSockets[tool].length > 10) {
                    playerState.toolSockets[tool] = playerState.toolSockets[tool].slice(0, 10);
                }
            }
        }
    }

    /**
     * Returns a copy of the player inventory excluding locked items.
     * @param {Object} playerState
     * @returns {Object}
     */
    static getUnlockedInventory(playerState) {
        const inv = { ...(playerState && playerState.inventory || {}) };
        const locked = Array.isArray(playerState && playerState.lockedItems) ? playerState.lockedItems : [];
        for (const item of locked) {
            delete inv[item];
        }
        return inv;
    }

    /**
     * Gets the upgrade requirements for a tool to reach the target level (Levels 1-500).
     * @param {string} toolType - 'mine', 'explore', 'hunt', or 'fish'
     * @param {number} targetLevel - The level to upgrade to (1-500)
     * @returns {Array<{item: string, quantity: number}>|null} Array of requirements or null if invalid/max level
     */
    static getUpgradeRequirements(toolType, targetLevel) {
        const lvl = parseInt(targetLevel, 10);
        if (!VALID_TOOL_TYPES.includes(toolType) || isNaN(lvl) || lvl < 1 || lvl > MAX_TOOL_LEVEL) {
            return null;
        }

        if (lvl <= 50) {
            const recipeMap = TOOL_UPGRADE_RECIPES[toolType];
            if (!recipeMap) return null;
            return recipeMap[lvl] || null;
        }

        return generateProceduralRecipe(toolType, lvl);
    }

    /**
     * Computes cumulative material costs and step-by-step breakdown across a range of tool levels.
     * @param {string} toolType - 'mine', 'explore', 'hunt', or 'fish'
     * @param {number} currentLevel - Starting level
     * @param {number} targetLevel - Ending level
     * @param {Object} [inventory={}] - Optional player inventory to check affordability
     * @returns {Object} Cumulative recipe breakdown and affordability analysis
     */
    static getRecipeBreakdown(toolType, currentLevel, targetLevel, inventory = {}) {
        const fromLvl = Math.max(1, parseInt(currentLevel, 10) || 1);
        const toLvl = Math.min(MAX_TOOL_LEVEL, parseInt(targetLevel, 10) || fromLvl);

        if (!VALID_TOOL_TYPES.includes(toolType) || toLvl <= fromLvl) {
            return {
                valid: false,
                toolType,
                currentLevel: fromLvl,
                targetLevel: toLvl,
                levelsCount: 0,
                cumulativeCost: {},
                levelByLevel: [],
                affordable: true,
                missingMaterials: {}
            };
        }

        const cumulativeCost = {};
        const levelByLevel = [];
        let affordable = true;
        const missingMaterials = {};

        for (let lvl = fromLvl + 1; lvl <= toLvl; lvl++) {
            const reqs = this.getUpgradeRequirements(toolType, lvl);
            if (!reqs) {
                return { valid: false, error: `Invalid recipe at level ${lvl}` };
            }
            levelByLevel.push({ level: lvl, requirements: reqs });
            for (const r of reqs) {
                cumulativeCost[r.item] = (cumulativeCost[r.item] || 0) + r.quantity;
            }
        }

        for (const [item, totalQty] of Object.entries(cumulativeCost)) {
            const playerQty = inventory[item] || 0;
            if (playerQty < totalQty) {
                affordable = false;
                missingMaterials[item] = totalQty - playerQty;
            }
        }

        return {
            valid: true,
            toolType,
            currentLevel: fromLvl,
            targetLevel: toLvl,
            levelsCount: toLvl - fromLvl,
            cumulativeCost,
            levelByLevel,
            affordable,
            missingMaterials
        };
    }

    /**
     * Calculates the maximum reachable level for a tool given current player inventory.
     * @param {Object} playerState
     * @param {string} toolType
     * @param {number} [maxCap=MAX_TOOL_LEVEL]
     * @returns {Object} { maxAffordableLevel, levelsGained, cumulativeCost, canUpgrade }
     */
    static getMaxAffordableLevel(playerState, toolType, maxCap = MAX_TOOL_LEVEL) {
        if (!playerState || !VALID_TOOL_TYPES.includes(toolType)) {
            return { maxAffordableLevel: 1, levelsGained: 0, cumulativeCost: {}, canUpgrade: false };
        }

        const currentLevel = (playerState.tools && playerState.tools[toolType]) || 1;
        const cap = Math.min(MAX_TOOL_LEVEL, Math.max(currentLevel, parseInt(maxCap, 10) || MAX_TOOL_LEVEL));

        const virtualInv = this.getUnlockedInventory(playerState);
        let reachedLevel = currentLevel;
        const cumulativeCost = {};

        for (let nextLvl = currentLevel + 1; nextLvl <= cap; nextLvl++) {
            const reqs = this.getUpgradeRequirements(toolType, nextLvl);
            if (!reqs) break;

            let canAffordNext = true;
            for (const r of reqs) {
                if ((virtualInv[r.item] || 0) < r.quantity) {
                    canAffordNext = false;
                    break;
                }
            }

            if (!canAffordNext) break;

            // Deduct from virtual inventory
            for (const r of reqs) {
                virtualInv[r.item] -= r.quantity;
                cumulativeCost[r.item] = (cumulativeCost[r.item] || 0) + r.quantity;
            }
            reachedLevel = nextLvl;
        }

        const blockingLevel = reachedLevel < cap ? reachedLevel + 1 : null;
        const blockingRequirements = blockingLevel ? (this.getUpgradeRequirements(toolType, blockingLevel) || []) : [];
        const ownedInventory = playerState.inventory || {};
        const locked = new Set(Array.isArray(playerState.lockedItems) ? playerState.lockedItems : []);
        const blockers = blockingRequirements
            .map(requirement => {
                const owned = Math.max(0, Math.floor(Number(ownedInventory[requirement.item]) || 0));
                const unlockedOwned = locked.has(requirement.item) ? 0 : owned;
                return {
                    item: requirement.item,
                    required: requirement.quantity,
                    owned,
                    unlockedOwned,
                    lockedOwned: locked.has(requirement.item) ? owned : 0,
                    missing: Math.max(0, requirement.quantity - unlockedOwned)
                };
            })
            .filter(blocker => blocker.missing > 0);

        return {
            currentLevel,
            maxAffordableLevel: reachedLevel,
            levelsGained: reachedLevel - currentLevel,
            cumulativeCost,
            canUpgrade: reachedLevel > currentLevel,
            atMaximum: reachedLevel >= MAX_TOOL_LEVEL,
            blockingLevel,
            blockers
        };
    }

    /**
     * Checks if a player can upgrade a tool by 1 level.
     * @param {Object} playerState
     * @param {string} toolType
     * @returns {boolean} True if can upgrade
     */
    static canUpgrade(playerState, toolType) {
        const currentLevel = (playerState.tools && playerState.tools[toolType]) || 1;
        if (currentLevel >= MAX_TOOL_LEVEL) return false;
        const nextLevel = currentLevel + 1;
        const requirements = this.getUpgradeRequirements(toolType, nextLevel);
        if (!requirements) return false;

        const inv = this.getUnlockedInventory(playerState);
        for (const req of requirements) {
            if ((inv[req.item] || 0) < req.quantity) {
                return false;
            }
        }
        return true;
    }

    /**
     * Upgrades a tool by 1 level for the player.
     * @param {Object} playerState
     * @param {string} toolType
     * @returns {Object} Result of upgrade
     */
    static upgradeTool(playerState, toolType) {
        return this.upgradeToolBulk(playerState, toolType, 1, true);
    }

    /**
     * Upgrades a tool across multiple levels or to a specified target level atomically.
     * @param {Object} playerState - Current player state
     * @param {string} toolType - 'mine', 'explore', 'hunt', or 'fish'
     * @param {number|string} targetOrCount - Target level (e.g. 50, 100), count (e.g. 10, 50), or 'max'
     * @param {boolean} [isCount=false] - If true, targetOrCount represents number of levels to gain
     * @returns {Object} Result of bulk upgrade transaction
     */
    static upgradeToolBulk(playerState, toolType, targetOrCount, isCount = false) {
        if (!VALID_TOOL_TYPES.includes(toolType)) {
            return { error: 'Invalid tool type' };
        }

        this.ensureSocketState(playerState);
        const currentLevel = (playerState.tools && playerState.tools[toolType]) || 1;

        if (currentLevel >= MAX_TOOL_LEVEL) {
            return { error: `Tool is already at maximum level (${MAX_TOOL_LEVEL})` };
        }

        let targetLevel;
        if (String(targetOrCount).toLowerCase() === 'max') {
            const maxAffordable = this.getMaxAffordableLevel(playerState, toolType);
            if (!maxAffordable.canUpgrade) {
                return { error: 'Insufficient materials for any tool upgrade', missingMaterials: {} };
            }
            targetLevel = maxAffordable.maxAffordableLevel;
        } else if (isCount) {
            const count = Math.max(1, parseInt(targetOrCount, 10) || 1);
            targetLevel = Math.min(MAX_TOOL_LEVEL, currentLevel + count);
        } else {
            targetLevel = Math.min(MAX_TOOL_LEVEL, parseInt(targetOrCount, 10) || (currentLevel + 1));
        }

        if (targetLevel <= currentLevel) {
            return { error: 'Target level must be greater than current level' };
        }

        const unlockedInv = this.getUnlockedInventory(playerState);
        const breakdown = this.getRecipeBreakdown(toolType, currentLevel, targetLevel, unlockedInv);
        if (!breakdown.valid) {
            return { error: breakdown.error || 'Invalid upgrade parameters' };
        }

        if (!breakdown.affordable) {
            return {
                error: 'Insufficient materials for targeted upgrade',
                missingMaterials: breakdown.missingMaterials,
                cumulativeCost: breakdown.cumulativeCost
            };
        }

        // Deduct cumulative materials
        for (const [item, qty] of Object.entries(breakdown.cumulativeCost)) {
            playerState.inventory[item] = (playerState.inventory[item] || 0) - qty;
        }

        playerState.tools[toolType] = targetLevel;

        const newYieldMultiplier = getToolYieldMultiplier(targetLevel);
        const newCooldownReduction = getToolCooldownReduction(targetLevel);
        const newSocketsUnlocked = getUnlockedSocketCount(targetLevel);

        return {
            success: true,
            toolType,
            previousLevel: currentLevel,
            newLevel: targetLevel,
            levelsGained: targetLevel - currentLevel,
            materialsConsumed: breakdown.cumulativeCost,
            levelByLevel: breakdown.levelByLevel,
            yieldMultiplier: newYieldMultiplier,
            cooldownReductionSec: newCooldownReduction,
            socketsUnlocked: newSocketsUnlocked
        };
    }

    /**
     * Gets socket configuration, unlocked slots, installed modules, and active bonuses for a tool.
     * @param {Object} playerState
     * @param {string} toolType
     * @returns {Object}
     */
    static getToolSocketSummary(playerState, toolType) {
        if (!VALID_TOOL_TYPES.includes(toolType)) return null;
        this.ensureSocketState(playerState);

        const toolLevel = (playerState.tools && playerState.tools[toolType]) || 1;
        const unlockedSlots = getUnlockedSocketCount(toolLevel);
        const rawSlots = playerState.toolSockets[toolType] || [];

        const activeBonuses = {
            multistrikeChance: 0,
            rareDropBonus: 0,
            transmutationRate: 0,
            cooldownReduction: 0,
            serendipityBonus: 0
        };

        const sockets = [];
        for (let i = 0; i < 10; i++) {
            const isUnlocked = i < unlockedSlots;
            const moduleId = isUnlocked ? rawSlots[i] : null;
            const moduleDef = moduleId ? SOCKET_MODULE_DEFINITIONS[moduleId] : null;

            if (moduleDef && moduleDef.effect) {
                if (moduleDef.effect.multistrikeChance) activeBonuses.multistrikeChance += moduleDef.effect.multistrikeChance;
                if (moduleDef.effect.rareDropBonus) activeBonuses.rareDropBonus += moduleDef.effect.rareDropBonus;
                if (moduleDef.effect.transmutationRate) activeBonuses.transmutationRate += moduleDef.effect.transmutationRate;
                if (moduleDef.effect.cooldownReduction) activeBonuses.cooldownReduction += moduleDef.effect.cooldownReduction;
                if (moduleDef.effect.serendipityBonus) activeBonuses.serendipityBonus += moduleDef.effect.serendipityBonus;
            }

            sockets.push({
                index: i,
                unlocked: isUnlocked,
                unlockLevel: (i + 1) * 50,
                moduleId: moduleId || null,
                module: moduleDef || null
            });
        }

        return {
            toolType,
            toolLevel,
            unlockedSlots,
            sockets,
            activeBonuses
        };
    }

    /**
     * Crafts a socket module using inventory items.
     * @param {Object} playerState
     * @param {string} moduleId
     * @param {number} [quantity=1]
     * @returns {Object}
     */
    static craftModule(playerState, moduleId, quantity = 1) {
        this.ensureSocketState(playerState);
        const moduleDef = SOCKET_MODULE_DEFINITIONS[moduleId];
        if (!moduleDef) {
            return { error: 'Invalid module ID' };
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0 || !isFinite(qty)) {
            return { error: 'Invalid quantity requested' };
        }
        const inv = this.getUnlockedInventory(playerState);
        const missing = {};
        let canCraft = true;

        for (const req of moduleDef.recipe) {
            const totalRequired = req.quantity * qty;
            const available = inv[req.item] || 0;
            if (available < totalRequired) {
                canCraft = false;
                missing[req.item] = totalRequired - available;
            }
        }

        if (!canCraft) {
            return { error: 'Insufficient materials to craft module', missing };
        }

        // Deduct materials
        for (const req of moduleDef.recipe) {
            playerState.inventory[req.item] -= req.quantity * qty;
        }

        playerState.toolModules[moduleId] = (playerState.toolModules[moduleId] || 0) + qty;

        return {
            success: true,
            moduleId,
            moduleName: moduleDef.name,
            quantityCrafted: qty,
            currentModuleCount: playerState.toolModules[moduleId]
        };
    }

    /**
     * Installs a crafted module into an unlocked tool socket.
     * @param {Object} playerState
     * @param {string} toolType
     * @param {number} socketIndex (0-9)
     * @param {string} moduleId
     * @returns {Object}
     */
    static installModule(playerState, toolType, socketIndex, moduleId) {
        if (!VALID_TOOL_TYPES.includes(toolType)) {
            return { error: 'Invalid tool type' };
        }
        this.ensureSocketState(playerState);

        const toolLevel = (playerState.tools && playerState.tools[toolType]) || 1;
        const unlockedSlots = getUnlockedSocketCount(toolLevel);
        const idx = parseInt(socketIndex, 10);

        if (isNaN(idx) || idx < 0 || idx >= unlockedSlots) {
            return { error: `Socket slot ${idx + 1} is locked or invalid (Requires Tool Level ${(idx + 1) * 50})` };
        }

        const moduleDef = SOCKET_MODULE_DEFINITIONS[moduleId];
        if (!moduleDef) {
            return { error: 'Invalid module ID' };
        }

        const ownedCount = playerState.toolModules[moduleId] || 0;
        if (ownedCount <= 0) {
            return { error: `You do not have a ${moduleDef.name} available to install` };
        }

        // If a module is already installed, unequip it back to toolModules
        const previouslyInstalled = playerState.toolSockets[toolType][idx];
        if (previouslyInstalled) {
            playerState.toolModules[previouslyInstalled] = (playerState.toolModules[previouslyInstalled] || 0) + 1;
        }

        // Install new module
        playerState.toolSockets[toolType][idx] = moduleId;
        playerState.toolModules[moduleId] -= 1;

        return {
            success: true,
            toolType,
            socketIndex: idx,
            installedModule: moduleId,
            returnedModule: previouslyInstalled || null,
            summary: this.getToolSocketSummary(playerState, toolType)
        };
    }

    /**
     * Uninstalls a module from a tool socket.
     * @param {Object} playerState
     * @param {string} toolType
     * @param {number} socketIndex
     * @returns {Object}
     */
    static uninstallModule(playerState, toolType, socketIndex) {
        if (!VALID_TOOL_TYPES.includes(toolType)) {
            return { error: 'Invalid tool type' };
        }
        this.ensureSocketState(playerState);

        const idx = parseInt(socketIndex, 10);
        if (isNaN(idx) || idx < 0 || idx >= 10) {
            return { error: 'Invalid socket index' };
        }

        const installedModule = playerState.toolSockets[toolType][idx];
        if (!installedModule) {
            return { error: 'No module is installed in this socket' };
        }

        playerState.toolSockets[toolType][idx] = null;
        playerState.toolModules[installedModule] = (playerState.toolModules[installedModule] || 0) + 1;

        return {
            success: true,
            toolType,
            socketIndex: idx,
            uninstalledModule: installedModule,
            summary: this.getToolSocketSummary(playerState, toolType)
        };
    }
}

module.exports = ToolEngine;
