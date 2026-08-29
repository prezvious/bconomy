const assert = require('assert');
const {
    authorizeDevCommand,
    isLocalDevelopmentRequest,
    parseDevUserIds,
    warnDeprecatedDevToggle
} = require('../src/api/devCommandAccess');
const { executeCommand } = require('../src/api/gameGateway');

const userId = '123e4567-e89b-42d3-a456-426614174000';
const request = ({ address = '127.0.0.1', host = 'localhost:3000', headers = {} } = {}) => ({
    socket: { remoteAddress: address },
    get(name) {
        if (name.toLowerCase() === 'host') return host;
        return headers[name.toLowerCase()] || '';
    }
});

console.log('--- Running Developer Command Authorization Tests ---');

const disabled = authorizeDevCommand({ req: request(), env: { NODE_ENV: 'development' } });
assert.strictEqual(disabled.allowed, false);
assert.strictEqual(disabled.code, 'DEV_COMMANDS_DISABLED');

const localEnv = { NODE_ENV: 'development', BCONOMY_DEV_COMMANDS: 'true' };
assert.strictEqual(isLocalDevelopmentRequest(request(), localEnv), true);
assert.strictEqual(authorizeDevCommand({ req: request(), env: localEnv }).allowed, true);

const spoofed = request({ headers: { 'x-forwarded-for': '127.0.0.1' } });
assert.strictEqual(isLocalDevelopmentRequest(spoofed, localEnv), false);
assert.strictEqual(authorizeDevCommand({ req: spoofed, env: localEnv }).code, 'DEV_COMMAND_FORBIDDEN');

const productionLoopback = authorizeDevCommand({
    req: request(),
    env: { NODE_ENV: 'production', BCONOMY_DEV_COMMANDS: 'true' }
});
assert.strictEqual(productionLoopback.code, 'DEV_COMMAND_FORBIDDEN');

const remoteRequest = request({ address: '203.0.113.9', host: 'game.example' });
const remoteEnv = {
    NODE_ENV: 'production',
    BCONOMY_DEV_COMMANDS: 'true',
    BCONOMY_DEV_USER_IDS: `invalid, ${userId.toUpperCase()}, also-invalid`
};
assert.deepStrictEqual([...parseDevUserIds(remoteEnv)], [userId]);
assert.strictEqual(authorizeDevCommand({ req: remoteRequest, env: remoteEnv }).code, 'DEV_COMMAND_FORBIDDEN');
assert.strictEqual(authorizeDevCommand({ req: remoteRequest, userId, env: remoteEnv }).allowed, true);

const legacyWarnings = [];
warnDeprecatedDevToggle({ ALLOW_DEV_COMMANDS: 'true' }, { warn: value => legacyWarnings.push(JSON.parse(value)) });
assert.strictEqual(legacyWarnings[0].variable, 'ALLOW_DEV_COMMANDS');

const sourceState = { cash: 25, rankIndex: 0, prestigeCount: 0, prestigePoints: 0 };
const deniedGateway = executeCommand(sourceState, 'dev.addCash', { cash: 75 });
assert.strictEqual(deniedGateway.ok, false);
assert.strictEqual(deniedGateway.code, 'DEV_COMMANDS_DISABLED');
assert.strictEqual(sourceState.cash, 25, 'a denied direct gateway command must not mutate caller state');

const allowedGateway = executeCommand(sourceState, 'dev.addCash', { cash: 75 }, Date.now(), { allowDevCommands: true });
assert.strictEqual(allowedGateway.ok, true);
assert.strictEqual(allowedGateway.state.cash, 100);

const aliasGateway = executeCommand(sourceState, 'player.setCash', { cash: 500 }, Date.now(), { allowDevCommands: true });
assert.strictEqual(aliasGateway.ok, true);
assert.strictEqual(aliasGateway.state.cash, 500);

console.log('✓ Switch, locality, proxy spoofing, production, allowlist, alias, and fail-closed gateway behavior verified');
