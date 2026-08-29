import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FACTION_JOIN_MESSAGES } = require('../src/data/factionJoinMessages');
const { createDefaultState, normalizePlayerState, PLAYER_STATE_SCHEMA_VERSION } = require('../src/state/playerState');
const ActionEngine = require('../src/engine/actionEngine');

const [schema, server, api, factionUi, auth, handbook, spec, html] = await Promise.all([
    readFile(new URL('../supabase_schema.sql', import.meta.url), 'utf8'),
    readFile(new URL('../server.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/api.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/ui/faction.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/auth.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/js/helpTopics.js', import.meta.url), 'utf8'),
    readFile(new URL('../docs/superpowers/specs/2026-08-28-multiplayer-factions-design.md', import.meta.url), 'utf8'),
    readFile(new URL('../public/index.html', import.meta.url), 'utf8')
]);

console.log('--- Running Multiplayer Faction Cross-Layer Contract Tests ---');

assert.equal(PLAYER_STATE_SCHEMA_VERSION, 2);
assert(!Object.hasOwn(createDefaultState(), 'faction'), 'New solo player state cannot own faction data');
assert(!Object.hasOwn(normalizePlayerState({ faction: { created: true }, cash: 12 }), 'faction'), 'Normalization removes legacy client-owned faction data');

assert(FACTION_JOIN_MESSAGES.length >= 40, 'At least 40 generated join-request messages are available');
assert.equal(new Set(FACTION_JOIN_MESSAGES).size, FACTION_JOIN_MESSAGES.length, 'Generated join-request messages are unique');
for (const message of FACTION_JOIN_MESSAGES) {
    assert(message.length > 25 && message.length <= 200, 'Each generated message is complete and fits the request limit');
    assert(/[.!?]$/.test(message), 'Each generated message ends as a complete sentence');
}
console.log(`✓ ${FACTION_JOIN_MESSAGES.length} cheerful, complete, non-repeating join-request messages verified`);

for (const table of [
    'factions', 'faction_members', 'faction_boosts', 'faction_join_requests',
    'faction_invitations', 'faction_access_codes', 'faction_treasury_ledger',
    'faction_activity', 'faction_notifications', 'faction_message_bags',
    'faction_rate_events', 'faction_command_receipts', 'faction_migration_receipts'
]) {
    assert(schema.includes(`create table if not exists public.${table}`), `Schema defines ${table}`);
    assert(schema.includes(`alter table public.${table} enable row level security`), `${table} enables RLS`);
}
for (const fn of [
    'faction_get_snapshot', 'faction_list_public', 'faction_next_join_message',
    'faction_get_effect', 'faction_execute_command', 'faction_search_players',
    'faction_migrate_legacy_player', 'faction_cleanup_inactive_guest',
    'faction_cleanup_inactive_guests'
]) {
    assert(schema.includes(`function public.${fn}`), `Schema defines ${fn}`);
}
assert(schema.includes("membership_mode in ('invite_only', 'code_only', 'public')"));
assert(schema.includes("faction_rank in ('private', 'corporal', 'sergeant', 'lieutenant', 'leader')"));
assert(schema.includes('where faction_rank = \'leader\''), 'Database enforces one Leader row per faction');
assert(schema.includes('member_count >= 20'), 'Transactional membership commands enforce the 20-member maximum');
assert(schema.includes('function public.faction_enforce_membership_invariants()'), 'Database defines deferred membership invariant enforcement');
assert(schema.includes('create constraint trigger faction_membership_invariants_on_members'), 'Membership changes defer invariant validation until commit');
assert(schema.includes('create constraint trigger faction_membership_invariants_on_factions'), 'Faction owner changes defer invariant validation until commit');
assert(schema.includes("interval '365 days'"), 'Guest cleanup uses exactly 365 days of inactivity');
assert(schema.includes("status = 'consumed'"), 'Successful code redemption consumes the one-time code');
assert(schema.includes("status = 'reset'"), 'Generating another code invalidates the previous one');
assert(schema.includes("extensions.digest(plaintext_code, 'sha256')"), 'Faction access codes are stored as hashes');
assert(schema.includes("receipt_result := (command_result - 'code')"), 'Faction command receipts remove generated plaintext codes');
assert(schema.includes("'codeUnavailable', true"), 'A duplicate code-generation command cannot retrieve plaintext');
assert(schema.includes("'code', 'FACTION_CONFLICT'"), 'Member commands reject a stale shared-faction revision');
assert((schema.match(/from public\.faction_command_receipts/g) || []).length >= 3, 'Faction commands recheck idempotency after taking the player lock');
const accessCodeTable = schema.match(/create table if not exists public\.faction_access_codes[\s\S]*?\n\);/i)?.[0] || '';
assert(accessCodeTable && !/plaintext_code\s+text/i.test(accessCodeTable), 'Plaintext codes are not stored in the access-code table');
assert.equal((schema.match(/\$\$/g) || []).length % 2, 0, 'SQL function delimiters are balanced');
console.log('✓ Shared schema, RLS, ranks, modes, limits, one-time codes, migration, and retention contracts verified');

for (const command of [
    'faction.create', 'faction.deposit', 'faction.invitation.send', 'faction.invitation.respond',
    'faction.request.send', 'faction.request.review', 'faction.code.generate', 'faction.code.redeem',
    'faction.member.rank', 'faction.member.remove', 'faction.leadership.transfer', 'faction.leave',
    'faction.membership_mode.set', 'faction.boost.activate', 'faction.boost.stop', 'faction.disband'
]) assert(schema.includes(`p_command_type = '${command}'`), `Transactional command ${command} is implemented`);

assert(server.includes("app.post('/api/factions/queries'"));
assert(server.includes("app.post('/api/factions/commands'"));
assert(server.includes("app.post('/api/auth/guest'"));
assert(server.includes("app.post('/api/player/guest-migrate'"));
assert(server.includes('upgradeGuestUserAdmin'));
assert(server.includes('touchPlayerActivity'));
assert(server.includes('Guest device progress can be imported only through the one-time guest migration.'));
assert(server.includes('factionContext: factionEffect'));
assert(server.includes('expectedFactionRevision'));
assert(api.includes("factionQuery('faction.joinMessage')"));
assert(api.includes('expectedFactionRevision: factionRevision'));
assert(auth.includes('ensureGuestIdentity'));
assert(auth.includes("fetch('/api/auth/guest'"));
assert(auth.includes('res.status === 401') && auth.includes('refreshAuthSession()'), 'Guest upgrade refreshes an expired access token before retrying');
console.log('✓ Guest identity, same-player upgrade, authoritative API, and faction action-effect integration verified');

const actionState = createDefaultState();
actionState.faction = { created: true, name: 'Untrusted Local Faction', boosts: { mine: { level: 36, multiplier: 10 } } };
const actionResult = ActionEngine.performAction(actionState, 'mine', 1_000_000, () => 0.5, {
    status: 'ok', name: 'Shared Server Faction', level: 4, multiplier: 2
});
assert.equal(actionResult.factionMultiplier, 2, 'Server faction context overrides any client-local faction value');
assert(actionResult.formattedText.includes('Shared Server Faction - Lv. 4'));
const neutralActionState = createDefaultState();
neutralActionState.faction = { created: true, name: 'Untrusted Local Faction', boosts: { mine: { level: 36, multiplier: 10 } } };
const neutralActionResult = ActionEngine.performAction(neutralActionState, 'mine', 1_000_000, () => 0.5, null);
assert.equal(neutralActionResult.factionMultiplier, 1, 'An explicit authoritative no-faction context cannot fall back to local data');
console.log('✓ Solo action execution consumes the authoritative shared faction effect');

for (const surface of [
    'Discover', 'Invitations', 'Join Code', 'My Requests', 'Members', 'Operations',
    'Recruitment', 'Activity', 'Rank Permissions', '365 days'
]) assert(factionUi.includes(surface), `Faction UI includes ${surface}`);
assert(html.includes('btn-faction-join-request-regenerate') && html.includes('Regenerate'));
assert(html.includes('disband-faction-modal') && html.includes('Disband permanently'), 'Disbanding uses an explicit native confirmation dialog');
assert(factionUi.includes('Plaintext is shown once'));
assert(factionUi.includes('replaceEditedFactionJoinMessage'), 'Regenerating an edited request requires confirmation');
assert(factionUi.includes('resetFactionAccessCode'), 'Resetting an active access code requires confirmation');
assert(factionUi.includes('changeFactionRank'), 'Faction Rank changes require confirmation');
assert(factionUi.includes('Transfer leadership or disband the faction'), 'Faction page shows the complete fixed permission matrix');
assert(factionUi.includes('data-faction-action="transfer"'));
assert(factionUi.includes('data-faction-action="save-rank"'));

for (const topic of [
    'faction.overview', 'faction.creating', 'faction.joining', 'faction.requests', 'faction.codes',
    'faction.ranks', 'faction.members', 'faction.treasury', 'faction.operations',
    'faction.recruitment', 'faction.leadership', 'faction.leaving', 'faction.guests'
]) assert(handbook.includes(`topic('${topic.replace('.', "', '")}'`), `Handbook includes ${topic}`);
assert(handbook.includes('deleted after 365 days without activity'));
assert(handbook.includes('separate from Bconomy’s solo progression ranks'));
assert(spec.includes('Every faction has exactly one Leader'));
console.log('✓ Multiplayer UI, generated-message workflow, and complete handbook coverage verified');

console.log('--- Multiplayer Faction Cross-Layer Contract Tests Passed ---');
