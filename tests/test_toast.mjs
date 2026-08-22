import assert from 'assert';

console.log('--- Running Toast Notification Tests ---');

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
        return this._textContent || '';
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

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.elements['toast-container'] = toastContainer;

const { showToast } = await import('../public/js/ui/toast.js');

// Test 1: Single "Failed to fetch." toast appears once
showToast('Failed to fetch.', 'error');
assert.strictEqual(toastContainer.children.length, 1, 'Container should have exactly 1 toast');
assert.strictEqual(toastContainer.children[0].textContent, 'Failed to fetch.', 'Toast content should match');
console.log('✓ Test 1 Passed: "Failed to fetch." toast is displayed once');

// Test 2: Rapid spam calls to "Failed to fetch." while active are ignored
showToast('Failed to fetch.', 'error');
showToast('Failed to fetch', 'error');
showToast('[MINE] Action failed: Failed to fetch', 'error');
assert.strictEqual(toastContainer.children.length, 1, 'Duplicate "Failed to fetch" toasts should be suppressed');
console.log('✓ Test 2 Passed: Duplicate "Failed to fetch" toasts are suppressed');

// Test 3: Normal toasts are not suppressed by "Failed to fetch."
showToast('Item purchased successfully', 'success');
assert.strictEqual(toastContainer.children.length, 2, 'Different toast types/messages should still be shown');
console.log('✓ Test 3 Passed: Non-fetch error toasts are still displayed');

console.log('--- All Toast Notification Tests Passed Successfully! ---');
process.exit(0);
