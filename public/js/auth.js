/**
 * @module auth
 * Supabase client authentication and Password Strength Calculator.
 */

let supabaseInstance = null;
let currentSession = null;
let currentProfile = null;

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

    // If password is very short (< 6 chars), force level 1
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
 * Initialize Supabase Client in the browser
 */
export async function initAuth() {
    try {
        // First check if window.supabase is available from CDN
        if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
            console.warn('Supabase JS library not loaded yet');
            return null;
        }

        // Fetch public Supabase configuration from server
        const res = await fetch('/api/config/auth');
        if (!res.ok) return null;
        const config = await res.json();

        if (!config.enabled || !config.supabaseUrl || !config.supabaseAnonKey) {
            console.log('Supabase not configured or enabled');
            return null;
        }

        supabaseInstance = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

        // Check for existing active session
        const { data: { session } } = await supabaseInstance.auth.getSession();
        if (session && session.user) {
            currentSession = session;
            await refreshUserProfile(session.user.id);
        }

        // Listen for auth state changes
        supabaseInstance.auth.onAuthStateChange(async (event, session) => {
            currentSession = session;
            if (session && session.user) {
                await refreshUserProfile(session.user.id);
            } else {
                currentProfile = null;
            }
            window.dispatchEvent(new CustomEvent('bconomy-auth-change', { detail: { session, profile: currentProfile } }));
        });

        return supabaseInstance;
    } catch (e) {
        console.error('Failed to initialize Supabase Auth:', e);
        return null;
    }
}

export function getSupabase() {
    return supabaseInstance;
}

export function getAuthSession() {
    return currentSession;
}

export function getAuthProfile() {
    return currentProfile;
}

export function setAuthProfile(profile) {
    currentProfile = profile;
}

/**
 * Refresh user profile and sequential Player ID from server/database
 */
export async function refreshUserProfile(userId) {
    if (!userId) return null;
    try {
        const res = await fetch(`/api/player/profile/${userId}`);
        if (res.ok) {
            currentProfile = await res.json();
            return currentProfile;
        }
    } catch (e) {
        console.error('Error fetching user profile:', e);
    }
    return null;
}

/**
 * Sign up a new player with Username, optional Email, and Password
 */
export async function signUpUser({ username, email, password }) {
    if (!supabaseInstance) {
        throw new Error('Supabase is not configured.');
    }

    const cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
        throw new Error('Username must be at least 3 characters.');
    }

    // If email is not provided, generate a dedicated system email for Supabase Auth
    let userEmail = email && email.trim() ? email.trim() : `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;

    const { data, error } = await supabaseInstance.auth.signUp({
        email: userEmail,
        password: password,
        options: {
            data: {
                username: cleanUsername
            }
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    if (data.user) {
        // Wait briefly for trigger to populate public.player_state
        await new Promise(r => setTimeout(r, 600));
        await refreshUserProfile(data.user.id);
    }

    return data;
}

/**
 * Sign in existing player using Username OR Email + Password
 */
export async function signInUser({ usernameOrEmail, password }) {
    if (!supabaseInstance) {
        throw new Error('Supabase is not configured.');
    }

    const identifier = usernameOrEmail.trim();
    let loginEmail = identifier;

    // If identifier is not an email address, lookup email by username via backend API
    if (!identifier.includes('@')) {
        try {
            const lookupRes = await fetch('/api/player/find-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: identifier })
            });

            if (lookupRes.ok) {
                const lookupData = await lookupRes.json();
                if (lookupData.email) {
                    loginEmail = lookupData.email;
                }
            } else {
                // Fallback to synthetic email format if not in lookup
                loginEmail = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;
            }
        } catch (e) {
            loginEmail = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;
        }
    }

    const { data, error } = await supabaseInstance.auth.signInWithPassword({
        email: loginEmail,
        password: password
    });

    if (error) {
        throw new Error(error.message || 'Invalid username or password.');
    }

    if (data.user) {
        await refreshUserProfile(data.user.id);
    }

    return data;
}

/**
 * Sign out current player
 */
export async function signOutUser() {
    if (supabaseInstance) {
        await supabaseInstance.auth.signOut();
    }
    currentSession = null;
    currentProfile = null;
    window.dispatchEvent(new CustomEvent('bconomy-auth-change', { detail: { session: null, profile: null } }));
}
