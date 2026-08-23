/**
 * @module dropTables
 * Contains drop tables, rank data, perk definitions, and tool upgrade recipes.
 */

const FISH_DROP_TABLE = [
    { item: 'Seaweed', chance: 44.0587 }, { item: 'Sardine', chance: 22.0292 },
    { item: 'TatteredBoot', chance: 11.0146 }, { item: 'Prawn', chance: 7.3431 },
    { item: 'Lobster', chance: 4.4058 }, { item: 'Jellyfish', chance: 3.1470 },
    { item: 'AntiqueBottle', chance: 2.2029 }, { item: 'Octopus', chance: 1.7623 },
    { item: 'OceanCrab', chance: 1.4686 }, { item: 'ChunkyCoral', chance: 1.1015 },
    { item: 'Blowfish', chance: 0.4406 }, { item: 'KingCrab', chance: 0.3304 },
    { item: 'ElectricEel', chance: 0.2203 }, { item: 'ElectricRay', chance: 0.1652 },
    { item: 'Clamshell', chance: 0.1101 }, { item: 'ConductiveAlgae', chance: 0.0918 },
    { item: 'GreatWhite', chance: 0.0441 }, { item: 'OrnateNecklace', chance: 0.0220 },
    { item: 'BlackPearl', chance: 0.0165 }, { item: 'PearledOyster', chance: 0.0110 },
    { item: 'Coelacanth', chance: 0.0066 }, { item: 'OldCrown', chance: 0.0044 },
    { item: 'TreasureChest', chance: 0.0022 }, { item: 'GiantSquid', chance: 0.0011 }
];

const EXPLORE_DROP_TABLE = [
    { item: 'Rock', chance: 20.2186 }, { item: 'Weeds', chance: 13.4791 },
    { item: 'TatteredBoot', chance: 10.1093 }, { item: 'OldBones', chance: 10.1093 },
    { item: 'DiscardedButt', chance: 10.1093 }, { item: 'Dandelion', chance: 6.7395 },
    { item: 'RustyKnife', chance: 5.0547 }, { item: 'CrushedPack', chance: 5.0547 },
    { item: 'ScrapMetal', chance: 4.0437 }, { item: 'BigLog', chance: 3.3698 },
    { item: 'EmptySodaCan', chance: 3.3698 }, { item: 'RustyNail', chance: 2.6958 },
    { item: 'CopperWire', chance: 1.6848 }, { item: 'RichWool', chance: 1.3479 },
    { item: 'FloppyDisk', chance: 1.0109 }, { item: 'Lightbulb', chance: 0.6739 },
    { item: 'InsulatingResin', chance: 0.2528 }, { item: 'GlowingMushroom', chance: 0.2022 },
    { item: 'RubberTire', chance: 0.1348 }, { item: 'CircuitShard', chance: 0.1263 },
    { item: 'RitualUrn', chance: 0.1011 }, { item: 'CorruptedMemoryCard', chance: 0.0843 },
    { item: 'AncientFossil', chance: 0.0202 }, { item: 'OldCrown', chance: 0.0040 },
    { item: 'Manuscript', chance: 0.0020 }, { item: 'EncryptedDrive', chance: 0.0012 }
];

const HUNT_DROP_TABLE = [
    { item: 'Rock', chance: 20.9775 }, { item: 'Feathers', chance: 20.9775 },
    { item: 'OldBones', chance: 10.4900 }, { item: 'Chestnut', chance: 9.0400 },
    { item: 'Pinecone', chance: 9.0400 }, { item: 'RedMushroom', chance: 5.0400 },
    { item: 'WildBerries', chance: 5.0400 }, { item: 'BirdNest', chance: 3.3300 },
    { item: 'BigLog', chance: 3.3300 }, { item: 'RabbitFoot', chance: 2.2000 },
    { item: 'SkunkPelt', chance: 2.0000 }, { item: 'Milk', chance: 2.0000 },
    { item: 'PrimeSteak', chance: 1.6600 }, { item: 'RichWool', chance: 1.3300 },
    { item: 'BadgerPelt', chance: 1.3300 }, { item: 'OxPelt', chance: 1.0000 },
    { item: 'Honeycomb', chance: 0.7500 }, { item: 'Firesac', chance: 0.1000 },
    { item: 'Frostsac', chance: 0.1000 }, { item: 'RitualUrn', chance: 0.1000 },
    { item: 'BuffaloPelt', chance: 0.1000 }, { item: 'BlackTruffle', chance: 0.0400 },
    { item: 'ElkAntlers', chance: 0.0200 }, { item: 'AlphaWolfFang', chance: 0.0030 },
    { item: 'HeartwoodCore', chance: 0.0020 }
];

const MINE_DROP_TABLE = [
    { item: 'Rock', chance: 20.7485 }, { item: 'Coal', chance: 20.7485 },
    { item: 'Copper', chance: 10.3742 }, { item: 'Flint', chance: 9.2000 },
    { item: 'Clay', chance: 7.4000 }, { item: 'Aluminum', chance: 5.1871 },
    { item: 'SaltCrystal', chance: 5.1000 }, { item: 'Tin', chance: 4.4000 },
    { item: 'Iron', chance: 3.4581 }, { item: 'Neodymium', chance: 2.5936 },
    { item: 'Obsidian', chance: 2.2640 }, { item: 'Silver', chance: 2.0748 },
    { item: 'Quartz', chance: 1.7291 }, { item: 'Gold', chance: 1.2968 },
    { item: 'Ruby', chance: 0.8500 }, { item: 'Sapphire', chance: 0.7500 },
    { item: 'Emerald', chance: 0.6500 }, { item: 'Lithium', chance: 0.4150 },
    { item: 'Tungsten', chance: 0.3000 }, { item: 'Petroleum', chance: 0.2594 },
    { item: 'TitaniumOre', chance: 0.0691 }, { item: 'Iridium', chance: 0.0500 },
    { item: 'Diamond', chance: 0.0208 }, { item: 'Cobalt', chance: 0.0208 },
    { item: 'MeteoriteFragment', chance: 0.0200 }, { item: 'AncientCoinCache', chance: 0.0100 },
    { item: 'Alexandrite', chance: 0.0050 }, { item: 'Uranium', chance: 0.0021 },
    { item: 'Platinum', chance: 0.0021 }, { item: 'FossilizedDragonScale', chance: 0.0010 }
];

const RANKS = [
    { index: 1, name: 'Peasant', basePrice: 10000 }, { index: 2, name: 'Serf', basePrice: 15960 },
    { index: 3, name: 'Bum', basePrice: 21920 }, { index: 4, name: 'Pauper', basePrice: 37690 },
    { index: 5, name: 'Commoner', basePrice: 53460 }, { index: 6, name: 'Tradesman', basePrice: 80120 },
    { index: 7, name: 'Recruit', basePrice: 106780 }, { index: 8, name: 'Militiaman', basePrice: 147350 },
    { index: 9, name: 'Ensign', basePrice: 187920 }, { index: 10, name: 'Lieutenant', basePrice: 245480 },
    { index: 11, name: 'Soldat', basePrice: 303040 }, { index: 12, name: 'Veteran', basePrice: 380740 },
    { index: 13, name: 'Captain', basePrice: 458440 }, { index: 14, name: 'Commodore', basePrice: 559450 },
    { index: 15, name: 'Admiral', basePrice: 660460 }, { index: 16, name: 'Marshal', basePrice: 788020 },
    { index: 17, name: 'Warden', basePrice: 915580 }, { index: 18, name: 'Custodian', basePrice: 1072950 },
    { index: 19, name: 'Governor', basePrice: 1230320 }, { index: 20, name: 'Prefect', basePrice: 1420780 },
    { index: 21, name: 'Viceroy', basePrice: 1611240 }, { index: 22, name: 'Viscount', basePrice: 1838120 },
    { index: 23, name: 'Count', basePrice: 2065000 }, { index: 24, name: 'Baronet', basePrice: 2331660 },
    { index: 25, name: 'Earl', basePrice: 2598320 }, { index: 26, name: 'Thane', basePrice: 2908140 },
    { index: 27, name: 'Magistrate', basePrice: 3217960 }, { index: 28, name: 'Arbiter', basePrice: 3574330 },
    { index: 29, name: 'Chanticleer', basePrice: 3930700 }, { index: 30, name: 'Troubadour', basePrice: 4337050 },
    { index: 31, name: 'Colonel', basePrice: 4743400 }, { index: 32, name: 'Brigadier', basePrice: 5203170 },
    { index: 33, name: 'Commander', basePrice: 5662940 }, { index: 34, name: 'Warlord', basePrice: 6179610 },
    { index: 35, name: 'Knight', basePrice: 6696280 }, { index: 36, name: 'Paladin', basePrice: 7273330 },
    { index: 37, name: 'Overseer', basePrice: 7850380 }, { index: 38, name: 'Taskmaster', basePrice: 8491310 },
    { index: 39, name: 'Aristocrat', basePrice: 9132240 }, { index: 40, name: 'Patrician', basePrice: 9840580 },
    { index: 41, name: 'Kingpin', basePrice: 10548920 }, { index: 42, name: 'Mogul', basePrice: 11328200 },
    { index: 43, name: 'Agent', basePrice: 12107480 }, { index: 44, name: 'Operative', basePrice: 12961260 },
    { index: 45, name: 'Baron', basePrice: 13815040 }, { index: 46, name: 'Landgrave', basePrice: 14746890 },
    { index: 47, name: 'Attache', basePrice: 15678740 }, { index: 48, name: 'Envoy', basePrice: 16692250 },
    { index: 49, name: 'Minister', basePrice: 17705760 }, { index: 50, name: 'Chancellor', basePrice: 18804530 },
    { index: 51, name: 'Khagan', basePrice: 19903300 }, { index: 52, name: 'Sultan', basePrice: 21090930 },
    { index: 53, name: 'Regent', basePrice: 22278560 }, { index: 54, name: 'Interrex', basePrice: 23558690 },
    { index: 55, name: 'Taoiseach', basePrice: 24838820 }, { index: 56, name: 'Eparch', basePrice: 26215090 },
    { index: 57, name: 'Politarch', basePrice: 27591360 }, { index: 58, name: 'Satrap', basePrice: 29067420 },
    { index: 59, name: 'Marquis', basePrice: 30543480 }, { index: 60, name: 'Archduke', basePrice: 32122990 },
    { index: 61, name: 'Liege', basePrice: 33702500 }, { index: 62, name: 'Overlord', basePrice: 35389150 },
    { index: 63, name: 'Sovereign', basePrice: 37075800 }, { index: 64, name: 'Monarch', basePrice: 38873260 },
    { index: 65, name: 'Dauphin', basePrice: 40670720 }, { index: 66, name: 'Imperator', basePrice: 42582710 },
    { index: 67, name: 'Primor', basePrice: 44494700 }, { index: 68, name: 'Primarch', basePrice: 46524910 },
    { index: 69, name: 'Consul', basePrice: 48555120 }, { index: 70, name: 'Proconsul', basePrice: 50707290 },
    { index: 71, name: 'President', basePrice: 52859460 }, { index: 72, name: 'Potentate', basePrice: 55137300 },
    { index: 73, name: 'Ruler', basePrice: 57415140 }, { index: 74, name: 'Dominator', basePrice: 59822410 },
    { index: 75, name: 'Herald', basePrice: 62229680 }, { index: 76, name: 'Oracle', basePrice: 64770130 },
    { index: 77, name: 'Sentinel', basePrice: 67310580 }, { index: 78, name: 'Vindicator', basePrice: 69987960 },
    { index: 79, name: 'Evincor', basePrice: 72665340 }, { index: 80, name: 'Praetor', basePrice: 75483420 },
    { index: 81, name: 'Legate', basePrice: 78301500 }, { index: 82, name: 'Exarch', basePrice: 81264070 },
    { index: 83, name: 'Arcanus', basePrice: 84226640 }, { index: 84, name: 'Spellweaver', basePrice: 87337490 },
    { index: 85, name: 'Spirit', basePrice: 90448340 }, { index: 86, name: 'Spectre', basePrice: 93711260 },
    { index: 87, name: 'Legend', basePrice: 96974180 }, { index: 88, name: 'Immortal', basePrice: 100392970 },
    { index: 89, name: 'Harbinger', basePrice: 103811760 }, { index: 90, name: 'Hierarch', basePrice: 107390250 },
    { index: 91, name: 'Archon', basePrice: 110968740 }, { index: 92, name: 'Ascendant', basePrice: 114710740 },
    { index: 93, name: 'Enlightened', basePrice: 118452740 }, { index: 94, name: 'Transcendent', basePrice: 122362090 },
    { index: 95, name: 'Paragon', basePrice: 126271440 }, { index: 96, name: 'Exemplar', basePrice: 130351980 },
    { index: 97, name: 'Quaesitor', basePrice: 134432520 }, { index: 98, name: 'Grand Inquisitor', basePrice: 138688080 },
    { index: 99, name: 'Prophet', basePrice: 142943640 }, { index: 100, name: 'Riftwalker', basePrice: 151812540 },
    { index: 101, name: 'Postmortal', basePrice: 161046940 }, { index: 102, name: 'Avatar', basePrice: 170654580 },
    { index: 103, name: 'Eternal', basePrice: 180643200 }, { index: 104, name: 'Divine', basePrice: 191020600 },
    { index: 105, name: 'Deity', basePrice: 201794520 }, { index: 106, name: 'Demigod', basePrice: 212972780 },
    { index: 107, name: 'God', basePrice: 250000000 }
];

const PERK_DEFINITIONS = {
  investiture: { name: 'Final Rank Discount', maxLevel: 25, description: 'Reduces the price of prestige ascension (Tiers 1+)', formula: 'Level × 2.5% discount (max 62.5%)' },
  cronyism: { name: 'Rank Subsidy', maxLevel: 25, description: 'Lowers the price of ranking up', formula: 'Level × 2.5% discount (max 62.5%)' },
  backchannel: { name: 'Market Fee Reduction', maxLevel: 25, description: 'Reduces the percentage fee taken on market trades (Coming Soon)', formula: 'Level × 1.12% fee reduction' },
  partiality: { name: 'Overtime Bonus', maxLevel: 15, description: 'Improves odds and stacks of work bonus payouts', formula: 'Base 30% + Level × 15% bonus chance' },
  serendipity: { name: 'Lucky Drops', maxLevel: 29, description: 'Increases the multiplier applied to rare item finds', formula: 'Multiplier = Level + 1 (for rare drops ≤ 5%)' },
  numismatist: { name: 'Bet Limit Boost', maxLevel: 20, description: 'Raises the maximum bet allowed on a coinflip', formula: 'Base $1B + Level × $5B max bet limit' },
  jackpot_fever: { name: 'High Roller', maxLevel: 20, description: 'Increases slot machine win payouts and free spin reward multipliers', formula: 'Level × 5% payout boost (max +100%)' },
  amnesiac: { name: 'Cooldown Reset', maxLevel: 24, description: 'Chance that an action cooldown gets instantly reset', formula: 'Level × 2% chance' },
  water_byproducts: { name: 'Water Abundance', maxLevel: 10, description: 'Increases farm water byproducts (Weeds & Red Mushrooms) and boosts harvest yields on watered plots', formula: '+15% crop yield & +15% water byproducts per level (max +150%)' }
};

const parseRecipe = (str) => {
    return str.split(', ').map(part => {
        const [item, quantity] = part.split('×');
        return { item: item.trim(), quantity: parseInt(quantity, 10) };
    });
};

const TOOL_UPGRADE_RECIPES = {
    fish: {
        1: parseRecipe("Blueberry×1, RedMushroom×1, Weeds×1"),
        2: parseRecipe("Blueberry×3, RedMushroom×3, Weeds×4"),
        3: parseRecipe("Blueberry×13, RedMushroom×14, Weeds×19"),
        4: parseRecipe("Blueberry×35, RedMushroom×38, Weeds×50"),
        5: parseRecipe("Blueberry×72, RedMushroom×77, Weeds×102"),
        6: parseRecipe("Strawberry×13, RedMushroom×134, Weeds×178"),
        7: parseRecipe("Strawberry×20, RedMushroom×210, Weeds×280"),
        8: parseRecipe("Strawberry×29, RedMushroom×309, Weeds×412"),
        9: parseRecipe("Strawberry×41, RedMushroom×431, Weeds×575"),
        10: parseRecipe("Strawberry×54, RedMushroom×579, Weeds×772"),
        11: parseRecipe("Kiwi×43, RedMushroom×753, OldBones×753"),
        12: parseRecipe("Kiwi×54, RedMushroom×956, OldBones×956"),
        13: parseRecipe("Kiwi×67, RedMushroom×1188, OldBones×1188"),
        14: parseRecipe("Kiwi×82, RedMushroom×1451, OldBones×1451"),
        15: parseRecipe("Kiwi×98, RedMushroom×1746, OldBones×1746"),
        16: parseRecipe("Mango×59, RedMushroom×2075, OldBones×2075"),
        17: parseRecipe("Mango×69, RedMushroom×2438, OldBones×2438"),
        18: parseRecipe("Mango×80, RedMushroom×2837, OldBones×2837"),
        19: parseRecipe("Mango×92, RedMushroom×3272, OldBones×3272"),
        20: parseRecipe("Mango×105, RedMushroom×3746, OldBones×3746"),
        21: parseRecipe("Melon×60, RedMushroom×2129, PrimeSteak×1420"),
        22: parseRecipe("Melon×68, RedMushroom×2405, PrimeSteak×1604"),
        23: parseRecipe("Melon×76, RedMushroom×2702, PrimeSteak×1801"),
        24: parseRecipe("Melon×85, RedMushroom×3020, PrimeSteak×2013"),
        25: parseRecipe("Melon×95, RedMushroom×3358, PrimeSteak×2239"),
        26: parseRecipe("Coconut×7, RedMushroom×3719, PrimeSteak×2480"),
        27: parseRecipe("Coconut×8, RedMushroom×4102, PrimeSteak×2735"),
        28: parseRecipe("Coconut×9, RedMushroom×4508, PrimeSteak×3006"),
        29: parseRecipe("Coconut×10, RedMushroom×4937, PrimeSteak×3292"),
        30: parseRecipe("Coconut×11, RedMushroom×5390, PrimeSteak×3593"),
        31: parseRecipe("Pumpkin×2, RedMushroom×5867, PrimeSteak×3911"),
        32: parseRecipe("Pumpkin×2, RedMushroom×6368, PrimeSteak×4245"),
        33: parseRecipe("Pumpkin×2, RedMushroom×6894, PrimeSteak×4596"),
        34: parseRecipe("Pumpkin×2, RedMushroom×7445, PrimeSteak×4963"),
        35: parseRecipe("Pumpkin×2, RedMushroom×8022, PrimeSteak×5348"),
        36: parseRecipe("Melon×242, Diamond×35, PrimeSteak×5750"),
        37: parseRecipe("Melon×260, Diamond×38, PrimeSteak×6169"),
        38: parseRecipe("Melon×278, Diamond×40, PrimeSteak×6607"),
        39: parseRecipe("Melon×297, Diamond×43, PrimeSteak×7062"),
        40: parseRecipe("Melon×317, Diamond×46, PrimeSteak×7536"),
        41: parseRecipe("Coconut×23, RitualUrn×241, PrimeSteak×8028"),
        42: parseRecipe("Coconut×24, RitualUrn×257, PrimeSteak×8540"),
        43: parseRecipe("Coconut×26, RitualUrn×273, PrimeSteak×9070"),
        44: parseRecipe("Coconut×27, RitualUrn×289, PrimeSteak×9619"),
        45: parseRecipe("Coconut×29, RitualUrn×306, PrimeSteak×10188"),
        46: parseRecipe("Pumpkin×4, Uranium×7, PrimeSteak×10777"),
        47: parseRecipe("Pumpkin×4, Uranium×7, PrimeSteak×11386"),
        48: parseRecipe("Pumpkin×4, Uranium×8, PrimeSteak×12015"),
        49: parseRecipe("Pumpkin×4, Uranium×8, PrimeSteak×12664"),
        50: parseRecipe("Pumpkin×4, Uranium×8, PrimeSteak×13334")
    },
    hunt: {
        1: parseRecipe("Copper×1, Jellyfish×1, DiscardedButt×1, BigLog×1, RustyKnife×1"),
        2: parseRecipe("Copper×8, Jellyfish×2, DiscardedButt×5, BigLog×1, RustyKnife×3"),
        3: parseRecipe("Copper×41, Jellyfish×8, DiscardedButt×28, BigLog×5, RustyKnife×14"),
        4: parseRecipe("Copper×112, Jellyfish×22, DiscardedButt×75, BigLog×13, RustyKnife×38"),
        5: parseRecipe("Copper×229, Jellyfish×44, DiscardedButt×153, BigLog×26, RustyKnife×77"),
        6: parseRecipe("Iron×134, Jellyfish×77, DiscardedButt×267, BigLog×45, RustyKnife×134"),
        7: parseRecipe("Iron×210, Jellyfish×120, DiscardedButt×420, BigLog×70, RustyKnife×210"),
        8: parseRecipe("Iron×309, Jellyfish×177, DiscardedButt×618, BigLog×103, RustyKnife×309"),
        9: parseRecipe("Iron×431, Jellyfish×247, DiscardedButt×862, BigLog×144, RustyKnife×431"),
        10: parseRecipe("Iron×579, Jellyfish×331, DiscardedButt×1157, BigLog×193, RustyKnife×579"),
        11: parseRecipe("Silver×452, Jellyfish×431, DiscardedButt×1506, BigLog×251, RustyKnife×753"),
        12: parseRecipe("Silver×574, Jellyfish×546, DiscardedButt×1911, BigLog×319, RustyKnife×956"),
        13: parseRecipe("Silver×713, Jellyfish×679, DiscardedButt×2375, BigLog×396, RustyKnife×1188"),
        14: parseRecipe("Silver×871, Jellyfish×829, DiscardedButt×2901, BigLog×484, RustyKnife×1451"),
        15: parseRecipe("Silver×1048, Jellyfish×998, DiscardedButt×3491, BigLog×582, RustyKnife×1746"),
        16: parseRecipe("Gold×778, Jellyfish×1186, DiscardedButt×4149, BigLog×692, RustyKnife×2075"),
        17: parseRecipe("Gold×914, Jellyfish×1393, DiscardedButt×4875, BigLog×813, RustyKnife×2438"),
        18: parseRecipe("Gold×1064, Jellyfish×1621, DiscardedButt×5673, BigLog×946, RustyKnife×2837"),
        19: parseRecipe("Gold×1227, Jellyfish×1870, DiscardedButt×6544, BigLog×1091, RustyKnife×3272"),
        20: parseRecipe("Gold×1405, Jellyfish×2141, DiscardedButt×7491, BigLog×1249, RustyKnife×3746"),
        21: parseRecipe("Cobalt×26, Jellyfish×2433, DiscardedButt×8515, BigLog×1420, RustyKnife×4258"),
        22: parseRecipe("Cobalt×29, Jellyfish×2749, DiscardedButt×9620, BigLog×1604, RustyKnife×4810"),
        23: parseRecipe("Cobalt×33, Jellyfish×3088, DiscardedButt×10806, BigLog×1801, RustyKnife×5403"),
        24: parseRecipe("Cobalt×37, Jellyfish×3451, DiscardedButt×12077, BigLog×2013, RustyKnife×6039"),
        25: parseRecipe("Cobalt×41, Jellyfish×3838, DiscardedButt×13432, BigLog×2239, RustyKnife×6716"),
        26: parseRecipe("Platinum×6, Blowfish×595, TreatedHull×67, Coal×34497"),
        27: parseRecipe("Platinum×7, Blowfish×657, TreatedHull×74, Coal×37014"),
        28: parseRecipe("Platinum×8, Blowfish×722, TreatedHull×82, Coal×39638"),
        29: parseRecipe("Platinum×8, Blowfish×790, TreatedHull×89, Coal×42371"),
        30: parseRecipe("Platinum×9, Blowfish×863, TreatedHull×97, Coal×45213"),
        31: parseRecipe("Diamond×94, Blowfish×939, TreatedHull×106"),
        32: parseRecipe("Diamond×102, Blowfish×1019, TreatedHull×115"),
        33: parseRecipe("Diamond×111, Blowfish×1103, TreatedHull×124"),
        34: parseRecipe("Diamond×120, Blowfish×1192, TreatedHull×134"),
        35: parseRecipe("Diamond×129, Blowfish×1284, TreatedHull×145"),
        36: parseRecipe("Thermite×863, Blowfish×1380, TreatedHull×156, SteelBeam×173"),
        37: parseRecipe("Thermite×926, Blowfish×1481, TreatedHull×167, SteelBeam×186"),
        38: parseRecipe("Thermite×991, Blowfish×1586, TreatedHull×179, SteelBeam×199"),
        39: parseRecipe("Thermite×1060, Blowfish×1695, TreatedHull×191, SteelBeam×212"),
        40: parseRecipe("Thermite×1131, Blowfish×1809, TreatedHull×204, SteelBeam×227"),
        41: parseRecipe("Uranium×20, Blowfish×1927, ReinforcedHull×18"),
        42: parseRecipe("Uranium×21, Blowfish×2050, ReinforcedHull×19"),
        43: parseRecipe("Uranium×22, Blowfish×2177, ReinforcedHull×20"),
        44: parseRecipe("Uranium×24, Blowfish×2309, ReinforcedHull×22"),
        45: parseRecipe("Uranium×25, Blowfish×2446, ReinforcedHull×23"),
        46: parseRecipe("LuckyCharm×2, Blowfish×2587, ReinforcedHull×24"),
        47: parseRecipe("LuckyCharm×2, Blowfish×2733, ReinforcedHull×26"),
        48: parseRecipe("LuckyCharm×2, Blowfish×2884, ReinforcedHull×27"),
        49: parseRecipe("LuckyCharm×2, Blowfish×3040, ReinforcedHull×28"),
        50: parseRecipe("LuckyCharm×2, Blowfish×3200, ReinforcedHull×30")
    },
    explore: {
        1: parseRecipe("TatteredBoot×1, Feathers×1, Weeds×1"),
        2: parseRecipe("TatteredBoot×13, Feathers×20, Weeds×4"),
        3: parseRecipe("TatteredBoot×68, Feathers×109, Weeds×19"),
        4: parseRecipe("TatteredBoot×186, Feathers×298, Weeds×50"),
        5: parseRecipe("TatteredBoot×382, Feathers×611, Weeds×102"),
        6: parseRecipe("TatteredBoot×666, ThickRope×5, Weeds×711"),
        7: parseRecipe("TatteredBoot×1050, ThickRope×7, Weeds×1120"),
        8: parseRecipe("TatteredBoot×1544, ThickRope×11, Weeds×1647"),
        9: parseRecipe("TatteredBoot×2155, ThickRope×15, Weeds×2299"),
        10: parseRecipe("TatteredBoot×2893, ThickRope×20, Weeds×3085"),
        11: parseRecipe("TatteredBoot×2259, ThickRope×26, LightSuede×37"),
        12: parseRecipe("TatteredBoot×2866, ThickRope×32, LightSuede×46"),
        13: parseRecipe("TatteredBoot×3562, ThickRope×40, LightSuede×57"),
        14: parseRecipe("TatteredBoot×4351, ThickRope×49, LightSuede×70"),
        15: parseRecipe("TatteredBoot×5237, ThickRope×59, LightSuede×84"),
        16: parseRecipe("ReinforcedChain×10, ThickRope×208, LightSuede×100"),
        17: parseRecipe("ReinforcedChain×12, ThickRope×244, LightSuede×117"),
        18: parseRecipe("ReinforcedChain×14, ThickRope×284, LightSuede×137"),
        19: parseRecipe("ReinforcedChain×16, ThickRope×328, LightSuede×158"),
        20: parseRecipe("ReinforcedChain×18, ThickRope×375, LightSuede×180"),
        21: parseRecipe("ReinforcedChain×20, ToughRawhide×13, LightSuede×205"),
        22: parseRecipe("ReinforcedChain×23, ToughRawhide×15, LightSuede×231"),
        23: parseRecipe("ReinforcedChain×26, ToughRawhide×17, LightSuede×260"),
        24: parseRecipe("ReinforcedChain×28, ToughRawhide×19, LightSuede×290"),
        25: parseRecipe("ReinforcedChain×32, ToughRawhide×21, LightSuede×323"),
        26: parseRecipe("ReinforcedChain×35, ToughRawhide×30, LightSuede×298"),
        27: parseRecipe("ReinforcedChain×38, ToughRawhide×33, LightSuede×329"),
        28: parseRecipe("ReinforcedChain×42, ToughRawhide×37, LightSuede×361"),
        29: parseRecipe("ReinforcedChain×46, ToughRawhide×40, LightSuede×395"),
        30: parseRecipe("ReinforcedChain×50, ToughRawhide×44, LightSuede×432"),
        31: parseRecipe("ReinforcedChain×55, ToughRawhide×59, LightSuede×376"),
        32: parseRecipe("ReinforcedChain×59, ToughRawhide×64, LightSuede×408"),
        33: parseRecipe("ReinforcedChain×64, ToughRawhide×69, LightSuede×442"),
        34: parseRecipe("ReinforcedChain×69, ToughRawhide×75, LightSuede×477"),
        35: parseRecipe("ReinforcedChain×75, ToughRawhide×81, LightSuede×514"),
        36: parseRecipe("OldBones×17249, ToughRawhide×138, DiamondTether×3"),
        37: parseRecipe("OldBones×18507, ToughRawhide×149, DiamondTether×3"),
        38: parseRecipe("OldBones×19819, ToughRawhide×159, DiamondTether×3"),
        39: parseRecipe("OldBones×21186, ToughRawhide×170, DiamondTether×3"),
        40: parseRecipe("OldBones×22607, ToughRawhide×181, DiamondTether×4"),
        41: parseRecipe("Uranium×20, ToughRawhide×121, DiamondTether×4"),
        42: parseRecipe("Uranium×21, ToughRawhide×129, DiamondTether×4"),
        43: parseRecipe("Uranium×22, ToughRawhide×137, DiamondTether×4"),
        44: parseRecipe("Uranium×24, ToughRawhide×145, DiamondTether×4"),
        45: parseRecipe("Uranium×25, ToughRawhide×153, DiamondTether×5"),
        46: parseRecipe("LuckyCharm×2, ToughRawhide×162, DiamondTether×5"),
        47: parseRecipe("LuckyCharm×2, ToughRawhide×171, DiamondTether×5"),
        48: parseRecipe("LuckyCharm×2, ToughRawhide×181, DiamondTether×5"),
        49: parseRecipe("LuckyCharm×2, ToughRawhide×190, DiamondTether×6"),
        50: parseRecipe("LuckyCharm×2, ToughRawhide×200, DiamondTether×6")
    },
    mine: {
        1: parseRecipe("Copper×1, BigLog×1"),
        2: parseRecipe("Copper×20, BigLog×2"),
        3: parseRecipe("Copper×109, BigLog×10"),
        4: parseRecipe("Copper×298, BigLog×25"),
        5: parseRecipe("Copper×611, BigLog×51"),
        6: parseRecipe("Iron×356, BigLog×89"),
        7: parseRecipe("Iron×560, BigLog×140"),
        8: parseRecipe("Iron×824, BigLog×206"),
        9: parseRecipe("Iron×1150, BigLog×288"),
        10: parseRecipe("Iron×1543, BigLog×386"),
        11: parseRecipe("Silver×1205, BigLog×502"),
        12: parseRecipe("Silver×1529, BigLog×637"),
        13: parseRecipe("Silver×1900, BigLog×792"),
        14: parseRecipe("Silver×2321, BigLog×967"),
        15: parseRecipe("Silver×2793, BigLog×1164"),
        16: parseRecipe("Gold×2075, BigLog×1383"),
        17: parseRecipe("Gold×2438, BigLog×1625"),
        18: parseRecipe("Gold×2837, BigLog×1891"),
        19: parseRecipe("Gold×3272, BigLog×2182"),
        20: parseRecipe("Gold×3746, BigLog×2497"),
        21: parseRecipe("Cobalt×69, BigLog×2839"),
        22: parseRecipe("Cobalt×77, BigLog×3207"),
        23: parseRecipe("Cobalt×87, BigLog×3602"),
        24: parseRecipe("Cobalt×97, BigLog×4026"),
        25: parseRecipe("Cobalt×108, BigLog×4478"),
        26: parseRecipe("Platinum×12, BigLog×4959"),
        27: parseRecipe("Platinum×14, BigLog×5470"),
        28: parseRecipe("Platinum×15, BigLog×6011"),
        29: parseRecipe("Platinum×16, BigLog×6583"),
        30: parseRecipe("Platinum×18, BigLog×7186"),
        31: parseRecipe("Diamond×188, BigLog×7822"),
        32: parseRecipe("Diamond×204, BigLog×8490"),
        33: parseRecipe("Diamond×221, BigLog×9191"),
        34: parseRecipe("Diamond×239, BigLog×9926"),
        35: parseRecipe("Diamond×257, BigLog×10695"),
        36: parseRecipe("Thermite×863, BigLog×11499, SteelBeam×518, Coal×34497"),
        37: parseRecipe("Thermite×926, BigLog×12338, SteelBeam×556, Coal×37014"),
        38: parseRecipe("Thermite×991, BigLog×13213, SteelBeam×595, Coal×39638"),
        39: parseRecipe("Thermite×1060, BigLog×14124, SteelBeam×636, Coal×42371"),
        40: parseRecipe("Thermite×1131, BigLog×15071, SteelBeam×679, Coal×45213"),
        41: parseRecipe("Uranium×39, BigLog×16056"),
        42: parseRecipe("Uranium×41, BigLog×17079"),
        43: parseRecipe("Uranium×44, BigLog×18139"),
        44: parseRecipe("Uranium×47, BigLog×19238"),
        45: parseRecipe("Uranium×49, BigLog×20376"),
        46: parseRecipe("LuckyCharm×3, BigLog×21554"),
        47: parseRecipe("LuckyCharm×3, BigLog×22771"),
        48: parseRecipe("LuckyCharm×3, BigLog×24029"),
        49: parseRecipe("LuckyCharm×4, BigLog×25327"),
        50: parseRecipe("LuckyCharm×4, BigLog×26667")
    }
};

const SOCKET_MODULE_DEFINITIONS = {
    'multistrike_1': {
        id: 'multistrike_1',
        name: 'Multistrike Matrix I',
        family: 'multistrike',
        tier: 1,
        description: '+10% chance to trigger a bonus duplicate roll pool.',
        effect: { multistrikeChance: 0.10 },
        recipe: [ { item: 'Copper', quantity: 250 }, { item: 'ScrapMetal', quantity: 150 }, { item: 'CircuitShard', quantity: 5 } ]
    },
    'multistrike_2': {
        id: 'multistrike_2',
        name: 'Multistrike Matrix II',
        family: 'multistrike',
        tier: 2,
        description: '+25% chance to trigger a bonus duplicate roll pool.',
        effect: { multistrikeChance: 0.25 },
        recipe: [ { item: 'Gold', quantity: 500 }, { item: 'TitaniumOre', quantity: 100 }, { item: 'CircuitShard', quantity: 25 } ]
    },
    'multistrike_3': {
        id: 'multistrike_3',
        name: 'Multistrike Matrix III',
        family: 'multistrike',
        tier: 3,
        description: '+50% chance to trigger a bonus duplicate roll pool.',
        effect: { multistrikeChance: 0.50 },
        recipe: [ { item: 'Diamond', quantity: 100 }, { item: 'Uranium', quantity: 20 }, { item: 'AncientCoinCache', quantity: 5 } ]
    },
    'prospector_1': {
        id: 'prospector_1',
        name: 'Prospector Core I',
        family: 'prospector',
        tier: 1,
        description: '+15% rare item drop multiplier (for items ≤ 5% chance).',
        effect: { rareDropBonus: 0.15 },
        recipe: [ { item: 'Silver', quantity: 300 }, { item: 'Quartz', quantity: 200 }, { item: 'Ruby', quantity: 50 } ]
    },
    'prospector_2': {
        id: 'prospector_2',
        name: 'Prospector Core II',
        family: 'prospector',
        tier: 2,
        description: '+35% rare item drop multiplier (for items ≤ 5% chance).',
        effect: { rareDropBonus: 0.35 },
        recipe: [ { item: 'Sapphire', quantity: 200 }, { item: 'Emerald', quantity: 150 }, { item: 'BlackPearl', quantity: 10 } ]
    },
    'prospector_3': {
        id: 'prospector_3',
        name: 'Prospector Core III',
        family: 'prospector',
        tier: 3,
        description: '+75% rare item drop multiplier (for items ≤ 5% chance).',
        effect: { rareDropBonus: 0.75 },
        recipe: [ { item: 'Alexandrite', quantity: 25 }, { item: 'PearledOyster', quantity: 20 }, { item: 'FossilizedDragonScale', quantity: 2 } ]
    },
    'transmuter_1': {
        id: 'transmuter_1',
        name: 'Alchemical Catalyst I',
        family: 'transmuter',
        tier: 1,
        description: 'Transmutes 5% of common junk drops into higher-tier resources.',
        effect: { transmutationRate: 0.05 },
        recipe: [ { item: 'Obsidian', quantity: 250 }, { item: 'GlowingMushroom', quantity: 50 }, { item: 'RitualUrn', quantity: 10 } ]
    },
    'transmuter_2': {
        id: 'transmuter_2',
        name: 'Alchemical Catalyst II',
        family: 'transmuter',
        tier: 2,
        description: 'Transmutes 12% of common junk drops into higher-tier resources.',
        effect: { transmutationRate: 0.12 },
        recipe: [ { item: 'Petroleum', quantity: 150 }, { item: 'CorruptedMemoryCard', quantity: 30 }, { item: 'AncientFossil', quantity: 10 } ]
    },
    'transmuter_3': {
        id: 'transmuter_3',
        name: 'Alchemical Catalyst III',
        family: 'transmuter',
        tier: 3,
        description: 'Transmutes 25% of common junk drops into higher-tier resources.',
        effect: { transmutationRate: 0.25 },
        recipe: [ { item: 'Platinum', quantity: 50 }, { item: 'EncryptedDrive', quantity: 5 }, { item: 'HeartwoodCore', quantity: 5 } ]
    },
    'chrono_1': {
        id: 'chrono_1',
        name: 'Chrono Resonator I',
        family: 'chrono',
        tier: 1,
        description: 'Reduces action cooldown by an additional 5 seconds.',
        effect: { cooldownReduction: 5 },
        recipe: [ { item: 'Neodymium', quantity: 300 }, { item: 'FloppyDisk', quantity: 100 }, { item: 'InsulatingResin', quantity: 40 } ]
    },
    'chrono_2': {
        id: 'chrono_2',
        name: 'Chrono Resonator II',
        family: 'chrono',
        tier: 2,
        description: 'Reduces action cooldown by an additional 10 seconds.',
        effect: { cooldownReduction: 10 },
        recipe: [ { item: 'Lithium', quantity: 200 }, { item: 'RubberTire', quantity: 80 }, { item: 'ConductiveAlgae', quantity: 20 } ]
    },
    'chrono_3': {
        id: 'chrono_3',
        name: 'Chrono Resonator III',
        family: 'chrono',
        tier: 3,
        description: 'Reduces action cooldown by an additional 15 seconds.',
        effect: { cooldownReduction: 15 },
        recipe: [ { item: 'Tungsten', quantity: 150 }, { item: 'Iridium', quantity: 50 }, { item: 'OldCrown', quantity: 10 } ]
    },
    'fortune_1': {
        id: 'fortune_1',
        name: 'Fortune Amplifier I',
        family: 'fortune',
        tier: 1,
        description: '+1 to Serendipity rare multiplier.',
        effect: { serendipityBonus: 1 },
        recipe: [ { item: 'RabbitFoot', quantity: 150 }, { item: 'Honeycomb', quantity: 50 }, { item: 'BlackTruffle', quantity: 10 } ]
    },
    'fortune_2': {
        id: 'fortune_2',
        name: 'Fortune Amplifier II',
        family: 'fortune',
        tier: 2,
        description: '+2 to Serendipity rare multiplier.',
        effect: { serendipityBonus: 2 },
        recipe: [ { item: 'ElkAntlers', quantity: 30 }, { item: 'OrnateNecklace', quantity: 15 }, { item: 'TreasureChest', quantity: 5 } ]
    },
    'fortune_3': {
        id: 'fortune_3',
        name: 'Fortune Amplifier III',
        family: 'fortune',
        tier: 3,
        description: '+4 to Serendipity rare multiplier.',
        effect: { serendipityBonus: 4 },
        recipe: [ { item: 'AlphaWolfFang', quantity: 15 }, { item: 'GiantSquid', quantity: 5 }, { item: 'Manuscript', quantity: 5 } ]
    }
};

const DROP_TABLE_MAP = {
    mine: MINE_DROP_TABLE,
    explore: EXPLORE_DROP_TABLE,
    hunt: HUNT_DROP_TABLE,
    fish: FISH_DROP_TABLE
};

/**
 * Generates deterministic pure-gathering material recipes for tool levels 51-500.
 * @param {string} toolType - 'mine', 'explore', 'hunt', 'fish'
 * @param {number} level - Target level (51-500)
 * @returns {Array<{item: string, quantity: number}>|null}
 */
function generateProceduralRecipe(toolType, level) {
    const table = DROP_TABLE_MAP[toolType];
    if (!table || level < 51 || level > 500) return null;

    const common = table.filter(d => d.chance > 8.0).map(d => d.item);
    const uncommon = table.filter(d => d.chance > 2.0 && d.chance <= 8.0).map(d => d.item);
    const rare = table.filter(d => d.chance > 0.20 && d.chance <= 2.0).map(d => d.item);
    const ultraRare = table.filter(d => d.chance <= 0.20).map(d => d.item);

    const X = level - 50;

    const item1 = common[X % common.length];
    const qty1 = Math.floor(2000 * Math.pow(1 + (0.05 * X), 1.6));

    const item2 = uncommon[(X + 1) % uncommon.length];
    const qty2 = Math.floor(250 * Math.pow(1 + (0.04 * X), 1.4));

    const item3 = rare[Math.floor(X / 5) % rare.length];
    const qty3 = Math.floor(20 * Math.pow(1 + (0.035 * X), 1.25));

    const recipe = [
        { item: item1, quantity: Math.max(1, qty1) },
        { item: item2, quantity: Math.max(1, qty2) },
        { item: item3, quantity: Math.max(1, qty3) }
    ];

    if (level % 25 === 0 && ultraRare.length > 0) {
        const item4 = ultraRare[Math.floor(level / 25) % ultraRare.length];
        const qty4 = Math.max(1, Math.floor(level / 50));
        recipe.push({ item: item4, quantity: qty4 });
    }

    return recipe;
}

const ACTION_COOLDOWNS = { mine: 300, explore: 300, hunt: 300, fish: 300, work: 1800 };

module.exports = {
    FISH_DROP_TABLE,
    EXPLORE_DROP_TABLE,
    HUNT_DROP_TABLE,
    MINE_DROP_TABLE,
    RANKS,
    PERK_DEFINITIONS,
    TOOL_UPGRADE_RECIPES,
    ACTION_COOLDOWNS,
    SOCKET_MODULE_DEFINITIONS,
    generateProceduralRecipe
};
