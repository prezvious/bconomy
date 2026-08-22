/**
 * @module formulas
 * Contains pure functions for game economy calculations.
 */

/**
 * Calculates the tool yield multiplier based on tool level (Levels 1-500).
 * Level 1 = 1.0x, Level 50 = 12.0x, Level 500 = ~3,500x.
 * @param {number} level - Tool level (1-500)
 * @returns {number} Multiplier
 */
function getToolYieldMultiplier(level) {
    const lvl = Math.max(1, Math.min(500, Math.floor(Number(level) || 1)));
    if (lvl <= 50) {
        return 1 + 11 * Math.pow((lvl - 1) / 49, 1.25);
    }
    // Moderate polynomial scaling for levels 51-500
    return 12 + 0.90 * Math.pow(lvl - 50, 1.35);
}

/**
 * Calculates base action cooldown reduction in seconds for Level 300+ tools.
 * Level 300 = -5s, +5s every 16 levels, capped at 60s max total reduction (at L476+).
 * @param {number} level - Tool level (1-500)
 * @returns {number} Cooldown reduction in seconds (0-60)
 */
function getToolCooldownReduction(level) {
    const lvl = Math.max(0, Math.floor(Number(level) || 0));
    if (lvl < 300) return 0;
    const steps = Math.floor((lvl - 300) / 16);
    return Math.min(60, 5 + (steps * 5));
}

/**
 * Calculates the number of unlocked modification sockets for a tool level.
 * 1 socket unlocked every 50 levels (at Lv 50, 100, 150, 200, 250, 300, 350, 400, 450, 500), up to 10 max.
 * @param {number} level - Tool level (1-500)
 * @returns {number} Unlocked socket count (0-10)
 */
function getUnlockedSocketCount(level) {
    const lvl = Math.max(0, Math.floor(Number(level) || 0));
    return Math.min(10, Math.floor(lvl / 50));
}

/**
 * Gets base pay for working based on rank index and prestige tier.
 * @param {number} rankIndex - Index of the player's rank (0-106)
 * @param {Array} ranks - Array of rank objects
 * @param {number} [tier=0] - Player prestige tier
 * @returns {number} Base pay
 */
function getWorkBasePay(rankIndex, ranks, tier = 0) {
    const rank = ranks[rankIndex];
    const rankBasePrice = rank ? rank.basePrice : 10000;
    const tierMult = 1 + (Math.max(0, Math.floor(Number(tier) || 0)) * 0.05);
    return Math.floor((rankBasePrice * tierMult * 0.05) + 5000);
}

/**
 * Gets the chance of receiving a work bonus and total bonus stacks.
 * @param {number} partialityLevel - Level of Partiality perk
 * @returns {Object} { totalChance, bonusCount }
 */
function calculateWorkBonuses(partialityLevel) {
    const totalChance = 0.30 + (0.15 * (partialityLevel || 0));
    let bonusCount = Math.floor(totalChance);
    const remainder = totalChance - bonusCount;
    if (Math.random() < remainder) {
        bonusCount += 1;
    }
    return { totalChance, bonusCount };
}

/**
 * Gets the discounted cost of ranking up.
 * @param {number} rankBasePrice - The base price of the target rank
 * @param {number} cronyismLevel - Level of Cronyism perk (max 25)
 * @param {number} investitureLevel - Level of Investiture perk (max 25, applies to Rank 107 God)
 * @param {boolean} isGodRank - Whether target rank is God
 * @returns {number} Discounted cost
 */
function getRankUpCost(rankBasePrice, cronyismLevel = 0, investitureLevel = 0, isGodRank = false, tier = 0) {
    const cronyism = Math.min(25, cronyismLevel || 0);
    const tierMult = 1 + (Math.max(0, Math.floor(Number(tier) || 0)) * 0.05);
    let cost = rankBasePrice * tierMult * (1 - 0.025 * cronyism);
    if (isGodRank) {
        const investiture = Math.min(25, investitureLevel || 0);
        cost = cost * (1 - 0.025 * investiture);
    }
    return Math.floor(cost);
}

/**
 * Gets the serendipity multiplier for rare item finds.
 * @param {number} serendipityLevel - Level of Serendipity perk
 * @param {number} itemDropChancePercent - The drop chance percentage of the item
 * @returns {number} Multiplier (Level + 1 for rare items if level > 0)
 */
function getSerendipityMultiplier(serendipityLevel, itemDropChancePercent) {
    if (itemDropChancePercent <= 5.0 && serendipityLevel > 0) {
        return serendipityLevel + 1;
    }
    return 1;
}

/**
 * Gets the chance of instantly resetting action cooldown.
 * @param {number} amnesiacLevel - Level of Amnesiac perk
 * @returns {number} Chance (0.0 to 1.0)
 */
function getAmnesiacChance(amnesiacLevel) {
    return (amnesiacLevel || 0) * 0.02;
}

/**
 * Booster tiers metadata and active duration definitions.
 * T1 = 15m, T2 = 30m, T3 = 1h, T4 = 2h, T5 = 4h, T6 = 8h.
 * Each booster provides a 2x loot multiplier. All active boosters stack multiplicatively.
 */
const BOOSTER_TIERS = {
    T1: { name: 'Tier 1', durationMs: 15 * 60 * 1000, multiplier: 2, label: '15m' },
    T2: { name: 'Tier 2', durationMs: 30 * 60 * 1000, multiplier: 2, label: '30m' },
    T3: { name: 'Tier 3', durationMs: 60 * 60 * 1000, multiplier: 2, label: '1h' },
    T4: { name: 'Tier 4', durationMs: 120 * 60 * 1000, multiplier: 2, label: '2h' },
    T5: { name: 'Tier 5', durationMs: 240 * 60 * 1000, multiplier: 2, label: '4h' },
    T6: { name: 'Tier 6', durationMs: 480 * 60 * 1000, multiplier: 2, label: '8h' }
};

/**
 * Calculates total multiplicative loot booster bonus for an action.
 * @param {Object} activeBoostersForAction - Object mapping tier (T1..T6) to expiration timestamp
 * @param {number} [now=Date.now()] - Current epoch millisecond timestamp
 * @returns {Object} { multiplier, activeCount, activeTiers }
 */
function calculateBoosterMultiplier(activeBoostersForAction, now = Date.now()) {
    if (!activeBoostersForAction) {
        return { multiplier: 1, activeCount: 0, activeTiers: [] };
    }

    const activeTiers = [];
    for (const tier of Object.keys(BOOSTER_TIERS)) {
        const expiration = activeBoostersForAction[tier] || 0;
        if (expiration > now) {
            activeTiers.push(tier);
        }
    }

    const activeCount = activeTiers.length;
    const multiplier = Math.pow(2, activeCount);

    return {
        multiplier,
        activeCount,
        activeTiers
    };
}

/**
 * Formats PascalCase item names to spaced words for display (e.g. "OldBones" -> "Old Bones").
 * @param {string} name
 * @returns {string} Spaced item name
 */
function displayItemName(name) {
    if (!name) return '';
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

/**
 * Calculates targeted rank up costs across ranks and tiers.
 * Ascension between Tier God (106) to Next Tier Peasant (0) is $0 (free).
 * @param {Object} playerState
 * @param {number} targetTier
 * @param {number} targetRankIndex
 * @param {Array} ranks
 * @param {boolean} isMaxAffordable
 * @returns {Object} { totalCost, targetTier, targetRankIndex, affordable }
 */
function calculateTargetedRankUpCost(playerState, targetTier, targetRankIndex, ranks, isMaxAffordable = false) {
    const cronyismLevel = (playerState.perks && playerState.perks.cronyism) || 0;
    const investitureLevel = (playerState.perks && playerState.perks.investiture) || 0;

    let curTier = playerState.prestigeCount || 0;
    let curRank = playerState.rankIndex || 0;
    let availableCash = playerState.cash || 0;
    let totalCost = 0;

    if (isMaxAffordable) {
        let remainingCash = availableCash;
        while (true) {
            if (curRank === 106) {
                // Free ascension to next tier
                curRank = 0;
                curTier += 1;
                continue;
            }

            const nextRankIndex = curRank + 1;
            const nextRank = ranks[nextRankIndex];
            if (!nextRank) break;

            const isGodRank = (nextRankIndex === 106 || nextRank.name === 'God');
            const cost = getRankUpCost(nextRank.basePrice, cronyismLevel, investitureLevel, isGodRank, curTier);

            if (remainingCash >= cost) {
                remainingCash -= cost;
                totalCost += cost;
                curRank = nextRankIndex;
            } else {
                break;
            }
        }
        return {
            totalCost,
            targetTier: curTier,
            targetRankIndex: curRank,
            affordable: true
        };
    }

    // Explicit Target (targetTier, targetRankIndex)
    let remainingCash = availableCash;
    const reqTier = Math.min(curTier + 1000, Math.max(curTier, parseInt(targetTier, 10) || 0));
    const reqRankIndex = Math.min(106, Math.max(0, parseInt(targetRankIndex, 10) || 0));

    // If target is lower than current state, invalid/no-op
    if (reqTier < curTier || (reqTier === curTier && reqRankIndex <= curRank)) {
        return {
            totalCost: 0,
            targetTier: curTier,
            targetRankIndex: curRank,
            affordable: true
        };
    }

    const MAX_RANKUP_ITERATIONS = 200000;
    let iterations = 0;

    while (curTier < reqTier || (curTier === reqTier && curRank < reqRankIndex)) {
        if (++iterations > MAX_RANKUP_ITERATIONS) {
            return {
                totalCost,
                targetTier: reqTier,
                targetRankIndex: reqRankIndex,
                affordable: false,
                error: 'Target too distant to calculate'
            };
        }
        if (curRank === 106) {
            curRank = 0;
            curTier += 1;
            if (curTier === reqTier && reqRankIndex === 0) {
                break;
            }
            continue;
        }

        const nextRankIndex = curRank + 1;
        const nextRank = ranks[nextRankIndex];
        if (!nextRank) break;

        const isGodRank = (nextRankIndex === 106 || nextRank.name === 'God');
        const cost = getRankUpCost(nextRank.basePrice, cronyismLevel, investitureLevel, isGodRank, curTier);

        totalCost += cost;
        remainingCash -= cost;
        curRank = nextRankIndex;
    }

    return {
        totalCost,
        targetTier: reqTier,
        targetRankIndex: reqRankIndex,
        affordable: availableCash >= totalCost
    };
}

module.exports = {
    getToolYieldMultiplier,
    getToolCooldownReduction,
    getUnlockedSocketCount,
    getWorkBasePay,
    calculateWorkBonuses,
    getRankUpCost,
    getSerendipityMultiplier,
    getAmnesiacChance,
    displayItemName,
    BOOSTER_TIERS,
    calculateBoosterMultiplier,
    calculateTargetedRankUpCost
};
