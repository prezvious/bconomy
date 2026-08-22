const assert = require('assert');
const { ITEM_DESCRIPTIONS, getItemDescription } = require('../src/data/itemDescriptions');
const { BOOSTER_REGISTRY, SELLABLE_ITEMS } = require('../src/engine/shopTables');

console.log('Testing Item Descriptions & Metadata Registry...');

// 1. Verify 116 unique items descriptions exist
const canonicalItems = [
    'Seaweed', 'Sardine', 'Tattered Boot', 'Prawn', 'Lobster', 'Jellyfish', 'Antique Bottle',
    'Octopus', 'Ocean Crab', 'Chunky Coral', 'Blowfish', 'King Crab', 'Electric Eel', 'Electric Ray',
    'Clamshell', 'Conductive Algae', 'Great White', 'Ornate Necklace', 'Black Pearl', 'Pearled Oyster',
    'Coelacanth', 'Old Crown', 'Treasure Chest', 'Giant Squid', 'Rock', 'Weeds', 'Old Bones',
    'Discarded Butt', 'Dandelion', 'Rusty Knife', 'Crushed Pack', 'Scrap Metal', 'Big Log',
    'Empty Soda Can', 'Rusty Nail', 'Copper Wire', 'Rich Wool', 'Floppy Disk', 'Lightbulb',
    'Insulating Resin', 'Glowing Mushroom', 'Rubber Tire', 'Circuit Shard', 'Ritual Urn',
    'Corrupted Memory Card', 'Ancient Fossil', 'Manuscript', 'Encrypted Drive', 'Feathers',
    'Chestnut', 'Pinecone', 'Red Mushroom', 'Wild Berries', 'Bird Nest', 'Rabbit Foot', 'Skunk Pelt',
    'Milk', 'Prime Steak', 'Badger Pelt', 'Ox Pelt', 'Honeycomb', 'Firesac', 'Frostsac', 'Buffalo Pelt',
    'Black Truffle', 'Elk Antlers', 'Alpha Wolf Fang', 'Heartwood Core', 'Coal', 'Copper', 'Flint',
    'Clay', 'Aluminum', 'Salt Crystal', 'Tin', 'Iron', 'Neodymium', 'Obsidian', 'Silver', 'Quartz',
    'Gold', 'Ruby', 'Sapphire', 'Emerald', 'Lithium', 'Tungsten', 'Petroleum', 'Titanium Ore', 'Iridium',
    'Diamond', 'Cobalt', 'Meteorite Fragment', 'Ancient Coin Cache', 'Alexandrite', 'Uranium', 'Platinum',
    'Fossilized Dragon Scale', 'Blueberry', 'Golden Wheat', 'Melon', 'Coffee', 'Pumpkin', 'Strawberry',
    'Kiwi', 'Mango', 'Coconut', 'Thick Rope', 'Light Suede', 'Reinforced Chain', 'Tough Rawhide',
    'Diamond Tether', 'Treated Hull', 'Reinforced Hull', 'Steel Beam', 'Thermite', 'Lucky Charm'
];

let foundCount = 0;
canonicalItems.forEach(item => {
    const desc = getItemDescription(item);
    assert.notStrictEqual(desc, 'An item gathered or crafted within Bconomy.', `Missing description for ${item}`);
    assert(desc.length > 10, `Description for ${item} should be non-trivial`);
    foundCount++;
});
console.log(`✔ Test 1 Passed: All ${foundCount} canonical item descriptions verified`);

// 2. Verify all 24 loot boosters have descriptions
let boosterCount = 0;
Object.keys(BOOSTER_REGISTRY).forEach(booster => {
    const desc = getItemDescription(booster);
    assert.notStrictEqual(desc, 'An item gathered or crafted within Bconomy.', `Missing description for booster ${booster}`);
    assert(desc.length > 10, `Description for booster ${booster} should be non-trivial`);
    boosterCount++;
});
assert.strictEqual(boosterCount, 24, 'Should have 24 boosters');
console.log(`✔ Test 2 Passed: All 24 booster descriptions verified`);

console.log('ALL ITEM DESCRIPTION TESTS PASSED!');
