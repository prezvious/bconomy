/**
 * @module toolEngine
 * Manages tool upgrade verification, material consumption, and recipe lookup logic.
 */
const { TOOL_UPGRADE_RECIPES } = require('./dropTables');

class ToolEngine {
    /**
     * Gets the upgrade requirements for a tool to reach the target level.
     * @param {string} toolType - 'mine', 'explore', 'hunt', or 'fish'
     * @param {number} targetLevel - The level to upgrade to (1-50)
     * @returns {Array|null} Array of {item, quantity} or null if max level
     */
    static getUpgradeRequirements(toolType, targetLevel) {
        if (targetLevel > 50) return null;
        const recipeMap = TOOL_UPGRADE_RECIPES[toolType];
        if (!recipeMap) return null;
        return recipeMap[targetLevel] || null;
    }

    /**
     * Checks if a player can upgrade a tool.
     * @param {Object} playerState - Current player state
     * @param {string} toolType - Tool type
     * @returns {boolean} True if can upgrade
     */
    static canUpgrade(playerState, toolType) {
        const currentLevel = playerState.tools[toolType] || 1;
        const nextLevel = currentLevel + 1;
        const requirements = this.getUpgradeRequirements(toolType, nextLevel);
        
        if (!requirements) return false;

        for (const req of requirements) {
            const playerQty = playerState.inventory[req.item] || 0;
            if (playerQty < req.quantity) {
                return false;
            }
        }
        return true;
    }

    /**
     * Upgrades a tool for the player.
     * @param {Object} playerState - Current player state
     * @param {string} toolType - Tool type
     * @returns {Object} Result of upgrade
     */
    static upgradeTool(playerState, toolType) {
        const currentLevel = playerState.tools[toolType] || 1;
        const nextLevel = currentLevel + 1;
        const requirements = this.getUpgradeRequirements(toolType, nextLevel);
        
        if (!requirements) {
            return { error: 'Max level reached or invalid tool' };
        }

        if (!this.canUpgrade(playerState, toolType)) {
            return { error: 'Insufficient materials' };
        }

        // Deduct materials
        for (const req of requirements) {
            playerState.inventory[req.item] -= req.quantity;
        }

        playerState.tools[toolType] = nextLevel;

        return {
            success: true,
            toolType,
            newLevel: nextLevel,
            materialsConsumed: requirements
        };
    }
}

module.exports = ToolEngine;
