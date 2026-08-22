// Shared native-dialog controller and Promise-based confirmation manager.
import { showToast } from './toast.js';
import { getStoredSettings } from '../preferences.js';

const IGNORED_CONFIRMATIONS_KEY = 'bconomy_ignored_confirmations';
const dialogContexts = new WeakMap();
let activeDialog = null;
let pendingConfirmation = null;

const resolveDialog = (dialogOrId) => {
    if (!dialogOrId || typeof document === 'undefined') return null;
    return typeof dialogOrId === 'string' ? document.getElementById(dialogOrId) : dialogOrId;
};

const isDialogOpen = dialog => Boolean(dialog && (dialog.open || !dialog.classList?.contains('hidden')));

const focusInitialControl = (dialog, selector) => {
    const preferred = selector ? dialog.querySelector(selector) : null;
    const fallback = dialog.querySelector('[autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const target = preferred || fallback;
    if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
};

export const getActiveDialog = () => activeDialog;

export const openDialog = (dialogOrId, {
    initialFocus,
    closeOnBackdrop = false,
    returnFocus,
    onClose
} = {}) => {
    const dialog = resolveDialog(dialogOrId);
    if (!dialog) return null;
    configureDialog(dialog);

    if (activeDialog && activeDialog !== dialog && isDialogOpen(activeDialog)) {
        closeDialog(activeDialog, { reason: 'replaced', restoreFocus: false });
    }

    const trigger = returnFocus || (typeof document !== 'undefined' ? document.activeElement : null);
    dialogContexts.set(dialog, { closeOnBackdrop, returnFocus: trigger, onClose });
    dialog.dataset.closeOnBackdrop = String(closeOnBackdrop);
    dialog.classList?.remove('hidden');

    if (typeof dialog.showModal === 'function' && !dialog.open) {
        dialog.showModal();
    } else if (typeof dialog.setAttribute === 'function') {
        dialog.setAttribute('open', '');
        dialog.open = true;
    }

    activeDialog = dialog;
    const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : callback => setTimeout(callback, 0);
    schedule(() => focusInitialControl(dialog, initialFocus));
    return dialog;
};

export const closeDialog = (dialogOrId = activeDialog, {
    reason = 'dismiss',
    restoreFocus = true
} = {}) => {
    const dialog = resolveDialog(dialogOrId);
    if (!dialog || !isDialogOpen(dialog)) return false;

    const context = dialogContexts.get(dialog) || {};
    if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close(reason);
    } else {
        dialog.open = false;
        dialog.removeAttribute?.('open');
    }
    dialog.classList?.add('hidden');
    if (activeDialog === dialog) activeDialog = null;
    dialogContexts.delete(dialog);

    if (typeof context.onClose === 'function') context.onClose(reason);
    if (restoreFocus && context.returnFocus && typeof context.returnFocus.focus === 'function') {
        context.returnFocus.focus({ preventScroll: true });
    }
    return true;
};

export const replaceDialog = (fromDialog, toDialog, options = {}) => {
    const from = resolveDialog(fromDialog);
    const previousContext = from ? dialogContexts.get(from) : null;
    closeDialog(from, { reason: 'replaced', restoreFocus: false });
    return openDialog(toDialog, {
        ...options,
        returnFocus: options.returnFocus || previousContext?.returnFocus
    });
};

const configureDialog = dialog => {
    if (!dialog || dialog.dataset.dialogConfigured === 'true') return;
    dialog.dataset.dialogConfigured = 'true';

    dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeDialog(dialog, { reason: 'escape' });
    });

    let pointerStartedOnBackdrop = false;
    dialog.addEventListener('pointerdown', event => {
        pointerStartedOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener('click', event => {
        const context = dialogContexts.get(dialog);
        if (pointerStartedOnBackdrop && event.target === dialog && context?.closeOnBackdrop) {
            closeDialog(dialog, { reason: 'backdrop' });
        }
        pointerStartedOnBackdrop = false;

        const closeButton = event.target.closest?.('[data-dialog-close]');
        if (closeButton) {
            closeDialog(dialog, { reason: closeButton.dataset.dialogClose || 'cancel' });
        }
    });
};

export const setupDialogs = () => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('dialog[data-app-dialog]').forEach(configureDialog);

    const resetBtn = document.getElementById('btn-reset-confirmations');
    resetBtn?.addEventListener('click', () => {
        clearIgnoredConfirmations();
        showToast('All confirmation dialogs re-enabled!', 'info');
    });
};

// Backward-compatible initializer used by app.js.
export const setupModals = setupDialogs;

export const getIgnoredConfirmations = () => {
    try {
        const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(IGNORED_CONFIRMATIONS_KEY) : null;
        const parsed = stored ? JSON.parse(stored) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
};

export const setConfirmationIgnored = (typeKey, ignored) => {
    if (!typeKey) return;
    try {
        const current = getIgnoredConfirmations();
        current[typeKey] = Boolean(ignored);
        localStorage.setItem(IGNORED_CONFIRMATIONS_KEY, JSON.stringify(current));
    } catch (error) {
        // Storage can be unavailable in private or restricted contexts.
    }
};

export const shouldSkipBulkPreview = typeKey => {
    const settings = getStoredSettings();
    return settings.bulkActions.skipAllPreviews === true
        || Boolean(typeKey && getIgnoredConfirmations()[typeKey] === true);
};

export const clearIgnoredConfirmations = () => {
    try {
        localStorage.removeItem(IGNORED_CONFIRMATIONS_KEY);
    } catch (error) {
        // No-op when storage is unavailable.
    }
};

export const showConfirmation = (...args) => {
    const maybeOptions = args[args.length - 1];
    const options = maybeOptions && typeof maybeOptions === 'object' && !Array.isArray(maybeOptions)
        ? args.pop()
        : {};
    let typeKey;
    let title;
    let message;
    if (args.length === 2) {
        [title, message] = args;
        typeKey = String(title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    } else {
        [typeKey, title, message] = args;
    }

    if (options.bulkAction === true && shouldSkipBulkPreview(typeKey)) {
        return Promise.resolve(true);
    }
    if (options.allowIgnore !== false && typeKey && getIgnoredConfirmations()[typeKey] === true) {
        return Promise.resolve(true);
    }

    if (pendingConfirmation) {
        pendingConfirmation(false);
        pendingConfirmation = null;
    }

    return new Promise(resolve => {
        const dialog = resolveDialog('confirmation-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const dontAskCheckbox = document.getElementById('modal-dont-ask-again');
        const dontAskContainer = dontAskCheckbox?.closest?.('.modal-options');
        const dontAskLabel = document.getElementById('modal-dont-ask-label');
        const confirmButton = document.getElementById('btn-modal-confirm');
        const cancelButton = document.getElementById('btn-modal-cancel');
        const closeButton = document.getElementById('btn-close-confirmation-modal');

        if (!dialog || !confirmButton || !cancelButton) {
            resolve(typeof confirm === 'function' ? confirm(`${title}\n\n${message}`) : false);
            return;
        }

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (dontAskCheckbox) dontAskCheckbox.checked = false;
        if (dontAskLabel) dontAskLabel.textContent = options.ignoreLabel || "Don't ask me again for this action";
        dontAskContainer?.classList.toggle('hidden', options.allowIgnore === false);

        let settled = false;
        const settle = value => {
            if (settled) return;
            settled = true;
            pendingConfirmation = null;
            confirmButton.onclick = null;
            cancelButton.onclick = null;
            if (closeButton) closeButton.onclick = null;
            resolve(value);
        };
        pendingConfirmation = settle;

        confirmButton.onclick = () => {
            if (options.allowIgnore !== false && dontAskCheckbox?.checked && typeKey) setConfirmationIgnored(typeKey, true);
            closeDialog(dialog, { reason: 'confirm' });
            settle(true);
        };
        const cancel = () => {
            closeDialog(dialog, { reason: 'cancel' });
            settle(false);
        };
        cancelButton.onclick = cancel;
        if (closeButton) closeButton.onclick = cancel;

        openDialog(dialog, {
            initialFocus: '#btn-modal-confirm',
            closeOnBackdrop: false,
            returnFocus: options.returnFocus,
            onClose: reason => {
                if (reason !== 'confirm') settle(false);
            }
        });
    });
};
