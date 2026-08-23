import assert from 'assert';

console.log('--- Running Release Notes Component & Inaccuracy Tests ---');

const { RELEASES } = await import('../public/js/ui/releaseNotesModal.js');

// 1. Verify v2.0 exists and is marked latest
const latestRelease = RELEASES.find(r => r.isLatest);
assert.ok(latestRelease, 'Latest release must exist');
assert.strictEqual(latestRelease.version, 'v2.0');
assert.strictEqual(latestRelease.date, '2026-08-23');
assert.ok(latestRelease.title.includes('v2.0'));
assert.ok(latestRelease.sections.length >= 3, 'v2.0 should have New Features, Improvements, and Bug Fixes');
console.log('✓ Latest release v2.0 verified with title, date, and sections');

// 2. Verify all releases have required fields and no external blog URLs
const expectedVersions = ['v2.0', 'v1.4', 'v1.3', 'v1.2', 'v1.1', 'v1.0'];
const actualVersions = RELEASES.map(r => r.version);
assert.deepStrictEqual(actualVersions, expectedVersions, 'Releases must be ordered chronologically descending (v2.0 -> v1.0)');

for (const release of RELEASES) {
    assert.ok(release.id, 'Release must have an id');
    assert.ok(release.version, 'Release must have a version');
    assert.ok(release.date, 'Release must have a date');
    assert.ok(release.title, 'Release must have a title');
    assert.strictEqual(release.link, undefined, 'Personal game release notes should not have external third-party links');
    assert.ok(Array.isArray(release.sections), 'Release must have sections array');
    for (const section of release.sections) {
        assert.ok(section.type, 'Section must have a type heading');
        assert.ok(Array.isArray(section.items), 'Section must have items array');
        for (const item of section.items) {
            assert.ok(item.title, 'Item must have a title');
            assert.ok(Array.isArray(item.bullets), 'Item must have bullets array');
            assert.ok(item.bullets.length > 0, 'Item must have at least 1 bullet');
        }
    }
}
console.log(`✓ All ${RELEASES.length} personal game release entries contain accurate schema structure`);

// 3. Verify search filtering matches expected content across versions
const durationMatches = RELEASES.filter(r => 
    r.title.toLowerCase().includes('duration') || 
    JSON.stringify(r.sections).toLowerCase().includes('duration')
);
assert.ok(durationMatches.some(r => r.version === 'v2.0'), 'Search for "duration" matches v2.0');

const supabaseMatches = RELEASES.filter(r => 
    r.title.toLowerCase().includes('supabase') || 
    JSON.stringify(r.sections).toLowerCase().includes('supabase')
);
assert.ok(supabaseMatches.some(r => r.version === 'v1.2'), 'Search for "supabase" matches v1.2');

const socketMatches = RELEASES.filter(r => 
    r.title.toLowerCase().includes('socket') || 
    JSON.stringify(r.sections).toLowerCase().includes('socket')
);
assert.ok(socketMatches.some(r => r.version === 'v1.1'), 'Search for "socket" matches v1.1');

console.log('✓ Search query matching verified across versions');

// 4. Verify version filter isolation
for (const ver of expectedVersions) {
    const single = RELEASES.filter(r => r.version === ver);
    assert.strictEqual(single.length, 1, `Version filter for ${ver} should isolate exactly 1 release`);
}
console.log('✓ Version filter isolation verified for all versions');

console.log('--- All Release Notes Tests Passed! ---');
