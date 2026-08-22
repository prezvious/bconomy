/**
 * UI Surfaces Automated Integration Test (Pure Node.js)
 * Verifies that all redesigned UI surfaces (Inventory, Shop, Faction)
 * generate expected markup, metrics, and cards under various game states.
 */
import assert from 'assert';

class MockElement {
    constructor(tagName, id = '', className = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.classList = {
            _classes: new Set(),
            add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
            contains: (cls) => this.classList._classes.has(cls),
            toggle: (cls, force) => {
                if (force === undefined) {
                    if (this.classList._classes.has(cls)) this.classList._classes.delete(cls);
                    else this.classList._classes.add(cls);
                } else if (force) {
                    this.classList._classes.add(cls);
                } else {
                    this.classList._classes.delete(cls);
                }
            }
        };
        this.children = [];
        this.style = {};
        this._innerHTML = '';
        this._textContent = '';
        this.dataset = {};
        this.attributes = {};
        this._listeners = {};
        if (className) {
            className.split(' ').filter(Boolean).forEach(c => this.classList._classes.add(c));
        }
    }

    get innerHTML() {
        return this._innerHTML;
    }

    set innerHTML(val) {
        this._innerHTML = String(val || '');
    }

    get textContent() {
        return this._textContent || this._innerHTML.replace(/<[^>]+>/g, '');
    }

    set textContent(val) {
        this._textContent = String(val || '');
    }

    setAttribute(name, val) {
        this.attributes[name] = String(val);
    }

    getAttribute(name) {
        return this.attributes[name] || null;
    }

    addEventListener(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }

    click() {
        (this._listeners.click || []).forEach(listener => listener({
            type: 'click',
            currentTarget: this,
            target: this
        }));
    }

    querySelector(sel) {
        return new MockElement('div');
    }

    querySelectorAll(sel) {
        return [];
    }

    closest(sel) {
        return new MockElement('main', '', 'ledger-main');
    }

    appendChild(el) {
        this.children.push(el);
        return el;
    }
}

const mockStore = {};
global.localStorage = {
    getItem: (k) => mockStore[k] || null,
    setItem: (k, v) => { mockStore[k] = String(v); },
    removeItem: (k) => { delete mockStore[k]; },
    clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

const mockElements = {
    'player-cash': new MockElement('span', 'player-cash'),
    'player-rank': new MockElement('span', 'player-rank'),
    'player-prestige': new MockElement('span', 'player-prestige'),
    'inventory-type-count': new MockElement('strong', 'inventory-type-count'),
    'inventory-unit-count': new MockElement('strong', 'inventory-unit-count'),
    'inventory-stats-badge': new MockElement('div', 'inventory-stats-badge'),
    'inventory-search': new MockElement('input', 'inventory-search'),
    'inventory-grid': new MockElement('div', 'inventory-grid'),
    'inventory-empty': new MockElement('div', 'inventory-empty'),
    'panel-actions': new MockElement('section', 'panel-actions'),
    'actions-grid': new MockElement('div', 'actions-grid'),
    'panel-shop': new MockElement('section', 'panel-shop'),
    'panel-faction': new MockElement('section', 'panel-faction'),
    'farm-manage-modal': new MockElement('dialog', 'farm-manage-modal'),
    'farm-bulk-upgrade-preview-modal': new MockElement('dialog', 'farm-bulk-upgrade-preview-modal'),
    'confirmation-modal': new MockElement('div', 'confirmation-modal'),
    'bulk-actions-modal': new MockElement('div', 'bulk-actions-modal'),
    'bulk-preview-modal': new MockElement('div', 'bulk-preview-modal'),
    'bulk-mode-sell': new MockElement('button', 'bulk-mode-sell'),
    'bulk-mode-buy': new MockElement('button', 'bulk-mode-buy'),
    'btn-close-bulk-modal': new MockElement('button', 'btn-close-bulk-modal'),
    'btn-bulk-cancel': new MockElement('button', 'btn-bulk-cancel'),
    'btn-close-preview-modal': new MockElement('button', 'btn-close-preview-modal'),
    'btn-bulk-preview': new MockElement('button', 'btn-bulk-preview'),
    'btn-preview-back': new MockElement('button', 'btn-preview-back'),
    'btn-preview-confirm': new MockElement('button', 'btn-preview-confirm'),
    'targeted-rankup-modal': new MockElement('div', 'targeted-rankup-modal'),
    'item-details-modal': new MockElement('div', 'item-details-modal'),
    'create-faction-modal': new MockElement('dialog', 'create-faction-modal'),
    'edit-faction-modal': new MockElement('div', 'edit-faction-modal')
};

global.window = {
    addEventListener: () => {}
};

global.document = {
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => new MockElement(tag),
    querySelector: (sel) => new MockElement('div'),
    querySelectorAll: (sel) => [],
    addEventListener: () => {}
};

global.HTMLElement = MockElement;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

global.fetch = async (url) => {
    return {
        ok: true,
        status: 200,
        json: async () => ({
            success: true,
            state: getState(),
            shop: getState().shop
        })
    };
};

console.log('--- Starting UI Surfaces Integration Tests ---');

// 1. Test state initialization
const { setState, getState } = await import('../public/js/state.js');
setState({
    cash: 50000000,
    rankIndex: 5,
    prestigeCount: 1,
    inventory: {
        'Blueberry': 150,
        'OldBones': 45,
        'Mining Booster T1': 3
    },
    shop: {
        lastRestockAt: Date.now(),
        nextRestockAt: Date.now() + 300000,
        sellPrices: { 'Blueberry': 100, 'OldBones': 250 },
        buyListings: {
            'Blueberry': { available: true, stock: 50, buyPrice: 150 }
        },
        boosterListings: {
            'Mining Booster T1': { available: true, stock: Infinity, buyPrice: 5000, action: 'mine', tier: 'T1', durationMs: 900000 }
        }
    },
    faction: null
});

// 2. Test Inventory Surface
const { renderInventory } = await import('../public/js/ui/inventory.js');
renderInventory();

const statsBadge = document.getElementById('inventory-stats-badge');
assert(statsBadge, 'Inventory stats badge should exist');
assert(statsBadge.textContent.includes('3 Types'), `Stats badge should reflect 3 item types. Found: ${statsBadge.textContent}`);
assert(statsBadge.textContent.includes('198 Units'), `Stats badge should reflect 198 total units. Found: ${statsBadge.textContent}`);
assert(document.getElementById('inventory-grid').innerHTML.includes('<span class="item-qty" title="150">150</span>'), 'Inventory cards should render owned quantities without a multiplier suffix');
console.log('✓ Test 1 Passed: Inventory summary stats badge renders accurately (3 Types · 198 Units)');

// 3. Test Shop Surface
const { renderShop } = await import('../public/js/ui/shop.js');
await renderShop();
await renderShop();

const shopPanel = document.getElementById('panel-shop');
assert(shopPanel.innerHTML.includes('System Shop & Market'), 'Shop header should render');
assert(shopPanel.innerHTML.includes('btn-force-restock-shop'), 'Force restock button should render');
assert(shopPanel.innerHTML.includes('btn-open-bulk-actions'), 'Bulk actions button should render');
assert(shopPanel.innerHTML.includes('market-card'), 'Market cards should render for listings');
assert.strictEqual(document.getElementById('btn-bulk-preview')._listeners.click.length, 1, 'Persistent bulk preview control should only bind once across Shop rerenders');
assert.strictEqual(document.getElementById('bulk-mode-sell')._listeners.click.length, 1, 'Persistent bulk Sell tab should only bind once across Shop rerenders');
assert.strictEqual(document.getElementById('bulk-mode-sell')._listeners.keydown.length, 1, 'Persistent bulk Sell tab should only bind one keyboard handler');
console.log('✓ Test 2 Passed: Shop surface renders cleanly and persistent bulk controls remain single-bound');

// 4. Test Faction Unaffiliated View
const { renderFaction } = await import('../public/js/ui/faction.js');
renderFaction();

const factionPanel = document.getElementById('panel-faction');
assert(factionPanel.innerHTML.includes('faction-empty-state'), 'Unaffiliated faction page should render its focused empty state');
assert(factionPanel.innerHTML.includes('faction-benefit-grid'), 'Faction benefits should be summarized before creation');
assert(factionPanel.innerHTML.includes('btn-open-create-faction'), 'Create Faction action should open the dedicated dialog');
console.log('✓ Test 3 Passed: Unaffiliated Faction empty state and create-dialog action render cleanly');

// 5. Test Faction Affiliated View
setState({
    faction: {
        created: true,
        name: 'The Iron Syndicate',
        description: 'Masters of resource extraction',
        points: 2500000,
        lifetimeContributed: 5000000,
        boosts: {
            mine: { level: 4, multiplier: 2.0, activeUntil: Date.now() + 3600000, mode: 'duration', costPerHour: 1600000 },
            explore: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', costPerHour: 0 },
            hunt: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', costPerHour: 0 },
            fish: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', costPerHour: 0 },
            work: { level: 0, multiplier: 1.0, activeUntil: 0, mode: 'duration', costPerHour: 0 }
        }
    }
});
renderFaction();

assert(factionPanel.innerHTML.includes('The Iron Syndicate'), 'Active faction name should render in status banner');
assert(factionPanel.innerHTML.includes('faction-tab-overview'), 'Active faction should expose the Overview tab');
assert(factionPanel.innerHTML.includes('faction-tab-operations'), 'Active faction should expose the Operations tab');
assert(factionPanel.innerHTML.includes('faction-boost-card'), 'Active faction 5-action boost cards should render');
assert(factionPanel.innerHTML.includes('2.00× Active'), 'Mining active multiplier should reflect 2.00x');
console.log('✓ Test 4 Passed: Affiliated Faction guild status banner, treasury, and boost cards render accurately');

console.log('--- All UI Surfaces Integration Tests Passed Successfully! ---');
process.exit(0);
