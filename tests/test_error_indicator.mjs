// Unit test script for Console Status Indicator Button (Pure Node.js)
import assert from 'assert';

console.log('--- Running Console Handler & Error Indicator Tests ---');

// Create mock DOM environment
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
        this.style = {};
        this.title = '';
        this._listeners = {};
    }

    get className() {
        return Array.from(this.classList._classes).join(' ');
    }

    set className(val) {
        this._className = val || '';
        this.classList._classes = new Set(this._className.split(' ').filter(Boolean));
    }

    get innerHTML() {
        return this.children.map(c => c._html || '').join('');
    }

    set innerHTML(val) {
        if (val === '') {
            this.children = [];
        }
        this._html = val;
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

    get firstChild() {
        return this.children[0] || null;
    }

    get lastElementChild() {
        return this.children[this.children.length - 1] || null;
    }

    querySelector(selector) {
        if (selector.startsWith('.')) {
            const cls = selector.slice(1);
            return this.children.find(c => c.classList.contains(cls)) || null;
        }
        return null;
    }

    querySelectorAll(selector) {
        if (selector.startsWith('.')) {
            const cls = selector.slice(1);
            return this.children.filter(c => c.classList.contains(cls));
        }
        return [];
    }

    addEventListener(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
    }

    click() {
        if (this._listeners['click']) {
            this._listeners['click'].forEach(fn => fn({ type: 'click' }));
        }
    }

    setAttribute(attr, val) {
        this[attr] = val;
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
global.window = {};

// Setup DOM elements
const statusBtn = document.createElement('button');
statusBtn.id = 'btn-status-dot';
statusBtn.className = 'live-dot-btn status-ok';
document.elements['btn-status-dot'] = statusBtn;

const logCountEl = document.createElement('span');
logCountEl.id = 'log-count';
logCountEl.textContent = '0';
document.elements['log-count'] = logCountEl;

const clearBtn = document.createElement('button');
clearBtn.id = 'btn-clear-log';
document.elements['btn-clear-log'] = clearBtn;

const activityLog = document.createElement('div');
activityLog.id = 'activity-log';
document.elements['activity-log'] = activityLog;

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.elements['toast-container'] = toastContainer;

// Import module
const logModule = await import('../public/js/ui/log.js');
const { addLogEntry, updateLogHeaderStatus, setupConsoleHandlers } = logModule;

// Setup may be called more than once as UI modules are reinitialized. Persistent
// console controls must still receive exactly one listener per event.
setupConsoleHandlers();
setupConsoleHandlers();

assert.strictEqual(statusBtn._listeners.click.length, 1, 'Status control must only bind one click handler');
assert.strictEqual(clearBtn._listeners.click.length, 1, 'Clear control must only bind one click handler');

// Test 1: Initial state check
assert.strictEqual(statusBtn.tagName, 'BUTTON', 'Status element must be a <button> tag');
assert(statusBtn.classList.contains('status-ok'), 'Button should start with status-ok class');
console.log('✓ Test 1 Passed: Button element initialized correctly with status-ok ("No errors")');

// Test 2: Add non-error log entries and verify status remains ok
addLogEntry('System initialized', 'system');
addLogEntry('Mining completed', 'success');

assert.strictEqual(String(logCountEl.textContent), '2', 'Total logs count should be 2');
assert(statusBtn.classList.contains('status-ok'), 'Status should remain status-ok when no errors added');
assert(!statusBtn.classList.contains('status-error'), 'Status-error class must not be present');
console.log('✓ Test 2 Passed: Non-error entries preserve healthy status ("No errors")');

// Test 3: Add an error entry and verify transition to status-error
addLogEntry('Network error occurred', 'error');

assert(statusBtn.classList.contains('status-error'), 'Button must switch to status-error when an error is logged');
assert(!statusBtn.classList.contains('status-ok'), 'status-ok class must be removed');
assert(statusBtn.title.includes('1 error(s) detected'), 'Title should indicate 1 error detected');
console.log('✓ Test 3 Passed: Error entry updates button state to status-error (Red dot)');

// Test 4: Click button to toggle error filter mode
statusBtn.click();
assert(statusBtn.classList.contains('filter-active'), 'Filter active class should be applied');

const visibleEntries = activityLog.children.filter(e => e.style.display !== 'none');
assert.strictEqual(visibleEntries.length, 1, 'Only 1 error entry should be visible when filter active');
assert(visibleEntries[0].classList.contains('error'), 'Visible entry must be the error entry');
console.log('✓ Test 4 Passed: Clicking error status button filters log feed to show only errors');

// Test 5: Click button again to deactivate filter
statusBtn.click();
assert(!statusBtn.classList.contains('filter-active'), 'Filter active class should be removed');
const visibleAfterToggle = activityLog.children.filter(e => e.style.display !== 'none');
assert.strictEqual(visibleAfterToggle.length, 3, 'All entries should be visible after toggling filter off');
console.log('✓ Test 5 Passed: Clicking button again restores full log feed');

// Test 6: Clear log feed and verify reset to healthy status
clearBtn.click();
assert.strictEqual(String(logCountEl.textContent), '1', 'Log count reset to 1 after clear');
assert(statusBtn.classList.contains('status-ok'), 'Status button should reset to status-ok after clearing logs');
assert(!statusBtn.classList.contains('status-error'), 'status-error class should be removed');
console.log('✓ Test 6 Passed: Clearing logs resets status button to healthy state ("No errors")');

// Test 7: Click healthy button to trigger status check
statusBtn.click();
const latestEntry = activityLog.lastElementChild;
assert((latestEntry._html || '').includes('0 errors detected'), 'Clicking healthy button generates system status check entry');
console.log('✓ Test 7 Passed: Clicking healthy status button triggers status check feedback');

console.log('--- All Console Handler & Error Indicator Tests Passed Successfully! ---');
process.exit(0);
