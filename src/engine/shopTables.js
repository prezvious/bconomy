/**
 * @module shopTables
 * Canonical data tables, balance configurations, booster registries,
 * and price markup bands for the Bconomy Shop System.
 */

const { FARM_UPGRADE_MATERIALS } = require('./farmPlotUpgrade');

const SHOP_RESTOCK_SECONDS = 600; // 10 minutes

/**
 * Value-band markup multipliers applied to an item's maximum sell price (S_i).
 * Format: { limit, minMult, maxMult }
 */
const BUY_MARKUP_BANDS = [
    { limit: 10000, minMult: 3, maxMult: 5 },
    { limit: 200000, minMult: 4, maxMult: 6 },
    { limit: 1000000, minMult: 5, maxMult: 7 },
    { limit: 10000000, minMult: 6, maxMult: 8 },
    { limit: 100000000, minMult: 7, maxMult: 10 },
    { limit: 1000000000, minMult: 8, maxMult: 12 },
    { limit: Infinity, minMult: 10, maxMult: 15 }
];

/**
 * Helper to get min and max markup multipliers for a given max sell price.
 */
const getMarkupRange = (maxSellPrice) => {
    for (const band of BUY_MARKUP_BANDS) {
        if (maxSellPrice <= band.limit) {
            return [band.minMult, band.maxMult];
        }
    }
    return [10, 15];
};

/**
 * Complete canonical registry of sellable and purchasable normal items.
 * Keyed by exact canonical item name.
 */
const SELLABLE_ITEMS = {
    // ── Fishing Items ──
    'Seaweed': { sellRange: [200, 600], appearanceChance: 0.80, stockRange: [20, 80] },
    'Sardine': { sellRange: [500, 1500], appearanceChance: 0.70, stockRange: [10, 40] },
    'TatteredBoot': { sellRange: [500, 2000], appearanceChance: 0.70, stockRange: [10, 40] },
    'Prawn': { sellRange: [1000, 4000], appearanceChance: 0.60, stockRange: [5, 20] },
    'Lobster': { sellRange: [10000, 35000], appearanceChance: 0.35, stockRange: [2, 8] },
    'Jellyfish': { sellRange: [15000, 50000], appearanceChance: 0.30, stockRange: [2, 8] },
    'AntiqueBottle': { sellRange: [25000, 80000], appearanceChance: 0.20, stockRange: [1, 4] },
    'Octopus': { sellRange: [35000, 100000], appearanceChance: 0.18, stockRange: [1, 4] },
    'OceanCrab': { sellRange: [50000, 140000], appearanceChance: 0.15, stockRange: [1, 3] },
    'ChunkyCoral': { sellRange: [75000, 200000], appearanceChance: 0.12, stockRange: [1, 3] },
    'Blowfish': { sellRange: [150000, 400000], appearanceChance: 0.08, stockRange: [1, 3] },
    'KingCrab': { sellRange: [200000, 550000], appearanceChance: 0.06, stockRange: [1, 2] },
    'ElectricEel': { sellRange: [300000, 750000], appearanceChance: 0.04, stockRange: [1, 2] },
    'ElectricRay': { sellRange: [400000, 900000], appearanceChance: 0.03, stockRange: [1, 2] },
    'Clamshell': { sellRange: [500000, 1200000], appearanceChance: 0.02, stockRange: [1, 1] },
    'ConductiveAlgae': { sellRange: [650000, 1500000], appearanceChance: 0.015, stockRange: [1, 1] },
    'GreatWhite': { sellRange: [900000, 2000000], appearanceChance: 0.008, stockRange: [1, 1] },
    'OrnateNecklace': { sellRange: [1200000, 2500000], appearanceChance: 0.004, stockRange: [1, 1] },
    'BlackPearl': { sellRange: [1500000, 3000000], appearanceChance: 0.003, stockRange: [1, 1] },
    'PearledOyster': { sellRange: [1750000, 3500000], appearanceChance: 0.002, stockRange: [1, 1] },
    'Coelacanth': { sellRange: [2000000, 4000000], appearanceChance: 0.0015, stockRange: [1, 1] },
    'OldCrown': { sellRange: [2500000, 4500000], appearanceChance: 0.001, stockRange: [1, 1] },
    'TreasureChest': { sellRange: [3000000, 5500000], appearanceChance: 0.0005, stockRange: [1, 1] },
    'GiantSquid': { sellRange: [4000000, 7000000], appearanceChance: 0.0002, stockRange: [1, 1] },

    // ── Exploring Items ──
    'Rock': { sellRange: [200, 500], appearanceChance: 0.85, stockRange: [30, 120] },
    'Weeds': { sellRange: [500, 1500], appearanceChance: 0.80, stockRange: [20, 80] },
    'OldBones': { sellRange: [1000, 3000], appearanceChance: 0.70, stockRange: [10, 50] },
    'DiscardedButt': { sellRange: [500, 1500], appearanceChance: 0.75, stockRange: [15, 60] },
    'Dandelion': { sellRange: [1000, 4000], appearanceChance: 0.65, stockRange: [8, 30] },
    'RustyKnife': { sellRange: [2000, 6000], appearanceChance: 0.60, stockRange: [8, 30] },
    'CrushedPack': { sellRange: [2000, 6000], appearanceChance: 0.60, stockRange: [8, 30] },
    'ScrapMetal': { sellRange: [8000, 20000], appearanceChance: 0.45, stockRange: [4, 15] },
    'BigLog': { sellRange: [10000, 30000], appearanceChance: 0.40, stockRange: [5, 20] },
    'EmptySodaCan': { sellRange: [6000, 15000], appearanceChance: 0.45, stockRange: [4, 15] },
    'RustyNail': { sellRange: [8000, 25000], appearanceChance: 0.40, stockRange: [3, 12] },
    'CopperWire': { sellRange: [15000, 50000], appearanceChance: 0.30, stockRange: [2, 10] },
    'RichWool': { sellRange: [20000, 60000], appearanceChance: 0.25, stockRange: [2, 8] },
    'FloppyDisk': { sellRange: [40000, 100000], appearanceChance: 0.20, stockRange: [1, 5] },
    'Lightbulb': { sellRange: [60000, 150000], appearanceChance: 0.15, stockRange: [1, 4] },
    'InsulatingResin': { sellRange: [120000, 300000], appearanceChance: 0.08, stockRange: [1, 3] },
    'GlowingMushroom': { sellRange: [180000, 450000], appearanceChance: 0.06, stockRange: [1, 2] },
    'RubberTire': { sellRange: [250000, 600000], appearanceChance: 0.05, stockRange: [1, 2] },
    'CircuitShard': { sellRange: [350000, 800000], appearanceChance: 0.04, stockRange: [1, 2] },
    'RitualUrn': { sellRange: [500000, 1200000], appearanceChance: 0.03, stockRange: [1, 2] },
    'CorruptedMemoryCard': { sellRange: [750000, 1800000], appearanceChance: 0.02, stockRange: [1, 1] },
    'AncientFossil': { sellRange: [2000000, 5000000], appearanceChance: 0.005, stockRange: [10, 40] },
    'Manuscript': { sellRange: [8000000, 20000000], appearanceChance: 0.0008, stockRange: [40, 120] },
    'EncryptedDrive': { sellRange: [20000000, 45000000], appearanceChance: 0.0003, stockRange: [25, 75] },

    // ── Hunting Items ──
    'Feathers': { sellRange: [200, 800], appearanceChance: 0.85, stockRange: [20, 80] },
    'Chestnut': { sellRange: [500, 1500], appearanceChance: 0.70, stockRange: [10, 40] },
    'Pinecone': { sellRange: [500, 1500], appearanceChance: 0.70, stockRange: [10, 40] },
    'RedMushroom': { sellRange: [2000, 6000], appearanceChance: 0.55, stockRange: [5, 20] },
    'WildBerries': { sellRange: [2000, 6000], appearanceChance: 0.55, stockRange: [5, 20] },
    'BirdNest': { sellRange: [5000, 12000], appearanceChance: 0.35, stockRange: [3, 10] },
    'RabbitFoot': { sellRange: [8000, 20000], appearanceChance: 0.25, stockRange: [2, 8] },
    'SkunkPelt': { sellRange: [10000, 25000], appearanceChance: 0.22, stockRange: [2, 6] },
    'Milk': { sellRange: [10000, 25000], appearanceChance: 0.22, stockRange: [2, 6] },
    'PrimeSteak': { sellRange: [15000, 35000], appearanceChance: 0.20, stockRange: [2, 6] },
    'BadgerPelt': { sellRange: [20000, 45000], appearanceChance: 0.15, stockRange: [1, 4] },
    'OxPelt': { sellRange: [25000, 60000], appearanceChance: 0.12, stockRange: [1, 4] },
    'Honeycomb': { sellRange: [35000, 80000], appearanceChance: 0.08, stockRange: [1, 3] },
    'Firesac': { sellRange: [75000, 150000], appearanceChance: 0.02, stockRange: [1, 1] },
    'Frostsac': { sellRange: [75000, 150000], appearanceChance: 0.02, stockRange: [1, 1] },
    'BuffaloPelt': { sellRange: [80000, 180000], appearanceChance: 0.02, stockRange: [1, 1] },
    'BlackTruffle': { sellRange: [100000, 220000], appearanceChance: 0.008, stockRange: [1, 1] },
    'ElkAntlers': { sellRange: [125000, 250000], appearanceChance: 0.004, stockRange: [1, 1] },
    'AlphaWolfFang': { sellRange: [180000, 350000], appearanceChance: 0.0008, stockRange: [1, 1] },
    'HeartwoodCore': { sellRange: [250000, 500000], appearanceChance: 0.0005, stockRange: [1, 1] },

    // ── Mining Items ──
    'Coal': { sellRange: [200, 500], appearanceChance: 0.90, stockRange: [10000, 19000] },
    'Copper': { sellRange: [500, 1500], appearanceChance: 0.80, stockRange: [8000, 17000] },
    'Flint': { sellRange: [500, 1500], appearanceChance: 0.75, stockRange: [7000, 15000] },
    'Clay': { sellRange: [800, 2500], appearanceChance: 0.70, stockRange: [6000, 14000] },
    'Aluminum': { sellRange: [1000, 3000], appearanceChance: 0.60, stockRange: [5000, 12000] },
    'SaltCrystal': { sellRange: [1200, 4000], appearanceChance: 0.60, stockRange: [5000, 11000] },
    'Tin': { sellRange: [2000, 6000], appearanceChance: 0.50, stockRange: [4000, 10000] },
    'Iron': { sellRange: [3000, 10000], appearanceChance: 0.45, stockRange: [4000, 9000] },
    'Neodymium': { sellRange: [6000, 20000], appearanceChance: 0.35, stockRange: [3500, 8000] },
    'Obsidian': { sellRange: [10000, 30000], appearanceChance: 0.30, stockRange: [3000, 7000] },
    'Silver': { sellRange: [15000, 50000], appearanceChance: 0.28, stockRange: [2800, 6500] },
    'Quartz': { sellRange: [20000, 70000], appearanceChance: 0.25, stockRange: [2500, 6000] },
    'Gold': { sellRange: [30000, 100000], appearanceChance: 0.20, stockRange: [2200, 5500] },
    'Ruby': { sellRange: [50000, 150000], appearanceChance: 0.12, stockRange: [1800, 4500] },
    'Sapphire': { sellRange: [60000, 175000], appearanceChance: 0.10, stockRange: [1600, 4000] },
    'Emerald': { sellRange: [75000, 200000], appearanceChance: 0.09, stockRange: [1500, 3800] },
    'Lithium': { sellRange: [150000, 400000], appearanceChance: 0.06, stockRange: [1300, 3400] },
    'Tungsten': { sellRange: [250000, 600000], appearanceChance: 0.04, stockRange: [1200, 3000] },
    'Petroleum': { sellRange: [300000, 750000], appearanceChance: 0.035, stockRange: [1100, 2800] },
    'TitaniumOre': { sellRange: [600000, 1500000], appearanceChance: 0.015, stockRange: [1000, 2500] },
    'Iridium': { sellRange: [900000, 2000000], appearanceChance: 0.01, stockRange: [900, 2200] },
    'Diamond': { sellRange: [1500000, 3500000], appearanceChance: 0.005, stockRange: [800, 2000] },
    'Cobalt': { sellRange: [1500000, 3500000], appearanceChance: 0.005, stockRange: [800, 1800] },
    'MeteoriteFragment': { sellRange: [2000000, 5000000], appearanceChance: 0.004, stockRange: [700, 1600] },
    'AncientCoinCache': { sellRange: [3000000, 7000000], appearanceChance: 0.002, stockRange: [650, 1500] },
    'Alexandrite': { sellRange: [5000000, 12000000], appearanceChance: 0.001, stockRange: [600, 1250] },
    'Uranium': { sellRange: [8000000, 18000000], appearanceChance: 0.0005, stockRange: [550, 1000] },
    'Platinum': { sellRange: [10000000, 22000000], appearanceChance: 0.0005, stockRange: [500, 900] },
    'FossilizedDragonScale': { sellRange: [20000000, 40000000], appearanceChance: 0.0001, stockRange: [450, 700] },

    // ── Farm / Crop Items ──
    'Blueberry': { sellRange: [500, 1500], appearanceChance: 0.65, stockRange: [5, 25] },
    'Golden Wheat': { sellRange: [5000, 10000], appearanceChance: 0.50, stockRange: [3, 15] },
    'Strawberry': { sellRange: [20000, 60000], appearanceChance: 0.30, stockRange: [5, 20] },
    'Coffee': { sellRange: [30000, 100000], appearanceChance: 0.20, stockRange: [2, 6] },
    'Melon': { sellRange: [50000, 150000], appearanceChance: 0.15, stockRange: [1, 4] },
    'Kiwi': { sellRange: [60000, 150000], appearanceChance: 0.20, stockRange: [3, 12] },
    'Mango': { sellRange: [250000, 700000], appearanceChance: 0.12, stockRange: [2, 8] },
    'Pumpkin': { sellRange: [300000, 900000], appearanceChance: 0.08, stockRange: [1, 2] },
    'Coconut': { sellRange: [1000000, 3000000], appearanceChance: 0.05, stockRange: [1, 3] },

    // ── Derived Upgrade Components ──
    'ThickRope': { sellRange: [3000, 10000], appearanceChance: 0.35, stockRange: [3, 15] },
    'LightSuede': { sellRange: [25000, 80000], appearanceChance: 0.25, stockRange: [2, 10] },
    'ReinforcedChain': { sellRange: [100000, 200000], appearanceChance: 0.18, stockRange: [2, 6] },
    'ToughRawhide': { sellRange: [350000, 900000], appearanceChance: 0.10, stockRange: [1, 4] },
    'TreatedHull': { sellRange: [1000000, 3000000], appearanceChance: 0.05, stockRange: [1, 2] },
    'SteelBeam': { sellRange: [2000000, 5000000], appearanceChance: 0.03, stockRange: [1, 2] },
    'Thermite': { sellRange: [4000000, 10000000], appearanceChance: 0.02, stockRange: [1, 2] },
    'ReinforcedHull': { sellRange: [5000000, 12000000], appearanceChance: 0.015, stockRange: [1, 1] },
    'DiamondTether': { sellRange: [30000000, 80000000], appearanceChance: 0.003, stockRange: [1, 1] },
    'LuckyCharm': { sellRange: [5000000000, 20000000000], appearanceChance: 0.0001, stockRange: [1, 1] }
};

// Farm materials intentionally define independent buy and sell ranges so a
// market refresh can produce lucky overlaps without changing legacy pricing.
for (const [itemName, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    SELLABLE_ITEMS[itemName] = {
        sellRange: material.sellRange,
        buyRange: material.buyRange,
        appearanceChance: material.appearanceChance,
        stockRange: material.stockRange,
        category: 'farm-upgrade-material'
    };
}

/**
 * 24 Action-Specific Loot Boosters.
 * Tier durations: T1=15m, T2=30m, T3=1h, T4=2h, T5=4h, T6=8h.
 * T1-T4 purchasable in shop; T5-T6 strictly excluded from shop.
 */
const BOOSTER_REGISTRY = {
    // ── Mining Boosters ──
    'Prospector Kit': { action: 'mine', tier: 'T1', durationMs: 15 * 60 * 1000, inShop: true, buyRange: [250000, 500000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Ore Scanner': { action: 'mine', tier: 'T2', durationMs: 30 * 60 * 1000, inShop: true, buyRange: [2000000, 24000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Extraction Module': { action: 'mine', tier: 'T3', durationMs: 60 * 60 * 1000, inShop: true, buyRange: [30000000, 120000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Yield Amplifier': { action: 'mine', tier: 'T4', durationMs: 120 * 60 * 1000, inShop: true, buyRange: [4000000000, 90000000000], appearanceChance: 0.20, stockRange: [5, 20] },
    'Industrial Drillhead': { action: 'mine', tier: 'T5', durationMs: 240 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },
    'Core Extractor': { action: 'mine', tier: 'T6', durationMs: 480 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },

    // ── Exploring Boosters ──
    'Survey Pack': { action: 'explore', tier: 'T1', durationMs: 15 * 60 * 1000, inShop: true, buyRange: [250000, 500000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Route Scanner': { action: 'explore', tier: 'T2', durationMs: 30 * 60 * 1000, inShop: true, buyRange: [2000000, 24000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Recon Module': { action: 'explore', tier: 'T3', durationMs: 60 * 60 * 1000, inShop: true, buyRange: [30000000, 120000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Discovery Relay': { action: 'explore', tier: 'T4', durationMs: 120 * 60 * 1000, inShop: true, buyRange: [4000000000, 90000000000], appearanceChance: 0.20, stockRange: [5, 20] },
    'Expedition Console': { action: 'explore', tier: 'T5', durationMs: 240 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },
    'Survey Command Unit': { action: 'explore', tier: 'T6', durationMs: 480 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },

    // ── Fishing Boosters ──
    'Tackle Kit': { action: 'fish', tier: 'T1', durationMs: 15 * 60 * 1000, inShop: true, buyRange: [250000, 500000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Bite Monitor': { action: 'fish', tier: 'T2', durationMs: 30 * 60 * 1000, inShop: true, buyRange: [2000000, 24000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Catch Module': { action: 'fish', tier: 'T3', durationMs: 60 * 60 * 1000, inShop: true, buyRange: [30000000, 120000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Haul Amplifier': { action: 'fish', tier: 'T4', durationMs: 120 * 60 * 1000, inShop: true, buyRange: [4000000000, 90000000000], appearanceChance: 0.20, stockRange: [5, 20] },
    'Deepwater Rig': { action: 'fish', tier: 'T5', durationMs: 240 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },
    'Catch Processor': { action: 'fish', tier: 'T6', durationMs: 480 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },

    // ── Hunting Boosters ──
    'Tracker Kit': { action: 'hunt', tier: 'T1', durationMs: 15 * 60 * 1000, inShop: true, buyRange: [250000, 500000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Trail Sensor': { action: 'hunt', tier: 'T2', durationMs: 30 * 60 * 1000, inShop: true, buyRange: [2000000, 24000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Target Module': { action: 'hunt', tier: 'T3', durationMs: 60 * 60 * 1000, inShop: true, buyRange: [30000000, 120000000], appearanceChance: 1.0, stockRange: [Infinity, Infinity] },
    'Harvest Relay': { action: 'hunt', tier: 'T4', durationMs: 120 * 60 * 1000, inShop: true, buyRange: [4000000000, 90000000000], appearanceChance: 0.20, stockRange: [5, 20] },
    'Field Processor': { action: 'hunt', tier: 'T5', durationMs: 240 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] },
    'Tracking Command Unit': { action: 'hunt', tier: 'T6', durationMs: 480 * 60 * 1000, inShop: false, buyRange: [0, 0], appearanceChance: 0, stockRange: [0, 0] }
};

module.exports = {
    SHOP_RESTOCK_SECONDS,
    BUY_MARKUP_BANDS,
    getMarkupRange,
    SELLABLE_ITEMS,
    BOOSTER_REGISTRY
};
