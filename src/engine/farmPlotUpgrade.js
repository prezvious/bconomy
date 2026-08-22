/**
 * @module farmPlotUpgrade
 * Canonical plot-level recipes, farm-material metadata, and pure upgrade helpers.
 */

const MAX_PLOT_LEVEL = 16;
const LEVEL_REDUCTION_PER_LEVEL = 0.05;
const MAX_RECIPE_EFFORT_ERROR = 0.034;

const FARM_UPGRADE_MATERIALS = {
    'Gravel': {
        description: 'Washed stone aggregate used to improve drainage and provide firm footing around cultivated plots.',
        dropChance: 20,
        dropStack: [40, 120],
        sellRange: [250, 700],
        buyRange: [500, 1200],
        appearanceChance: 0.90,
        stockRange: [250, 1200],
        icon: 'lucide:mountain'
    },
    'Fence Post': {
        description: 'A pressure-treated timber post for supporting borders, trellises, and protective farm fencing.',
        dropChance: 12,
        dropStack: [4, 12],
        sellRange: [2000, 6000],
        buyRange: [4000, 10000],
        appearanceChance: 0.75,
        stockRange: [25, 120],
        icon: 'lucide:columns-3'
    },
    'Paving Stone': {
        description: 'A durable stone slab that stabilizes paths and keeps foot traffic away from growing soil.',
        dropChance: 8,
        dropStack: [10, 30],
        sellRange: [1000, 3500],
        buyRange: [2500, 6000],
        appearanceChance: 0.70,
        stockRange: [50, 250],
        icon: 'lucide:brick-wall'
    },
    'Treated Board': {
        description: 'Weather-resistant lumber used for raised beds, plot edging, and structural repairs.',
        dropChance: 4,
        dropStack: [2, 5],
        sellRange: [15000, 45000],
        buyRange: [30000, 80000],
        appearanceChance: 0.55,
        stockRange: [10, 50],
        icon: 'lucide:panels-top-left'
    },
    'Granular Fertilizer': {
        description: 'A dry nutrient blend worked into soil to support consistent, vigorous crop growth.',
        dropChance: 4,
        dropStack: [1, 4],
        sellRange: [20000, 60000],
        buyRange: [40000, 100000],
        appearanceChance: 0.50,
        stockRange: [8, 40],
        icon: 'lucide:sprout'
    },
    'Irrigation Tubing': {
        description: 'Flexible water line that distributes moisture evenly across a farm plot.',
        dropChance: 3.5,
        dropStack: [2, 6],
        sellRange: [12000, 40000],
        buyRange: [25000, 75000],
        appearanceChance: 0.50,
        stockRange: [10, 60],
        icon: 'lucide:route'
    },
    'Galvanized Frame': {
        description: 'A rust-resistant steel support for durable plot structures and greenhouse fittings.',
        dropChance: 0.75,
        dropStack: [1, 1],
        sellRange: [1500000, 4000000],
        buyRange: [3000000, 7000000],
        appearanceChance: 0.15,
        stockRange: [1, 4],
        icon: 'lucide:frame'
    },
    'Solar Cell': {
        description: 'A compact photovoltaic unit used to power pumps, sensors, and field controls.',
        dropChance: 1.5,
        dropStack: [1, 2],
        sellRange: [250000, 800000],
        buyRange: [600000, 1400000],
        appearanceChance: 0.25,
        stockRange: [4, 20],
        icon: 'lucide:solar-panel'
    },
    'Frost Blanket': {
        description: 'An insulating crop cover that protects plants and equipment from sudden temperature changes.',
        dropChance: 0.5,
        dropStack: [1, 1],
        sellRange: [800000, 2400000],
        buyRange: [1800000, 4000000],
        appearanceChance: 0.12,
        stockRange: [1, 5],
        icon: 'lucide:snowflake'
    },
    'Brass Valve': {
        description: 'A corrosion-resistant fitting used to control water pressure and irrigation flow.',
        dropChance: 0.5,
        dropStack: [1, 1],
        sellRange: [900000, 2800000],
        buyRange: [2000000, 5000000],
        appearanceChance: 0.12,
        stockRange: [1, 5],
        icon: 'lucide:gauge'
    },
    'Outdoor Cable': {
        description: 'Weatherproof electrical cable rated for pumps and equipment exposed to the elements.',
        dropChance: 1.25,
        dropStack: [2, 8],
        sellRange: [100000, 350000],
        buyRange: [250000, 650000],
        appearanceChance: 0.30,
        stockRange: [10, 60],
        icon: 'lucide:cable'
    },
    'Water Pump': {
        description: 'An agricultural pump that keeps upgraded irrigation moving at a reliable rate.',
        dropChance: 0.2,
        dropStack: [1, 1],
        sellRange: [2500000, 7000000],
        buyRange: [5000000, 12000000],
        appearanceChance: 0.08,
        stockRange: [1, 2],
        icon: 'lucide:circle-gauge'
    }
};

const FARM_PLOT_UPGRADE_RECIPES = {
    1: [
        { item: 'Gravel', quantity: 340 },
        { item: 'Fence Post', quantity: 34 },
        { item: 'Irrigation Tubing', quantity: 2 }
    ],
    2: [
        { item: 'Gravel', quantity: 342 },
        { item: 'Fence Post', quantity: 35 },
        { item: 'Irrigation Tubing', quantity: 2 }
    ],
    3: [
        { item: 'Gravel', quantity: 1930 },
        { item: 'Fence Post', quantity: 193 },
        { item: 'Irrigation Tubing', quantity: 7 }
    ],
    4: [
        { item: 'Gravel', quantity: 5315 },
        { item: 'Fence Post', quantity: 532 },
        { item: 'Irrigation Tubing', quantity: 18 }
    ],
    5: [
        { item: 'Paving Stone', quantity: 142 },
        { item: 'Treated Board', quantity: 12 },
        { item: 'Granular Fertilizer', quantity: 9 },
        { item: 'Irrigation Tubing', quantity: 19 }
    ],
    6: [
        { item: 'Paving Stone', quantity: 248 },
        { item: 'Treated Board', quantity: 21 },
        { item: 'Granular Fertilizer', quantity: 16 },
        { item: 'Irrigation Tubing', quantity: 32 }
    ],
    7: [
        { item: 'Paving Stone', quantity: 391 },
        { item: 'Treated Board', quantity: 32 },
        { item: 'Granular Fertilizer', quantity: 25 },
        { item: 'Irrigation Tubing', quantity: 51 }
    ],
    8: [
        { item: 'Paving Stone', quantity: 574 },
        { item: 'Treated Board', quantity: 47 },
        { item: 'Granular Fertilizer', quantity: 35 },
        { item: 'Irrigation Tubing', quantity: 74 }
    ],
    9: [
        { item: 'Paving Stone', quantity: 802 },
        { item: 'Treated Board', quantity: 65 },
        { item: 'Granular Fertilizer', quantity: 50 },
        { item: 'Irrigation Tubing', quantity: 103 }
    ],
    10: [
        { item: 'Galvanized Frame', quantity: 2 },
        { item: 'Solar Cell', quantity: 16 },
        { item: 'Frost Blanket', quantity: 4 },
        { item: 'Brass Valve', quantity: 4 },
        { item: 'Outdoor Cable', quantity: 44 },
        { item: 'Water Pump', quantity: 2 }
    ],
    11: [
        { item: 'Galvanized Frame', quantity: 2 },
        { item: 'Solar Cell', quantity: 21 },
        { item: 'Frost Blanket', quantity: 5 },
        { item: 'Brass Valve', quantity: 5 },
        { item: 'Outdoor Cable', quantity: 57 },
        { item: 'Water Pump', quantity: 2 }
    ],
    12: [
        { item: 'Galvanized Frame', quantity: 3 },
        { item: 'Solar Cell', quantity: 26 },
        { item: 'Frost Blanket', quantity: 6 },
        { item: 'Brass Valve', quantity: 6 },
        { item: 'Outdoor Cable', quantity: 72 },
        { item: 'Water Pump', quantity: 2 }
    ],
    13: [
        { item: 'Galvanized Frame', quantity: 4 },
        { item: 'Solar Cell', quantity: 33 },
        { item: 'Frost Blanket', quantity: 7 },
        { item: 'Brass Valve', quantity: 7 },
        { item: 'Outdoor Cable', quantity: 89 },
        { item: 'Water Pump', quantity: 3 }
    ],
    14: [
        { item: 'Galvanized Frame', quantity: 4 },
        { item: 'Solar Cell', quantity: 40 },
        { item: 'Frost Blanket', quantity: 9 },
        { item: 'Brass Valve', quantity: 9 },
        { item: 'Outdoor Cable', quantity: 109 },
        { item: 'Water Pump', quantity: 3 }
    ],
    15: [
        { item: 'Galvanized Frame', quantity: 5 },
        { item: 'Solar Cell', quantity: 48 },
        { item: 'Frost Blanket', quantity: 10 },
        { item: 'Brass Valve', quantity: 10 },
        { item: 'Outdoor Cable', quantity: 131 },
        { item: 'Water Pump', quantity: 4 }
    ],
    16: [
        { item: 'Galvanized Frame', quantity: 6 },
        { item: 'Solar Cell', quantity: 57 },
        { item: 'Frost Blanket', quantity: 12 },
        { item: 'Brass Valve', quantity: 12 },
        { item: 'Outdoor Cable', quantity: 155 },
        { item: 'Water Pump', quantity: 5 }
    ]
};

const getTargetUpgradeValue = level => {
    const normalized = normalizePlotLevel(level);
    if (normalized < 1) return 0;
    return 35000 * Math.pow(Math.max(1, normalized - 1), 2.5);
};

const getEffortUnitValue = level => {
    const normalized = normalizePlotLevel(level);
    if (normalized <= 4) return 93;
    if (normalized <= 9) return 6200;
    return 122000;
};

function normalizePlotLevel(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.min(MAX_PLOT_LEVEL, Math.max(0, Math.floor(numeric)));
}

const getGrowTimeReductionPercent = level => normalizePlotLevel(level) * 5;

const getEffectiveGrowTimeMs = (baseGrowTimeMs, level) => {
    const base = Number(baseGrowTimeMs);
    if (!Number.isFinite(base) || base <= 0) return 1;
    const factor = 1 - (normalizePlotLevel(level) * LEVEL_REDUCTION_PER_LEVEL);
    return Math.max(1, Math.round(base * factor));
};

const getUpgradeRecipe = targetLevel => {
    const numeric = Number(targetLevel);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > MAX_PLOT_LEVEL) return null;
    return FARM_PLOT_UPGRADE_RECIPES[numeric].map(requirement => ({ ...requirement }));
};

const getInventoryQuantity = (inventory, item) => {
    const value = inventory && inventory[item] !== undefined ? Number(inventory[item]) : 0;
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
};

const getRecipeBreakdown = (currentLevel, targetLevel, inventory = {}) => {
    const fromLevel = normalizePlotLevel(currentLevel);
    const target = Number(targetLevel);
    if (!Number.isInteger(target) || target <= fromLevel || target > MAX_PLOT_LEVEL) {
        return {
            valid: false,
            error: 'Target plot level must be greater than the current level and no higher than 16',
            currentLevel: fromLevel,
            targetLevel: target,
            cumulativeCost: {},
            levelByLevel: [],
            affordable: false,
            missingMaterials: {}
        };
    }

    const cumulativeCost = {};
    const levelByLevel = [];
    for (let level = fromLevel + 1; level <= target; level++) {
        const requirements = getUpgradeRecipe(level);
        if (!requirements) return { valid: false, error: `Missing plot upgrade recipe for Level ${level}` };
        levelByLevel.push({ level, requirements });
        for (const requirement of requirements) {
            cumulativeCost[requirement.item] = (cumulativeCost[requirement.item] || 0) + requirement.quantity;
        }
    }

    const missingMaterials = {};
    const inventorySnapshot = {};
    for (const [item, quantity] of Object.entries(cumulativeCost)) {
        const owned = getInventoryQuantity(inventory, item);
        if (owned === null) {
            return { valid: false, error: `Inventory quantity for ${item} must be a non-negative safe integer` };
        }
        inventorySnapshot[item] = owned;
        if (owned < quantity) missingMaterials[item] = quantity - owned;
    }

    return {
        valid: true,
        currentLevel: fromLevel,
        targetLevel: target,
        levelsCount: target - fromLevel,
        cumulativeCost,
        levelByLevel,
        inventorySnapshot,
        affordable: Object.keys(missingMaterials).length === 0,
        missingMaterials
    };
};

const getMaxAffordableLevel = (inventory, currentLevel, maxLevel = MAX_PLOT_LEVEL) => {
    const fromLevel = normalizePlotLevel(currentLevel);
    const cap = Math.min(MAX_PLOT_LEVEL, Math.max(fromLevel, normalizePlotLevel(maxLevel)));
    const virtualInventory = { ...(inventory || {}) };
    const cumulativeCost = {};
    let reachedLevel = fromLevel;

    for (let level = fromLevel + 1; level <= cap; level++) {
        const recipe = getUpgradeRecipe(level);
        let affordable = true;
        for (const requirement of recipe) {
            const owned = getInventoryQuantity(virtualInventory, requirement.item);
            if (owned === null) {
                return {
                    valid: false,
                    error: `Inventory quantity for ${requirement.item} must be a non-negative safe integer`,
                    currentLevel: fromLevel,
                    maxAffordableLevel: fromLevel,
                    levelsGained: 0,
                    cumulativeCost: {},
                    canUpgrade: false
                };
            }
            if (owned < requirement.quantity) {
                affordable = false;
                break;
            }
        }
        if (!affordable) break;

        for (const requirement of recipe) {
            virtualInventory[requirement.item] = getInventoryQuantity(virtualInventory, requirement.item) - requirement.quantity;
            cumulativeCost[requirement.item] = (cumulativeCost[requirement.item] || 0) + requirement.quantity;
        }
        reachedLevel = level;
    }

    return {
        valid: true,
        currentLevel: fromLevel,
        maxAffordableLevel: reachedLevel,
        levelsGained: reachedLevel - fromLevel,
        cumulativeCost,
        canUpgrade: reachedLevel > fromLevel
    };
};

const buildUpgradePreview = (currentLevel, inventory = {}, mode = 'next') => {
    const level = normalizePlotLevel(currentLevel);
    const normalizedMode = mode === 'max' ? 'max' : 'next';
    if (level >= MAX_PLOT_LEVEL) {
        return {
            valid: true,
            mode: normalizedMode,
            currentLevel: level,
            targetLevel: level,
            maxAffordableLevel: level,
            canUpgrade: false,
            maximumLevelReached: true,
            requirements: {},
            missingMaterials: {}
        };
    }

    const maxAffordable = getMaxAffordableLevel(inventory, level);
    if (!maxAffordable.valid) return maxAffordable;
    const displayedTarget = normalizedMode === 'max' ? MAX_PLOT_LEVEL : level + 1;
    const displayed = getRecipeBreakdown(level, displayedTarget, inventory);
    if (!displayed.valid) return displayed;

    return {
        valid: true,
        mode: normalizedMode,
        currentLevel: level,
        targetLevel: displayedTarget,
        maxAffordableLevel: maxAffordable.maxAffordableLevel,
        canUpgrade: normalizedMode === 'max' ? maxAffordable.canUpgrade : displayed.affordable,
        maximumLevelReached: false,
        requirements: displayed.cumulativeCost,
        inventory: displayed.inventorySnapshot,
        affordable: displayed.affordable,
        missingMaterials: displayed.missingMaterials,
        levels: displayed.levelByLevel,
        affordableCost: maxAffordable.cumulativeCost
    };
};

const buildUpgradePlan = (currentLevel, inventory = {}, mode = 'next') => {
    const level = normalizePlotLevel(currentLevel);
    if (level >= MAX_PLOT_LEVEL) return { valid: false, error: 'Plot is already at maximum level (16)' };

    let targetLevel = level + 1;
    if (mode === 'max') {
        const maxAffordable = getMaxAffordableLevel(inventory, level);
        if (!maxAffordable.valid) return maxAffordable;
        if (!maxAffordable.canUpgrade) {
            const next = getRecipeBreakdown(level, level + 1, inventory);
            return {
                valid: false,
                error: 'Insufficient materials for the next plot upgrade',
                missingMaterials: next.missingMaterials,
                requirements: next.cumulativeCost
            };
        }
        targetLevel = maxAffordable.maxAffordableLevel;
    }

    const breakdown = getRecipeBreakdown(level, targetLevel, inventory);
    if (!breakdown.valid) return breakdown;
    if (!breakdown.affordable) {
        return {
            valid: false,
            error: 'Insufficient materials for the next plot upgrade',
            missingMaterials: breakdown.missingMaterials,
            requirements: breakdown.cumulativeCost
        };
    }
    return { valid: true, ...breakdown };
};

/**
 * Builds a deterministic, non-mutating upgrade plan across multiple plots.
 * Each pass visits the lowest projected level first, breaking ties by plot ID.
 */
const buildBulkUpgradePlan = (plots, inventory = {}, mode = 'next') => {
    if (!Array.isArray(plots) || plots.length === 0) {
        return { valid: false, error: 'Select at least one farm plot to upgrade' };
    }
    if (mode !== 'next' && mode !== 'max') {
        return { valid: false, error: "Bulk plot upgrade mode must be 'next' or 'max'" };
    }

    const uniquePlots = new Map();
    for (const candidate of plots) {
        const id = candidate && candidate.id;
        const level = candidate && candidate.level;
        if (!Number.isSafeInteger(id) || id <= 0) {
            return { valid: false, error: 'Every bulk upgrade plot ID must be a positive safe integer' };
        }
        if (!Number.isInteger(level) || level < 0 || level > MAX_PLOT_LEVEL) {
            return { valid: false, error: `Plot #${id} has an invalid level` };
        }
        if (!uniquePlots.has(id)) uniquePlots.set(id, { id, level });
    }

    const requested = [...uniquePlots.values()].sort((a, b) => a.id - b.id);
    const results = requested.map(plot => ({
        plotId: plot.id,
        previousLevel: plot.level,
        targetLevel: plot.level,
        levelsGained: 0,
        status: plot.level >= MAX_PLOT_LEVEL ? 'maximum-level' : 'pending'
    }));
    const virtualInventory = { ...(inventory || {}) };
    const consumedMaterials = {};

    const canAffordRecipe = recipe => {
        for (const requirement of recipe) {
            const owned = getInventoryQuantity(virtualInventory, requirement.item);
            if (owned === null) {
                return { valid: false, error: `Inventory quantity for ${requirement.item} must be a non-negative safe integer` };
            }
            if (owned < requirement.quantity) return { valid: true, affordable: false };
        }
        return { valid: true, affordable: true };
    };

    let totalLevelsGained = 0;
    while (true) {
        const candidates = results
            .filter(result => result.targetLevel < MAX_PLOT_LEVEL && (mode === 'max' || result.levelsGained === 0))
            .sort((a, b) => a.targetLevel - b.targetLevel || a.plotId - b.plotId);
        if (candidates.length === 0) break;

        let upgradedCandidate = false;
        for (const result of candidates) {
            const recipe = getUpgradeRecipe(result.targetLevel + 1);
            const affordability = canAffordRecipe(recipe);
            if (!affordability.valid) return affordability;
            if (!affordability.affordable) continue;

            for (const requirement of recipe) {
                virtualInventory[requirement.item] = getInventoryQuantity(virtualInventory, requirement.item) - requirement.quantity;
                consumedMaterials[requirement.item] = (consumedMaterials[requirement.item] || 0) + requirement.quantity;
            }
            result.targetLevel += 1;
            result.levelsGained += 1;
            result.status = 'upgraded';
            totalLevelsGained += 1;
            upgradedCandidate = true;
            break;
        }

        if (!upgradedCandidate) break;
    }

    for (const result of results) {
        if (result.status === 'pending') result.status = 'insufficient-materials';
    }

    const materialTotals = {};
    for (const [item, required] of Object.entries(consumedMaterials)) {
        const owned = getInventoryQuantity(inventory, item);
        if (owned === null) {
            return { valid: false, error: `Inventory quantity for ${item} must be a non-negative safe integer` };
        }
        materialTotals[item] = { owned, required, remaining: owned - required };
    }

    const skippedPlots = results
        .filter(result => result.levelsGained === 0)
        .map(result => ({ plotId: result.plotId, reason: result.status }));

    return {
        valid: true,
        mode,
        canUpgrade: totalLevelsGained > 0,
        requestedPlotIds: results.map(result => result.plotId),
        eligiblePlotIds: results.filter(result => result.previousLevel < MAX_PLOT_LEVEL).map(result => result.plotId),
        plotResults: results,
        skippedPlots,
        upgradedPlotCount: results.filter(result => result.levelsGained > 0).length,
        maxedPlotCount: results.filter(result => result.previousLevel >= MAX_PLOT_LEVEL).length,
        totalLevelsGained,
        consumedMaterials,
        materialTotals
    };
};

const getRecipeEffortSummary = targetLevel => {
    const level = normalizePlotLevel(targetLevel);
    const recipe = getUpgradeRecipe(level);
    if (!recipe) return null;
    const totalQuantity = recipe.reduce((sum, requirement) => sum + requirement.quantity, 0);
    const targetValue = getTargetUpgradeValue(level);
    const normalizedEffort = totalQuantity * getEffortUnitValue(level);
    const relativeError = targetValue > 0 ? Math.abs(normalizedEffort - targetValue) / targetValue : 0;
    return { level, totalQuantity, targetValue, normalizedEffort, relativeError };
};

module.exports = {
    MAX_PLOT_LEVEL,
    LEVEL_REDUCTION_PER_LEVEL,
    MAX_RECIPE_EFFORT_ERROR,
    FARM_UPGRADE_MATERIALS,
    FARM_PLOT_UPGRADE_RECIPES,
    normalizePlotLevel,
    getGrowTimeReductionPercent,
    getEffectiveGrowTimeMs,
    getTargetUpgradeValue,
    getEffortUnitValue,
    getUpgradeRecipe,
    getRecipeBreakdown,
    getMaxAffordableLevel,
    buildUpgradePreview,
    buildUpgradePlan,
    buildBulkUpgradePlan,
    getRecipeEffortSummary
};
