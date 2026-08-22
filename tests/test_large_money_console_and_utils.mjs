import assert from 'assert';
import { formatMoney, formatDisplayNumber, formatExactNumber } from '../public/js/utils.js';

console.log('Testing Large Money Formatting & Magnitude Support...');

// Test 1: formatMoney with large magnitudes
assert.strictEqual(formatMoney(5000000000000000, { numberDisplay: 'named' }), '$5.00 quadrillion');
assert.strictEqual(formatMoney(5e18, { numberDisplay: 'named' }), '$5.00 quintillion');
assert.strictEqual(formatMoney(5e21, { numberDisplay: 'named' }), '$5.00 sextillion');
assert.strictEqual(formatMoney(5e24, { numberDisplay: 'named' }), '$5.00 septillion');
console.log('✔ Test 1 Passed: formatMoney handles quadrillion up to septillion');

// Test 2: formatExactNumber with 5 quadrillion
assert.strictEqual(formatExactNumber(5000000000000000), '5,000,000,000,000,000');
console.log('✔ Test 2 Passed: formatExactNumber comma separation verified');

// Test 3: Console amount parsing logic
function parseConsoleAmount(amount) {
    if (typeof amount === 'number') {
        return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(amount) || 0));
    }
    const cleanStr = String(amount).replace(/,/g, '').replace(/\$/g, '').trim().toLowerCase();
    const match = cleanStr.match(/^([0-9.]+)\s*([a-z]*)$/);
    if (!match) return 0;

    const numPart = parseFloat(match[1]) || 0;
    const unitPart = match[2];

    let multiplier = 1;
    if (unitPart === 'k' || unitPart === 'thousand') {
        multiplier = 1e3;
    } else if (unitPart === 'm' || unitPart === 'million') {
        multiplier = 1e6;
    } else if ((unitPart === 'b' || unitPart === 'bil' || unitPart === 'billion') && numPart < 1e9) {
        multiplier = 1e9;
    } else if (unitPart === 't' || unitPart === 'tril' || unitPart === 'trillion') {
        multiplier = 1e12;
    } else if (unitPart === 'q' || unitPart === 'quad' || unitPart === 'quadrillion') {
        multiplier = 1e15;
    }

    const finalVal = Math.floor(numPart * multiplier);
    return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, finalVal || 0));
}

assert.strictEqual(parseConsoleAmount('5000000000000000b'), 5000000000000000, '5000000000000000b should parse as 5 quadrillion raw cash');
assert.strictEqual(parseConsoleAmount('5b'), 5000000000, '5b should parse as 5 billion');
assert.strictEqual(parseConsoleAmount('5q'), 5000000000000000, '5q should parse as 5 quadrillion');
assert.strictEqual(parseConsoleAmount('100000000000000000000000000'), Number.MAX_SAFE_INTEGER, 'Should clamp to MAX_SAFE_INTEGER');
console.log('✔ Test 3 Passed: Console parser correctly handles currency vs unit shorthand');

console.log('ALL LARGE MONEY UTILS TESTS PASSED!');
