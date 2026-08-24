// Central State Management
import { getAuthSession, getAuthHeaders, refreshAuthSession, setAuthProfile } from './auth.js';

const LEGACY_STATE_KEY = 'bconomy_player_state';
const GUEST_STATE_KEY = 'bconomy_guest_state';
const GUEST_REVISION_KEY = 'bconomy_guest_revision';

let playerState = null;
let rankData = [];
let perkData = {};
let toolRecipes = {};
let stateRevision = 0;

export const getState = () => playerState;
export const getRevision = () => stateRevision;
export const setRevision = revision => {
    const numeric = Number(revision);
    stateRevision = Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : 0;
};
export const setState = (state) => {
    if (state && typeof state === 'object' && typeof state.cash === 'number' && state.cash > Number.MAX_SAFE_INTEGER) {
        state.cash = Number.MAX_SAFE_INTEGER;
    }
    playerState = state;
};

export const getRankData = () => rankData;
export const setRankData = (data) => { rankData = data; };

export const getPerkData = () => perkData;
export const setPerkData = (data) => { perkData = data; };

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
            playerState = JSON.parse(saved);
            setRevision(Number(localStorage.getItem(GUEST_REVISION_KEY)) || 0);
            if (playerState && typeof playerState === 'object' && typeof playerState.cash === 'number' && playerState.cash > Number.MAX_SAFE_INTEGER) {
                playerState.cash = Number.MAX_SAFE_INTEGER;
            }
            return playerState;
        }
    } catch (e) {
        console.error("Error loading state", e);
    }
    return null;
};

export const saveState = (state) => {
    if (state !== undefined) {
        playerState = state;
    }
    try {
        if (playerState) {
            if (typeof playerState.cash === 'number' && playerState.cash > Number.MAX_SAFE_INTEGER) {
                playerState.cash = Number.MAX_SAFE_INTEGER;
            }
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
