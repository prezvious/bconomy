'use strict';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEMBERSHIP_MODES = new Set(['invite_only', 'code_only', 'public']);
const FACTION_RANKS = new Set(['private', 'corporal', 'sergeant', 'lieutenant', 'leader']);
const BOOST_ACTIONS = new Set(['mine', 'explore', 'hunt', 'fish', 'work']);

const EXPECTATION_FIELDS = Object.freeze({
    'faction.membership_mode.set': ['membershipMode'],
    'faction.invitation.send': ['membershipMode'],
    'faction.code.generate': ['membershipMode', 'accessCodeVersion'],
    'faction.customize': ['name', 'description'],
    'faction.member.rank': ['targetMember'],
    'faction.member.remove': ['targetMember'],
    'faction.boost.activate': ['boost'],
    'faction.boost.stop': ['boost'],
    'faction.disband': ['name', 'memberCount']
});

const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const textLength = value => Array.from(value).length;
const invalid = message => ({ ok: false, error: { code: 'INVALID_FACTION_EXPECTATION', message } });

function validateFactionExpected(commandType, expected) {
    if (!isPlainObject(expected) || !hasOwn(expected, 'factionId')) {
        return invalid('Faction API v2 commands require an expected object with factionId.');
    }
    if (expected.factionId !== null && !UUID_PATTERN.test(String(expected.factionId || ''))) {
        return invalid('expected.factionId must be a UUID or null.');
    }

    const required = EXPECTATION_FIELDS[commandType] || [];
    const allowed = new Set(['factionId', ...required]);
    const unexpected = Object.keys(expected).find(key => !allowed.has(key));
    if (unexpected) return invalid(`expected.${unexpected} is not valid for ${commandType}.`);
    const missing = required.find(key => !hasOwn(expected, key));
    if (missing) return invalid(`expected.${missing} is required for ${commandType}.`);

    if (hasOwn(expected, 'membershipMode') && !MEMBERSHIP_MODES.has(expected.membershipMode)) {
        return invalid('expected.membershipMode is invalid.');
    }
    if (hasOwn(expected, 'name') && (typeof expected.name !== 'string' || textLength(expected.name) > 32)) {
        return invalid('expected.name must be a string of at most 32 characters.');
    }
    if (hasOwn(expected, 'description') && (typeof expected.description !== 'string' || textLength(expected.description) > 160)) {
        return invalid('expected.description must be a string of at most 160 characters.');
    }
    if (hasOwn(expected, 'memberCount') && (!Number.isSafeInteger(expected.memberCount) || expected.memberCount < 0 || expected.memberCount > 20)) {
        return invalid('expected.memberCount must be an integer from 0 through 20.');
    }
    if (hasOwn(expected, 'accessCodeVersion')
        && expected.accessCodeVersion !== null
        && !UUID_PATTERN.test(String(expected.accessCodeVersion || ''))) {
        return invalid('expected.accessCodeVersion must be a UUID or null.');
    }
    if (hasOwn(expected, 'targetMember')) {
        const target = expected.targetMember;
        if (!isPlainObject(target)
            || Object.keys(target).some(key => !['playerId', 'factionRank'].includes(key))
            || !Number.isSafeInteger(target.playerId)
            || target.playerId <= 0
            || !FACTION_RANKS.has(target.factionRank)) {
            return invalid('expected.targetMember must contain a positive playerId and valid factionRank.');
        }
    }
    if (hasOwn(expected, 'boost')) {
        const boost = expected.boost;
        if (!isPlainObject(boost)
            || Object.keys(boost).some(key => !['actionType', 'configRevision'].includes(key))
            || !BOOST_ACTIONS.has(boost.actionType)
            || !Number.isSafeInteger(boost.configRevision)
            || boost.configRevision < 0) {
            return invalid('expected.boost must contain a valid actionType and non-negative configRevision.');
        }
    }

    return { ok: true, value: expected };
}

module.exports = {
    BOOST_ACTIONS,
    EXPECTATION_FIELDS,
    FACTION_RANKS,
    MEMBERSHIP_MODES,
    validateFactionExpected
};
