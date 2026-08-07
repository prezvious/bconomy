/**
 * @module formulas
 * Contains pure functions for game economy calculations.
 */

/**
 * Calculates the tool yield multiplier based on tool level.
 * @param {number} level - Tool level (1-50)
 * @returns {number} Multiplier (1.0 at L1, 12.0 at L50)
 */
function getToolYieldMultiplier(level) {
    return 1 + 11 * Math.pow((level - 1) / 49, 1.25);
}

/**
 * Gets base pay for working based on rank index.
 * @param {number} rankIndex - Index of the player's rank (0-106)
 * @param {Array} ranks - Array of rank objects
 * @returns {number} Base pay
 */
function getWorkBasePay(rankIndex, ranks) {
    const rank = ranks[rankIndex];
    const rankBasePrice = rank ? rank.basePrice : 10000;
    return rankBasePrice * 0.05 + 5000;
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
function getRankUpCost(rankBasePrice, cronyismLevel = 0, investitureLevel = 0, isGodRank = false) {
    const cronyism = Math.min(25, cronyismLevel || 0);
    let cost = rankBasePrice * (1 - 0.025 * cronyism);
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
 * @returns {number} Multiplier (Level + 2 for rare items if level > 0)
 */
function getSerendipityMultiplier(serendipityLevel, itemDropChancePercent) {
    if (itemDropChancePercent <= 5.0 && serendipityLevel > 0) {
        return serendipityLevel + 2;
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

module.exports = {
    getToolYieldMultiplier,
    getWorkBasePay,
    calculateWorkBonuses,
    getRankUpCost,
    getSerendipityMultiplier,
    getAmnesiacChance,
    displayItemName
};


