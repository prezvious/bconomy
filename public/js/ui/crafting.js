import {
    doExecuteCrafting, doGetCraftingCatalog, doPreviewCrafting, doGetCraftingMax,
    doGetWhereUsed, doPreviewIntermediate, doCraftIntermediate
} from '../api.js';
import { getState } from '../state.js';
import {
    getStoredSettings,
    shouldConfirmQuantityOperation,
    updateStoredSettings
} from '../preferences.js';
import { formatDisplayNumber, iconHtml } from '../utils.js';
import { quantityPresetButtonsHtml } from './quantityPresets.js';
import { showConfirmation, openDialog } from './modal.js';
import { showToast } from './toast.js';
import { addLogEntry } from './log.js';

const EFFORT_ORDER = ['Basic', 'Workshop', 'Industrial', 'Advanced', 'Specialized', 'Frontier'];
const VIEW_ROW_HEIGHT = Object.freeze({ standard: 76, 'super-compact': 46 });
const VIEW_BUFFER = 8;
const CRAFTING_SELECTION_PROMPTS = Object.freeze([
    Object.freeze({ title: 'Choose your next build', description: 'Select a recipe from the catalog to review its materials, output, and crafting options.' }),
    Object.freeze({ title: 'Start with a blueprint', description: 'Pick an item from the list to open its complete bill of materials.' }),
    Object.freeze({ title: 'Select a workshop project', description: 'Choose any recipe to see what it produces and which inputs it requires.' }),
    Object.freeze({ title: 'Find something to make', description: 'Browse or search the catalog, then select an item to inspect its recipe.' }),
    Object.freeze({ title: 'Plan your next craft', description: 'Select a recipe to compare its requirements with the materials you own.' }),
    Object.freeze({ title: 'Open a recipe', description: 'Choose a catalog entry to review its ingredients before crafting.' }),
    Object.freeze({ title: 'Put the workshop to work', description: 'Select an item to inspect its recipe and available production modes.' }),
    Object.freeze({ title: 'Build from your inventory', description: 'Choose a recipe to see whether your current materials are sufficient.' }),
    Object.freeze({ title: 'Review a bill of materials', description: 'Select any craftable item to inspect every required component and quantity.' }),
    Object.freeze({ title: 'Choose a production goal', description: 'Pick a finished item or intermediate component to begin planning.' }),
    Object.freeze({ title: 'Begin a new assembly', description: 'Select a recipe to review its output, inputs, and crafting controls.' }),
    Object.freeze({ title: 'Explore the catalog', description: 'Choose a recipe from the list to open its detailed production plan.' }),
    Object.freeze({ title: 'Prepare the next job', description: 'Select an item to check its required stock before production.' }),
    Object.freeze({ title: 'Turn materials into equipment', description: 'Pick a recipe to see how gathered resources become a finished product.' }),
    Object.freeze({ title: 'Choose what to produce', description: 'Select a catalog item to inspect its exact recipe and expected output.' }),
    Object.freeze({ title: 'Inspect a craftable item', description: 'Pick an item from the catalog to view its materials and availability.' }),
    Object.freeze({ title: 'Set a workshop target', description: 'Choose a recipe to review the resources needed for direct or recursive crafting.' }),
    Object.freeze({ title: 'Select a recipe to continue', description: 'Review an item’s requirements before previewing or executing the craft.' }),
    Object.freeze({ title: 'Ready the workbench', description: 'Choose an item to load its blueprint and crafting controls.' }),
    Object.freeze({ title: 'Decide what comes next', description: 'Browse the catalog and select the item you want the workshop to produce.' })
]);
const sessionSelectionPrompt = CRAFTING_SELECTION_PROMPTS[Math.floor(Math.random() * CRAFTING_SELECTION_PROMPTS.length)];

let catalog = null;
let catalogPromise = null;
let craftables = [];
let selectedRecipeId = '';
let selectedMode = 'direct';
let selectedQuantity = 1;
let lastPreview = null;
let controlsBound = false;
let operationPending = false;
let lastMaxSummary = null;
let lastWhereUsed = null;
let insightRequestId = 0;
const recipeHistory = [];

const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const humanize = value => String(value || '')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const ensureCatalog = async () => {
    if (catalog) return catalog;
    if (!catalogPromise) {
        catalogPromise = doGetCraftingCatalog().then(data => {
            const definitionById = new Map([
                ...data.materials.map(item => [item.id, item]),
                ...data.craftables.map(item => [item.id, item])
            ]);
            const recipeById = new Map(data.recipes.map(recipe => [recipe.id, recipe]));
            craftables = data.craftables.map(item => ({
                ...item,
                recipe: recipeById.get(item.recipeId),
                ingredientDefinitions: (recipeById.get(item.recipeId)?.ingredients || []).map(input => ({
                    ...input,
                    definition: definitionById.get(input.itemId) || { id: input.itemId, name: input.itemId, storage: 'inventory' }
                }))
            }));
            catalog = { ...data, definitionById, recipeById };
            return catalog;
        }).finally(() => { catalogPromise = null; });
    }
    return catalogPromise;
};

const inventoryQuantity = (itemId, definition = null) => {
    const playerState = getState() || {};
    if ((playerState.lockedItems || []).includes(itemId)) return 0;
    const storage = definition?.storage === 'toolModules' ? 'toolModules' : 'inventory';
    return Math.max(0, Number(playerState[storage]?.[itemId]) || 0);
};

const recipeAvailability = item => {
    let missing = 0;
    for (const input of item.ingredientDefinitions) {
        const owned = inventoryQuantity(input.itemId, input.definition);
        missing += Math.max(0, input.quantity - owned);
    }
    return { craftable: missing === 0, missing, owned: inventoryQuantity(item.id, item) };
};

const settingsPatch = patch => updateStoredSettings(settings => ({
    crafting: { ...settings.crafting, ...patch }
}));

const populateSelect = (element, options, selected) => {
    if (!element) return;
    element.innerHTML = options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
    element.value = options.some(([value]) => value === selected) ? selected : 'all';
};

const populateControls = () => {
    const settings = getStoredSettings().crafting;
    const domainOptions = [['all', 'All domains'], ...catalog.domains.map(domain => [domain.id, domain.name])];
    populateSelect(document.getElementById('crafting-domain'), domainOptions, settings.domain);
    populateSelect(document.getElementById('crafting-effort'), [['all', 'All effort bands'], ...EFFORT_ORDER.map(value => [value, value])], settings.effort);
    populateSelect(document.getElementById('crafting-classification'), [
        ['all', 'All types'], ['intermediate', 'Intermediate'], ['finished', 'Finished'],
        ['legacy', 'Legacy component'], ['socket-module', 'Socket module']
    ], settings.classification);
    populateSelect(document.getElementById('crafting-form'), [
        ['all', 'All recipe forms'], ['raw-only', 'Raw + raw'], ['mixed', 'Crafted + raw'], ['crafted-only', 'Crafted + crafted']
    ], settings.recipeForm);
    populateSelect(document.getElementById('crafting-availability'), [
        ['all', 'All availability'], ['craftable', 'Craftable now'], ['missing', 'Missing inputs']
    ], settings.availability);
    populateSelect(document.getElementById('crafting-sort'), [
        ['name', 'Name'], ['domain', 'Domain'], ['effort', 'Effort'], ['owned', 'Owned output'],
        ['craftable', 'Craftable first'], ['missing', 'Fewest missing']
    ], settings.sort);
    const search = document.getElementById('crafting-search');
    if (search) search.value = settings.search;
};

const filteredCraftables = () => {
    const filters = getStoredSettings().crafting;
    const search = filters.search.trim().toLowerCase();
    const items = craftables.map(item => ({ ...item, availability: recipeAvailability(item) })).filter(item => {
        if (filters.domain !== 'all' && item.domain !== filters.domain) return false;
        if (filters.effort !== 'all' && item.effortBand !== filters.effort) return false;
        if (filters.classification !== 'all' && item.classification !== filters.classification) return false;
        if (filters.recipeForm !== 'all' && item.recipe.form !== filters.recipeForm) return false;
        if (filters.availability === 'craftable' && !item.availability.craftable) return false;
        if (filters.availability === 'missing' && item.availability.craftable) return false;
        if (!search) return true;
        const haystack = [
            item.name, item.description, item.domainName, item.effortBand, item.classification,
            ...item.ingredientDefinitions.flatMap(input => [input.itemId, input.definition.name])
        ].join(' ').toLowerCase();
        return haystack.includes(search);
    });

    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
    const nameSort = (left, right) => collator.compare(left.name, right.name);
    items.sort((left, right) => {
        if (filters.sort === 'domain') return collator.compare(left.domainName, right.domainName) || nameSort(left, right);
        if (filters.sort === 'effort') return EFFORT_ORDER.indexOf(left.effortBand) - EFFORT_ORDER.indexOf(right.effortBand) || nameSort(left, right);
        if (filters.sort === 'owned') return right.availability.owned - left.availability.owned || nameSort(left, right);
        if (filters.sort === 'craftable') return Number(right.availability.craftable) - Number(left.availability.craftable) || nameSort(left, right);
        if (filters.sort === 'missing') return left.availability.missing - right.availability.missing || nameSort(left, right);
        return nameSort(left, right);
    });
    return items;
};

const statusBadge = item => item.availability.craftable
    ? '<span class="crafting-ready-badge ready">Ready</span>'
    : `<span class="crafting-ready-badge missing">Missing ${formatDisplayNumber(item.availability.missing)}</span>`;

const recipeRowHtml = (item, view) => {
    const selected = item.recipeId === selectedRecipeId;
    if (view === 'super-compact') {
        return `<button class="crafting-list-row super-compact${selected ? ' selected' : ''}" type="button" data-craft-select="${escapeHtml(item.recipeId)}" aria-pressed="${selected}">
            <span class="crafting-row-name">${escapeHtml(item.name)}</span>
            <span class="crafting-row-domain">${escapeHtml(item.domainName)}</span>
            <span class="crafting-row-owned">${formatDisplayNumber(item.availability.owned)} owned</span>
            ${statusBadge(item)}
        </button>`;
    }
    return `<button class="crafting-list-row${selected ? ' selected' : ''}" type="button" data-craft-select="${escapeHtml(item.recipeId)}" aria-pressed="${selected}">
        <span class="crafting-row-icon">${iconHtml(item.icon)}</span>
        <span class="crafting-row-main"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.domainName)} · ${escapeHtml(item.effortBand)} · ${escapeHtml(humanize(item.recipe.form))}</span></span>
        <span class="crafting-row-owned">${formatDisplayNumber(item.availability.owned)} owned</span>
        ${statusBadge(item)}
    </button>`;
};

const virtualListHtml = (items, view) => {
    const rowHeight = VIEW_ROW_HEIGHT[view];
    return `<div class="crafting-virtual-list ${view}" data-crafting-virtual="${view}" data-row-height="${rowHeight}" tabindex="0" aria-label="Crafting recipes">
        <div class="crafting-virtual-spacer" style="height:${items.length * rowHeight}px">
            <div class="crafting-virtual-window"></div>
        </div>
    </div>`;
};

const costLineHtml = (input, multiplier = 1) => {
    const required = input.quantity * multiplier;
    const owned = inventoryQuantity(input.itemId, input.definition);
    const locked = (getState()?.lockedItems || []).includes(input.itemId);
    const enough = !locked && owned >= required;
    const intermediate = craftables.find(candidate => candidate.id === input.itemId);
    const canOfferIntermediate = selectedMode === 'direct' && !enough && !locked && intermediate;
    return `<li class="crafting-cost-line ${enough ? 'enough' : 'short'}">
        <span>${escapeHtml(input.definition.name)}</span>
        <span><strong>${formatDisplayNumber(required)}</strong> / ${formatDisplayNumber(owned)}${locked ? ' · Locked' : ''}</span>
        ${canOfferIntermediate ? `<button class="crafting-inline-intermediate" type="button" data-craft-intermediate="${escapeHtml(input.itemId)}" title="Craft the missing ${escapeHtml(input.definition.name)} directly from currently owned raw inputs"><iconify-icon icon="lucide:hammer" aria-hidden="true"></iconify-icon> Craft missing</button>` : ''}
    </li>`;
};

const resultList = (title, rows, emptyText = 'None') => `<section class="crafting-result-group">
    <h5>${escapeHtml(title)}</h5>
    ${rows?.length ? `<ul>${rows.map(row => `<li><span>${escapeHtml(row.name || row.itemId)}</span><strong>${formatDisplayNumber(row.quantity)}</strong></li>`).join('')}</ul>` : `<p>${escapeHtml(emptyText)}</p>`}
</section>`;

const previewHtml = preview => {
    if (!preview) return '<div class="crafting-preview-placeholder"><iconify-icon icon="lucide:clipboard-list" aria-hidden="true"></iconify-icon><p>Preview to inspect the authoritative dependency plan, shortages, and resulting output.</p></div>';
    const stateClass = preview.craftable ? 'success' : 'blocked';
    return `<div class="crafting-preview-result ${stateClass}">
        <div class="crafting-preview-outcome">
            <strong>${preview.craftable ? 'Plan ready' : 'Inputs missing'}</strong>
            <span>${formatDisplayNumber(preview.output.quantity)} × ${escapeHtml(preview.output.name)} · ${escapeHtml(humanize(preview.mode))}</span>
        </div>
        <div class="crafting-result-grid">
            ${resultList('Atomic raw cost', preview.aggregateRawCosts)}
            ${resultList('Crafting steps', (preview.steps || []).map(step => ({ name: `${step.name} (${formatDisplayNumber(step.craftCount)} run${step.craftCount === 1 ? '' : 's'})`, quantity: step.outputQuantity })))}
            ${resultList('Shortages', preview.shortages, 'No shortages')}
            ${resultList('Surplus intermediates', preview.surplus, 'No surplus')}
        </div>
    </div>`;
};

const selectionPromptHtml = (compact = false) => `<section class="crafting-details-empty${compact ? ' crafting-selection-banner' : ''}" aria-label="Recipe selection guidance">
    <iconify-icon icon="lucide:mouse-pointer-click" aria-hidden="true"></iconify-icon>
    <div class="crafting-selection-copy">
        <h3>${escapeHtml(sessionSelectionPrompt.title)}</h3>
        <p>${escapeHtml(sessionSelectionPrompt.description)}</p>
    </div>
</section>`;

const detailsHtml = (item, instance = 'inline') => {
    if (!item) return selectionPromptHtml();
    const quantityMultiplier = selectedQuantity === 'max' ? 1 : selectedQuantity;
    const safeInstance = String(instance).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const billHeadingId = `crafting-bill-heading-${safeInstance}`;
    const quantityInputId = `crafting-quantity-input-${safeInstance}`;
    const modeName = `crafting-mode-${safeInstance}`;
    const maxCount = lastMaxSummary?.recipeId === item.recipeId && lastMaxSummary.mode === selectedMode ? lastMaxSummary.resolvedCraftCount : null;
    const blockers = maxCount === 0 ? (lastMaxSummary?.blockers || []) : [];
    const whereUsed = lastWhereUsed?.itemId === item.id ? lastWhereUsed : null;
    return `<article class="crafting-details-card" data-recipe-id="${escapeHtml(item.recipeId)}">
        <header class="crafting-details-header">
            ${recipeHistory.length ? '<button class="crafting-back-btn" type="button" data-crafting-back aria-label="Back to previous recipe"><iconify-icon icon="lucide:arrow-left" aria-hidden="true"></iconify-icon></button>' : ''}
            <span class="crafting-details-icon">${iconHtml(item.icon)}</span>
            <div><p class="crafting-eyebrow">${escapeHtml(item.domainName)} · ${escapeHtml(item.effortBand)}</p><h3>${escapeHtml(item.name)}</h3></div>
            ${statusBadge(item)}
        </header>
        <p class="crafting-description">${escapeHtml(item.description)}</p>
        <dl class="crafting-spec-grid">
            <div><dt>Classification</dt><dd>${escapeHtml(humanize(item.classification))}</dd></div>
            <div><dt>Recipe form</dt><dd>${escapeHtml(humanize(item.recipe.form))}</dd></div>
            <div><dt>Output</dt><dd>${formatDisplayNumber(item.recipe.output.quantity)} ${escapeHtml(item.unit.singular)}</dd></div>
            <div><dt>Owned</dt><dd>${formatDisplayNumber(item.availability.owned)}</dd></div>
        </dl>
        <section class="crafting-bill" aria-labelledby="${billHeadingId}"><h4 id="${billHeadingId}">Bill of materials</h4><ul>${item.ingredientDefinitions.map(input => costLineHtml(input, quantityMultiplier)).join('')}</ul></section>
        <div class="crafting-operation-controls">
            <fieldset class="crafting-mode-fieldset"><legend>Crafting mode</legend>
                <label><input type="radio" name="${modeName}" data-crafting-mode value="direct" ${selectedMode === 'direct' ? 'checked' : ''}> Direct</label>
                <label><input type="radio" name="${modeName}" data-crafting-mode value="recursive" ${selectedMode === 'recursive' ? 'checked' : ''}> Recursive</label>
            </fieldset>
            <div class="crafting-quantity-group"><label for="${quantityInputId}">Craft runs</label>
                <div class="quantity-preset-row">${quantityPresetButtonsHtml({ systemId: 'crafting', subjectId: item.id, activeValue: selectedQuantity })}</div>
                <input id="${quantityInputId}" name="${quantityInputId}" class="form-input crafting-quantity-input" type="number" inputmode="numeric" autocomplete="off" min="1" max="9007199254740991" step="1" value="${selectedQuantity === 'max' ? '' : selectedQuantity}" placeholder="${selectedQuantity === 'max' ? 'Maximum' : 'Custom quantity'}" data-crafting-quantity="${escapeHtml(selectedQuantity)}">
            </div>
            <div class="crafting-operation-actions">
                <button class="action-btn secondary-btn" type="button" data-crafting-preview><iconify-icon icon="lucide:clipboard-check" aria-hidden="true"></iconify-icon> Preview</button>
                <button class="action-btn primary-btn" type="button" data-crafting-execute><iconify-icon icon="lucide:hammer" aria-hidden="true"></iconify-icon> Craft</button>
                <button class="action-btn accent-btn" type="button" data-crafting-max ${maxCount === null || maxCount < 1 ? 'disabled' : ''}><iconify-icon icon="lucide:gauge" aria-hidden="true"></iconify-icon> ${maxCount === null ? 'Calculating Max…' : `Craft Max (${formatDisplayNumber(maxCount)})`}</button>
            </div>
        </div>
        ${blockers.length ? `<div class="crafting-max-blockers"><strong>Max blocked by:</strong> ${blockers.map(blocker => `${escapeHtml(blocker.name || blocker.itemId)} ${formatDisplayNumber(blocker.owned || 0)}/${formatDisplayNumber(blocker.required || blocker.quantity || 0)}${blocker.locked ? ' (locked)' : ''}`).join(' · ')}</div>` : ''}
        <section class="crafting-where-used"><h4>Where Is This Used?</h4>${whereUsed ? (whereUsed.direct.length ? `<div class="where-used-direct">${whereUsed.direct.map(recipe => `<button type="button" class="where-used-chip" data-craft-navigate="${escapeHtml(recipe.recipeId)}">${escapeHtml(recipe.outputName)}</button>`).join('')}</div>${whereUsed.paths.length ? `<details><summary>Show ${whereUsed.paths.length} downstream path${whereUsed.paths.length === 1 ? '' : 's'}</summary><ul>${whereUsed.paths.slice(0, 40).map(path => `<li>${path.map(node => escapeHtml(node.outputName)).join(' → ')}</li>`).join('')}</ul></details>` : ''}` : '<p class="text-subtle">No downstream recipes use this output.</p>') : '<p class="text-subtle">Loading downstream recipes…</p>'}</section>
        <div class="crafting-preview" aria-live="polite">${previewHtml(lastPreview)}</div>
    </article>`;
};

const selectedItem = items => items.find(item => item.recipeId === selectedRecipeId)
    || craftables.map(item => ({ ...item, availability: recipeAvailability(item) })).find(item => item.recipeId === selectedRecipeId)
    || null;

const renderVirtualWindow = (viewport, items, view) => {
    const rowHeight = VIEW_ROW_HEIGHT[view];
    const start = Math.max(0, Math.floor(viewport.scrollTop / rowHeight) - VIEW_BUFFER);
    const visibleCount = Math.ceil((viewport.clientHeight || 600) / rowHeight) + VIEW_BUFFER * 2;
    const end = Math.min(items.length, start + visibleCount);
    const windowElement = viewport.querySelector('.crafting-virtual-window');
    if (!windowElement) return;
    windowElement.style.transform = `translateY(${start * rowHeight}px)`;
    windowElement.innerHTML = items.slice(start, end).map(item => recipeRowHtml(item, view)).join('');
};

const renderWorkspace = () => {
    const workspace = document.getElementById('crafting-workspace');
    if (!workspace || !catalog) return;
    const settings = getStoredSettings().crafting;
    const items = filteredCraftables();
    const current = selectedItem(items);
    const compactSelectionPrompt = selectedRecipeId ? '' : selectionPromptHtml(true);

    document.querySelectorAll('[data-crafting-view]').forEach(button => {
        const active = button.dataset.craftingView === settings.view;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('crafting-visible-count').textContent = formatDisplayNumber(items.length);
    document.getElementById('crafting-ready-count').textContent = formatDisplayNumber(items.filter(item => item.availability.craftable).length);
    document.getElementById('crafting-catalog-count').textContent = formatDisplayNumber(craftables.length);
    document.getElementById('crafting-material-count').textContent = formatDisplayNumber(catalog.materials.length);

    if (!items.length) {
        workspace.innerHTML = '<div class="empty-state-card"><iconify-icon icon="lucide:search-x" class="empty-icon" aria-hidden="true"></iconify-icon><h3 class="empty-title">No matching recipes</h3><p class="empty-desc">Clear or broaden the crafting filters to see more results.</p></div>';
    } else if (settings.view === 'compact') {
        workspace.innerHTML = `<div class="crafting-workspace-stack">${compactSelectionPrompt}<div class="crafting-compact-grid">${items.map(item => `<article class="crafting-compact-card${item.recipeId === selectedRecipeId ? ' expanded' : ''}">
            <button type="button" class="crafting-compact-summary" data-craft-select="${escapeHtml(item.recipeId)}" aria-expanded="${item.recipeId === selectedRecipeId}">
                <span class="crafting-row-icon">${iconHtml(item.icon)}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.domainName)} · ${escapeHtml(item.effortBand)}</small></span>${statusBadge(item)}
            </button>${item.recipeId === selectedRecipeId ? `<div class="crafting-compact-details">${detailsHtml(item, 'compact')}</div>` : ''}
        </article>`).join('')}</div></div>`;
    } else if (settings.view === 'super-compact') {
        workspace.innerHTML = `<div class="crafting-workspace-stack">${compactSelectionPrompt}${virtualListHtml(items, 'super-compact')}</div>`;
    } else {
        workspace.innerHTML = `${selectedRecipeId ? '' : `<div class="crafting-selection-narrow">${selectionPromptHtml(true)}</div>`}<div class="crafting-standard-layout"><div class="crafting-master-pane">${virtualListHtml(items, 'standard')}</div><div class="crafting-detail-pane" aria-label="Recipe details">${detailsHtml(current, 'inline')}</div></div>`;
    }

    workspace.setAttribute('aria-busy', 'false');
    const viewport = workspace.querySelector('[data-crafting-virtual]');
    if (viewport) {
        renderVirtualWindow(viewport, items, settings.view);
        viewport.addEventListener('scroll', () => renderVirtualWindow(viewport, items, settings.view), { passive: true });
    }
    const status = document.getElementById('crafting-status');
    if (status) {
        status.textContent = `${items.length} of ${craftables.length} recipes shown. ${items.filter(item => item.availability.craftable).length} can be crafted directly now.`;
        status.classList.remove('error');
    }
};

const showResponsiveDetails = item => {
    const body = document.getElementById('crafting-details-dialog-body');
    const title = document.getElementById('crafting-details-dialog-title');
    const dialog = document.getElementById('crafting-details-dialog');
    if (!body || !dialog) return;
    if (title) title.textContent = item.name;
    body.innerHTML = detailsHtml(item, 'dialog');
    openDialog(dialog, { initialFocus: '[data-crafting-preview]', closeOnBackdrop: true });
};

const rerenderDetails = () => {
    const item = craftables.map(candidate => ({ ...candidate, availability: recipeAvailability(candidate) })).find(candidate => candidate.recipeId === selectedRecipeId);
    const dialog = document.getElementById('crafting-details-dialog');
    if (dialog?.open) showResponsiveDetails(item);
    else renderWorkspace();
};

const loadRecipeInsights = async (recipeId, mode) => {
    const requestId = ++insightRequestId;
    const item = craftables.find(candidate => candidate.recipeId === recipeId);
    lastMaxSummary = null;
    lastWhereUsed = null;
    rerenderDetails();
    try {
        const [maximum, whereUsed] = await Promise.all([
            doGetCraftingMax(recipeId, mode),
            doGetWhereUsed(item.id)
        ]);
        if (requestId !== insightRequestId || selectedRecipeId !== recipeId || selectedMode !== mode) return;
        lastMaxSummary = maximum;
        lastWhereUsed = whereUsed;
        rerenderDetails();
    } catch (error) {
        if (requestId === insightRequestId) showToast(error.message || 'Could not load recipe insights', 'error');
    }
};

const handleSelection = (recipeId, { recordHistory = true } = {}) => {
    if (operationPending) return;
    if (recordHistory && selectedRecipeId && selectedRecipeId !== recipeId) recipeHistory.push(selectedRecipeId);
    selectedRecipeId = recipeId;
    selectedMode = 'direct';
    selectedQuantity = 1;
    lastPreview = null;
    const settings = getStoredSettings().crafting;
    const item = craftables.map(candidate => ({ ...candidate, availability: recipeAvailability(candidate) })).find(candidate => candidate.recipeId === recipeId);
    const narrow = typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches;
    if (settings.view === 'super-compact' || (settings.view === 'standard' && narrow)) showResponsiveDetails(item);
    else renderWorkspace();
    void loadRecipeInsights(recipeId, selectedMode);
};

export const openCraftingRecipe = async recipeId => {
    await ensureCatalog();
    if (!craftables.some(item => item.recipeId === recipeId)) {
        showToast('That crafting recipe is no longer available.', 'error');
        return false;
    }
    handleSelection(recipeId);
    return true;
};

const readQuantity = container => {
    const input = container.querySelector('[data-crafting-quantity]');
    if (!input) return selectedQuantity;
    if (input.dataset.craftingQuantity === 'max') return 'max';
    const quantity = Number(input.value);
    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
};

const setOperationBusy = busy => {
    operationPending = busy;
    document.querySelectorAll('#panel-crafting [data-crafting-preview], #panel-crafting [data-crafting-execute]').forEach(button => {
        button.disabled = busy;
    });
    document.querySelectorAll('#panel-crafting .crafting-details-card').forEach(details => {
        details.setAttribute('aria-busy', String(busy));
    });
};

const performPreview = async container => {
    if (operationPending) return null;
    const quantity = readQuantity(container);
    if (quantity === null) {
        showToast('Enter a positive whole-number craft quantity.', 'error');
        return null;
    }
    const recipeId = selectedRecipeId;
    const mode = selectedMode;
    setOperationBusy(true);
    try {
        const preview = await doPreviewCrafting(recipeId, quantity, mode);
        if (selectedRecipeId !== recipeId || selectedMode !== mode) return null;
        lastPreview = preview;
        selectedQuantity = quantity;
        rerenderDetails();
        return lastPreview;
    } catch (error) {
        return null;
    } finally {
        setOperationBusy(false);
    }
};

const performExecute = async container => {
    if (operationPending) return;
    const quantity = readQuantity(container);
    if (quantity === null) {
        showToast('Enter a positive whole-number craft quantity.', 'error');
        return;
    }
    const recipeId = selectedRecipeId;
    const mode = selectedMode;
    const item = craftables.find(candidate => candidate.recipeId === recipeId);
    setOperationBusy(true);
    try {
        let preview = lastPreview;
        if (!preview || preview.recipeId !== recipeId || preview.mode !== mode || preview.requestedCraftCount !== quantity) {
            preview = await doPreviewCrafting(recipeId, quantity, mode);
            if (selectedRecipeId !== recipeId || selectedMode !== mode) return;
            lastPreview = preview;
            selectedQuantity = quantity;
            rerenderDetails();
            setOperationBusy(true);
        }
        if (!preview || !preview.craftable) {
            if (preview) showToast('This plan is missing one or more required inputs.', 'error');
            return;
        }

        const confirm = shouldConfirmQuantityOperation({
            settings: getStoredSettings(), systemId: 'crafting', subjectId: item.id,
            quantity, recursive: mode === 'recursive'
        });
        if (confirm) {
            const approved = await showConfirmation(
                `craft-${item.id}`,
                `Craft ${item.name}?`,
                `Produce ${formatDisplayNumber(preview.output.quantity)} ${item.name} using the ${mode} plan with ${preview.steps.length} crafting step${preview.steps.length === 1 ? '' : 's'}?`,
                { allowIgnore: false }
            );
            if (!approved) return;
        }

        const execution = await doExecuteCrafting(recipeId, quantity, mode);
        const result = execution.result;
        showToast(`Crafted ${formatDisplayNumber(result.output.quantity)} ${result.output.name}.`, 'success');
        addLogEntry(`Crafted ${formatDisplayNumber(result.output.quantity)} ${result.output.name} using ${mode} mode.`, 'system');
        lastPreview = null;
        renderWorkspace();
    } catch (error) {
        return;
    } finally {
        setOperationBusy(false);
    }
};

const handleDetailEvent = event => {
    const container = event.target.closest('.crafting-details-card');
    if (!container) return false;
    if (operationPending) return true;
    const preset = event.target.closest('[data-quantity-preset]');
    if (preset) {
        selectedQuantity = preset.dataset.quantityPreset === 'max' ? 'max' : Number(preset.dataset.quantityPreset);
        lastPreview = null;
        rerenderDetails();
        return true;
    }
    if (event.target.matches('[data-crafting-mode]')) {
        selectedMode = event.target.value;
        lastPreview = null;
        rerenderDetails();
        void loadRecipeInsights(selectedRecipeId, selectedMode);
        return true;
    }
    if (event.target.closest('[data-crafting-max]')) {
        const input = container.querySelector('[data-crafting-quantity]');
        selectedQuantity = 'max';
        if (input) input.dataset.craftingQuantity = 'max';
        performExecute(container);
        return true;
    }
    const navigate = event.target.closest('[data-craft-navigate]');
    if (navigate) {
        handleSelection(navigate.dataset.craftNavigate);
        return true;
    }
    if (event.target.closest('[data-crafting-back]')) {
        const prior = recipeHistory.pop();
        if (prior) handleSelection(prior, { recordHistory: false });
        return true;
    }
    const intermediate = event.target.closest('[data-craft-intermediate]');
    if (intermediate) {
        const parentCraftCount = selectedQuantity === 'max' ? (lastMaxSummary?.resolvedCraftCount || 1) : Number(selectedQuantity) || 1;
        const inputItemId = intermediate.dataset.craftIntermediate;
        void (async () => {
            try {
                const plan = await doPreviewIntermediate(selectedRecipeId, parentCraftCount, inputItemId);
                if (!plan.craftRuns) {
                    showToast('The intermediate is already available in the required quantity.', 'info');
                    return;
                }
                if (!plan.canCraftImmediately) {
                    showToast(`Cannot craft the missing intermediate directly; ${formatDisplayNumber(plan.shortage)} remain unavailable.`, 'error');
                    return;
                }
                await doCraftIntermediate(selectedRecipeId, parentCraftCount, inputItemId);
                showToast(`Crafted ${formatDisplayNumber(plan.producedQuantity)} ${plan.preview?.output?.name || inputItemId}; ${formatDisplayNumber(plan.surplus)} surplus retained.`, 'success');
                lastPreview = null;
                renderWorkspace();
                void loadRecipeInsights(selectedRecipeId, selectedMode);
            } catch (error) { showToast(error.message || 'Could not craft the intermediate', 'error'); }
        })();
        return true;
    }
    if (event.target.closest('[data-crafting-preview]')) {
        performPreview(container);
        return true;
    }
    if (event.target.closest('[data-crafting-execute]')) {
        performExecute(container);
        return true;
    }
    return false;
};

const bindControls = () => {
    if (controlsBound) return;
    controlsBound = true;
    const search = document.getElementById('crafting-search');
    search?.addEventListener('input', () => {
        settingsPatch({ search: search.value });
        renderWorkspace();
    });
    const controls = {
        'crafting-domain': 'domain', 'crafting-effort': 'effort', 'crafting-classification': 'classification',
        'crafting-form': 'recipeForm', 'crafting-availability': 'availability', 'crafting-sort': 'sort'
    };
    for (const [id, key] of Object.entries(controls)) {
        document.getElementById(id)?.addEventListener('change', event => {
            settingsPatch({ [key]: event.target.value });
            renderWorkspace();
        });
    }
    document.querySelectorAll('[data-crafting-view]').forEach(button => button.addEventListener('click', () => {
        settingsPatch({ view: button.dataset.craftingView });
        lastPreview = null;
        renderWorkspace();
    }));
    const workspace = document.getElementById('crafting-workspace');
    workspace?.addEventListener('click', event => {
        if (handleDetailEvent(event)) return;
        const selector = event.target.closest('[data-craft-select]');
        if (selector) handleSelection(selector.dataset.craftSelect);
    });
    workspace?.addEventListener('input', event => {
        if (!event.target.matches('[data-crafting-quantity]')) return;
        event.target.dataset.craftingQuantity = event.target.value;
        const quantity = Number(event.target.value);
        if (Number.isSafeInteger(quantity) && quantity > 0) selectedQuantity = quantity;
        lastPreview = null;
    });
    const dialogBody = document.getElementById('crafting-details-dialog-body');
    dialogBody?.addEventListener('click', event => handleDetailEvent(event));
    dialogBody?.addEventListener('input', event => {
        if (!event.target.matches('[data-crafting-quantity]')) return;
        event.target.dataset.craftingQuantity = event.target.value;
        const quantity = Number(event.target.value);
        if (Number.isSafeInteger(quantity) && quantity > 0) selectedQuantity = quantity;
        lastPreview = null;
    });
};

export const renderCrafting = async () => {
    const workspace = document.getElementById('crafting-workspace');
    if (!workspace) return;
    workspace.setAttribute('aria-busy', 'true');
    try {
        await ensureCatalog();
        populateControls();
        bindControls();
        renderWorkspace();
    } catch (error) {
        const status = document.getElementById('crafting-status');
        if (status) {
            status.textContent = `Crafting catalog unavailable: ${error.message || 'Unknown error'}`;
            status.classList.add('error');
        }
        workspace.innerHTML = '<div class="empty-state-card"><iconify-icon icon="lucide:triangle-alert" class="empty-icon" aria-hidden="true"></iconify-icon><h3 class="empty-title">Catalog unavailable</h3><p class="empty-desc">Restart the game server, then open Crafting again.</p></div>';
        workspace.setAttribute('aria-busy', 'false');
    }
};
