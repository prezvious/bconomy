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
 * @param {number} [investitureLevel=0] - Legacy/unused parameter
 * @param {boolean} [isGodRank=false] - Legacy/unused parameter
 * @param {number} [tier=0] - Player prestige tier
 * @returns {number} Discounted cost
 */
function getRankUpCost(rankBasePrice, cronyismLevel = 0, investitureLevel = 0, isGodRank = false, tier = 0) {
    const cronyism = Math.min(25, Math.max(0, Number(cronyismLevel) || 0));
    const t = Math.max(0, Math.floor(Number(tier) || 0));
    const tierMult = t + 1;
    const cost = rankBasePrice * tierMult * (1 - 0.025 * cronyism);
    return Math.floor(cost);
}

/**
 * Gets the discounted cost to ascend prestige tiers.
 * Tier 0 -> Tier 1 is Free ($0).
 * Tier t >= 1 -> Tier t+1 is 550,000,000 * (t + 2), discounted by Investiture (Anointment).
 * @param {number} tier - Current prestige tier (t >= 0)
 * @param {number} investitureLevel - Level of Investiture perk (max 25)
 * @returns {number} Discounted ascension cost
 */
function getAscensionCost(tier = 0, investitureLevel = 0) {
    const t = Math.max(0, Math.floor(Number(tier) || 0));
    if (t === 0) return 0;
    const investiture = Math.min(25, Math.max(0, Number(investitureLevel) || 0));
    const baseCost = 550000000 * (t + 2);
    const cost = baseCost * (1 - 0.025 * investiture);
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
 * Ascension between Tier God (106) to Next Tier Peasant (0) is $0 for Tier 0, and
 * 550,000,000 * (Tier + 2) * (1 - 0.025 * Investiture) for Tier >= 1.
 * @param {Object} playerState
 * @param {number} targetTier
 * @param {number} targetRankIndex
 * @param {Array} ranks
 * @param {boolean} isMaxAffordable
 * @returns {Object} { totalCost, targetTier, targetRankIndex, affordable }
 */
const MAX_TARGETED_TIER_ADVANCE = 3000;

function calculateTargetedRankUpCost(playerState, targetTier, targetRankIndex, ranks, isMaxAffordable = false) {
    const cronyismLevel = Math.min(25, (playerState.perks && playerState.perks.cronyism) || 0);
    const investitureLevel = Math.min(25, (playerState.perks && playerState.perks.investiture) || 0);

    let curTier = Math.max(0, Math.floor(Number(playerState.prestigeCount) || 0));
    let curRank = Math.min(106, Math.max(0, Math.floor(Number(playerState.rankIndex) || 0)));
    let availableCash = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(playerState.cash) || 0)));
    const initialTier = curTier;
    const initialRank = curRank;

    // Helper: cost of rank slice within a tier from [fromRankExcl + 1 ... toRankIncl]
    const getSliceCost = (fromRankExcl, toRankIncl, tier) => {
        let cost = 0;
        for (let r = fromRankExcl + 1; r <= toRankIncl; r++) {
            const rInfo = ranks[r];
            if (!rInfo) break;
            cost += getRankUpCost(rInfo.basePrice, cronyismLevel, 0, false, tier);
        }
        return cost;
    };

    // Helper: cost of an entire tier T (all 106 rank promotions 0 -> 106 PLUS ascension to T+1)
    const getTierCost = (tier) => {
        return getSliceCost(0, 106, tier) + getAscensionCost(tier, investitureLevel);
    };

    const getNextCost = (tier = curTier, rank = curRank) => {
        if (rank >= 106) return getAscensionCost(tier, investitureLevel);
        const nextRank = ranks[rank + 1];
        return nextRank ? getRankUpCost(nextRank.basePrice, cronyismLevel, 0, false, tier) : 0;
    };

    const preview = (totalCost, resolvedTier, resolvedRank, affordable = availableCash >= totalCost) => {
        const advances = resolvedTier > initialTier || (resolvedTier === initialTier && resolvedRank > initialRank);
        let reason;
        let nextCost = totalCost;
        if (!advances && isMaxAffordable) {
            reason = 'INSUFFICIENT_CASH';
            nextCost = getNextCost();
        } else if (!advances) {
            reason = 'ALREADY_REACHED';
            nextCost = 0;
        } else {
            reason = affordable ? 'READY' : 'INSUFFICIENT_CASH';
        }
        return {
            totalCost,
            targetTier: resolvedTier,
            targetRankIndex: resolvedRank,
            affordable: reason === 'READY' || reason === 'ALREADY_REACHED',
            canAdvance: reason === 'READY',
            reason,
            nextCost,
            deficit: reason === 'INSUFFICIENT_CASH' ? Math.max(0, nextCost - availableCash) : 0
        };
    };

    // Precalculate tier slope for quadratic leaping when tier >= 1
    const fullTier1Cost = getTierCost(1);
    const fullTier2Cost = getTierCost(2);
    const tierSlope = fullTier2Cost - fullTier1Cost;

    if (isMaxAffordable) {
        let remainingCash = availableCash;
        let totalCost = 0;

        // Step 1: Finish current tier if not at God
        if (curRank < 106) {
            const costToFinishRanks = getSliceCost(curRank, 106, curTier);
            if (remainingCash < costToFinishRanks) {
                // Buy as many individual ranks in current tier as possible
                for (let r = curRank + 1; r <= 106; r++) {
                    const rInfo = ranks[r];
                    if (!rInfo) break;
                    const c = getRankUpCost(rInfo.basePrice, cronyismLevel, 0, false, curTier);
                    if (remainingCash >= c) {
                        remainingCash -= c;
                        totalCost += c;
                        curRank = r;
                    } else {
                        break;
                    }
                }
                return preview(totalCost, curTier, curRank, true);
            }

            // Player can afford to reach God (Rank 106).
            // Now check if player can also afford ascension to curTier + 1:
            const ascendCost = getAscensionCost(curTier, investitureLevel);
            if (remainingCash < costToFinishRanks + ascendCost) {
                // Reach God, but cannot afford ascension fee
                remainingCash -= costToFinishRanks;
                totalCost += costToFinishRanks;
                curRank = 106;
                return preview(totalCost, curTier, curRank, true);
            }

            // Can afford reaching God AND ascending
            remainingCash -= (costToFinishRanks + ascendCost);
            totalCost += (costToFinishRanks + ascendCost);
            curTier += 1;
            curRank = 0;
        } else {
            // Already at God (106), check if can afford ascension
            const ascendCost = getAscensionCost(curTier, investitureLevel);
            if (remainingCash >= ascendCost) {
                remainingCash -= ascendCost;
                totalCost += ascendCost;
                curTier += 1;
                curRank = 0;
            } else {
                return preview(0, curTier, curRank, false);
            }
        }

        // Step 2: Leap whole tiers
        // If curTier === 0, handle Tier 0 first (since tier 0 ascension cost is 0, linear slope starts from tier 1)
        if (curTier === 0 && remainingCash > 0) {
            const costTier0 = getTierCost(0);
            if (remainingCash >= costTier0) {
                remainingCash -= costTier0;
                totalCost += costTier0;
                curTier = 1;
            }
        }

        if (remainingCash > 0 && curTier >= 1 && tierSlope > 0) {
            const costCurTier = getTierCost(curTier);
            const a = tierSlope / 2;
            const b = costCurTier - a;
            const c = -remainingCash;
            const discriminant = b * b - 4 * a * c;
            let estN = 0;
            if (discriminant >= 0) {
                estN = Math.max(0, Math.floor((-b + Math.sqrt(discriminant)) / (2 * a)));
            }

            const computeExactNTiersCost = (n) => {
                let sum = 0;
                for (let t = 0; t < n; t++) {
                    sum += getTierCost(curTier + t);
                }
                return sum;
            };

            let exactCostEst = computeExactNTiersCost(estN);
            while (estN > 0 && exactCostEst > remainingCash) {
                estN--;
                exactCostEst -= getTierCost(curTier + estN);
            }
            while (true) {
                const nextCost = getTierCost(curTier + estN);
                if (exactCostEst + nextCost <= remainingCash) {
                    exactCostEst += nextCost;
                    estN++;
                } else {
                    break;
                }
            }

            remainingCash -= exactCostEst;
            totalCost += exactCostEst;
            curTier += estN;
        }

        // Step 3: Buy remaining individual ranks in final tier
        for (let r = 1; r <= 106; r++) {
            const rInfo = ranks[r];
            if (!rInfo) break;
            const c = getRankUpCost(rInfo.basePrice, cronyismLevel, 0, false, curTier);
            if (remainingCash >= c) {
                remainingCash -= c;
                totalCost += c;
                curRank = r;
            } else {
                break;
            }
        }

        // If player reached God (106) in final tier and can afford ascension to curTier+1, ascend
        if (curRank === 106) {
            const ascendCost = getAscensionCost(curTier, investitureLevel);
            if (remainingCash >= ascendCost) {
                remainingCash -= ascendCost;
                totalCost += ascendCost;
                curTier += 1;
                curRank = 0;
            }
        }

        return preview(totalCost, curTier, curRank, true);
    }

    // Explicit Target (targetTier, targetRankIndex)
    const numericTier = targetTier === null || targetTier === '' ? Number.NaN : Number(targetTier);
    const numericRank = targetRankIndex === null || targetRankIndex === '' ? Number.NaN : Number(targetRankIndex);
    if (!Number.isSafeInteger(numericTier) || numericTier < 0 || !Number.isSafeInteger(numericRank) || numericRank < 0 || numericRank > 106) {
        return {
            error: 'Target tier and rank must be finite, non-negative safe integers within the rank table.',
            code: 'INVALID_TARGET'
        };
    }
    const reqTier = numericTier;
    const reqRankIndex = numericRank;
    const maximumTargetTier = Math.min(Number.MAX_SAFE_INTEGER, curTier + MAX_TARGETED_TIER_ADVANCE);
    if (reqTier > maximumTargetTier) {
        return {
            error: `Target tier cannot be more than ${MAX_TARGETED_TIER_ADVANCE} tiers ahead.`,
            code: 'TARGET_TIER_OUT_OF_RANGE',
            maxTargetedTierAdvance: MAX_TARGETED_TIER_ADVANCE,
            maximumTargetTier
        };
    }

    if (reqTier < curTier || (reqTier === curTier && reqRankIndex <= curRank)) {
        return preview(0, curTier, curRank, true);
    }

    let totalCost = 0;
    if (reqTier === curTier) {
        totalCost = getSliceCost(curRank, reqRankIndex, curTier);
    } else {
        // 1. Finish current tier ranks AND ascend to curTier + 1
        totalCost += getSliceCost(curRank, 106, curTier);
        totalCost += getAscensionCost(curTier, investitureLevel);

        // 2. Middle full tiers (all ranks 0->106 + ascension to next tier)
        for (let t = curTier + 1; t < reqTier; t++) {
            totalCost += getTierCost(t);
        }

        // 3. Final tier ranks (from 0 to reqRankIndex, without ascension)
        totalCost += getSliceCost(0, reqRankIndex, reqTier);
    }

    return preview(totalCost, reqTier, reqRankIndex, availableCash >= totalCost);
}

module.exports = {
    getToolYieldMultiplier,
    getToolCooldownReduction,
    getUnlockedSocketCount,
    getWorkBasePay,
    calculateWorkBonuses,
    getRankUpCost,
    getAscensionCost,
    getSerendipityMultiplier,
    getAmnesiacChance,
    displayItemName,
    BOOSTER_TIERS,
    MAX_TARGETED_TIER_ADVANCE,
    calculateBoosterMultiplier,
    calculateTargetedRankUpCost
};
