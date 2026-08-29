'use strict';

const DEV_COMMAND_TYPES = new Set([
    'dev.setCash',
    'dev.addCash',
    'player.setCash',
    'player.addCash'
]);

const DEPRECATED_DEV_COMMAND_TYPES = new Set([
    'player.setCash',
    'player.addCash'
]);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORWARDING_HEADERS = [
    'forwarded',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-port',
    'x-forwarded-server',
    'x-real-ip',
    'via'
];

const isExplicitlyEnabled = (env = process.env) => (
    env.BCONOMY_DEV_COMMANDS === 'true' || env.ALLOW_DEV_COMMANDS === 'true'
);

const parseDevUserIds = (env = process.env) => new Set(
    String(env.BCONOMY_DEV_USER_IDS || '')
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(value => UUID_PATTERN.test(value))
);

const normalizeHost = value => {
    const host = String(value || '').trim().toLowerCase();
    if (host.startsWith('[')) return host.slice(1, host.indexOf(']'));
    return host.replace(/:\d+$/, '');
};

const isLoopbackAddress = value => {
    const address = String(value || '').trim().toLowerCase();
    return address === '::1'
        || address === '127.0.0.1'
        || address.startsWith('127.')
        || address === '::ffff:127.0.0.1';
};

const isLocalDevelopmentRequest = (req, env = process.env) => {
    if (env.NODE_ENV === 'production') return false;
    if (!isLoopbackAddress(req?.socket?.remoteAddress)) return false;
    if (!['localhost', '127.0.0.1', '::1'].includes(normalizeHost(req?.get?.('host')))) return false;
    return !FORWARDING_HEADERS.some(header => Boolean(req?.get?.(header)));
};

const authorizeDevCommand = ({ req, userId = null, env = process.env } = {}) => {
    if (!isExplicitlyEnabled(env)) {
        return {
            allowed: false,
            code: 'DEV_COMMANDS_DISABLED',
            message: 'Developer commands are disabled.'
        };
    }
    if (isLocalDevelopmentRequest(req, env)) return { allowed: true, source: 'local-development' };
    if (userId && parseDevUserIds(env).has(String(userId).toLowerCase())) {
        return { allowed: true, source: 'user-allowlist' };
    }
    return {
        allowed: false,
        code: 'DEV_COMMAND_FORBIDDEN',
        message: 'This player is not authorized to use developer commands.'
    };
};

const warnDeprecatedDevToggle = (env = process.env, logger = console) => {
    if (env.ALLOW_DEV_COMMANDS === 'true' && env.BCONOMY_DEV_COMMANDS !== 'true') {
        logger.warn(JSON.stringify({
            event: 'deprecated_configuration',
            variable: 'ALLOW_DEV_COMMANDS',
            replacement: 'BCONOMY_DEV_COMMANDS',
            removal: 'next-release'
        }));
    }
};

module.exports = {
    DEV_COMMAND_TYPES,
    DEPRECATED_DEV_COMMAND_TYPES,
    isExplicitlyEnabled,
    parseDevUserIds,
    isLoopbackAddress,
    isLocalDevelopmentRequest,
    authorizeDevCommand,
    warnDeprecatedDevToggle
};
