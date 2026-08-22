/**
 * @module factionEngine
 * Handles Factions, Faction Points (FP), Customization, and 5-action Faction Boosters (1.0x to 10.0x in 0.25x steps).
 */

const MAX_MULTIPLIER_LEVEL = 36; // 36 * 0.25 = +9.0x -> 10.0x max multiplier
const MULTIPLIER_STEP = 0.25;
const ACTIONS_LIST = ['mine', 'explore', 'hunt', 'fish', 'work'];
const FACTION_CREATION_COST = 1000000; // $1,000,000 to found a faction

/**
 * Calculates hourly FP cost for a given multiplier level.
 * Level 0 = 0 FP/hr (1.00x - Inactive)
 * Level 1-16 (1.25x - 5.00x): floor(100,000 * L^2)
 * Level 17-36 (5.25x - 10.00x): floor(25,600,000 * (1.25^(L-16)) + 10,000,000 * (L-16)^2)
 * @param {number} level - Multiplier level (0 to 36)
 * @returns {number} FP cost per hour
 */
function getCostPerHour(level) {
    const lvl = Math.max(0, Math.min(MAX_MULTIPLIER_LEVEL, Math.floor(Number(level) || 0)));
    if (lvl === 0) return 0;
    if (lvl <= 16) {
        return Math.floor(100000 * Math.pow(lvl, 2));
    }
    const excess = lvl - 16;
    const baseAt16 = 25600000;
    const expFactor = Math.pow(1.25, excess);
    const polyFactor = 10000000 * Math.pow(excess, 2);
    return Math.floor((baseAt16 * expFactor) + polyFactor);
}

/**
 * Gets the multiplier value for a given level.
 * @param {number} level - Multiplier level (0 to 36)
 * @returns {number} Multiplier (1.00 to 10.00)
 */
function getMultiplierForLevel(level) {
    const lvl = Math.max(0, Math.min(MAX_MULTIPLIER_LEVEL, Math.floor(Number(level) || 0)));
    return 1.0 + (lvl * MULTIPLIER_STEP);
}

/**
 * Generates the complete 36-level multiplier metadata table.
 * @returns {Array} Array of level metadata objects
 */
function getMultiplierTable() {
    const table = [];
    for (let lvl = 0; lvl <= MAX_MULTIPLIER_LEVEL; lvl++) {
        table.push({
            level: lvl,
            multiplier: getMultiplierForLevel(lvl),
            multiplierText: `${getMultiplierForLevel(lvl).toFixed(2)}×`,
            costPerHour: getCostPerHour(lvl),
            isMax: lvl === MAX_MULTIPLIER_LEVEL,
            isFiveXPlus: lvl >= 16
        });
    }
    return table;
}

class FactionEngine {
    /**
     * Ensures and normalizes faction state on playerState if created.
     * If player has no faction (null or uncreated), preserves null.
     * @param {Object} playerState 
     * @param {number} [currentTime=Date.now()]
     */
    static ensureFactionState(playerState, currentTime = Date.now()) {
        if (!playerState || playerState.faction === null || playerState.faction === undefined) {
            playerState.faction = null;
            return;
        }

        if (typeof playerState.faction !== 'object' || playerState.faction.created === false) {
            playerState.faction = null;
            return;
        }

        const faction = playerState.faction;
        faction.created = true;
        faction.name = typeof faction.name === 'string' && faction.name.trim() !== '' ? faction.name.trim() : 'Unnamed Faction';
        faction.description = typeof faction.description === 'string' ? faction.description.trim() : '';
        faction.points = typeof faction.points === 'number' && !isNaN(faction.points) ? Math.max(0, Math.floor(faction.points)) : 0;
        faction.lifetimeContributed = typeof faction.lifetimeContributed === 'number' && !isNaN(faction.lifetimeContributed) 
            ? Math.max(0, Math.floor(faction.lifetimeContributed)) 
            : 0;

        if (!faction.boosts || typeof faction.boosts !== 'object') {
            faction.boosts = {};
        }

        for (const act of ACTIONS_LIST) {
            if (!faction.boosts[act] || typeof faction.boosts[act] !== 'object') {
                faction.boosts[act] = {
                    level: 0,
                    multiplier: 1.0,
                    activeUntil: 0,
                    mode: 'duration',
                    lastUpdated: currentTime,
                    costPerHour: 0
                };
            } else {
                const b = faction.boosts[act];
                b.level = typeof b.level === 'number' ? Math.max(0, Math.min(MAX_MULTIPLIER_LEVEL, Math.floor(b.level))) : 0;
                b.multiplier = getMultiplierForLevel(b.level);
                b.activeUntil = typeof b.activeUntil === 'number' ? Math.max(0, b.activeUntil) : 0;
                b.mode = (b.mode === 'continuous') ? 'continuous' : 'duration';
                b.lastUpdated = typeof b.lastUpdated === 'number' ? b.lastUpdated : currentTime;
                b.costPerHour = getCostPerHour(b.level);
            }
        }

        this.processFactionState(playerState, currentTime);
    }

    /**
     * Creates / Founds a new Faction for $1,000,000 cash.
     * @param {Object} playerState 
     * @param {string} name 
     * @param {string} description 
     * @param {number} [currentTime=Date.now()]
     * @returns {Object} Result
     */
    static createFaction(playerState, name, description, currentTime = Date.now()) {
        if (playerState.faction && playerState.faction.created) {
            return { error: 'You already belong to a faction' };
        }

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return { error: 'Please enter a faction name' };
        }

        playerState.cash = typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0;
        if (playerState.cash < FACTION_CREATION_COST) {
            return { 
                error: `Insufficient cash. Founding a faction costs $${FACTION_CREATION_COST.toLocaleString()} cash. (Current: $${playerState.cash.toLocaleString()})` 
            };
        }

        playerState.cash -= FACTION_CREATION_COST;

        const cleanName = name.trim().slice(0, 32);
        const cleanDesc = (typeof description === 'string' && description.trim().length > 0) 
            ? description.trim().slice(0, 160) 
            : '';

        playerState.faction = {
            created: true,
            name: cleanName,
            description: cleanDesc,
            points: 0,
            lifetimeContributed: 0,
            boosts: {
                mine: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', lastUpdated: currentTime, costPerHour: 0 },
                explore: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', lastUpdated: currentTime, costPerHour: 0 },
                hunt: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', lastUpdated: currentTime, costPerHour: 0 },
                fish: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', lastUpdated: currentTime, costPerHour: 0 },
                work: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', lastUpdated: currentTime, costPerHour: 0 }
            }
        };

        return {
            success: true,
            message: `Successfully founded faction "${cleanName}"!`,
            faction: playerState.faction,
            remainingCash: playerState.cash
        };
    }

    /**
     * Processes faction state, draining continuous FP and expiring elapsed duration boosts.
     * If FP reaches 0, resets active boosts to Level 0 (1.0x).
     * @param {Object} playerState 
     * @param {number} [currentTime=Date.now()]
     */
    static processFactionState(playerState, currentTime = Date.now()) {
        if (!playerState || !playerState.faction || !playerState.faction.created || !playerState.faction.boosts) return;
        const faction = playerState.faction;
        const now = currentTime;

        for (const act of ACTIONS_LIST) {
            const boost = faction.boosts[act];
            if (!boost || boost.level === 0) {
                if (boost) {
                    boost.level = 0;
                    boost.multiplier = 1.0;
                    boost.costPerHour = 0;
                    boost.lastUpdated = now;
                }
                continue;
            }

            if (boost.mode === 'continuous') {
                const elapsedMs = Math.max(0, now - (boost.lastUpdated || now));
                if (elapsedMs > 0 && boost.costPerHour > 0) {
                    const elapsedHours = elapsedMs / (3600 * 1000);
                    const fpCost = Math.floor(elapsedHours * boost.costPerHour);
                    
                    if (faction.points >= fpCost) {
                        if (fpCost > 0) {
                            faction.points = Math.max(0, faction.points - fpCost);
                            boost.lastUpdated = now;
                        }
                        // Set activeUntil to current time + remaining hours worth of FP
                        const remainingHours = faction.points / boost.costPerHour;
                        boost.activeUntil = now + Math.floor(remainingHours * 3600 * 1000);
                    } else {
                        // FP exhausted before now: calculate exact cutoff and stop boost
                        faction.points = 0;
                        boost.level = 0;
                        boost.multiplier = 1.0;
                        boost.activeUntil = 0;
                        boost.costPerHour = 0;
                        boost.lastUpdated = now;
                    }
                } else {
                    boost.lastUpdated = now;
                    if (boost.costPerHour > 0) {
                        const remainingHours = faction.points / boost.costPerHour;
                        boost.activeUntil = now + Math.floor(remainingHours * 3600 * 1000);
                    }
                }
            } else {
                // Duration Mode
                if (boost.activeUntil > 0 && now >= boost.activeUntil) {
                    boost.level = 0;
                    boost.multiplier = 1.0;
                    boost.activeUntil = 0;
                    boost.costPerHour = 0;
                    boost.lastUpdated = now;
                }
            }
        }
    }

    /**
     * Deposits liquid cash into the Faction Treasury (1:1 Cash to FP parity).
     * @param {Object} playerState 
     * @param {number} cashAmount 
     * @returns {Object} Result of deposit
     */
    static depositCash(playerState, cashAmount) {
        if (!playerState || !playerState.faction || !playerState.faction.created) {
            return { error: 'You must found a faction first' };
        }
        this.ensureFactionState(playerState);
        const amount = Math.floor(Number(cashAmount) || 0);

        if (amount <= 0) {
            return { error: 'Deposit amount must be a positive integer' };
        }

        playerState.cash = typeof playerState.cash === 'number' && !isNaN(playerState.cash) ? playerState.cash : 0;
        if (playerState.cash < amount) {
            return { error: 'Insufficient cash in wallet' };
        }

        playerState.cash -= amount;
        playerState.faction.points += amount;
        playerState.faction.lifetimeContributed += amount;

        return {
            success: true,
            deposited: amount,
            newPoints: playerState.faction.points,
            lifetimeContributed: playerState.faction.lifetimeContributed,
            remainingCash: playerState.cash
        };
    }

    /**
     * Activates or updates a Faction Multiplier for a specific action.
     * @param {Object} playerState 
     * @param {string} actionType - 'mine', 'explore', 'hunt', 'fish', 'work'
     * @param {number} targetLevel - 1 to 36
     * @param {number} [durationHours=1] - Duration in hours (used when mode='duration')
     * @param {string} [mode='duration'] - 'duration' or 'continuous'
     * @param {number} [currentTime=Date.now()]
     * @returns {Object} Result of activation
     */
    static activateBoost(playerState, actionType, targetLevel, durationHours = 1, mode = 'duration', currentTime = Date.now()) {
        if (!playerState || !playerState.faction || !playerState.faction.created) {
            return { error: 'You must found a faction first' };
        }
        this.ensureFactionState(playerState, currentTime);
        const faction = playerState.faction;
        const now = currentTime;

        if (!ACTIONS_LIST.includes(actionType)) {
            return { error: `Invalid action type. Must be one of: ${ACTIONS_LIST.join(', ')}` };
        }

        const level = Math.max(1, Math.min(MAX_MULTIPLIER_LEVEL, Math.floor(Number(targetLevel) || 1)));
        const costPerHour = getCostPerHour(level);
        const boost = faction.boosts[actionType];

        // Enforce exclusive active mode lock (must stop boost to switch between continuous & duration)
        if (boost.level > 0) {
            if (boost.mode === 'continuous' && mode === 'duration' && faction.points > 0) {
                return { 
                    error: `Boost for ${actionType.toUpperCase()} is currently active in Continuous Drain mode. Stop the boost first to switch to Fixed Duration.` 
                };
            }
            if (boost.mode === 'duration' && mode === 'continuous' && boost.activeUntil > now) {
                return { 
                    error: `Boost for ${actionType.toUpperCase()} is currently active in Fixed Duration mode. Stop the boost first to switch to Continuous Drain.` 
                };
            }
        }

        if (mode === 'continuous') {
            if (faction.points < costPerHour) {
                return { 
                    error: `Insufficient FP to start continuous boost. Requires at least 1 hour of FP (${costPerHour.toLocaleString()} FP). Current: ${faction.points.toLocaleString()} FP.` 
                };
            }

            boost.level = level;
            boost.multiplier = getMultiplierForLevel(level);
            boost.mode = 'continuous';
            boost.costPerHour = costPerHour;
            boost.lastUpdated = now;
            const remainingHours = faction.points / costPerHour;
            boost.activeUntil = now + Math.floor(remainingHours * 3600 * 1000);

            return {
                success: true,
                actionType,
                level,
                multiplier: boost.multiplier,
                mode: 'continuous',
                costPerHour,
                activeUntil: boost.activeUntil,
                remainingPoints: faction.points
            };
        }

        // Duration Mode
        const hours = Math.max(0.1, Number(durationHours) || 1);
        const totalFPCost = Math.floor(hours * costPerHour);

        if (faction.points < totalFPCost) {
            return { 
                error: `Insufficient FP for ${hours}h boost. Cost: ${totalFPCost.toLocaleString()} FP. Current: ${faction.points.toLocaleString()} FP.` 
            };
        }

        faction.points -= totalFPCost;

        // If extending existing active boost at same level, append time; otherwise start fresh from now
        let newActiveUntil;
        if (boost.level === level && boost.activeUntil > now && boost.mode === 'duration') {
            newActiveUntil = boost.activeUntil + Math.floor(hours * 3600 * 1000);
        } else {
            newActiveUntil = now + Math.floor(hours * 3600 * 1000);
        }

        boost.level = level;
        boost.multiplier = getMultiplierForLevel(level);
        boost.mode = 'duration';
        boost.costPerHour = costPerHour;
        boost.activeUntil = newActiveUntil;
        boost.lastUpdated = now;

        return {
            success: true,
            actionType,
            level,
            multiplier: boost.multiplier,
            mode: 'duration',
            hours,
            costPaid: totalFPCost,
            activeUntil: boost.activeUntil,
            remainingPoints: faction.points
        };
    }

    /**
     * Stops an active boost for an action, resetting it to Level 0 (1.0x).
     * @param {Object} playerState 
     * @param {string} actionType 
     * @param {number} [currentTime=Date.now()]
     * @returns {Object} Result
     */
    static stopBoost(playerState, actionType, currentTime = Date.now()) {
        if (!playerState || !playerState.faction || !playerState.faction.created) {
            return { error: 'You must found a faction first' };
        }
        this.ensureFactionState(playerState, currentTime);
        if (!ACTIONS_LIST.includes(actionType)) {
            return { error: `Invalid action type` };
        }

        const boost = playerState.faction.boosts[actionType];
        boost.level = 0;
        boost.multiplier = 1.0;
        boost.activeUntil = 0;
        boost.costPerHour = 0;
        boost.lastUpdated = currentTime;

        return {
            success: true,
            actionType,
            message: `Faction boost for ${actionType} stopped.`
        };
    }

    /**
     * Gets the current effective faction multiplier for an action.
     * @param {Object} playerState 
     * @param {string} actionType 
     * @param {number} [currentTime=Date.now()]
     * @returns {number} Multiplier (1.0 to 10.0)
     */
    static getFactionMultiplier(playerState, actionType, currentTime = Date.now()) {
        if (!playerState || !playerState.faction || !playerState.faction.created) return 1.0;
        this.processFactionState(playerState, currentTime);
        
        const boost = playerState.faction.boosts && playerState.faction.boosts[actionType];
        if (!boost || boost.level === 0) return 1.0;

        if (boost.mode === 'continuous') {
            return playerState.faction.points > 0 ? boost.multiplier : 1.0;
        }

        return (boost.activeUntil > currentTime) ? boost.multiplier : 1.0;
    }

    /**
     * Updates Faction Customization (Name and Description).
     * @param {Object} playerState 
     * @param {string} name - Max 32 chars
     * @param {string} description - Max 160 chars
     * @returns {Object} Result
     */
    static updateCustomization(playerState, name, description) {
        if (!playerState || !playerState.faction || !playerState.faction.created) {
            return { error: 'You must found a faction first' };
        }
        this.ensureFactionState(playerState);
        const faction = playerState.faction;

        if (typeof name === 'string' && name.trim().length > 0) {
            const cleanName = name.trim().slice(0, 32);
            faction.name = cleanName;
        }

        if (typeof description === 'string') {
            const cleanDesc = description.trim().slice(0, 160);
            faction.description = cleanDesc;
        }

        return {
            success: true,
            name: faction.name,
            description: faction.description
        };
    }
}

module.exports = {
    FactionEngine,
    getCostPerHour,
    getMultiplierForLevel,
    getMultiplierTable,
    MAX_MULTIPLIER_LEVEL,
    MULTIPLIER_STEP,
    ACTIONS_LIST,
    FACTION_CREATION_COST
};
