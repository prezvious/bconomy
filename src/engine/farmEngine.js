/**
 * @module farmEngine
 * Core game engine module for the Farm feature in Bconomy.
 */

const WATER_REDUCTION_MS = 1800000;     // 30 minutes
const WATER_COOLDOWN_MS = 600000;       // 10 minutes
const MAX_OFFLINE_ITERATIONS = 100000;  // Max offline catch-up cycles
const BERRY_BURST_CHANCE = 0.02;        // 2% double yield
const COMPOST_MULTIPLIER = 1.70;        // 70% yield boost

const CROP_DEFINITIONS = {
    'Blueberry': {
        name: 'Blueberry',
        growTimeMs: 20000, // 20 seconds
        baseYield: 3,
        description: 'Berry Burst: 2% chance to double yield per harvest.'
    },
    'Golden Wheat': {
        name: 'Golden Wheat',
        growTimeMs: 70000, // 1 min 10 seconds
        baseYield: 5,
        description: 'Golden Pay: Claiming grants +$10,000 cash per wheat item.'
    },
    'Melon': {
        name: 'Melon',
        growTimeMs: 900000, // 15 minutes
        baseYield: 5,
        description: 'Hydration: Consuming 1 Melon resets global water cooldown.'
    },
    'Coffee': {
        name: 'Coffee',
        growTimeMs: 300000, // 5 minutes
        baseYield: 2,
        description: 'Caffeine: Claiming Coffee reduces all action cooldowns by min(Coffee plots, 120) seconds.'
    },
    'Pumpkin': {
        name: 'Pumpkin',
        growTimeMs: 1800000, // 30 minutes
        baseYield: 1,
        description: 'Compost: Apply 1 Pumpkin to boost a plot\'s next harvest yield by +70%.'
    }
};

class FarmEngine {
    /**
     * Normalizes and ensures the farm state exists on playerState.
     */
    static ensureFarmState(playerState) {
        playerState.inventory = playerState.inventory || {};
        playerState.cooldowns = playerState.cooldowns || { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };

        // Dynamic inventory consolidation: combine any duplicate naming entries dynamically
        const consolidated = {};
        for (const [key, qty] of Object.entries(playerState.inventory)) {
            if (!qty || qty <= 0) continue;
            const canonicalKey = key.replace(/\s+/g, '');
            consolidated[canonicalKey] = (consolidated[canonicalKey] || 0) + qty;
        }
        playerState.inventory = consolidated;
        
        playerState.farm = playerState.farm || {};
        playerState.farm.waterAvailableAt = typeof playerState.farm.waterAvailableAt === 'number' ? playerState.farm.waterAvailableAt : 0;
        playerState.farm.storage = playerState.farm.storage || {};
        playerState.farm.plots = Array.isArray(playerState.farm.plots) ? playerState.farm.plots : [];

        for (const cropName of Object.keys(CROP_DEFINITIONS)) {
            if (typeof playerState.farm.storage[cropName] !== 'number' || isNaN(playerState.farm.storage[cropName])) {
                playerState.farm.storage[cropName] = 0;
            }
        }

        if (playerState.farm.plots.length === 0) {
            playerState.farm.plots.push(this.createEmptyPlot(1));
        }

        return playerState.farm;
    }

    /**
     * Helper to create a new plot object.
     */
    static createEmptyPlot(id) {
        return {
            id,
            crop: null,
            plantedAt: 0,
            nextHarvestAt: 0,
            composted: false
        };
    }

    /**
     * Offline catch-up processing for all farm plots.
     * @param {Object} playerState 
     * @param {number} currentTime 
     * @param {Function} [rng] - Optional custom random function returning [0, 1)
     */
    static processFarmState(playerState, currentTime = Date.now(), rng = Math.random) {
        this.ensureFarmState(playerState);
        const farm = playerState.farm;

        for (const plot of farm.plots) {
            if (!plot.crop || !CROP_DEFINITIONS[plot.crop]) {
                continue;
            }

            const crop = CROP_DEFINITIONS[plot.crop];
            if (currentTime < plot.nextHarvestAt) {
                continue;
            }

            const timeElapsed = currentTime - plot.nextHarvestAt;
            const completedCycles = 1 + Math.floor(timeElapsed / crop.growTimeMs);

            if (completedCycles <= 0) {
                continue;
            }

            let totalYieldThisProcess = 0;

            // Cycle 1 (First harvest in batch - check compost)
            let cycle1Yield = crop.baseYield;
            if (plot.composted) {
                cycle1Yield = Math.round(cycle1Yield * COMPOST_MULTIPLIER);
                plot.composted = false;
            }

            if (crop.name === 'Blueberry' && rng() < BERRY_BURST_CHANCE) {
                cycle1Yield *= 2;
            }
            totalYieldThisProcess += cycle1Yield;

            // Subsequent cycles (Cycles 2 .. N)
            const remainingCycles = completedCycles - 1;
            if (remainingCycles > 0) {
                if (crop.name === 'Blueberry') {
                    // Process remaining Blueberry harvests with Berry Burst checks
                    const boundedCycles = Math.min(remainingCycles, MAX_OFFLINE_ITERATIONS);
                    let extraYield = 0;
                    for (let i = 0; i < boundedCycles; i++) {
                        let harvest = crop.baseYield;
                        if (rng() < BERRY_BURST_CHANCE) {
                            harvest *= 2;
                        }
                        extraYield += harvest;
                    }
                    if (remainingCycles > boundedCycles) {
                        extraYield += (remainingCycles - boundedCycles) * crop.baseYield;
                    }
                    totalYieldThisProcess += extraYield;
                } else {
                    totalYieldThisProcess += remainingCycles * crop.baseYield;
                }
            }

            // Update storage & nextHarvestAt timestamp
            farm.storage[crop.name] = (farm.storage[crop.name] || 0) + totalYieldThisProcess;
            plot.nextHarvestAt = plot.nextHarvestAt + (completedCycles * crop.growTimeMs);
        }

        return farm;
    }

    /**
     * Plants a crop on a specified plot.
     */
    static plantCrop(playerState, plotId, cropName, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        const plot = farm.plots.find(p => p.id === plotId);
        if (!plot) {
            return { error: 'Invalid plot ID' };
        }

        if (!CROP_DEFINITIONS[cropName]) {
            return { error: `Invalid crop type '${cropName}'` };
        }

        if (plot.crop) {
            return { error: 'Plot is already occupied' };
        }

        const crop = CROP_DEFINITIONS[cropName];
        plot.crop = cropName;
        plot.plantedAt = currentTime;
        plot.nextHarvestAt = currentTime + crop.growTimeMs;
        plot.composted = false;

        return { success: true, plot };
    }

    /**
     * Plants a crop on all empty plots for free.
     */
    static plantAllPlots(playerState, cropName, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        if (!CROP_DEFINITIONS[cropName]) {
            return { error: `Invalid crop type '${cropName}'` };
        }

        const emptyPlots = farm.plots.filter(p => !p.crop);
        if (emptyPlots.length === 0) {
            return { error: 'No empty plots available to plant' };
        }

        const crop = CROP_DEFINITIONS[cropName];
        for (const plot of emptyPlots) {
            plot.crop = cropName;
            plot.plantedAt = currentTime;
            plot.nextHarvestAt = currentTime + crop.growTimeMs;
            plot.composted = false;
        }

        return {
            success: true,
            plantedCount: emptyPlots.length,
            cropName,
            plots: farm.plots
        };
    }

    /**
     * Removes a plant from a specified plot.
     */
    static removePlant(playerState, plotId, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        const plot = farm.plots.find(p => p.id === plotId);
        if (!plot) {
            return { error: 'Invalid plot ID' };
        }

        if (!plot.crop) {
            return { error: 'Plot is already empty' };
        }

        const oldCrop = plot.crop;
        plot.crop = null;
        plot.plantedAt = 0;
        plot.nextHarvestAt = 0;
        plot.composted = false;

        return { success: true, removedCrop: oldCrop, plot };
    }

    /**
     * Adds a new plot to the player's farm for free.
     */
    static addPlot(playerState, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        const nextId = farm.plots.length > 0 ? Math.max(...farm.plots.map(p => p.id)) + 1 : 1;
        const newPlot = this.createEmptyPlot(nextId);
        farm.plots.push(newPlot);

        return { success: true, plot: newPlot, totalPlots: farm.plots.length };
    }

    /**
     * Waters a plant on a specified plot.
     */
    static waterPlot(playerState, plotId, currentTime = Date.now(), rng = Math.random) {
        this.processFarmState(playerState, currentTime, rng);
        const farm = playerState.farm;

        if (currentTime < farm.waterAvailableAt) {
            return { error: 'Watering is on global cooldown', remainingTime: farm.waterAvailableAt - currentTime };
        }

        const plot = farm.plots.find(p => p.id === plotId);
        if (!plot) {
            return { error: 'Invalid plot ID' };
        }

        if (!plot.crop || !CROP_DEFINITIONS[plot.crop]) {
            return { error: 'Plot has no crop planted' };
        }

        if (currentTime >= plot.nextHarvestAt) {
            return { error: 'Plant is already ready for harvest' };
        }

        const crop = CROP_DEFINITIONS[plot.crop];
        const remainingMs = plot.nextHarvestAt - currentTime;

        if (remainingMs <= WATER_REDUCTION_MS) {
            // Generate exactly 1 harvest for this completed cycle
            let harvestYield = crop.baseYield;
            if (plot.composted) {
                harvestYield = Math.round(harvestYield * COMPOST_MULTIPLIER);
                plot.composted = false;
            }
            if (crop.name === 'Blueberry' && rng() < BERRY_BURST_CHANCE) {
                harvestYield *= 2;
            }

            farm.storage[crop.name] = (farm.storage[crop.name] || 0) + harvestYield;
            plot.nextHarvestAt = plot.nextHarvestAt + crop.growTimeMs;
        } else {
            plot.nextHarvestAt -= WATER_REDUCTION_MS;
        }

        // Set global watering cooldown (10 mins)
        farm.waterAvailableAt = currentTime + WATER_COOLDOWN_MS;

        return {
            success: true,
            waterAvailableAt: farm.waterAvailableAt,
            nextHarvestAt: plot.nextHarvestAt
        };
    }

    /**
     * Waters all active farm plots at once.
     */
    static waterAllPlots(playerState, currentTime = Date.now(), rng = Math.random) {
        this.processFarmState(playerState, currentTime, rng);
        const farm = playerState.farm;

        if (currentTime < farm.waterAvailableAt) {
            return { error: 'Watering is on global cooldown', remainingTime: farm.waterAvailableAt - currentTime };
        }

        let wateredCount = 0;
        for (const plot of farm.plots) {
            if (!plot.crop || !CROP_DEFINITIONS[plot.crop]) {
                continue;
            }

            if (currentTime >= plot.nextHarvestAt) {
                continue;
            }

            const crop = CROP_DEFINITIONS[plot.crop];
            const remainingMs = plot.nextHarvestAt - currentTime;

            if (remainingMs <= WATER_REDUCTION_MS) {
                let harvestYield = crop.baseYield;
                if (plot.composted) {
                    harvestYield = Math.round(harvestYield * COMPOST_MULTIPLIER);
                    plot.composted = false;
                }
                if (crop.name === 'Blueberry' && rng() < BERRY_BURST_CHANCE) {
                    harvestYield *= 2;
                }

                farm.storage[crop.name] = (farm.storage[crop.name] || 0) + harvestYield;
                plot.nextHarvestAt = plot.nextHarvestAt + crop.growTimeMs;
            } else {
                plot.nextHarvestAt -= WATER_REDUCTION_MS;
            }

            wateredCount++;
        }

        // Set global watering cooldown (10 mins)
        farm.waterAvailableAt = currentTime + WATER_COOLDOWN_MS;

        return {
            success: true,
            wateredCount,
            waterAvailableAt: farm.waterAvailableAt
        };
    }

    /**
     * Claims stored crops from Farm Storage into player inventory.
     */
    static claimCrops(playerState, cropType = 'all', currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        const claimed = {};
        let totalClaimedCount = 0;

        const cropsToClaim = cropType === 'all' 
            ? Object.keys(farm.storage)
            : (CROP_DEFINITIONS[cropType] ? [cropType] : []);

        if (cropsToClaim.length === 0) {
            return { error: 'Invalid crop type selected for claim' };
        }

        for (const cropName of cropsToClaim) {
            const count = farm.storage[cropName] || 0;
            if (count > 0) {
                claimed[cropName] = count;
                totalClaimedCount += count;
                playerState.inventory[cropName] = (playerState.inventory[cropName] || 0) + count;
                farm.storage[cropName] = 0;
            }
        }

        if (totalClaimedCount === 0) {
            return { success: false, message: 'No stored crops available to claim' };
        }

        // Golden Pay benefit
        let cashBonus = 0;
        if (claimed['Golden Wheat'] && claimed['Golden Wheat'] > 0) {
            cashBonus = claimed['Golden Wheat'] * 10000;
            playerState.cash = (playerState.cash || 0) + cashBonus;
        }

        // Caffeine benefit
        let caffeineTriggered = false;
        let cooldownReductionMs = 0;
        if (claimed['Coffee'] && claimed['Coffee'] > 0) {
            caffeineTriggered = true;
            const activeCoffeePlots = farm.plots.filter(p => p.crop === 'Coffee').length;
            const reductionSeconds = Math.min(activeCoffeePlots, 120);
            cooldownReductionMs = reductionSeconds * 1000;

            const actions = ['work', 'mine', 'explore', 'hunt', 'fish'];
            for (const act of actions) {
                const currentCooldown = playerState.cooldowns[act] || 0;
                playerState.cooldowns[act] = Math.max(currentTime, currentCooldown - cooldownReductionMs);
            }
        }

        return {
            success: true,
            claimed,
            totalClaimedCount,
            cashBonus,
            caffeineTriggered,
            cooldownReductionMs
        };
    }

    /**
     * Consumes 1 Melon from inventory to reset global waterAvailableAt.
     */
    static useMelon(playerState, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        if (farm.waterAvailableAt <= currentTime) {
            return { error: 'The watering cooldown is already available' };
        }

        const melonCount = playerState.inventory['Melon'] || 0;
        if (melonCount < 1) {
            return { error: 'You do not have any Melons in your inventory' };
        }

        playerState.inventory['Melon'] -= 1;
        farm.waterAvailableAt = 0;

        return { success: true, remainingMelons: playerState.inventory['Melon'] };
    }

    /**
     * Consumes 1 Pumpkin from inventory to apply Compost to a plot (+70% yield on next harvest).
     */
    static applyCompost(playerState, plotId, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;

        const plot = farm.plots.find(p => p.id === plotId);
        if (!plot) {
            return { error: 'Invalid plot ID' };
        }

        if (!plot.crop) {
            return { error: 'Plot has no plant to compost' };
        }

        if (plot.composted) {
            return { error: 'Plot is already composted' };
        }

        const pumpkinCount = playerState.inventory['Pumpkin'] || 0;
        if (pumpkinCount < 1) {
            return { error: 'You do not have any Pumpkins in your inventory' };
        }

        playerState.inventory['Pumpkin'] -= 1;
        plot.composted = true;

        return { success: true, plotId, remainingPumpkins: playerState.inventory['Pumpkin'] };
    }
}

module.exports = {
    FarmEngine,
    CROP_DEFINITIONS
};
