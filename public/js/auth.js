/**
 * @module auth
 * Player Authentication, Session State, and Password Strength Calculator.
 */

let currentSession = null;
let currentProfile = null;

const AUTH_SESSION_KEY = 'bconomy_auth_session';
const AUTH_PROFILE_KEY = 'bconomy_auth_profile';
const AUTH_RECOVERY_STATE_KEY = 'bconomy_auth_recovery_state';
const AUTH_RECOVERY_ACCOUNT_KEY = 'bconomy_auth_recovery_account';
const GUEST_RECOVERY_SNAPSHOT_KEY = 'bconomy_guest_recovery_snapshot';
const IDENTITY_ERROR_CODES = new Set(['INVALID_AUTH', 'GUEST_EXPIRED', 'PROFILE_NOT_FOUND']);
let authRecoveryState = 'ready';

const dispatchAuthEvent = (name, detail = {}) => {
    if (globalThis.window?.dispatchEvent && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }
};

const setRecoveryState = state => {
    authRecoveryState = state;
    try {
        if (state === 'ready') localStorage.removeItem(AUTH_RECOVERY_STATE_KEY);
        else localStorage.setItem(AUTH_RECOVERY_STATE_KEY, state);
    } catch {
        // Persistent storage can be unavailable in privacy-restricted contexts.
    }
};

const clearIdentityCredentials = () => {
    currentSession = null;
    currentProfile = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_PROFILE_KEY);
};

const normalizeRecoverySnapshot = state => {
    const snapshot = state && typeof state === 'object' ? JSON.parse(JSON.stringify(state)) : {};
    const safeInteger = (value, maximum = Number.MAX_SAFE_INTEGER) => {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(maximum, Math.max(0, Math.floor(number))) : 0;
    };
    snapshot.cash = safeInteger(snapshot.cash);
    snapshot.rankIndex = safeInteger(snapshot.rankIndex, 106);
    snapshot.prestigeCount = safeInteger(snapshot.prestigeCount);
    snapshot.prestigePoints = safeInteger(snapshot.prestigePoints);
    return snapshot;
};

const responseErrorMessage = (data, fallback) => {
    const candidate = data?.error;
    return typeof candidate === 'string' ? candidate : candidate?.message || fallback;
};

const responseError = async response => {
    let data = {};
    try { data = await response.json(); } catch { /* The status still identifies the failure. */ }
    const candidate = data?.error;
    const error = new Error(responseErrorMessage(data, `Request failed (${response.status}).`));
    error.code = candidate?.code || (response.status === 401 ? 'INVALID_AUTH' : `HTTP_${response.status}`);
    error.status = response.status;
    return error;
};

/**
 * Calculate password strength score (0 to 4) and textual evaluation
 * Matches user's reference UI with 4 segments and progressive colors.
 */
export function evaluatePasswordStrength(password) {
    if (!password || password.length === 0) {
        return {
            score: 0,
            label: 'Password strength',
            levelClass: 'strength-none',
            bars: [false, false, false, false]
        };
    }

    let score = 0;
    const len = password.length;

    // Rule 1: Length
    if (len >= 6) score += 1;
    if (len >= 10) score += 1;

    // Rule 2: Mix of upper and lower case
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (hasLower && hasUpper) score += 1;

    // Rule 3: Numbers and special characters
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);
    if (hasNumbers || hasSymbols) score += 1;

    // Clamp score between 1 and 4 when length > 0
    if (score < 1) score = 1;
    if (score > 4) score = 4;

    if (len < 6) {
        score = 1;
    }

    const labels = {
        1: 'Very weak',
        2: 'Weak',
        3: 'Good',
        4: 'Strong'
    };

    const levelClasses = {
        1: 'strength-very-weak',
        2: 'strength-weak',
        3: 'strength-good',
        4: 'strength-strong'
    };

    return {
        score,
        label: labels[score] || 'Password strength',
        levelClass: levelClasses[score] || 'strength-none',
        bars: [
            score >= 1,
            score >= 2,
            score >= 3,
            score >= 4
        ]
    };
}

/**
 * Initialize Auth State from stored session and server
 */
export async function initAuth(deviceState = null) {
    try {
        try { authRecoveryState = localStorage.getItem(AUTH_RECOVERY_STATE_KEY) || 'ready'; } catch { authRecoveryState = 'ready'; }
        let signInRequestedDuringInit = false;
        const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
        const storedProfile = localStorage.getItem(AUTH_PROFILE_KEY);

        // Repair the invalid state produced by older clients when an anonymous
        // request to an account-only endpoint was mistaken for an expired login.
        if (authRecoveryState === 'requires-sign-in'
            && !storedSession
            && !storedProfile
            && !localStorage.getItem(AUTH_RECOVERY_ACCOUNT_KEY)) {
            setRecoveryState('ready');
        }

        if (storedSession && storedProfile) {
            currentSession = JSON.parse(storedSession);
            currentProfile = JSON.parse(storedProfile);
        }

        if (authRecoveryState === 'guest-recovery-running' || authRecoveryState === 'guest-recovery-failed') {
            try {
                await retryGuestRecovery();
            } catch (error) {
                dispatchAuthEvent('bconomy-auth-change', { session: currentSession, profile: currentProfile });
                dispatchAuthEvent('bconomy-identity-recovery-failed', {
                    message: error.message || 'Guest recovery is still pending. Retry when persistence is available.'
                });
                return null;
            }
        }

        if (currentProfile && currentProfile.id) {
            try {
                await refreshUserProfile(currentProfile.id);
            } catch (error) {
                if (IDENTITY_ERROR_CODES.has(error.code)) {
                    if (isGuestProfile(currentProfile)) {
                        await recoverGuestIdentity(deviceState || currentProfile.state);
                    } else {
                        requireSignInForRecovery(error.message);
                        signInRequestedDuringInit = true;
                    }
                } else {
                    console.warn('Player profile refresh is temporarily unavailable; retaining the account cache.', error);
                }
            }
        }

        if ((!currentSession || !currentProfile) && authRecoveryState === 'ready') {
            await ensureGuestIdentity();
        }

        dispatchAuthEvent('bconomy-auth-change', { session: currentSession, profile: currentProfile });
        if (authRecoveryState === 'requires-sign-in' && !signInRequestedDuringInit) {
            dispatchAuthEvent('bconomy-auth-required', { message: 'Your account session could not be restored. Sign in to continue.' });
        }

        return currentProfile;
    } catch (e) {
        console.warn('Failed to restore auth session:', e);
        return null;
    }
}

export const isGuestProfile = profile => profile?.account_kind === 'guest';
export const getAuthRecoveryState = () => authRecoveryState;
export const isIdentityErrorCode = code => IDENTITY_ERROR_CODES.has(code);
export const getRecoveryAccountId = () => {
    try { return localStorage.getItem(AUTH_RECOVERY_ACCOUNT_KEY) || ''; } catch { return ''; }
};
export const getRecoveryAccountState = userId => {
    if (!userId || getRecoveryAccountId() !== userId) return null;
    try { return JSON.parse(localStorage.getItem(`bconomy_player_state:${userId}`) || 'null')?.state || null; } catch { return null; }
};

export function completeAuthRecovery() {
    setRecoveryState('ready');
    try { localStorage.removeItem(AUTH_RECOVERY_ACCOUNT_KEY); } catch { /* optional persistence */ }
    dispatchAuthEvent('bconomy-auth-recovery-complete', { profile: currentProfile });
}

export function requireSignInForRecovery(message = 'Your account session expired. Sign in to continue.') {
    const profile = currentProfile;
    if (profile?.id && !localStorage.getItem(`bconomy_player_state:${profile.id}`)) {
        localStorage.setItem(`bconomy_player_state:${profile.id}`, JSON.stringify({
            state: profile.state || {},
            revision: Math.max(0, Number(profile.state_revision) || 0)
        }));
    }
    try {
        if (profile?.id) localStorage.setItem(AUTH_RECOVERY_ACCOUNT_KEY, profile.id);
    } catch { /* optional persistence */ }
    clearIdentityCredentials();
    setRecoveryState('requires-sign-in');
    dispatchAuthEvent('bconomy-auth-change', { session: null, profile: null });
    dispatchAuthEvent('bconomy-auth-required', { message });
}

export async function ensureGuestIdentity() {
    if (currentSession && currentProfile) return currentProfile;
    try {
        const configResponse = await fetch('/api/config/auth');
        const config = await configResponse.json();
        if (!configResponse.ok || !config.enabled) return null;
        const response = await fetch('/api/auth/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}'
        });
        const data = await response.json();
        if (!response.ok || !data.session || !data.profile) {
            throw new Error(data?.error?.message || data?.error || 'Guest identity could not be created.');
        }
        currentSession = data.session;
        currentProfile = data.profile;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
        return currentProfile;
    } catch (error) {
        console.warn('Automatic guest identity is unavailable:', error);
        return null;
    }
}

export async function migrateGuestProgress(deviceState) {
    if (!isGuestProfile(currentProfile)) return currentProfile;
    if (currentProfile.guest_migrated_at) return currentProfile;
    const response = await fetch('/api/player/guest-migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
            expectedRevision: Math.max(0, Number(currentProfile.state_revision) || 0),
            deviceState
        })
    });
    const data = await response.json();
    if (!response.ok || !data.profile) {
        throw new Error(data?.error?.message || data?.error || 'Guest progress could not be migrated.');
    }
    currentProfile = data.profile;
    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
    return currentProfile;
}

export async function recoverGuestIdentity(deviceState) {
    const snapshot = normalizeRecoverySnapshot(deviceState);
    localStorage.setItem(GUEST_RECOVERY_SNAPSHOT_KEY, JSON.stringify(snapshot));
    clearIdentityCredentials();
    setRecoveryState('guest-recovery-running');
    try {
        const replacement = await ensureGuestIdentity();
        if (!replacement) throw new Error('A replacement guest identity could not be created.');
        const migrated = await migrateGuestProgress(snapshot);
        if (!migrated?.state) throw new Error('The replacement guest state could not be verified.');
        localStorage.removeItem(GUEST_RECOVERY_SNAPSHOT_KEY);
        setRecoveryState('ready');
        dispatchAuthEvent('bconomy-identity-recovered', { profile: migrated });
        dispatchAuthEvent('bconomy-auth-change', { session: currentSession, profile: currentProfile });
        return migrated;
    } catch (error) {
        setRecoveryState('guest-recovery-failed');
        const recoveryError = new Error(error.message || 'Guest recovery failed. Retry to continue.');
        recoveryError.code = 'GUEST_RECOVERY_FAILED';
        dispatchAuthEvent('bconomy-auth-change', { session: currentSession, profile: currentProfile });
        dispatchAuthEvent('bconomy-identity-recovery-failed', { message: recoveryError.message });
        throw recoveryError;
    }
}

export async function retryGuestRecovery() {
    let snapshot = null;
    try { snapshot = JSON.parse(localStorage.getItem(GUEST_RECOVERY_SNAPSHOT_KEY) || 'null'); } catch { /* handled below */ }
    if (!snapshot) throw new Error('No guest recovery snapshot is available.');
    if (isGuestProfile(currentProfile) && !currentProfile.guest_migrated_at) {
        try {
            const migrated = await migrateGuestProgress(snapshot);
            localStorage.removeItem(GUEST_RECOVERY_SNAPSHOT_KEY);
            setRecoveryState('ready');
            dispatchAuthEvent('bconomy-identity-recovered', { profile: migrated });
            dispatchAuthEvent('bconomy-auth-change', { session: currentSession, profile: currentProfile });
            return migrated;
        } catch (error) {
            setRecoveryState('guest-recovery-failed');
            throw error;
        }
    }
    return recoverGuestIdentity(snapshot);
}

export function getAuthSession() {
    return currentSession;
}

export function getAccessToken() {
    return currentSession?.access_token || '';
}

export function getAuthHeaders() {
    const accessToken = getAccessToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export function getAuthProfile() {
    return currentProfile;
}

export function setAuthProfile(profile) {
    currentProfile = profile;
    if (profile) {
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
    } else {
        localStorage.removeItem(AUTH_PROFILE_KEY);
    }
}

/**
 * Refresh user profile from server
 */
export async function refreshUserProfile(userId) {
    if (!userId) throw Object.assign(new Error('Player profile is unavailable.'), { code: 'PROFILE_NOT_FOUND' });
    let res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
    if (res.status === 401 && await refreshAuthSession()) {
        res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
    }
    if (!res.ok) throw await responseError(res);
    const data = await res.json();
    currentProfile = data;
    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
    return currentProfile;
}

export async function refreshAuthSession() {
    const refreshToken = currentSession?.refresh_token;
    if (!refreshToken) return false;
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        const data = await response.json();
        if (!response.ok || !data.session) return false;
        currentSession = data.session;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
        return true;
    } catch (error) {
        console.error('Failed to refresh auth session:', error);
        return false;
    }
}

/**
 * Sign up a new player with Username, optional Email, and Password
 */
export async function signUpUser({ username, email, password }) {
    const requestBody = JSON.stringify({
        username: username.trim(),
        email: email ? email.trim() : undefined,
        password: password
    });
    const sendRequest = () => fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: requestBody
    });
    let res = await sendRequest();
    if (res.status === 401 && getAccessToken() && await refreshAuthSession()) {
        res = await sendRequest();
    }

    const data = await res.json();
    if (!res.ok || data.error) {
        throw new Error(responseErrorMessage(data, 'Failed to create account.'));
    }

    currentSession = data.session;
    currentProfile = data.profile;

    if (currentSession) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
    }
    if (currentProfile) {
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
    }

    window.dispatchEvent(new CustomEvent('bconomy-auth-change', {
        detail: { session: currentSession, profile: currentProfile }
    }));

    return data;
}

/**
 * Sign in existing player using Username OR Email + Password
 */
export async function signInUser({ usernameOrEmail, password }) {
    const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usernameOrEmail: usernameOrEmail.trim(),
            password: password
        })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
        throw new Error(responseErrorMessage(data, 'Invalid username or password.'));
    }

    currentSession = data.session;
    currentProfile = data.profile;

    if (currentSession) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
    }
    if (currentProfile) {
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
    }

    window.dispatchEvent(new CustomEvent('bconomy-auth-change', {
        detail: { session: currentSession, profile: currentProfile }
    }));

    return data;
}

/**
 * Sign out current player
 */
export async function signOutUser() {
    clearIdentityCredentials();
    setRecoveryState('ready');
    try { localStorage.removeItem(AUTH_RECOVERY_ACCOUNT_KEY); } catch { /* optional persistence */ }
    dispatchAuthEvent('bconomy-auth-change', { session: null, profile: null });
}
