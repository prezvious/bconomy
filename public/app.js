// Bconomy Main Entry Point (ES Module)
import { apiCall, doResetPlayer } from './js/api.js';
import { loadState, getState, setState, saveState, setRankData, setPerkData, setRevision, clearGuestMigrationSource } from './js/state.js';
import { initAuth, getAuthProfile, isGuestProfile, migrateGuestProgress } from './js/auth.js';
import { setupAuthModal, reconcileSignedState } from './js/ui/authModal.js';
import { setupThemeToggle } from './js/theme.js';
import { renderAll } from './js/ui/header.js';
import { updateAllToolRecipes } from './js/ui/tools.js';
import { setupNavigation } from './js/navigation.js';
import { setupModals } from './js/ui/modal.js';
import { setupItemModalListeners } from './js/ui/itemModal.js';
import { setupReleaseNotesModal } from './js/ui/releaseNotesModal.js';
import { cooldownLoop } from './js/ui/cooldowns.js';
import { addLogEntry, setupConsoleHandlers } from './js/ui/log.js';
import { applyInterfaceSettings, SETTINGS_CHANGE_EVENT } from './js/preferences.js';
import { setupHotkeys } from './js/controls.js';
import { setupUtilityRail } from './js/ui/utilityRail.js';

const init = async () => {
    setupThemeToggle();
    applyInterfaceSettings();
    setupUtilityRail();
    setupConsoleHandlers();

    try {
        const deviceState = loadState();
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
        let profile = getAuthProfile();
        let state = null;

        if (isGuestProfile(profile)) {
            let migrationSource = deviceState;
            if (!migrationSource) migrationSource = await apiCall('/api/state/default', 'GET');
            if (!profile.guest_migrated_at) {
                profile = await migrateGuestProgress(migrationSource);
                clearGuestMigrationSource();
            }
            state = profile.state;
            setRevision(profile.state_revision || 0);
            addLogEntry(`Guest Player ${profile.formatted_player_id || '#' + profile.player_id} is ready. Guest identities are removed after 365 days without activity.`, 'system');
        } else if (profile && profile.state && Object.keys(profile.state).length > 0) {
            await reconcileSignedState(profile, deviceState);
            state = getState() || profile.state;
            setRevision((getAuthProfile() || profile).state_revision || 0);
            addLogEntry(`Loaded cloud vault for Player ${profile.formatted_player_id || '#' + profile.player_id} (${profile.username}).`, 'system');
        } else {
            state = deviceState;
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
        setupReleaseNotesModal();
        renderAll();
        setupHotkeys();

        requestAnimationFrame(cooldownLoop);

        addLogEntry('Console ready.', 'system');
    } catch (error) {
        console.error("Initialization failed:", error);
        addLogEntry('Initialization failed! Is the backend running?', 'error');
    }
};

document.addEventListener(SETTINGS_CHANGE_EVENT, (event) => {
    const changedKeys = event.detail?.changedKeys || [];
    if (changedKeys.some(key => ['numberDisplay', 'inventory', 'crafting', 'quantityPresets', 'shopQol', 'prestigeSimulator'].includes(key))) {
        renderAll();
    }
});

function parseConsoleAmount(amount) {
    if (typeof amount === 'number') {
        return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(amount) || 0));
    }
    const cleanStr = String(amount).replace(/,/g, '').replace(/\$/g, '').trim().toLowerCase();
    const match = cleanStr.match(/^([0-9.]+)\s*([a-z]*)$/);
    if (!match) return 0;

    const numPart = parseFloat(match[1]) || 0;
    const unitPart = match[2];

    let multiplier = 1;
    if (unitPart === 'k' || unitPart === 'thousand') {
        multiplier = 1e3;
    } else if (unitPart === 'm' || unitPart === 'million') {
        multiplier = 1e6;
    } else if ((unitPart === 'b' || unitPart === 'bil' || unitPart === 'billion') && numPart < 1e9) {
        multiplier = 1e9;
    } else if (unitPart === 't' || unitPart === 'tril' || unitPart === 'trillion') {
        multiplier = 1e12;
    } else if (unitPart === 'q' || unitPart === 'quad' || unitPart === 'quadrillion') {
        multiplier = 1e15;
    }

    const finalVal = Math.floor(numPart * multiplier);
    return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, finalVal || 0));
}

// Expose JS Console helpers for testing cash balance
window.addCash = (amount = 10000000000) => {
    const state = loadState() || {};
    const addAmt = parseConsoleAmount(amount);
    state.cash = Math.min(Number.MAX_SAFE_INTEGER, (state.cash || 0) + addAmt);
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
    try {
        const result = getAuthProfile()
            ? await doResetPlayer()
            : { state: await apiCall('/api/state/default', 'GET') };
        if (result?.state) {
            setState(result.state);
            saveState(result.state);
        }
        localStorage.removeItem('bconomy_player_state');
        renderAll();
    } catch (e) {
        console.error('Progress reset failed:', e);
        return;
    }
    console.log('%c[Bconomy Dev] Game progress successfully reset!', 'color: #ff4757; font-weight: bold;');
    location.reload();
};
window.resetState = window.resetProgress;

document.addEventListener('DOMContentLoaded', init);
