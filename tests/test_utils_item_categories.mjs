import assert from 'assert';
import { getItemCategory, getItemIcon } from '../public/js/utils.js';

console.log('--- Testing Item Categories & Item Icons ---');

// Test 1: Feathers should be material, not meat, and have feather icon
assert.strictEqual(getItemCategory('Feathers'), 'material', 'Feathers should be categorized as material');
assert.strictEqual(getItemIcon('Feathers'), 'lucide:feather', 'Feathers should use feather icon');

// Test 2: Prime Steak should be meat and have beef icon
assert.strictEqual(getItemCategory('PrimeSteak'), 'meat', 'PrimeSteak should be categorized as meat');
assert.strictEqual(getItemIcon('PrimeSteak'), 'lucide:beef', 'PrimeSteak should use beef icon');

// Test 3: Other hunt/material items
assert.strictEqual(getItemCategory('OldBones'), 'material', 'OldBones should be material');
assert.strictEqual(getItemIcon('OldBones'), 'lucide:bone', 'OldBones should use bone icon');

assert.strictEqual(getItemCategory('SkunkPelt'), 'material', 'SkunkPelt should be material');
assert.strictEqual(getItemIcon('SkunkPelt'), 'lucide:layers', 'SkunkPelt should use layers icon');

assert.strictEqual(getItemCategory('Rock'), 'ore', 'Rock should be ore');
assert.strictEqual(getItemCategory('Sardine'), 'fish', 'Sardine should be fish');

assert.strictEqual(getItemCategory('Gravel'), 'Farm Upgrade Material');
assert.strictEqual(getItemCategory('Water Pump'), 'Farm Upgrade Material');
assert.strictEqual(getItemIcon('Gravel'), 'lucide:mountain');
assert.strictEqual(getItemIcon('Water Pump'), 'lucide:circle-gauge');

console.log('✓ All Item Category & Icon Tests Passed Successfully!');
