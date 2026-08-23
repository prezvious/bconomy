// Constants & Utilities
import { getStoredSettings } from './preferences.js';

export const ACTIONS = [
    { id: 'mine', name: 'Mine', icon: 'lucide:pickaxe' },
    { id: 'explore', name: 'Explore', icon: 'lucide:compass' },
    { id: 'hunt', name: 'Hunt', icon: 'lucide:crosshair' },
    { id: 'fish', name: 'Fish', icon: 'lucide:fish' },
    { id: 'work', name: 'Work', icon: 'lucide:briefcase' }
];

export const TOOLS = ['mine', 'explore', 'hunt', 'fish'];
export const THEME_KEY = 'bconomy_theme';

export const SVG_ICONS = {
    'shield-plus': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 9v6"/><path d="M9 12h6"/>',
    'shield-half': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 22V2"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    'pickaxe': '<path d="M14.531 4.268a18.046 18.046 0 0 1 4.7 4.7"/><path d="M18.7 8.4a2 2 0 0 1 0 2.8l-1.4 1.4-2.8-2.8 1.4-1.4a2 2 0 0 1 2.8 0Z"/><path d="m14.5 9.8-8.7 8.7a2 2 0 0 0 2.8 2.8l8.7-8.7"/><path d="M21.1 5.4A17.9 17.9 0 0 0 5.4 21.1"/>',
    'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    'fish': '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 4.5c-1 1.5-1 5 .23 7.5-1.23 2.5-1.23 6-.23 7.5C5.58 18.03 7 16 7 13.33v-2.66Z"/><circle cx="10.5" cy="9.5" r="1"/>',
    'briefcase': '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    'sprout': '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'dices': '<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.41 2.41 0 0 0 0-3.41l-4.5-4.5a2.41 2.41 0 0 0-3.41 0L10 6.08"/><path d="M6 14h.01"/><path d="M10 18h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>',
    'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    'crown': '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    'edit-3': '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'arrow-down-to-dot': '<path d="M12 2v14"/><path d="m19 9-7 7-7-7"/><circle cx="12" cy="21" r="1"/>',
    'power-off': '<path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/><path d="M12 2v4"/><path d="m2 2 20 20"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'activity': '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>',
    'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
    'coins': '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    'feather': '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
    'beef': '<circle cx="12.5" cy="8.5" r="2.5"/><path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z"/>',
    'bone': '<path d="M17 10c.7-.7 1.69-1 2.5-1a2.5 2.5 0 1 1 0 5c-.28 0-.56-.04-.81-.11L6.11 19.31c.07.25.11.53.11.81a2.5 2.5 0 1 1-5 0c0-.81.3-1.8 1-2.5l7.78-7.78c-.07-.25-.11-.53-.11-.81a2.5 2.5 0 1 1 5 0c0 .81-.3 1.8-1 2.5L17 10z"/>',
    'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    'pin': '<line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
    'pin-off': '<line x1="2" x2="22" y1="2" y2="22"/><line x1="12" x2="12" y1="17" y2="22"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h12"/><path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'unlock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
};

export const iconHtml = (name, className = '') => {
    const key = (name || '').replace(/^lucide:/, '');
    if (SVG_ICONS[key]) {
        return `<svg class="app-svg-icon ${className}" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG_ICONS[key]}</svg>`;
    }
    return `<iconify-icon icon="${name}" class="${className}" aria-hidden="true"></iconify-icon>`;
};

export const BOOSTER_TIERS = {
    T1: { name: 'Tier 1', durationMs: 15 * 60 * 1000, label: '15m' },
    T2: { name: 'Tier 2', durationMs: 30 * 60 * 1000, label: '30m' },
    T3: { name: 'Tier 3', durationMs: 60 * 60 * 1000, label: '1h' },
    T4: { name: 'Tier 4', durationMs: 120 * 60 * 1000, label: '2h' },
    T5: { name: 'Tier 5', durationMs: 240 * 60 * 1000, label: '4h' },
    T6: { name: 'Tier 6', durationMs: 480 * 60 * 1000, label: '8h' }
};

export const BOOSTER_NAMES = [
    'Prospector Kit', 'Ore Scanner', 'Extraction Module', 'Yield Amplifier', 'Industrial Drillhead', 'Core Extractor',
    'Survey Pack', 'Route Scanner', 'Recon Module', 'Discovery Relay', 'Expedition Console', 'Survey Command Unit',
    'Tackle Kit', 'Bite Monitor', 'Catch Module', 'Haul Amplifier', 'Deepwater Rig', 'Catch Processor',
    'Tracker Kit', 'Trail Sensor', 'Target Module', 'Harvest Relay', 'Field Processor', 'Tracking Command Unit'
];

export const BOOSTER_NAME_MAP = {
    mine: { T1: 'Prospector Kit', T2: 'Ore Scanner', T3: 'Extraction Module', T4: 'Yield Amplifier', T5: 'Industrial Drillhead', T6: 'Core Extractor' },
    explore: { T1: 'Survey Pack', T2: 'Route Scanner', T3: 'Recon Module', T4: 'Discovery Relay', T5: 'Expedition Console', T6: 'Survey Command Unit' },
    fish: { T1: 'Tackle Kit', T2: 'Bite Monitor', T3: 'Catch Module', T4: 'Haul Amplifier', T5: 'Deepwater Rig', T6: 'Catch Processor' },
    hunt: { T1: 'Tracker Kit', T2: 'Trail Sensor', T3: 'Target Module', T4: 'Harvest Relay', T5: 'Field Processor', T6: 'Tracking Command Unit' }
};

export const isBoosterItem = (itemName) => {
    if (!itemName) return false;
    const norm = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.includes('booster')) return true;
    return BOOSTER_NAMES.some(b => b.toLowerCase().replace(/[^a-z0-9]/g, '') === norm)
        || /^(mine|mining|explore|exploring|hunt|hunting|fish|fishing)t[1-6]$/.test(norm);
};

export const getBoosterConfig = (itemName) => {
    if (!itemName) return null;
    const norm = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [action, tiers] of Object.entries(BOOSTER_NAME_MAP)) {
        for (const [tier, bName] of Object.entries(tiers)) {
            if (bName.toLowerCase().replace(/[^a-z0-9]/g, '') === norm) {
                const tierInfo = BOOSTER_TIERS[tier] || {};
                return {
                    action,
                    tier,
                    durationMs: tierInfo.durationMs || 0,
                    label: tierInfo.label || ''
                };
            }
        }
    }

    const legacyMatch = norm.match(/^(mine|mining|explore|exploring|hunt|hunting|fish|fishing)(?:booster)?(t[1-6])$/);
    if (legacyMatch) {
        const actionAlias = legacyMatch[1];
        const action = actionAlias.startsWith('min') ? 'mine'
            : actionAlias.startsWith('explor') ? 'explore'
                : actionAlias.startsWith('hunt') ? 'hunt'
                    : 'fish';
        const tier = legacyMatch[2].toUpperCase();
        const tierInfo = BOOSTER_TIERS[tier] || {};
        return {
            action,
            tier,
            durationMs: tierInfo.durationMs || 0,
            label: tierInfo.label || ''
        };
    }
    return null;
};

const FARM_UPGRADE_ITEM_ICONS = {
    gravel: 'lucide:mountain',
    fencepost: 'lucide:columns-3',
    pavingstone: 'lucide:brick-wall',
    treatedboard: 'lucide:panels-top-left',
    granularfertilizer: 'lucide:sprout',
    irrigationtubing: 'lucide:route',
    galvanizedframe: 'lucide:frame',
    solarcell: 'lucide:solar-panel',
    frostblanket: 'lucide:snowflake',
    brassvalve: 'lucide:gauge',
    outdoorcable: 'lucide:cable',
    waterpump: 'lucide:circle-gauge'
};

export const getItemCategory = (itemName) => {
    if (!itemName) return 'default';
    if (isBoosterItem(itemName)) return 'booster';
    const normalized = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (FARM_UPGRADE_ITEM_ICONS[normalized]) return 'Farm Upgrade Material';
    const spaced = displayItemName(itemName).toLowerCase();

    if (/\b(fish|fishes|salmon|tuna|bass|trout|shrimp|shrimps|crab|crabs|lobster|lobsters|eel|eels|sardine|sardines|prawn|prawns|octopus|octopuses|squid|squids|blowfish|ray|rays|coelacanth|oyster|oysters|clamshell|clamshells|bottle|coral|seaweed|algae|jellyfish|greatwhite|great white|pearl)\b/.test(spaced)) return 'fish';
    if (/\b(meat|meats|steak|steaks|beef)\b/.test(spaced)) return 'meat';
    if (/\b(ore|ores|coal|iron|gold|silver|copper|gem|gems|diamond|diamonds|ruby|rubies|emerald|emeralds|sapphire|sapphires|alexandrite|stone|stones|rock|rocks|crystal|crystals|quartz|titanium|uranium|platinum|cobalt|lithium|aluminum|tin|flint|obsidian|neodymium|iridium|tungsten|petroleum|clay|meteorite|scale)\b/.test(spaced)) return 'ore';
    if (/\b(wood|woods|log|logs|plank|planks|leaf|leaves|herb|herbs|flower|flowers|mushroom|mushrooms|berry|berries|fruit|fruits|seed|seeds|wheat|dandelion|weeds|pinecone|pinecones|chestnut|chestnuts|sunflower|sunflowers|blueberry|strawberry|melon|kiwi|mango|pumpkin|coconut|coffee|truffle|heartwood)\b/.test(spaced)) return 'wood';
    if (/\b(coin|coins|cash|gold bar|bar|bars|money|treasure|crown|necklace|cache)\b/.test(spaced)) return 'coin';
    if (/\b(feather|feathers|pelt|pelts|hide|hides|bone|bones|fur|furs|horn|horns|antler|antlers|fang|fangs|tusk|tusks|leather|rawhide|suede|tether|rope|chain|hull|beam|thermite|charm|nail|wire|can|metal|disk|card|drive|knife|boot|urn|fossil|junk|wool|resin|bulb|lightbulb|tire|circuit|shard|manuscript|butt|pack|firesac|frostsac|honeycomb|milk|nest|foot)\b/.test(spaced)) return 'material';

    return 'default';
};

export const getItemIcon = (itemName) => {
    if (!itemName) return 'lucide:package';
    const norm = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (FARM_UPGRADE_ITEM_ICONS[norm]) return FARM_UPGRADE_ITEM_ICONS[norm];

    // Specific item overrides for crisp visual representation
    if (norm.includes('alexandrite') || norm.includes('ruby') || norm.includes('sapphire') || norm.includes('emerald') || norm.includes('diamond') || norm.includes('crystal') || norm.includes('quartz') || norm.includes('gem')) return 'lucide:gem';
    if (norm.includes('feather')) return 'lucide:feather';
    if (norm.includes('bone') || norm.includes('fossil')) return 'lucide:bone';
    if (norm.includes('pelt') || norm.includes('hide') || norm.includes('fur') || norm.includes('rawhide') || norm.includes('suede') || norm.includes('wool')) return 'lucide:layers';
    if (norm.includes('horn') || norm.includes('antler') || norm.includes('tusk') || norm.includes('crown') || norm.includes('necklace')) return 'lucide:crown';
    if (norm.includes('steak') || norm.includes('meat')) return 'lucide:beef';
    if (norm.includes('milk')) return 'lucide:milk';
    if (norm.includes('honeycomb')) return 'lucide:hexagon';
    if (norm.includes('firesac')) return 'lucide:flame';
    if (norm.includes('frostsac')) return 'lucide:snowflake';
    if (norm.includes('mushroom') || norm.includes('truffle')) return 'lucide:sprout';
    if (norm.includes('apple') || norm.includes('berry') || norm.includes('berries') || norm.includes('fruit')) return 'lucide:apple';
    if (norm.includes('seed')) return 'lucide:seedling';
    if (norm.includes('wheat') || norm.includes('dandelion') || norm.includes('weed')) return 'lucide:wheat';
    if (norm.includes('bottle')) return 'lucide:flask-conical';
    if (norm.includes('can') || norm.includes('nail') || norm.includes('wire') || norm.includes('scrap') || norm.includes('bulb')) return 'lucide:wrench';
    if (norm.includes('disk') || norm.includes('card') || norm.includes('drive') || norm.includes('circuit')) return 'lucide:cpu';
    if (norm.includes('knife')) return 'lucide:scissors';
    if (norm.includes('boot')) return 'lucide:footprints';
    if (norm.includes('seaweed') || norm.includes('algae')) return 'lucide:sprout';
    if (norm.includes('squid') || norm.includes('jellyfish') || norm.includes('shark') || norm.includes('greatwhite') || norm.includes('octopus') || norm.includes('fish') || norm.includes('eel') || norm.includes('crab') || norm.includes('lobster') || norm.includes('prawn') || norm.includes('oyster') || norm.includes('clam')) return 'lucide:fish';
    if (norm.includes('coin') || norm.includes('treasure') || norm.includes('cache') || norm.includes('pearl')) return 'lucide:coins';
    if (norm.includes('manuscript') || norm.includes('scroll')) return 'lucide:scroll';
    if (norm.includes('foot') || norm.includes('fang') || norm.includes('nest')) return 'lucide:paw-print';

    const cat = getItemCategory(itemName);
    switch (cat) {
        case 'booster': return 'lucide:zap';
        case 'fish': return 'lucide:fish';
        case 'meat': return 'lucide:beef';
        case 'ore': return 'lucide:gem';
        case 'wood': return 'lucide:leaf';
        case 'coin': return 'lucide:coins';
        case 'material': return 'lucide:package';
        default: return 'lucide:package';
    }
};

const VALUE_NAME_UNITS = [
    { value: 1e3, name: 'thousand' },
    { value: 1e6, name: 'million' },
    { value: 1e9, name: 'billion' },
    { value: 1e12, name: 'trillion' },
    { value: 1e15, name: 'quadrillion' },
    { value: 1e18, name: 'quintillion' },
    { value: 1e21, name: 'sextillion' },
    { value: 1e24, name: 'septillion' }
];

const normalizeDisplayNumber = (value) => {
    if (value === Infinity) return Infinity;
    if (value === -Infinity) return -Infinity;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatNumberCommas = (value) => {
    const number = normalizeDisplayNumber(value);
    if (number === Infinity) return '∞';
    if (number === -Infinity) return '-∞';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(number);
};

export const formatExactNumber = formatNumberCommas;

const formatNamedMagnitude = (value) => {
    const number = normalizeDisplayNumber(value);
    if (!Number.isFinite(number)) return formatNumberCommas(number);

    const absolute = Math.abs(number);
    if (absolute < 1e3) return formatNumberCommas(number);

    let unitIndex = VALUE_NAME_UNITS.findLastIndex(unit => absolute >= unit.value);
    unitIndex = Math.max(0, unitIndex);
    let unit = VALUE_NAME_UNITS[unitIndex];
    let scaled = absolute / unit.value;

    if (unitIndex < VALUE_NAME_UNITS.length - 1 && Number(scaled.toFixed(2)) >= 1000) {
        unit = VALUE_NAME_UNITS[unitIndex + 1];
        scaled = absolute / unit.value;
    }

    return `${number < 0 ? '-' : ''}${scaled.toFixed(2)} ${unit.name}`;
};

export const formatDisplayNumber = (value, { numberDisplay } = {}) => {
    const mode = numberDisplay || getStoredSettings().numberDisplay;
    return mode === 'named' ? formatNamedMagnitude(value) : formatNumberCommas(value);
};

// Backward-compatible display alias. Exact editable values must use formatNumberCommas.
export const formatNumber = formatDisplayNumber;

export const formatMoney = (amount, { numberDisplay } = {}) => {
    const number = normalizeDisplayNumber(amount);
    if (!Number.isFinite(number)) return `${number < 0 ? '-' : ''}$∞`;
    const mode = numberDisplay || getStoredSettings().numberDisplay;
    if (mode === 'named' && Math.abs(number) >= 1e3) {
        const named = formatNamedMagnitude(Math.abs(number));
        return `${number < 0 ? '-' : ''}$${named}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(number);
};

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const formatDurationMs = (ms, options = {}) => {
    const zeroText = options.zeroText !== undefined ? options.zeroText : 'Expired';
    if (ms === undefined || ms === null || isNaN(ms) || ms <= 0) return zeroText;
    const totalSecs = Math.ceil(ms / 1000);
    const settings = typeof getStoredSettings === 'function' ? getStoredSettings() : {};
    const mode = options.durationFormat || (options.settings && options.settings.durationFormat) || settings.durationFormat || 'adaptive';

    if (mode === 'hours') {
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    }

    if (mode === 'days-hours') {
        const SECS_PER_DAY = 86400;
        const days = Math.floor(totalSecs / SECS_PER_DAY);
        const remSecs = totalSecs % SECS_PER_DAY;
        const hrs = Math.floor(remSecs / 3600);
        const mins = Math.floor((remSecs % 3600) / 60);
        const secs = remSecs % 60;
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hrs > 0) parts.push(`${hrs}h`);
        if (mins > 0) parts.push(`${mins}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
        return parts.join(' ');
    }

    let rem = totalSecs;
    const SECS_PER_YEAR = 365 * 86400;
    const SECS_PER_MONTH = 30 * 86400;
    const SECS_PER_WEEK = 7 * 86400;
    const SECS_PER_DAY = 86400;
    const SECS_PER_HOUR = 3600;
    const SECS_PER_MIN = 60;

    const years = Math.floor(rem / SECS_PER_YEAR);
    rem %= SECS_PER_YEAR;

    const months = Math.floor(rem / SECS_PER_MONTH);
    rem %= SECS_PER_MONTH;

    const weeks = Math.floor(rem / SECS_PER_WEEK);
    rem %= SECS_PER_WEEK;

    const days = Math.floor(rem / SECS_PER_DAY);
    rem %= SECS_PER_DAY;

    const hours = Math.floor(rem / SECS_PER_HOUR);
    rem %= SECS_PER_HOUR;

    const minutes = Math.floor(rem / SECS_PER_MIN);
    const seconds = rem % SECS_PER_MIN;

    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    if (mode === 'full') {
        return parts.join(' ');
    }

    if (mode === 'adaptive-2') {
        return parts.slice(0, 2).join(' ');
    }

    // Adaptive mode: show top 2-3 most significant units (default 3)
    const maxUnits = options.maxUnits || 3;
    return parts.slice(0, maxUnits).join(' ');
};

export const formatTimestampDate = (timestamp, options = {}) => {
    if (!timestamp || isNaN(timestamp) || timestamp <= 0) return 'Inactive';
    const settings = typeof getStoredSettings === 'function' ? getStoredSettings() : {};
    const dateFormat = options.timerDateFormat || options.dateFormat || settings.timerDateFormat || 'dd/mm/yyyy';
    const timeFormat = options.timerTimeFormat || options.timeFormat || settings.timerTimeFormat || '24h';
    const timezone = options.timerTimezone || options.timezone || settings.timerTimezone || 'local';

    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const isUTC = timezone === 'utc';
    const rawYear = isUTC ? d.getUTCFullYear() : d.getFullYear();
    const rawMonth = isUTC ? d.getUTCMonth() : d.getMonth();
    const rawDate = isUTC ? d.getUTCDate() : d.getDate();
    const rawDay = isUTC ? d.getUTCDay() : d.getDay();
    let rawHours = isUTC ? d.getUTCHours() : d.getHours();
    const rawMinutes = isUTC ? d.getUTCMinutes() : d.getMinutes();
    const rawSeconds = isUTC ? d.getUTCSeconds() : d.getSeconds();

    const day = String(rawDate).padStart(2, '0');
    const month = String(rawMonth + 1).padStart(2, '0');
    const year = rawYear;
    const monthShort = MONTH_NAMES_SHORT[rawMonth] || '';
    const monthFull = MONTH_NAMES_FULL[rawMonth] || '';
    const dayShort = DAY_NAMES_SHORT[rawDay] || '';

    let datePart = `${day}/${month}/${year}`;
    if (dateFormat === 'dd-mm-yyyy') {
        datePart = `${day}-${month}-${year}`;
    } else if (dateFormat === 'dd.mm.yyyy') {
        datePart = `${day}.${month}.${year}`;
    } else if (dateFormat === 'yyyy-mm-dd') {
        datePart = `${year}-${month}-${day}`;
    } else if (dateFormat === 'yyyy/mm/dd') {
        datePart = `${year}/${month}/${day}`;
    } else if (dateFormat === 'mm/dd/yyyy') {
        datePart = `${month}/${day}/${year}`;
    } else if (dateFormat === 'd-mmm-yyyy') {
        datePart = `${rawDate} ${monthShort} ${year}`;
    } else if (dateFormat === 'mmm-d-yyyy') {
        datePart = `${monthShort} ${rawDate}, ${year}`;
    } else if (dateFormat === 'full-date') {
        datePart = `${dayShort}, ${rawDate} ${monthFull} ${year}`;
    }

    if (timeFormat === 'none') {
        return isUTC ? `${datePart} (UTC)` : datePart;
    }

    const minutes = String(rawMinutes).padStart(2, '0');
    const seconds = String(rawSeconds).padStart(2, '0');

    let timePart = '';
    if (timeFormat === '12h') {
        const ampm = rawHours >= 12 ? 'PM' : 'AM';
        const h12 = rawHours % 12 || 12;
        timePart = `${String(h12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    } else if (timeFormat === '12h-short') {
        const ampm = rawHours >= 12 ? 'PM' : 'AM';
        const h12 = rawHours % 12 || 12;
        timePart = `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
    } else if (timeFormat === '24h-short') {
        timePart = `${String(rawHours).padStart(2, '0')}:${minutes}`;
    } else {
        // default 24h
        timePart = `${String(rawHours).padStart(2, '0')}:${minutes}:${seconds}`;
    }

    const result = `${datePart} ${timePart}`;
    return isUTC ? `${result} UTC` : result;
};

export const calculateActiveBoosterMultiplier = (activeUntilForAction, now = Date.now()) => {
    if (!activeUntilForAction) return { multiplier: 1, activeCount: 0, activeTiers: [] };
    const activeTiers = [];
    for (const tier of Object.keys(BOOSTER_TIERS)) {
        if ((activeUntilForAction[tier] || 0) > now) {
            activeTiers.push(tier);
        }
    }
    const activeCount = activeTiers.length;
    return {
        multiplier: Math.pow(2, activeCount),
        activeCount,
        activeTiers
    };
};

export const displayItemName = (name) => {
    if (!name) return '';
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
};

export const SOCKET_MODULE_DEFINITIONS = {
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
        description: 'Reduces action cooldown by an additional 12 seconds.',
        effect: { cooldownReduction: 12 },
        recipe: [ { item: 'Bismuth', quantity: 200 }, { item: 'LaserDiode', quantity: 50 }, { item: 'TungstenFilament', quantity: 30 } ]
    },
    'chrono_3': {
        id: 'chrono_3',
        name: 'Chrono Resonator III',
        family: 'chrono',
        tier: 3,
        description: 'Reduces action cooldown by an additional 25 seconds.',
        effect: { cooldownReduction: 25 },
        recipe: [ { item: 'Aerogel', quantity: 50 }, { item: 'QuantumCore', quantity: 5 }, { item: 'RadioisotopeCell', quantity: 10 } ]
    },
    'serendipity_1': {
        id: 'serendipity_1',
        name: 'Serendipity Matrix I',
        family: 'serendipity',
        tier: 1,
        description: '+10% chance for an action to consume zero cooldown time.',
        effect: { serendipityBonus: 0.10 },
        recipe: [ { item: 'Amber', quantity: 200 }, { item: 'FourLeafClover', quantity: 50 }, { item: 'LuckyHorseshoe', quantity: 10 } ]
    },
    'serendipity_2': {
        id: 'serendipity_2',
        name: 'Serendipity Matrix II',
        family: 'serendipity',
        tier: 2,
        description: '+20% chance for an action to consume zero cooldown time.',
        effect: { serendipityBonus: 0.20 },
        recipe: [ { item: 'Topaz', quantity: 150 }, { item: 'DragonflyWing', quantity: 40 }, { item: 'GoldenScarab', quantity: 5 } ]
    },
    'serendipity_3': {
        id: 'serendipity_3',
        name: 'Serendipity Matrix III',
        family: 'serendipity',
        tier: 3,
        description: '+35% chance for an action to consume zero cooldown time.',
        effect: { serendipityBonus: 0.35 },
        recipe: [ { item: 'StarRuby', quantity: 20 }, { item: 'RainbowOpal', quantity: 10 }, { item: 'PhoenixPlume', quantity: 2 } ]
    }
};
