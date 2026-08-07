// Modal & Confirmation Dialog Manager
import { showToast } from './toast.js';

export const getIgnoredConfirmations = () => {
    try {
        const stored = localStorage.getItem('bconomy_ignored_confirmations');
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
};

export const setConfirmationIgnored = (typeKey, ignored) => {
    try {
        const current = getIgnoredConfirmations();
        current[typeKey] = !!ignored;
        localStorage.setItem('bconomy_ignored_confirmations', JSON.stringify(current));
    } catch (e) {}
};

export const clearIgnoredConfirmations = () => {
    try {
        localStorage.removeItem('bconomy_ignored_confirmations');
    } catch (e) {}
};

export const setupModals = () => {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;

    const cancelBtn = document.getElementById('btn-modal-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    const resetBtn = document.getElementById('btn-reset-confirmations');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearIgnoredConfirmations();
            showToast('All confirmation dialogs re-enabled!', 'info');
        });
    }
};

/**
 * Reusable Promise-based confirmation modal with per-action ignore options, focus trapping, and keyboard controls.
 * @param {string} typeKey - Unique identifier key for confirmation type (e.g. 'toolUpgrade', 'perkUpgrade', 'ascend', 'removeCrop')
 * @param {string} title 
 * @param {string} message 
 * @returns {Promise<boolean>} Resolves true if confirmed (or ignored), false if cancelled.
 */
export const showConfirmation = (typeKey, title, message) => {
    // Overload for 2 arguments: showConfirmation(title, message)
    if (arguments.length === 2 && typeof message === 'undefined') {
        message = title;
        title = typeKey;
        typeKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const ignoredMap = getIgnoredConfirmations();
    if (typeKey && ignoredMap[typeKey] === true) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const modal = document.getElementById('confirmation-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const dontAskCheckbox = document.getElementById('modal-dont-ask-again');
        const yesBtn = document.getElementById('btn-modal-confirm');
        const noBtn = document.getElementById('btn-modal-cancel');

        if (!modal || !yesBtn || !noBtn) {
            resolve(confirm(`${title}\n\n${message}`));
            return;
        }

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (dontAskCheckbox) dontAskCheckbox.checked = false;

        modal.classList.remove('hidden');

        const previousFocus = document.activeElement;

        const cleanup = () => {
            modal.classList.add('hidden');
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            document.removeEventListener('keydown', onKey);
            if (previousFocus && typeof previousFocus.focus === 'function') {
                previousFocus.focus();
            }
        };

        const onYes = () => {
            if (dontAskCheckbox && dontAskCheckbox.checked && typeKey) {
                setConfirmationIgnored(typeKey, true);
            }
            cleanup();
            resolve(true);
        };

        const onNo = () => {
            cleanup();
            resolve(false);
        };

        const onKey = (e) => {
            if (e.key === 'Escape') {
                cleanup();
                resolve(false);
            } else if (e.key === 'Tab') {
                const focusables = [dontAskCheckbox, noBtn, yesBtn].filter(Boolean);
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        document.addEventListener('keydown', onKey);

        yesBtn.focus();
    });
};
