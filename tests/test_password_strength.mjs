/**
 * Unit tests for Password Strength Evaluation & Progression
 */
import assert from 'node:assert';
import { evaluatePasswordStrength } from '../public/js/auth.js';

console.log('--- Running Password Strength Meter Unit Tests ---');

// Test 1: Empty or null password
const empty = evaluatePasswordStrength('');
assert.strictEqual(empty.score, 0);
assert.strictEqual(empty.label, 'Password strength');
assert.deepStrictEqual(empty.bars, [false, false, false, false]);
console.log('✓ Test 1 Passed: Empty password correctly displays default placeholder state');

// Test 2: Short / very weak password (< 6 chars)
const veryWeak = evaluatePasswordStrength('abc');
assert.strictEqual(veryWeak.score, 1);
assert.strictEqual(veryWeak.label, 'Very weak');
assert.deepStrictEqual(veryWeak.bars, [true, false, false, false]);
assert.strictEqual(veryWeak.levelClass, 'strength-very-weak');
console.log('✓ Test 2 Passed: Very weak password triggers single red bar (Very weak)');

// Test 3: Weak password (length >= 6 with numbers only lowercase)
const weak = evaluatePasswordStrength('simple12');
assert.strictEqual(weak.score, 2);
assert.strictEqual(weak.label, 'Weak');
assert.deepStrictEqual(weak.bars, [true, true, false, false]);
assert.strictEqual(weak.levelClass, 'strength-weak');
console.log('✓ Test 3 Passed: Weak password triggers two orange bars (Weak)');

// Test 4: Good password (length 7, upper + lower + numbers)
const good = evaluatePasswordStrength('Pass123');
assert.strictEqual(good.score, 3);
assert.strictEqual(good.label, 'Good');
assert.deepStrictEqual(good.bars, [true, true, true, false]);
assert.strictEqual(good.levelClass, 'strength-good');
console.log('✓ Test 4 Passed: Good password triggers three green bars (Good)');

// Test 5: Strong password (length >= 10, lower, upper, numbers, special symbols)
const strong = evaluatePasswordStrength('OrangeBoatTree1234!#');
assert.strictEqual(strong.score, 4);
assert.strictEqual(strong.label, 'Strong');
assert.deepStrictEqual(strong.bars, [true, true, true, true]);
assert.strictEqual(strong.levelClass, 'strength-strong');
console.log('✓ Test 5 Passed: Strong password triggers all four emerald bars (Strong)');

console.log('--- All Password Strength Meter Tests Passed Successfully! ---');
