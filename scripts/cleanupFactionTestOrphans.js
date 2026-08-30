'use strict';

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const url = process.env.SUPABASE_TEST_URL;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const databaseUrl = process.env.SUPABASE_TEST_DB_URL;
const cutoff = Date.now() - 24 * 60 * 60 * 1000;

if (process.env.BCONOMY_FACTION_TEST_EXCLUSIVE !== 'true' || !url || !serviceKey || !databaseUrl) {
    console.error('Cleanup requires the exclusive test-project flag and all SUPABASE_TEST_* server secrets.');
    process.exit(2);
}

async function main() {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const orphanIds = [];
    for (let page = 1; ; page += 1) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        for (const user of data.users) {
            const metadata = user.user_metadata || {};
            const createdAt = new Date(metadata.bconomy_test_created_at || user.created_at || 0).getTime();
            if (metadata.bconomy_test_run && Number.isFinite(createdAt) && createdAt <= cutoff) orphanIds.push(user.id);
        }
        if (data.users.length < 1000) break;
    }
    if (!orphanIds.length) {
        console.log('No faction-test orphans older than 24 hours.');
        return;
    }

    const db = new Client({ connectionString: databaseUrl, ssl: databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false } });
    await db.connect();
    try {
        await db.query('delete from public.factions where leader_id = any($1::uuid[])', [orphanIds]);
    } finally {
        await db.end();
    }
    const deletionErrors = [];
    for (const userId of orphanIds) {
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) deletionErrors.push(error);
    }
    if (deletionErrors.length) throw new AggregateError(deletionErrors, 'Some faction-test identities could not be deleted.');
    console.log(`Deleted ${orphanIds.length} orphaned faction-test identities.`);
}

main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
});
