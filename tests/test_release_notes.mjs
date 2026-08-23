import assert from 'assert';

console.log('--- Running Release Notes Component Tests ---');

const { RELEASES } = await import('../public/js/ui/releaseNotesModal.js');

// 1. Verify v2.0 exists and is marked latest
const latestRelease = RELEASES.find(r => r.isLatest);
assert.ok(latestRelease, 'Latest release must exist');
assert.strictEqual(latestRelease.version, 'v2.0');
assert.strictEqual(latestRelease.date, '2026-08-23');
assert.ok(latestRelease.title.includes('v2.0'));
assert.ok(latestRelease.sections.length >= 3, 'v2.0 should have New Features, Improvements, and Bug Fixes');
console.log('✓ Latest release v2.0 verified with title, date, and sections');

// 2. Verify all releases have required fields
for (const release of RELEASES) {
    assert.ok(release.id, 'Release must have an id');
    assert.ok(release.version, 'Release must have a version');
    assert.ok(release.date, 'Release must have a date');
    assert.ok(release.title, 'Release must have a title');
    assert.ok(Array.isArray(release.sections), 'Release must have sections array');
    for (const section of release.sections) {
        assert.ok(section.type, 'Section must have a type heading');
        assert.ok(Array.isArray(section.items), 'Section must have items array');
    }
}
console.log(`✓ All ${RELEASES.length} release entries contain well-formed schema structure`);

// 3. Verify search filtering matches expected content
const timerQueryMatches = RELEASES.filter(r => 
    r.title.toLowerCase().includes('timer') || 
    JSON.stringify(r.sections).toLowerCase().includes('timer')
);
assert.ok(timerQueryMatches.length >= 1, 'Search for "timer" must match v2.0');
assert.strictEqual(timerQueryMatches[0].version, 'v2.0');
console.log('✓ Search query matching verified');

console.log('--- Release Notes Component Tests Passed! ---');
