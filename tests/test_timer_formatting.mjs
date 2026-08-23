import assert from 'assert';

console.log('--- Running Extended Timer & Duration Formatting Tests ---');

// Mock localStorage and DOM environment for preferences
const storage = new Map();
global.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};

global.document = {
    documentElement: { dataset: {} },
    dispatchEvent: () => true
};

const preferences = await import('../public/js/preferences.js');
const {
    SETTINGS_STORAGE_KEY,
    getDefaultSettings,
    getStoredSettings,
    saveStoredSettings,
    resetDisplaySettings,
    invalidateSettingsCache
} = preferences;

const {
    formatDurationMs,
    formatTimestampDate
} = await import('../public/js/utils.js');

// 1. Verify default settings
const defaults = getDefaultSettings();
assert.strictEqual(defaults.timerDateFormat, 'dd/mm/yyyy');
assert.strictEqual(defaults.timerTimeFormat, '24h');
assert.strictEqual(defaults.timerTimezone, 'local');
assert.strictEqual(defaults.durationFormat, 'adaptive');
assert.strictEqual(defaults.timerHoverMode, 'swap');
console.log('✓ Defaults include timerDateFormat, timerTimeFormat, timerTimezone, durationFormat, and timerHoverMode');

// 2. Test formatDurationMs with all modes
// A. Short durations
assert.strictEqual(formatDurationMs(0), 'Expired');
assert.strictEqual(formatDurationMs(-5000), 'Expired');
assert.strictEqual(formatDurationMs(45000), '45s');
assert.strictEqual(formatDurationMs(90000), '1m 30s');
assert.strictEqual(formatDurationMs(15 * 60 * 1000), '15m');
assert.strictEqual(formatDurationMs(3665000), '1h 1m 5s');

// B. Multi-day duration
const fiveDaysThreeHoursMs = (5 * 86400 + 3 * 3600 + 12 * 60 + 30) * 1000;
assert.strictEqual(formatDurationMs(fiveDaysThreeHoursMs, { durationFormat: 'adaptive' }), '5d 3h 12m');
assert.strictEqual(formatDurationMs(fiveDaysThreeHoursMs, { durationFormat: 'adaptive-2' }), '5d 3h');
assert.strictEqual(formatDurationMs(fiveDaysThreeHoursMs, { durationFormat: 'full' }), '5d 3h 12m 30s');
assert.strictEqual(formatDurationMs(fiveDaysThreeHoursMs, { durationFormat: 'days-hours' }), '5d 3h 12m 30s');
assert.strictEqual(formatDurationMs(fiveDaysThreeHoursMs, { durationFormat: 'hours' }), '123h 12m 30s');

// C. Massive multi-year durations
const massiveDurationMs = (3255217 * 3600 + 24 * 60 + 55) * 1000;
assert.strictEqual(formatDurationMs(massiveDurationMs, { durationFormat: 'adaptive' }), '371y 7mo 1w');
assert.strictEqual(formatDurationMs(massiveDurationMs, { durationFormat: 'adaptive-2' }), '371y 7mo');
assert.strictEqual(formatDurationMs(massiveDurationMs, { durationFormat: 'full' }), '371y 7mo 1w 2d 1h 24m 55s');
assert.strictEqual(formatDurationMs(massiveDurationMs, { durationFormat: 'days-hours' }), '135634d 1h 24m 55s');
assert.strictEqual(formatDurationMs(massiveDurationMs, { durationFormat: 'hours' }), '3255217h 24m 55s');
console.log('✓ All duration breakdown modes (adaptive, adaptive-2, full, days-hours, hours) verified');

// 3. Test formatTimestampDate with all date and time options
const sampleTimestamp = new Date(2026, 7, 23, 14, 30, 45).getTime(); // 23 Aug 2026 14:30:45 local

// Date formats
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: '24h' }), '23/08/2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd-mm-yyyy', timerTimeFormat: '24h' }), '23-08-2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd.mm.yyyy', timerTimeFormat: '24h' }), '23.08.2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'yyyy-mm-dd', timerTimeFormat: '24h' }), '2026-08-23 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'yyyy/mm/dd', timerTimeFormat: '24h' }), '2026/08/23 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'mm/dd/yyyy', timerTimeFormat: '24h' }), '08/23/2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'd-mmm-yyyy', timerTimeFormat: '24h' }), '23 Aug 2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'mmm-d-yyyy', timerTimeFormat: '24h' }), 'Aug 23, 2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'full-date', timerTimeFormat: '24h' }), 'Sun, 23 August 2026 14:30:45');

// Time formats
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: '24h' }), '23/08/2026 14:30:45');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: '24h-short' }), '23/08/2026 14:30');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: '12h' }), '23/08/2026 02:30:45 PM');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: '12h-short' }), '23/08/2026 02:30 PM');
assert.strictEqual(formatTimestampDate(sampleTimestamp, { timerDateFormat: 'dd/mm/yyyy', timerTimeFormat: 'none' }), '23/08/2026');

// Timezone (UTC)
const utcFormatted = formatTimestampDate(sampleTimestamp, { timerDateFormat: 'yyyy-mm-dd', timerTimeFormat: '24h', timerTimezone: 'utc' });
assert.ok(utcFormatted.endsWith('UTC'));
console.log('✓ All date formats, time styles (24h/12h/short/none), and timezones verified');

// 4. Test Settings persistence and normalization
saveStoredSettings({
    timerDateFormat: 'd-mmm-yyyy',
    timerTimeFormat: '12h-short',
    timerTimezone: 'utc',
    durationFormat: 'adaptive-2',
    timerHoverMode: 'both'
});

const current = getStoredSettings();
assert.strictEqual(current.timerDateFormat, 'd-mmm-yyyy');
assert.strictEqual(current.timerTimeFormat, '12h-short');
assert.strictEqual(current.timerTimezone, 'utc');
assert.strictEqual(current.durationFormat, 'adaptive-2');
assert.strictEqual(current.timerHoverMode, 'both');
console.log('✓ Extended timer settings successfully saved to preferences');

// Test invalid normalization
saveStoredSettings({
    timerDateFormat: 'invalid-date',
    timerTimeFormat: 'invalid-time',
    timerTimezone: 'invalid-tz',
    durationFormat: 'invalid-duration',
    timerHoverMode: 'invalid-hover'
});
const normalized = getStoredSettings();
assert.strictEqual(normalized.timerDateFormat, 'dd/mm/yyyy');
assert.strictEqual(normalized.timerTimeFormat, '24h');
assert.strictEqual(normalized.timerTimezone, 'local');
assert.strictEqual(normalized.durationFormat, 'adaptive');
assert.strictEqual(normalized.timerHoverMode, 'swap');
console.log('✓ Invalid timer settings safely normalize to defaults');

// Test display reset
resetDisplaySettings();
const reset = getStoredSettings();
assert.strictEqual(reset.timerDateFormat, 'dd/mm/yyyy');
assert.strictEqual(reset.timerTimeFormat, '24h');
assert.strictEqual(reset.timerTimezone, 'local');
assert.strictEqual(reset.durationFormat, 'adaptive');
assert.strictEqual(reset.timerHoverMode, 'swap');
console.log('✓ Reset display settings restores timer defaults cleanly');

console.log('--- All Extended Timer & Duration Formatting Tests Passed! ---');
