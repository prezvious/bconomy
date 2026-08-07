// Central State Management

let playerState = null;
let rankData = [];
let perkData = {};
let toolRecipes = {};

export const getState = () => playerState;
export const setState = (state) => { playerState = state; };

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
        localStorage.setItem('bconomy_player_state', JSON.stringify(playerState));
    } catch (e) {
        console.error("Error saving state", e);
    }
};
