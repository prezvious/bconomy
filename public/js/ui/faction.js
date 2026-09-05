// Server-authoritative multiplayer faction UI.
import { getState } from '../state.js';
import { getAuthProfile, isGuestProfile } from '../auth.js';
import { iconHtml, formatDisplayNumber, formatMoney, formatDurationMs } from '../utils.js';
import {
    doFactionState,
    doFactionDirectory,
    doFactionPlayerSearch,
    doFactionJoinMessage,
    doFactionCreate,
    doFactionDeposit,
    doFactionActivateBoost,
    doFactionStopBoost,
    doFactionCustomize,
    doFactionSetMembershipMode,
    doFactionSendInvitation,
    doFactionRespondInvitation,
    doFactionRevokeInvitation,
    doFactionSendJoinRequest,
    doFactionReviewJoinRequest,
    doFactionWithdrawJoinRequest,
    doFactionGenerateCode,
    doFactionRedeemCode,
    doFactionSetMemberRank,
    doFactionRemoveMember,
    doFactionTransferLeadership,
    doFactionLeave,
    doFactionDisband,
    doFactionReadNotification
} from '../api.js';
import { renderHeader } from './header.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';
import { openDialog, closeDialog, showConfirmation } from './modal.js';
import {
    FACTION_ACTIVITY_DENSITIES,
    paginateFactionHistory,
    readFactionActivityDensity,
    writeFactionActivityDensity
} from './factionActivityPaging.js';

const CREATION_COST = 1000000;
const MEMBER_LIMIT = 20;
const ACTIONS = Object.freeze([
    { id: 'mine', name: 'Mining', icon: 'lucide:pickaxe' },
    { id: 'explore', name: 'Exploring', icon: 'lucide:compass' },
    { id: 'hunt', name: 'Hunting', icon: 'lucide:crosshair' },
    { id: 'fish', name: 'Fishing', icon: 'lucide:fish' },
    { id: 'work', name: 'Work', icon: 'lucide:briefcase' }
]);
const RANKS = Object.freeze(['private', 'corporal', 'sergeant', 'lieutenant', 'leader']);
const RANK_WEIGHT = Object.freeze({ private: 0, corporal: 1, sergeant: 2, lieutenant: 3, leader: 4 });
const RANK_LABEL = Object.freeze({ private: 'Private', corporal: 'Corporal', sergeant: 'Sergeant', lieutenant: 'Lieutenant', leader: 'Leader' });
const MODE_LABEL = Object.freeze({ invite_only: 'Invite-only', code_only: 'Code-only', public: 'Public requests' });
const PERMISSION_ROWS = Object.freeze([
    ['View the faction, roster, permissions, and activity', [true, true, true, true, true]],
    ['Deposit personal cash into the treasury', [true, true, true, true, true]],
    ['Receive shared faction boosts', [true, true, true, true, true]],
    ['Leave the faction', [true, true, true, true, 'Transfer first']],
    ['Send invitations in Invite-only mode', [false, true, true, true, true]],
    ['Revoke an invitation they sent', [false, true, true, true, true]],
    ['Review public join requests', [false, false, true, true, true]],
    ['Remove lower-ranked members', [false, false, true, true, true]],
    ['Activate, extend, modify, or stop boosts', [false, false, true, true, true]],
    ['Promote or demote members below Lieutenant', [false, false, false, true, true]],
    ['View code status, generate a code, or reset the code', [false, false, false, true, true]],
    ['Edit the faction name and description', [false, false, false, true, true]],
    ['Change the membership mode', [false, false, false, false, true]],
    ['Promote a member to Lieutenant', [false, false, false, false, true]],
    ['Transfer leadership or disband the faction', [false, false, false, false, true]]
]);
const STALE_SAFE_ACTIONS = new Set(['refresh', 'activity-density', 'activity-page', 'directory-search', 'player-search']);

let activeTab = 'overview';
let unaffiliatedTab = 'discover';
let snapshot = null;
let directory = [];
let loading = false;
let loadError = '';
let lastGeneratedRequestMessage = '';
let generatedCode = '';
let generatedCodeVersion = '';
let renderGeneration = 0;
let activityDensity = readFactionActivityDensity();
let activityHistoryPage = 0;
let treasuryHistoryPage = 0;
const boostDrafts = Object.fromEntries(ACTIONS.map(action => [action.id, { level: 4, mode: 'duration', hours: 1 }]));

const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const asTime = value => {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
};

const displayDate = value => {
    const time = asTime(value);
    return time ? new Date(time).toLocaleString() : 'Unknown time';
};

const parseAmount = (rawValue, maximum = Number.MAX_SAFE_INTEGER) => {
    const raw = String(rawValue || '').trim().toLowerCase().replace(/,/g, '');
    if (raw === 'all' || raw === 'max') return Math.max(0, Math.floor(Number(maximum) || 0));
    const suffix = raw.slice(-1);
    const multiplier = suffix === 'k' ? 1e3 : suffix === 'm' ? 1e6 : suffix === 'b' ? 1e9 : 1;
    const numeric = Number(multiplier === 1 ? raw : raw.slice(0, -1));
    return Number.isFinite(numeric) ? Math.max(0, Math.min(Math.floor(numeric * multiplier), Math.floor(maximum))) : 0;
};

export const getFPCostPerHour = level => {
    const safeLevel = Math.max(0, Math.min(36, Math.floor(Number(level) || 0)));
    if (safeLevel === 0) return 0;
    if (safeLevel <= 16) return Math.floor(100000 * safeLevel ** 2);
    const excess = safeLevel - 16;
    return Math.floor(25600000 * 1.25 ** excess + 10000000 * excess ** 2);
};

export const getFPMultiplier = level => 1 + Math.max(0, Math.min(36, Math.floor(Number(level) || 0))) * 0.25;

export const getTierBadge = level => {
    if (level <= 0) return { label: 'Inactive', class: 'tier-inactive' };
    if (level <= 4) return { label: 'Standard', class: 'tier-standard' };
    if (level <= 12) return { label: 'Advanced', class: 'tier-advanced' };
    if (level <= 16) return { label: '5× threshold', class: 'tier-threshold' };
    if (level <= 24) return { label: 'Elite', class: 'tier-elite' };
    if (level <= 32) return { label: 'Grandmaster', class: 'tier-grandmaster' };
    return { label: '10× maximum', class: 'tier-god' };
};

const rankAtLeast = (rank, required) => (RANK_WEIGHT[rank] ?? -1) >= (RANK_WEIGHT[required] ?? 99);
const viewerPlayerId = () => Number(getAuthProfile()?.player_id || 0);
const viewerIdentityId = () => String(getAuthProfile()?.id || '');
const requireSameViewer = identityId => {
    if (identityId === viewerIdentityId()) return true;
    showToast('Your player session changed. Review this faction action again.', 'error');
    return false;
};
const reconcileGeneratedCode = nextSnapshot => {
    const activeVersion = nextSnapshot?.faction?.accessCode?.active
        ? String(nextSnapshot.faction.accessCode.version || '')
        : '';
    if (!activeVersion || activeVersion !== generatedCodeVersion) {
        generatedCode = '';
        generatedCodeVersion = '';
    }
};
const expectedFaction = (extra = {}) => ({ factionId: snapshot?.faction?.id || null, ...extra });
const expectedUnaffiliated = () => ({ factionId: null });
const expectedBoost = actionType => expectedFaction({
    boost: {
        actionType,
        configRevision: Math.max(0, Math.floor(Number(snapshot?.faction?.boosts?.[actionType]?.configRevision) || 0))
    }
});

const reportFactionError = (error, fallback = 'The faction action failed.') => {
    if (error?.code === 'FACTION_PRECONDITION_FAILED') {
        const labels = {
            factionId: 'Your faction membership changed',
            membershipMode: 'The membership mode changed',
            details: 'The faction details changed',
            targetMember: 'That member’s Faction Rank changed',
            boost: 'That boost configuration changed',
            accessCodeVersion: 'The active access code changed',
            disband: 'The faction membership or name changed'
        };
        const subject = labels[error.details?.precondition] || 'Relevant faction data changed';
        const nextStep = error.snapshot
            ? 'The latest state is loaded; review and confirm again.'
            : 'Refresh the faction state, then review and confirm again.';
        showToast(`${subject} while you were reviewing this action. ${nextStep}`, 'error');
        return;
    }
    showToast(error?.message || fallback, 'error');
};
const isViewer = member => Number(member?.playerId) === viewerPlayerId();
const canManageMember = member => {
    const viewerRank = snapshot?.membership?.factionRank;
    return !isViewer(member)
        && RANK_WEIGHT[viewerRank] >= RANK_WEIGHT.sergeant
        && RANK_WEIGHT[member.factionRank] < RANK_WEIGHT[viewerRank];
};

const canRevokeInvitation = invitation => {
    if (Number(invitation?.senderPlayerId) === viewerPlayerId()) return true;
    if (!invitation?.senderPlayerId) return rankAtLeast(snapshot?.membership?.factionRank, 'corporal');
    const sender = snapshot?.faction?.members?.find(member => Number(member.playerId) === Number(invitation?.senderPlayerId));
    return !!sender && RANK_WEIGHT[snapshot?.membership?.factionRank] > RANK_WEIGHT[sender.factionRank];
};

const modeChangeWarning = (previousMode, nextMode) => {
    const effects = [];
    if (nextMode === 'code_only' || nextMode === 'public') effects.push('pending invitations will be cancelled');
    if (nextMode === 'invite_only' || nextMode === 'code_only') effects.push('pending public join requests will be cancelled');
    if (previousMode === 'code_only' && nextMode !== 'code_only') effects.push('the active one-time code will be invalidated');
    return effects.length ? `${effects.join(', ')}.` : 'No pending recruitment type needs to be closed.';
};

const permissionCell = value => {
    if (value === true) return '<span aria-label="Allowed">✓</span>';
    if (value === false) return '<span aria-label="Not allowed">—</span>';
    return `<span aria-label="${escapeHtml(value)}">${escapeHtml(value)}</span>`;
};

const notificationText = notification => {
    const payload = notification.payload || {};
    const labels = {
        invitation_received: `You were invited to ${payload.factionName || 'a faction'}.`,
        invitation_accepted: `${payload.recipientUsername || payload.username || 'A player'} accepted a faction invitation.`,
        join_request_accepted: `Your request to join ${payload.factionName || 'the faction'} was accepted.`,
        join_request_declined: `Your request to join ${payload.factionName || 'the faction'} was declined.`,
        rank_changed: `Your Faction Rank changed to ${RANK_LABEL[payload.factionRank] || payload.factionRank || 'a new rank'}.`,
        member_promoted: `Your Faction Rank was promoted from ${RANK_LABEL[payload.oldRank] || payload.oldRank} to ${RANK_LABEL[payload.newRank] || payload.newRank}.`,
        member_demoted: `Your Faction Rank changed from ${RANK_LABEL[payload.oldRank] || payload.oldRank} to ${RANK_LABEL[payload.newRank] || payload.newRank}.`,
        member_removed: `You were removed from ${payload.factionName || 'a faction'}.`,
        leadership_received: `You are now the Leader. ${payload.previousLeader || 'The previous Leader'} transferred ownership to you.`,
        leadership_transferred: `You transferred ownership to ${payload.newLeaderUsername || 'the new Leader'} and are now a Lieutenant.`,
        faction_disbanded: `${payload.factionName || 'Your faction'} was disbanded.`
    };
    return labels[notification.eventType] || String(notification.eventType || 'Faction update').replaceAll('_', ' ');
};

const activityText = item => {
    const actor = item.actorUsername || 'System';
    const target = item.targetUsername ? ` ${item.targetUsername}` : '';
    const labels = {
        faction_created: `${actor} founded the faction.`,
        treasury_deposit: `${actor} deposited ${formatDisplayNumber(item.metadata?.amount || 0)} FP.`,
        member_joined: `${actor}${target ? ` welcomed${target}` : ' joined the faction'}.`,
        member_left: `${actor} left the faction.`,
        member_removed: `${actor} removed${target}.`,
        rank_changed: `${actor} changed${target}'s rank to ${RANK_LABEL[item.metadata?.newRank] || item.metadata?.newRank || 'a new rank'}.`,
        leadership_transferred: `${actor} transferred leadership to${target}.`,
        membership_mode_changed: `${actor} changed membership to ${MODE_LABEL[item.metadata?.newMode] || item.metadata?.newMode}.`,
        faction_details_changed: `${actor} updated the faction details.`,
        boost_activated: `${actor} activated a faction boost.`,
        boost_extended: `${actor} extended a faction boost.`,
        boost_changed: `${actor} changed a faction boost.`,
        boost_stopped: `${actor} stopped a faction boost.`
    };
    return labels[item.eventType] || `${actor}: ${String(item.eventType || 'faction update').replaceAll('_', ' ')}.`;
};

const header = description => `
    <div class="section-header">
        <div>
            <h2 id="panel-faction-heading">Faction</h2>
            <p class="section-desc">${description}</p>
        </div>
        <button class="action-btn secondary-btn" type="button" data-faction-action="refresh">${iconHtml('lucide:refresh-cw')} Refresh</button>
    </div>`;

const retentionNotice = () => isGuestProfile(getAuthProfile()) ? `
    <div class="transaction-notice warning faction-retention-notice" role="note">
        ${iconHtml('lucide:clock-3')} This guest player can use every faction feature. The guest account and its faction membership are deleted after 365 days without activity. Creating an account preserves the same player and membership.
    </div>` : '';

const renderNotifications = () => {
    const items = snapshot?.notifications || [];
    if (!items.length) return '';
    const unread = items.filter(item => !item.readAt).length;
    return `
        <section class="card faction-notification-card" aria-labelledby="faction-notifications-title">
            <div class="faction-card-heading">
                <div><span class="eyebrow">Personal inbox</span><h3 id="faction-notifications-title">Faction notifications${unread ? ` (${unread} new)` : ''}</h3></div>
                ${unread ? '<button class="action-btn secondary-btn" type="button" data-faction-action="read-all">Mark all read</button>' : ''}
            </div>
            <div class="faction-list compact-list">${items.slice(0, 8).map(item => `
                <div class="faction-list-row ${item.readAt ? '' : 'is-unread'}">
                    <div><strong>${escapeHtml(notificationText(item))}</strong><span>${escapeHtml(displayDate(item.createdAt))}</span></div>
                    ${item.readAt ? '' : `<button class="icon-btn-sm" type="button" data-faction-action="read-notification" data-id="${item.id}" aria-label="Mark notification read">${iconHtml('lucide:check')}</button>`}
                </div>`).join('')}</div>
        </section>`;
};

const tabButtons = (tabs, selected) => `
    <div class="faction-tabs" role="tablist" aria-label="Faction sections">
        ${tabs.map(tab => `<button class="faction-tab-btn ${selected === tab.id ? 'active' : ''}" type="button" role="tab" aria-selected="${selected === tab.id}" data-faction-tab="${tab.id}">${escapeHtml(tab.label)}</button>`).join('')}
    </div>`;

const directoryCard = faction => {
    const pending = (snapshot?.joinRequests || []).some(request => Number(request.factionNumber) === Number(faction.factionNumber));
    const requestDisabled = faction.isFull || pending || faction.canRequest === false;
    const requestLabel = faction.isFull ? 'Faction full' : pending ? 'Request pending' : 'Request to join';
    return `<article class="card faction-directory-card">
        <div class="faction-card-heading">
            <div><span class="eyebrow">Faction #${faction.factionNumber}</span><h3>${escapeHtml(faction.name)}</h3></div>
            <span class="charter-badge ${faction.isFull ? 'danger' : ''}">${faction.memberCount} / ${MEMBER_LIMIT}</span>
        </div>
        <p>${escapeHtml(faction.description || 'This faction has not added a description yet.')}</p>
        <dl class="faction-inline-details"><div><dt>Leader</dt><dd>${escapeHtml(faction.leaderUsername)}</dd></div><div><dt>Boosts</dt><dd>${(faction.activeBoosts || []).length} active</dd></div></dl>
        ${faction.isFull ? '<p class="text-subtle">This faction has reached its 20-member limit.</p>' : ''}
        <button class="action-btn primary-btn" type="button" data-faction-action="open-request" data-number="${faction.factionNumber}" data-name="${escapeHtml(faction.name)}" ${requestDisabled ? 'disabled' : ''}>${requestLabel}</button>
    </article>`;
};

const renderUnaffiliated = () => {
    const state = getState() || {};
    const invites = snapshot?.invitations || [];
    const requests = snapshot?.joinRequests || [];
    const tabs = [
        { id: 'discover', label: 'Discover' },
        { id: 'invitations', label: `Invitations${invites.length ? ` (${invites.length})` : ''}` },
        { id: 'code', label: 'Join Code' },
        { id: 'create', label: 'Create' },
        { id: 'requests', label: `My Requests${requests.length ? ` (${requests.length})` : ''}` }
    ];
    let content = '';
    if (unaffiliatedTab === 'discover') {
        content = `
            <div class="faction-toolbar"><input id="faction-directory-search" class="form-input" maxlength="64" aria-label="Search public factions" placeholder="Search public factions, leaders, or faction numbers"><button class="action-btn secondary-btn" type="button" data-faction-action="directory-search">Search</button></div>
            <div class="faction-directory-grid">${directory.length ? directory.map(directoryCard).join('') : '<div class="card faction-empty-copy"><h3>No public factions found</h3><p>Try another search, accept an invitation, redeem a one-time code, or create your own faction.</p></div>'}</div>`;
    } else if (unaffiliatedTab === 'invitations') {
        content = invites.length ? `<div class="faction-list">${invites.map(invite => `
            <div class="card faction-list-row"><div><span class="eyebrow">Invitation</span><strong>${escapeHtml(invite.factionName)}</strong><span>Sent by ${escapeHtml(invite.senderUsername || 'a faction member')} · ${escapeHtml(displayDate(invite.createdAt))}</span></div><div class="faction-row-actions"><button class="action-btn primary-btn" type="button" data-faction-action="respond-invite" data-id="${invite.id}" data-decision="accept">Accept</button><button class="action-btn secondary-btn" type="button" data-faction-action="respond-invite" data-id="${invite.id}" data-decision="decline">Decline</button></div></div>`).join('')}</div>` : '<div class="card faction-empty-copy"><h3>No pending invitations</h3><p>Invitations sent by eligible faction members will appear here.</p></div>';
    } else if (unaffiliatedTab === 'code') {
        content = `<div class="card faction-form-card"><span class="eyebrow">One-time access</span><h3>Redeem a faction code</h3><p>A valid code has no time expiration, but it becomes invalid immediately after one player uses it or an authorized faction officer resets it.</p><div class="deposit-input-row"><input id="faction-code-input" class="form-input" maxlength="32" autocomplete="off" aria-label="Faction access code" placeholder="Enter one-time code"><button class="action-btn primary-btn" type="button" data-faction-action="redeem-code">Join faction</button></div></div>`;
    } else if (unaffiliatedTab === 'create') {
        const cash = Number(state.cash || 0);
        content = `<div class="card faction-empty-state"><div class="faction-empty-icon">${iconHtml('lucide:shield-plus')}</div><div class="faction-empty-copy"><span class="eyebrow">Become the sole Leader</span><h3>Create a multiplayer faction</h3><p>Choose one membership mode and lead up to 20 members. Creation costs ${formatMoney(CREATION_COST)}.</p></div><div class="summary-rail faction-founding-summary"><div class="summary-metric"><span class="summary-label">Your cash</span><strong>${formatMoney(cash)}</strong></div><div class="summary-metric"><span class="summary-label">Status</span><strong class="${cash >= CREATION_COST ? 'text-success' : 'text-danger'}">${cash >= CREATION_COST ? 'Ready' : `${formatMoney(CREATION_COST - cash)} short`}</strong></div></div><button class="action-btn primary-btn" type="button" data-faction-action="open-create" ${cash < CREATION_COST ? 'disabled' : ''}>Create faction</button></div>`;
    } else {
        content = requests.length ? `<div class="faction-list">${requests.map(request => `<div class="card faction-list-row"><div><span class="eyebrow">Pending request</span><strong>${escapeHtml(request.factionName)}</strong><span>“${escapeHtml(request.message)}”</span></div><button class="action-btn secondary-btn" type="button" data-faction-action="withdraw-request" data-id="${request.id}">Withdraw</button></div>`).join('')}</div>` : '<div class="card faction-empty-copy"><h3>No pending requests</h3><p>Request access from the Discover tab. Every request opens with a newly generated cheerful message that you can edit or regenerate.</p></div>';
    }
    return `${header('Discover public factions, use invitations or one-time codes, or create a faction of your own.')}${retentionNotice()}${renderNotifications()}${tabButtons(tabs, unaffiliatedTab)}<section class="faction-tab-panel">${content}</section>`;
};

const renderOverview = faction => {
    const activeBoosts = ACTIONS.filter(action => Number(faction.boosts?.[action.id]?.level || 0) > 0);
    return `
        <div class="summary-rail faction-summary-rail">
            <div class="summary-metric"><span class="summary-label">Treasury</span><strong>${formatDisplayNumber(faction.treasuryBalance)} FP</strong></div>
            <div class="summary-metric"><span class="summary-label">Members</span><strong>${faction.memberCount} / ${MEMBER_LIMIT}</strong></div>
            <div class="summary-metric"><span class="summary-label">Your Faction Rank</span><strong>${RANK_LABEL[faction.viewerRank]}</strong></div>
            <div class="summary-metric"><span class="summary-label">Active boosts</span><strong>${activeBoosts.length} / ${ACTIONS.length}</strong></div>
        </div>
        <div class="faction-dashboard-grid">
            <section class="card faction-form-card"><span class="eyebrow">Shared treasury</span><h3>Deposit Faction Points</h3><p>Every member may deposit. $1 cash becomes 1 FP. Deposits cannot be withdrawn or reversed.</p><div class="deposit-input-row"><input id="faction-deposit-input" class="form-input" aria-label="Faction Points deposit amount" placeholder="Amount, max, 10k, 2m…"><button class="action-btn primary-btn" type="button" data-faction-action="deposit">Deposit</button></div></section>
            <section class="card faction-form-card"><span class="eyebrow">Membership</span><h3>${MODE_LABEL[faction.membershipMode]}</h3><p>${faction.membershipMode === 'public' ? 'Players can find this faction and send editable join requests.' : faction.membershipMode === 'code_only' ? 'A player may join with the current one-time code.' : 'Players join only by accepting invitations.'}</p><p><strong>Leader:</strong> ${escapeHtml(faction.leaderUsername)}</p></section>
        </div>`;
};

const rankOptions = member => {
    const viewerRank = snapshot?.membership?.factionRank;
    if (!canManageMember(member) || viewerRank === 'sergeant') return '';
    return RANKS.filter(rank => rank !== 'leader' && RANK_WEIGHT[rank] < RANK_WEIGHT[viewerRank])
        .map(rank => `<option value="${rank}" ${member.factionRank === rank ? 'selected' : ''}>${RANK_LABEL[rank]}</option>`).join('');
};

const renderMembers = faction => `
    <section class="card faction-table-card">
        <div class="faction-card-heading"><div><span class="eyebrow">Roster</span><h3>${faction.memberCount} of ${MEMBER_LIMIT} members</h3></div><span>One Leader owns the faction.</span></div>
        <div class="faction-member-list">${(faction.members || []).map(member => `
            <div class="faction-member-row">
                <div class="faction-member-identity"><strong>${escapeHtml(member.username)}${isViewer(member) ? ' (you)' : ''}</strong><span>Player #${member.playerId}${member.isGuest ? ' · Guest' : ''} · Joined ${escapeHtml(displayDate(member.joinedAt))}</span></div>
                <span class="charter-badge rank-${member.factionRank}">${RANK_LABEL[member.factionRank]}</span>
                <span title="Lifetime contribution">${formatDisplayNumber(member.lifetimeContribution || 0)} FP</span>
                <div class="faction-row-actions">
                    ${rankOptions(member) ? `<select class="form-select faction-rank-select" data-player-id="${member.playerId}" aria-label="Faction Rank for ${escapeHtml(member.username)}">${rankOptions(member)}</select>` : ''}
                    ${canManageMember(member) && snapshot.membership.factionRank !== 'sergeant' ? `<button class="action-btn secondary-btn" type="button" data-faction-action="save-rank" data-player-id="${member.playerId}">Save rank</button>` : ''}
                    ${canManageMember(member) ? `<button class="action-btn danger-btn" type="button" data-faction-action="remove-member" data-player-id="${member.playerId}" data-name="${escapeHtml(member.username)}">Remove</button>` : ''}
                    ${snapshot.membership.factionRank === 'leader' && !isViewer(member) ? `<button class="action-btn secondary-btn" type="button" data-faction-action="transfer" data-player-id="${member.playerId}" data-name="${escapeHtml(member.username)}">Transfer ownership</button>` : ''}
                </div>
            </div>`).join('')}</div>
    </section>`;

const boostCard = (faction, action) => {
    const boost = faction.boosts?.[action.id] || { level: 0, multiplier: 1, mode: 'duration', costPerHour: 0, remainingSeconds: 0 };
    const draft = boostDrafts[action.id];
    const canManage = rankAtLeast(faction.viewerRank, 'sergeant');
    const tier = getTierBadge(draft.level);
    const cost = getFPCostPerHour(draft.level);
    const durationCost = Math.floor(cost * draft.hours);
    return `
        <article class="card faction-boost-card ${boost.level > 0 ? 'boost-active' : ''}">
            <div class="boost-card-header"><div class="boost-header-left">${iconHtml(action.icon, 'boost-action-icon')}<div><h4>${action.name}</h4><span>${Number(boost.multiplier || 1).toFixed(2)}× active</span></div></div><span class="tier-pill ${tier.class}">${tier.label}</span></div>
            ${boost.level > 0 ? `<div class="active-status-bar"><strong>Level ${boost.level} · ${MODE_LABEL[boost.mode] || (boost.mode === 'continuous' ? 'Continuous' : 'Fixed duration')}</strong><span>${boost.mode === 'continuous' ? `About ${formatDurationMs(Number(boost.remainingSeconds || 0) * 1000)} funded` : `${formatDurationMs(Number(boost.remainingSeconds || 0) * 1000)} remaining`}</span></div>` : '<p class="text-subtle">No boost is active for this action.</p>'}
            ${canManage ? `<div class="boost-config-section"><label class="form-label">Level <strong>${draft.level}</strong> (${getFPMultiplier(draft.level).toFixed(2)}×)</label><input class="faction-level-slider" type="range" min="1" max="36" value="${draft.level}" data-faction-action="draft-level" data-action-type="${action.id}" aria-label="${escapeHtml(action.name)} boost level"><div class="faction-boost-controls"><select class="form-select" data-boost-mode="${action.id}" aria-label="${escapeHtml(action.name)} boost mode" ${boost.level > 0 ? 'disabled' : ''}><option value="duration" ${draft.mode === 'duration' ? 'selected' : ''}>Fixed duration</option><option value="continuous" ${draft.mode === 'continuous' ? 'selected' : ''}>Continuous drain</option></select><input class="form-input" type="number" min="0.1" max="876000" step="0.1" value="${draft.hours}" data-boost-hours="${action.id}" ${draft.mode === 'continuous' || (boost.level > 0 && boost.mode === 'continuous') ? 'disabled' : ''} aria-label="Duration in hours"><button class="action-btn primary-btn" type="button" data-faction-action="activate-boost" data-action-type="${action.id}">${boost.level > 0 ? 'Update or extend' : 'Activate'}</button>${boost.level > 0 ? `<button class="action-btn danger-btn" type="button" data-faction-action="stop-boost" data-action-type="${action.id}">Stop</button>` : ''}</div><p class="text-subtle">${formatDisplayNumber(cost)} FP/hour${draft.mode === 'duration' ? ` · ${formatDisplayNumber(durationCost)} FP for ${draft.hours} hour(s)` : ' · requires at least one funded hour'}</p></div>` : '<p class="text-subtle">Sergeant, Lieutenant, or Leader permission is required to manage boosts.</p>'}
        </article>`;
};

const renderOperations = faction => `<div class="faction-boosters-grid">${ACTIONS.map(action => boostCard(faction, action)).join('')}</div>`;

const renderRecruitment = faction => {
    const rank = faction.viewerRank;
    const canInvite = rankAtLeast(rank, 'corporal') && faction.membershipMode === 'invite_only';
    const canReview = rankAtLeast(rank, 'sergeant') && faction.membershipMode === 'public';
    const canCode = rankAtLeast(rank, 'lieutenant') && faction.membershipMode === 'code_only';
    const canMode = rank === 'leader';
    const invitations = snapshot.invitations || [];
    const requests = snapshot.joinRequests || [];
    return `
        <div class="faction-dashboard-grid">
            <section class="card faction-form-card"><span class="eyebrow">Current membership mode</span><h3>${MODE_LABEL[faction.membershipMode]}</h3>${canMode ? `<div class="deposit-input-row"><select id="faction-mode-select" class="form-select" aria-label="Faction membership mode">${Object.entries(MODE_LABEL).map(([value, label]) => `<option value="${value}" ${value === faction.membershipMode ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="action-btn primary-btn" type="button" data-faction-action="save-mode">Save mode</button></div><p>Changing mode cancels incompatible pending invitations, requests, or codes.</p>` : '<p>Only the Leader can change the membership mode.</p>'}</section>
            ${faction.membershipMode === 'invite_only' ? `<section class="card faction-form-card"><span class="eyebrow">Invite-only recruitment</span><h3>Find a player</h3>${canInvite ? '<div class="deposit-input-row"><input id="faction-player-search" class="form-input" maxlength="64" aria-label="Search for a faction recruit" placeholder="Username or player number"><button class="action-btn primary-btn" type="button" data-faction-action="player-search">Search</button></div><div id="faction-player-search-results"></div>' : '<p>Corporal or higher permission is required to invite players.</p>'}</section>` : ''}
            ${faction.membershipMode === 'code_only' ? `<section class="card faction-form-card"><span class="eyebrow">One-time access code</span><h3>${faction.accessCode?.active ? 'A code is active' : 'No active code'}</h3><p>Codes never expire by time. Plaintext is shown once after generation, then only its status remains visible. A successful redemption consumes it.</p>${generatedCode ? `<output class="faction-generated-code" aria-live="polite">${escapeHtml(generatedCode)}</output><p>Copy this code now. It will not be shown again.</p>` : ''}${canCode ? `<button class="action-btn primary-btn" type="button" data-faction-action="generate-code">${faction.accessCode?.active ? 'Reset and generate a new code' : 'Generate code'}</button>` : '<p>Only the Leader or a Lieutenant can generate or reset the code.</p>'}</section>` : ''}
        </div>
        ${faction.membershipMode === 'invite_only' ? `<section class="card faction-table-card"><h3>Pending invitations</h3>${invitations.length ? `<div class="faction-list">${invitations.map(invite => `<div class="faction-list-row"><div><strong>${escapeHtml(invite.recipientUsername)}</strong><span>Invited by ${escapeHtml(invite.senderUsername || 'a member')}</span></div>${canRevokeInvitation(invite) ? `<button class="action-btn secondary-btn" type="button" data-faction-action="revoke-invite" data-id="${invite.id}">Revoke</button>` : ''}</div>`).join('')}</div>` : '<p>No pending invitations.</p>'}</section>` : ''}
        ${faction.membershipMode === 'public' ? `<section class="card faction-table-card"><h3>Pending join requests</h3>${requests.length ? `<div class="faction-list">${requests.map(request => `<div class="faction-list-row"><div><strong>${escapeHtml(request.applicantUsername)}</strong><span>“${escapeHtml(request.message)}”</span><small>${escapeHtml(displayDate(request.createdAt))}</small></div>${canReview ? `<div class="faction-row-actions"><button class="action-btn primary-btn" type="button" data-faction-action="review-request" data-id="${request.id}" data-decision="accept">Accept</button><button class="action-btn secondary-btn" type="button" data-faction-action="review-request" data-id="${request.id}" data-decision="decline">Decline</button></div>` : ''}</div>`).join('')}</div>` : '<p>No pending join requests.</p>'}</section>` : ''}`;
};

const renderHistoryPagination = (history, label, pagination) => {
    if (!pagination.total) return '';
    return `
        <nav class="faction-history-pagination" aria-label="${label} pagination">
            <button class="faction-history-page-btn" type="button" data-faction-action="activity-page" data-history="${history}" data-page="${pagination.page - 1}" data-page-direction="previous" ${pagination.page === 0 ? 'disabled' : ''}>Previous</button>
            <span class="faction-history-page-status" aria-live="polite">${pagination.start}–${pagination.end} of ${pagination.total} · Page ${pagination.page + 1} of ${pagination.pageCount}</span>
            <button class="faction-history-page-btn" type="button" data-faction-action="activity-page" data-history="${history}" data-page="${pagination.page + 1}" data-page-direction="next" ${pagination.page >= pagination.pageCount - 1 ? 'disabled' : ''}>Next</button>
        </nav>`;
};

const renderActivity = faction => {
    const activity = paginateFactionHistory(faction.activity, activityHistoryPage, activityDensity);
    const ledger = paginateFactionHistory(faction.ledger, treasuryHistoryPage, activityDensity);
    activityHistoryPage = activity.page;
    treasuryHistoryPage = ledger.page;

    return `
        <div class="faction-activity-controls">
            <span id="faction-activity-density-label" class="faction-activity-control-label">Activity View</span>
            <div class="view-toggle faction-activity-density-toggle" role="group" aria-labelledby="faction-activity-density-label">
                ${Object.entries(FACTION_ACTIVITY_DENSITIES).map(([value, config]) => `<button class="view-toggle-btn" type="button" data-faction-action="activity-density" data-density="${value}" aria-pressed="${activityDensity === value}" title="Show ${config.pageSize} entries per section in ${config.label.toLowerCase()} rows">${config.label}</button>`).join('')}
            </div>
        </div>
        <div class="faction-dashboard-grid faction-activity-grid is-${activityDensity}">
            <section class="card faction-table-card faction-history-card" aria-labelledby="faction-activity-history-title">
                <span class="eyebrow">Latest events</span>
                <h3 id="faction-activity-history-title">Faction Activity</h3>
                <div class="faction-list faction-history-list">${activity.total ? activity.items.map(item => `<div class="faction-list-row faction-history-row"><div><strong class="faction-history-title">${escapeHtml(activityText(item))}</strong><span class="faction-history-meta">${escapeHtml(displayDate(item.createdAt))}</span></div></div>`).join('') : '<p>No faction activity yet.</p>'}</div>
                ${renderHistoryPagination('activity', 'Faction Activity', activity)}
            </section>
            <section class="card faction-table-card faction-history-card" aria-labelledby="faction-treasury-history-title">
                <span class="eyebrow">Shared funds</span>
                <h3 id="faction-treasury-history-title">Treasury Ledger</h3>
                <div class="faction-list faction-history-list">${ledger.total ? ledger.items.map(item => `<div class="faction-list-row faction-history-row"><div><strong class="faction-history-title">${escapeHtml(String(item.entryType || '').replaceAll('_', ' '))}</strong><span class="faction-history-meta">${escapeHtml(item.actorUsername || 'System')} · ${escapeHtml(displayDate(item.createdAt))}</span></div><strong class="faction-history-amount ${Number(item.amountDelta) >= 0 ? 'text-success' : 'text-danger'}">${Number(item.amountDelta) >= 0 ? '+' : ''}${formatDisplayNumber(item.amountDelta)} FP</strong></div>`).join('') : '<p>No treasury entries yet.</p>'}</div>
                ${renderHistoryPagination('ledger', 'Treasury Ledger', ledger)}
            </section>
        </div>`;
};

const renderPermissions = faction => `
    <section class="card faction-table-card"><span class="eyebrow">Fixed delegation</span><h3>Faction Rank permissions</h3><p>Faction Ranks are separate from Bconomy's solo progression ranks. Higher ranks inherit every applicable permission below them.</p><div class="faction-permission-table" role="table"><div class="faction-permission-row faction-permission-head" role="row"><span>Permission</span>${RANKS.map(rank => `<strong>${RANK_LABEL[rank]}</strong>`).join('')}</div>${PERMISSION_ROWS.map(([label, values]) => `<div class="faction-permission-row" role="row"><span>${escapeHtml(label)}</span>${values.map(permissionCell).join('')}</div>`).join('')}</div></section>
    <section class="card faction-danger-zone"><span class="eyebrow">Membership and ownership</span><h3>${faction.viewerRank === 'leader' ? 'Leader controls' : 'Leave faction'}</h3>${faction.viewerRank === 'leader' ? '<p>A Leader must transfer ownership before leaving. Disbanding permanently removes the faction and forfeits the shared treasury.</p><button class="action-btn danger-btn" type="button" data-faction-action="disband">Disband faction</button>' : '<p>There is no cooldown for leaving or joining another faction.</p><button class="action-btn danger-btn" type="button" data-faction-action="leave">Leave faction</button>'}</section>`;

const renderMember = () => {
    const faction = snapshot.faction;
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'members', label: `Members (${faction.memberCount})` },
        { id: 'operations', label: 'Operations' },
        { id: 'recruitment', label: 'Recruitment' },
        { id: 'activity', label: 'Activity' },
        { id: 'permissions', label: 'Rank Permissions' }
    ];
    const contents = {
        overview: renderOverview,
        members: renderMembers,
        operations: renderOperations,
        recruitment: renderRecruitment,
        activity: renderActivity,
        permissions: renderPermissions
    };
    const canEdit = rankAtLeast(faction.viewerRank, 'lieutenant');
    return `${header('Coordinate with other players through fixed Faction Ranks, a shared treasury, and shared action boosts.')}${retentionNotice()}${renderNotifications()}
        <div class="faction-header-banner card"><div class="faction-identity-row"><div class="faction-crest-badge">${iconHtml('lucide:flag')}</div><div class="faction-identity-info"><span class="eyebrow">Faction #${faction.factionNumber} · ${MODE_LABEL[faction.membershipMode]}</span><div class="faction-title-line"><h2 class="faction-name">${escapeHtml(faction.name)}</h2><span class="charter-badge">${RANK_LABEL[faction.viewerRank]}</span></div><p class="faction-motto">${escapeHtml(faction.description || 'No faction description has been added.')}</p></div>${canEdit ? `<button class="action-btn secondary-btn" type="button" data-faction-action="open-edit">${iconHtml('lucide:pencil')} Edit details</button>` : ''}</div></div>
        ${tabButtons(tabs, activeTab)}<section class="faction-tab-panel">${contents[activeTab]?.(faction) || renderOverview(faction)}</section>`;
};

const paint = () => {
    const panel = document.getElementById('panel-faction');
    if (!panel) return;
    if (loading && !snapshot) {
        panel.innerHTML = `${header('Loading the multiplayer faction service…')}<div class="card faction-empty-copy"><h3>Loading faction</h3><p>Please wait while Bconomy retrieves the latest shared state.</p></div>`;
        return;
    }
    if (loadError && !snapshot) {
        panel.innerHTML = `${header('Multiplayer factions require the shared game service.')}<div class="card faction-empty-copy"><h3>Faction service unavailable</h3><p>${escapeHtml(loadError)}</p><button class="action-btn primary-btn" type="button" data-faction-action="refresh">Try again</button></div>`;
        attachEvents(panel);
        return;
    }
    const staleNotice = loadError
        ? `<div class="card faction-empty-copy" role="status"><h3>Showing the last loaded faction state</h3><p>${escapeHtml(loadError)} Review actions are unavailable until the latest state loads.</p><button class="action-btn primary-btn" type="button" data-faction-action="refresh">Try again</button></div>`
        : '';
    panel.innerHTML = staleNotice + (snapshot?.membership && snapshot?.faction ? renderMember() : renderUnaffiliated());
    attachEvents(panel);
    panel.setAttribute('aria-busy', loading ? 'true' : 'false');
    if (loading || loadError) {
        panel.querySelectorAll('[data-faction-action]').forEach(control => {
            if (!STALE_SAFE_ACTIONS.has(control.dataset.factionAction)) control.disabled = true;
        });
    }
};

const refresh = async ({ keepDirectory = true } = {}) => {
    const generation = ++renderGeneration;
    const identityId = viewerIdentityId();
    loading = true;
    loadError = '';
    paint();
    try {
        const [nextSnapshot, nextDirectory] = await Promise.all([
            doFactionState(),
            keepDirectory && directory.length ? Promise.resolve({ items: directory }) : doFactionDirectory()
        ]);
        if (generation !== renderGeneration || identityId !== viewerIdentityId()) return;
        snapshot = nextSnapshot;
        reconcileGeneratedCode(snapshot);
        directory = nextDirectory?.items || [];
    } catch (error) {
        if (generation !== renderGeneration || identityId !== viewerIdentityId()) return;
        loadError = error.message || 'Faction data could not be loaded.';
    } finally {
        if (generation === renderGeneration && identityId === viewerIdentityId()) {
            loading = false;
            paint();
        }
    }
};

const applyCommand = async (promise, successMessage) => {
    const response = await promise;
    if (response?.snapshot) {
        snapshot = response.snapshot;
        reconcileGeneratedCode(snapshot);
    }
    const plaintextCode = response?.code || response?.plaintextCode || '';
    if (plaintextCode) {
        generatedCode = plaintextCode;
        generatedCodeVersion = String(snapshot?.faction?.accessCode?.version || '');
    }
    showToast(successMessage, 'success');
    addLogEntry(successMessage, 'system');
    renderHeader();
    paint();
    return response;
};

const openCreateDialog = trigger => {
    const dialog = document.getElementById('create-faction-modal');
    const name = document.getElementById('create-faction-name');
    const description = document.getElementById('create-faction-description');
    const mode = document.getElementById('create-faction-mode');
    const readiness = document.getElementById('create-faction-readiness');
    const error = document.getElementById('create-faction-name-error');
    const submit = document.getElementById('btn-create-faction-submit');
    if (!dialog) return;
    const identityId = viewerIdentityId();
    name.value = '';
    description.value = '';
    mode.value = 'invite_only';
    error?.classList.add('hidden');
    if (readiness) readiness.textContent = `${formatMoney(CREATION_COST)} will be charged after confirmation.`;
    const cancel = () => closeDialog(dialog, { reason: 'cancel' });
    document.getElementById('btn-close-create-faction').onclick = cancel;
    document.getElementById('btn-create-faction-cancel').onclick = cancel;
    submit.onclick = async event => {
        if (!requireSameViewer(identityId)) return;
        const factionName = name.value.trim();
        if (!factionName) {
            error.textContent = 'Enter a faction name.';
            error.classList.remove('hidden');
            name.focus();
            return;
        }
        closeDialog(dialog, { reason: 'review', restoreFocus: false });
        if (!await showConfirmation('createFaction', 'Create Faction?', `Create “${factionName}” for ${formatMoney(CREATION_COST)}? You will become its sole Leader and owner.`, { allowIgnore: false, confirmLabel: 'Create faction' })) return;
        if (!requireSameViewer(identityId)) return;
        try {
            await applyCommand(doFactionCreate(factionName, description.value.trim(), mode.value, event.currentTarget, expectedUnaffiliated()), `Faction “${factionName}” created.`);
            activeTab = 'overview';
        } catch (commandError) {
            reportFactionError(commandError, 'Faction creation failed.');
        }
    };
    openDialog(dialog, { initialFocus: '#create-faction-name', returnFocus: trigger });
};

const openEditDialog = trigger => {
    const faction = snapshot?.faction;
    const dialog = document.getElementById('edit-faction-modal');
    const name = document.getElementById('faction-name-input');
    const description = document.getElementById('faction-desc-input');
    const save = document.getElementById('btn-faction-modal-save');
    if (!faction || !dialog) return;
    const identityId = viewerIdentityId();
    const expected = expectedFaction({ name: faction.name, description: faction.description || '' });
    name.value = faction.name;
    description.value = faction.description || '';
    const cancel = () => closeDialog(dialog, { reason: 'cancel' });
    document.getElementById('btn-close-faction-modal').onclick = cancel;
    document.getElementById('btn-faction-modal-cancel').onclick = cancel;
    save.onclick = async event => {
        if (!requireSameViewer(identityId)) return;
        if (!name.value.trim()) return showToast('Enter a faction name.', 'error');
        try {
            await applyCommand(doFactionCustomize(name.value.trim(), description.value.trim(), event.currentTarget, expected), 'Faction details updated.');
            closeDialog(dialog, { reason: 'saved' });
        } catch (error) {
            reportFactionError(error, 'Faction details could not be updated.');
        }
    };
    openDialog(dialog, { initialFocus: '#faction-name-input', returnFocus: trigger });
};

const openDisbandDialog = trigger => {
    const faction = snapshot?.faction;
    const dialog = document.getElementById('disband-faction-modal');
    const name = document.getElementById('disband-faction-name');
    const confirmation = document.getElementById('disband-faction-confirmation');
    const error = document.getElementById('disband-faction-error');
    const submit = document.getElementById('btn-disband-faction-submit');
    if (!faction || !dialog || !confirmation || !submit) return;
    const identityId = viewerIdentityId();
    const expected = expectedFaction({ name: faction.name, memberCount: Number(faction.memberCount) || 0 });
    name.textContent = faction.name;
    confirmation.value = '';
    error?.classList.add('hidden');
    const cancel = () => closeDialog(dialog, { reason: 'cancel' });
    document.getElementById('btn-close-disband-faction').onclick = cancel;
    document.getElementById('btn-disband-faction-cancel').onclick = cancel;
    submit.onclick = async event => {
        if (!requireSameViewer(identityId)) return;
        if (confirmation.value !== faction.name) {
            error.textContent = 'Enter the faction name exactly as shown.';
            error.classList.remove('hidden');
            confirmation.focus();
            return;
        }
        try {
            await applyCommand(doFactionDisband(faction.name, event.currentTarget, expected), `Faction “${faction.name}” was disbanded.`);
            closeDialog(dialog, { reason: 'disbanded' });
        } catch (commandError) {
            reportFactionError(commandError, 'The faction could not be disbanded.');
        }
    };
    openDialog(dialog, { initialFocus: '#disband-faction-confirmation', returnFocus: trigger });
};

const updateRequestCount = () => {
    const field = document.getElementById('faction-join-request-message');
    const count = document.getElementById('faction-join-message-count');
    if (field && count) {
        const length = Array.from(field.value).length;
        count.textContent = `${length} / 200`;
        count.classList.toggle('text-danger', length > 200);
    }
};

const generateRequestMessage = async ({ confirmEdited = false } = {}) => {
    const field = document.getElementById('faction-join-request-message');
    const button = document.getElementById('btn-faction-join-request-regenerate');
    if (!field) return;
    if (confirmEdited && lastGeneratedRequestMessage && field.value !== lastGeneratedRequestMessage) {
        const replace = await showConfirmation(
            'replaceEditedFactionJoinMessage',
            'Replace Your Edited Message?',
            'Regenerating will discard the message you edited and replace it with a new cheerful message.',
            { allowIgnore: false, confirmLabel: 'Regenerate message', cancelLabel: 'Keep my message' }
        );
        if (!replace) return;
    }
    field.disabled = true;
    if (button) button.disabled = true;
    const generation = renderGeneration;
    const identityId = viewerIdentityId();
    try {
        const result = await doFactionJoinMessage();
        if (generation !== renderGeneration || identityId !== viewerIdentityId() || !field.isConnected) return;
        field.value = result.message || '';
        lastGeneratedRequestMessage = field.value;
        updateRequestCount();
    } catch (error) {
        if (generation === renderGeneration && identityId === viewerIdentityId()) {
            showToast(error.message || 'A join-request message could not be generated.', 'error');
        }
    } finally {
        if (generation === renderGeneration && identityId === viewerIdentityId() && field.isConnected) {
            field.disabled = false;
            if (button) button.disabled = false;
        }
    }
};

const openRequestDialog = async (faction, trigger) => {
    const identityId = viewerIdentityId();
    const dialog = document.getElementById('faction-join-request-modal');
    const field = document.getElementById('faction-join-request-message');
    const subtitle = document.getElementById('faction-join-request-subtitle');
    if (!dialog || !field) return;
    subtitle.textContent = `Send a request to ${faction.name}. You may edit the generated message.`;
    field.value = '';
    lastGeneratedRequestMessage = '';
    updateRequestCount();
    field.oninput = updateRequestCount;
    const cancel = () => closeDialog(dialog, { reason: 'cancel' });
    document.getElementById('btn-close-faction-join-request').onclick = cancel;
    document.getElementById('btn-faction-join-request-cancel').onclick = cancel;
    document.getElementById('btn-faction-join-request-regenerate').onclick = () => generateRequestMessage({ confirmEdited: true });
    document.getElementById('btn-faction-join-request-send').onclick = async event => {
        if (!requireSameViewer(identityId)) return;
        const message = field.value.trim();
        if (!message) return showToast('Enter a join-request message.', 'error');
        if (Array.from(message).length > 200) return showToast('Join-request messages cannot exceed 200 characters.', 'error');
        try {
            await applyCommand(doFactionSendJoinRequest(faction.number, message, event.currentTarget, expectedUnaffiliated()), `Join request sent to ${faction.name}.`);
            closeDialog(dialog, { reason: 'sent' });
            unaffiliatedTab = 'requests';
            paint();
        } catch (error) {
            reportFactionError(error, 'The join request could not be sent.');
        }
    };
    openDialog(dialog, { initialFocus: '#faction-join-request-message', returnFocus: trigger });
    await generateRequestMessage();
    field.focus();
};

const searchPlayers = async panel => {
    const input = panel.querySelector('#faction-player-search');
    const results = panel.querySelector('#faction-player-search-results');
    if (!input?.value.trim() || !results) return showToast('Enter a username or player number.', 'error');
    results.innerHTML = '<p>Searching…</p>';
    const generation = renderGeneration;
    const identityId = viewerIdentityId();
    try {
        const response = await doFactionPlayerSearch(input.value.trim());
        if (generation !== renderGeneration || identityId !== viewerIdentityId() || !results.isConnected) return;
        const items = response.items || [];
        results.innerHTML = items.length ? `<div class="faction-list">${items.map(player => `<div class="faction-list-row"><div><strong>${escapeHtml(player.username)}</strong><span>Player #${player.playerId}${player.isGuest ? ' · Guest' : ''}</span></div><button class="action-btn primary-btn" type="button" data-faction-action="invite-player" data-player-id="${player.playerId}" data-name="${escapeHtml(player.username)}" ${player.inFaction ? 'disabled' : ''}>${player.inFaction ? 'Already in a faction' : 'Invite'}</button></div>`).join('')}</div>` : '<p>No eligible players found.</p>';
    } catch (error) {
        if (generation === renderGeneration && identityId === viewerIdentityId() && results.isConnected) {
            results.innerHTML = `<p class="text-danger">${escapeHtml(error.message || 'Search failed.')}</p>`;
        }
    }
};

const confirmAndRun = async ({ key, title, message, label, command, success }) => {
    const identityId = viewerIdentityId();
    if (!await showConfirmation(key, title, message, { allowIgnore: false, confirmLabel: label })) return;
    if (!requireSameViewer(identityId)) return;
    try {
        await applyCommand(command(), success);
    } catch (error) {
        reportFactionError(error);
    }
};

const handleAction = async (action, button, panel) => {
    if (action === 'refresh') return refresh({ keepDirectory: false });
    if (action === 'activity-density') {
        activityDensity = writeFactionActivityDensity(button.dataset.density);
        activityHistoryPage = 0;
        treasuryHistoryPage = 0;
        paint();
        panel.querySelector(`[data-faction-action="activity-density"][data-density="${activityDensity}"]`)?.focus();
        return;
    }
    if (action === 'activity-page') {
        const history = button.dataset.history;
        const requestedPage = Math.max(0, Math.floor(Number(button.dataset.page) || 0));
        if (history === 'activity') activityHistoryPage = requestedPage;
        if (history === 'ledger') treasuryHistoryPage = requestedPage;
        paint();
        const direction = button.dataset.pageDirection;
        const sameDirection = panel.querySelector(`[data-faction-action="activity-page"][data-history="${history}"][data-page-direction="${direction}"]:not(:disabled)`);
        const fallbackDirection = direction === 'next' ? 'previous' : 'next';
        (sameDirection || panel.querySelector(`[data-faction-action="activity-page"][data-history="${history}"][data-page-direction="${fallbackDirection}"]:not(:disabled)`))?.focus();
        return;
    }
    if (action === 'open-create') return openCreateDialog(button);
    if (action === 'open-edit') return openEditDialog(button);
    if (action === 'directory-search') {
        const generation = renderGeneration;
        const identityId = viewerIdentityId();
        try {
            const result = await doFactionDirectory(panel.querySelector('#faction-directory-search')?.value || '');
            if (generation !== renderGeneration || identityId !== viewerIdentityId() || !panel.isConnected) return;
            directory = result.items || [];
            paint();
        } catch (error) {
            if (generation === renderGeneration && identityId === viewerIdentityId()) {
                showToast(error.message || 'Faction search failed.', 'error');
            }
        }
        return;
    }
    if (action === 'open-request') return openRequestDialog({ number: Number(button.dataset.number), name: button.dataset.name }, button);
    if (action === 'respond-invite') {
        const expected = expectedFaction();
        try { await applyCommand(doFactionRespondInvitation(button.dataset.id, button.dataset.decision, button, expected), `Invitation ${button.dataset.decision === 'accept' ? 'accepted' : 'declined'}.`); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'withdraw-request') {
        const expected = expectedFaction();
        try { await applyCommand(doFactionWithdrawJoinRequest(button.dataset.id, button, expected), 'Join request withdrawn.'); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'redeem-code') {
        const code = panel.querySelector('#faction-code-input')?.value.trim();
        if (!code) return showToast('Enter a faction code.', 'error');
        const expected = expectedFaction();
        try { await applyCommand(doFactionRedeemCode(code, button, expected), 'Faction code redeemed. Welcome to the faction!'); activeTab = 'overview'; paint(); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'read-all' || action === 'read-notification') {
        const expected = expectedFaction();
        try { await applyCommand(doFactionReadNotification(action === 'read-all' ? 'all' : button.dataset.id, button, expected), 'Faction notifications updated.'); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'deposit') {
        const input = panel.querySelector('#faction-deposit-input');
        const amount = parseAmount(input?.value, getState()?.cash || 0);
        if (!amount) return showToast('Enter a valid deposit amount.', 'error');
        const expected = expectedFaction();
        return confirmAndRun({ key: 'factionDeposit', title: 'Deposit Faction Points?', message: `${formatMoney(amount)} will become ${formatDisplayNumber(amount)} shared FP. This deposit cannot be withdrawn or reversed.`, label: 'Deposit', command: () => doFactionDeposit(amount, button, expected), success: `${formatMoney(amount)} deposited into the shared faction treasury.` });
    }
    if (action === 'draft-level') {
        boostDrafts[button.dataset.actionType].level = Number(button.value);
        return paint();
    }
    if (action === 'activate-boost') {
        const type = button.dataset.actionType;
        const current = snapshot.faction.boosts?.[type];
        const expected = expectedBoost(type);
        const draft = boostDrafts[type];
        const mode = current?.level > 0 ? current.mode : panel.querySelector(`[data-boost-mode="${type}"]`)?.value || draft.mode;
        const hours = Number(panel.querySelector(`[data-boost-hours="${type}"]`)?.value || draft.hours);
        if (mode === 'duration' && (!Number.isFinite(hours) || hours < 0.1)) return showToast('Enter at least 0.1 hours.', 'error');
        try { await applyCommand(doFactionActivateBoost(type, draft.level, hours, mode, button, expected), `${type[0].toUpperCase() + type.slice(1)} faction boost updated.`); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'stop-boost') {
        const actionType = button.dataset.actionType;
        const expected = expectedBoost(actionType);
        return confirmAndRun({ key: 'stopFactionBoost', title: 'Stop Faction Boost?', message: 'The boost will stop immediately. Spent Faction Points are not refunded.', label: 'Stop boost', command: () => doFactionStopBoost(actionType, button, expected), success: 'Faction boost stopped.' });
    }
    if (action === 'save-rank') {
        const playerId = Number(button.dataset.playerId);
        const rank = panel.querySelector(`.faction-rank-select[data-player-id="${playerId}"]`)?.value;
        const member = snapshot.faction.members.find(item => Number(item.playerId) === playerId);
        if (!member || !rank) return showToast('That faction member is no longer available.', 'error');
        if (rank === member.factionRank) return showToast(`${member.username} is already a ${RANK_LABEL[rank]}.`, 'info');
        const expected = expectedFaction({ targetMember: { playerId, factionRank: member.factionRank } });
        return confirmAndRun({
            key: 'changeFactionRank',
            title: 'Change Faction Rank?',
            message: `${member.username} will change from ${RANK_LABEL[member.factionRank]} to ${RANK_LABEL[rank]}. Their fixed permissions will change immediately.`,
            label: rankAtLeast(rank, member.factionRank) ? 'Promote member' : 'Demote member',
            command: () => doFactionSetMemberRank(playerId, rank, button, expected),
            success: `${member.username}'s Faction Rank changed to ${RANK_LABEL[rank]}.`
        });
    }
    if (action === 'remove-member') {
        const playerId = Number(button.dataset.playerId);
        const member = snapshot.faction.members.find(item => Number(item.playerId) === playerId);
        if (!member) return showToast('That faction member is no longer available.', 'error');
        const expected = expectedFaction({ targetMember: { playerId, factionRank: member.factionRank } });
        return confirmAndRun({ key: 'removeFactionMember', title: 'Remove Faction Member?', message: `Remove ${button.dataset.name} from this faction? There is no membership cooldown.`, label: 'Remove member', command: () => doFactionRemoveMember(playerId, button, expected), success: `${button.dataset.name} was removed from the faction.` });
    }
    if (action === 'transfer') {
        const expected = expectedFaction();
        return confirmAndRun({ key: 'transferFaction', title: 'Transfer Faction Ownership?', message: `${button.dataset.name} will become the sole Leader and owner. ${snapshot.faction.leaderUsername} will become a Lieutenant. This authority change is immediate and cannot be undone automatically.`, label: 'Transfer ownership', command: () => doFactionTransferLeadership(Number(button.dataset.playerId), button, expected), success: `Faction ownership transferred to ${button.dataset.name}.` });
    }
    if (action === 'save-mode') {
        const mode = panel.querySelector('#faction-mode-select')?.value;
        if (mode === snapshot.faction.membershipMode) return showToast('Choose a different membership mode.', 'info');
        const previousMode = snapshot.faction.membershipMode;
        const expected = expectedFaction({ membershipMode: previousMode });
        return confirmAndRun({ key: 'changeFactionMode', title: 'Change Membership Mode?', message: `Change from ${MODE_LABEL[previousMode]} to ${MODE_LABEL[mode]}? ${modeChangeWarning(previousMode, mode)}`, label: 'Change mode', command: () => doFactionSetMembershipMode(mode, button, expected), success: `Membership mode changed to ${MODE_LABEL[mode]}.` });
    }
    if (action === 'player-search') return searchPlayers(panel);
    if (action === 'invite-player') {
        const expected = expectedFaction({ membershipMode: snapshot.faction.membershipMode });
        try { await applyCommand(doFactionSendInvitation(Number(button.dataset.playerId), button, expected), `Invitation sent to ${button.dataset.name}.`); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'revoke-invite') {
        const expected = expectedFaction();
        try { await applyCommand(doFactionRevokeInvitation(button.dataset.id, button, expected), 'Invitation revoked.'); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'review-request') {
        const expected = expectedFaction();
        try { await applyCommand(doFactionReviewJoinRequest(button.dataset.id, button.dataset.decision, button, expected), `Join request ${button.dataset.decision === 'accept' ? 'accepted' : 'declined'}.`); } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'generate-code') {
        const identityId = viewerIdentityId();
        const expected = expectedFaction({
            membershipMode: snapshot.faction.membershipMode,
            accessCodeVersion: snapshot.faction.accessCode?.version || null
        });
        if (snapshot.faction.accessCode?.active) {
            const reset = await showConfirmation(
                'resetFactionAccessCode',
                'Reset the One-Time Code?',
                'The current code will become invalid immediately. The replacement code will be displayed only once and will not expire by time.',
                { allowIgnore: false, confirmLabel: 'Reset and generate', cancelLabel: 'Keep current code' }
            );
            if (!reset) return;
            if (!requireSameViewer(identityId)) return;
        }
        generatedCode = '';
        try {
            const result = await applyCommand(doFactionGenerateCode(button, expected), snapshot.faction.accessCode?.active ? 'The prior code was reset and a new one was generated.' : 'One-time faction code generated.');
            generatedCode = result.code || result.plaintextCode || '';
            generatedCodeVersion = generatedCode ? String(snapshot?.faction?.accessCode?.version || '') : '';
            if (!generatedCode && result.codeUnavailable) {
                showToast('The code was generated but its original response could not be replayed. Generate another code to reset it and display the replacement.', 'info');
            }
            paint();
        } catch (error) { reportFactionError(error); }
        return;
    }
    if (action === 'leave') {
        const expected = expectedFaction();
        return confirmAndRun({ key: 'leaveFaction', title: 'Leave Faction?', message: 'You will lose faction access immediately. There is no cooldown for joining another faction.', label: 'Leave faction', command: () => doFactionLeave(button, expected), success: 'You left the faction.' });
    }
    if (action === 'disband') return openDisbandDialog(button);
};

const attachEvents = panel => {
    panel.querySelectorAll('[data-faction-tab]').forEach(button => {
        button.addEventListener('click', () => {
            if (snapshot?.membership) activeTab = button.dataset.factionTab;
            else unaffiliatedTab = button.dataset.factionTab;
            paint();
        });
    });
    panel.querySelectorAll('[data-boost-mode]').forEach(select => select.addEventListener('change', () => {
        boostDrafts[select.dataset.boostMode].mode = select.value;
        paint();
    }));
    panel.querySelectorAll('[data-boost-hours]').forEach(input => input.addEventListener('change', () => {
        boostDrafts[input.dataset.boostHours].hours = Math.max(0.1, Number(input.value) || 1);
        paint();
    }));
    panel.addEventListener('click', event => {
        const button = event.target.closest('[data-faction-action]');
        if (!button || button.disabled) return;
        handleAction(button.dataset.factionAction, button, panel);
    });
    panel.querySelector('#faction-directory-search')?.addEventListener('keydown', event => {
        if (event.key === 'Enter') panel.querySelector('[data-faction-action="directory-search"]')?.click();
    });
    panel.querySelector('#faction-player-search')?.addEventListener('keydown', event => {
        if (event.key === 'Enter') panel.querySelector('[data-faction-action="player-search"]')?.click();
    });
};

if (globalThis.window?.addEventListener) {
    window.addEventListener('bconomy-faction-stale', event => {
        if (!event.detail?.snapshot) return;
        snapshot = event.detail.snapshot;
        reconcileGeneratedCode(snapshot);
        paint();
    });
    window.addEventListener('bconomy-auth-change', () => {
        resetFactionViewCache();
        paint();
        const panel = document.getElementById('panel-faction');
        if (panel?.classList.contains('active')) refresh({ keepDirectory: false });
    });
}

export const resetFactionViewCache = () => {
    snapshot = null;
    directory = [];
    lastGeneratedRequestMessage = '';
    loadError = '';
    loading = false;
    generatedCode = '';
    generatedCodeVersion = '';
    activityHistoryPage = 0;
    treasuryHistoryPage = 0;
    renderGeneration += 1;
};

export const renderFaction = ({ resetTab = false } = {}) => {
    if (resetTab) {
        activeTab = 'overview';
        unaffiliatedTab = 'discover';
    }
    paint();
    return refresh({ keepDirectory: !resetTab });
};
