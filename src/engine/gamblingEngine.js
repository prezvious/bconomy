/**
 * @module gamblingEngine
 * Engine handling gambling mechanics: Coinflip (Standard & Streak Double-Down),
 * bet expression parsing, numismatist perk bet limits, and stats tracking.
 */

const BASE_BET_LIMIT = 1000000000; // $1,000,000,000 ($1B)
const BET_LIMIT_PER_NUMISMATIST = 5000000000; // $5,000,000,000 ($5B per level)
const CRITICAL_FLIP_CHANCE = 0.05; // 5% chance for a Golden Critical Flip (3.0x payout)

/**
 * Calculates the maximum bet allowed for a player based on their numismatist perk level.
 * @param {number} [numismatistLevel=0] - Level of numismatist perk.
 * @returns {number} Maximum bet limit in cash.
 */
function getMaxBetLimit(numismatistLevel = 0) {
    const level = Math.max(0, Math.floor(Number(numismatistLevel) || 0));
    return BASE_BET_LIMIT + level * BET_LIMIT_PER_NUMISMATIST;
}

/**
 * Safely evaluates math expressions like "2k*2", "10m/2", "100k+500".
 * Restricts operators to + - * / and numbers to prevent arbitrary execution.
 * @param {string} expr 
 * @returns {number|null}
 */
function safeEvalMath(expr) {
    const sanitized = expr.replace(/\s+/g, '');
    if (!/^[0-9]+(\.[0-9]+)?([\+\-\*\/][0-9]+(\.[0-9]+)?)*$/.test(sanitized)) {
        return null;
    }

    try {
        const result = Function(`'use strict'; return (${sanitized});`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            return result;
        }
    } catch {
        return null;
    }
    return null;
}

/**
 * Parses user bet input expressions into a concrete cash wager integer.
 * Supports:
 * - Plain numbers ("5000")
 * - Suffixes: k ($1,000), m ($1,000,000), b ($1,000,000,000), t ($1,000,000,000,000)
 * - Percentages ("50%", "100%") -> relative to maxBetLimit
 * - Math expressions ("2k*2", "10m/2")
 * - Keywords ("max", "all") -> maxBetLimit (or playerCash if lower)
 * 
 * @param {string|number} input - Bet string or number input.
 * @param {number} playerCash - Player's current cash balance.
 * @param {number} maxBetLimit - Maximum allowed bet limit.
 * @returns {{ wager: number, error?: string }} Result object with parsed wager or error.
 */
function parseBetExpression(input, playerCash, maxBetLimit) {
    if (input === null || input === undefined || input === '') {
        return { wager: 0, error: 'Please enter a valid bet amount.' };
    }

    const str = String(input).trim().toLowerCase();
    if (!str) {
        return { wager: 0, error: 'Please enter a valid bet amount.' };
    }

    const cash = Math.max(0, Number(playerCash) || 0);
    const limit = Math.max(1, Number(maxBetLimit) || BASE_BET_LIMIT);
    const maxAffordableBet = Math.min(cash, limit);

    // Keyword handling
    if (str === 'max' || str === 'all') {
        if (maxAffordableBet <= 0) {
            return { wager: 0, error: 'Insufficient cash to place a bet.' };
        }
        return { wager: Math.floor(maxAffordableBet) };
    }

    // Percentage handling (relative to max affordable bet)
    if (str.endsWith('%')) {
        const pctStr = str.slice(0, -1).trim();
        const pctVal = parseFloat(pctStr);
        if (isNaN(pctVal) || pctVal <= 0) {
            return { wager: 0, error: 'Invalid percentage format.' };
        }
        if (pctVal > 100) {
            return { wager: 0, error: 'Percentage cannot exceed 100%.' };
        }
        const calculatedWager = Math.floor((pctVal / 100) * maxAffordableBet);
        if (calculatedWager > cash) {
            return { wager: 0, error: `Insufficient cash. You have $${cash.toLocaleString()}, but wager is $${calculatedWager.toLocaleString()}.` };
        }
        if (calculatedWager > limit) {
            return { wager: 0, error: `Bet exceeds maximum limit of $${limit.toLocaleString()}.` };
        }
        if (calculatedWager <= 0) {
            return { wager: 0, error: 'Bet amount is too low or insufficient cash.' };
        }
        return { wager: calculatedWager };
    }

    // Expand suffixes (k, m, b, t) inside the string before evaluating math
    let expanded = str
        .replace(/([0-9\.]+)\s*t/gi, (_, n) => `${parseFloat(n) * 1e12}`)
        .replace(/([0-9\.]+)\s*b/gi, (_, n) => `${parseFloat(n) * 1e9}`)
        .replace(/([0-9\.]+)\s*m/gi, (_, n) => `${parseFloat(n) * 1e6}`)
        .replace(/([0-9\.]+)\s*k/gi, (_, n) => `${parseFloat(n) * 1e3}`);

    // If string contains math operators
    if (/[\+\-\*\/]/.test(expanded)) {
        const mathVal = safeEvalMath(expanded);
        if (mathVal === null || mathVal <= 0) {
            return { wager: 0, error: 'Invalid math expression.' };
        }
        const wager = Math.floor(mathVal);
        if (wager > cash) {
            return { wager: 0, error: `Insufficient cash. You have $${cash.toLocaleString()}, but wager is $${wager.toLocaleString()}.` };
        }
        if (wager > limit) {
            return { wager: 0, error: `Bet exceeds maximum limit of $${limit.toLocaleString()}.` };
        }
        return { wager };
    }

    // Direct numerical value
    const numericVal = parseFloat(expanded);
    if (isNaN(numericVal) || numericVal <= 0) {
        return { wager: 0, error: 'Please enter a valid positive wager.' };
    }

    const wager = Math.floor(numericVal);
    if (wager > cash) {
        return { wager: 0, error: `Insufficient cash. You have $${cash.toLocaleString()}, but wager is $${wager.toLocaleString()}.` };
    }
    if (wager > limit) {
        return { wager: 0, error: `Bet exceeds maximum limit of $${limit.toLocaleString()}.` };
    }

    return { wager };
}

/**
 * Initializes or ensures gambling stats structure in playerState.
 * @param {object} playerState 
 */
function ensureGamblingStats(playerState) {
    if (!playerState.stats) {
        playerState.stats = {};
    }
    if (typeof playerState.stats.coinflipWins !== 'number') playerState.stats.coinflipWins = 0;
    if (typeof playerState.stats.coinflipLosses !== 'number') playerState.stats.coinflipLosses = 0;
    if (typeof playerState.stats.coinflipWagered !== 'number') playerState.stats.coinflipWagered = 0;
    if (typeof playerState.stats.coinflipProfit !== 'number') playerState.stats.coinflipProfit = 0;
    if (typeof playerState.stats.coinflipMaxStreak !== 'number') playerState.stats.coinflipMaxStreak = 0;
    if (typeof playerState.stats.coinflipCriticals !== 'number') playerState.stats.coinflipCriticals = 0;

    if (typeof playerState.stats.slotsSpins !== 'number') playerState.stats.slotsSpins = 0;
    if (typeof playerState.stats.slotsWins !== 'number') playerState.stats.slotsWins = 0;
    if (typeof playerState.stats.slotsJackpots !== 'number') playerState.stats.slotsJackpots = 0;
    if (typeof playerState.stats.slotsWagered !== 'number') playerState.stats.slotsWagered = 0;
    if (typeof playerState.stats.slotsProfit !== 'number') playerState.stats.slotsProfit = 0;
}

/**
 * Performs a Coinflip roll for standard mode or streak double-down mode.
 * 
 * @param {object} playerState - Central player state.
 * @param {object} params - Parameters object.
 * @param {string|number} params.wagerInput - Raw wager or math expression string.
 * @param {'heads'|'tails'} params.choice - Player's choice ('heads' or 'tails').
 * @param {'standard'|'streak'} [params.mode='standard'] - Game mode.
 * @param {object} [params.streakState] - Current active streak state if mode is 'streak'.
 * @param {boolean} [params.isCashOut=false] - If true in streak mode, cashes out active streak winnings.
 * 
 * @returns {object} Result object containing outcome text, cash changes, and updated state.
 */
function rollCoinflip(playerState, params = {}) {
    if (!playerState || typeof playerState !== 'object') {
        return { error: 'Invalid player state.' };
    }

    ensureGamblingStats(playerState);

    const numismatistLevel = playerState.perks?.numismatist || 0;
    const maxBetLimit = getMaxBetLimit(numismatistLevel);

    const { wagerInput, choice, mode = 'standard', streakState = null, isCashOut = false } = params;

    // Handle Cash Out in Streak Mode
    if (mode === 'streak' && isCashOut) {
        const currentPool = Math.max(0, Math.floor(Number(streakState?.currentPool) || 0));
        const maxAllowedPool = maxBetLimit * 59049; // 3^10 theoretical max
        if (currentPool > maxAllowedPool) {
            return { error: 'Invalid streak state: pool exceeds maximum possible value.' };
        }
        if (currentPool <= 0) {
            return { error: 'No active streak winnings to cash out.' };
        }
        playerState.cash = (playerState.cash || 0) + currentPool;
        playerState.stats.coinflipProfit += currentPool;

        return {
            success: true,
            mode: 'streak',
            action: 'cash_out',
            cashedOutAmount: currentPool,
            formattedPayout: currentPool.toLocaleString(),
            message: `Cashed out $${currentPool.toLocaleString()} BC!`,
            streakCount: streakState?.streakCount || 0,
            state: playerState
        };
    }

    // Choice validation
    const normalizedChoice = String(choice || '').toLowerCase().trim();
    if (normalizedChoice !== 'heads' && normalizedChoice !== 'tails') {
        return { error: 'Invalid choice. Please select Heads or Tails.' };
    }

    let wager = 0;

    // In streak mode continuation, wager is the currentPool from active streak
    if (mode === 'streak' && streakState && streakState.currentPool > 0) {
        wager = Math.floor(streakState.currentPool);
        const maxAllowedPool = maxBetLimit * 59049;
        if (wager > maxAllowedPool || wager <= 0 || !isFinite(wager)) {
            return { error: 'Invalid streak state.' };
        }
    } else {
        // Standard mode or initial streak flip: parse wager input
        const parseResult = parseBetExpression(wagerInput, playerState.cash, maxBetLimit);
        if (parseResult.error) {
            return { error: parseResult.error };
        }
        wager = parseResult.wager;

        // Deduct initial wager from player cash
        playerState.cash -= wager;
    }

    // Determine coinflip outcome (true 50/50 odds)
    const coinRoll = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = coinRoll === normalizedChoice;

    // Roll for Golden Critical Flip (5% chance on win)
    const isCritical = isWin && Math.random() < CRITICAL_FLIP_CHANCE;
    const multiplier = isCritical ? 3.0 : 2.0;

    // Track stats
    playerState.stats.coinflipWagered += wager;

    if (isWin) {
        playerState.stats.coinflipWins += 1;
        if (isCritical) {
            playerState.stats.coinflipCriticals += 1;
        }

        if (mode === 'standard') {
            const payout = Math.floor(wager * multiplier);
            const netProfit = payout - wager;
            playerState.cash += payout;
            playerState.stats.coinflipProfit += netProfit;

            const formattedOutcomeChoice = coinRoll.toUpperCase();

            return {
                success: true,
                mode: 'standard',
                isWin: true,
                isCritical,
                choice: normalizedChoice,
                outcome: coinRoll,
                wager,
                multiplier,
                payout,
                netProfit,
                formattedPayout: payout.toLocaleString(),
                message: isCritical 
                    ? `GOLDEN CRITICAL FLIP! You flipped ${formattedOutcomeChoice} and won $${payout.toLocaleString()} BC!`
                    : `You flipped ${formattedOutcomeChoice}! Won $${payout.toLocaleString()} BC!`,
                state: playerState
            };
        } else {
            // Streak Double-Down Mode Win
            const newStreakCount = (streakState?.streakCount || 0) + 1;
            const newPool = Math.floor(wager * multiplier);
            if (newStreakCount > playerState.stats.coinflipMaxStreak) {
                playerState.stats.coinflipMaxStreak = newStreakCount;
            }

            const formattedOutcomeChoice = coinRoll.toUpperCase();

            return {
                success: true,
                mode: 'streak',
                isWin: true,
                isCritical,
                choice: normalizedChoice,
                outcome: coinRoll,
                wager,
                multiplier,
                currentPool: newPool,
                streakCount: newStreakCount,
                formattedPool: newPool.toLocaleString(),
                message: isCritical
                    ? `GOLDEN CRITICAL FLIP! You flipped ${formattedOutcomeChoice}! Streak: ${newStreakCount}x (Pool: $${newPool.toLocaleString()} BC)`
                    : `You flipped ${formattedOutcomeChoice}! Streak: ${newStreakCount}x (Pool: $${newPool.toLocaleString()} BC)`,
                state: playerState
            };
        }
    } else {
        // Loss
        playerState.stats.coinflipLosses += 1;
        playerState.stats.coinflipProfit -= wager;

        const formattedOutcomeChoice = coinRoll.toUpperCase();

        if (mode === 'streak') {
            return {
                success: true,
                mode: 'streak',
                isWin: false,
                isCritical: false,
                choice: normalizedChoice,
                outcome: coinRoll,
                wager,
                multiplier: 0,
                currentPool: 0,
                streakCount: 0,
                formattedLost: wager.toLocaleString(),
                message: `You flipped ${formattedOutcomeChoice}. Lost $${wager.toLocaleString()} BC on streak step!`,
                state: playerState
            };
        }

        return {
            success: true,
            mode: 'standard',
            isWin: false,
            isCritical: false,
            choice: normalizedChoice,
            outcome: coinRoll,
            wager,
            multiplier: 0,
            payout: 0,
            netProfit: -wager,
            formattedLost: wager.toLocaleString(),
            message: `You flipped ${formattedOutcomeChoice}. Lost $${wager.toLocaleString()} BC.`,
            state: playerState
        };
    }
}

/**
 * Creative SVG Slot Symbols & Payout Configuration
 */
const SLOT_SYMBOLS = {
    wheat: { id: 'wheat', icon: 'lucide:wheat', name: 'Golden Harvest', baseMultiplier: 2.0, weight: 40 },
    pickaxe: { id: 'pickaxe', icon: 'lucide:pickaxe', name: 'Mythic Pickaxe', baseMultiplier: 5.0, weight: 25 },
    rocket: { id: 'rocket', icon: 'lucide:rocket', name: 'Hyper Booster', baseMultiplier: 20.0, weight: 15, dropsBooster: true },
    gem: { id: 'gem', icon: 'lucide:gem', name: 'Astral Gem', baseMultiplier: 50.0, weight: 10 },
    crown: { id: 'crown', icon: 'lucide:crown', name: 'Sovereignty Crown', baseMultiplier: 250.0, weight: 4, isJackpot: true },
    zap: { id: 'zap', icon: 'lucide:zap', name: 'Overcharge Catalyst', baseMultiplier: 0.0, weight: 6, isScatter: true }
};

function pickRandomSymbol() {
    const keys = Object.keys(SLOT_SYMBOLS);
    const totalWeight = keys.reduce((sum, k) => sum + SLOT_SYMBOLS[k].weight, 0);
    let roll = Math.random() * totalWeight;
    for (const key of keys) {
        if (roll < SLOT_SYMBOLS[key].weight) return SLOT_SYMBOLS[key];
        roll -= SLOT_SYMBOLS[key].weight;
    }
    return SLOT_SYMBOLS.wheat;
}

/**
 * Performs an instant 3-reel Slots spin.
 * 
 * @param {object} playerState - Central player state.
 * @param {object} params - Parameters object.
 * @param {string|number} params.wagerInput - Bet string or number input.
 * @param {object} [params.freeSpinState] - Active free spin state if free spins remaining.
 * @returns {object} Outcome result object formatted for state and UI.
 */
function rollSlots(playerState, params = {}) {
    if (!playerState || typeof playerState !== 'object') {
        return { error: 'Invalid player state.' };
    }

    ensureGamblingStats(playerState);

    const numismatistLevel = playerState.perks?.numismatist || 0;
    const jackpotFeverLevel = playerState.perks?.jackpot_fever || 0;
    const maxBetLimit = getMaxBetLimit(numismatistLevel);
    const perkBoost = 1 + (jackpotFeverLevel * 0.05); // +5% per level

    const { wagerInput, freeSpinState = null } = params;
    const isFreeSpin = freeSpinState && freeSpinState.remainingSpins > 0;

    let wager = 0;
    let remainingSpins = 0;

    if (isFreeSpin) {
        // Validate free spin state
        if (freeSpinState.remainingSpins > 25) {
            return { error: 'Invalid free spin state: too many remaining spins.' };
        }
        const initialWager = Math.floor(Number(freeSpinState.initialWager) || 1000000);
        if (initialWager > maxBetLimit) {
            return { error: 'Invalid free spin state: wager exceeds bet limit.' };
        }
        wager = initialWager;
        remainingSpins = freeSpinState.remainingSpins - 1;
    } else {
        const parseResult = parseBetExpression(wagerInput, playerState.cash, maxBetLimit);
        if (parseResult.error) {
            return { error: parseResult.error };
        }
        wager = parseResult.wager;

        // Deduct wager from player cash
        playerState.cash -= wager;
        playerState.stats.slotsWagered += wager;
    }

    playerState.stats.slotsSpins += 1;

    // Roll 3 reels
    const reel1 = pickRandomSymbol();
    const reel2 = pickRandomSymbol();
    const reel3 = pickRandomSymbol();

    const reels = [reel1, reel2, reel3];
    const isMatch = (reel1.id === reel2.id && reel2.id === reel3.id);

    let nextFreeSpinState = isFreeSpin && remainingSpins > 0 ? { remainingSpins, initialWager: wager } : null;

    if (isMatch) {
        if (reel1.isScatter) {
            // 3 Scatter Symbols -> Award 5 Free Spins
            const currentSpins = nextFreeSpinState ? nextFreeSpinState.remainingSpins : 0;
            nextFreeSpinState = {
                remainingSpins: currentSpins + 5,
                initialWager: wager
            };

            return {
                success: true,
                isWin: true,
                isScatterTrigger: true,
                isJackpot: false,
                reels,
                wager,
                multiplier: 0,
                payout: 0,
                itemDrop: null,
                freeSpinState: nextFreeSpinState,
                message: `OVERCHARGE CATALYST TRIPLE MATCH! Triggered 5 FREE SPINS!`,
                state: playerState
            };
        }

        // Standard 3-Matching Win
        const effectiveMultiplier = Number((reel1.baseMultiplier * perkBoost * (isFreeSpin ? 2.0 : 1.0)).toFixed(2));
        const payout = Math.floor(wager * effectiveMultiplier);

        playerState.cash += payout;
        playerState.stats.slotsWins += 1;
        playerState.stats.slotsProfit += (payout - (isFreeSpin ? 0 : wager));

        if (reel1.isJackpot) {
            playerState.stats.slotsJackpots += 1;
        }

        let itemDrop = null;
        if (reel1.dropsBooster) {
            if (!playerState.inventory) playerState.inventory = {};
            playerState.inventory['MiningBoosterT1'] = (playerState.inventory['MiningBoosterT1'] || 0) + 1;
            itemDrop = 'Mining Booster T1';
        }

        const headlineMessage = reel1.isJackpot
            ? `GRAND JACKPOT HIT! 3x ${reel1.name}! Won $${payout.toLocaleString()} BC!`
            : `TRIPLE MATCH! 3x ${reel1.name}! Won $${payout.toLocaleString()} BC!`;

        return {
            success: true,
            isWin: true,
            isScatterTrigger: false,
            isJackpot: reel1.isJackpot,
            reels,
            wager,
            multiplier: effectiveMultiplier,
            payout,
            formattedPayout: payout.toLocaleString(),
            itemDrop,
            freeSpinState: nextFreeSpinState,
            message: headlineMessage,
            state: playerState
        };
    } else {
        // No match
        if (!isFreeSpin) {
            playerState.stats.slotsProfit -= wager;
        }

        return {
            success: true,
            isWin: false,
            isScatterTrigger: false,
            isJackpot: false,
            reels,
            wager,
            multiplier: 0,
            payout: 0,
            itemDrop: null,
            freeSpinState: nextFreeSpinState,
            message: `No match. Lost $${wager.toLocaleString()} BC.`,
            state: playerState
        };
    }
}

module.exports = {
    BASE_BET_LIMIT,
    BET_LIMIT_PER_NUMISMATIST,
    CRITICAL_FLIP_CHANCE,
    SLOT_SYMBOLS,
    getMaxBetLimit,
    parseBetExpression,
    rollCoinflip,
    rollSlots,
    ensureGamblingStats
};
