/**
 * @module ui/authModal
 * Creative Guild Master Authentication Modal with Live Password Strength Meter
 */

import {
    evaluatePasswordStrength,
    signUpUser,
    signInUser,
    signOutUser,
    getAuthSession,
    getAuthProfile,
    setAuthProfile,
    getAuthHeaders,
    isGuestProfile
} from '../auth.js';
import { getState, setState, saveState, setRevision } from '../state.js';
import { showToast } from './toast.js';
import { renderAll } from './header.js';
import { openDialog, closeDialog, showConfirmation } from './modal.js';

let authModalEl = null;
let currentTab = 'signin'; // 'signin' | 'signup'

const saveSummary = state => {
    const inventoryTypes = Object.values(state?.inventory || {}).filter(quantity => Number(quantity) > 0).length;
    return `$${Math.max(0, Math.floor(Number(state?.cash) || 0)).toLocaleString()} cash · Rank ${Math.max(0, Math.floor(Number(state?.rankIndex) || 0)) + 1} · Tier ${Math.max(0, Math.floor(Number(state?.prestigeCount) || 0))} · ${inventoryTypes} item types`;
};

const hasMeaningfulProgress = state => Math.max(0, Number(state?.cash) || 0) > 0
    || Math.max(0, Number(state?.rankIndex) || 0) > 0
    || Math.max(0, Number(state?.prestigeCount) || 0) > 0
    || Object.values(state?.inventory || {}).some(quantity => Number(quantity) > 0);

export const reconcileSignedState = async (profile, deviceState) => {
    let resolvedProfile = profile;
    const cloudState = profile?.state;
    const differs = JSON.stringify(cloudState || {}) !== JSON.stringify(deviceState || {});
    if (cloudState && deviceState && differs && hasMeaningfulProgress(cloudState) && hasMeaningfulProgress(deviceState)) {
        const useDevice = await showConfirmation(
            'cloud-device-save-choice',
            'Choose which progress to keep',
            `Cloud: ${saveSummary(cloudState)}. This device: ${saveSummary(deviceState)}. Choose This Device to replace the cloud save, or Cloud Save to keep the account progress.`,
            { allowIgnore: false, confirmLabel: 'Use This Device', cancelLabel: 'Use Cloud Save' }
        );
        if (useDevice) {
            const response = await fetch('/api/player/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ expectedRevision: Math.max(0, Number(profile.state_revision) || 0), deviceState })
            });
            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error || 'Device progress could not be imported.');
            resolvedProfile = data;
        }
    }
    setState(resolvedProfile?.state || cloudState || deviceState);
    setRevision(resolvedProfile?.state_revision || 0);
    if (resolvedProfile) setAuthProfile(resolvedProfile);
    saveState();
    return resolvedProfile;
};

const ENGLISH_ADJECTIVES = [
    'Orange', 'Blue', 'Green', 'Golden', 'Silver', 'Crimson', 'Amber', 'Violet', 'Indigo', 'Emerald',
    'Ruby', 'Coral', 'Ivory', 'Jade', 'Opal', 'Topaz', 'Bronze', 'Copper', 'Cedar', 'Hazel',
    'Bright', 'Silent', 'Swift', 'Brave', 'Clever', 'Quiet', 'Wild', 'Noble', 'Calm', 'Gentle',
    'Fierce', 'Keen', 'Grand', 'Pure', 'Lucky', 'Sunny', 'Cozy', 'Rapid', 'Sharp', 'Mighty',
    'Ancient', 'Radiant', 'Jolly', 'Sturdy', 'Serene', 'Vibrant', 'Daring', 'Smooth', 'Crisp', 'Frosty',
    'Breezy', 'Sparkling', 'Shining', 'Rustic', 'Humble', 'Velvet', 'Mystic', 'Cosmic', 'Solar', 'Lunar',
    'Astral', 'Timber', 'Alpine', 'Coastal', 'Highland', 'Nordic', 'Sylvan', 'Verdant', 'Brisk', 'Mellow'
];

const ENGLISH_NOUNS = [
    'Boat', 'Tree', 'River', 'Mountain', 'Valley', 'Forest', 'Castle', 'Bridge', 'Tower', 'Meadow',
    'Garden', 'Island', 'Harbor', 'Village', 'Cottage', 'Lantern', 'Compass', 'Anchor', 'Whistle', 'Feather',
    'Pebble', 'Crystal', 'Falcon', 'Eagle', 'Wolf', 'Fox', 'Bear', 'Stag', 'Otter', 'Owl',
    'Hawk', 'Robin', 'Sparrow', 'Badger', 'Beaver', 'Panda', 'Tiger', 'Lion', 'Dolphin', 'Starling',
    'Heron', 'Crane', 'Dragonfly', 'Butterfly', 'Firefly', 'Cricket', 'Acorn', 'Chestnut', 'Hazel', 'Walnut',
    'Maple', 'Willow', 'Birch', 'Pine', 'Cedar', 'Spruce', 'Clover', 'Sunflower', 'Tulip', 'Daisy',
    'Lily', 'Rose', 'Breeze', 'Cloud', 'Storm', 'Rain', 'Frost', 'Dawn', 'Dusk', 'Morning',
    'Evening', 'Twilight', 'Sunset', 'Sunrise', 'Moonlight', 'Starlight', 'Shadow', 'Glow', 'Spark', 'Beacon',
    'Haven', 'Brook', 'Creek', 'Canyon', 'Lagoon', 'Oasis', 'Ridge', 'Spire', 'Summit', 'Glade'
];

let lastSuggestedName = '';

export function generateRandomUsernameSuggestion() {
    let name = '';
    do {
        const adj = ENGLISH_ADJECTIVES[Math.floor(Math.random() * ENGLISH_ADJECTIVES.length)];
        const noun1 = ENGLISH_NOUNS[Math.floor(Math.random() * ENGLISH_NOUNS.length)];
        
        const roll = Math.random();
        if (roll < 0.25) {
            // Pattern 1: Single Word (e.g. Falcon, River, Willow, Ember, Haven, Crystal)
            name = noun1;
        } else if (roll < 0.65) {
            // Pattern 2: Adjective + Noun (e.g. OrangeBoat, BlueFalcon, GoldenFox)
            name = `${adj}${noun1}`;
        } else if (roll < 0.85) {
            // Pattern 3: Adjective + Noun + Noun (e.g. OrangeBoatTree, SilentPineHaven)
            let noun2 = ENGLISH_NOUNS[Math.floor(Math.random() * ENGLISH_NOUNS.length)];
            while (noun2 === noun1) {
                noun2 = ENGLISH_NOUNS[Math.floor(Math.random() * ENGLISH_NOUNS.length)];
            }
            name = `${adj}${noun1}${noun2}`;
        } else {
            // Pattern 4: Word + Number (e.g. Falcon42, SwiftEagle99, River88)
            const num = Math.floor(Math.random() * 90) + 10;
            name = (Math.random() > 0.5 ? `${adj}${noun1}` : noun1) + num;
        }
    } while (name === lastSuggestedName);
    
    lastSuggestedName = name;
    return name;
}

export function refreshModalSuggestions() {
    const randomName = generateRandomUsernameSuggestion();
    
    const signupUsernameInput = document.getElementById('signup-username');
    if (signupUsernameInput) {
        signupUsernameInput.placeholder = `e.g. ${randomName}`;
    }

    const signupEmailInput = document.getElementById('signup-email');
    if (signupEmailInput) {
        signupEmailInput.placeholder = `e.g. ${randomName.toLowerCase()}@bconomy.game`;
    }

    const signinIdentifierInput = document.getElementById('signin-identifier');
    if (signinIdentifierInput) {
        signinIdentifierInput.placeholder = `e.g. ${randomName} or user@domain.com`;
    }
}

export function setupAuthModal() {
    authModalEl = document.getElementById('auth-modal');
    if (!authModalEl) return;

    // Attach event listeners for tabs
    const tabBtns = authModalEl.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchAuthTab(tab);
        });
    });

    // Close button
    const closeBtn = authModalEl.querySelector('.auth-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeAuthModal();
        });
    }

    // Sign In Form
    const signinForm = document.getElementById('auth-signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', handleSignIn);
    }

    // Sign Up Form
    const signupForm = document.getElementById('auth-signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }

    // Password fields interactive enhancements (Caps lock, Show/Hide, Strength meter)
    setupPasswordInputEnhancements();

    // Listen for auth state changes
    window.addEventListener('bconomy-auth-change', () => {
        updateAccountHeaderUI();
    });

    refreshModalSuggestions();
    updateAccountHeaderUI();
}

export function openAuthModal(defaultTab = 'signin', returnFocus = null) {
    if (!authModalEl) authModalEl = document.getElementById('auth-modal');
    if (!authModalEl) return;
    refreshModalSuggestions();
    switchAuthTab(defaultTab);
    clearAuthForms();
    openDialog(authModalEl, {
        closeOnBackdrop: true,
        returnFocus: returnFocus || document.activeElement
    });
}

export function closeAuthModal() {
    if (!authModalEl) authModalEl = document.getElementById('auth-modal');
    if (authModalEl) {
        closeDialog(authModalEl);
    }
}

function switchAuthTab(tab) {
    currentTab = tab;
    if (!authModalEl) return;

    const tabBtns = authModalEl.querySelectorAll('.auth-tab-btn');
    tabBtns.forEach(b => {
        if (b.dataset.tab === tab) {
            b.classList.add('active');
            b.setAttribute('aria-selected', 'true');
        } else {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        }
    });

    const signinPane = document.getElementById('auth-pane-signin');
    const signupPane = document.getElementById('auth-pane-signup');

    if (signinPane && signupPane) {
        if (tab === 'signin') {
            signinPane.classList.remove('hidden');
            signupPane.classList.add('hidden');
        } else {
            signinPane.classList.add('hidden');
            signupPane.classList.remove('hidden');
        }
    }

    clearAuthErrors();
}

function clearAuthForms() {
    const signinForm = document.getElementById('auth-signin-form');
    const signupForm = document.getElementById('auth-signup-form');
    if (signinForm) signinForm.reset();
    if (signupForm) signupForm.reset();
    updateStrengthMeterUI('');
    hideAllCapsLockWarnings();
    clearAuthErrors();
}

function clearAuthErrors() {
    const errEls = authModalEl?.querySelectorAll('.auth-error-msg');
    errEls?.forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

function showAuthError(paneId, message) {
    const pane = document.getElementById(paneId);
    const errEl = pane?.querySelector('.auth-error-msg');
    if (errEl) {
        errEl.textContent = message;
        errEl.classList.remove('hidden');
    } else {
        showToast(message, 'error');
    }
}

function setupPasswordInputEnhancements() {
    if (!authModalEl) authModalEl = document.getElementById('auth-modal');
    const passwordInputs = authModalEl?.querySelectorAll('.password-wrapper input') || [];

    passwordInputs.forEach(input => {
        const wrapper = input.closest('.form-group') || input.parentElement;
        if (!wrapper) return;

        const toggleBtn = wrapper.querySelector('.toggle-password-btn');
        const capsLockBadge = wrapper.querySelector('.caps-lock-indicator');

        // Toggle Show / Hide Password
        if (toggleBtn && !toggleBtn.dataset.bound) {
            toggleBtn.dataset.bound = 'true';
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
                toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            });
        }

        // Caps Lock detection
        const checkCapsLock = (e) => {
            if (capsLockBadge && e.getModifierState) {
                const isCaps = e.getModifierState('CapsLock');
                if (isCaps) {
                    capsLockBadge.classList.remove('hidden');
                } else {
                    capsLockBadge.classList.add('hidden');
                }
            }
        };

        input.addEventListener('keyup', checkCapsLock);
        input.addEventListener('keydown', checkCapsLock);
        input.addEventListener('focus', checkCapsLock);
        input.addEventListener('blur', () => {
            if (capsLockBadge) capsLockBadge.classList.add('hidden');
        });
    });

    // Sign Up Password Strength Meter Live Listener
    const signupPasswordInput = document.getElementById('signup-password');
    if (signupPasswordInput && !signupPasswordInput.dataset.bound) {
        signupPasswordInput.dataset.bound = 'true';
        signupPasswordInput.addEventListener('input', (e) => {
            updateStrengthMeterUI(e.target.value);
        });
    }
}

function hideAllCapsLockWarnings() {
    const badges = authModalEl?.querySelectorAll('.caps-lock-indicator');
    badges?.forEach(b => b.classList.add('hidden'));
}

/**
 * Update the 4-segment Password Strength Meter UI
 */
export function updateStrengthMeterUI(password) {
    const meterEl = document.getElementById('signup-password-meter');
    if (!meterEl) return;

    const evaluation = evaluatePasswordStrength(password);
    const bars = meterEl.querySelectorAll('.strength-segment');
    const labelEl = meterEl.querySelector('.strength-label');

    // Reset all bar active states and colors
    bars.forEach((bar, idx) => {
        bar.className = 'strength-segment';
        if (evaluation.bars[idx]) {
            bar.classList.add('active', evaluation.levelClass);
        }
    });

    if (labelEl) {
        labelEl.textContent = evaluation.label;
        labelEl.className = `strength-label ${evaluation.levelClass}`;
    }
}

async function handleSignIn(e) {
    e.preventDefault();
    clearAuthErrors();

    const identifier = document.getElementById('signin-identifier')?.value;
    const password = document.getElementById('signin-password')?.value;
    const submitBtn = document.getElementById('signin-submit-btn');

    if (!identifier || !password) {
        showAuthError('auth-pane-signin', 'Please enter your username/email and password.');
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
        }

        const deviceState = getState();
        const data = await signInUser({ usernameOrEmail: identifier, password });
        showToast(`Welcome back, Guild Master ${data.profile?.username || ''}!`, 'success');
        closeAuthModal();

        // Load user's cloud saved state
        const profile = getAuthProfile();
        if (profile && profile.state && Object.keys(profile.state).length > 0) {
            await reconcileSignedState(profile, deviceState);
            renderAll();
        }
        updateAccountHeaderUI();
    } catch (err) {
        showAuthError('auth-pane-signin', err.message || 'Failed to sign in.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    clearAuthErrors();

    const username = document.getElementById('signup-username')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;
    const submitBtn = document.getElementById('signup-submit-btn');

    if (!username || username.trim().length < 2) {
        showAuthError('auth-pane-signup', 'Username must be at least 2 characters long.');
        return;
    }

    if (!password || password.length < 6) {
        showAuthError('auth-pane-signup', 'Password must be at least 6 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('auth-pane-signup', 'Passwords do not match.');
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
        }

        const deviceState = getState();
        const data = await signUpUser({ username, email, password });
        showToast(`Enlisted successfully as Player ${data.profile?.formatted_player_id || '#' + data.profile?.player_id}!`, 'success');
        closeAuthModal();

        // Sync initial state if available
        const profile = getAuthProfile();
        if (profile && profile.state && Object.keys(profile.state).length > 0) {
            await reconcileSignedState(profile, deviceState);
            renderAll();
        }
        updateAccountHeaderUI();
    } catch (err) {
        showAuthError('auth-pane-signup', err.message || 'Failed to create account.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
        }
    }
}

/**
 * Open the Player Account Details modal
 */
export function openAccountDetailsModal(returnFocus = null) {
    const profile = getAuthProfile();
    const session = getAuthSession();
    if (!profile) return;

    const modal = document.getElementById('account-profile-modal');
    if (!modal) return;

    const playerIdFormatted = profile.formatted_player_id || `#${profile.player_id}`;
    const idEl = document.getElementById('account-modal-player-id');
    const userEl = document.getElementById('account-modal-username');
    const emailEl = document.getElementById('account-modal-email');
    const standingEl = document.getElementById('account-modal-standing');
    const signoutBtn = document.getElementById('account-modal-signout-btn');
    const signinBtn = document.getElementById('account-modal-signin-btn');
    const signupBtn = document.getElementById('account-modal-signup-btn');
    const guest = isGuestProfile(profile);

    if (idEl) idEl.textContent = `Player ${playerIdFormatted}`;
    if (userEl) userEl.textContent = profile.username || (guest ? 'Guest Player' : 'Guild Master');
    if (emailEl) emailEl.textContent = guest ? 'Not linked' : (session?.user?.email || profile.email || 'None');
    if (standingEl) standingEl.textContent = guest ? 'Temporary Guest · 365-day inactivity retention' : 'Active & Verified';

    signinBtn?.classList.toggle('hidden', !guest);
    signupBtn?.classList.toggle('hidden', !guest);
    signoutBtn?.classList.toggle('hidden', guest);
    if (signinBtn) signinBtn.onclick = () => {
        closeDialog(modal, { reason: 'signin' });
        openAuthModal('signin', document.getElementById('header-account-btn'));
    };
    if (signupBtn) signupBtn.onclick = () => {
        closeDialog(modal, { reason: 'signup' });
        openAuthModal('signup', document.getElementById('header-account-btn'));
    };

    if (signoutBtn && !guest) {
        signoutBtn.onclick = async () => {
            closeDialog(modal, { reason: 'signout' });
            await signOutUser();
            showToast('Signed out of Bconomy.', 'info');
            location.reload();
        };
    }

    openDialog(modal, {
        closeOnBackdrop: true,
        returnFocus: returnFocus || document.getElementById('header-account-btn') || document.activeElement
    });
}

/**
 * Render Player ID and Account info in Header / UI
 */
export function updateAccountHeaderUI() {
    const accountContainer = document.getElementById('header-account-status');
    if (!accountContainer) return;

    const profile = getAuthProfile();
    const session = getAuthSession();

    if (session && profile) {
        const playerIdFormatted = profile.formatted_player_id || `#${profile.player_id}`;
        const guest = isGuestProfile(profile);
        accountContainer.innerHTML = `
            <button type="button" id="header-account-btn" class="player-account-btn" title="View ${guest ? 'Guest' : 'Account'} Profile (${profile.username})" aria-label="${guest ? 'Guest Player' : 'Player Account'} Profile">
                <iconify-icon icon="${guest ? 'lucide:user-round' : 'lucide:user-check'}" class="player-account-icon" aria-hidden="true"></iconify-icon>
                <span class="player-account-id">${guest ? 'Guest' : 'Player'} ${playerIdFormatted}</span>
                <iconify-icon icon="lucide:chevron-down" class="player-account-chevron" aria-hidden="true"></iconify-icon>
            </button>
        `;

        const accountBtn = document.getElementById('header-account-btn');
        if (accountBtn) {
            accountBtn.addEventListener('click', () => {
                openAccountDetailsModal(accountBtn);
            });
        }
    } else {
        accountContainer.innerHTML = `
            <button type="button" id="header-signin-btn" class="player-guest-btn" title="Sign In or Enlist" aria-label="Sign In or Enlist">
                <iconify-icon icon="lucide:shield" class="player-guest-icon" aria-hidden="true"></iconify-icon>
                <span>Sign In</span>
            </button>
        `;

        const signinBtn = document.getElementById('header-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', () => {
                openAuthModal('signin', signinBtn);
            });
        }
    }
}
