/**
 * @module db/supabase
 * Supabase client and authentication database operations.
 */
const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;
let supabaseAdminClient = null;

function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || '';
    const anonKey = process.env.SUPABASE_ANON_KEY || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    return { url, anonKey, serviceKey };
}

function isSupabaseConfigured() {
    const { url, anonKey, serviceKey } = getSupabaseConfig();
    return !!(url && anonKey && serviceKey && url.startsWith('http'));
}

function getSupabaseClient() {
    if (!supabaseClient) {
        const { url, anonKey } = getSupabaseConfig();
        if (!url || !anonKey) return null;
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
        if (!url || !serviceKey) return null;
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

async function findProfileByUsername(username) {
    const client = getSupabaseAdmin();
    if (!client || !username) return null;
    const cleanUsername = username.trim();
    if (!cleanUsername) return null;
    const { data, error } = await client
        .from('player_state')
        .select('id, player_id, username, email, account_kind')
        .ilike('username', cleanUsername)
        .maybeSingle();
    if (error) {
        console.error('Error finding profile by username:', error);
        return null;
    }
    return data || null;
}

/**
 * Ensure user's player_state row exists in database
 */
async function ensurePlayerProfile(userId, username, email, defaultState = null, accountKind = 'registered') {
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
                state: defaultState || {},
                account_kind: accountKind === 'guest' ? 'guest' : 'registered',
                last_active_at: new Date().toISOString()
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
            .select('id, player_id, username, email, cash, rank_index, prestige_count, state, state_revision, account_kind, last_active_at, guest_migrated_at, created_at, updated_at')
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

async function touchPlayerActivity(userId, now = new Date()) {
    const client = getSupabaseAdmin();
    if (!client || !userId) return false;
    const { error } = await client
        .from('player_state')
        .update({ last_active_at: now.toISOString() })
        .eq('id', userId);
    if (error) {
        console.error('Error updating player activity:', error);
        return false;
    }
    return true;
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
    const existingProfile = await findProfileByUsername(cleanUsername);
    if (existingProfile) {
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

async function createGuestSessionServer(defaultState = null) {
    const { url, anonKey } = getSupabaseConfig();
    if (!url || !anonKey) throw new Error('Supabase is not configured');
    const client = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data, error } = await client.auth.signInAnonymously({
        options: { data: { bconomy_guest: true } }
    });
    if (error || !data?.user || !data?.session) {
        throw new Error(error?.message || 'Guest identity could not be created.');
    }
    const username = `Guest_${data.user.id.replace(/-/g, '').slice(0, 10)}`;
    const profile = await ensurePlayerProfile(data.user.id, username, null, defaultState, 'guest');
    if (!profile) throw new Error('Guest profile could not be created.');
    return { user: data.user, session: data.session, profile };
}

async function upgradeGuestUserAdmin({ userId, username, email, password }) {
    const admin = getSupabaseAdmin();
    const { url, anonKey } = getSupabaseConfig();
    if (!admin || !url || !anonKey) throw new Error('Supabase is not configured');

    const cleanUsername = String(username || '').trim();
    if (cleanUsername.length < 2 || cleanUsername.length > 32) {
        throw new Error('Username must contain between 2 and 32 characters.');
    }
    const profile = await getProfileByUserId(userId);
    if (!profile || profile.account_kind !== 'guest') throw new Error('Only a guest identity can be upgraded.');
    const usernameOwner = await findProfileByUsername(cleanUsername);
    if (usernameOwner && usernameOwner.id !== userId) throw new Error('Username is already taken by another player.');

    const cleanEmail = email && String(email).trim()
        ? String(email).trim()
        : `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@bconomy.local`;
    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(userId, {
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { username: cleanUsername, bconomy_guest: false }
    });
    if (updateError || !updated?.user) throw new Error(updateError?.message || 'Guest account could not be upgraded.');

    const { data: updatedProfiles, error: profileError } = await admin
        .from('player_state')
        .update({
            username: cleanUsername,
            email: cleanEmail,
            account_kind: 'registered',
            last_active_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, player_id, username, email, cash, rank_index, prestige_count, state, state_revision, account_kind, last_active_at, guest_migrated_at, created_at, updated_at')
        .single();
    if (profileError || !updatedProfiles) throw new Error(profileError?.message || 'Player profile could not be upgraded.');

    const sessionClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: sessionData, error: signInError } = await sessionClient.auth.signInWithPassword({ email: cleanEmail, password });
    if (signInError || !sessionData?.session) throw new Error(signInError?.message || 'The upgraded account could not be signed in.');
    updatedProfiles.formatted_player_id = formatPlayerId(updatedProfiles.player_id);
    return { user: updated.user, session: sessionData.session, profile: updatedProfiles, upgraded: true };
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

async function refreshSessionServer(refreshToken) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase is not configured');
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data?.session) throw new Error(error?.message || 'Session refresh failed');
    return data.session;
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

async function verifyAccessToken(accessToken) {
    if (!accessToken || typeof accessToken !== 'string') return null;
    const client = getSupabaseClient();
    if (!client) return null;
    try {
        const { data, error } = await client.auth.getUser(accessToken);
        if (error || !data?.user) return null;
        return data.user;
    } catch (error) {
        console.error('Error verifying Supabase access token:', error);
        return null;
    }
}

async function commitPlayerCommand({ userId, expectedRevision, commandId, state, result }) {
    const client = getSupabaseAdmin();
    if (!client) return { status: 'unavailable', error: 'Supabase is not configured' };
    const { data, error } = await client.rpc('commit_player_command', {
        p_user_id: userId,
        p_expected_revision: expectedRevision,
        p_command_id: commandId,
        p_state: state,
        p_result: result || {}
    });
    if (error) {
        console.error('Error committing player command:', error);
        return { status: 'error', error: 'Failed to persist player command' };
    }
    return data || { status: 'error', error: 'Empty commit response' };
}

async function getPlayerCommandReceipt({ userId, commandId }) {
    const client = getSupabaseAdmin();
    if (!client) return null;
    const { data, error } = await client
        .from('player_command_receipts')
        .select('resulting_revision, result')
        .eq('user_id', userId)
        .eq('command_id', commandId)
        .maybeSingle();
    if (error) {
        console.error('Error reading player command receipt:', error);
        return null;
    }
    return data || null;
}

async function replacePlayerState({ userId, expectedRevision, state }) {
    const client = getSupabaseAdmin();
    if (!client) return { status: 'unavailable', error: 'Supabase is not configured' };
    const revision = Math.max(0, Math.floor(Number(expectedRevision) || 0));
    const { data, error } = await client
        .from('player_state')
        .update({ state, state_revision: revision + 1 })
        .eq('id', userId)
        .eq('state_revision', revision)
        .select('id, player_id, username, email, cash, rank_index, prestige_count, state, state_revision, created_at, updated_at')
        .maybeSingle();
    if (error) return { status: 'error', error: 'Failed to replace player state' };
    if (!data) return { status: 'conflict' };
    data.formatted_player_id = formatPlayerId(data.player_id);
    return { status: 'applied', profile: data };
}

module.exports = {
    isSupabaseConfigured,
    getSupabaseClient,
    getSupabaseAdmin,
    formatPlayerId,
    findEmailByUsername,
    findProfileByUsername,
    ensurePlayerProfile,
    getProfileByUserId,
    touchPlayerActivity,
    signUpUserAdmin,
    signInUserServer,
    refreshSessionServer,
    syncPlayerState,
    verifyAccessToken,
    commitPlayerCommand,
    getPlayerCommandReceipt,
    replacePlayerState,
    getSupabaseConfig,
    createGuestSessionServer,
    upgradeGuestUserAdmin
};
