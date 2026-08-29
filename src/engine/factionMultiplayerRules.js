'use strict';

const { FACTION_JOIN_MESSAGES } = require('../data/factionJoinMessages');

const MAX_FACTION_MEMBERS = 20;
const MAX_PENDING_JOIN_REQUESTS = 5;
const MAX_JOIN_MESSAGE_LENGTH = 200;
const GUEST_RETENTION_DAYS = 365;
const FACTION_RANKS = Object.freeze(['private', 'corporal', 'sergeant', 'lieutenant', 'leader']);
const FACTION_MEMBERSHIP_MODES = Object.freeze(['invite_only', 'code_only', 'public']);

const PERMISSIONS = Object.freeze({
    viewFaction: 'private',
    deposit: 'private',
    receiveBoosts: 'private',
    leaveFaction: 'private',
    sendInvitation: 'corporal',
    revokeOwnInvitation: 'corporal',
    reviewJoinRequest: 'sergeant',
    removeLowerMember: 'sergeant',
    manageBoosts: 'sergeant',
    changeLowerRank: 'lieutenant',
    manageAccessCode: 'lieutenant',
    editFaction: 'lieutenant',
    changeMembershipMode: 'leader',
    promoteToLieutenant: 'leader',
    transferLeadership: 'leader',
    disbandFaction: 'leader'
});

const DISPLAY_RANKS = Object.freeze({
    private: 'Private',
    corporal: 'Corporal',
    sergeant: 'Sergeant',
    lieutenant: 'Lieutenant',
    leader: 'Leader'
});

const rankIndex = rank => FACTION_RANKS.indexOf(String(rank || '').toLowerCase());
const isFactionRank = rank => rankIndex(rank) !== -1;
const isMembershipMode = mode => FACTION_MEMBERSHIP_MODES.includes(String(mode || '').toLowerCase());

function hasPermission(rank, permission) {
    const minimumRank = PERMISSIONS[permission];
    return minimumRank !== undefined && rankIndex(rank) >= rankIndex(minimumRank);
}

function canActOnRank(actorRank, targetRank) {
    const actor = rankIndex(actorRank);
    const target = rankIndex(targetRank);
    return actor >= 0 && target >= 0 && actor > target;
}

function canChangeRank(actorRank, targetCurrentRank, targetNextRank) {
    if (!hasPermission(actorRank, 'changeLowerRank')) return false;
    if (!canActOnRank(actorRank, targetCurrentRank)) return false;
    const next = rankIndex(targetNextRank);
    if (next < 0 || targetNextRank === 'leader') return false;
    if (actorRank === 'lieutenant' && next >= rankIndex('lieutenant')) return false;
    return next < rankIndex(actorRank);
}

function normalizePlayerMessage(value) {
    return String(value ?? '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/[\t\r\n ]+/g, ' ')
        .trim();
}

function validateJoinMessage(value) {
    const message = normalizePlayerMessage(value);
    const length = Array.from(message).length;
    if (!message) {
        return { ok: false, code: 'JOIN_MESSAGE_REQUIRED', error: 'Write a message before sending your join request.' };
    }
    if (length > MAX_JOIN_MESSAGE_LENGTH) {
        return {
            ok: false,
            code: 'JOIN_MESSAGE_TOO_LONG',
            error: `Join-request messages cannot exceed ${MAX_JOIN_MESSAGE_LENGTH} characters.`
        };
    }
    return { ok: true, message, length };
}

function shuffledMessageIds(rng = Math.random) {
    const ids = FACTION_JOIN_MESSAGES.map((_, index) => index);
    for (let index = ids.length - 1; index > 0; index -= 1) {
        const roll = Number(rng());
        const bounded = Number.isFinite(roll) ? Math.min(0.9999999999999999, Math.max(0, roll)) : 0;
        const swapIndex = Math.floor(bounded * (index + 1));
        [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
    }
    return ids;
}

function takeNextJoinMessage(remainingIds, rng = Math.random) {
    const available = Array.isArray(remainingIds)
        ? remainingIds.filter((id, index, values) => Number.isInteger(id)
            && id >= 0
            && id < FACTION_JOIN_MESSAGES.length
            && values.indexOf(id) === index)
        : [];
    const bag = available.length ? [...available] : shuffledMessageIds(rng);
    const messageId = bag.shift();
    return {
        messageId,
        message: FACTION_JOIN_MESSAGES[messageId],
        remainingIds: bag
    };
}

function chooseInactiveLeaderSuccessor(members, inactiveLeaderId) {
    const candidates = (Array.isArray(members) ? members : [])
        .filter(member => member && member.playerId !== inactiveLeaderId && isFactionRank(member.rank))
        .sort((left, right) => {
            const rankDifference = rankIndex(right.rank) - rankIndex(left.rank);
            if (rankDifference) return rankDifference;
            const leftJoined = new Date(left.joinedAt || 0).getTime();
            const rightJoined = new Date(right.joinedAt || 0).getTime();
            if (leftJoined !== rightJoined) return leftJoined - rightJoined;
            return String(left.playerId).localeCompare(String(right.playerId));
        });
    return candidates[0] || null;
}

function getModeTransitionEffects(previousMode, nextMode) {
    if (!isMembershipMode(previousMode) || !isMembershipMode(nextMode) || previousMode === nextMode) {
        return { cancelInvitations: false, cancelJoinRequests: false, invalidateAccessCode: false };
    }
    return {
        cancelInvitations: nextMode === 'code_only' || nextMode === 'public',
        cancelJoinRequests: nextMode === 'invite_only' || nextMode === 'code_only',
        invalidateAccessCode: previousMode === 'code_only' && nextMode !== 'code_only'
    };
}

module.exports = {
    MAX_FACTION_MEMBERS,
    MAX_PENDING_JOIN_REQUESTS,
    MAX_JOIN_MESSAGE_LENGTH,
    GUEST_RETENTION_DAYS,
    FACTION_RANKS,
    FACTION_MEMBERSHIP_MODES,
    DISPLAY_RANKS,
    PERMISSIONS,
    rankIndex,
    isFactionRank,
    isMembershipMode,
    hasPermission,
    canActOnRank,
    canChangeRank,
    normalizePlayerMessage,
    validateJoinMessage,
    shuffledMessageIds,
    takeNextJoinMessage,
    chooseInactiveLeaderSuccessor,
    getModeTransitionEffects
};
