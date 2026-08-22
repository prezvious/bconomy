// Toast Notification & Adaptive Coalescing Manager
import { addLogEntry } from './log.js';
import { getStoredSettings } from '../preferences.js';

// Refresh here so notifications also honor settings changed by another tab or
// by code that writes the public storage contract directly.
const getNotificationSettings = () => getStoredSettings({ refresh: true });

/**
 * Automatically infers notification category from message content and type.
 */
const inferNotificationCategory = (message, type) => {
    const msg = String(message || '').toLowerCase();
    if (type === 'error' || type === 'warning' || msg.includes('failed') || msg.includes('error')) {
        return 'alerts';
    }
    if (msg.includes('perk') || msg.includes('lucky drops') || msg.includes('ascen') || msg.includes('ranked up')) {
        return 'perks';
    }
    if (msg.includes('tool') || msg.includes('socket') || msg.includes('module') || msg.includes('overclock')) {
        return 'tools';
    }
    if (msg.includes('plot') || msg.includes('crop') || msg.includes('water') || msg.includes('farm') || msg.includes('melon') || msg.includes('compost')) {
        return 'farm';
    }
    if (msg.includes('shop') || msg.includes('bought') || msg.includes('sold') || msg.includes('purchase') || msg.includes('booster') || msg.includes('restock')) {
        return 'shop';
    }
    if (msg.includes('items!') || msg.includes('mine') || msg.includes('explore') || msg.includes('hunt') || msg.includes('fish') || msg.includes('work') || msg.includes('loot')) {
        return 'actions';
    }
    return 'actions';
};

/**
 * Checks whether a notification should display on screen based on user settings.
 */
const isNotificationAllowed = (category, type, settings) => {
    if (!settings) return true;

    // 1. Check Global Density Mode
    if (settings.density === 'muted') {
        return false;
    }
    if (settings.density === 'minimal') {
        // Only error/warning alerts and rare achievements show
        return category === 'alerts' || type === 'error' || type === 'warning';
    }

    // 2. Check Specific Category Toggle
    if (settings.categories && settings.categories[category] === false) {
        return false;
    }

    return true;
};

/**
 * Displays a toast notification with adaptive stacking, monospace count badges, and filter routing.
 * @param {string} message - Text or html description
 * @param {'info'|'success'|'warning'|'error'} [type='info']
 * @param {number} [duration] - Display duration in ms
 * @param {Object} [options] - Optional settings ({ category: string, count: number, forceShow: boolean })
 */
export const showToast = (message, type = 'info', duration, options = {}) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const strMessage = String(message || '');
    const isFetchError = strMessage.toLowerCase().includes('failed to fetch');
    const category = options.category || inferNotificationCategory(strMessage, type);
    const settings = getNotificationSettings();

    const allowedOnScreen = options.forceShow || isNotificationAllowed(category, type, settings);

    // If suppressed/muted by user settings, route silently to Action Ledger
    if (!allowedOnScreen) {
        if (settings.mirrorToLog && !options.silentLog) {
            const logType = type === 'error' ? 'error' : (type === 'success' ? 'bonus' : 'system');
            addLogEntry(strMessage, logType);
        }
        return;
    }

    // Handle "Failed to fetch" duplicate suppression
    if (isFetchError) {
        const existingToasts = Array.from(container.querySelectorAll('.toast'));
        const hasActiveFetchErrorToast = existingToasts.some(toast => {
            return !toast.classList.contains('toast-leaving') &&
                toast.textContent.toLowerCase().includes('failed to fetch');
        });

        if (hasActiveFetchErrorToast) {
            return;
        }
    }

    const displayDuration = duration ?? (isFetchError ? 10000 : 3200);

    // Adaptive Notification Coalescing / Stacking
    if (settings.coalescing && !isFetchError) {
        const activeToasts = Array.from(container.querySelectorAll('.toast')).filter(t => !t.classList.contains('toast-leaving'));
        const existingToast = activeToasts.find(t => {
            return t.dataset.rawMessage === strMessage && t.dataset.toastType === type;
        });

        if (existingToast) {
            const currentCount = parseInt(existingToast.dataset.count || '1', 10);
            const increment = options.increment || 1;
            const newCount = currentCount + increment;
            existingToast.dataset.count = String(newCount);

            // Update or create monospace pill badge
            let badge = existingToast.querySelector ? existingToast.querySelector('.toast-count-pill') : null;
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'toast-count-pill font-mono';
                existingToast.appendChild(badge);
            }
            badge.textContent = `${newCount}x`;

            // Trigger pulse micro-animation
            existingToast.classList.remove('toast-pulse');
            if (typeof existingToast.offsetWidth === 'number') {
                void existingToast.offsetWidth; // Force CSS reflow
            }
            existingToast.classList.add('toast-pulse');

            // Reset dismiss timer
            if (existingToast._dismissTimer) {
                clearTimeout(existingToast._dismissTimer);
            }

            existingToast._dismissTimer = setTimeout(() => {
                existingToast.classList.add('toast-leaving');
                const removeToast = () => {
                    if (existingToast.parentNode) {
                        existingToast.remove();
                    }
                };
                if (existingToast.addEventListener) {
                    existingToast.addEventListener('animationend', removeToast, { once: true });
                }
                setTimeout(removeToast, 250);
            }, displayDuration);

            return existingToast;
        }
    }

    // Max Visible Toasts FIFO Eviction
    const maxVisible = settings.maxVisible || 4;
    const currentActiveToasts = Array.from(container.querySelectorAll('.toast')).filter(t => !t.classList.contains('toast-leaving'));
    if (currentActiveToasts.length >= maxVisible) {
        const oldest = currentActiveToasts[0];
        oldest.classList.add('toast-leaving');
        if (oldest._dismissTimer) clearTimeout(oldest._dismissTimer);
        setTimeout(() => {
            if (oldest.parentNode) oldest.remove();
        }, 200);
    }

    // Create New Toast Element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.dataset.rawMessage = strMessage;
    toast.dataset.toastType = type;
    toast.dataset.count = '1';

    if (isFetchError) {
        toast.dataset.isFetchError = 'true';
    }

    // Message Text Container
    const textSpan = document.createElement('span');
    textSpan.className = 'toast-msg-text';
    textSpan.textContent = strMessage;
    toast.appendChild(textSpan);

    // Initial textContent support for test mocks
    toast.textContent = strMessage;

    container.appendChild(toast);

    toast._dismissTimer = setTimeout(() => {
        toast.classList.add('toast-leaving');
        const removeToast = () => {
            if (toast.parentNode) {
                toast.remove();
            }
        };
        if (toast.addEventListener) {
            toast.addEventListener('animationend', removeToast, { once: true });
        }
        setTimeout(removeToast, 250);
    }, displayDuration);

    return toast;
};
