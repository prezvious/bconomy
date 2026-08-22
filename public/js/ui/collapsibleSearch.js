import { getStoredSettings } from '../preferences.js';

const READY_ATTR = 'collapsibleSearchReady';
const BOUND_ATTR = 'collapsibleSearchBound';

const getSearchShell = input => input?.closest?.('.toolbar-search') || null;
const getToolbar = shell => shell?.closest?.('.page-toolbar') || null;

const setExpanded = (input, expanded) => {
    const shell = getSearchShell(input);
    if (!shell) return;

    const toolbar = getToolbar(shell);
    shell.classList.toggle('is-expanded', expanded);
    shell.classList.toggle('is-collapsed', !expanded);
    shell.dataset.searchState = expanded ? 'expanded' : 'collapsed';
    toolbar?.classList.toggle('search-expanded', expanded);
    toolbar?.classList.toggle('search-collapsed', !expanded);
};

export const expandCollapsibleSearch = input => setExpanded(input, true);

export const collapseCollapsibleSearch = input => setExpanded(input, false);

export const setupCollapsibleSearch = (input, { resetCollapsed = false } = {}) => {
    const shell = getSearchShell(input);
    if (!input || !shell) return;

    shell.classList.add('is-collapsible-search');

    if (input.dataset[BOUND_ATTR] !== 'true') {
        input.dataset[BOUND_ATTR] = 'true';

        const expand = () => expandCollapsibleSearch(input);
        shell.addEventListener('pointerdown', expand);
        input.addEventListener('focus', expand);
        input.addEventListener('click', expand);
        input.addEventListener('input', expand);
        input.addEventListener('blur', () => {
            const settleBlur = () => {
                const hasQuery = input.value.trim().length > 0;
                const shouldCollapse = !hasQuery || getStoredSettings().collapseSearchOnBlur;
                if (shouldCollapse) collapseCollapsibleSearch(input);
            };

            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(settleBlur);
            } else {
                setTimeout(settleBlur, 0);
            }
        });
    }

    if (resetCollapsed || shell.dataset[READY_ATTR] !== 'true') {
        collapseCollapsibleSearch(input);
        shell.dataset[READY_ATTR] = 'true';
    }
};
