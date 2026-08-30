'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const runner = read('scripts/runFactionIntegration.js');
const integration = read('tests/integration/faction_v2.integration.js');
const cleanup = read('scripts/cleanupFactionTestOrphans.js');
const localWorkflow = read('.github/workflows/test.yml');
const remoteWorkflow = read('.github/workflows/faction-remote-smoke.yml');
const cleanupWorkflow = read('.github/workflows/faction-test-cleanup.yml');
const config = read('supabase/config.toml');

assert.equal((runner.match(/await client\.query\(schema\)/g) || []).length, 2, 'local and remote gates apply the canonical schema twice');
assert(runner.includes("BCONOMY_FACTION_TEST_EXCLUSIVE !== 'true'"));
assert(runner.includes('SUPABASE_TEST_URL must not match the application SUPABASE_URL'));
assert(runner.includes("supabase', 'stop', '--no-backup'"), 'local stack always stops without retaining test state');
assert(integration.includes('.finally(async () =>') && integration.includes('await cleanup()'), 'integration identities are cleaned in finally');
assert(integration.includes('continuous drain must advance the broad snapshot revision'));
assert(integration.includes("details.precondition, 'membershipMode'"));
assert(integration.includes("details.precondition, 'boost'"));
assert(integration.includes("details.precondition, 'targetMember'"));
assert(integration.includes("details.precondition, 'accessCodeVersion'"));
assert(cleanup.includes('bconomy_test_run') && cleanup.includes('24 * 60 * 60 * 1000'));
assert(localWorkflow.includes('npm run test:factions:local'));
assert(remoteWorkflow.includes('environment: supabase-test') && remoteWorkflow.includes('npm run test:factions:remote'));
assert(cleanupWorkflow.includes('schedule:') && cleanupWorkflow.includes('npm run test:factions:cleanup'));
for (const secret of ['SUPABASE_TEST_URL', 'SUPABASE_TEST_ANON_KEY', 'SUPABASE_TEST_SERVICE_ROLE_KEY', 'SUPABASE_TEST_DB_URL']) {
    assert(remoteWorkflow.includes(`secrets.${secret}`), `remote workflow consumes protected ${secret}`);
}
assert(config.includes('enable_anonymous_sign_ins = true'));

console.log('✓ Guarded local/remote faction integration, cleanup, protected secrets, and regression scenarios verified');
