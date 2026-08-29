/**
 * @module auth
 * Player Authentication, Session State, and Password Strength Calculator.
 */

let currentSession = null;
let currentProfile = null;

const AUTH_SESSION_KEY = 'bconomy_auth_session';
const AUTH_PROFILE_KEY = 'bconomy_auth_profile';

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
export async function initAuth() {
    try {
        const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
        const storedProfile = localStorage.getItem(AUTH_PROFILE_KEY);

        if (storedSession && storedProfile) {
            currentSession = JSON.parse(storedSession);
            currentProfile = JSON.parse(storedProfile);
        }

        if (currentProfile && currentProfile.id) {
            const refreshed = await refreshUserProfile(currentProfile.id);
            if (!refreshed) {
                currentSession = null;
                currentProfile = null;
                localStorage.removeItem(AUTH_SESSION_KEY);
                localStorage.removeItem(AUTH_PROFILE_KEY);
            }
        }

        if (!currentSession || !currentProfile) {
            await ensureGuestIdentity();
        }

        window.dispatchEvent(new CustomEvent('bconomy-auth-change', {
            detail: { session: currentSession, profile: currentProfile }
        }));

        return currentProfile;
    } catch (e) {
        console.warn('Failed to restore auth session:', e);
        return null;
    }
}

export const isGuestProfile = profile => profile?.account_kind === 'guest';

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
    if (!userId) return null;
    try {
        let res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
        if (res.status === 401 && await refreshAuthSession()) {
            res = await fetch('/api/player/profile', { headers: getAuthHeaders() });
        }
        if (res.ok) {
            const data = await res.json();
            currentProfile = data;
            localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(currentProfile));
            return currentProfile;
        }
    } catch (e) {
        console.error('Error fetching user profile:', e);
    }
    return null;
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
        throw new Error(data.error || 'Failed to create account.');
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
        throw new Error(data.error || 'Invalid username or password.');
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
    currentSession = null;
    currentProfile = null;
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_PROFILE_KEY);

    window.dispatchEvent(new CustomEvent('bconomy-auth-change', {
        detail: { session: null, profile: null }
    }));
}
