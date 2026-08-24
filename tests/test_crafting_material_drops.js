const assert = require('assert');
const ActionEngine = require('../src/engine/actionEngine');
const { MATERIAL_BY_ID } = require('../src/data/craftingMaterials');

console.log('--- Running Crafting Material Gathering Tests ---');

function seededRng(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

for (const [index, action] of ['mine', 'explore', 'hunt', 'fish'].entries()) {
    for (let run = 0; run < 100; run += 1) {
        const rewards = ActionEngine.drawCraftingMaterials(action, 1, 1, seededRng((index + 1) * 1000 + run));
        assert.ok(rewards.length >= 8 && rewards.length <= 15);
        assert.strictEqual(new Set(rewards.map(reward => reward.item)).size, rewards.length);
        for (const reward of rewards) {
            const definition = MATERIAL_BY_ID[reward.item];
            assert.ok(definition);
            assert.strictEqual(definition.sourceAction, action);
            assert.ok(reward.baseStack >= definition.baseStack.min);
            assert.ok(reward.baseStack <= definition.baseStack.max);
            assert.strictEqual(reward.quantity, reward.baseStack);
        }
    }
}
console.log('✓ Seeded 8-15 distinct weighted draws and rarity stack ranges verified');

const base = ActionEngine.drawCraftingMaterials('mine', 1, 1, seededRng(77));
const multiplied = ActionEngine.drawCraftingMaterials('mine', 24, 1, seededRng(77));
assert.deepStrictEqual(multiplied.map(entry => entry.item), base.map(entry => entry.item));
for (let index = 0; index < base.length; index += 1) {
    assert.strictEqual(multiplied[index].quantity, base[index].quantity * 24);
}
console.log('✓ Existing total reward multipliers scale new stacks without changing the seeded draw');
