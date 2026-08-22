import assert from 'node:assert/strict';
import { formatPlotIdRanges, parsePlotSelection } from '../public/js/ui/farmSelection.js';

console.log('--- Running Farm Plot Selection Tests ---');

assert.equal(formatPlotIdRanges([8, 1, 2, 3, 6, 6, 7, 10]), '1-3, 6-8, 10');
assert.equal(formatPlotIdRanges([]), '');

const available = [1, 2, 3, 4, 5, 6, 7, 8, 10];
assert.deepEqual(parsePlotSelection('1, 3, 5-8', available), {
    valid: true,
    plotIds: [1, 3, 5, 6, 7, 8]
});
assert.deepEqual(parsePlotSelection(' 8-8, 3, 3, 1 ', available), {
    valid: true,
    plotIds: [1, 3, 8]
});

for (const input of ['', '1.5', '0', '-1', '8-5', '1 3', '1-', '1-999999999']) {
    assert.equal(parsePlotSelection(input, available).valid, false, `${input || 'empty input'} is rejected`);
}
assert.equal(parsePlotSelection('1,'.repeat(200), available).valid, false, 'Oversized expressions are rejected');
assert.match(parsePlotSelection('9', available).error, /Unavailable plot number/);

console.log('✓ Plot expression parsing, validation, deduplication, and range formatting verified');
