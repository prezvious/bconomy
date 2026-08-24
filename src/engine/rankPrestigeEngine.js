/**
 * @module rankPrestigeEngine
 * Handles career rank advancement, prestige ascension, and perk upgrades.
 */
const { getRankUpCost, getAscensionCost } = require('../utils/formulas');
const { RANKS, PERK_DEFINITIONS } = require('./dropTables');
const { PerkSimulatorEngine } = require('./perkSimulatorEngine');

class RankPrestigeEngine {
    static getProgressionSummary(playerState) {
        const currentRankIndex = Math.max(0, Math.floor(Number(playerState?.rankIndex) || 0));
        const cash = Math.max(0, Math.floor(Number(playerState?.cash) || 0));
        const atGod = currentRankIndex >= RANKS.length - 1;
        const cost = atGod ? this.getAscensionCost(playerState) : this.getRankUpCost(playerState);
        const target = atGod
            ? { type: 'ascension', label: `Prestige Tier ${(playerState?.prestigeCount || 0) + 1}` }
            : { type: 'rank', rankIndex: currentRankIndex + 1, label: RANKS[currentRankIndex + 1]?.name || 'Next Rank' };
        return {
            currentRankIndex,
            currentRankName: RANKS[currentRankIndex]?.name || 'Unknown',
            atGod,
            cash,
            cost,
            deficit: Math.max(0, (cost || 0) - cash),
            ready: cost !== null && cash >= cost,
            target
        };
    }

    static previewTargetedRankUp(playerState, targetTier, targetRankIndex, isMaxAffordable = false) {
        const { calculateTargetedRankUpCost } = require('../utils/formulas');
        return calculateTargetedRankUpCost(playerState, targetTier, targetRankIndex, RANKS, isMaxAffordable);
    }

    static applyPerkAllocation(playerState, targetLevels) {
        const simulation = PerkSimulatorEngine.simulate(playerState, targetLevels);
        if (simulation.error) return simulation;
        if (simulation.spent <= 0) return { error: 'Allocation does not add any perk levels' };
        playerState.perks = { ...(playerState.perks || {}), ...simulation.targetLevels };
        playerState.prestigePoints = simulation.remaining;
        return { success: true, ...simulation };
    }

    static ascendAndApplyAllocation(playerState, targetLevels) {
        if (!this.canAscend(playerState)) return { error: 'Cannot ascend with the current rank and cash balance' };
        const staged = JSON.parse(JSON.stringify(playerState));
        const ascension = this.ascend(staged);
        if (ascension.error) return ascension;
        const allocation = this.applyPerkAllocation(staged, targetLevels);
        if (allocation.error) return allocation;
        Object.keys(playerState).forEach(key => delete playerState[key]);
        Object.assign(playerState, staged);
        return { success: true, ascension, allocation };
    }
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
        const tier = playerState.prestigeCount || 0;
        return getRankUpCost(nextRank.basePrice, cronyismLevel, 0, false, tier);
    }

    /**
     * Gets the discounted cost for prestige ascension.
     * @param {Object} playerState
     * @returns {number}
     */
    static getAscensionCost(playerState) {
        const tier = playerState.prestigeCount || 0;
        const investitureLevel = (playerState.perks && playerState.perks.investiture) || 0;
        return getAscensionCost(tier, investitureLevel);
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
        if (!isGod) return false;
        const cost = this.getAscensionCost(playerState);
        return (playerState.cash || 0) >= cost;
    }

    /**
     * Ascends the player.
     * @param {Object} playerState
     * @returns {Object}
     */
    static ascend(playerState) {
        if (!this.canAscend(playerState)) {
            if (playerState.rankIndex !== 106) {
                return { error: 'Cannot ascend. Must reach rank God (Rank 107).' };
            }
            const cost = this.getAscensionCost(playerState);
            return { error: `Cannot ascend. Requires $${cost.toLocaleString()} cash.` };
        }

        const cost = this.getAscensionCost(playerState);
        playerState.cash -= cost;
        playerState.rankIndex = 0; // Peasant
        playerState.prestigeCount = (playerState.prestigeCount || 0) + 1;
        playerState.prestigePoints = (playerState.prestigePoints || 0) + 5;

        return {
            success: true,
            newPrestigeCount: playerState.prestigeCount,
            pointsAwarded: 5,
            cost
        };
    }

    /**
     * Executes targeted rank up across ranks and tiers.
     * @param {Object} playerState
     * @param {number} targetTier
     * @param {number} targetRankIndex
     * @param {boolean} isMaxAffordable
     * @returns {Object}
     */
    static targetedRankUp(playerState, targetTier, targetRankIndex, isMaxAffordable = false) {
        const { calculateTargetedRankUpCost } = require('../utils/formulas');
        const calc = calculateTargetedRankUpCost(playerState, targetTier, targetRankIndex, RANKS, isMaxAffordable);

        if (!calc.affordable || playerState.cash < calc.totalCost) {
            return { error: 'Not enough cash for targeted rank up.' };
        }

        const initialTier = playerState.prestigeCount || 0;
        const initialRank = playerState.rankIndex || 0;

        if (calc.targetTier === initialTier && calc.targetRankIndex === initialRank) {
            return { error: 'Already at or above requested target rank/tier.' };
        }

        playerState.cash -= calc.totalCost;
        const tiersAscended = Math.max(0, calc.targetTier - initialTier);
        playerState.prestigeCount = calc.targetTier;
        playerState.prestigePoints = (playerState.prestigePoints || 0) + (tiersAscended * 5);
        playerState.rankIndex = calc.targetRankIndex;

        const newRankInfo = RANKS[calc.targetRankIndex] || { index: calc.targetRankIndex, name: 'Unknown' };

        return {
            success: true,
            totalCost: calc.totalCost,
            newRank: calc.targetRankIndex,
            newRankName: newRankInfo.name,
            newPrestigeCount: playerState.prestigeCount,
            pointsAwarded: tiersAscended * 5,
            tiersAscended
        };
    }

    /**
     * Upgrades a perk (supports single, +5, or max affordable upgrades).
     * @param {Object} playerState
     * @param {string} perkName
     * @param {number|string} [countOrMax=1] - Number of levels to upgrade or 'max'
     * @returns {Object}
     */
    static upgradePerk(playerState, perkName, countOrMax = 1) {
        if (!playerState.perks) playerState.perks = {};
        const perkDef = PERK_DEFINITIONS[perkName];
        if (!perkDef) return { error: 'Invalid perk' };

        const currentLevel = playerState.perks[perkName] || 0;
        const maxLevel = perkDef.maxLevel || 0;
        if (currentLevel >= maxLevel) {
            return { error: 'Perk is already at max level' };
        }

        const availablePoints = Math.max(0, Math.floor(Number(playerState.prestigePoints) || 0));
        if (availablePoints < 1) {
            return { error: 'Not enough prestige points' };
        }

        const remainingLevels = maxLevel - currentLevel;
        let levelsToBuy = 1;

        if (countOrMax === 'max') {
            levelsToBuy = Math.min(availablePoints, remainingLevels);
        } else {
            const requested = parseInt(countOrMax, 10);
            const count = isNaN(requested) || requested < 1 ? 1 : requested;
            levelsToBuy = Math.min(count, availablePoints, remainingLevels);
        }

        if (levelsToBuy < 1) {
            return { error: 'Cannot upgrade perk' };
        }

        playerState.prestigePoints = availablePoints - levelsToBuy;
        playerState.perks[perkName] = currentLevel + levelsToBuy;

        return {
            success: true,
            perkName,
            levelsAdded: levelsToBuy,
            cost: levelsToBuy,
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
