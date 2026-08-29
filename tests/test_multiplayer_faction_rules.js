'use strict';

const assert = require('assert');
const { FACTION_JOIN_MESSAGES } = require('../src/data/factionJoinMessages');
const {
    MAX_FACTION_MEMBERS,
    MAX_PENDING_JOIN_REQUESTS,
    MAX_JOIN_MESSAGE_LENGTH,
    GUEST_RETENTION_DAYS,
    FACTION_RANKS,
    FACTION_MEMBERSHIP_MODES,
    rankIndex,
    hasPermission,
    canActOnRank,
    canChangeRank,
    normalizePlayerMessage,
    validateJoinMessage,
    takeNextJoinMessage,
    chooseInactiveLeaderSuccessor,
    getModeTransitionEffects
} = require('../src/engine/factionMultiplayerRules');

assert.strictEqual(MAX_FACTION_MEMBERS, 20);
assert.strictEqual(MAX_PENDING_JOIN_REQUESTS, 5);
assert.strictEqual(MAX_JOIN_MESSAGE_LENGTH, 200);
assert.strictEqual(GUEST_RETENTION_DAYS, 365);
assert.deepStrictEqual(FACTION_RANKS, ['private', 'corporal', 'sergeant', 'lieutenant', 'leader']);
assert.deepStrictEqual(FACTION_MEMBERSHIP_MODES, ['invite_only', 'code_only', 'public']);

assert(rankIndex('leader') > rankIndex('lieutenant'));
assert.strictEqual(hasPermission('private', 'deposit'), true);
assert.strictEqual(hasPermission('private', 'sendInvitation'), false);
assert.strictEqual(hasPermission('corporal', 'sendInvitation'), true);
assert.strictEqual(hasPermission('sergeant', 'reviewJoinRequest'), true);
assert.strictEqual(hasPermission('sergeant', 'manageBoosts'), true);
assert.strictEqual(hasPermission('lieutenant', 'manageAccessCode'), true);
assert.strictEqual(hasPermission('lieutenant', 'changeMembershipMode'), false);
assert.strictEqual(hasPermission('leader', 'transferLeadership'), true);

assert.strictEqual(canActOnRank('sergeant', 'corporal'), true);
assert.strictEqual(canActOnRank('sergeant', 'sergeant'), false);
assert.strictEqual(canChangeRank('lieutenant', 'private', 'sergeant'), true);
assert.strictEqual(canChangeRank('lieutenant', 'sergeant', 'lieutenant'), false);
assert.strictEqual(canChangeRank('leader', 'sergeant', 'lieutenant'), true);
assert.strictEqual(canChangeRank('leader', 'private', 'leader'), false);

assert.strictEqual(normalizePlayerMessage('  Hello\n\tthere!\u0000  '), 'Hello there!');
assert.deepStrictEqual(validateJoinMessage('   '), {
    ok: false,
    code: 'JOIN_MESSAGE_REQUIRED',
    error: 'Write a message before sending your join request.'
});
assert.strictEqual(validateJoinMessage('A'.repeat(201)).code, 'JOIN_MESSAGE_TOO_LONG');
assert.strictEqual(validateJoinMessage('Cheerful hello!').message, 'Cheerful hello!');

assert(FACTION_JOIN_MESSAGES.length >= 40);
assert.strictEqual(new Set(FACTION_JOIN_MESSAGES).size, FACTION_JOIN_MESSAGES.length);
for (const message of FACTION_JOIN_MESSAGES) {
    assert(message.trim().length > 0);
    assert(Array.from(message).length <= MAX_JOIN_MESSAGE_LENGTH);
    assert(/[.!?]$/.test(message), `Message must end with sentence punctuation: ${message}`);
}

let remaining = [];
const seen = new Set();
for (let index = 0; index < FACTION_JOIN_MESSAGES.length; index += 1) {
    const next = takeNextJoinMessage(remaining, () => 0.25);
    assert(!seen.has(next.messageId), 'A message repeated before the shuffle bag completed');
    assert.strictEqual(next.message, FACTION_JOIN_MESSAGES[next.messageId]);
    seen.add(next.messageId);
    remaining = next.remainingIds;
}
assert.strictEqual(remaining.length, 0);
assert.strictEqual(takeNextJoinMessage(remaining, () => 0.5).remainingIds.length, FACTION_JOIN_MESSAGES.length - 1);

const successor = chooseInactiveLeaderSuccessor([
    { playerId: 'leader', rank: 'leader', joinedAt: '2026-01-01T00:00:00Z' },
    { playerId: 'late-lieutenant', rank: 'lieutenant', joinedAt: '2026-03-01T00:00:00Z' },
    { playerId: 'early-lieutenant', rank: 'lieutenant', joinedAt: '2026-02-01T00:00:00Z' },
    { playerId: 'sergeant', rank: 'sergeant', joinedAt: '2025-01-01T00:00:00Z' }
], 'leader');
assert.strictEqual(successor.playerId, 'early-lieutenant');
assert.strictEqual(chooseInactiveLeaderSuccessor([{ playerId: 'leader', rank: 'leader' }], 'leader'), null);

assert.deepStrictEqual(getModeTransitionEffects('code_only', 'public'), {
    cancelInvitations: true,
    cancelJoinRequests: false,
    invalidateAccessCode: true
});
assert.deepStrictEqual(getModeTransitionEffects('public', 'code_only'), {
    cancelInvitations: true,
    cancelJoinRequests: true,
    invalidateAccessCode: false
});
assert.deepStrictEqual(getModeTransitionEffects('invite_only', 'invite_only'), {
    cancelInvitations: false,
    cancelJoinRequests: false,
    invalidateAccessCode: false
});

console.log('✓ Multiplayer Faction Rank, message, transition, and succession rules verified');
