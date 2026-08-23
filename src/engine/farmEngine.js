/**
 * @module farmEngine
 * Core game engine module for the Farm feature in Bconomy.
 */

const WATER_REDUCTION_MS = 1800000;     // 30 minutes
const WATER_COOLDOWN_MS = 600000;       // 10 minutes
const MAX_RANDOMIZED_CYCLES = 100000;   // Bound per-cycle random rolls during long offline catch-up
const BERRY_BURST_CHANCE = 0.02;        // 2% double yield

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
        // Compost is intentionally deferred; Pumpkin currently has no special effect.
        description: 'A broad orange field pumpkin with dense, earthy flesh—a dependable harvest valued for its steady, straightforward yield.'
    }
};

const { SELLABLE_ITEMS, BOOSTER_REGISTRY } = require('./shopTables');
const {
    MAX_PLOT_LEVEL,
    normalizePlotLevel,
    getEffectiveGrowTimeMs,
    getGrowTimeReductionPercent,
    buildUpgradePreview,
    buildUpgradePlan,
    buildBulkUpgradePlan
} = require('./farmPlotUpgrade');

const isFiniteTimestamp = value => Number.isFinite(value) && value >= 0;

class FarmEngine {
    /** Normalizes and ensures the farm state exists on playerState. */
    static ensureFarmState(playerState) {
        playerState.inventory = playerState.inventory || {};
        playerState.cooldowns = playerState.cooldowns || { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };

        // Dynamic inventory consolidation: combine duplicate naming entries and restore canonical keys.
        const consolidated = {};
        for (const [key, qty] of Object.entries(playerState.inventory)) {
            if (!qty || qty <= 0) continue;
            let canonicalKey = key.replace(/\s+/g, '');
            if (canonicalKey === 'Bones') canonicalKey = 'OldBones';
            if (canonicalKey === 'Steak') canonicalKey = 'PrimeSteak';
            if (canonicalKey === 'Urn') canonicalKey = 'RitualUrn';
            if (canonicalKey === 'Mushroom') canonicalKey = 'RedMushroom';

            const matchKey = Object.keys(SELLABLE_ITEMS).find(k => k.replace(/\s+/g, '') === canonicalKey)
                || (BOOSTER_REGISTRY && Object.keys(BOOSTER_REGISTRY).find(k => k.replace(/\s+/g, '') === canonicalKey))
                || canonicalKey;
            consolidated[matchKey] = (consolidated[matchKey] || 0) + qty;
        }
        playerState.inventory = consolidated;

        playerState.perks = playerState.perks || {};
        if (typeof playerState.perks.water_byproducts !== 'number') playerState.perks.water_byproducts = 0;

        playerState.farm = playerState.farm || {};
        playerState.farm.waterAvailableAt = typeof playerState.farm.waterAvailableAt === 'number'
            ? playerState.farm.waterAvailableAt
            : 0;
        playerState.farm.storage = playerState.farm.storage || {};
        playerState.farm.plots = Array.isArray(playerState.farm.plots) ? playerState.farm.plots : [];

        for (const cropName of Object.keys(CROP_DEFINITIONS)) {
            if (typeof playerState.farm.storage[cropName] !== 'number' || isNaN(playerState.farm.storage[cropName])) {
                playerState.farm.storage[cropName] = 0;
            }
        }
        if (playerState.farm.plots.length === 0) playerState.farm.plots.push(this.createEmptyPlot(1));

        for (const plot of playerState.farm.plots) {
            plot.level = normalizePlotLevel(plot.level);
            delete plot.composted;
            delete plot.watered;

            if (!plot.crop || !CROP_DEFINITIONS[plot.crop]) {
                plot.crop = null;
                plot.plantedAt = 0;
                plot.nextHarvestAt = 0;
                continue;
            }

            const duration = this.getPlotGrowTimeMs(plot);
            if (!isFiniteTimestamp(plot.plantedAt) || plot.plantedAt <= 0) {
                plot.plantedAt = isFiniteTimestamp(plot.nextHarvestAt) && plot.nextHarvestAt > 0
                    ? Math.max(0, plot.nextHarvestAt - duration)
                    : Date.now();
            }
            if (!isFiniteTimestamp(plot.nextHarvestAt) || plot.nextHarvestAt <= 0) {
                plot.nextHarvestAt = plot.plantedAt + duration;
            }
        }

        const existingPlotIds = new Set(playerState.farm.plots
            .map(plot => plot.id)
            .filter(id => Number.isSafeInteger(id) && id > 0));
        const markedPlotIds = Array.isArray(playerState.farm.markedPlotIds)
            ? playerState.farm.markedPlotIds
            : [];
        playerState.farm.markedPlotIds = [...new Set(markedPlotIds
            .filter(id => Number.isSafeInteger(id) && existingPlotIds.has(id)))]
            .sort((a, b) => a - b);

        return playerState.farm;
    }

    static createEmptyPlot(id) {
        return { id, level: 0, crop: null, plantedAt: 0, nextHarvestAt: 0 };
    }

    static getPlotGrowTimeMs(plot) {
        const crop = plot && CROP_DEFINITIONS[plot.crop];
        return crop ? getEffectiveGrowTimeMs(crop.growTimeMs, plot.level) : 0;
    }

    static getPlotStats(plot) {
        const level = normalizePlotLevel(plot && plot.level);
        const crop = plot && CROP_DEFINITIONS[plot.crop];
        return {
            level,
            reductionPercent: getGrowTimeReductionPercent(level),
            maximumLevelReached: level >= MAX_PLOT_LEVEL,
            crop: crop ? crop.name : null,
            baseYield: crop ? crop.baseYield : 0,
            baseGrowTimeMs: crop ? crop.growTimeMs : 0,
            effectiveGrowTimeMs: crop ? getEffectiveGrowTimeMs(crop.growTimeMs, level) : 0
        };
    }

    /** Awards cycles through the shared offline, upgrade, and watering calculation. */
    static awardHarvestCycles(playerState, plot, completedCycles, rng = Math.random, options = {}) {
        const crop = CROP_DEFINITIONS[plot.crop];
        const cycles = Math.max(0, Math.floor(completedCycles));
        if (!crop || cycles === 0) {
            return { completedCycles: 0, harvestYield: 0, byproducts: { Weeds: 0, RedMushroom: 0 } };
        }

        const waterAccelerated = options.waterAccelerated === true;
        const perkLevel = (playerState.perks && playerState.perks.water_byproducts) || 0;
        const waterMultiplier = waterAccelerated ? 1 + (perkLevel * 0.15) : 1;
        const perCycleYield = crop.baseYield * waterMultiplier;
        let harvestYield = perCycleYield * cycles;

        if (crop.name === 'Blueberry') {
            const randomizedCycles = Math.min(cycles, MAX_RANDOMIZED_CYCLES);
            for (let i = 0; i < randomizedCycles; i++) {
                if (rng() < BERRY_BURST_CHANCE) harvestYield += perCycleYield;
            }
            if (cycles > MAX_RANDOMIZED_CYCLES) {
                const overflowCycles = cycles - MAX_RANDOMIZED_CYCLES;
                harvestYield += overflowCycles * BERRY_BURST_CHANCE * perCycleYield;
            }
        }
        harvestYield = Math.round(harvestYield);

        playerState.farm.storage[crop.name] = (playerState.farm.storage[crop.name] || 0) + harvestYield;
        const byproducts = { Weeds: 0, RedMushroom: 0 };
        if (waterAccelerated) {
            byproducts.Weeds = Math.round(2 * waterMultiplier * cycles);
            byproducts.RedMushroom = Math.round(1 * waterMultiplier * cycles);
            playerState.inventory.Weeds = (playerState.inventory.Weeds || 0) + byproducts.Weeds;
            playerState.inventory.RedMushroom = (playerState.inventory.RedMushroom || 0) + byproducts.RedMushroom;
        }

        return { completedCycles: cycles, harvestYield, byproducts };
    }

    static processPlot(playerState, plot, currentTime = Date.now(), rng = Math.random, options = {}) {
        if (!plot.crop || !CROP_DEFINITIONS[plot.crop]) {
            return { completedCycles: 0, harvestYield: 0, byproducts: { Weeds: 0, RedMushroom: 0 } };
        }
        const duration = this.getPlotGrowTimeMs(plot);
        if (currentTime < plot.nextHarvestAt) {
            return { completedCycles: 0, harvestYield: 0, byproducts: { Weeds: 0, RedMushroom: 0 } };
        }

        const completedCycles = 1 + Math.floor((currentTime - plot.nextHarvestAt) / duration);
        const result = this.awardHarvestCycles(playerState, plot, completedCycles, rng, options);
        plot.nextHarvestAt += completedCycles * duration;
        plot.plantedAt = plot.nextHarvestAt - duration;
        return result;
    }

    /** Offline catch-up processing for all farm plots. */
    static processFarmState(playerState, currentTime = Date.now(), rng = Math.random) {
        this.ensureFarmState(playerState);
        for (const plot of playerState.farm.plots) this.processPlot(playerState, plot, currentTime, rng);
        return playerState.farm;
    }

    static plantCrop(playerState, plotId, cropName, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const plot = playerState.farm.plots.find(p => p.id === plotId);
        if (!plot) return { error: 'Invalid plot ID' };
        if (!CROP_DEFINITIONS[cropName]) return { error: `Invalid crop type '${cropName}'` };
        if (plot.crop) return { error: 'Plot is already occupied' };

        plot.crop = cropName;
        plot.plantedAt = currentTime;
        plot.nextHarvestAt = currentTime + this.getPlotGrowTimeMs(plot);
        return { success: true, plot, stats: this.getPlotStats(plot) };
    }

    /** Plants a crop on all empty plots for free. */
    static plantAllPlots(playerState, cropName, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        if (!CROP_DEFINITIONS[cropName]) return { error: `Invalid crop type '${cropName}'` };

        const emptyPlots = playerState.farm.plots.filter(p => !p.crop);
        if (emptyPlots.length === 0) return { error: 'No empty plots available to plant' };
        for (const plot of emptyPlots) {
            plot.crop = cropName;
            plot.plantedAt = currentTime;
            plot.nextHarvestAt = currentTime + this.getPlotGrowTimeMs(plot);
        }
        return { success: true, plantedCount: emptyPlots.length, cropName, plots: playerState.farm.plots };
    }

    /** Discards the active crop on one plot without a seed or crop refund. */
    static uprootPlot(playerState, plotId, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const plot = playerState.farm.plots.find(p => p.id === plotId);
        if (!plot) return { error: 'Invalid plot ID' };
        if (!plot.crop) return { error: 'Plot is already empty' };

        const uprootedCrop = plot.crop;
        plot.crop = null;
        plot.plantedAt = 0;
        plot.nextHarvestAt = 0;
        return { success: true, uprootedCrop, plot };
    }

    /** Discards every planted instance of the selected crop, including ready plots. */
    static uprootSameCrop(playerState, cropName, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        if (!CROP_DEFINITIONS[cropName]) return { error: `Invalid crop type '${cropName}'` };

        const matchingPlots = playerState.farm.plots.filter(plot => plot.crop === cropName);
        if (matchingPlots.length === 0) return { error: `No active ${cropName} crops to uproot` };
        for (const plot of matchingPlots) {
            plot.crop = null;
            plot.plantedAt = 0;
            plot.nextHarvestAt = 0;
        }
        return { success: true, uprootedCrop: cropName, uprootedCount: matchingPlots.length };
    }

    /** Adds a new Level 0 plot for free. */
    static addPlot(playerState, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;
        const nextId = farm.plots.length > 0 ? Math.max(...farm.plots.map(p => p.id)) + 1 : 1;
        const newPlot = this.createEmptyPlot(nextId);
        farm.plots.push(newPlot);
        return { success: true, plot: newPlot, totalPlots: farm.plots.length };
    }

    static previewPlotUpgrade(playerState, plotId, mode = 'next', currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const plot = playerState.farm.plots.find(p => p.id === plotId);
        if (!plot) return { error: 'Invalid plot ID' };
        return {
            success: true,
            plotId,
            plot: { ...plot },
            stats: this.getPlotStats(plot),
            preview: buildUpgradePreview(plot.level, playerState.inventory, mode)
        };
    }

    /** Resolves and validates an all-plots or explicit bulk target without mutating state. */
    static resolveBulkUpgradeTargets(playerState, scope = 'all', plotIds) {
        const plots = playerState && playerState.farm && playerState.farm.plots;
        if (!Array.isArray(plots) || plots.length === 0) return { error: 'No farm plots are available' };
        if (scope !== 'all' && scope !== 'selected') {
            return { error: "Bulk plot scope must be 'all' or 'selected'" };
        }

        const plotMap = new Map();
        for (const plot of plots) {
            if (!plot || !Number.isSafeInteger(plot.id) || plot.id <= 0 || plotMap.has(plot.id)) {
                return { error: 'Farm plots must have unique positive integer IDs' };
            }
            plotMap.set(plot.id, plot);
        }

        let requestedPlotIds;
        if (scope === 'all') {
            requestedPlotIds = [...plotMap.keys()].sort((a, b) => a - b);
        } else {
            if (!Array.isArray(plotIds) || plotIds.length === 0) {
                return { error: 'Select at least one farm plot to upgrade' };
            }
            for (const plotId of plotIds) {
                if (!Number.isSafeInteger(plotId) || plotId <= 0) {
                    return { error: 'Selected plot IDs must be positive safe integers' };
                }
            }
            requestedPlotIds = [...new Set(plotIds)].sort((a, b) => a - b);
            const unavailable = requestedPlotIds.filter(plotId => !plotMap.has(plotId));
            if (unavailable.length > 0) {
                return { error: `Unavailable plot ID${unavailable.length === 1 ? '' : 's'}: ${unavailable.join(', ')}` };
            }
        }

        return {
            requestedPlotIds,
            targets: requestedPlotIds.map(plotId => ({
                id: plotId,
                level: normalizePlotLevel(plotMap.get(plotId).level)
            }))
        };
    }

    /** Builds a non-consuming, server-authoritative plan for a bulk plot upgrade. */
    static previewBulkPlotUpgrade(playerState, scope = 'all', plotIds, mode = 'next') {
        if (mode !== 'next' && mode !== 'max') {
            return { error: "Bulk plot upgrade mode must be 'next' or 'max'" };
        }
        const resolved = this.resolveBulkUpgradeTargets(playerState, scope, plotIds);
        if (resolved.error) return resolved;
        const plan = buildBulkUpgradePlan(resolved.targets, playerState.inventory || {}, mode);
        if (!plan.valid) return { error: plan.error };
        return { success: true, scope, ...plan };
    }

    /** Recomputes and atomically applies the affordable balanced bulk upgrade plan. */
    static upgradePlotsBulk(playerState, scope = 'all', plotIds, mode = 'next', currentTime = Date.now(), rng = Math.random) {
        const initialPlan = this.previewBulkPlotUpgrade(playerState, scope, plotIds, mode);
        if (initialPlan.error) return initialPlan;
        if (!initialPlan.canUpgrade) return { error: 'No selected plot can be upgraded with the current materials', preview: initialPlan };

        this.processFarmState(playerState, currentTime, rng);
        const plan = this.previewBulkPlotUpgrade(playerState, scope, plotIds, mode);
        if (plan.error) return plan;
        if (!plan.canUpgrade) return { error: 'Farm state changed before execution; no planned upgrade remains affordable', preview: plan };

        for (const [item, quantity] of Object.entries(plan.consumedMaterials)) {
            const owned = Number(playerState.inventory[item] || 0);
            if (!Number.isSafeInteger(owned) || owned < quantity) {
                return { error: `Farm state changed before execution; insufficient ${item}`, preview: plan };
            }
        }
        for (const [item, quantity] of Object.entries(plan.consumedMaterials)) {
            playerState.inventory[item] -= quantity;
            if (playerState.inventory[item] === 0) delete playerState.inventory[item];
        }

        let totalCatchUpCycles = 0;
        let totalCatchUpYield = 0;
        const catchUpByproducts = { Weeds: 0, RedMushroom: 0 };
        const executedPlotResults = [];
        for (const planned of plan.plotResults) {
            const plot = playerState.farm.plots.find(candidate => candidate.id === planned.plotId);
            let catchUp = { completedCycles: 0, harvestYield: 0, byproducts: { Weeds: 0, RedMushroom: 0 } };
            if (planned.levelsGained > 0) {
                plot.level = planned.targetLevel;
                if (plot.crop) {
                    plot.nextHarvestAt = plot.plantedAt + this.getPlotGrowTimeMs(plot);
                    catchUp = this.processPlot(playerState, plot, currentTime, rng);
                }
            }
            totalCatchUpCycles += catchUp.completedCycles;
            totalCatchUpYield += catchUp.harvestYield;
            catchUpByproducts.Weeds += catchUp.byproducts.Weeds;
            catchUpByproducts.RedMushroom += catchUp.byproducts.RedMushroom;
            executedPlotResults.push({
                ...planned,
                catchUpCycles: catchUp.completedCycles,
                catchUpYield: catchUp.harvestYield,
                stats: this.getPlotStats(plot)
            });
        }

        return {
            ...plan,
            success: true,
            plotResults: executedPlotResults,
            totalCatchUpCycles,
            totalCatchUpYield,
            catchUpByproducts
        };
    }

    /** Upgrades one level or consumes the affordable sequential prefix toward Level 16. */
    static upgradePlot(playerState, plotId, mode = 'next', currentTime = Date.now(), rng = Math.random) {
        this.processFarmState(playerState, currentTime, rng);
        const plot = playerState.farm.plots.find(p => p.id === plotId);
        if (!plot) return { error: 'Invalid plot ID' };

        const normalizedMode = mode === 'max' ? 'max' : 'next';
        const plan = buildUpgradePlan(plot.level, playerState.inventory, normalizedMode);
        if (!plan.valid) {
            return { error: plan.error, missingMaterials: plan.missingMaterials, requirements: plan.requirements };
        }

        for (const [item, quantity] of Object.entries(plan.cumulativeCost)) {
            const owned = Number(playerState.inventory[item] || 0);
            if (!Number.isSafeInteger(owned) || owned < quantity) {
                return { error: `Inventory changed before upgrade; insufficient ${item}` };
            }
        }
        for (const [item, quantity] of Object.entries(plan.cumulativeCost)) {
            playerState.inventory[item] -= quantity;
            if (playerState.inventory[item] === 0) delete playerState.inventory[item];
        }

        const previousLevel = plot.level;
        plot.level = plan.targetLevel;
        let catchUp = { completedCycles: 0, harvestYield: 0, byproducts: { Weeds: 0, RedMushroom: 0 } };
        if (plot.crop) {
            plot.nextHarvestAt = plot.plantedAt + this.getPlotGrowTimeMs(plot);
            catchUp = this.processPlot(playerState, plot, currentTime, rng);
        }

        return {
            success: true,
            plot,
            previousLevel,
            level: plot.level,
            levelsGained: plot.level - previousLevel,
            consumedMaterials: plan.cumulativeCost,
            catchUpCycles: catchUp.completedCycles,
            catchUpYield: catchUp.harvestYield,
            stats: this.getPlotStats(plot)
        };
    }

    /** Advances all active plots by exactly 30 minutes and preserves partial-cycle remainder. */
    static waterAllPlots(playerState, currentTime = Date.now(), rng = Math.random) {
        this.processFarmState(playerState, currentTime, rng);
        const farm = playerState.farm;
        if (currentTime < farm.waterAvailableAt) {
            return { error: 'Watering is on global cooldown', remainingTime: farm.waterAvailableAt - currentTime };
        }

        const waterablePlots = farm.plots.filter(plot => plot.crop && CROP_DEFINITIONS[plot.crop]);
        if (waterablePlots.length === 0) return { error: 'No active crops need watering' };

        let totalHarvested = 0;
        let acceleratedCycles = 0;
        const byproducts = { Weeds: 0, RedMushroom: 0 };
        const plotResults = [];
        for (const plot of waterablePlots) {
            plot.plantedAt -= WATER_REDUCTION_MS;
            plot.nextHarvestAt -= WATER_REDUCTION_MS;
            const result = this.processPlot(playerState, plot, currentTime, rng, { waterAccelerated: true });
            totalHarvested += result.harvestYield;
            acceleratedCycles += result.completedCycles;
            byproducts.Weeds += result.byproducts.Weeds;
            byproducts.RedMushroom += result.byproducts.RedMushroom;
            plotResults.push({
                plotId: plot.id,
                crop: plot.crop,
                completedCycles: result.completedCycles,
                harvestYield: result.harvestYield,
                nextHarvestAt: plot.nextHarvestAt
            });
        }

        farm.waterAvailableAt = currentTime + WATER_COOLDOWN_MS;
        const perkLevel = (playerState.perks && playerState.perks.water_byproducts) || 0;
        return {
            success: true,
            wateredCount: waterablePlots.length,
            acceleratedCycles,
            totalHarvested,
            waterAvailableAt: farm.waterAvailableAt,
            byproducts,
            plotResults,
            waterYieldBonusPercent: Math.round(perkLevel * 15)
        };
    }

    /** Claims stored crops from Farm Storage into player inventory. */
    static claimCrops(playerState, cropType = 'all', currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;
        const claimed = {};
        let totalClaimedCount = 0;
        const cropsToClaim = cropType === 'all'
            ? Object.keys(farm.storage)
            : (CROP_DEFINITIONS[cropType] ? [cropType] : []);
        if (cropsToClaim.length === 0) return { error: 'Invalid crop type selected for claim' };

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
            return { success: true, claimed: {}, totalClaimedCount: 0, message: 'No stored crops available to claim' };
        }

        let cashBonus = 0;
        if (claimed['Golden Wheat'] > 0) {
            cashBonus = claimed['Golden Wheat'] * 10000;
            playerState.cash = (playerState.cash || 0) + cashBonus;
        }

        let caffeineTriggered = false;
        let cooldownReductionMs = 0;
        if (claimed.Coffee > 0) {
            caffeineTriggered = true;
            const activeCoffeePlots = farm.plots.filter(plot => plot.crop === 'Coffee').length;
            cooldownReductionMs = Math.min(activeCoffeePlots, 120) * 1000;
            for (const action of ['work', 'mine', 'explore', 'hunt', 'fish']) {
                const currentCooldown = playerState.cooldowns[action] || 0;
                playerState.cooldowns[action] = Math.max(currentTime, currentCooldown - cooldownReductionMs);
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

    /** Consumes 1 Melon to reset the global watering cooldown. */
    static useMelon(playerState, currentTime = Date.now()) {
        this.processFarmState(playerState, currentTime);
        const farm = playerState.farm;
        if (farm.waterAvailableAt <= currentTime) return { error: 'The watering cooldown is already available' };

        const isLocked = Array.isArray(playerState.lockedItems) && playerState.lockedItems.includes('Melon');
        const inventoryMelons = isLocked ? 0 : (playerState.inventory.Melon || 0);
        const storageMelons = farm.storage.Melon || 0;
        if (inventoryMelons < 1 && storageMelons < 1) {
            if (isLocked && (playerState.inventory.Melon || 0) >= 1) {
                return { error: 'Melon is locked and cannot be used. Unlock it first.' };
            }
            return { error: 'You do not have any Melons in your inventory or farm storage' };
        }

        if (inventoryMelons >= 1) playerState.inventory.Melon -= 1;
        else farm.storage.Melon -= 1;
        farm.waterAvailableAt = 0;
        return {
            success: true,
            remainingMelons: (playerState.inventory.Melon || 0) + (farm.storage.Melon || 0)
        };
    }
}

module.exports = {
    FarmEngine,
    CROP_DEFINITIONS,
    WATER_REDUCTION_MS,
    WATER_COOLDOWN_MS
};
