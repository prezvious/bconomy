// Bconomy Main Entry Point (ES Module)
import { apiCall, gameCommand, doResetPlayer } from './js/api.js';
import { loadState, getState, setState, saveState, setRankData, setPerkData, setProgressionRules, setRevision, clearGuestMigrationSource } from './js/state.js';
import { initAuth, getAuthProfile, isGuestProfile, migrateGuestProgress, retryGuestRecovery } from './js/auth.js';
import { setupAuthModal, reconcileSignedState, openAuthModal } from './js/ui/authModal.js';
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
import { showToast } from './js/ui/toast.js';

const RECOVERY_NOTICE_KEY = 'bconomy_identity_recovery_notice';

const setupIdentityRecoveryUI = () => {
    const notice = document.getElementById('identity-recovery-notice');
    const message = document.getElementById('identity-recovery-message');
    const retryButton = document.getElementById('identity-recovery-retry');
    const dismissButton = document.getElementById('identity-recovery-dismiss');
    if (!notice || !message) return;

    const showNotice = (text, retryable = false) => {
        message.textContent = text;
        retryButton?.classList.toggle('hidden', !retryable);
        notice.classList.remove('hidden');
        try { sessionStorage.setItem(RECOVERY_NOTICE_KEY, JSON.stringify({ text, retryable })); } catch { /* optional persistence */ }
    };

    try {
        const stored = JSON.parse(sessionStorage.getItem(RECOVERY_NOTICE_KEY) || 'null');
        if (stored?.text) showNotice(stored.text, !!stored.retryable);
    } catch { /* ignore invalid session notice */ }

    dismissButton?.addEventListener('click', () => {
        notice.classList.add('hidden');
        try { sessionStorage.removeItem(RECOVERY_NOTICE_KEY); } catch { /* optional persistence */ }
    });

    retryButton?.addEventListener('click', async () => {
        retryButton.disabled = true;
        try {
            const profile = await retryGuestRecovery();
            setState(profile.state);
            setRevision(profile.state_revision);
            saveState();
            renderAll();
        } catch (error) {
            showNotice(error.message || 'Guest recovery failed. Your snapshot is still safe; retry when persistence is available.', true);
        } finally {
            retryButton.disabled = false;
        }
    });

    window.addEventListener('bconomy-identity-recovered', event => {
        const profile = event.detail?.profile;
        if (profile?.state) {
            setState(profile.state);
            setRevision(profile.state_revision);
            saveState();
        }
        showNotice('Economic and device progress was restored under a new guest identity. Faction membership, invitations, notifications, and prior command receipts could not be restored.', false);
    });
    window.addEventListener('bconomy-identity-recovery-failed', event => {
        showNotice(event.detail?.message || 'Guest recovery failed. Your recovery snapshot is safe; retry when persistence is available.', true);
    });
    window.addEventListener('bconomy-auth-required', event => {
        showNotice(event.detail?.message || 'Sign in to restore access to your registered account progress.', false);
        queueMicrotask(() => openAuthModal('signin', document.getElementById('header-signin-btn')));
    });
    window.addEventListener('bconomy-auth-recovery-complete', () => {
        notice.classList.add('hidden');
        try { sessionStorage.removeItem(RECOVERY_NOTICE_KEY); } catch { /* optional persistence */ }
    });
};

const init = async () => {
    setupThemeToggle();
    applyInterfaceSettings();
    setupUtilityRail();
    setupConsoleHandlers();
    setupAuthModal();
    setupIdentityRecoveryUI();

    try {
        const deviceState = loadState();
        // Initialize Supabase Auth & Profile
        await initAuth(deviceState);

        const [ranks, perks, progressionRules] = await Promise.all([
            apiCall('/api/data/ranks', 'GET'),
            apiCall('/api/data/perks', 'GET'),
            apiCall('/api/data/progression-rules', 'GET')
        ]);

        setRankData(ranks);
        setPerkData(perks);
        setProgressionRules(progressionRules);

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
window.addCash = async (amount = 10000000000) => {
    const addAmt = parseConsoleAmount(amount);
    try {
        const res = await gameCommand('dev.addCash', { cash: addAmt });
        if (res && res.state) {
            renderAll();
            console.log(`%c[Bconomy Dev] Added $${addAmt.toLocaleString()} BC Cash! Current Cash: $${res.state.cash.toLocaleString()} BC`, 'color: #4cd964; font-weight: bold;');
            return res.state.cash;
        }
    } catch (e) {
        console.warn('%c[Bconomy Dev] Server rejected cash modification:', 'color: #ff4757; font-weight: bold;', e.message);
        showToast(e.message || 'Developer commands are unavailable.', 'error');
        return (getState() || {}).cash || 0;
    }
    return (getState() || {}).cash || 0;
};

window.setCash = async (amount = 10000000000) => {
    const setAmt = parseConsoleAmount(amount);
    try {
        const res = await gameCommand('dev.setCash', { cash: setAmt });
        if (res && res.state) {
            renderAll();
            console.log(`%c[Bconomy Dev] Set cash to $${setAmt.toLocaleString()} BC!`, 'color: #4cd964; font-weight: bold;');
            return res.state.cash;
        }
    } catch (e) {
        console.warn('%c[Bconomy Dev] Server rejected cash modification:', 'color: #ff4757; font-weight: bold;', e.message);
        showToast(e.message || 'Developer commands are unavailable.', 'error');
        return (getState() || {}).cash || 0;
    }
    return (getState() || {}).cash || 0;
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
