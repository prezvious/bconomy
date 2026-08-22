import { parseShorthandNumbers, evaluateMathExpression, isPureMathExpression, formatWithCommas, formatCompactShorthand, convertToLaTeX, renderLaTeXPreview, attachMathInputPreview } from '../public/js/utils/calculator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        failed++;
    }
}

console.log('=== Running Calculator Engine Unit Tests ===');

// 1. Shorthand Parsing Tests
console.log('\n--- 1. Shorthand Parsing ---');
assert(parseShorthandNumbers('1.5k') === '1500', '1.5k -> 1500');
assert(parseShorthandNumbers('2.5m') === '2500000', '2.5m -> 2500000');
assert(parseShorthandNumbers('1 billion') === '1000000000', '1 billion -> 1000000000');
assert(parseShorthandNumbers('3.2 trillions') === '3200000000000', '3.2 trillions -> 3200000000000');
assert(parseShorthandNumbers('500k + 2m') === '500000 + 2000000', '500k + 2m replacement');

// 2. Arithmetic & Expression Evaluation Tests
console.log('\n--- 2. Expression Evaluation ---');
let res1 = evaluateMathExpression('8 * 8');
assert(res1.success && res1.value === 64, '8 * 8 = 64');

let res2 = evaluateMathExpression('9/3 * (39 + 3)');
assert(res2.success && res2.value === 126, '9/3 * (39 + 3) = 126');

let res3 = evaluateMathExpression('1.5k + 500');
assert(res3.success && res3.value === 2000, '1.5k + 500 = 2000');

let res4 = evaluateMathExpression('2.5m * 4');
assert(res4.success && res4.value === 10000000, '2.5m * 4 = 10,000,000');

let res5 = evaluateMathExpression('sqrt(144) + abs(-8)');
assert(res5.success && res5.value === 20, 'sqrt(144) + abs(-8) = 20');

let res6 = evaluateMathExpression('max(10, 50, 25)');
assert(res6.success && res6.value === 50, 'max(10, 50, 25) = 50');

let res7 = evaluateMathExpression('500 + 10%');
assert(res7.success && res7.value === 550, '500 + 10% = 550');

let res8 = evaluateMathExpression('200 - 15%');
assert(res8.success && res8.value === 170, '200 - 15% = 170');

let res9 = evaluateMathExpression('100 * 20%');
assert(res9.success && res9.value === 20, '100 * 20% = 20');

// 3. Keyword Context Tests
console.log('\n--- 3. Keyword Context ---');
let resKw1 = evaluateMathExpression('max / 2', { max: 100 });
assert(resKw1.success && resKw1.value === 50, 'max / 2 with max=100 -> 50');

let resKw2 = evaluateMathExpression('owned * 10', { owned: 5 });
assert(resKw2.success && resKw2.value === 50, 'owned * 10 with owned=5 -> 50');

let resKw3 = evaluateMathExpression('max(10, 50)', { max: 100 });
assert(resKw3.success && resKw3.value === 50, 'max(10, 50) function not overwritten by context max=100');

// 4. Standalone Math Expression Auto-Detection Tests
console.log('\n--- 4. Pure Math Auto-Detection ---');
assert(isPureMathExpression('8 * 8') === true, 'Detects 8 * 8 as math');
assert(isPureMathExpression('9/3 * (39 + 3)') === true, 'Detects complex parenthesis expression as math');
assert(isPureMathExpression('500k + 2m') === true, 'Detects 500k + 2m as math');
assert(isPureMathExpression('sqrt(100)') === true, 'Detects sqrt(100) as math');
assert(isPureMathExpression('/mine') === false, 'Rejects /mine command');
assert(isPureMathExpression('hello world') === false, 'Rejects text string');
assert(isPureMathExpression('buy 100 + 5') === false, 'Rejects text command with embedded math operators');
assert(isPureMathExpression('/calc 50 * 2') === false, 'Rejects /calc prefix (handled by slash command)');

// 5. LaTeX Conversion & Preview Tests
console.log('\n--- 5. LaTeX Conversion & Preview ---');
let tex1 = convertToLaTeX('5 * 5');
assert(tex1.includes('\\times'), '5 * 5 converts to \\times');

let tex2 = convertToLaTeX('9 / 3');
assert(tex2.includes('\\div'), '9 / 3 converts to \\div');

let tex3 = convertToLaTeX('sqrt(100)');
assert(tex3.includes('\\sqrt{100}'), 'sqrt(100) converts to \\sqrt{100}');

let previewHtml = renderLaTeXPreview('5 * 5');
assert(previewHtml.includes('5 * 5'), 'Fallback html renders expression string cleanly when KaTeX is absent in Node environment');

// 6. Error & Edge Case Handling Tests
console.log('\n--- 6. Error & Edge Cases ---');
let divZero = evaluateMathExpression('10 / 0');
assert(!divZero.success && divZero.error === 'Division by zero', 'Division by zero error caught');

let negSqrt = evaluateMathExpression('sqrt(-16)');
assert(!negSqrt.success, 'Negative square root error caught');

let unbalParen = evaluateMathExpression('(10 + 5');
assert(!unbalParen.success, 'Unbalanced parenthesis error caught');

// 7. Formatting Tests
console.log('\n--- 7. Formatting ---');
assert(formatWithCommas(1250000) === '1,250,000', 'Comma formatting');
assert(formatCompactShorthand(2500000) === '2.5M', 'Shorthand formatting 2.5M');
assert(formatCompactShorthand(1000000000) === '1B', 'Shorthand formatting 1B');

// 8. Rebinding a persistent item-modal input must remove stale closures.
console.log('\n--- 8. Input Preview Lifecycle ---');
const listeners = { input: new Set(), blur: new Set() };
const mockInput = {
    value: 'owned',
    addEventListener(type, listener) { listeners[type].add(listener); },
    removeEventListener(type, listener) { listeners[type].delete(listener); }
};
const mockPreview = { innerHTML: '' };
attachMathInputPreview(mockInput, mockPreview, () => ({ owned: 10 }));
attachMathInputPreview(mockInput, mockPreview, () => ({ owned: 5 }));
assert(listeners.input.size === 1 && listeners.blur.size === 1, 'Rebinding replaces prior input and blur listeners');
[...listeners.input][0]();
assert(mockPreview.innerHTML.includes('= 5'), 'Latest item context drives the live preview');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
    process.exit(1);
}
