const assert = require('assert');
const app = require('../server');
const catalog = require('../src/data/craftingCatalog');

console.log('--- Running Crafting API Tests ---');

const server = app.listen(0, '127.0.0.1');

(async () => {
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();
    const request = async (path, method = 'GET', body) => {
        const response = await fetch(`http://127.0.0.1:${port}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        return { status: response.status, data: await response.json() };
    };

    const catalogResponse = await request('/api/crafting/catalog');
    assert.strictEqual(catalogResponse.status, 200);
    assert.strictEqual(catalogResponse.data.catalogVersion, '3.0.0');
    assert.strictEqual(catalogResponse.data.materials.length, 450);
    assert.strictEqual(catalogResponse.data.craftables.length, 241);
    assert.strictEqual(catalogResponse.data.recipes.length, 241);
    console.log('✓ Catalog endpoint exposes the complete validated shared catalog');

    const recipe = catalog.RECIPE_BY_ID.recipe_WholeGrainFlourBlend;
    const playerState = {
        inventory: Object.fromEntries(recipe.ingredients.map(input => [input.itemId, input.quantity * 3])),
        lockedItems: [],
        toolModules: {}
    };
    const snapshot = JSON.stringify(playerState);
    const preview = await request('/api/crafting/preview', 'POST', {
        playerState,
        recipeId: recipe.id,
        craftCount: 2,
        mode: 'direct'
    });
    assert.strictEqual(preview.status, 200);
    assert.strictEqual(preview.data.craftable, true);
    assert.strictEqual(preview.data.stagedState, undefined);
    assert.strictEqual(preview.data.playerState, undefined);
    assert.strictEqual(JSON.stringify(playerState), snapshot);
    console.log('✓ Preview endpoint is nonmutating and does not expose staged state');

    const execute = await request('/api/crafting/execute', 'POST', {
        playerState,
        recipeId: recipe.id,
        craftCount: 2,
        mode: 'direct'
    });
    assert.strictEqual(execute.status, 200);
    assert.strictEqual(execute.data.ok, true);
    assert.strictEqual(execute.data.playerState.inventory.WholeGrainFlourBlend, 2);
    assert.strictEqual(JSON.stringify(playerState), snapshot);
    console.log('✓ Execute endpoint returns an atomically updated cloned state');

    const moduleRecipe = catalog.RECIPE_BY_ID.recipe_multistrike_1;
    const moduleState = {
        inventory: Object.fromEntries(moduleRecipe.ingredients.map(input => [input.itemId, input.quantity])),
        lockedItems: [],
        toolModules: {}
    };
    const adapter = await request('/api/tool/module/craft', 'POST', {
        playerState: moduleState,
        moduleId: 'multistrike_1',
        quantity: 1
    });
    assert.strictEqual(adapter.status, 200);
    assert.strictEqual(adapter.data.result.success, true);
    assert.strictEqual(adapter.data.state.toolModules.multistrike_1, 1);
    console.log('✓ Legacy module endpoint delegates to the shared crafting engine');

    const invalid = await request('/api/crafting/execute', 'POST', {
        playerState,
        recipeId: recipe.id,
        craftCount: 0,
        mode: 'direct'
    });
    assert.strictEqual(invalid.status, 400);
    assert.strictEqual(invalid.data.code, 'INVALID_REQUEST');
    console.log('✓ Invalid requests receive stable error codes');

    console.log('--- Crafting API Tests Passed ---');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(() => server.close());
