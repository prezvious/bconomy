import assert from 'node:assert/strict';

class MockClassList {
    constructor(...classes) {
        this.values = new Set(classes);
    }
    add(...classes) { classes.forEach(value => this.values.add(value)); }
    remove(...classes) { classes.forEach(value => this.values.delete(value)); }
    contains(value) { return this.values.has(value); }
    toggle(value, force) {
        const enabled = force === undefined ? !this.values.has(value) : Boolean(force);
        if (enabled) this.values.add(value);
        else this.values.delete(value);
        return enabled;
    }
}

class MockElement {
    constructor(id, { dialog = false } = {}) {
        this.id = id;
        this.dataset = {};
        this.classList = new MockClassList('hidden');
        this.listeners = new Map();
        this.attributes = {};
        this.open = false;
        this.disabled = false;
        this.checked = false;
        this.value = '';
        this.textContent = '';
        this.isDialog = dialog;
        this.focusCount = 0;
    }
    addEventListener(type, listener) {
        if (!this.listeners.has(type)) this.listeners.set(type, []);
        this.listeners.get(type).push(listener);
    }
    dispatch(type, event = {}) {
        const payload = {
            target: this,
            preventDefault() { this.defaultPrevented = true; },
            ...event
        };
        (this.listeners.get(type) || []).forEach(listener => listener(payload));
        return payload;
    }
    querySelector() { return null; }
    closest() { return null; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    removeAttribute(name) { delete this.attributes[name]; }
    showModal() { this.open = true; }
    close(value = '') { this.open = false; this.returnValue = value; }
    focus() { this.focusCount += 1; document.activeElement = this; }
}

const elements = new Map();
const create = (id, options) => {
    const element = new MockElement(id, options);
    elements.set(id, element);
    return element;
};

const trigger = create('trigger');
const dialogA = create('dialog-a', { dialog: true });
const dialogB = create('dialog-b', { dialog: true });
const confirmation = create('confirmation-modal', { dialog: true });
const title = create('modal-title');
const message = create('modal-message');
const dontAsk = create('modal-dont-ask-again');
const dontAskLabel = create('modal-dont-ask-label');
const dontAskContainer = create('modal-options');
dontAsk.closest = selector => selector === '.modal-options' ? dontAskContainer : null;
const confirmButton = create('btn-modal-confirm');
const cancelButton = create('btn-modal-cancel');
const confirmationClose = create('btn-close-confirmation-modal');

globalThis.document = {
    activeElement: trigger,
    getElementById: id => elements.get(id) || null,
    querySelectorAll: selector => selector === 'dialog[data-app-dialog]'
        ? [dialogA, dialogB, confirmation]
        : [],
    addEventListener() {},
    dispatchEvent() {}
};
globalThis.requestAnimationFrame = callback => callback();

const storage = new Map();
globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key)
};

const {
    closeDialog,
    getActiveDialog,
    openDialog,
    clearIgnoredConfirmations,
    setConfirmationIgnored,
    shouldSkipBulkPreview,
    setupDialogs,
    showConfirmation
} = await import('../public/js/ui/modal.js');
const { getStoredSettings, saveStoredSettings } = await import('../public/js/preferences.js');

console.log('--- Running Shared Dialog Manager Tests ---');
setupDialogs();

let closeReason = null;
openDialog(dialogA, {
    closeOnBackdrop: false,
    returnFocus: trigger,
    onClose: reason => { closeReason = reason; }
});
assert.equal(dialogA.open, true);
assert.equal(dialogA.classList.contains('hidden'), false);
assert.equal(getActiveDialog(), dialogA);

dialogA.dispatch('pointerdown');
dialogA.dispatch('click');
assert.equal(dialogA.open, true, 'Transactional dialogs ignore backdrop clicks');

const cancelEvent = dialogA.dispatch('cancel');
assert.equal(cancelEvent.defaultPrevented, true);
assert.equal(dialogA.open, false);
assert.equal(closeReason, 'escape');
assert.equal(trigger.focusCount, 1, 'Escape restores focus to the opening control');
console.log('✓ Escape, focus restoration, and transactional backdrop policy verified');

openDialog(dialogA, { returnFocus: trigger });
openDialog(dialogB, { returnFocus: trigger });
assert.equal(dialogA.open, false, 'Opening a dialog replaces the previous active dialog');
assert.equal(dialogB.open, true);
assert.equal(getActiveDialog(), dialogB);
closeDialog(dialogB, { reason: 'done' });
assert.equal(getActiveDialog(), null);
console.log('✓ Single-active-dialog replacement and explicit close verified');

openDialog(dialogA, { closeOnBackdrop: true, returnFocus: trigger });
dialogA.dispatch('pointerdown');
dialogA.dispatch('click');
assert.equal(dialogA.open, false, 'Passive dialogs can opt into backdrop dismissal');
console.log('✓ Passive backdrop dismissal is opt-in');

setConfirmationIgnored('permanentAction', true);
const confirmationPromise = showConfirmation(
    'permanentAction',
    'Permanent Action?',
    'This prompt must still be reviewed.',
    { allowIgnore: false }
);
assert.equal(confirmation.open, true, 'Non-ignorable confirmations bypass stored suppression');
assert.equal(dontAskContainer.classList.contains('hidden'), true);
assert.equal(title.textContent, 'Permanent Action?');
assert.equal(message.textContent, 'This prompt must still be reviewed.');
confirmButton.onclick();
assert.equal(await confirmationPromise, true);
console.log('✓ Permanent confirmations cannot be suppressed');

clearIgnoredConfirmations();
const settings = getStoredSettings();
settings.bulkActions.skipAllPreviews = true;
saveStoredSettings(settings);
assert.equal(shouldSkipBulkPreview('bulkShopBuy'), true);
assert.equal(await showConfirmation('bulkToolUpgrade', 'Bulk upgrade?', 'Preview', { bulkAction: true }), true);
assert.equal(confirmation.open, false, 'Global bulk preference bypasses only the bulk confirmation');

const singleConfirmation = showConfirmation('toolUpgrade', 'Single upgrade?', 'Review one level');
assert.equal(confirmation.open, true, 'Global bulk preference leaves single-action confirmations unchanged');
confirmButton.onclick();
assert.equal(await singleConfirmation, true);

settings.bulkActions.skipAllPreviews = false;
saveStoredSettings(settings);
setConfirmationIgnored('bulkShopSell', true);
assert.equal(shouldSkipBulkPreview('bulkShopSell'), true);
assert.equal(shouldSkipBulkPreview('bulkShopBuy'), false);

settings.bulkActions.skipAllPreviews = true;
saveStoredSettings(settings);
settings.bulkActions.skipAllPreviews = false;
saveStoredSettings(settings);
assert.equal(shouldSkipBulkPreview('bulkShopSell'), true, 'Changing the global toggle preserves action suppressions');
clearIgnoredConfirmations();
assert.equal(shouldSkipBulkPreview('bulkShopSell'), false, 'Resetting confirmations clears action suppressions');

const labeledPromise = showConfirmation(
    'bulkPerkUpgrade',
    'Bulk perk upgrade?',
    'Spend multiple points?',
    { bulkAction: true, ignoreLabel: "Don't show this preview again" }
);
assert.equal(confirmation.open, true);
assert.equal(dontAskLabel.textContent, "Don't show this preview again");
confirmButton.onclick();
assert.equal(await labeledPromise, true);
console.log('✓ Global and action-specific bulk preview suppression use the expected precedence');

console.log('--- Shared Dialog Manager Tests Passed ---');
