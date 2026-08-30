'use strict';

const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const root = path.resolve(__dirname, '..');
const mode = process.argv.includes('--remote') ? 'remote' : process.argv.includes('--local') ? 'local' : '';
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

if (!mode) {
    console.error('Use --local or --remote.');
    process.exit(2);
}

const run = (executable, args, options = {}) => {
    const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', ...options });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        if (result.stdout) process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        throw new Error(`${executable} ${args.join(' ')} exited with status ${result.status}.`);
    }
    return result;
};

const required = (value, name) => {
    if (!value) throw new Error(`${name} is required for faction integration tests.`);
    return value;
};

const parseStatus = output => {
    const start = output.indexOf('{');
    const end = output.lastIndexOf('}');
    if (start < 0 || end < start) throw new Error('Supabase CLI did not return JSON status output.');
    return JSON.parse(output.slice(start, end + 1));
};

async function applyCanonicalSchema(databaseUrl) {
    const schema = readFileSync(path.join(root, 'supabase_schema.sql'), 'utf8');
    const client = new Client({ connectionString: databaseUrl, ssl: databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false } });
    await client.connect();
    try {
        await client.query(schema);
        await client.query(schema);
    } finally {
        await client.end();
    }
}

async function main() {
    let localStarted = false;
    let failure = null;
    try {
        let testEnvironment;
        if (mode === 'local') {
            localStarted = true;
            run(command, ['--no-install', 'supabase', 'start'], { stdio: 'inherit' });
            const status = parseStatus(run(command, ['--no-install', 'supabase', 'status', '--output', 'json']).stdout);
            testEnvironment = {
                SUPABASE_URL: required(status.API_URL, 'local API_URL'),
                SUPABASE_ANON_KEY: required(status.ANON_KEY || status.PUBLISHABLE_KEY, 'local anonymous key'),
                SUPABASE_SERVICE_ROLE_KEY: required(status.SERVICE_ROLE_KEY || status.SECRET_KEY, 'local service-role key'),
                SUPABASE_TEST_DB_URL: required(status.DB_URL, 'local DB_URL')
            };
        } else {
            if (process.env.BCONOMY_FACTION_TEST_EXCLUSIVE !== 'true') {
                throw new Error('Remote tests require BCONOMY_FACTION_TEST_EXCLUSIVE=true for a resettable, non-production Supabase project.');
            }
            testEnvironment = {
                SUPABASE_URL: required(process.env.SUPABASE_TEST_URL, 'SUPABASE_TEST_URL'),
                SUPABASE_ANON_KEY: required(process.env.SUPABASE_TEST_ANON_KEY, 'SUPABASE_TEST_ANON_KEY'),
                SUPABASE_SERVICE_ROLE_KEY: required(process.env.SUPABASE_TEST_SERVICE_ROLE_KEY, 'SUPABASE_TEST_SERVICE_ROLE_KEY'),
                SUPABASE_TEST_DB_URL: required(process.env.SUPABASE_TEST_DB_URL, 'SUPABASE_TEST_DB_URL')
            };
            if (process.env.SUPABASE_URL && process.env.SUPABASE_URL === testEnvironment.SUPABASE_URL) {
                throw new Error('Refusing to run: SUPABASE_TEST_URL must not match the application SUPABASE_URL in this process.');
            }
        }

        await applyCanonicalSchema(testEnvironment.SUPABASE_TEST_DB_URL);
        const result = run(process.execPath, [path.join('tests', 'integration', 'faction_v2.integration.js')], {
            stdio: 'inherit',
            env: {
                ...process.env,
                ...testEnvironment,
                NODE_ENV: 'test',
                BCONOMY_FACTION_TEST_CONFIRM: 'true',
                BCONOMY_DEV_COMMANDS: 'false'
            }
        });
        process.exitCode = result.status || 0;
    } catch (error) {
        failure = error;
    } finally {
        if (mode === 'local' && localStarted) {
            try {
                run(command, ['--no-install', 'supabase', 'stop', '--no-backup'], { stdio: 'inherit' });
            } catch (stopError) {
                if (!failure) failure = stopError;
                else console.error(`Supabase cleanup also failed: ${stopError.message || stopError}`);
            }
        }
    }
    if (failure) throw failure;
}

main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
});
