/**
 * Canonical descriptions for all registered items and loot boosters.
 */
const { FARM_UPGRADE_MATERIALS } = require('../engine/farmPlotUpgrade');

const ITEM_DESCRIPTIONS = {
    // ── 🎣 Fishing Items ──
    'Seaweed': 'A tangled ribbon of ocean greenery, dripping with saltwater and carrying the unmistakable scent of the deep.',
    'Sardine': 'Small, silver, and relentlessly common, this little fish survives by disappearing into crowds larger than itself.',
    'TatteredBoot': 'A waterlogged boot with a ruined sole and an unknown former owner. The sea refuses to explain either.',
    'Tattered Boot': 'A waterlogged boot with a ruined sole and an unknown former owner. The sea refuses to explain either.',
    'Prawn': 'A quick little crustacean wrapped in a delicate shell, prized far more on a plate than on the end of a fishing line.',
    'Lobster': 'Armored in a crimson shell and equipped with formidable claws, this seafloor bruiser is worth the trouble of hauling up.',
    'Jellyfish': 'A translucent drifter that seems almost weightless until its trailing tentacles remind you to keep your distance.',
    'AntiqueBottle': 'Clouded glass polished smooth by years beneath the waves. Whatever message it once carried is long gone.',
    'Antique Bottle': 'Clouded glass polished smooth by years beneath the waves. Whatever message it once carried is long gone.',
    'Octopus': 'An eight-armed escape artist whose unsettling intelligence makes you wonder who actually caught whom.',
    'OceanCrab': 'A saltwater scavenger clad in a rugged shell, forever sidestepping danger instead of confronting it directly.',
    'Ocean Crab': 'A saltwater scavenger clad in a rugged shell, forever sidestepping danger instead of confronting it directly.',
    'ChunkyCoral': 'A hefty piece of weathered reef, shaped over countless tides into a colorful chunk of hardened ocean history.',
    'Chunky Coral': 'A hefty piece of weathered reef, shaped over countless tides into a colorful chunk of hardened ocean history.',
    'Blowfish': 'Harmless-looking until threatened, when it transforms itself into a spiked warning balloon with absolutely no sense of humor.',
    'KingCrab': 'A massive, long-legged crustacean whose imposing shell makes ordinary crabs look like nervous distant relatives.',
    'King Crab': 'A massive, long-legged crustacean whose imposing shell makes ordinary crabs look like nervous distant relatives.',
    'ElectricEel': 'A slippery living battery capable of turning an otherwise peaceful catch into a remarkably shocking experience.',
    'Electric Eel': 'A slippery living battery capable of turning an otherwise peaceful catch into a remarkably shocking experience.',
    'ElectricRay': 'A broad, flat predator carrying enough natural voltage to make careless hands immediately reconsider their choices.',
    'Electric Ray': 'A broad, flat predator carrying enough natural voltage to make careless hands immediately reconsider their choices.',
    'Clamshell': 'Two sturdy halves shaped by the sea, still bearing the smooth inner surface that once protected something softer.',
    'ConductiveAlgae': 'An unusual marine growth whose mineral-rich strands conduct energy far better than ordinary seaweed ever should.',
    'Conductive Algae': 'An unusual marine growth whose mineral-rich strands conduct energy far better than ordinary seaweed ever should.',
    'GreatWhite': 'An apex predator built from muscle, instinct, and rows of teeth that make bringing it aboard seem like a terrible achievement.',
    'Great White': 'An apex predator built from muscle, instinct, and rows of teeth that make bringing it aboard seem like a terrible achievement.',
    'OrnateNecklace': 'Delicate metalwork and faded gemstones recovered from the seabed, hinting at a story the ocean decided to keep.',
    'Ornate Necklace': 'Delicate metalwork and faded gemstones recovered from the seabed, hinting at a story the ocean decided to keep.',
    'BlackPearl': 'A naturally dark pearl with a mysterious luster, so striking that even seasoned treasure hunters stop to admire it.',
    'Black Pearl': 'A naturally dark pearl with a mysterious luster, so striking that even seasoned treasure hunters stop to admire it.',
    'PearledOyster': 'An unassuming shellfish concealing a luminous treasure, proof that patience sometimes grows something extraordinary.',
    'Pearled Oyster': 'An unassuming shellfish concealing a luminous treasure, proof that patience sometimes grows something extraordinary.',
    'Coelacanth': 'A living relic from an ancient branch of life, surviving the ages with little concern for whether anyone believed it still existed.',
    'OldCrown': 'A tarnished symbol of forgotten authority, stripped of its kingdom but somehow not of its dignity.',
    'Old Crown': 'A tarnished symbol of forgotten authority, stripped of its kingdom but somehow not of its dignity.',
    'TreasureChest': 'A battered chest hauled from the depths, heavy enough to make every wild theory about its contents feel plausible.',
    'Treasure Chest': 'A battered chest hauled from the depths, heavy enough to make every wild theory about its contents feel plausible.',
    'GiantSquid': 'A colossal deep-sea phantom rarely seen by human eyes, with tentacles capable of turning a fishing story into legend.',
    'Giant Squid': 'A colossal deep-sea phantom rarely seen by human eyes, with tentacles capable of turning a fishing story into legend.',

    // ── 🧭 Exploration Items ──
    'Rock': 'An ordinary stone with no grand history, secret power, or hidden agenda. Sometimes a rock is simply a rock.',
    'Weeds': 'Stubborn plants thriving exactly where nobody invited them, proving that persistence does not require permission.',
    'OldBones': 'Sun-bleached remains whose owner and story have vanished, leaving only a brittle reminder that something once lived here.',
    'Old Bones': 'Sun-bleached remains whose owner and story have vanished, leaving only a brittle reminder that something once lived here.',
    'DiscardedButt': 'The grimy remnant of someone else\'s bad habit, somehow surviving long after the moment that created it.',
    'Discarded Butt': 'The grimy remnant of someone else\'s bad habit, somehow surviving long after the moment that created it.',
    'Dandelion': 'A bright roadside survivor whose delicate seeds patiently wait for the slightest breeze to carry them somewhere new.',
    'RustyKnife': 'Once sharp, now scarred by corrosion; still recognizable as a blade and still unpleasant enough to handle carefully.',
    'Rusty Knife': 'Once sharp, now scarred by corrosion; still recognizable as a blade and still unpleasant enough to handle carefully.',
    'CrushedPack': 'A flattened, weather-beaten package trampled almost beyond recognition, containing nothing except traces of somebody else\'s routine.',
    'Crushed Pack': 'A flattened, weather-beaten package trampled almost beyond recognition, containing nothing except traces of somebody else\'s routine.',
    'ScrapMetal': 'Bent, scratched, and stripped of its original purpose, but still useful to anyone who sees material instead of garbage.',
    'Scrap Metal': 'Bent, scratched, and stripped of its original purpose, but still useful to anyone who sees material instead of garbage.',
    'BigLog': 'A substantial length of timber that rewards strong backs, practical thinking, and an unreasonable willingness to carry heavy things home.',
    'Big Log': 'A substantial length of timber that rewards strong backs, practical thinking, and an unreasonable willingness to carry heavy things home.',
    'EmptySodaCan': 'Lightweight aluminum decorated with faded colors and absolutely none of the refreshment it once promised.',
    'Empty Soda Can': 'Lightweight aluminum decorated with faded colors and absolutely none of the refreshment it once promised.',
    'RustyNail': 'A tiny piece of corroded iron whose greatest remaining talent is making people extremely careful about where they step.',
    'Rusty Nail': 'A tiny piece of corroded iron whose greatest remaining talent is making people extremely careful about where they step.',
    'CopperWire': 'Flexible strands of conductive copper salvaged intact enough to remain valuable for repairs, machinery, or improvised engineering.',
    'Copper Wire': 'Flexible strands of conductive copper salvaged intact enough to remain valuable for repairs, machinery, or improvised engineering.',
    'RichWool': 'Thick, unusually soft fleece with dense fibers that feel far more luxurious than something discovered in the wilderness has any right to.',
    'Rich Wool': 'Thick, unusually soft fleece with dense fibers that feel far more luxurious than something discovered in the wilderness has any right to.',
    'FloppyDisk': 'A relic of early digital storage containing a tiny amount of data and an enormous amount of technological nostalgia.',
    'Floppy Disk': 'A relic of early digital storage containing a tiny amount of data and an enormous amount of technological nostalgia.',
    'Lightbulb': 'Fragile glass surrounding a simple invention that turned darkness from an inevitability into an inconvenience.',
    'InsulatingResin': 'A hardened synthetic compound valued for keeping heat, electricity, and other troublesome forces exactly where they belong.',
    'Insulating Resin': 'A hardened synthetic compound valued for keeping heat, electricity, and other troublesome forces exactly where they belong.',
    'GlowingMushroom': 'A strange fungus emitting a soft natural light, beautiful enough to admire and suspicious enough not to taste.',
    'Glowing Mushroom': 'A strange fungus emitting a soft natural light, beautiful enough to admire and suspicious enough not to taste.',
    'RubberTire': 'Worn smooth by countless miles, this heavy ring of rubber has outlived whatever vehicle once depended on it.',
    'Rubber Tire': 'Worn smooth by countless miles, this heavy ring of rubber has outlived whatever vehicle once depended on it.',
    'CircuitShard': 'A broken fragment of compact electronics, its tiny pathways suggesting a more sophisticated device that did not survive intact.',
    'Circuit Shard': 'A broken fragment of compact electronics, its tiny pathways suggesting a more sophisticated device that did not survive intact.',
    'RitualUrn': 'A carefully decorated vessel marked with unfamiliar ceremonial patterns, carrying the uncomfortable feeling that opening it would be disrespectful.',
    'Ritual Urn': 'A carefully decorated vessel marked with unfamiliar ceremonial patterns, carrying the uncomfortable feeling that opening it would be disrespectful.',
    'CorruptedMemoryCard': 'A damaged storage device full of fragmented data, unreadable files, and perhaps a few secrets still recoverable by someone persistent enough.',
    'Corrupted Memory Card': 'A damaged storage device full of fragmented data, unreadable files, and perhaps a few secrets still recoverable by someone persistent enough.',
    'AncientFossil': 'Stone preserving the shape of life from an age so distant that entire landscapes have disappeared since it was formed.',
    'Ancient Fossil': 'Stone preserving the shape of life from an age so distant that entire landscapes have disappeared since it was formed.',
    'Manuscript': 'Fragile pages covered in deliberate handwriting, preserving thoughts that somehow survived longer than the person who first put them to paper.',
    'EncryptedDrive': 'A compact storage device sealed behind layers of digital protection, practically begging curious minds to discover what someone wanted hidden.',
    'Encrypted Drive': 'A compact storage device sealed behind layers of digital protection, practically begging curious minds to discover what someone wanted hidden.',

    // ── 🏹 Hunting Items ──
    'Feathers': 'Lightweight traces left behind by passing birds, surprisingly useful despite weighing almost nothing at all.',
    'Chestnut': 'A smooth brown nut sealed inside a tough shell, carrying a compact reserve of energy beneath its polished surface.',
    'Pinecone': 'A woody cluster of tightly arranged scales, designed by nature to protect the beginnings of an entire future forest.',
    'RedMushroom': 'A vivid woodland fungus that advertises its presence with dramatic color while offering absolutely no reassurance about whether it is safe to eat.',
    'Red Mushroom': 'A vivid woodland fungus that advertises its presence with dramatic color while offering absolutely no reassurance about whether it is safe to eat.',
    'WildBerries': 'Small, naturally growing fruits gathered far from cultivated fields, sweet enough to make careful foraging worthwhile.',
    'Wild Berries': 'Small, naturally growing fruits gathered far from cultivated fields, sweet enough to make careful foraging worthwhile.',
    'BirdNest': 'A remarkably intricate home assembled from twigs, grass, and persistence by a builder that never needed blueprints.',
    'Bird Nest': 'A remarkably intricate home assembled from twigs, grass, and persistence by a builder that never needed blueprints.',
    'RabbitFoot': 'A traditional token of good fortune whose original owner was, unfortunately, not quite as lucky.',
    'Rabbit Foot': 'A traditional token of good fortune whose original owner was, unfortunately, not quite as lucky.',
    'SkunkPelt': 'Distinctively patterned fur from an animal famous for making sure every encounter with it becomes memorable.',
    'Skunk Pelt': 'Distinctively patterned fur from an animal famous for making sure every encounter with it becomes memorable.',
    'Milk': 'Fresh, nourishing, and refreshingly ordinary compared with some of the far stranger things recovered from the wilderness.',
    'PrimeSteak': 'A premium cut of meat with rich marbling and enough quality to make a hard day outdoors end considerably better.',
    'Prime Steak': 'A premium cut of meat with rich marbling and enough quality to make a hard day outdoors end considerably better.',
    'BadgerPelt': 'Dense, rugged fur taken from one of the wilderness\'s most stubborn residents, built to withstand rough terrain and worse tempers.',
    'Badger Pelt': 'Dense, rugged fur taken from one of the wilderness\'s most stubborn residents, built to withstand rough terrain and worse tempers.',
    'OxPelt': 'Thick hide from a powerful working beast, prized for durability rather than delicacy.',
    'Ox Pelt': 'Thick hide from a powerful working beast, prized for durability rather than delicacy.',
    'Honeycomb': 'Perfect hexagonal chambers filled with golden sweetness, engineered by insects with a talent for geometry humans still admire.',
    'Firesac': 'A heat-swollen organ from an unusual creature, remaining unnervingly warm even after being separated from its original host.',
    'Frostsac': 'A pale biological pouch radiating persistent cold, its surface frosting over even when the surrounding air is warm.',
    'BuffaloPelt': 'Heavy, coarse fur made to endure exposed plains, bitter weather, and a lifetime attached to something extremely difficult to intimidate.',
    'Buffalo Pelt': 'Heavy, coarse fur made to endure exposed plains, bitter weather, and a lifetime attached to something extremely difficult to intimidate.',
    'BlackTruffle': 'An elusive underground delicacy with an earthy aroma so distinctive that finding one feels like uncovering buried treasure.',
    'Black Truffle': 'An elusive underground delicacy with an earthy aroma so distinctive that finding one feels like uncovering buried treasure.',
    'ElkAntlers': 'A magnificent branching rack grown and carried as both weapon and display, impressive even after its owner has left it behind.',
    'Elk Antlers': 'A magnificent branching rack grown and carried as both weapon and display, impressive even after its owner has left it behind.',
    'AlphaWolfFang': 'A formidable canine taken from a dominant predator, bearing the wear of countless hunts and challenges survived.',
    'Alpha Wolf Fang': 'A formidable canine taken from a dominant predator, bearing the wear of countless hunts and challenges survived.',
    'HeartwoodCore': 'The dense inner heart of an ancient tree, hardened through years of growth into timber of exceptional strength and character.',
    'Heartwood Core': 'The dense inner heart of an ancient tree, hardened through years of growth into timber of exceptional strength and character.',

    // ── ⛏️ Mining Items ──
    'Coal': 'A dark carbon-rich fuel formed under immense pressure, dirty to handle but invaluable whenever raw heat is needed.',
    'Copper': 'A warm-colored metal valued for its conductivity, workability, and habit of appearing wherever civilization begins building something complicated.',
    'Flint': 'A hard stone that fractures into razor-sharp edges and throws sparks when struck, making it useful long before metal tools existed.',
    'Clay': 'Soft earth when wet, solid material when fired—the humble foundation of everything from pottery to construction.',
    'Aluminum': 'A lightweight metal that resists corrosion remarkably well, making strength feel far less burdensome to carry.',
    'SaltCrystal': 'A translucent mineral cube formed from concentrated deposits, simple in composition yet essential in more ways than its appearance suggests.',
    'Salt Crystal': 'A translucent mineral cube formed from concentrated deposits, simple in composition yet essential in more ways than its appearance suggests.',
    'Tin': 'A soft, silvery metal rarely celebrated alone but remarkably good at improving the usefulness of other materials.',
    'Iron': 'Heavy, dependable, and foundational, this metal has built tools, weapons, machines, and entire ages of human industry.',
    'Neodymium': 'An unassuming rare-earth metal best known for helping create magnets powerful enough to seem disproportionate to their size.',
    'Obsidian': 'Volcanic glass born when molten rock cools almost instantly, forming glossy black surfaces capable of producing frighteningly sharp edges.',
    'Silver': 'A brilliant precious metal prized for beauty, conductivity, and a long history of turning wealth into something you can hold.',
    'Quartz': 'A crystalline mineral found in countless forms, its geometric clarity hiding surprisingly useful electrical properties.',
    'Gold': 'Dense, gleaming, and famously reluctant to corrode, this metal has persuaded civilizations to dig holes in the ground for thousands of years.',
    'Ruby': 'A deep red gemstone whose intense color comes from tiny traces of chromium locked inside an exceptionally hard crystal.',
    'Sapphire': 'A durable gemstone most famous for rich blue tones, though its crystalline structure is tougher than its elegance suggests.',
    'Emerald': 'A vivid green jewel treasured for its color and character, with natural imperfections that often make each stone unmistakably individual.',
    'Lithium': 'An exceptionally light metal with an outsized importance wherever compact energy storage becomes valuable.',
    'Tungsten': 'Incredibly dense and resistant to heat, this stubborn metal thrives in conditions that would make many others soften or fail.',
    'Petroleum': 'Thick, dark hydrocarbons trapped underground for ages, unpleasant in raw form but enormously valuable once refined.',
    'TitaniumOre': 'Mineral-bearing rock containing the ingredients for one of engineering\'s favorite combinations: impressive strength without excessive weight.',
    'Titanium Ore': 'Mineral-bearing rock containing the ingredients for one of engineering\'s favorite combinations: impressive strength without excessive weight.',
    'Iridium': 'A dense, corrosion-resistant metal so scarce that discovering a worthwhile deposit feels almost statistically impolite.',
    'Diamond': 'Carbon arranged with extraordinary precision into a crystal famous equally for brilliance, hardness, and its ability to make people irrationally excited.',
    'Cobalt': 'A hard metallic element with a distinctive history in pigments and modern alloys, valuable wherever durability meets advanced engineering.',
    'MeteoriteFragment': 'A scorched piece of material that began its journey beyond the world, survived atmospheric fire, and ended up beneath your feet.',
    'Meteorite Fragment': 'A scorched piece of material that began its journey beyond the world, survived atmospheric fire, and ended up beneath your feet.',
    'AncientCoinCache': 'A concealed collection of old currency packed away by someone who clearly expected to return for it—and apparently never did.',
    'Ancient Coin Cache': 'A concealed collection of old currency packed away by someone who clearly expected to return for it—and apparently never did.',
    'Alexandrite': 'An exceptionally rare gemstone famous for appearing to shift color as the surrounding light changes, almost as though it cannot settle on one identity.',
    'Uranium': 'A remarkably heavy radioactive element carrying enormous energy inside an otherwise unimpressive-looking chunk of mineral.',
    'Platinum': 'Dense, pale, and exceptionally resistant to corrosion, this precious metal wears rarity with a quiet confidence.',
    'FossilizedDragonScale': 'A stone-hardened scale attributed to a creature that should belong to legend, raising uncomfortable questions about just how fictional those legends really are.',
    'Fossilized Dragon Scale': 'A stone-hardened scale attributed to a creature that should belong to legend, raising uncomfortable questions about just how fictional those legends really are.',

    // ── 🌱 Farm Crops & Produce ──
    'Blueberry': 'A tiny indigo fruit from a remarkably productive plant, with a habit of occasionally turning an ordinary harvest into a pleasant surprise.',
    'Golden Wheat': 'Sunlit grain with an almost metallic glow, valued not merely as a crop but as a harvest that translates remarkably well into profit.',
    'GoldenWheat': 'Sunlit grain with an almost metallic glow, valued not merely as a crop but as a harvest that translates remarkably well into profit.',
    'Melon': 'A heavy, water-rich fruit whose refreshing flesh makes it the farm\'s natural answer to running dry.',
    'Coffee': 'Fragrant beans carrying the agricultural equivalent of urgency, prized whenever waiting around starts feeling unacceptable.',
    'Pumpkin': 'A broad orange field pumpkin with dense, earthy flesh—a dependable harvest valued for its steady, straightforward yield.',
    'Strawberry': 'Bright red, sweet, and delicate, this cultivated fruit somehow finds itself just as useful in progression as it is tempting to eat.',
    'Kiwi': 'Rough and understated outside, brilliantly green within—a compact fruit that rewards anyone willing to look past appearances.',
    'Mango': 'A fragrant tropical fruit packed with golden flesh, bringing a taste of warmer climates into increasingly demanding upgrades.',
    'Coconut': 'Nature\'s heavily armored refreshment, combining fibrous husk, hard shell, edible flesh, and remarkable structural stubbornness in one package.',

    // ── 🛠️ Tool Upgrade & Crafted Components ──
    'ThickRope': 'Heavy braided cord built for serious loads, where ordinary string would fail quickly and embarrassingly.',
    'Thick Rope': 'Heavy braided cord built for serious loads, where ordinary string would fail quickly and embarrassingly.',
    'LightSuede': 'Supple treated leather balancing flexibility with durability, ideal wherever rigid material would restrict movement.',
    'Light Suede': 'Supple treated leather balancing flexibility with durability, ideal wherever rigid material would restrict movement.',
    'ReinforcedChain': 'Interlocking metal links strengthened beyond ordinary chainwork, designed to endure repeated strain without becoming the weakest part of the assembly.',
    'Reinforced Chain': 'Interlocking metal links strengthened beyond ordinary chainwork, designed to endure repeated strain without becoming the weakest part of the assembly.',
    'ToughRawhide': 'Thick, minimally processed hide with exceptional tensile strength, favored when elegance matters considerably less than refusing to tear.',
    'Tough Rawhide': 'Thick, minimally processed hide with exceptional tensile strength, favored when elegance matters considerably less than refusing to tear.',
    'DiamondTether': 'An elite restraint incorporating diamond-grade reinforcement, engineered for situations where "strong enough" is no longer an acceptable standard.',
    'Diamond Tether': 'An elite restraint incorporating diamond-grade reinforcement, engineered for situations where "strong enough" is no longer an acceptable standard.',
    'TreatedHull': 'A protective shell strengthened against wear and exposure, extending the life of equipment expected to endure increasingly hostile conditions.',
    'Treated Hull': 'A protective shell strengthened against wear and exposure, extending the life of equipment expected to endure increasingly hostile conditions.',
    'ReinforcedHull': 'A heavily upgraded outer structure built to absorb punishment that would reduce lesser equipment to scattered components.',
    'Reinforced Hull': 'A heavily upgraded outer structure built to absorb punishment that would reduce lesser equipment to scattered components.',
    'SteelBeam': 'A rigid structural member designed to carry enormous loads, bringing industrial-scale strength into advanced equipment construction.',
    'Steel Beam': 'A rigid structural member designed to carry enormous loads, bringing industrial-scale strength into advanced equipment construction.',
    'Thermite': 'A fiercely reactive mixture capable of producing extraordinary heat, useful when ordinary fire simply lacks ambition.',
    'LuckyCharm': 'A small token carried into the most demanding upgrades, because at the highest levels even excellent engineering appreciates a little unreasonable fortune.',
    'Lucky Charm': 'A small token carried into the most demanding upgrades, because at the highest levels even excellent engineering appreciates a little unreasonable fortune.',

    // ── 🧪 24 Loot Boosters (Creative Out-of-the-Box Descriptions) ──
    // Mining Boosters
    'Prospector Kit': 'A compact kit equipped with specialized sonars and geo-hammers that convince the earth to yield double the ore for a brief period.',
    'Ore Scanner': 'A high-frequency scanner that paints underground mineral veins in glowing neon, making rich deposits practically beg to be extracted.',
    'Extraction Module': 'An automated sub-processor that supercharges your mining rhythm, turning ordinary rock splitting into an art form.',
    'Yield Amplifier': 'A resonance generator that sends acoustic shocks through bedrock, forcing rare gems to dislodge in double quantities.',
    'Industrial Drillhead': 'A diamond-tipped industrial monster head that chews through granite like soft butter, multiplying your haul fourfold.',
    'Core Extractor': 'A deep-crust extractor built for legendary excavators, drawing ancient planetary veins straight into your haul bag.',

    // Exploration Boosters
    'Survey Pack': 'A lightweight expedition bag containing hyper-calibrated compasses and terrain maps that double your discovery efficiency.',
    'Route Scanner': 'An aerial drone relay that maps hidden trails through dense wilderness, ensuring no curiosity escapes ungathered.',
    'Recon Module': 'A tactical field computer that analyzes environmental signals in real time, guiding you directly to rare surface anomalies.',
    'Discovery Relay': 'A satellite uplink module that broadcasts regional exploration data, turning routine walks into lucrative treasure hunts.',
    'Expedition Console': 'A rugged master console that coordinates wide-range expeditions, amplifying your find rate across every biome.',
    'Survey Command Unit': 'An orbital-grade survey command rig that decodes the secrets of the landscape, delivering legendary exploration yields.',

    // Fishing Boosters
    'Tackle Kit': 'A set of scented lures and conductive lines that make surrounding fish forget basic survival instincts for 15 minutes.',
    'Bite Monitor': 'A hydro-acoustic sensor array that detects underwater movement milliseconds before a strike, doubling your catch speed.',
    'Catch Module': 'A submerged magnetic mesh that attracts schools of marine life toward your hook with irresistible gentle force.',
    'Haul Amplifier': 'A winching system engineered for deep sea pressure, pulling up double catches from depths others dare not touch.',
    'Deepwater Rig': 'A heavy-duty oceanic rig designed for abyssal trenches, bringing up colossal deep-water leviathans in pairs.',
    'Catch Processor': 'An automated shipboard processing station that turns every cast into a masterclass of oceanic bounty.',

    // Hunting Boosters
    'Tracker Kit': 'Pheromone trail markers and silent footwear that make wilderness tracking feel like following a glowing path.',
    'Trail Sensor': 'A network of thermal motion sensors that alert you to game movement long before your quarry knows you are nearby.',
    'Target Module': 'A optical rangefinder system that calculates precise trajectory angles, ensuring every hunt yields double the prize.',
    'Harvest Relay': 'A field communications relay that coordinates hunting sweeps across vast territories with clockwork precision.',
    'Field Processor': 'A portable preservation unit that cleans and prepares trophies on the spot, doubling your wilderness yield.',
    'Tracking Command Unit': 'An apex predator command suite that turns you into the undisputed master of the hunt across all lands.'
};

for (const [itemName, material] of Object.entries(FARM_UPGRADE_MATERIALS)) {
    ITEM_DESCRIPTIONS[itemName] = material.description;
}

/**
 * Gets description for an item by raw or display name.
 * @param {string} name 
 * @returns {string} Description text
 */
function getItemDescription(name) {
    if (!name) return 'An item of unknown origin.';
    const trimmed = name.trim();
    if (ITEM_DESCRIPTIONS[trimmed]) return ITEM_DESCRIPTIONS[trimmed];
    
    // Try spaced or unspaced variants
    const unspaced = trimmed.replace(/\s+/g, '');
    if (ITEM_DESCRIPTIONS[unspaced]) return ITEM_DESCRIPTIONS[unspaced];

    return 'An item gathered or crafted within Bconomy.';
}

module.exports = {
    ITEM_DESCRIPTIONS,
    getItemDescription
};
