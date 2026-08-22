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
    getAuthProfile
} from '../auth.js';
import { getState, setState, saveState } from '../state.js';
import { showToast } from './toast.js';
import { renderAll } from './header.js';
import { openDialog, closeDialog } from './modal.js';

let authModalEl = null;
let currentTab = 'signin'; // 'signin' | 'signup'

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

        const data = await signInUser({ usernameOrEmail: identifier, password });
        showToast(`Welcome back, Guild Master ${data.profile?.username || ''}!`, 'success');
        closeAuthModal();

        // Load user's cloud saved state
        const profile = getAuthProfile();
        if (profile && profile.state && Object.keys(profile.state).length > 0) {
            setState(profile.state);
            saveState(profile.state);
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

        const data = await signUpUser({ username, email, password });
        showToast(`Enlisted successfully as Player ${data.profile?.formatted_player_id || '#' + data.profile?.player_id}!`, 'success');
        closeAuthModal();

        // Sync initial state if available
        const profile = getAuthProfile();
        if (profile && profile.state && Object.keys(profile.state).length > 0) {
            setState(profile.state);
            saveState(profile.state);
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
 * Render Player ID and Account info in Header / UI
 */
export function updateAccountHeaderUI() {
    const accountContainer = document.getElementById('header-account-status');
    if (!accountContainer) return;

    const profile = getAuthProfile();
    const session = getAuthSession();

    if (session && profile) {
        const playerIdFormatted = profile.formatted_player_id || `#${profile.player_id}`;
        accountContainer.innerHTML = `
            <div class="player-account-badge" title="Logged in as ${profile.username}">
                <div class="player-id-tag">
                    <iconify-icon icon="lucide:user-check" class="player-icon" aria-hidden="true"></iconify-icon>
                    <span class="player-id-text">Player ${playerIdFormatted}</span>
                </div>
                <span class="player-username">${profile.username}</span>
                <button type="button" id="header-signout-btn" class="header-auth-btn signout" title="Sign Out" aria-label="Sign Out">
                    <iconify-icon icon="lucide:log-out" aria-hidden="true"></iconify-icon>
                </button>
            </div>
        `;

        const signoutBtn = document.getElementById('header-signout-btn');
        if (signoutBtn) {
            signoutBtn.addEventListener('click', async () => {
                await signOutUser();
                showToast('Signed out of Bconomy.', 'info');
                updateAccountHeaderUI();
                renderAll();
            });
        }
    } else {
        accountContainer.innerHTML = `
            <div class="player-guest-badge">
                <button type="button" id="header-signin-btn" class="header-auth-btn signin">
                    <iconify-icon icon="lucide:shield" aria-hidden="true"></iconify-icon>
                    <span>Sign In / Enlist</span>
                </button>
            </div>
        `;

        const signinBtn = document.getElementById('header-signin-btn');
        if (signinBtn) {
            signinBtn.addEventListener('click', () => {
                openAuthModal('signin');
            });
        }
    }
}
