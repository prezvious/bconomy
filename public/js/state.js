// Central State Management
import { getAuthSession, getAuthHeaders, refreshAuthSession, setAuthProfile } from './auth.js';

const LEGACY_STATE_KEY = 'bconomy_player_state';
const GUEST_STATE_KEY = 'bconomy_guest_state';
const GUEST_REVISION_KEY = 'bconomy_guest_revision';

let playerState = null;
let rankData = [];
let perkData = {};
let progressionRules = { maxTargetedTierAdvance: 3000 };
let toolRecipes = {};
let stateRevision = 0;

export const getState = () => playerState;
export const getRevision = () => stateRevision;
export const setRevision = revision => {
    const numeric = Number(revision);
    stateRevision = Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : 0;
};
export const toFiniteNonNegativeSafeInteger = (value, fallback = 0, maximum = Number.MAX_SAFE_INTEGER) => {
    if (value === null || value === undefined || value === '' || typeof value === 'boolean') return fallback;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(maximum, Math.max(0, Math.floor(numeric)));
};

export const normalizeStateInvariants = (state) => {
    if (!state || typeof state !== 'object') return state;
    const maximumRankIndex = rankData.length > 0 ? rankData.length - 1 : 106;
    state.cash = toFiniteNonNegativeSafeInteger(state.cash);
    state.rankIndex = toFiniteNonNegativeSafeInteger(state.rankIndex, 0, maximumRankIndex);
    state.prestigeCount = toFiniteNonNegativeSafeInteger(state.prestigeCount);
    state.prestigePoints = toFiniteNonNegativeSafeInteger(state.prestigePoints);
    if (!state.perks || typeof state.perks !== 'object') state.perks = {};
    if (!state.inventory || typeof state.inventory !== 'object') state.inventory = {};
    if (!state.tools || typeof state.tools !== 'object') state.tools = { mine: 1, explore: 1, hunt: 1, fish: 1 };
    if (!state.cooldowns || typeof state.cooldowns !== 'object') state.cooldowns = { mine: 0, explore: 0, hunt: 0, fish: 0, work: 0 };
    return state;
};

export const setState = (state) => {
    playerState = normalizeStateInvariants(state);
};

export const getRankData = () => rankData;
export const setRankData = (data) => {
    rankData = Array.isArray(data) ? data : [];
    if (playerState) normalizeStateInvariants(playerState);
};

export const getPerkData = () => perkData;
export const setPerkData = (data) => { perkData = data; };

export const getProgressionRules = () => progressionRules;
export const setProgressionRules = (rules) => {
    progressionRules = {
        maxTargetedTierAdvance: toFiniteNonNegativeSafeInteger(rules?.maxTargetedTierAdvance, 3000)
    };
};

export const getToolRecipes = () => toolRecipes;
export const setToolRecipes = (recipes) => { toolRecipes = recipes; };
export const setToolRecipe = (type, recipe) => { toolRecipes[type] = recipe; };

export const loadState = () => {
    try {
        let saved = localStorage.getItem(GUEST_STATE_KEY);
        if (!saved) {
            saved = localStorage.getItem(LEGACY_STATE_KEY);
            if (saved) {
                localStorage.setItem(GUEST_STATE_KEY, saved);
                localStorage.removeItem(LEGACY_STATE_KEY);
            }
        }
        if (saved) {
            playerState = normalizeStateInvariants(JSON.parse(saved));
            setRevision(Number(localStorage.getItem(GUEST_REVISION_KEY)) || 0);
            return playerState;
        }
    } catch (e) {
        console.error("Error loading state", e);
    }
    return null;
};

export const clearGuestMigrationSource = () => {
    localStorage.removeItem(GUEST_STATE_KEY);
    localStorage.removeItem(GUEST_REVISION_KEY);
    localStorage.removeItem(LEGACY_STATE_KEY);
};

export const saveState = (state) => {
    if (state !== undefined) {
        playerState = normalizeStateInvariants(state);
    } else if (playerState) {
        normalizeStateInvariants(playerState);
    }
    try {
        if (playerState) {
            const session = getAuthSession();
            if (session?.user?.id) {
                localStorage.setItem(`${LEGACY_STATE_KEY}:${session.user.id}`, JSON.stringify({ state: playerState, revision: stateRevision }));
            } else {
                localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(playerState));
                localStorage.setItem(GUEST_REVISION_KEY, String(stateRevision));
            }
        }
    } catch (e) {
        console.error("Error saving state", e);
    }
};

/**
 * Compatibility no-op: signed progress is persisted by each command.
 */
export function queueCloudSync() {
    return false;
}

export async function syncStateToCloud() {
    const session = getAuthSession();
    if (!session || !session.user) return false;

    try {
        let res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
        if (res.status === 401 && await refreshAuthSession()) {
            res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
        }
        if (!res.ok) return false;
        const profile = await res.json();
        if (!profile?.state) return false;
        setState(profile.state);
        setRevision(profile.state_revision);
        setAuthProfile(profile);
        saveState();
        return true;
    } catch (e) {
        console.error('Error syncing player state to cloud:', e);
        return false;
    }
}
