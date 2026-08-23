const assert = require('assert');
const path = require('path');

const ActionEngine = require('../src/engine/actionEngine');
const ShopEngine = require('../src/engine/shopEngine');
const BoosterEngine = require('../src/engine/boosterEngine');
const ToolEngine = require('../src/engine/toolEngine');
const { FarmEngine } = require('../src/engine/farmEngine');
const { ACTION_COOLDOWNS } = require('../src/engine/dropTables');

console.log('--- Testing Item Locking, Item Pinning, and Work Shift Streaks ---');

// 1. Work Shift Streak Tests
console.log('\n[1] Work Shift Streak Tests');
{
    const state = {
        cash: 0,
        rankIndex: 0,
        prestigeCount: 0,
        inventory: {},
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        perks: { partiality: 0 },
        cooldowns: { work: 0 },
        workShift: { currentStreak: 0, lastWorkAt: 0, streakExpireAt: 0 }
    };

    const workCdMs = (ACTION_COOLDOWNS.work || 1800) * 1000;
    const windowMs = 45 * 60 * 1000;
    const startTime = 1000000;

    // Shift 1
    const res1 = ActionEngine.performAction(state, 'work', startTime, () => 0.5);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.workStreak, 1, 'First shift should set streak to 1');
    assert.strictEqual(res1.streakMultiplier, 1.01, '1 streak gives 1.01x pay multiplier');
    assert.strictEqual(state.workShift.currentStreak, 1);
    const expectedExpire1 = startTime + workCdMs + windowMs;
    assert.strictEqual(state.workShift.streakExpireAt, expectedExpire1);

    // Shift 2 (within window, e.g. after cooldown ends + 10 mins)
    const time2 = startTime + workCdMs + 600000;
    state.cooldowns.work = 0; // cooldown ended
    const res2 = ActionEngine.performAction(state, 'work', time2, () => 0.5);
    assert.strictEqual(res2.workStreak, 2, 'Shift 2 within window should increment streak to 2');
    assert.strictEqual(res2.streakMultiplier, 1.02, '2 streak gives 1.02x pay multiplier');
    assert.strictEqual(state.workShift.currentStreak, 2);

    // Increment up to 20
    for (let s = 3; s <= 20; s++) {
        state.cooldowns.work = 0;
        const res = ActionEngine.performAction(state, 'work', time2 + ((s - 2) * (workCdMs + 1000)), () => 0.5);
        assert.strictEqual(res.workStreak, s);
    }
    assert.strictEqual(state.workShift.currentStreak, 20);

    // Shift 21 (caps at 20)
    state.cooldowns.work = 0;
    const res21 = ActionEngine.performAction(state, 'work', state.workShift.lastWorkAt + workCdMs + 1000, () => 0.5);
    assert.strictEqual(res21.workStreak, 20, 'Streak should cap at 20');
    assert.strictEqual(res21.streakMultiplier, 1.20, '20 streak gives 1.20x pay multiplier');

    // Shift 22 after expiration window (> 45 min after cooldown)
    const expiredTime = state.workShift.streakExpireAt + 1000;
    state.cooldowns.work = 0;
    const resExpired = ActionEngine.performAction(state, 'work', expiredTime, () => 0.5);
    assert.strictEqual(resExpired.workStreak, 1, 'Expired window should reset streak to 1');
    assert.strictEqual(resExpired.streakMultiplier, 1.01);
    console.log('✓ Work Shift Streaks mechanics verified successfully!');
}

// 1b. Amnesia + Work Streak Regression Test
console.log('\n[1b] Amnesia + Work Streak Regression Test');
{
    const workCdMs = (ACTION_COOLDOWNS.work || 1800) * 1000;
    const windowMs = 45 * 60 * 1000;
    const startTime = 5000000;

    const state = {
        cash: 0,
        rankIndex: 0,
        prestigeCount: 0,
        inventory: {},
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        perks: { partiality: 0, amnesiac: 50 },  // 100% Amnesia trigger
        cooldowns: { work: 0 },
        workShift: { currentStreak: 0, lastWorkAt: 0, streakExpireAt: 0, streakEligibleAt: 0 }
    };

    // Shift 1 with Amnesia active
    const res1 = ActionEngine.performAction(state, 'work', startTime, () => 0.5);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.amnesiacTriggered, true, 'Amnesia should trigger at level 50');
    assert.strictEqual(res1.workStreak, 1, 'First shift should set streak to 1');
    assert.strictEqual(state.cooldowns.work, 0, 'Cooldown should be 0 after Amnesia');

    // streakExpireAt and streakEligibleAt must be in the future
    const expectedExpire = startTime + workCdMs + windowMs;
    assert.strictEqual(state.workShift.streakExpireAt, expectedExpire,
        'streakExpireAt must use natural cooldown end, not Amnesia-zeroed cooldownEnd');
    assert.strictEqual(state.workShift.streakEligibleAt, startTime + workCdMs,
        'streakEligibleAt must mark the end of the natural cooldown');
    assert.ok(state.workShift.streakExpireAt > startTime,
        'streakExpireAt must be in the future relative to action time');

    // Early Shift via Amnesia (e.g. 5 seconds later, before natural cooldown elapsed)
    // Streak should NOT increment, but should maintain streak 1 and grant pay
    const earlyTime = startTime + 5000;
    const resEarly = ActionEngine.performAction(state, 'work', earlyTime, () => 0.5);
    assert.strictEqual(resEarly.success, true);
    assert.strictEqual(resEarly.workStreak, 1, 'Early Amnesia shift must NOT increase streak count');
    assert.strictEqual(resEarly.streakMultiplier, 1.01, 'Early Amnesia shift still uses current streak multiplier');
    assert.strictEqual(state.workShift.currentStreak, 1);

    // Shift 2 after natural cooldown completes — streak must now increment to 2
    const time2 = earlyTime + workCdMs + 600000;
    state.cooldowns.work = 0;
    const res2 = ActionEngine.performAction(state, 'work', time2, () => 0.5);
    assert.strictEqual(res2.workStreak, 2, 'Shift after natural cooldown completes must increment streak');
    assert.strictEqual(res2.streakMultiplier, 1.02, '2 streak gives 1.02x pay multiplier');

    console.log('✓ Amnesia does not break Work Shift Streak and does not prematurely increase streak!');
}

// 2. Item Locking - Shop Selling Tests
console.log('\n[2] Item Locking - Shop Selling Tests');
{
    const state = {
        cash: 0,
        inventory: {
            Seaweed: 100,
            Sardine: 50,
            Lobster: 20
        },
        lockedItems: ['Sardine'],
        shop: {
            lastRestockAt: 1000000,
            nextRestockAt: 2000000,
            sellPrices: { Seaweed: 300, Sardine: 800, Lobster: 15000 },
            buyListings: {},
            boosterListings: {}
        }
    };

    // Selling locked Sardine directly should fail
    const sellLocked = ShopEngine.sellItem(state, 'Sardine', 10);
    assert.strictEqual(sellLocked.error !== undefined, true, 'Selling locked item must return error');
    assert.strictEqual(state.inventory.Sardine, 50, 'Locked inventory quantity should be unchanged');

    // Selling unlocked Seaweed directly should succeed
    const sellUnlocked = ShopEngine.sellItem(state, 'Seaweed', 10);
    assert.strictEqual(sellUnlocked.success, true);
    assert.strictEqual(state.inventory.Seaweed, 90);

    // Bulk sell preview should exclude Sardine automatically
    const preview = ShopEngine.previewBulkSell(state);
    assert.strictEqual(preview.success, true);
    const sardineInBulk = preview.breakdown.find(b => b.itemName === 'Sardine');
    assert.strictEqual(sardineInBulk, undefined, 'Bulk sell preview must skip locked Sardine');
    const seaweedInBulk = preview.breakdown.find(b => b.itemName === 'Seaweed');
    assert.notStrictEqual(seaweedInBulk, undefined, 'Bulk sell preview should include unlocked Seaweed');

    // Bulk sell execution should preserve Sardine
    const bulkExec = ShopEngine.executeBulkSell(state);
    assert.strictEqual(bulkExec.success, true);
    assert.strictEqual(state.inventory.Sardine, 50, 'Locked Sardine must be preserved after bulk sell');
    assert.strictEqual(state.inventory.Seaweed, undefined, 'Unlocked Seaweed was sold');
    console.log('✓ Item Locking in ShopEngine verified successfully!');
}

// 3. Item Locking - Booster Usage & Bulk Activation
console.log('\n[3] Item Locking - Booster Tests');
{
    const state = {
        inventory: {
            'Prospector Kit': 5,
            'Ore Scanner': 3
        },
        lockedItems: ['Prospector Kit'],
        boosters: {
            activeUntil: {
                mine: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                explore: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                fish: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 },
                hunt: { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0 }
            }
        }
    };

    // Using locked booster should fail
    const useLocked = BoosterEngine.useBooster(state, 'Prospector Kit');
    assert.strictEqual(useLocked.success, false, 'Using locked booster must fail');
    assert.strictEqual(state.inventory['Prospector Kit'], 5);

    // Using unlocked booster should succeed
    const useUnlocked = BoosterEngine.useBooster(state, 'Ore Scanner');
    assert.strictEqual(useUnlocked.success, true);
    assert.strictEqual(state.inventory['Ore Scanner'], 2);

    // Bulk activation plan should skip locked Prospector Kit
    const plan = BoosterEngine.buildBulkActivationPlan(state, { mode: 'allOwned' });
    assert.strictEqual(plan.success, true);
    const lockedInPlan = plan.breakdown.find(b => b.itemName === 'Prospector Kit');
    assert.strictEqual(lockedInPlan, undefined, 'Bulk booster plan must skip locked boosters');
    console.log('✓ Item Locking in BoosterEngine verified successfully!');
}

// 4. Item Locking - Tool Upgrades & Socket Module Crafting
console.log('\n[4] Item Locking - Tool & Crafting Tests');
{
    const state = {
        tools: { mine: 1, explore: 1, hunt: 1, fish: 1 },
        toolSockets: { mine: [], explore: [], hunt: [], fish: [] },
        toolModules: {},
        inventory: {
            Blueberry: 10, // required for fish tool level 2 (3 needed)
            RedMushroom: 10,
            Weeds: 10,
            Copper: 500, // required for multistrike_1
            ScrapMetal: 300,
            CircuitShard: 10
        },
        lockedItems: ['Blueberry', 'CircuitShard']
    };

    // Upgrading fish tool requires Blueberry. Because Blueberry is locked, upgrade cannot proceed
    const upgradeRes = ToolEngine.upgradeTool(state, 'fish');
    assert.strictEqual(upgradeRes.error !== undefined, true, 'Tool upgrade with locked material must fail');
    assert.strictEqual(state.inventory.Blueberry, 10, 'Locked Blueberry preserved');

    // Crafting multistrike_1 requires CircuitShard. Because CircuitShard is locked, craft cannot proceed
    const craftRes = ToolEngine.craftModule(state, 'multistrike_1', 1);
    assert.strictEqual(craftRes.error !== undefined, true, 'Module crafting with locked material must fail');
    assert.strictEqual(state.inventory.CircuitShard, 10, 'Locked CircuitShard preserved');

    // Unlock Blueberry and retry tool upgrade
    state.lockedItems = ['CircuitShard'];
    const upgradeRes2 = ToolEngine.upgradeTool(state, 'fish');
    assert.strictEqual(upgradeRes2.success, true, 'Tool upgrade succeeds once unlocked');
    assert.strictEqual(state.tools.fish, 2);
    console.log('✓ Item Locking in ToolEngine verified successfully!');
}

// 5. Item Locking - Farm Melon Consumption
console.log('\n[5] Item Locking - Farm Melon Tests');
{
    const state = {
        farm: {
            waterAvailableAt: 2000000,
            markedPlotIds: [],
            storage: { Melon: 0 },
            plots: [{ id: 1, level: 0, crop: null, plantedAt: 0, nextHarvestAt: 0 }]
        },
        inventory: {
            Melon: 3
        },
        lockedItems: ['Melon']
    };

    // Using locked Melon when no unlocked melon in storage should fail
    const melonRes = FarmEngine.useMelon(state, 1000000);
    assert.strictEqual(melonRes.error !== undefined, true, 'Using locked Melon must fail');
    assert.strictEqual(state.inventory.Melon, 3);
    assert.strictEqual(state.farm.waterAvailableAt, 2000000);

    // Unlock Melon and retry
    state.lockedItems = [];
    const melonRes2 = FarmEngine.useMelon(state, 1000000);
    assert.strictEqual(melonRes2.success, true, 'Using unlocked Melon succeeds');
    assert.strictEqual(state.inventory.Melon, 2);
    assert.strictEqual(state.farm.waterAvailableAt, 0);
    console.log('✓ Item Locking in FarmEngine verified successfully!');
}

console.log('\nALL LOCKING, PINNING, AND WORK SHIFT STREAKS TESTS PASSED!');
