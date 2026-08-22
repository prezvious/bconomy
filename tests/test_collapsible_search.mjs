import assert from 'node:assert/strict';

console.log('--- Running Collapsible Search Tests ---');

const storage = new Map();
global.localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};

global.document = {
    documentElement: { dataset: {} },
    activeElement: null,
    dispatchEvent: () => true
};

global.requestAnimationFrame = callback => callback();

class MockClassList {
    constructor(...classes) {
        this.classes = new Set(classes.filter(Boolean));
    }

    add(...classes) {
        classes.forEach(className => this.classes.add(className));
    }

    remove(...classes) {
        classes.forEach(className => this.classes.delete(className));
    }

    contains(className) {
        return this.classes.has(className);
    }

    toggle(className, force) {
        if (force === undefined) {
            if (this.classes.has(className)) {
                this.classes.delete(className);
            } else {
                this.classes.add(className);
            }
            return;
        }
        if (force) this.classes.add(className);
        else this.classes.delete(className);
    }
}

class MockElement {
    constructor(className = '') {
        this.classList = new MockClassList(...className.split(' '));
        this.dataset = {};
        this.listeners = {};
        this.value = '';
        this.parent = null;
    }

    addEventListener(type, callback) {
        this.listeners[type] = [...(this.listeners[type] || []), callback];
    }

    closest(selector) {
        if (selector === '.toolbar-search') return this.classList.contains('toolbar-search') ? this : this.parent?.closest(selector) || null;
        if (selector === '.page-toolbar') return this.classList.contains('page-toolbar') ? this : this.parent?.closest(selector) || null;
        return null;
    }
}

const dispatch = (element, type) => {
    document.activeElement = type === 'blur' ? null : element;
    (element.listeners[type] || []).forEach(callback => callback({ currentTarget: element }));
};

const { getStoredSettings, saveStoredSettings } = await import('../public/js/preferences.js');
const { setupCollapsibleSearch } = await import('../public/js/ui/collapsibleSearch.js');

const toolbar = new MockElement('page-toolbar');
const shell = new MockElement('toolbar-search');
const input = new MockElement();
shell.parent = toolbar;
input.parent = shell;

setupCollapsibleSearch(input, { resetCollapsed: true });
assert(shell.classList.contains('is-collapsed'), 'Search initializes collapsed');
assert(toolbar.classList.contains('search-collapsed'), 'Toolbar initializes in collapsed layout');

dispatch(input, 'focus');
assert(shell.classList.contains('is-expanded'), 'Focus expands search');
assert(toolbar.classList.contains('search-expanded'), 'Toolbar switches to expanded layout');

input.value = '';
dispatch(input, 'blur');
assert(shell.classList.contains('is-collapsed'), 'Empty blur collapses search');

dispatch(input, 'focus');
input.value = 'ore';
dispatch(input, 'blur');
assert.strictEqual(getStoredSettings().collapseSearchOnBlur, false);
assert(shell.classList.contains('is-expanded'), 'Non-empty blur stays expanded by default');

saveStoredSettings({ ...getStoredSettings(), collapseSearchOnBlur: true });
dispatch(input, 'blur');
assert(shell.classList.contains('is-collapsed'), 'Non-empty blur collapses when preference is enabled');

console.log('✓ Collapsed, expanded, empty blur, and preference-controlled blur states verified');
console.log('--- Collapsible Search Tests Passed ---');
