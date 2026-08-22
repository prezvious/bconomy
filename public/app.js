// Bconomy Main Entry Point (ES Module)
import { apiCall } from './js/api.js';
import { loadState, setState, saveState, setRankData, setPerkData } from './js/state.js';
import { initAuth, getAuthProfile } from './js/auth.js';
import { setupAuthModal } from './js/ui/authModal.js';
import { setupThemeToggle } from './js/theme.js';
import { renderAll } from './js/ui/header.js';
import { updateAllToolRecipes } from './js/ui/tools.js';
import { setupNavigation } from './js/navigation.js';
import { setupModals } from './js/ui/modal.js';
import { setupItemModalListeners } from './js/ui/itemModal.js';
import { cooldownLoop } from './js/ui/cooldowns.js';
import { addLogEntry, setupConsoleHandlers } from './js/ui/log.js';
import { applyInterfaceSettings, SETTINGS_CHANGE_EVENT } from './js/preferences.js';

const init = async () => {
    setupThemeToggle();
    applyInterfaceSettings();
    setupConsoleHandlers();

    try {
        // Initialize Supabase Auth & Profile
        await initAuth();
        setupAuthModal();

        const [ranks, perks] = await Promise.all([
            apiCall('/api/data/ranks', 'GET'),
            apiCall('/api/data/perks', 'GET')
        ]);

        setRankData(ranks);
        setPerkData(perks);

        // Check if player profile has cloud-saved state
        const profile = getAuthProfile();
        let state = null;

        if (profile && profile.state && Object.keys(profile.state).length > 0) {
            state = profile.state;
            addLogEntry(`Loaded cloud vault for Player ${profile.formatted_player_id || '#' + profile.player_id} (${profile.username}).`, 'system');
        } else {
            state = loadState();
            if (!state) {
                state = await apiCall('/api/state/default', 'GET');
            }
        }

        setState(state);
        saveState(state);

        await updateAllToolRecipes();

        setupNavigation();
        setupModals();
        setupItemModalListeners();
        renderAll();

        requestAnimationFrame(cooldownLoop);

        addLogEntry('Console ready.', 'system');
    } catch (error) {
        console.error("Initialization failed:", error);
        addLogEntry('Initialization failed! Is the backend running?', 'error');
    }
};

document.addEventListener(SETTINGS_CHANGE_EVENT, (event) => {
    const changedKeys = event.detail?.changedKeys || [];
    if (changedKeys.some(key => ['numberDisplay', 'inventory'].includes(key))) {
        renderAll();
    }
});

function parseConsoleAmount(amount) {
    if (typeof amount === 'number') return amount;
    const str = String(amount).replace(/,/g, '').replace(/\$/g, '').replace(/bc/gi, '').trim().toLowerCase();
    if (str.endsWith('k')) return parseFloat(str) * 1e3;
    if (str.endsWith('m')) return parseFloat(str) * 1e6;
    if (str.endsWith('b')) return parseFloat(str) * 1e9;
    if (str.endsWith('t')) return parseFloat(str) * 1e12;
    if (str.endsWith('q')) return parseFloat(str) * 1e15;
    return parseFloat(str) || 0;
}

// Expose JS Console helpers for testing cash balance
window.addCash = (amount = 10000000000) => {
    const state = loadState() || {};
    const addAmt = parseConsoleAmount(amount);
    state.cash = (state.cash || 0) + addAmt;
    setState(state);
    saveState(state);
    renderAll();
    console.log(`%c[Bconomy Dev] Added $${addAmt.toLocaleString()} BC Cash! Current Cash: $${state.cash.toLocaleString()} BC`, 'color: #4cd964; font-weight: bold;');
    return state.cash;
};

window.setCash = (amount = 10000000000) => {
    const state = loadState() || {};
    const setAmt = parseConsoleAmount(amount);
    state.cash = setAmt;
    setState(state);
    saveState(state);
    renderAll();
    console.log(`%c[Bconomy Dev] Set cash to $${setAmt.toLocaleString()} BC!`, 'color: #4cd964; font-weight: bold;');
    return state.cash;
};

window.resetProgress = async () => {
    localStorage.removeItem('bconomy_player_state');
    try {
        const freshState = await apiCall('/api/state/default', 'GET');
        setState(freshState);
        saveState(freshState);
        renderAll();
    } catch (e) {
        localStorage.clear();
    }
    console.log('%c[Bconomy Dev] Game progress successfully reset!', 'color: #ff4757; font-weight: bold;');
    location.reload();
};
window.resetState = window.resetProgress;

document.addEventListener('DOMContentLoaded', init);
