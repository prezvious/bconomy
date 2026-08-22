// Central State Management
import { getAuthSession } from './auth.js';

let playerState = null;
let rankData = [];
let perkData = {};
let toolRecipes = {};

let syncTimeout = null;

export const getState = () => playerState;
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
        const saved = localStorage.getItem('bconomy_player_state');
        if (saved) {
            playerState = JSON.parse(saved);
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
            localStorage.setItem('bconomy_player_state', JSON.stringify(playerState));
            queueCloudSync();
        }
    } catch (e) {
        console.error("Error saving state", e);
    }
};

/**
 * Debounced background cloud sync to Supabase
 */
export function queueCloudSync() {
    const session = getAuthSession();
    if (!session || !session.user) return;

    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(async () => {
        try {
            await syncStateToCloud();
        } catch (e) {
            console.error('Background sync failed:', e);
        }
    }, 1200);
}

export async function syncStateToCloud() {
    const session = getAuthSession();
    if (!session || !session.user || !playerState) return false;

    try {
        const res = await fetch('/api/player/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: session.user.id,
                playerState: playerState
            })
        });
        return res.ok;
    } catch (e) {
        console.error('Error syncing player state to cloud:', e);
        return false;
    }
}
