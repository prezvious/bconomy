/**
 * Test Runner Script for Bconomy
 * Discovers and executes all unit and engine test files.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testsDir = __dirname;
const files = fs.readdirSync(testsDir).filter(f => f.startsWith('test_') && (f.endsWith('.js') || f.endsWith('.mjs')) && f !== 'run_all_tests.js');

console.log(`=== Bconomy Test Runner: Found ${files.length} Test Suites ===\n`);

let passedCount = 0;
let failedCount = 0;

for (const file of files) {
    const filePath = path.join(testsDir, file);
    console.log(`--------------------------------------------------`);
    console.log(`▶ Executing: ${file}`);
    console.log(`--------------------------------------------------`);
    try {
        execSync(`node "${filePath}"`, { stdio: 'inherit' });
        passedCount++;
    } catch (err) {
        console.error(`❌ FAILED: ${file}`);
        failedCount++;
    }
}

console.log(`\n==================================================`);
console.log(`Test Execution Summary: ${passedCount} PASSED, ${failedCount} FAILED out of ${files.length} total suites.`);
console.log(`==================================================`);

if (failedCount > 0) {
    process.exit(1);
}
