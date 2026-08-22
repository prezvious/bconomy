/**
 * Unit tests for Supabase Database Helper & Player ID System
 */
import assert from 'node:assert';
import { formatPlayerId, isSupabaseConfigured } from '../src/db/supabase.js';

console.log('--- Running Supabase Integration & Player ID Unit Tests ---');

// Test 1: Player ID formatting starting from 1
assert.strictEqual(formatPlayerId(1), '#1');
assert.strictEqual(formatPlayerId(2), '#2');
assert.strictEqual(formatPlayerId(100), '#100');
assert.strictEqual(formatPlayerId(null), '');
assert.strictEqual(formatPlayerId(undefined), '');
console.log('✓ Test 1 Passed: Sequential Player ID formatting verified (#1, #2, #100)');

// Test 2: Configuration detection
const configured = isSupabaseConfigured();
assert.strictEqual(typeof configured, 'boolean');
console.log(`✓ Test 2 Passed: Supabase configuration detection returned: ${configured}`);

console.log('--- All Supabase Integration Tests Passed Successfully! ---');
