'use strict';

const { PERK_DEFINITIONS } = require('./dropTables');

const GOAL_PERKS = Object.freeze({
    career: Object.freeze(['cronyism', 'investiture']),
    actions: Object.freeze(['partiality', 'serendipity', 'amnesiac']),
    farming: Object.freeze(['water_byproducts']),
    gambling: Object.freeze(['numismatist', 'jackpot_fever'])
});
const GOAL_ORDER = Object.freeze(Object.keys(GOAL_PERKS));
const PERK_ORDER = Object.freeze(GOAL_ORDER.flatMap(goal => GOAL_PERKS[goal]));

const clampWeight = value => Math.min(100, Math.max(0, Number(value) || 0));

function effectValue(perkId, level) {
    const safeLevel = Math.max(0, Math.floor(Number(level) || 0));
    if (perkId === 'cronyism' || perkId === 'investiture') return safeLevel * 0.025;
    if (perkId === 'partiality') {
        const totalChance = 0.30 + (0.15 * safeLevel);
        const guaranteed = Math.floor(totalChance);
        const remainder = totalChance - guaranteed;
        return Math.pow(3, guaranteed) * (1 + (2 * remainder));
    }
    if (perkId === 'serendipity') return safeLevel > 0 ? safeLevel + 1 : 1;
    if (perkId === 'amnesiac') return safeLevel * 0.02;
    if (perkId === 'water_byproducts') return 1 + (safeLevel * 0.15);
    if (perkId === 'numismatist') return 1_000_000_000 + (safeLevel * 5_000_000_000);
    if (perkId === 'jackpot_fever') return 1 + (safeLevel * 0.05);
    return 0;
}

function normalizedEffect(perkId, level) {
    const definition = PERK_DEFINITIONS[perkId];
    if (!definition || !definition.maxLevel) return 0;
    const base = effectValue(perkId, 0);
    const maximum = effectValue(perkId, definition.maxLevel);
    if (maximum === base) return 0;
    return Math.min(1, Math.max(0, (effectValue(perkId, level) - base) / (maximum - base)));
}

function normalizeWeights(goalWeights = {}, perkWeights = {}) {
    const rawGoals = Object.fromEntries(GOAL_ORDER.map(goal => [goal, clampWeight(goalWeights[goal])]));
    let goalTotal = Object.values(rawGoals).reduce((sum, value) => sum + value, 0);
    if (goalTotal === 0) {
        for (const goal of GOAL_ORDER) rawGoals[goal] = 25;
        goalTotal = 100;
    }
    const goals = Object.fromEntries(GOAL_ORDER.map(goal => [goal, rawGoals[goal] / goalTotal]));
    const perks = {};
    for (const goal of GOAL_ORDER) {
        const ids = GOAL_PERKS[goal];
        const raw = Object.fromEntries(ids.map(id => [id, clampWeight(perkWeights[id])]));
        let total = Object.values(raw).reduce((sum, value) => sum + value, 0);
        if (total === 0) {
            for (const id of ids) raw[id] = 1;
            total = ids.length;
        }
        for (const id of ids) perks[id] = raw[id] / total;
    }
    return { goals, perks };
}

function scoreAllocation(baseLevels, targetLevels, weights) {
    const byPerk = {};
    const byGoal = Object.fromEntries(GOAL_ORDER.map(goal => [goal, 0]));
    let total = 0;
    for (const goal of GOAL_ORDER) {
        for (const perkId of GOAL_PERKS[goal]) {
            const delta = normalizedEffect(perkId, targetLevels[perkId]) - normalizedEffect(perkId, baseLevels[perkId]);
            const score = delta * weights.goals[goal] * weights.perks[perkId];
            byPerk[perkId] = score;
            byGoal[goal] += score;
            total += score;
        }
    }
    return { total, byGoal, byPerk };
}

class PerkSimulatorEngine {
    static getFunctionalPerks() {
        return PERK_ORDER.map(perkId => ({
            perkId,
            goal: GOAL_ORDER.find(goal => GOAL_PERKS[goal].includes(perkId)),
            ...PERK_DEFINITIONS[perkId]
        }));
    }

    static simulate(playerState, targetLevels = {}, budget = null, weightOptions = {}) {
        const baseLevels = Object.fromEntries(PERK_ORDER.map(id => [id, Math.max(0, Math.floor(playerState?.perks?.[id] || 0))]));
        const available = budget === null
            ? Math.max(0, Math.floor(playerState?.prestigePoints || 0))
            : Math.max(0, Math.floor(Number(budget) || 0));
        const normalizedTargets = { ...baseLevels };
        let spent = 0;
        for (const perkId of PERK_ORDER) {
            const maxLevel = PERK_DEFINITIONS[perkId].maxLevel;
            const requested = Object.hasOwn(targetLevels, perkId) ? Math.floor(Number(targetLevels[perkId])) : baseLevels[perkId];
            if (!Number.isFinite(requested) || requested < baseLevels[perkId] || requested > maxLevel) {
                return { error: `Invalid target level for perk '${perkId}'` };
            }
            normalizedTargets[perkId] = requested;
            spent += requested - baseLevels[perkId];
        }
        if (spent > available) return { error: `Allocation requires ${spent} Prestige Points; only ${available} available` };
        const weights = normalizeWeights(weightOptions.goalWeights, weightOptions.perkWeights);
        return {
            success: true,
            budget: available,
            spent,
            remaining: available - spent,
            baseLevels,
            targetLevels: normalizedTargets,
            effects: Object.fromEntries(PERK_ORDER.map(perkId => [perkId, {
                before: effectValue(perkId, baseLevels[perkId]),
                after: effectValue(perkId, normalizedTargets[perkId]),
                normalizedBefore: normalizedEffect(perkId, baseLevels[perkId]),
                normalizedAfter: normalizedEffect(perkId, normalizedTargets[perkId])
            }])),
            weights,
            score: scoreAllocation(baseLevels, normalizedTargets, weights)
        };
    }

    static optimize(playerState, budget, weightOptions = {}) {
        const baseLevels = Object.fromEntries(PERK_ORDER.map(id => [id, Math.max(0, Math.floor(playerState?.perks?.[id] || 0))]));
        const available = Math.max(0, Math.floor(Number(budget) || 0));
        const weights = normalizeWeights(weightOptions.goalWeights, weightOptions.perkWeights);
        const remainingCapacity = PERK_ORDER.reduce((sum, id) => sum + Math.max(0, PERK_DEFINITIONS[id].maxLevel - baseLevels[id]), 0);
        const pointsToSpend = Math.min(available, remainingCapacity);

        // Multiple-choice integer knapsack. Each perk contributes one choice (0..remaining
        // levels) and every level costs exactly one point. Keeping complete allocation
        // vectors gives stable, auditable tie-breaking in canonical perk order.
        let dp = Array(pointsToSpend + 1).fill(null);
        dp[0] = { score: 0, levels: [] };
        for (let order = 0; order < PERK_ORDER.length; order += 1) {
            const perkId = PERK_ORDER[order];
            const goal = GOAL_ORDER.find(candidate => GOAL_PERKS[candidate].includes(perkId));
            const capacity = Math.max(0, PERK_DEFINITIONS[perkId].maxLevel - baseLevels[perkId]);
            const next = Array(pointsToSpend + 1).fill(null);
            for (let spent = 0; spent <= pointsToSpend; spent += 1) {
                if (!dp[spent]) continue;
                for (let add = 0; add <= Math.min(capacity, pointsToSpend - spent); add += 1) {
                    const targetLevel = baseLevels[perkId] + add;
                    const gain = (normalizedEffect(perkId, targetLevel) - normalizedEffect(perkId, baseLevels[perkId]))
                        * weights.goals[goal] * weights.perks[perkId];
                    const candidate = { score: dp[spent].score + gain, levels: [...dp[spent].levels, add] };
                    const index = spent + add;
                    const incumbent = next[index];
                    const stablePreference = incumbent && candidate.levels.some((value, i) => value !== incumbent.levels[i])
                        ? candidate.levels.findIndex((value, i) => value !== incumbent.levels[i])
                        : -1;
                    const preferCandidate = !incumbent
                        || candidate.score > incumbent.score + Number.EPSILON
                        || (Math.abs(candidate.score - incumbent.score) <= Number.EPSILON
                            && stablePreference >= 0
                            && candidate.levels[stablePreference] > incumbent.levels[stablePreference]);
                    if (preferCandidate) next[index] = candidate;
                }
            }
            dp = next;
        }

        const winning = dp[pointsToSpend] || { score: 0, levels: PERK_ORDER.map(() => 0) };
        const targets = Object.fromEntries(PERK_ORDER.map((perkId, index) => [perkId, baseLevels[perkId] + (winning.levels[index] || 0)]));
        const allocations = PERK_ORDER.flatMap((perkId, index) => Array(winning.levels[index] || 0).fill(perkId));

        const simulated = this.simulate(playerState, targets, available, weightOptions);
        return simulated.error ? simulated : { ...simulated, optimized: true, allocationOrder: allocations };
    }
}

module.exports = { PerkSimulatorEngine, GOAL_PERKS, effectValue, normalizedEffect, normalizeWeights };
