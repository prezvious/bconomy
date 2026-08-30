'use strict';

const { getSupabaseAdmin } = require('./supabase');
const { FACTION_JOIN_MESSAGES } = require('../data/factionJoinMessages');

async function callFactionRpc(name, params) {
    const client = getSupabaseAdmin();
    if (!client) return { status: 'unavailable', code: 'PERSISTENCE_UNAVAILABLE', message: 'Multiplayer factions require a configured Supabase project.' };
    const { data, error } = await client.rpc(name, params);
    if (error) {
        console.error(`Faction RPC ${name} failed:`, error);
        return { status: 'error', code: 'PERSISTENCE_ERROR', message: 'Faction data could not be loaded safely.' };
    }
    return data || { status: 'error', code: 'EMPTY_RESPONSE', message: 'The faction service returned an empty response.' };
}

const getFactionSnapshot = (userId, now = new Date()) => callFactionRpc('faction_get_snapshot', {
    p_user_id: userId,
    p_now: now.toISOString()
});

const listPublicFactions = (userId, { search = '', limit = 24, offset = 0 } = {}, now = new Date()) => callFactionRpc('faction_list_public', {
    p_user_id: userId,
    p_search: String(search || '').slice(0, 64),
    p_limit: Math.max(1, Math.min(50, Math.floor(Number(limit) || 24))),
    p_offset: Math.max(0, Math.floor(Number(offset) || 0)),
    p_now: now.toISOString()
});

const searchFactionPlayers = (userId, { search = '', limit = 10 } = {}, now = new Date()) => callFactionRpc('faction_search_players', {
    p_user_id: userId,
    p_search: String(search || '').slice(0, 64),
    p_limit: Math.max(1, Math.min(20, Math.floor(Number(limit) || 10))),
    p_now: now.toISOString()
});

async function getNextJoinMessage(userId, now = new Date()) {
    const response = await callFactionRpc('faction_next_join_message', {
        p_user_id: userId,
        p_now: now.toISOString()
    });
    if (response.status !== 'ok') return response;
    const messageId = Number(response.messageId);
    if (!Number.isInteger(messageId) || !FACTION_JOIN_MESSAGES[messageId]) {
        return { status: 'error', code: 'INVALID_MESSAGE_ID', message: 'A join-request message could not be generated.' };
    }
    return { ...response, message: FACTION_JOIN_MESSAGES[messageId] };
}

const executeFactionCommand = ({ userId, commandId, expectedPlayerRevision, expectedFactionRevision = null, type, payload = {}, now = new Date() }) => callFactionRpc('faction_execute_command', {
    p_user_id: userId,
    p_command_id: commandId,
    p_expected_player_revision: Math.max(0, Math.floor(Number(expectedPlayerRevision) || 0)),
    p_command_type: type,
    p_payload: payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {},
    p_expected_faction_revision: Number.isSafeInteger(Number(expectedFactionRevision)) && expectedFactionRevision !== null
        ? Math.max(0, Number(expectedFactionRevision))
        : null,
    p_now: now.toISOString()
});

const executeFactionCommandV2 = ({ userId, commandId, expectedPlayerRevision, expected = {}, type, payload = {}, now = new Date() }) => callFactionRpc('faction_execute_command_v2', {
    p_user_id: userId,
    p_command_id: commandId,
    p_expected_player_revision: Math.max(0, Math.floor(Number(expectedPlayerRevision) || 0)),
    p_command_type: type,
    p_payload: payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {},
    p_expected: expected && typeof expected === 'object' && !Array.isArray(expected) ? expected : {},
    p_now: now.toISOString()
});

const getFactionEffect = (userId, actionType, now = new Date()) => callFactionRpc('faction_get_effect', {
    p_user_id: userId,
    p_action_type: actionType,
    p_now: now.toISOString()
});

const migrateLegacyFaction = ({ userId, state, expectedRevision, guestImport, now = new Date() }) => callFactionRpc('faction_migrate_legacy_player', {
    p_user_id: userId,
    p_state: state,
    p_expected_revision: Math.max(0, Math.floor(Number(expectedRevision) || 0)),
    p_guest_import: !!guestImport,
    p_now: now.toISOString()
});

const cleanupInactiveGuest = (userId, now = new Date()) => callFactionRpc('faction_cleanup_inactive_guest', {
    p_user_id: userId,
    p_now: now.toISOString()
});

const cleanupInactiveGuests = (now = new Date()) => callFactionRpc('faction_cleanup_inactive_guests', {
    p_now: now.toISOString()
});

module.exports = {
    getFactionSnapshot,
    listPublicFactions,
    searchFactionPlayers,
    getNextJoinMessage,
    executeFactionCommand,
    executeFactionCommandV2,
    getFactionEffect,
    migrateLegacyFaction,
    cleanupInactiveGuest,
    cleanupInactiveGuests
};
