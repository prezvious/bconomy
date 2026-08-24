import {
    CONTROL_DEFINITIONS,
    bindingToAriaShortcut,
    bindingFromKeyboardEvent,
    formatBinding,
    normalizeBinding
} from './controlRegistry.js';
import { getStoredSettings, SETTINGS_CHANGE_EVENT } from './preferences.js';

let initialized = false;
let annotationFrame = 0;

const isEditableTarget = target => {
    if (!target || typeof target.closest !== 'function') return false;
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));
};

const hasOpenDialog = () => Boolean(document.querySelector('dialog[open]'));

const scheduleAnnotations = () => {
    if (annotationFrame) return;
    const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : callback => setTimeout(callback, 0);
    annotationFrame = schedule(() => {
        annotationFrame = 0;
        annotateHotkeyControls();
    });
};

export const getControlDefinition = id => CONTROL_DEFINITIONS.find(definition => definition.id === id) || null;

export const dispatchControl = async id => {
    const definition = getControlDefinition(id);
    if (!definition) return false;

    if (id.startsWith('nav.')) {
        const { activateSection } = await import('./navigation.js');
        return activateSection(id.slice(4), { focus: true });
    }
    if (id.startsWith('action.')) {
        const { executeCoreAction } = await import('./ui/actions.js');
        return executeCoreAction(id.slice(7));
    }
    if (id === 'global.help') {
        const { openContextHelp } = await import('./ui/utilityRail.js');
        openContextHelp();
        return true;
    }
    if (id === 'global.console') {
        const { openConsoleCommand } = await import('./ui/utilityRail.js');
        openConsoleCommand({ seedSlash: true });
        return true;
    }
    if (id === 'global.theme') {
        const { toggleTheme } = await import('./theme.js');
        toggleTheme();
        return true;
    }
    return false;
};

export const annotateHotkeyControls = () => {
    if (typeof document === 'undefined') return;
    const hotkeys = getStoredSettings().controls.hotkeys;
    for (const definition of CONTROL_DEFINITIONS) {
        const binding = normalizeBinding(hotkeys[definition.id]);
        document.querySelectorAll(definition.selector).forEach(element => {
            if (!element.dataset.hotkeyBaseTitle) {
                element.dataset.hotkeyBaseTitle = element.getAttribute('title') || definition.label;
            }
            const baseTitle = element.dataset.hotkeyBaseTitle;
            if (binding) {
                element.setAttribute('aria-keyshortcuts', bindingToAriaShortcut(binding));
                element.setAttribute('title', `${baseTitle} (${formatBinding(binding)})`);
            } else {
                element.removeAttribute('aria-keyshortcuts');
                element.setAttribute('title', baseTitle);
            }
        });
    }
};

export const setupHotkeys = () => {
    if (initialized || typeof document === 'undefined') return;
    initialized = true;

    document.addEventListener('keydown', async event => {
        if (event.defaultPrevented || event.repeat || event.isComposing || isEditableTarget(event.target) || hasOpenDialog()) return;
        const binding = bindingFromKeyboardEvent(event);
        if (!binding) return;
        const hotkeys = getStoredSettings().controls.hotkeys;
        const match = CONTROL_DEFINITIONS.find(definition => normalizeBinding(hotkeys[definition.id]) === binding);
        if (!match) return;
        event.preventDefault();
        await dispatchControl(match.id);
        scheduleAnnotations();
    });

    document.addEventListener(SETTINGS_CHANGE_EVENT, scheduleAnnotations);
    if (typeof MutationObserver === 'function' && document.body) {
        const observer = new MutationObserver(scheduleAnnotations);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    scheduleAnnotations();
};
