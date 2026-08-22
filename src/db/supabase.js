/**
 * @module db/supabase
 * Supabase client and authentication database operations.
 */
const { createClient } = require('@supabase/supabase-js');

const DEFAULT_SUPABASE_URL = 'https://mlaivuzdwevmzuhxjraw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWl2dXpkd2V2bXp1aHhqcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTQ5NDUsImV4cCI6MjEwMjk5MDk0NX0.2FvGex8DNjpzUY7Yeh4DFd7RCBeV3PFlUQ0I8r71nfc';
const DEFAULT_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWl2dXpkd2V2bXp1aHhqcmF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQxNDk0NSwiZXhwIjoyMTAyOTkwOTQ1fQ.9RZQyeIbOVoj0gTCn8o7OF0UV3iEZtCEn8YUdCg1uA4';

let supabaseClient = null;
let supabaseAdminClient = null;

function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_KEY;
    return { url, anonKey, serviceKey };
}

function isSupabaseConfigured() {
    const { url, anonKey } = getSupabaseConfig();
    return !!(url && anonKey && url.startsWith('http'));
}

function getSupabaseClient() {
    if (!supabaseClient) {
        const { url, anonKey } = getSupabaseConfig();
        supabaseClient = createClient(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }
    return supabaseClient;
}

function getSupabaseAdmin() {
    if (!supabaseAdminClient) {
        const { url, serviceKey } = getSupabaseConfig();
        supabaseAdminClient = createClient(url, serviceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }
    return supabaseAdminClient;
}

/**
 * Format raw integer player_id to display string (e.g. 1 -> "#1" or "Player #1")
 */
function formatPlayerId(playerId) {
    if (playerId === null || playerId === undefined) return '';
    return `#${playerId}`;
}

/**
 * Look up user's email by their username
 */
async function findEmailByUsername(username) {
    const client = getSupabaseAdmin();
    if (!client || !username) return null;

    try {
        const cleanUsername = username.trim().toLowerCase();
        const { data, error } = await client
            .from('player_state')
            .select('email, username')
            .ilike('username', cleanUsername)
            .maybeSingle();

        if (error || !data) return null;
        return data.email;
    } catch (e) {
        console.error('Error finding email by username:', e);
        return null;
    }
}

/**
 * Ensure user's player_state row exists in database
 */
async function ensurePlayerProfile(userId, username, email, defaultState = null) {
    const client = getSupabaseAdmin();
    if (!client || !userId) return null;

    try {
        const { data: existing } = await client
            .from('player_state')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (existing) {
            existing.formatted_player_id = formatPlayerId(existing.player_id);
            return existing;
        }

        // Insert new profile
        const { data: inserted, error } = await client
            .from('player_state')
            .insert({
                id: userId,
                username: username || `Player_${userId.substring(0, 6)}`,
                email: email || null,
                cash: 0,
                rank_index: 0,
                prestige_count: 0,
                state: defaultState || {}
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating player profile:', error);
            return null;
        }

        if (inserted) {
            inserted.formatted_player_id = formatPlayerId(inserted.player_id);
        }
        return inserted;
    } catch (e) {
        console.error('Error in ensurePlayerProfile:', e);
        return null;
    }
}

/**
 * Retrieve user's full profile and saved state from Supabase
 */
async function getProfileByUserId(userId) {
    const client = getSupabaseAdmin();
    if (!client || !userId) return null;

    try {
        const { data, error } = await client
            .from('player_state')
            .select('id, player_id, username, email, cash, rank_index, prestige_count, state, created_at, updated_at')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching player profile:', error);
            return null;
        }

        if (data) {
            data.formatted_player_id = formatPlayerId(data.player_id);
        }
        return data;
    } catch (e) {
        console.error('Error fetching profile from Supabase:', e);
        return null;
    }
}

/**
 * Sign up a new user via Supabase Admin API (auto-confirms email)
 */
async function signUpUserAdmin({ username, email, password, defaultState }) {
    const admin = getSupabaseAdmin();
    if (!admin) throw new Error('Supabase is not configured');

    const cleanUsername = username.trim();
    if (!cleanUsername || cleanUsername.length < 2) {
        throw new Error('Username must be at least 2 characters long.');
    }

    // Check if username already exists
    const existingEmail = await findEmailByUsername(cleanUsername);
    if (existingEmail) {
        throw new Error('Username is already taken by another player.');
    }

    const cleanEmail = email && email.trim() ? email.trim() : `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;

    // Create user with email_confirm: true
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
            username: cleanUsername
        }
    });

    if (createError) {
        throw new Error(createError.message);
    }

    const user = userData.user;

    // Ensure player profile row exists
    const profile = await ensurePlayerProfile(user.id, cleanUsername, cleanEmail, defaultState);

    // Sign in to get session tokens
    const { data: sessionData, error: signInError } = await admin.auth.signInWithPassword({
        email: cleanEmail,
        password: password
    });

    return {
        user,
        session: sessionData?.session || null,
        profile
    };
}

/**
 * Sign in user with username or email
 */
async function signInUserServer({ usernameOrEmail, password }) {
    const admin = getSupabaseAdmin();
    if (!admin) throw new Error('Supabase is not configured');

    const identifier = usernameOrEmail.trim();
    let loginEmail = identifier;

    if (!identifier.includes('@')) {
        const foundEmail = await findEmailByUsername(identifier);
        if (foundEmail) {
            loginEmail = foundEmail;
        } else {
            loginEmail = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;
        }
    }

    const { data, error } = await admin.auth.signInWithPassword({
        email: loginEmail,
        password: password
    });

    if (error) {
        throw new Error(error.message || 'Invalid username or password.');
    }

    const profile = await getProfileByUserId(data.user.id);

    return {
        user: data.user,
        session: data.session,
        profile
    };
}

/**
 * Sync player state to Supabase
 */
async function syncPlayerState(userId, state) {
    const client = getSupabaseAdmin();
    if (!client || !userId || !state) return false;

    try {
        const cash = Number(state.cash) || 0;
        const rankIndex = Number(state.rankIndex) || 0;
        const prestigeCount = Number(state.prestigeCount) || 0;

        const { error } = await client
            .from('player_state')
            .update({
                state: state,
                cash: cash,
                rank_index: rankIndex,
                prestige_count: prestigeCount,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) {
            console.error('Error syncing state to Supabase:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Error syncing state to Supabase:', e);
        return false;
    }
}

module.exports = {
    isSupabaseConfigured,
    getSupabaseClient,
    getSupabaseAdmin,
    formatPlayerId,
    findEmailByUsername,
    ensurePlayerProfile,
    getProfileByUserId,
    signUpUserAdmin,
    signInUserServer,
    syncPlayerState
};
