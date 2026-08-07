/**
 * @module rankPrestigeEngine
 * Handles career rank advancement, prestige ascension, and perk upgrades.
 */
const { getRankUpCost } = require('../utils/formulas');
const { RANKS, PERK_DEFINITIONS } = require('./dropTables');

class RankPrestigeEngine {
    /**
     * Gets discounted cost for next rank.
     * @param {Object} playerState 
     * @returns {number|null} Cost or null if max rank
     */
    static getRankUpCost(playerState) {
        const currentIndex = playerState.rankIndex || 0;
        if (currentIndex >= RANKS.length - 1) return null; // Max rank reached
        
        const nextIndex = currentIndex + 1;
        const nextRank = RANKS[nextIndex];
        const cronyismLevel = (playerState.perks && playerState.perks.cronyism) || 0;
        const investitureLevel = (playerState.perks && playerState.perks.investiture) || 0;
        const isGodRank = (nextIndex === 106 || nextRank.name === 'God');

        return getRankUpCost(nextRank.basePrice, cronyismLevel, investitureLevel, isGodRank);
    }

    /**
     * Checks if player can rank up.
     * @param {Object} playerState 
     * @returns {boolean}
     */
    static canRankUp(playerState) {
        const cost = this.getRankUpCost(playerState);
        if (cost === null) return false;
        return playerState.cash >= cost;
    }

    /**
     * Ranks up the player.
     * @param {Object} playerState 
     * @returns {Object}
     */
    static rankUp(playerState) {
        const cost = this.getRankUpCost(playerState);
        if (cost === null || playerState.cash < cost) {
            return { error: 'Cannot rank up. Not enough cash or max rank.' };
        }

        playerState.cash -= cost;
        playerState.rankIndex = (playerState.rankIndex || 0) + 1;
        
        const newRank = RANKS[playerState.rankIndex];

        return {
            success: true,
            newRank: newRank.index,
            newRankName: newRank.name,
            cost
        };
    }

    /**
     * Checks if player can ascend.
     * @param {Object} playerState 
     * @returns {boolean}
     */
    static canAscend(playerState) {
        const isGod = playerState.rankIndex === 106; // 106 is 0-based index for God (107th rank)
        return isGod;
    }

    /**
     * Ascends the player.
     * @param {Object} playerState 
     * @returns {Object}
     */
    static ascend(playerState) {
        if (!this.canAscend(playerState)) {
            return { error: 'Cannot ascend. Must reach rank God (Rank 107).' };
        }

        playerState.cash = 0;
        playerState.rankIndex = 0; // Peasant
        playerState.prestigeCount = (playerState.prestigeCount || 0) + 1;
        playerState.prestigePoints = (playerState.prestigePoints || 0) + 5;

        return {
            success: true,
            newPrestigeCount: playerState.prestigeCount,
            pointsAwarded: 5
        };
    }

    /**
     * Upgrades a perk.
     * @param {Object} playerState 
     * @param {string} perkName 
     * @returns {Object}
     */
    static upgradePerk(playerState, perkName) {
        const perkDef = PERK_DEFINITIONS[perkName];
        if (!perkDef) return { error: 'Invalid perk' };

        const currentLevel = playerState.perks[perkName] || 0;
        if (currentLevel >= perkDef.maxLevel) {
            return { error: 'Perk is at max level' };
        }

        if ((playerState.prestigePoints || 0) < 1) {
            return { error: 'Not enough prestige points' };
        }

        playerState.prestigePoints -= 1;
        playerState.perks[perkName] = currentLevel + 1;

        return {
            success: true,
            perkName,
            newLevel: playerState.perks[perkName],
            remainingPoints: playerState.prestigePoints
        };
    }

    /**
     * Gets player prestige info.
     * @param {Object} playerState 
     * @returns {Object}
     */
    static getPlayerPrestigeInfo(playerState) {
        return {
            prestigeCount: playerState.prestigeCount || 0,
            prestigePoints: playerState.prestigePoints || 0,
            perks: playerState.perks || {}
        };
    }
}

module.exports = RankPrestigeEngine;
