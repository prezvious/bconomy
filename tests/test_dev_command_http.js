const assert = require('assert');

delete process.env.BCONOMY_DEV_COMMANDS;
delete process.env.ALLOW_DEV_COMMANDS;
delete process.env.BCONOMY_DEV_USER_IDS;
process.env.NODE_ENV = 'development';

const app = require('../server');
const server = app.listen(0, '127.0.0.1');

const baseState = { cash: 25, rankIndex: 0, prestigeCount: 0, prestigePoints: 0 };
const headers = { 'Content-Type': 'application/json', 'X-Bconomy-API-Version': '1' };

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const command = async (commandId, extraHeaders = {}) => {
        const response = await fetch(`${origin}/api/game/commands`, {
            method: 'POST',
            headers: { ...headers, ...extraHeaders },
            body: JSON.stringify({
                commandId,
                expectedRevision: 0,
                type: 'dev.addCash',
                payload: { cash: 75 },
                guestState: baseState
            })
        });
        return { status: response.status, body: await response.json() };
    };

    const disabled = await command('123e4567-e89b-42d3-a456-426614174030');
    assert.equal(disabled.status, 403);
    assert.equal(disabled.body.error.code, 'DEV_COMMANDS_DISABLED');
    assert.equal(disabled.body.state, undefined);
    assert.equal(disabled.body.revision, undefined);

    process.env.BCONOMY_DEV_COMMANDS = 'true';
    const localConfig = await (await fetch(`${origin}/api/config/auth`)).json();
    assert.equal(localConfig.devMode, true);

    const spoofed = await command('123e4567-e89b-42d3-a456-426614174031', { 'X-Forwarded-For': '127.0.0.1' });
    assert.equal(spoofed.status, 403);
    assert.equal(spoofed.body.error.code, 'DEV_COMMAND_FORBIDDEN');
    assert.equal(spoofed.body.state, undefined);

    process.env.NODE_ENV = 'production';
    const production = await command('123e4567-e89b-42d3-a456-426614174032');
    assert.equal(production.status, 403);
    assert.equal(production.body.error.code, 'DEV_COMMAND_FORBIDDEN');

    process.env.NODE_ENV = 'development';
    const allowed = await command('123e4567-e89b-42d3-a456-426614174033');
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.state.cash, 100);
    assert.equal(allowed.body.revision, 1);

    console.log('✓ HTTP dev-command switch, spoof rejection, production denial, local authorization, and non-mutation responses verified');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
