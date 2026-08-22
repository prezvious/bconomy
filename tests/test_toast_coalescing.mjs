import assert from 'assert';

console.log('--- Running Advanced Toast Coalescing & Filter Tests ---');

class MockElement {
    constructor(tagName, id = '', className = '') {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this._className = '';
        this.classList = {
            _classes: new Set(),
            add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
            contains: (cls) => this.classList._classes.has(cls)
        };
        this.className = className;
        this.children = [];
        this.dataset = {};
        this._listeners = {};
    }

    get className() {
        return Array.from(this.classList._classes).join(' ');
    }

    set className(val) {
        this._className = val || '';
        this.classList._classes = new Set(this._className.split(' ').filter(Boolean));
    }

    get textContent() {
        if (this._textContent) return this._textContent;
        return this.children.map(c => c.textContent).join('');
    }

    set textContent(val) {
        this._textContent = String(val);
    }

    appendChild(child) {
        this.children.push(child);
        child.parentElement = this;
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        return child;
    }

    remove() {
        if (this.parentElement) {
            this.parentElement.removeChild(this);
        }
    }

    get parentNode() {
        return this.parentElement || null;
    }

    querySelector(selector) {
        if (selector === '.toast-count-pill') {
            return this.children.find(c => c.classList.contains('toast-count-pill')) || null;
        }
        if (selector === '.toast-msg-text') {
            return this.children.find(c => c.classList.contains('toast-msg-text')) || null;
        }
        return null;
    }

    querySelectorAll(selector) {
        if (selector === '.toast') {
            return this.children.filter(c => c.classList.contains('toast'));
        }
        return [];
    }

    addEventListener(event, fn, opts) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }
}

class MockDocument {
    constructor() {
        this.elements = {};
    }

    createElement(tagName) {
        return new MockElement(tagName);
    }

    getElementById(id) {
        return this.elements[id] || null;
    }
}

global.document = new MockDocument();

let mockStorage = {};
global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { mockStorage = {}; }
};

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.elements['toast-container'] = toastContainer;

const { showToast } = await import('../public/js/ui/toast.js');

// Test 1: Single toast creation
toastContainer.children = [];
const t1 = showToast('Upgraded Lucky Drops!', 'success');
assert.strictEqual(toastContainer.children.length, 1, 'Should have exactly 1 toast');
assert.strictEqual(t1.dataset.count, '1', 'Initial count should be 1');
console.log('✓ Test 1 Passed: Single toast created cleanly');

// Test 2: Rapid repeat calls adaptively coalesce with count badge
showToast('Upgraded Lucky Drops!', 'success');
showToast('Upgraded Lucky Drops!', 'success');
assert.strictEqual(toastContainer.children.length, 1, 'Should NOT create additional toast DOM nodes');
assert.strictEqual(t1.dataset.count, '3', 'Toast count should increment to 3');
const badge = t1.querySelector('.toast-count-pill');
assert(badge, 'Badge element should be created');
assert.strictEqual(badge.textContent, '3x', 'Badge text should display 3x');
assert(t1.classList.contains('toast-pulse'), 'Toast should have pulse animation class');
console.log('✓ Test 2 Passed: Repeated clicks coalesced into single toast with 3x badge & pulse');

// Test 3: Different message creates a separate toast
const t2 = showToast('Watered all farm plots!', 'success');
assert.strictEqual(toastContainer.children.length, 2, 'Different messages should produce separate toasts');
assert.strictEqual(t2.dataset.count, '1');
console.log('✓ Test 3 Passed: Different notifications spawn separate toasts');

// Test 4: Max visible toasts FIFO eviction
showToast('Purchased Iron Pickaxe', 'info');
showToast('Mine loot found: Gold Ore', 'info');
showToast('Explored deep caverns', 'info'); // Exceeds default limit of 4
// The oldest toast (t1) should be marked as leaving
assert(t1.classList.contains('toast-leaving'), 'Oldest toast should be marked leaving on limit overflow');
console.log('✓ Test 4 Passed: Max visible toast cap enforces FIFO eviction');

// Test 5: Notification category filtering
localStorage.setItem('bconomy_user_settings', JSON.stringify({
    density: 'verbose',
    coalescing: true,
    maxVisible: 4,
    mirrorToLog: true,
    categories: {
        perks: false, // Muted perks
        tools: true,
        actions: true,
        farm: true,
        shop: true,
        alerts: true
    }
}));

const countBefore = toastContainer.children.filter(c => !c.classList.contains('toast-leaving')).length;
showToast('Upgraded Backchannel Perk!', 'success', null, { category: 'perks' });
const countAfter = toastContainer.children.filter(c => !c.classList.contains('toast-leaving')).length;
assert.strictEqual(countAfter, countBefore, 'Muted category should NOT display a floating toast');
console.log('✓ Test 5 Passed: Category filtering successfully mutes floating toasts');

// Test 6: Density minimal mode allows errors but suppresses routine actions
toastContainer.children = [];
localStorage.setItem('bconomy_user_settings', JSON.stringify({
    density: 'minimal',
    coalescing: true,
    maxVisible: 4,
    mirrorToLog: true,
    categories: { perks: true, tools: true, actions: true, farm: true, shop: true, alerts: true }
}));

const activeBefore = toastContainer.children.filter(c => !c.classList.contains('toast-leaving')).length;
showToast('Harvested 100 Melons', 'success'); // Routine action -> suppressed
assert.strictEqual(toastContainer.children.filter(c => !c.classList.contains('toast-leaving')).length, activeBefore, 'Routine action suppressed in minimal mode');

showToast('Action Failed: Insufficient Stamina', 'error'); // Critical alert -> allowed
assert.strictEqual(toastContainer.children.filter(c => !c.classList.contains('toast-leaving')).length, activeBefore + 1, 'Error alert allowed in minimal mode');
console.log('✓ Test 6 Passed: Minimal density mode displays errors while silencing routine toasts');

console.log('--- All Advanced Toast Tests Passed Successfully! ---');
process.exit(0);
