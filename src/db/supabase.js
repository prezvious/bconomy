/**
 * @module db/supabase
 * Supabase client and database operations.
 */
const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    return { url, key };
}

function isSupabaseConfigured() {
    const { url, key } = getSupabaseConfig();
    return !!(url && key && url.startsWith('http'));
}

function getSupabaseClient() {
    if (!isSupabaseConfigured()) {
        return null;
    }
    if (!supabaseClient) {
        const { url, key } = getSupabaseConfig();
        supabaseClient = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }
    return supabaseClient;
}

/**
 * Format raw integer player_id to display string (e.g. 1 -> "#1" or "Player #1")
 */
function formatPlayerId(playerId) {
    if (playerId === null || playerId === undefined) return '';
    return `#${playerId}`;
}

/**
 * Look up user's email by their username (for username login)
 */
async function findEmailByUsername(username) {
    const client = getSupabaseClient();
    if (!client || !username) return null;

    try {
        const { data, error } = await client
            .from('player_state')
            .select('email, username')
            .ilike('username', username.trim())
            .maybeSingle();

        if (error || !data) return null;
        return data.email;
    } catch (e) {
        console.error('Error finding email by username:', e);
        return null;
    }
}

/**
 * Retrieve user's full profile and saved state from Supabase
 */
async function getProfileByUserId(userId) {
    const client = getSupabaseClient();
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
 * Sync player state to Supabase
 */
async function syncPlayerState(userId, state) {
    const client = getSupabaseClient();
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
    formatPlayerId,
    findEmailByUsername,
    getProfileByUserId,
    syncPlayerState
};
